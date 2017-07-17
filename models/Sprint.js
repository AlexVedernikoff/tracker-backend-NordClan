const ModelsHooks = require('../components/ModelsHooks');

module.exports = function(sequelize, DataTypes) {
	let Sprint = sequelize.define("Sprint", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			validate: {
				isInt: true,
			}
		},
		name: {
			type: DataTypes.STRING,
			trim: true,
			allowNull: false,
			validate: {
				len: [1, 255]
			}
		},
		statusId: {
			field: 'status_id',
			type: DataTypes.INTEGER,
			defaultValue: 1,
			validate: {
				isInt: true,
				min: 0,
				max: 9
			}
		},
		factStartDate: {
			field: 'fact_start_date',
			type: DataTypes.DATEONLY,
			defaultValue: null,
			validate: {
				isDate: true,
			}
		},
		factFinishDate: {
			field: 'fact_finish_date',
			type: DataTypes.DATEONLY,
			defaultValue: null,
			validate: {
				isDate: true,
			}
		},
		allottedTime: {
			field: 'allotted_time',
			type: DataTypes.FLOAT,
			defaultValue: null,
			validate: {
				isNumeric: true
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
		tableName: 'sprints',
    hooks: {
      afterFind: function(model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }

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
			as: 'tags',
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





