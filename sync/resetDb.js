const models = require('../server/models');

const Models  = [
  // models.ProjectRolesDictionary,
  // models.ProjectStatusesDictionary,
  // models.SprintStatusesDictionary,
  // models.TaskStatusesDictionary,
  // models.TaskTypesDictionary,
  // models.ProjectRolesDictionary,
  // models.TimesheetStatusesDictionary,

  // models.Portfolio,
  // models.Project,
  // models.Sprint,
  // models.User,
  // models.Task,
  // models.Department,
  // models.UserDepartments,
  // models.Token,
  // models.SystemToken,
  // models.Metrics,
  // models.MetricTypesDictionary,

  // models.ProjectUsers,
  // models.ProjectAttachments,
  // models.TaskAttachments,

  // models.TimesheetTypesDictionary,
  // models.Timesheet,
  // models.TimesheetDraft,
  // models.ModelHistory,
  //models.ProjectHistory,
  // models.TaskTasks,
  // models.ItemTag,
  // models.ItemTag,
  // models.Tag,
  // models.Comment
];

const dictionariesModels  = [
  // models.ProjectStatusesDictionary,
  // models.SprintStatusesDictionary,
  // models.TaskStatusesDictionary,
  // models.TaskTypesDictionary,
  // models.ProjectRolesDictionary,
  // models.TimesheetTypesDictionary,
  // models.TimesheetStatusesDictionary,
  // models.MetricTypesDictionary,
];


(() => {
  let chain = Promise.resolve();
  Models.forEach(function(Model) {
    chain = chain
      .then(() => Model.sync({force: true}));
  });


  /*dictionariesModels.forEach(function(model) {
    chain = chain
      .then(() => {
        return model.destroy({where: {}})
          .then(() => model.bulkCreate(model.values));
      });
  });*/


  chain
    .then(() => {
      console.log('Done');
    })
    .catch((err) => {
      console.error(err);
    });
})();
