const _ = require('underscore');
const moment = require('moment');


module.exports = function (sequelize) {
  _.extend(sequelize.Model.prototype, {
    addMeticNeedUpdateHook: function () {

      this.addHook('afterCreate', HookHandler);
      this.addHook('afterUpdate', HookHandler);
      this.addHook('afterDestroy', HookHandler);
      return this;
    },
  });

  function HookHandler (model, instance) {
    const getSprintIdsBinded = getSprintIds.bind(this);

    return getSprintIdsBinded(model, instance, sequelize)
      .then((sprintIds) => {
        if (sprintIds.length > 0) {
          sequelize.models.Sprint.update({ entitiesLastUpdate: moment() }, {
            where: { id: sprintIds },
          });
        }
      });
  }
};

/* Utils */
async function getSprintIds (model, instance, sequelize) {

  if (this.name === 'Sprint' && model.id) {
    return [model.id];
  }

  if (model.sprintId) {
    return [model.sprintId];
  }

  if ((this.name === 'Task' || this.name === 'Timesheet') && model.id) {
    return sequelize.models[this.name].findOne({
      attributes: ['sprintId'],
      where: {
        id: model.id,
      },
    })
      .then((row) => {
        return row && [row.sprintId] || [];
      });
  }

  if (this.name === 'TaskTasks' && model.linkedTaskId && model.taskId) {
    return sequelize.models.Task.findAll({
      attributes: ['sprintId'],
      where: {
        id: [model.linkedTaskId, model.taskId],
      },
    })
      .then((rows) => {
        return rows.map((row) => row.sprintId);
      });
  }

}
