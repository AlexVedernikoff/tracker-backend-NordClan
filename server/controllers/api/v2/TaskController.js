const createError = require('http-errors');
const _ = require('underscore');
const models = require('../../../models');
const { Task, Tag, ItemTag } = models;
const queries = require('../../../models/queries');
const TasksChannel = require('../../../channels/Tasks');
const PlayerChannel = require('../../../channels/Player');
const TimesheetsChannel = require('../../../channels/Timesheets');
const TasksService = require('../../../services/tasks');

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

  Task.create(req.body)
    .then((model) => {
      return queries.tag.saveTagsForModel(model, req.body.tags, 'task')
        .then(() => {
          TasksChannel.sendAction('create', model, res.io, model.projectId);
          res.json(model);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.read = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) {
    return next(createError(400, 'id must be int'));
  }

  TasksService
    .read(req.params.id, req.user)
    .then(task => res.json(task))
    .catch((err) => next(createError(err)));
};

exports.update = async function (req, res, next) {
  req.checkParams('id', 'id must be int').isInt();
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) return next(createError(400, validationResult));

  const taskId = req.params.id;

  TasksService
    .update(req.body, taskId, req.user, req.isSystemUser)
    .then(({ updatedTasks, activeTask, createdDraft, projectId }) => {
      sendUpdates(res.io, req.user.id, updatedTasks, activeTask, createdDraft, projectId);
      res.sendStatus(200);
    })
    .catch(e => next(createError(e)));
};

function sendUpdates (io, userId, updatedTasks, activeTask, createdDraft, projectId) {
  if (createdDraft) {
    TimesheetsChannel.sendAction('create', createdDraft, io, userId);
  }

  if (activeTask) {
    PlayerChannel.sendAction('setActiveTask', activeTask, io, userId);
  }

  updatedTasks.forEach(updatedTask => {
    TasksChannel.sendAction('update', updatedTask.dataValues, io, projectId);
  });
}

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
            .then(async (count) => {
              const projectCount = count.length;

              if (prefixNeed) {
                tasks.forEach((task) => {
                  task.dataValues.prefix = task.project.prefix;
                  delete task.dataValues.project;
                });
              }

              const activeTasks = await TasksService.getActiveTasks(req.user.id);
              if (activeTasks.length !== 0) {
                PlayerChannel.sendAction('setActiveTask', activeTasks[0], res.io, req.user.id);
              } else {
                const lastActiveTask = await TasksService.getLastActiveTask(req.user.id);
                PlayerChannel.sendAction('setActiveTask', lastActiveTask, res.io, req.user.id);
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
