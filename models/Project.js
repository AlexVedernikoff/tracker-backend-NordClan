module.exports = function(sequelize, DataTypes) {

	let Project = sequelize.define("Project", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
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
			type: DataTypes.TEXT,
			defaultValue: null
		},
		prefix: {
			type: DataTypes.STRING(30),
			trim: true,
			allowNull: true,
			validate: {
				len: [1, 30]
			}
		},
		statusId: {
			field: 'status_id',
			type: DataTypes.INTEGER,
			defaultValue: 0,
			validate: {
				isInt: true,
				min: 0,
				max: 9
			}
		},
		typeId: {
			field: 'type_id',
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isInt: true
			}
		},
		notbillable: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			validate: {
				isInt: true,
				min: 0,
				max: 1
			}
		},
		budget: {
			type: DataTypes.FLOAT,
			defaultValue: null,
			validate: {
				isNumeric: true
			}
		},
		riskBudget: {
			field: 'risk_budget',
			type: DataTypes.FLOAT,
			defaultValue: null,
			validate: {
				isNumeric: true
			}
		},
		plannedStartDate: {
			field: 'planned_start_date',
			type: DataTypes.DATE,
			defaultValue: null,
			validate: {
				isDate: true,
			}
		},
		plannedFinishDate: {
			field: 'planned_finish_date',
			type: DataTypes.DATE,
			defaultValue: null,
			validate: {
				isDate: true,
			}
		},
		factStartDate: {
			field: 'fact_start_date',
			type: DataTypes.DATE,
			defaultValue: null,
			validate: {
				isDate: true,
			}
		},
		factFinishDate: {
			field: 'fact_finish_date',
			type: DataTypes.DATE,
			defaultValue: null,
			validate: {
				isDate: true,
			}
		},
		attaches: {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			defaultValue: null,
			validate: {
				notEmpty: true, // не пустая строка
			}
		},
		portfolioId: {
			field: 'portfolio_id',
			type: DataTypes.INTEGER,
			defaultValue: null,
			validate: {
				isInt: true
			}
		},
		authorId: {
			field: 'author_id',
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		createdAt: {type: DataTypes.DATE, field: 'created_at'},
		updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
		deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}

	}, {
		underscored: true,
		timestamps: true,
		paranoid: true,
		tableName: 'projects'
	});


	Project.associate = function(models) {

		Project.belongsTo(models.Portfolio, {foreignKey: {
			name: 'portfolioId',
			field: 'portfolio_id'
		}});

		Project.hasMany(models.Sprint, {foreignKey: {
			name: 'projectId',
			field: 'project_id'
		}});

		Project.belongsToMany(models.Tag, {
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'project'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

		Project.belongsToMany(models.Tag, {
			as: 'tagForQuery',
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'project'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

	};

	return Project;
};



