const createError = require('http-errors');
const moment = require('moment');
const _ = require('underscore');
const Sequelize = require('sequelize');
const models = require('../../../models');
const { Project, Tag, ItemTag, Portfolio, Sprint } = models;
const queries = require('../../../models/queries');
const ProjectsChannel = require('../../../channels/Projects');
const layoutAgnostic = require('../../../services/layoutAgnostic');
const gitLabService = require('../../../services/gitLab');

exports.create = function (req, res, next) {
  if (req.body.tags) {
    req.body.tags
      .split(',')
      .map(el => el.trim())
      .forEach(el => {
        if (el.length < 2) return next(createError(400, 'tag must be more then 2 chars'));
      });
  }

  Project.beforeValidate(async model => {
    try {
      if (req.isSystemUser && req.body.creatorPsId) {
        const user = await models.User.findOne({ where: { psId: req.body.creatorPsId }, attributes: ['id'] });
        if (!user) {
          return next(createError(404, 'User not found'));
        }
        model.authorId = user.id;
        model.createdBySystemUser = true;
      } else if (req.user.id) {
        model.authorId = req.user.id;
      } else {
        return next(createError(500, 'in req must be req.isSystemUser and have creatorPsId field or req.user.id'));
      }
    } catch (e) {
      next(createError(e));
    }
  });

  if (req.user.isVisor) {
    return next(createError(403, 'Access denied'));
  }

  Project.create(req.body)
    .then(model => {
      return queries.tag
        .saveTagsForModel(model, req.body.tags, 'project')
        .then(() => {
          if (!req.body.portfolioId && req.body.portfolioName) {
            return queries.project.savePortfolioToProject(model, req.body.portfolioName);
          }
        })
        .then(() => {
          ProjectsChannel.sendAction('create', model, res.io, model.id);
          res.json(model);
        });
    })
    .catch(err => {
      next(err);
    });
};

exports.read = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  if (!req.user.canReadProject(req.params.id)) {
    return next(createError(403, 'Access denied'));
  }

  const userRole = req.user.dataValues.globalRole;

  Project.findByPrimary(req.params.id, {
    order: [
      [{ model: models.Sprint, as: 'sprints' }, 'factStartDate', 'ASC'],
      [{ model: models.Sprint, as: 'sprints' }, 'name', 'ASC']
    ],
    include: [
      {
        as: 'tags',
        model: Tag,
        attributes: ['name'],
        through: {
          model: ItemTag,
          attributes: []
        },
        order: [['name', 'ASC']]
      },
      {
        as: 'sprints',
        model: Sprint,
        attributes: queries.sprint.queryAttributes('sprints', userRole)
      },
      {
        as: 'portfolio',
        model: Portfolio,
        attributes: ['id', 'name']
      },
      {
        as: 'projectUsers',
        model: models.ProjectUsers,
        attributes: models.ProjectUsers.defaultSelect,
        separate: true,
        include: [
          {
            as: 'user',
            model: models.User,
            where: {
              globalRole: { $not: models.User.EXTERNAL_USER_ROLE }
            },
            attributes: [
              'id',
              'firstNameRu',
              'lastNameRu',
              'firstNameEn',
              'lastNameEn',
              'photo',
              'skype',
              'emailPrimary',
              'mobile'
            ]
          },
          {
            as: 'roles',
            model: models.ProjectUsersRoles
          }
        ],
        order: [['id', 'DESC']]
      },
      {
        as: 'externalUsers',
        model: models.ProjectUsers,
        attributes: models.ProjectUsers.defaultSelect,
        separate: true,
        include: [
          {
            as: 'user',
            model: models.User,
            where: {
              globalRole: models.User.EXTERNAL_USER_ROLE
            },
            attributes: [
              'id',
              'firstNameRu',
              'lastNameRu',
              'firstNameEn',
              'lastNameEn',
              'photo',
              'skype',
              'emailPrimary',
              'mobile',
              'description'
            ]
          },
          {
            as: 'roles',
            model: models.ProjectUsersRoles
          }
        ],
        order: [['id', 'DESC']]
      },
      {
        as: 'attachments',
        model: models.ProjectAttachments,
        attributes: models.ProjectAttachments.defaultSelect,
        order: [['createdAt', 'ASC']]
      },
      {
        as: 'milestones',
        model: models.Milestone
      }
    ]
  })
    .then(async model => {
      if (!model) return next(createError(404));
      const usersData = [];
      if (model.projectUsers) {
        const projectRoles = await models.ProjectRolesDictionary.findAll();
        model.projectUsers.forEach(projectUser => {
          usersData.push({
            id: projectUser.user.id,
            fullNameRu: projectUser.user.fullNameRu,
            fullNameEn: projectUser.user.fullNameEn,
            roles: queries.projectUsers.getTransRolesToObject(projectUser.roles, projectRoles)
          });
        });
      }
      model.dataValues.users = usersData;
      if (model.dataValues.tags) {
        model.dataValues.tags = Object.keys(model.dataValues.tags).map(k => model.dataValues.tags[k].name);
      } // Преобразую теги в массив
      delete model.dataValues.portfolioId;

      if (userRole === models.User.EXTERNAL_USER_ROLE) {
        delete model.dataValues.budget;
        delete model.dataValues.riskBudget;
      }

      if (model.gitlabProjectIds && model.gitlabProjectIds.length) {
        model.dataValues.gitlabProjects = await gitLabService.projects.getProjects(model.gitlabProjectIds);
      } else {
        model.dataValues.gitlabProjects = [];
      }

      res.json(model.dataValues);
    })
    .catch(err => {
      next(err);
    });
};

