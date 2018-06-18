const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');
const ProjectHooks = require('../components/sequelizeHooks/project');

module.exports = function (sequelize, DataTypes) {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validate: {
        isInt: true
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
    description: {
      trim: true,
      type: DataTypes.TEXT,
      defaultValue: null
    },
    prefix: {
      type: DataTypes.STRING(8),
      unique: true,
      trim: true,
      allowNull: true,
      validate: {
        len: [1, 8]
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
    typeId: {
      field: 'type_id',
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
        max: 9
      }
    },
    notbillable: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
        isFloat: true
      }
    },
    riskBudget: {
      field: 'risk_budget',
      type: DataTypes.FLOAT,
      defaultValue: null,
      validate: {
        isFloat: true
      }
    },
    qaPercent: {
      field: 'qa_percent',
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false
    },
    portfolioId: {
      field: 'portfolio_id',
      type: DataTypes.INTEGER,
      defaultValue: null,
      validate: {
        isInt: true
      }
    },
    gitlabProjectIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      field: 'gitlab_project_ids',
      defaultValue: []
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    completedAt: {
      field: 'completed_at',
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBySystemUser: {
      field: 'created_by_system_user',
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}

  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'projects',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });

  Project.addHook('afterFind', ModelsHooks.deleteUnderscoredTimeStampsAttributes);
  Project.addHook('beforeUpdate', ProjectHooks.setCompletedAtIfNeed);

  Project.associate = function (models) {

    Project.belongsTo(models.Portfolio, {
      as: 'portfolio',
      foreignKey: {
        name: 'portfolioId',
        field: 'portfolio_id'
      }});

    Project.hasMany(models.Sprint, {foreignKey: {
      name: 'projectId',
      field: 'project_id'
    }});

    Project.hasMany(models.Milestone, {
      as: 'milestones',
      foreignKey: {
        name: 'projectId'
      }
    });

    Project.hasMany(models.Sprint, {
      as: 'sprints',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }});

    Project.hasMany(models.Sprint, {
      as: 'currentSprints',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }});

    Project.hasMany(models.Sprint, {
      as: 'sprintForQuery',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }});

    Project.hasMany(models.ItemTag, {
      as: 'itemTag',
      foreignKey: {
        name: 'taggableId',
        field: 'taggable_id'
      },
      scope: {
        taggable: 'project'
      }
    });

    Project.hasMany(models.ItemTag, {
      as: 'itemTagSelect',
      foreignKey: {
        name: 'taggableId',
        field: 'taggable_id'
      },
      scope: {
        taggable: 'project'
      }
    });

    Project.belongsToMany(models.Tag, {
      as: 'tags',
      through: {
        as: 'item_tag',
        model: models.ItemTag,
        scope: {
          taggable: 'project'
        }
      },
      foreignKey: 'taggable_id',
      otherKey: 'tag_id',
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

    Project.hasMany(models.ProjectUsers, {
      as: 'projectUsers',
      foreignKey: 'project_id'
    });


    Project.hasMany(models.ProjectAttachments, {
      as: 'attachments',
      foreignKey: 'project_id'
    });

  };

  Project.defaultSelect = [
    'id',
    'name',
    'description',
    'prefix',
    'statusId',
    'notbillable',
    'budget',
    'riskBudget',
    'portfolioId',
    'gitlabProjectIds',
    'authorId',
    'completedAt',
    'createdAt'
  ];

  Project.addHistoryForProject();

  return Project;
};
