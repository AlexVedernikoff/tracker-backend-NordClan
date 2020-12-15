const createError = require('http-errors');
const models = require('../../../models');
const { Portfolio } = models;
const layoutAgnostic = require('../../../services/layoutAgnostic');

exports.create = function (req, res, next){
  Portfolio.beforeValidate((model) => {
    model.authorId = req.user.id;
  });

  Portfolio.create(req.body)
    .then((model) => {
      res.end(JSON.stringify({id: model.id}));
    })
    .catch((err) => {
      next(createError(err));
    });
};

exports.read = function (req, res, next){
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Portfolio
    .findByPrimary(req.params.id, {
      attributes: ['id', 'name'],
    })
    .then((portfolio) => {
      if (!portfolio) { return next(createError(404)); }

      res.end(JSON.stringify(portfolio.dataValues));
    })
    .catch((err) => {
      next(err);
    });
};


exports.update = function (req, res, next){
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  return Portfolio
    .findByPrimary(req.params.id, { attributes: ['id'] })
    .then((portfolio) => {
      if (!portfolio) {
        return next(createError(404));
      }

      return portfolio
        .updateAttributes(req.body)
        .then((model)=> res.json({id: model.dataValues.id}));
    })
    .catch((err) => {
      next(err);
    });
};


exports.delete = function (req, res, next){
  if (!req.params.id.match(/^[0-9]+$/)) return next(createError(400, 'id must be int'));

  Portfolio
    .findByPrimary(req.params.id, { attributes: ['id'] })
    .then((portfolio) => {
      if (!portfolio) { return next(createError(404)); }

      return portfolio.destroy()
        .then(()=>{
          res.end();
        });

    })
    .catch((err) => {
      next(err);
    });

};

exports.list = function (req, res, next){
  if (req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if (req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));

  const where = {
    deletedAt: {$eq: null}, // IS NULL
  };

  if (req.query.name) {
    where.name = {
      $iLike: layoutAgnostic(req.query.name.trim()),
    };
  }

  Portfolio
    .findAll({
      attributes: ['id', 'name'],
      limit: req.query.pageSize ? +req.query.pageSize : 20,
      offset: req.query.pageSize && req.query.currentPage && req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
      where: where,
      subQuery: true,
      include: [
        {
          as: 'projects',
          model: models.Project,
          required: true,
          attributes: [],
        },
      ],
      order: [
        ['name', 'ASC'],
      ],
    })
    .then(projects => {

      return Portfolio
        .count({
          where: where,
          include: [
            {
              as: 'projects',
              model: models.Project,
              required: true,
              attributes: [],
            },
          ],
          group: ['Portfolio.id'],
        })
        .then((count) => {
          const portfolioCount = count.length;

          const projectsRows = projects
            ? projects.map(
              item =>
                item.dataValues
            ) : [];

          const responseObject = {
            currentPage: req.query.currentPage ? +req.query.currentPage : 1,
            pagesCount: Math.ceil(portfolioCount / (req.query.pageSize ? req.query.pageSize : 1)),
            pageSize: req.query.pageSize ? +req.query.pageSize : +portfolioCount,
            rowsCountAll: portfolioCount,
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

