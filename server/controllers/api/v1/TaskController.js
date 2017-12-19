const createError = require('http-errors');
const _ = require('underscore');
const models = require('../../../models');
const { Task, Tag, ItemTag } = models;
const queries = require('../../../models/queries');
const moment = require('moment');
const TimesheetService = require('../../../services/timesheets');
const TasksChannel = require('../../../channels/Tasks');
const TimesheetsChannel = require('../../../channels/Timesheets');
const userSubscriptionEvents = require('../services/userSubscriptionEvents');

exports.create = async function (req, res, next) {
  req.checkBody('projectId', 'projectId must be int').isInt();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) return next(createError(400, validationResult));

  if (!req.user.canReadProject(req.body.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  if (req.body.tags) {
    req.body.tags.split(',').map(el => el.trim()).forEach(el => {
      if (el.length < 2) return next(createError(400, 'tag must be more then 2 chars'));
    });
  }

  Task.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  try {
    const createdTaskModel = await Task.create(req.body);
    await queries.tag.saveTagsForModel(createdTaskModel, req.body.tags, 'task');
    TasksChannel.sendAction('create', createdTaskModel, res.io);
    await userSubscriptionEvents(models.ProjectEventsDictionary.values[0].id, { taskId: createdTaskModel.id });
    res.json(createdTaskModel);
  } catch (err){
    next(err);
  }
};

exports.read = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Task.findByPrimary(req.params.id, {
    include: [
      {
        as: 'tags',
        model: Tag,
        attributes: ['name'],
        through: {
          model: ItemTag,
          attributes: []
        },
        order: [
          ['name', 'ASC']
        ]
      },
      {
        as: 'project',
        model: models.Project,
        attributes: ['id', 'name', 'prefix']
      },
      {
        as: 'parentTask',
        model: models.Task,
        attributes: ['id', 'name']
      },
      {
        as: 'author',
        model: models.User,
        attributes: models.User.defaultSelect
      },
      {
        as: 'subTasks',
        model: models.Task,
        attributes: ['id', 'name']
      },
      {
        as: 'linkedTasks',
        model: models.Task,
        through: {
          model: models.TaskTasks,
          attributes: []
        },
        attributes: ['id', 'name']
      },
      {
        as: 'sprint',
        model: models.Sprint,
        attributes: ['id', 'name']
      },
      {
        as: 'performer',
        model: models.User,
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo']
      },
      {
        as: 'attachments',
        model: models.TaskAttachments,
        attributes: models.TaskAttachments.defaultSelect,
        order: [
          ['createdAt', 'ASC']
        ]
      }
    ]
  })
    .then((model) => {
      if (!model) {
        return next(createError(404));
      }
      if (!req.user.canReadProject(model.projectId)) {
        return next(createError(403, 'Access denied'));
      }
      if (model.tags) {// Преобразую теги в массив
        model.tags = Object.keys(model.tags).map((k) => model.tags[k].name);
      }

      res.json(model);
    })
    .catch((err) => {
      next(err);
    });

};

