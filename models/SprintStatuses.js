module.exports = function(sequelize, DataTypes) {

	const SprintStatuses = sequelize.define("SprintStatuses", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
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
		tableName: 'sprint_statuses'
	});

	SprintStatuses.values = [
		{id: 1, name: 'Новый'},
		{id: 2, name: 'В процессе'},
		{id: 3, name: 'Завершен'},
	];

	return SprintStatuses;
};