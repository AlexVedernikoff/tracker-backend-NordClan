module.exports = function(sequelize, DataTypes) {

	const ProjectUsers = sequelize.define("ProjectUsers", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: false,
			allowNull: false
		},
		projectId : {
			field: 'project_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: 'project_user_role_deleted',
		},
		userId : {
			field: 'user_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: 'project_user_role_deleted',
		},
		roleId : {
			field: 'role_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: 'project_user_role_deleted',
		},
		authorId : {
			field: 'author_id',
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		deletedAt: {
			type: DataTypes.DATE,
			field: 'deleted_at',
			unique: 'project_user_role_deleted',
		},
	}, {
		underscored: true,
		timestamps: false,
		paranoid: false,
		tableName: 'project_users',
	});

	return ProjectUsers;
};