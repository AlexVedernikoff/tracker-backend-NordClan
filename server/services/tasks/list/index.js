const _ = require('lodash');

const models = require('../../../models');
const queries = require('../../../models/queries');
const moment = require('moment');
const { Task, Tag, ItemTag } = models;
const layoutAgnostic = require('../../layoutAgnostic');
const { NOTAG } = require('../../../components/utils');

function getTagsByTaskList (tasks) {
  const allTags = _.unionBy(...tasks.map(task => task.tags.map(o => o.dataValues)), o => o.name).map(tag => ({
    name: tag.name,
  }));
  return allTags;
}

exports.list = async function (req) {
  let prefixNeed = false;

  if (req.query.fields) {
    req.query.fields = req.query.fields.split(',').map(el => el.trim());

    if (req.query.fields.indexOf('prefix') !== -1) {
      prefixNeed = true;
    }

    if (prefixNeed) {
      req.query.fields.splice(req.query.fields.indexOf('prefix'), 1);
    }

    Task.checkAttributes(req.query.fields);
  }

  const userRole = req.user.dataValues.globalRole;

  let tags = null;
  if (req.query.tags) {
    tags = typeof req.query.tags === 'string' ? req.query.tags.split(',') : req.query.tags;
  }

  // Поиск тасок без тега
  const selectWithoutTags = Array.isArray(tags) && tags.length === 1 && NOTAG.indexOf(tags[0].toLowerCase()) !== -1;
  if (selectWithoutTags) {
    tags = [];
  }

  const { includeForCount, includeForSelect } = await createIncludeForRequest(
    tags,
    prefixNeed,
    req.query.performerId,
    userRole,
    selectWithoutTags
  );
  const queryWhere = createWhereForRequest(req, selectWithoutTags);

  if (!req.query.pageSize && !queryWhere.projectId && !queryWhere.sprintId && !queryWhere.performerId) {
    req.query.pageSize = 100;
  } else if (!req.query.pageSize && (queryWhere.projectId || queryWhere.sprintId || queryWhere.performerId)) {
    req.query.pageSize = null;
  }

  if (!req.query.currentPage) {
    req.query.currentPage = 1;
  }

  const tasks = await Task.findAll({
    attributes: queries.task.defaultAttributes(userRole),
    include: includeForSelect,
    where: queryWhere,
    subQuery: false,
    order: models.sequelize.literal(
      'CASE WHEN "sprint"."fact_start_date" <= now() AND "sprint"."fact_finish_date" >= now() THEN 1 ELSE 2 END'
        + ', "sprint"."fact_start_date" ASC'
        + ', "statusId" ASC'
        + ', "prioritiesId" ASC'
        + ', "name" ASC'
    ),
  });

  const count = await Task.count({
    where: queryWhere,
    include: includeForCount,
    subQuery: false,
    group: ['Task.id'],
  });

  const projectCount = count.length;

  if (prefixNeed) {
    tasks.forEach(task => {
      task.dataValues.prefix = task.project.prefix;
    });
  }

  const allTags = req.query.projectId
    ? await queries.tag.getAllTaskTagsByProject(req.query.projectId)
    : getTagsByTaskList(tasks);
  const offset = req.query.currentPage > 0 ? req.query.pageSize * (req.query.currentPage - 1) : 0;

  const responseObject = {
    currentPage: req.query.currentPage,
    pagesCount: req.query.pageSize ? Math.ceil(projectCount / req.query.pageSize) : 1,
    pageSize: req.query.pageSize ? req.query.pageSize : projectCount,
    rowsCountAll: projectCount,
    rowsCountOnCurrentPage: tasks.length,
    data: req.query.pageSize ? tasks.slice(offset, offset + +req.query.pageSize) : tasks,
    allTags: allTags,
    queryId: req.query.queryId,
  };

  return responseObject;
};

