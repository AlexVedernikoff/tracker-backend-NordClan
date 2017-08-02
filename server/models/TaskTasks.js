const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function(sequelize, DataTypes) {
  const TaskTasks = sequelize.define('TaskTasks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    linkedTaskId: {
      field: 'linked_task_id',
      type: DataTypes.INTEGER,
    },
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
    },
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'},
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: 'task_tasks',
    hooks: {
      afterFind: function(model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      },
    }
  });
  
  
  TaskTasks.associate = function(models) {
    TaskTasks.belongsTo(models.Task,{
      as: 'task',
      foreignKey: {
        name: 'linkedTaskId',
        field: 'linked_task_id'
      },
    });
    
  };
  
  TaskTasks.hasHistory();
  
  return TaskTasks;
};