exports.update = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));
  if (!req.user.canUpdateProject(req.params.id)) {
    return next(createError(403, 'Access denied'));
  }

  const attributes = Object.keys(req.body)
    .filter(key => key !== 'portfolioName')
    .concat(['id', 'portfolioId', 'statusId']);

  let portfolioIdOld;

  const gitlabProjectIdsOld = [];
  const gitlabProjectIdsNew = [];
  let gitlabProjectsOld = [];
  let gitlabProjectsNew = [];

  return models.sequelize
    .transaction(function (t) {
      return Project.findByPrimary(req.params.id, { attributes: attributes, transaction: t, lock: 'UPDATE' }).then(
        async project => {
          if (!project) {
            return next(createError(404));
          }

          // проверка добавленных / измененных репозиториев GitLab
          if (req.body.gitlabProjectIds && req.body.gitlabProjectIds.length) {
            req.body.gitlabProjectIds.forEach(id => {
              if ((project.gitlabProjectIds || []).includes(id)) gitlabProjectIdsOld.push(id);
              else gitlabProjectIdsNew.push(id);
            });

            gitlabProjectsNew = await gitLabService.projects.getProjects(gitlabProjectIdsNew);
            const isError = !!gitlabProjectsNew.filter(p => p.error).length;
            if (isError) return next(createError(500, 'Can not add repositories'));
          }

          // сброс портфеля
          if (+req.body.portfolioId === 0) {
            req.body.portfolioId = null;
            portfolioIdOld = project.portfolioId;
          }

          const needCreateNewPortfolio = !req.body.portfolioId && req.body.portfolioName;
          if (needCreateNewPortfolio) {
            const portfolioParams = {
              name: req.body.portfolioName,
              authorId: req.user.id
            };

            const portfolio = await Portfolio.create(portfolioParams, { returning: true });

            delete req.body.portfolioName;
            req.body.portfolioId = portfolio.id;
          }

          return project.updateAttributes(req.body, { transaction: t, historyAuthorId: req.user.id }).then(async () => {
            // Запускаю проверку портфеля на пустоту и его удаление
            if (portfolioIdOld) {
              queries.portfolio.checkEmptyAndDelete(portfolioIdOld);
            }

            // Отсылаю ответ модель с проектом
            return Project.findByPrimary(req.params.id, {
              attributes: Project.defaultSelect,
              include: [
                {
                  as: 'portfolio',
                  model: Portfolio,
                  attributes: ['id', 'name'],
                  required: false
                }
              ],
              transaction: t
            }).then(async model => {
              const updatedParams = { ...req.body, id: model.id };
              ProjectsChannel.sendAction('update', updatedParams, res.io, model.id);

              if (req.body.gitlabProjectIds) {
                gitlabProjectsOld = await gitLabService.projects.getProjects(gitlabProjectIdsOld);
                model.dataValues.gitlabProjects = [...gitlabProjectsOld, ...gitlabProjectsNew];
              }

              res.json(model);
            });
          });
        }
      );
    })
    .catch(err => {
      next(err);
    });
};

