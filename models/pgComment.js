const sequelize = require('../orm');
const Sequelize = require('sequelize');
const User = require('./pgUser');
const Task = require('./pgTask');

const Comment = sequelize.define('comments', {
    message: { type: Sequelize.STRING, allowNull: false }
  });

Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });

module.exports = Comment;
