module.exports = function(sequelize, DataTypes) {
	const Metrics = sequelize.define('Metrics', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			validate: {
				isInt: true
			}
		},
		typeId: {
			field: 'type_id',
			type: DataTypes.INTEGER
		},
		value: {
			type: DataTypes.STRING,
			trim: true,
			allowNull: false,
			validate: {
				len: [1, 255]
			}
		},
		date: {
			type: DataTypes.DATE
		},
		projectId: {
			field: 'project_id',
			type: DataTypes.INTEGER
		},
		projectRoleId: {
			field: 'project_role_id',
			type: DataTypes.INTEGER
		},
		sprintId: {
			field: 'sprint_id',
			type: DataTypes.INTEGER
		},
		userId: {
			field: 'user_id',
			type: DataTypes.INTEGER
		}
	}, {
		underscored: true,
		timestamps: true,
		paranoid: true,
		tableName: 'metrics',
		hooks: {
		  afterFind: function (model) {
			ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
		  }
		}
	});

	Metrics.associate = function (models) {

		Metrics.belongsTo(models.Project, {
			as: 'project',
			foreignKey: {
				name: 'projectId',
				field: 'project_id'
			}
		});

		Metrics.belongsTo(models.ProjectRolesDictionary, {
			as: 'projectRole',
			foreignKey: {
				name: 'projectRoleId',
				field: 'project_role_id'
			}
		});

		Metrics.belongsTo(models.Sprint, {
			as: 'sprint',
			foreignKey: {
				name: 'sprintId',
				field: 'sprint_id'
			}
		});

		Metrics.belongsTo(models.ProjectUsers, {
			as: 'projectUsers',
			foreignKey: {
				name: 'userId',
				field: 'user_id'
			}
		});

	};

	Metrics.defaultSelect = [
		'id',
		'typeId',
		'value',
		'date',
		'projectId',
		'projectRoleId',
		'sprintId',
		'userId'
	];

	return Metrics;
};