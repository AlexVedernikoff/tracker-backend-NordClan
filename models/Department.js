const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
sequelizeTransforms(sequelize);

const Department = sequelize.define("Department", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	name: {
		type: Sequelize.TEXT,
		trim: true,
		allowNull: false
	},
	psId: {
		field: 'ps_id',
		trim: true,
		allowNull: false,
		type: Sequelize.TEXT
	},
	createdAt: {type: Sequelize.DATE, field: 'created_at'},
	updatedAt: {type: Sequelize.DATE, field: 'updated_at'},
	deletedAt: {type: Sequelize.DATE, field: 'deleted_at'}
}, {
	underscored: true,
	timestamps: true,
	paranoid: true,
	tableName: 'department'
});


module.exports = Department;
