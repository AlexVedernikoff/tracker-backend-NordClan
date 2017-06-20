const Sequelize = require('sequelize');
const sequelize = require('../orm');
const User = require('./User');


const UserTokens = sequelize.define("UserTokens", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	token: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	expires: {
		type: Sequelize.DATE,
		defaultValue: null
	}
}, {
	underscored: true,
	timestamps: false,
	paranoid: false,
	tableName: 'user_tokens'
});


module.exports = UserTokens;