function createWhereForRequest (req, selectWithoutTags) {
  const where = {
    deletedAt: { $eq: null }, // IS NULL
  };

  if (!req.query.projectId && !req.query.performerId) {
    where.performerId = req.user.id;
  }

  if (+req.query.performerId === 0) {
    where.performerId = { $eq: null }; // IS NULL
  } else if (req.query.performerId) {
    where.performerId = req.query.performerId;
  }

  if (+req.query.performerId === 0 && req.query.isDevOps && (req.user.isDevOps || req.user.isGlobalAdmin)) {
    delete where.performerId;
  }

  if (req.query.name) {
    if (+req.query.name > 0) {
      const searchTemplate = `%${req.query.name}%`;

      where.$or = [
        {
          name: { $iLike: searchTemplate },
        },
        models.sequelize.where(models.sequelize.cast(models.sequelize.col('Task.id'), 'varchar'), {
          $iLike: searchTemplate,
        }),
      ];
    } else {
      where.name = {
        $iLike: layoutAgnostic(req.query.name),
      };
    }
  }
  // Если +req.query.statusId === 0 или указан спринт вывожу все статусы, если указаны конкретные вывожу их.
  if (req.query.statusId && +req.query.statusId !== 0) {
    where.statusId = {
      in: req.query.statusId
        .toString()
        .split(',')
        .map(el => el.trim()),
    };
  }

  if (req.query.authorId && +req.query.authorId !== 0) {
    where.authorId = {
      in: req.query.authorId
        .toString()
        .split(',')
        .map(el => el.trim()),
    };
  }

  if (req.query.prioritiesId) {
    where.prioritiesId = {
      in: req.query.prioritiesId
        .toString()
        .split(',')
        .map(el => el.trim()),
    };
  }

  if (!req.query.statusId && !req.query.allStatuses) {
    where.statusId = {
      $notIn: [9, 10], // По умолчанию показываю все не отмененные и ине закрытые (см. словарь статусов TaskStatusesDictionary)
    };
  }

  if (req.query.typeId) {
    where.typeId = {
      in: req.query.typeId
        .toString()
        .split(',')
        .map(el => el.trim()),
    };
  }

  if (req.query.projectId) {
    where.projectId = {
      in: req.query.projectId
        .toString()
        .split(',')
        .map(el => el.trim()),
    };
  } else if (!req.user.isGlobalAdmin && !req.user.isVisor) {
    where.projectId = req.user.dataValues.projects;
  }

  if (req.query.sprintId) {
    if (+req.query.sprintId === 0) {
      where.sprintId = {
        $eq: null,
      };
    } else {
      let sprints;
      if (Array.isArray(req.query.sprintId)) {
        sprints = [...req.query.sprintId];
      } else {
        sprints = [req.query.sprintId];
      }
      const ind = sprints.findIndex(e => e === '0');
      if (~ind) {
        sprints.splice(ind, 1);
        where.sprintId = {
          $or: [
            { $eq: null },
            {
              in: sprints
                .toString()
                .split(',')
                .map(el => el.trim()),
            },
          ],
        };
      } else {
        where.sprintId = {
          in: req.query.sprintId
            .toString()
            .split(',')
            .map(el => el.trim()),
        };
      }
    }
  }

  if (req.query.dateFrom) {
    where.created_at = {
      ...where.created_at,
      $gte: moment(req.query.dateFrom, 'DD.MM.YYYY')
        .startOf('day')
        .toDate(),
    };
  }

  if (req.query.dateTo) {
    where.created_at = {
      ...where.created_at,
      $lte: moment(req.query.dateTo, 'DD.MM.YYYY')
        .endOf('day')
        .toDate(),
    };
  }

  if (selectWithoutTags) {
    where['$"tags.ItemTag"."tag_id"$'] = {
      $is: null,
    };
  }
  if (req.query.isDevOps) {
    where.isDevOps = req.query.isDevOps;
  }

  if (req.user.isDevOps && !req.user.isUserOfProject(+req.query.projectId)) {
    return {
      $or: [
        {
          ...where,
          isDevOps: true,
        },
        {
          ...where,
          performerId: req.user.id,
        },
      ],
    };
  }

  // отдаю таски только по выбранным проектам(стр. MyTasks)
  if (req.query.projectIds && req.query.projectIds.length) {
    where.projectId = {
      in: req.query.projectIds
        .toString()
        .split(',')
        .map(el => el.trim()),
    };
  }

  return where;
}

async function createIncludeForRequest (tagsParams, prefixNeed, performerId, role, selectWithoutTags) {
  const parsedTags = tagsParams
    ? tagsParams.map(el =>
      el
        .toString()
        .trim()
        .toLowerCase()
    )
    : null;

  const includeAuthor = {
    as: 'author',
    model: models.User,
    attributes: models.User.defaultSelect,
  };

  const includePerformer = {
    as: 'performer',
    model: models.User,
    attributes: models.User.defaultSelect,
  };

  const includeParentTask = {
    as: 'parentTask',
    model: models.Task,
    attributes: ['id', 'name', 'statusId'],
  };

  const includeSubTasks = {
    as: 'subTasks',
    model: models.Task,
    attributes: ['id', 'name', 'statusId'],
    where: {
      statusId: {
        $notIn: [9], // По умолчанию показываю все не отмененные (см. словарь статусов TaskStatusesDictionary)
      },
    },
    required: false,
  };

  const includeLLnkedTasks = {
    as: 'linkedTasks',
    model: models.Task,
    attributes: ['id', 'name', 'statusId'],
    through: {
      model: models.TaskTasks,
      attributes: [],
    },
  };

  const includeSprint = {
    as: 'sprint',
    model: models.Sprint,
    attributes:
      role !== 'EXTERNAL_USER'
        ? ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate' /*, allottedTime' DEPRECATED*/, 'budget']
        : ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate'],
  };

  const includeTagSelect = {
    as: 'tags',
    model: Tag,
    attributes: ['name'],
    through: {
      model: ItemTag,
      attributes: [],
    },
    order: [['name', 'ASC']],
  };

  const includeTagConst = {
    model: Tag,
    as: 'tagForQuery',
    required: true,
    attributes: [],
    where: {
      name: {
        $or: parsedTags,
      },
    },
    through: {
      model: ItemTag,
      attributes: [],
    },
  };

  const includeProject = {
    as: 'project',
    model: models.Project,
    attributes: ['prefix', 'name'],
  };

  const includeForSelect = [
    includeAuthor,
    includeParentTask,
    includeSubTasks,
    includeLLnkedTasks,
    includePerformer,
    includeSprint,
    includeTagSelect,
  ];
  if (prefixNeed) includeForSelect.push(includeProject);

  const includeForCount = [];
  if (selectWithoutTags) {
    includeForCount.push(includeTagSelect);
  }
  if (parsedTags) {
    includeForCount.push(includeTagConst);

    const tags = await Tag.findAll({
      where: {
        name: {
          $in: parsedTags,
        },
      },
    });

    tags.forEach(tag => {
      includeForSelect.push({
        association: Task.hasOne(models.ItemTag, {
          as: 'itemTag' + tag.id,
          foreignKey: {
            name: 'taggableId',
            field: 'taggable_id',
          },
          scope: {
            taggable: 'task',
          },
        }),
        attributes: [],
        required: true,
        where: {
          tag_id: tag.id,
        },
      });
    });
  }

  if (performerId) {
    includeForCount.push(includePerformer);
  }

  return { includeForCount, includeForSelect };
}
