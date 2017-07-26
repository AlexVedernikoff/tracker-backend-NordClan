const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function(sequelize, DataTypes) {
  const Project = sequelize.define('Project', {
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
      },
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
    finishedAt: {
      field: 'finished_at',
      type: DataTypes.DATE,
      defaultValue: null,
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'},

  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'projects',
    hooks: {
      afterFind: function(model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });

  Project.associate = function(models) {

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
    });

    Project.belongsToMany(models.User, {
      as: 'users',
      through: {
        as: 'projectUsers',
        model: models.ProjectUsers,
        unique: false,
      },
      foreignKey: 'project_id',
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
    
    Project.hasOne(models.ProjectUsers);
  
  
    Project.hasMany(models.ProjectAttachments, {
      as: 'attachments',
      foreignKey: 'project_id',
    });

  };

  return Project;
};


