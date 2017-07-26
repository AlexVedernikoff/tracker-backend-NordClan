const models = require('../server/models');

const Models  = [
  models.ProjectRolesDictionary,
  models.ProjectStatusesDictionary,
  models.SprintStatusesDictionary,
  models.TaskStatusesDictionary,
  
  models.ProjectUsers,
  models.TaskUsers,
  models.ProjectAttachments,
  models.TaskAttachments,
  
  models.Portfolio,
  models.Project,
  models.Sprint,
  models.Task,
  models.TaskTasks,
  models.Tag,
  models.ItemTag,
  models.User,
  models.Department,
  models.UserDepartments,
  models.Token,
];

const dictionariesModels  = [
  models.ProjectStatusesDictionary,
  models.SprintStatusesDictionary,
  models.TaskStatusesDictionary,
  models.ProjectRolesDictionary,
];


(() => {
  let chain = Promise.resolve();
  Models.forEach(function(Model) {
    chain = chain
      .then(() => Model.sync({force: true}));
  });
  
  
 dictionariesModels.forEach(function(model) {
    chain = chain
      .then(() => {
        return model.destroy({where: {}})
          .then(() => model.bulkCreate(model.values));
      });
  });/* */
  
  
  chain
    .then(() => {
      console.log('Done');
    })
    .catch((err) => {
      console.error(err);
    });
})();