const models = require('../');

exports.name = 'portfolio';

exports.checkEmptyAndDelete = function(portfolioId) {
  return models.Project
    .count({where: {portfolioId:portfolioId}})
    .then((count) => {
      if(count === 0) {
        return models.Portfolio.destroy({where: {id: portfolioId}});
      }
    });

};
