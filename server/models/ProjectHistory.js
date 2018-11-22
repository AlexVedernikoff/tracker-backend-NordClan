module.exports = function (sequelize, DataTypes) {
  const ProjectHistory = sequelize.define('ProjectHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      field: 'entity_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    field: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prevValueStr: {
      field: 'prev_value_str',
      type: DataTypes.STRING,
      allowNull: true
    },
    valueStr: {
      field: 'value_str',
      type: DataTypes.STRING,
      allowNull: true
    },
    prevValueInt: {
      field: 'prev_value_int',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valueInt: {
      field: 'value_int',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prevValueDate: {
      field: 'prev_value_date',
      type: DataTypes.DATE,
      allowNull: true
    },
    valueDate: {
      field: 'value_date',
      type: DataTypes.DATE,
      allowNull: true
    },
    prevValueFloat: {
      field: 'prev_value_float',
      type: DataTypes.FLOAT,
      allowNull: true
    },
    valueFloat: {
      field: 'value_float',
      type: DataTypes.FLOAT,
      allowNull: true
    },
    prevValueText: {
      field: 'prev_value_text',
      type: DataTypes.TEXT,
      allowNull: true
    },
    valueText: {
      field: 'value_text',
      type: DataTypes.TEXT,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    tableName: 'project_histories'
  });

  ProjectHistory.associate = function(models) {
    ProjectHistory.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      constraints: true,
    });

    ProjectHistory.belongsTo(models.ProjectUsers, {
      as: 'project_user',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: true,
    });

    ProjectHistory.belongsTo(models.Sprint, {
      as: 'sprint',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });

    ProjectHistory.belongsTo(models.ItemTag, {
      as: 'itemTag',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });

    ProjectHistory.belongsTo(models.Portfolio, {
      as: 'portfolio',
      foreignKey: {
        name: 'valueInt',
        field: 'value_int'
      },
      constraints: true,
    });
  };

  return ProjectHistory;
};
