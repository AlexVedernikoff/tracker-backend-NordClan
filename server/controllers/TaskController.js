const createError = require('http-errors');
const _ = require('underscore');
const models = require('../models');
const Task = require('../models').Task;
const Tag = require('../models').Tag;
const ItemTag = require('../models').ItemTag;
const queries = require('../models/queries');
const moment = require('moment');
const TimesheetDraftController = require('./TimesheetDraftController');
const TimesheetController = require('./TimesheetController');


exports.create = function (req, res, next) {
  if (req.body.tags) {
    req.body.tags.split(',').map(el => el.trim()).forEach(el => {
      if (el.length < 2) throw createError(400, 'tag must be more then 2 chars');
    });
  }

  Task.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  Task.create(req.body)
    .then((model) => {
      return queries.tag.saveTagsForModel(model, req.body.tags, 'task')
        .then(() => res.json({ id: model.id }));
    })
    .catch((err) => {
      next(err);
    });

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
          ['name', 'ASC'],
        ],
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
        attributes: ['id', 'firstNameRu', 'lastNameRu', 'skype', 'emailPrimary', 'phone', 'mobile', 'photo'],
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
      if (!model) return next(createError(404));
      if (model.tags) model.tags = Object.keys(model.tags).map((k) => model.tags[k].name); // Преобразую теги в массив

      res.json(model);
    })
    .catch((err) => {
      next(err);
    });

};


