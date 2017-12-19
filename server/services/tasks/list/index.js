const models = require('../../../models');
const _ = require('underscore');
const { Task, Tag, ItemTag } = models;
const { getActiveTasks, getLastActiveTask } = require('../update');

exports.list = async function (req) {
  let prefixNeed = false;

  if (req.query.fields) {
    req.query.fields = req.query.fields.split(',').map((el) => el.trim());

    if (req.query.fields.indexOf('prefix') !== -1) {
      prefixNeed = true;
    }

    if (prefixNeed) {
      req.query.fields.splice(req.query.fields.indexOf('prefix'), 1);
    }

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

  const { includeForCount, includeForSelect } = await createIncludeForRequest(req.query.tags, prefixNeed, req.query.performerId);
  const queryWhere = createWhereForRequest(req);
  const queryAttributes = req.query.fields
    ? _.union(['id', 'name', 'authorId', 'performerId', 'sprintId', 'statusId', 'prioritiesId', 'projectId'].concat(req.query.fields))
    : '';

  const queryOffset = req.query.currentPage > 0
    ? req.query.pageSize * (req.query.currentPage - 1)
    : 0;

  const tasks = await Task.findAll({
    attributes: queryAttributes,
    limit: req.query.pageSize,
    offset: queryOffset,
    include: includeForSelect,
    where: queryWhere,
    subQuery: true,
    order: models.sequelize.literal('CASE WHEN "sprint"."fact_start_date" <= now() AND "sprint"."fact_finish_date" >= now() THEN 1 ELSE 2 END'
      + ', "sprint"."fact_start_date" ASC'
      + ', "Task"."statusId" ASC'
      + ', "Task"."prioritiesId" ASC'
      + ', "Task"."name" ASC')
  });

  const count = await Task.count({
    where: queryWhere,
    include: includeForCount,
    group: ['Task.id']
  });

  const projectCount = count.length;

  if (prefixNeed) {
    tasks.forEach((task) => {
      task.dataValues.prefix = task.project.prefix;
      delete task.dataValues.project;
    });
  }

  const responseObject = {
    currentPage: req.query.currentPage,
    pagesCount: (req.query.pageSize) ? Math.ceil(projectCount / req.query.pageSize) : 1,
    pageSize: (req.query.pageSize) ? req.query.pageSize : projectCount,
    rowsCountAll: projectCount,
    rowsCountOnCurrentPage: tasks.length,
    data: tasks
  };

  return responseObject;
};

function createWhereForRequest (req) {
  const where = {
    deletedAt: { $eq: null } // IS NULL
  };

  where.performerId = req.query.performerId || req.user.id;

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

  if (req.query.authorId && +req.query.authorId !== 0) {
    where.authorId = {
      in: req.query.authorId.toString().split(',').map((el) => el.trim())
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

  return where;
}

async function createIncludeForRequest (tagsParams, prefixNeed, performerId) {
  const parsedTags = tagsParams
    ? tagsParams.split(',').map((el) => el.toString().trim().toLowerCase())
    : null;

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
        $or: parsedTags
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

  const includeForSelect = [ includeAuthor, includePerformer, includeSprint, includeTagSelect ];
  if (prefixNeed) includeForSelect.push(includeProject);

  const includeForCount = [];
  if (parsedTags) {
    includeForCount.push(includeTagConst);

    const tags = await Tag.findAll({
      where: {
        name: {
          $in: parsedTags
        }
      }
    });

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
  }

  if (performerId) {
    includeForCount.push(includePerformer);
  }

  return { includeForCount, includeForSelect };
}
