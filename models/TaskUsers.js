module.exports = function(sequelize, DataTypes) {

	const TaskUsers = sequelize.define("TaskUsers", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		taskId : {
			field: 'task_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isInt: true,
			}
		},
		userId : {
			field: 'user_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isInt: true,
			},
		},
		authorId : {
			field: 'author_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isInt: true,
			}
		},
		deletedAt: {
			type: DataTypes.DATE,
			field: 'deleted_at',
		},
	}, {
		underscored: true,
		timestamps: true,
		updatedAt: false,
		paranoid: true,
		tableName: 'task_users',
	});

	TaskUsers.associate = function(models) {

		TaskUsers.belongsTo(models.User, {
			as: 'user',
			foreignKey: {
				name: 'userId',
				field: 'user_id'
			}});

		TaskUsers.belongsTo(models.Task, {
			as: 'task',
			foreignKey: {
				name: 'taskId',
				field: 'task_id'
			}});

	};

	return TaskUsers;
};