exports.update = async function (req, res, next) {
  let transaction;

  try {
    req.checkParams('id', 'id must be int').isInt();
    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) return next(createError(400, validationResult));

    const attributes = ['id', 'statusId', 'performerId', 'projectId'].concat(Object.keys(req.body));
    const resultResponse = {};
    const taskId = req.params.id;
    let { body } = req;
    transaction = await models.sequelize.transaction();
    const isStateChanged = (body.statusId);
    const isPerformerAssigned = (body.performerId);

    let task = await Task.findByPrimary(taskId, { attributes: attributes, transaction, lock: 'UPDATE' });
    if (!task) {
      transaction.rollback();
      return next(createError(404));
    }

    if (!req.user.canReadProject(task.projectId)) {
      transaction.rollback();
      return next(createError(403, 'Access denied'));
    }

    if (+task.statusId === models.TaskStatusesDictionary.CLOSED_STATUS) { // Изменяю только статус если его передали закрытой задаче
      if (!body.statusId) {
        transaction.rollback();
        return next(createError(400, 'Task is closed'));
      }
      body = { statusId: body.statusId };
    }

    // Удаление исполнителя
    if (+body.performerId === 0) {
      resultResponse.performerId = null;
      resultResponse.performer = null;
      body.performerId = null;
    }

    // Получение исполнителя
    if (+body.performerId > 0) {
      resultResponse.performer = await models.User.findByPrimary(body.performerId, { attributes: models.User.defaultSelect, transaction });
    }

    // сброс задаче в беклог
    if (+body.sprintId === 0) {
      resultResponse.sprint = {
        id: 0,
        name: 'Backlog'
      };
      body.sprintId = null;
    }

    // Обнуляю отца
    if (+body.parentId === 0) {
      resultResponse.parentTask = null;
      body.parentId = null;
    }

    // Обновление задачи
    task = await task.updateAttributes(body, { transaction });

    // Если хотели изменить спринт, присылаю его обратно
    if (+body.sprintId > 0) {
      const taskSprint = await Task.findByPrimary(req.params.id, {
        attributes: ['id'],
        transaction,
        include: [
          {
            as: 'sprint',
            model: models.Sprint,
            attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
          }
        ]
      });
      if (taskSprint.sprint) {
        resultResponse.sprint = taskSprint.sprint;
      }
    }

    const now = moment().format('YYYY-MM-DD');
    const needCreateDraft = await TimesheetService.isNeedCreateDraft({ req, task, now });

    if (needCreateDraft) {
      const taskWithUser = await queries.task.findTaskWithUser(taskId, transaction);
      const projectUserRoles = await queries.projectUsers.getUserRolesByProject(taskWithUser.projectId, taskWithUser.performerId, transaction);

      const draftParams = {
        taskId: task.id,
        userId: task.performerId,
        onDate: now,
        typeId: 1,
        taskStatusId: task.dataValues.statusId,
        isVisible: true
      };

      const draft = await TimesheetService.createDraft(draftParams, req.user.id, transaction);

      const updatedFields = {
        ...resultResponse,
        id: task.id,
        statusId: body.statusId || task.statusId
      };

      TimesheetsChannel.sendAction('create', draft, res.io, req.user.id);
      TasksChannel.sendAction('update', updatedFields, res.io, task.projectId);
      if (isPerformerAssigned) await userSubscriptionEvents(models.ProjectEventsDictionary.values[1].id, { taskId: task.id });
      if (isStateChanged) await userSubscriptionEvents(models.ProjectEventsDictionary.values[3].id, { taskId: task.id });

      res.json(updatedFields);
    } else {

      // Получаю измененные поля
      _.keys(task.dataValues).forEach((key) => {
        if (body[key]) {resultResponse[key] = task.dataValues[key];}
      });

      resultResponse.id = task.id;

      transaction.commit();
      TasksChannel.sendAction('update', resultResponse, res.io, task.projectId);
      if (isPerformerAssigned) await userSubscriptionEvents(models.ProjectEventsDictionary.values[1].id, { taskId: task.id });
      if (isStateChanged) await userSubscriptionEvents(models.ProjectEventsDictionary.values[3].id, { taskId: task.id });
      res.json(resultResponse);
    }
  } catch (e) {
    transaction.rollback();
    return next(createError(e));
  }
};

