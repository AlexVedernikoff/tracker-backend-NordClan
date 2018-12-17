const models = require('../');
const createError = require('http-errors');

exports.name = 'project';

exports.savePortfolioToProject = function (projectModel, portfolioName, t = null) {
  models.Portfolio
    .findOrCreate({
      where: {
        name: portfolioName,
        authorId: projectModel.authorId
      },
      transaction: t
    })
    .spread((portfolio) => {
      if (!portfolio) {
        throw createError(500, 'Can not create Portfolio');
      }

      return projectModel.updateAttributes({
        portfolioId: portfolio.id
      }, {
        transaction: t
      });
    });
};
