const createError = require('http-errors');
const _ = require('underscore');
const models = require('../../../models');
const { Sprint } = models;
const queries = require('../../../models/queries');
const Sequelize = require('sequelize');
const layoutAgnostic = require('../../../services/layoutAgnostic');

exports.create = function (req, res, next){
  if (!req.user.canUpdateProject(req.body.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  Sprint.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  Sprint.create(req.body)
    .then((model) => {
      return queries.sprint.allSprintsByProject(model.projectId)
        .then((sprints) => {
          res.end(JSON.stringify({id: model.id, sprints: sprints}));
        });
    })
    .catch((err) => {
      next(err);
    });
};


exports.read = function (req, res, next){
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Sprint.findByPrimary(req.params.id, {
    attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', /*'allottedTime' DEPRECATED,*/ 'createdAt', 'deletedAt',
      'projectId', 'authorId', 'budget', 'riskBudget', 'qaPercent',
      [Sequelize.literal(`(SELECT count(*)
                                FROM tasks as t
                                WHERE t.project_id = "Sprint"."project_id"
                                AND t.sprint_id = "Sprint"."id"
                                AND t.deleted_at IS NULL
                                AND t.status_id <> ${models.TaskStatusesDictionary.CANCELED_STATUS})`), 'countAllTasks'], // Все задачи кроме отмененных
      [Sequelize.literal(`(SELECT count(*)
                                FROM tasks as t
                                WHERE t.project_id = "Sprint"."project_id"
                                AND t.sprint_id = "Sprint"."id"
                                AND t.deleted_at IS NULL
                                AND t.status_id in (${models.TaskStatusesDictionary.DONE_STATUSES}))`), 'countDoneTasks'], // Все сделанные задаче
    ],
    order: [
      ['factStartDate', 'ASC'],
      ['name', 'ASC'],
    ],
  })
    .then((model) => {
      if (!model) {
        return next(createError(404));
      }
      if (!req.user.canReadProject(model.projectId)) {
        return next(createError(403, 'Access denied'));
      }
      res.end(JSON.stringify(model.dataValues));
    })
    .catch((err) => {
      next(err);
    });

};


exports.update = async function (req, res, next){
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  let transaction;
  try {
    transaction = await models.sequelize.transaction();
    const model = await Sprint.findByPrimary(req.params.id, { transaction, lock: 'UPDATE' });

    if (!model) {
      await transaction.rollback();
      return next(createError(404));
    }

    if (!req.user.canUpdateProject(model.projectId)) {
      await transaction.rollback();
      return next(createError(403, 'Access denied'));
    }

    const updatedModel = await model.updateAttributes(req.body, { transaction, historyAuthorId: req.user.id });
    const sprints = await queries.sprint.allSprintsByProject(updatedModel.projectId, queries.sprint.queryAttributes('Sprint'), transaction);
    await transaction.commit();
    res.json(sprints);

  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};


exports.delete = function (req, res, next){
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Sprint.findByPrimary(req.params.id, { attributes: ['id', 'projectId', [Sequelize.literal(`(SELECT count(t.id)
                                FROM tasks as t
                                WHERE t.project_id = "Sprint"."project_id"
                                AND t.sprint_id = "Sprint"."id"
                                AND t.status_id NOT IN (${models.TaskStatusesDictionary.CLOSED_STATUS})
                                AND t.deleted_at IS NULL)`), 'taskCount']] })
    .then((model) => {
      if (!model) {
        return next(createError(404));
      }

      if (!req.user.canUpdateProject(model.projectId)) {
        return next(createError(403, 'Access denied'));
      }

      if (+model.dataValues.taskCount > 0) {
        return next(createError(400, 'Can\'t delete sprint when it have exists tasks', { type: 'sprintHasActiveTasks' }));
      }

      return model.destroy({ historyAuthorId: req.user.id })
        .then(()=>{
          return queries.sprint.allSprintsByProject(model.projectId)
            .then((sprints) => {
              res.end(JSON.stringify(sprints));
            });
        });

    })
    .catch((err) => {
      next(err);
    });

};


exports.list = function (req, res, next){
  if (req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if (req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  if (!req.query.projectId.match(/^[0-9]+$/)) return next(createError(400, 'projectId must be int'));
  if (!req.user.canReadProject(req.query.projectId)) {
    return next(createError(403, 'Access denied'));
  }

  if (req.query.fields) {
    req.query.fields = req.query.fields.split(',').map((el) => el.trim());
    Sprint.checkAttributes(req.query.fields);
  }

  const where = {
    deletedAt: {$eq: null}, // IS NULL
  };

  if (req.query.name) {
    where.name = {
      $iLike: layoutAgnostic(req.query.name.trim()),
    };
  }

  if (req.query.statusId) {
    where.statusId = {
      in: req.query.statusId.toString().split(',').map((el)=>el.trim()),
    };
  }

  if (req.query.projectId) {
    where.projectId = {
      in: req.query.projectId.toString().split(',').map((el)=>el.trim()),
    };
  }


  Sprint
    .findAll({
      attributes: req.query.fields ? _.union(['id', 'name', 'factStartDate'].concat(req.query.fields)) : '',
      limit: req.query.pageSize ? +req.query.pageSize : 1000,
      offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
      where: where,

      order: [['factStartDate', 'ASC'], ['name', 'ASC']],
      subQuery: true,
    })
    .then(projects => {

      return Sprint
        .count({
          where: where,
          group: ['Sprint.id'],
        })
        .then((count) => {

          const sprintCount = count.length;

          const projectsRows = projects
            ? projects.map(
              item =>
                item.dataValues
            ) : [];

          const responseObject = {
            currentPage: req.query.currentPage ? +req.query.currentPage : 1,
            pagesCount: Math.ceil(sprintCount / (req.query.pageSize ? req.query.pageSize : 1)),
            pageSize: req.query.pageSize ? +req.query.pageSize : +sprintCount,
            rowsCountAll: sprintCount,
            rowsCountOnCurrentPage: projectsRows.length,
            data: projectsRows,
          };
          res.end(JSON.stringify(responseObject));

        });

    })
    .catch((err) => {
      next(err);
    });
};