exports.delete = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Task.findByPrimary(req.params.id, { attributes: ['id'] })
    .then((row) => {
      if (!row) { return next(createError(404)); }

      row.destroy()
        .then(() => {
          res.end();
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.list = function (req, res, next) {
  if (req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if (req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  if (req.query.performerId && !req.query.performerId.toString().match(/^\d+$/)) return next(createError(400, 'performerId must be int'));

  let prefixNeed = false;

  if (req.query.fields) {
    req.query.fields = req.query.fields.split(',').map((el) => el.trim());
    if (req.query.fields.indexOf('prefix') !== -1) prefixNeed = true;
    if (prefixNeed) req.query.fields.splice(req.query.fields.indexOf('prefix'), 1);

    Task.checkAttributes(req.query.fields);
  }

  if (!req.query.pageSize && !req.query.projectId && !req.query.sprintId) {
    req.query.pageSize = 100;
  } else if (!req.query.pageSize && (req.query.projectId || req.query.sprintId)) {
    req.query.pageSize = null;
  }

  if (!req.query.currentPage) {
    req.query.currentPage = 1;
  }

  const where = {
    deletedAt: { $eq: null } // IS NULL
  };

  if (+req.query.performerId) {
    where.performerId = +req.query.performerId;
  }

  if (req.query.name) {
    where.name = {
      $iLike: '%' + req.query.name + '%'
    };
  }

  // Если +req.query.statusId === 0 или указан спринт вывожу все статусы, если указаны конкретные вывожу их.
  if (req.query.statusId && +req.query.statusId !== 0) {
    where.statusId = {
      in: req.query.statusId.toString().split(',').map((el) => el.trim())
    };
  }

  if (req.query.prioritiesId) {
    where.prioritiesId = {
      in: req.query.prioritiesId.toString().split(',').map((el) => el.trim())
    };
  }

  if (!req.query.statusId) {
    where.statusId = {
      $notIn: [9, 10] // По умолчанию показываю все не отмененные и ине закрытые (см. словарь статусов TaskStatusesDictionary)
    };
  }

  if (req.query.typeId) {
    where.typeId = {
      in: req.query.typeId.toString().split(',').map((el) => el.trim())
    };
  }

  if (req.query.tags) {
    req.query.tags = req.query.tags.split(',').map((el) => el.toString().trim().toLowerCase());
  }

  if (req.query.projectId) {
    where.projectId = {
      in: req.query.projectId.toString().split(',').map((el) => el.trim())
    };
  } else if (!req.user.isGlobalAdmin && !req.user.isVisor) {
    where.projectId = req.user.dataValues.projects;
  }

  if (req.query.sprintId) {
    if (+req.query.sprintId === 0) {
      where.sprintId = {
        $eq: null
      };
    } else {
      where.sprintId = {
        in: req.query.sprintId.toString().split(',').map((el) => el.trim())
      };
    }
  }

  const includeAuthor = {
    as: 'author',
    model: models.User,
    attributes: models.User.defaultSelect
  };

  const includePerformer = {
    as: 'performer',
    model: models.User,
    attributes: models.User.defaultSelect
  };

  const includeSprint = {
    as: 'sprint',
    model: models.Sprint,
    attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
  };

  const includeTagSelect = {
    as: 'tags',
    model: Tag,
    attributes: ['name'],
    through: {
      model: ItemTag,
      attributes: []
    },
    order: [
      ['name', 'ASC']
    ]
  };

  const includeTagConst = {
    model: Tag,
    as: 'tagForQuery',
    required: true,
    attributes: [],
    where: {
      name: {
        $or: req.query.tags
      }
    },
    through: {
      model: ItemTag,
      attributes: []
    }
  };

  const includeProject = {
    as: 'project',
    model: models.Project,
    attributes: ['prefix']
  };

  const includeForSelect = [];
  includeForSelect.push(includeAuthor);
  includeForSelect.push(includePerformer);
  includeForSelect.push(includeSprint);
  includeForSelect.push(includeTagSelect);
  if (prefixNeed) includeForSelect.push(includeProject);

  const includeForCount = [];
  if (req.query.tags) includeForCount.push(includeTagConst);
  if (req.query.performerId) includeForCount.push(includePerformer);

  Promise.resolve()
    // Фильтрация по тегам ищем id тегов
    .then(() => {
      if (req.query.tags) {
        return Tag
          .findAll({
            where: {
              name: {
                $in: req.query.tags
              }
            }
          });
      }

      return [];
    })
    // Включаем фильтрация по тегам в запрос
    .then((tags) => {
      tags.forEach(tag => {
        includeForSelect.push({
          association: Task.hasOne(models.ItemTag, {
            as: 'itemTag' + tag.id,
            foreignKey: {
              name: 'taggableId',
              field: 'taggable_id'
            },
            scope: {
              taggable: 'task'
            }
          }),
          attributes: [],
          required: true,
          where: {
            tag_id: tag.id
          }
        });
      });
    })
    .then(() => {
      return Task
        .findAll({
          attributes: req.query.fields ? _.union(['id', 'name', 'authorId', 'performerId', 'sprintId', 'statusId', 'prioritiesId', 'projectId'].concat(req.query.fields)) : '',
          limit: req.query.pageSize,
          offset: req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
          include: includeForSelect,
          where: where,
          subQuery: true,
          order: models.sequelize.literal('CASE WHEN "sprint"."fact_start_date" <= now() AND "sprint"."fact_finish_date" >= now() THEN 1 ELSE 2 END'
            + ', "sprint"."fact_start_date" ASC'
            + ', "Task"."statusId" ASC'
            + ', "Task"."prioritiesId" ASC'
            + ', "Task"."name" ASC')
        })
        .then(tasks => {

          return Task
            .count({
              where: where,
              include: includeForCount,
              group: ['Task.id']
            })
            .then((count) => {
              const projectCount = count.length;

              if (prefixNeed) {
                tasks.forEach((task) => {
                  task.dataValues.prefix = task.project.prefix;
                  delete task.dataValues.project;
                });
              }

              const responseObject = {
                currentPage: +req.query.currentPage,
                pagesCount: (req.query.pageSize) ? Math.ceil(projectCount / req.query.pageSize) : 1,
                pageSize: (req.query.pageSize) ? req.query.pageSize : projectCount,
                rowsCountAll: projectCount,
                rowsCountOnCurrentPage: tasks.length,
                data: tasks
              };
              res.json(responseObject);
            });
        });
    })
    .catch((err) => {
      next(err);
    });
};
