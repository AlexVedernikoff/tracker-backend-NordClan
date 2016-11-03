const sequelize = require('../orm');
const Sequelize = require('sequelize');
const TaskStatus = require('./pgTaskStatus');
const TaskPriority = require('./pgTaskPriority');
const TaskType = require('./pgTaskType');
const User = require('./pgUser');
const Project = require('./pgProject');

const Task = sequelize.define('tasks', {
    name: { type: Sequelize.STRING, allowNull: false },
    planned_time: Sequelize.DATE,
    fact_time: Sequelize.DATE
  });

Task.belongsTo(TaskStatus, { foreignKey: 'status_id' });
Task.belongsTo(TaskPriority, { foreignKey: 'priority_id' });
Task.belongsTo(TaskType, { foreignKey: 'type_id' });
Task.belongsTo(User, { foreignKey: 'owner_id' });
Task.belongsTo(User, { foreignKey: 'author_id' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

module.exports = Task;
