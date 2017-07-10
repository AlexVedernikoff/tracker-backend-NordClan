module.exports = function(sequelize, DataTypes) {

	 const ProjectStatuses = sequelize.define("ProjectStatuses", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: false,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(20),
			trim: true,
			allowNull: false,
			validate: {
				len: [1, 20]
			}
		},
	}, {
		underscored: true,
		timestamps: false,
		paranoid: false,
		tableName: 'project_statuses'
	});

	ProjectStatuses.values = [
		{id: 1, name: 'В процессе'},
		{id: 2, name: 'Приостановлен'},
		{id: 3, name: 'Завершен'},
	];

	return ProjectStatuses;
};