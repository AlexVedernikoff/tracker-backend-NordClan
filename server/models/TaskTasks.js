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
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'task_tasks'
  });
  
  
  TaskTasks.associate = function(models) {
    TaskTasks.belongsTo(models.Task,{
      as: 'task',
      foreignKey: {
        name: 'linkedTaskId',
        field: 'linked_task_id'
      }
    });
    
  };

  
  return TaskTasks;
};
