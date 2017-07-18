const models = require('../models');

const Models  = [
  models.Portfolio,
  models.Project,
  models.Sprint,
  models.Task,
  models.Tag,
  models.ItemTag,
  models.User,
  models.Department,
  models.UserDepartments,
  models.Token,
  models.ProjectUsers,
  models.TaskUsers,
  models.ProjectRolesDictionary,
  models.ProjectStatusesDictionary,
  models.SprintStatusesDictionary,
  models.TaskStatusesDictionary,
];


(() => {
  let chain = Promise.resolve();
  Models.forEach(function(Model) {
    chain = chain
      .then(() => Model.sync({force: true}));
  });
  
  chain
    .then(() => {
      console.log('Done');
    })
    .catch((err) => {
      console.error(err);
    });
})();