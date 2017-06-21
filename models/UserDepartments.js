const Sequelize = require('sequelize');
const sequelize = require('../orm');
const Department = require('./Department');
const User = require('./User');

const UserDepartments = sequelize.define('UserDepartments', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	}
}, {
	underscored: true,
	timestamps: false,
	paranoid: false,
	tableName: 'user_departments'
});





module.exports = UserDepartments;