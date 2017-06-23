module.exports = function(sequelize, DataTypes) {

	let Department = sequelize.define("Department", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		name: {
			type: DataTypes.TEXT,
			trim: true,
			allowNull: false
		},
		psId: {
			field: 'ps_id',
			trim: true,
			allowNull: false,
			type: DataTypes.TEXT
		},
		createdAt: {type: DataTypes.DATE, field: 'created_at'},
		updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
		deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
	}, {
		underscored: true,
		timestamps: true,
		paranoid: true,
		tableName: 'departments'
	});

	Department.associate = function(models) {
		Department.belongsToMany(models.User, { through: models.UserDepartments });
	};

	return Department;
};