exports.delete = function (req, res, next) {
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Project.findByPrimary(req.params.id, { attributes: ['id'] })
    .then(project => {
      if (!project) {
        return next(createError(404));
      }

      return project.destroy({ historyAuthorId: req.user.id }).then(() => {
        res.end();
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.list = function (req, res, next) {
  if (req.query.dateSprintBegin && !req.query.dateSprintBegin.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return next(createError(400, 'date must be in YYYY-MM-DD format'));
  }
  if (req.query.dateSprintEnd && !req.query.dateSprintEnd.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return next(createError(400, 'date must be in YYYY-MM-DD format'));
  }
  if (req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) {
    return next(createError(400, 'currentPage must be int'));
  }
  if (req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  if (req.query.portfolioId && !req.query.portfolioId.match(/^\d+$/)) {
    return next(createError(400, 'portfolioId must be int'));
  }
  if (req.query.performerId && !req.query.performerId.match(/^\d+$/)) {
    return next(createError(400, 'performerId must be int'));
  }
  if (req.query.fields) {
    req.query.fields = req.query.fields.split(',').map(el => el.trim());
    Project.checkAttributes(req.query.fields);
  }

  // if (!req.query.pageSize) {
  //   req.query.pageSize = 25;
  // }

  // if (!req.query.currentPage) {
  //   req.query.currentPage = 1;
  // }

  const include = [];
  let where = {};

  if (req.query.userIsParticipant || (!req.user.isGlobalAdmin && !req.user.isVisor)) {
    where.id = req.user.dataValues.projects;
  }

  if (req.query.portfolioId) {
    where.portfolioId = req.query.portfolioId;
  }

  if (req.query.name) {
    where.name = { $iLike: layoutAgnostic(req.query.name.trim()) };
  }

  if (req.query.statusId) {
    where.statusId = {
      in: req.query.statusId
        .toString()
        .split(',')
        .map(el => el.trim())
    };
  }

  if (req.query.typeId) {
    where.typeId = {
      in: req.query.typeId
        .toString()
        .split(',')
        .map(el => el.trim())
    };
  }

  if (req.query.tags) {
    req.query.tags = req.query.tags.split(',').map(el =>
      el
        .toString()
        .trim()
        .toLowerCase()
    );
  }

  if (req.query.dateSprintBegin) {
    const dateSprintBegin = moment(req.query.dateSprintBegin).format('YYYY-MM-DD');
    where = Sequelize.and(
      where,
      Sequelize.literal(
        `(
        ("Project"."id" IN (SELECT project_id FROM sprints WHERE fact_start_date >= '${dateSprintBegin}' 
          AND fact_start_date = (SELECT MIN(fact_start_date)
            FROM sprints
            WHERE project_id = "Project"."id"
            AND deleted_at IS NULL
          )
        ))
        OR (
          "Project"."id" NOT IN (SELECT project_id FROM sprints WHERE project_id IS NOT NULL AND deleted_at IS NULL)
          AND "Project"."created_at" >= '${dateSprintBegin}'
        )
      )`
      )
    );
  }

  if (req.query.dateSprintEnd) {
    const dateSprintEnd = moment(req.query.dateSprintEnd).format('YYYY-MM-DD');
    where = Sequelize.and(
      where,
      Sequelize.literal(
        `(
        ("Project"."id" IN (SELECT project_id FROM sprints WHERE fact_finish_date <= '${dateSprintEnd}'
          AND fact_finish_date = (SELECT MAX(fact_finish_date)
            FROM sprints 
            WHERE project_id = "Project"."id"
            AND deleted_at IS NULL
          )
        ))
        OR (
          "Project"."id" NOT IN (SELECT project_id FROM sprints WHERE project_id IS NOT NULL AND deleted_at IS NULL)
          AND ("Project"."completed_at" IS NULL OR "Project"."completed_at" <= '${dateSprintEnd}')
        )
      )`
      )
    );
  }

  const userRole = req.user.dataValues.globalRole;

  // вывод текущего спринта
  include.push({
    as: 'currentSprints',
    model: Sprint,
    attributes:
      userRole !== models.User.EXTERNAL_USER_ROLE
        ? models.Sprint.defaultSelect
        : ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate'],
    where: {
      statusId: models.SprintStatusesDictionary.IN_PROCESS_STATUS,
      deletedAt: {
        $eq: null // IS NULL
      }
    },
    required: false
  });

  // вывод тегов
  include.push({
    model: ItemTag,
    as: 'itemTagSelect',
    where: {
      taggable: 'project'
    },
    include: [
      {
        as: 'tag',
        model: Tag,
        attributes: ['name']
      }
    ],
    required: false
  });

  // Порфтель
  include.push({
    as: 'portfolio',
    model: Portfolio,
    attributes: ['id', 'name']
  });

  // Фильтрация по исполнитею
  if (req.query.performerId) {
    include.push({
      model: models.ProjectUsers,
      attributes: [],
      where: {
        userId: req.query.performerId
      }
    });
  }

  // Фильтрация по дате
  const queryFactStartDate = {};
  const queryFactFinishDate = {};

  if (req.query.dateSprintBegin) {
    queryFactStartDate.$gte = moment(req.query.dateSprintBegin).format('YYYY-MM-DD'); // factStartDate >= queryBegin
    queryFactFinishDate.$gte = moment(req.query.dateSprintBegin).format('YYYY-MM-DD'); // factStartDate >= queryBegin
  }

  if (req.query.dateSprintEnd) {
    queryFactStartDate.$lte = moment(req.query.dateSprintEnd).format('YYYY-MM-DD'); // factStartDate >= queryBegin
    queryFactFinishDate.$lte = moment(req.query.dateSprintEnd).format('YYYY-MM-DD'); // factStartDate >= queryBegin
  }

  if (req.query.dateSprintBegin || req.query.dateSprintEnd) {
    include.push({
      as: 'sprintForQuery',
      model: Sprint,
      attributes: [],
      required: false,
      where: {
        $or: [
          {
            factStartDate: queryFactStartDate
          },
          {
            factFinishDate: queryFactFinishDate
          }
        ]
      }
    });
  }

  const additinalAttr = [
    [
      Sequelize.literal(`(SELECT count(t.*)
                                  FROM project_users as t
                                  WHERE t.project_id = "Project"."id"
                                  AND t.deleted_at IS NULL)`),
      'usersCount'
    ], // Кол-во активных участников в проекте
    [
      Sequelize.literal(`(SELECT fact_start_date
                                  FROM sprints as t
                                  WHERE t.project_id = "Project"."id"
                                  AND t.deleted_at IS NULL
                                  ORDER BY fact_start_date ASC
                                  LIMIT 1)`),
      'dateStartFirstSprint'
    ], // Дата начала превого спринта у проекта
    [
      Sequelize.literal(`(SELECT fact_finish_date
                                  FROM sprints as t
                                  WHERE t.project_id = "Project"."id"
                                  AND t.deleted_at IS NULL
                                  ORDER BY fact_start_date DESC
                                  LIMIT 1)`),
      'dateFinishLastSprint'
    ] // Дата завершения последнего спринта у проекта
  ];
  const attributes
    = userRole !== models.User.EXTERNAL_USER_ROLE
      ? Project.defaultSelect.concat(additinalAttr)
      : [
        'id',
        'name',
        'description',
        'prefix',
        'statusId',
        'typeId',
        'notbillable',
        'portfolioId',
        'authorId',
        'completedAt',
        'createdAt'
      ].concat(additinalAttr);

  Promise.resolve()
    // Фильтрация по тегам ищем id тегов
    .then(() => {
      if (req.query.tags) {
        return Tag.findAll({
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
    .then(tags => {
      tags.forEach(tag => {
        include.push({
          association: Project.hasOne(models.ItemTag, {
            as: 'itemTag' + tag.id,
            foreignKey: {
              name: 'taggableId',
              field: 'taggable_id'
            },
            scope: {
              taggable: 'project'
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
      return Project.findAll({
        attributes: req.query.fields ? _.union(attributes.concat(req.query.fields)) : attributes,
        limit: req.query.pageSize,
        offset: req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
        include: include,
        where: where,
        subQuery: true,
        order: [['statusId', 'ASC'], ['name', 'ASC'], [{ as: 'currentSprints', model: Sprint }, 'factStartDate', 'ASC']]
      }).then(projects => {
        return Project.count({
          where: where,
          include: include,
          group: ['Project.id']
        }).then(count => {
          const projectCount = count.length;

          if (projects) {
            for (const key in projects) {
              const row = projects[key].dataValues;

              if (row.itemTagSelect) row.tags = Object.keys(row.itemTagSelect).map(k => row.itemTagSelect[k].tag.name); // Преобразую теги в массив
              delete row.itemTagSelect;
              delete row.portfolioId;

              if (row.currentSprints && row.currentSprints[0]) {
                // преобразую спринты
                const filteredCurrentSprints = row.currentSprints.filter(sprint =>
                  moment().isBetween(moment(sprint.factStartDate), moment(sprint.factFinishDate))
                );
                row.currentSprints = filteredCurrentSprints.length
                  ? [filteredCurrentSprints[0]]
                  : [row.currentSprints[0]];
              }
              projects[key].dataValues = row;
            }
          }

          const responseObject = {
            currentPage: +req.query.currentPage,
            pagesCount: Math.ceil(projectCount / req.query.pageSize),
            pageSize: req.query.pageSize,
            rowsCountAll: projectCount,
            rowsCountOnCurrentPage: projects.length,
            data: projects
          };
          res.json(responseObject);
        });
      });
    })
    .catch(err => next(err));
};

exports.addGitlabProject = async function (req, res, next) {
  try {
    const { projectId, path } = req.body;
    const gitlabProject = await gitLabService.projects.addProjectByPath(projectId, path);
    res.json(gitlabProject);
  } catch (e) {
    next(e);
  }
};

exports.getGitlabNamespaces = async function (req, res, next) {
  try {
    const namespaces = await gitLabService.projects.getNamespacesList();
    res.json(namespaces);
  } catch (e) {
    next(e);
  }
};

exports.createGitlabProject = async function (req, res, next) {
  try {
    const { name, namespace_id } = req.body;
    const projectId = req.params.id;
    const project = await gitLabService.projects.createProject(name, namespace_id, projectId);
    res.json(project);
  } catch (e) {
    next(e);
  }
};

exports.getProjects = async function (req, res, next) {
  try {
    const { id } = req.params;
    const project = await Project.find({ where: { id } });
    const gitlabProjects = await gitLabService.projects.getProjects(project.gitlabProjectIds);
    res.json(gitlabProjects);
  } catch (e) {
    next(e);
  }
};
