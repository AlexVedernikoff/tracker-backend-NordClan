module.exports = function(sequelize, DataTypes) {

	const TaskStatuses = sequelize.define("TaskStatuses", {
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
		tableName: 'task_statuses'
	});

	TaskStatuses.values = [
		{id: 1, name: 'New'},
		{id: 2, name: 'Develop play'},
		{id: 3, name: 'Develop stop'},
		{id: 4, name: 'Code Review play'},
		{id: 5, name: 'Code Review stop'},
		{id: 6, name: 'QA play'},
		{id: 7, name: 'QA stop'},
		{id: 8, name: 'Done'},
		{id: 9, name: 'Canceled'},
	];

	return TaskStatuses;
};