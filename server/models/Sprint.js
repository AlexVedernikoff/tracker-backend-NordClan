const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const Sprint = sequelize.define('Sprint', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    statusId: {
      field: 'status_id',
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        isInt: true,
        min: 0,
        max: 9,
      },
    },
    factStartDate: {
      field: 'fact_start_date',
      type: DataTypes.DATEONLY,
      defaultValue: null,
      validate: {
        isDate: true,
      },
    },
    factFinishDate: {
      field: 'fact_finish_date',
      type: DataTypes.DATEONLY,
      defaultValue: null,
      validate: {
        isDate: true,
      },
    },
    allottedTime: {
      field: 'allotted_time',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: null,
      validate: {
        isFloat: true,
      },
    },
    qaPercent: {
      field: 'qa_percent',
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: null,
      validate: {
        isFloat: true,
      },
    },
    riskBudget: {
      field: 'risk_budget',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: null,
      validate: {
        isFloat: true,
      },
    },
    externalId: {
      field: 'external_id',
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    entitiesLastUpdate: { // see hook server/components/metricNeedUpdateHook.js
      field: 'entities_last_update',
      type: DataTypes.DATE,
      allowNull: true,
    },
    metricLastUpdate: { // need for optimize calc metric
      field: 'metric_last_update',
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'},
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'sprints',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      },
    },

  });

  Sprint.associate = function (models) {
    Sprint.belongsTo(models.Project, {foreignKey: {
      name: 'projectId',
      field: 'project_id',
    }});

    Sprint.hasMany(models.Task, {
      as: 'tasks',
      foreignKey: {
        name: 'sprintId',
        field: 'sprint_id',
      },
    });

    Sprint.belongsToMany(models.Tag, {
      as: 'tags',
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'sprint',
        },
      },
      foreignKey: 'taggable_id',
      constraints: false,
    });

    Sprint.belongsToMany(models.Tag, {
      as: 'tagForQuery',
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'sprint',
        },
      },
      foreignKey: 'taggable_id',
      constraints: false,
    });

  };

  Sprint.defaultSelect = ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', /*'allottedTime', DEPRECATED*/ 'budget', 'riskBudget'];

  Sprint.addHistoryForProject();
  Sprint.addMeticNeedUpdateHook();

  return Sprint;
};
