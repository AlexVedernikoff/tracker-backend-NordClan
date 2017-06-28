module.exports = function(sequelize, DataTypes) {

	let Sprint = sequelize.define("Sprint", {
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
		tableName: 'sprints'
	});


	Sprint.associate = function(models) {

		Sprint.belongsTo(models.Project, {foreignKey: {
			name: 'projectId',
			field: 'project_id'
		}});

		Sprint.hasMany(models.Task, {foreignKey: {
			name: 'sprintId',
			field: 'sprint_id'
		}});

		Sprint.belongsToMany(models.Tag, {
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'sprint'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

		Sprint.belongsToMany(models.Tag, {
			as: 'tagForQuery',
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'sprint'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

	};

	return Sprint;
};





