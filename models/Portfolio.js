const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
sequelizeTransforms(sequelize);

const Portfolio = sequelize.define("Project", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	name: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: false,
		validate: {
			max: {
				args: 255,
				msg: 'Name must be less than 255 characters.'
			}
		}
	},
	description: {
		trim: true,
		type: Sequelize.TEXT,
		defaultValue: null
	},
}, {
	paranoid: false,
	underscored: true,
	tableName: 'portfolios'
});


module.exports = Portfolio;