exports.update = async function (req, res, next) {
  'use strict';
  let t;

  try {
    req.checkParams('id', 'id must be int').isInt();
    const validationResult = await req.getValidationResult();
    if (!validationResult.isEmpty()) throw createError(400, validationResult);


    const attributes = ['id', 'statusId', 'performerId'].concat(Object.keys(req.body));
    const now = moment().format('YYYY-MM-DD');
    const resultResponse = {};
    const taskId = req.params.id;
    let { body } = req;
    t = await models.sequelize.transaction();
    let timesheet = [];
    let draftsheet = [];


    let task = await Task.findByPrimary(taskId, { attributes: attributes, transaction: t, lock: 'UPDATE' });
    if (!task) {
      t.rollback();
      return next(createError(404))
    };


    if (+task.statusId === models.TaskStatusesDictionary.CLOSED_STATUS) { // Изменяю только статус если его передали закрытой задаче
      if (!body.statusId) {
        t.rollback();
        return next(createError(400, 'Task is closed'));
      }
      body = { statusId: body.statusId };
    }

    // Удаление исполнителя
    if (+body.userId === 0) {
      resultResponse.performerId = null;
      body.performerId = null;
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
    task = await task.updateAttributes(body, { transaction: t });


    // Если хотели изменить спринт, присылаю его обратно
    if (+body.sprintId > 0) {
      let task = await Task.findByPrimary(req.params.id, {
        attributes: ['id'],
        transaction: t,
        include: [
          {
            as: 'sprint',
            model: models.Sprint,
            attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
          }
        ]
      });
      if (task.sprint) resultResponse.sprint = task.sprint;
    }


    // Вариант если мы передали статус задачи, то ищем если созданные драфты
    if (body.statusId) {
      // Не нравится мне этот кусок кода
      req.query.taskStatusId = req.body.statusId;
      req.query.userId = task.dataValues.performerId;
      req.query.taskId = task.dataValues.id;
      req.query.onDate = now;

      await Promise.all([
        TimesheetDraftController.getDrafts(req, res, next)
          .then((result) => { draftsheet = result; }),
        TimesheetController.getTimesheets(req, res, next)
          .then((result) => { timesheet = result; })
      ]);
    }

    if (isNeedCreateDraft({ body, task, timesheet, draftsheet })) {
      const taskWithUser = await queries.task.findTaskWithUser(req.params.id, t);
      const projectUserRoles = await queries.projectUsers.getUserRolesByProject(taskWithUser.projectId, taskWithUser.performerId, t);


      const timesheet = {
        sprintId: task.dataValues.sprintId,
        taskId: task.dataValues.id,
        userId: task.dataValues.performerId,
        onDate: now,
        typeId: 1,
        spentTime: 0,
        comment: '',
        isBillible: projectUserRoles ? Boolean(projectUserRoles.indexOf(models.ProjectRolesDictionary.UNBILLABLE_ID) === -1) : true,
        userRoleId: projectUserRoles.join(','),
        taskStatusId: task.dataValues.statusId,
        statusId: 1,
        isVisible: true
      };

      const reqForDraft = {
        ...req,
        body: {
          ...req.body,
          ...timesheet
        }
      };

      await TimesheetDraftController.createDraft(reqForDraft, res, next, t, true);
      t.commit();

      res.json({ statusId: body.statusId ? +body.statusId : task.statusId });

    } else {
      t.commit();

      // Получаю измененные поля
      _.keys(task.dataValues).forEach((key) => {
        if (body[key])
          resultResponse[key] = task.dataValues[key];
      });

      resultResponse.id = task.id;
      res.json(resultResponse);
    }


  } catch (e) {
    if (t) await t.rollback();
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

  let where = {
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

  if (!req.query.statusId) {
    where.statusId = {
      $notIn: [9, 10], // По умолчанию показываю все не отмененные и ине закрытые (см. словарь статусов TaskStatusesDictionary)
    };
  }

  if (req.query.tags) {
    req.query.tags = req.query.tags.split(',').map((el) => el.toString().trim().toLowerCase());
  }

  if (req.query.projectId) {
    where.projectId = {
      in: req.query.projectId.toString().split(',').map((el) => el.trim())
    };
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
    attributes: models.User.defaultSelect,
  };

  const includeSprint = {
    as: 'sprint',
    model: models.Sprint,
    attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime'],
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
      ['name', 'ASC'],
    ],
  };

  const includeTagConst = {
    model: Tag,
    as: 'tagForQuery',
    required: true,
    attributes: [],
    where: {
      name: {
        $or: req.query.tags,
      },
    },
    through: {
      model: ItemTag,
      attributes: []
    }
  };

  const includeProject = {
    as: 'project',
    model: models.Project,
    attributes: ['prefix'],
  };


  let includeForSelect = [];
  includeForSelect.push(includeAuthor);
  includeForSelect.push(includePerformer);
  includeForSelect.push(includeSprint);
  includeForSelect.push(includeTagSelect);
  if (prefixNeed) includeForSelect.push(includeProject);

  let includeForCount = [];
  if (req.query.tags) includeForCount.push(includeTagConst);
  if (req.query.performerId) includeForCount.push(includePerformer);


  Promise.resolve()
    // Фильтрация по тегам ищем id тегов
    .then(() => {
      if (req.query.tags)
        return Tag
          .findAll({
            where: {
              name: {
                $in: req.query.tags
              }
            }
          });

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
            tag_id: tag.id,
          },
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

              count = count.length;

              if (prefixNeed) {
                tasks.forEach((task) => {
                  task.dataValues.prefix = task.project.prefix;
                  delete task.dataValues.project;
                });
              }

              const responseObject = {
                currentPage: +req.query.currentPage,
                pagesCount: (req.query.pageSize) ? Math.ceil(count / req.query.pageSize) : 1,
                pageSize: (req.query.pageSize) ? req.query.pageSize : count,
                rowsCountAll: count,
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

function isNeedCreateDraft (options) {
  const { body, task, draftsheet, timesheet} = options;

  return !!((draftsheet.length === 0 && timesheet.length === 0)
    && body.statusId
    && (task.performerId || body.performerId)
    && ~models.TaskStatusesDictionary.CAN_CREATE_DRAFTSHEET_STATUSES.indexOf(parseInt(body.statusId)));
}