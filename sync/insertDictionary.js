const models = require('../models');

const dictionariesModels  = [
  models.ProjectStatusesDictionary,
  models.SprintStatusesDictionary,
  models.TaskStatusesDictionary,
  models.ProjectRolesDictionary,
];


(() => {
  let chain = Promise.resolve();
  dictionariesModels.forEach(function(model) {
    chain = chain
      .then(() => {
        return model.destroy({where: {}})
          .then(() => model.bulkCreate(model.values));
      });
  });

  chain
    .then(() => {
      console.info('Done');
    })
    .catch((err) => {
      console.error(err);
    });
})();