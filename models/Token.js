const Sequelize = require('sequelize');
const sequelize = require('../orm');
const User = require('./User');


const Token = sequelize.define("Token", {
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
	tableName: 'tokens'
});


module.exports = Token;
