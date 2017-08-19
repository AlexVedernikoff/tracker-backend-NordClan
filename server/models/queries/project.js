const models = require('../');
const createError = require('http-errors');

exports.name = 'project';

exports.findOneActiveProject = function(projectId, attributes = ['id'], t = null) {
  return models.Project
    .findOne({
      where: {
        id: projectId,
        deletedAt: null,
      },
      attributes: attributes,
      transaction: t
    })
    .then((project) => {
      if(!project) throw createError(404, 'Project not found');
      return project;
    });

};

exports.savePortfolioToProject = function(projectModel, portfolioName, t = null) {
  models.Portfolio
    .findOrCreate({
      where: {
        name: portfolioName,
        authorId: projectModel.authorId,
      },
      transaction: t
    })
    .spread((portfolio) => {
      if(!portfolio) throw createError(500, 'Can not create Portfolio');
      return projectModel.updateAttributes({
        portfolioId: portfolio.id
      }, {
        transaction: t
      });
    });
};