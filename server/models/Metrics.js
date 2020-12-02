module.exports = function (sequelize, DataTypes) {
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
      type: DataTypes.TEXT
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE
    },
    projectId: {
      field: 'project_id',
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
    timestamps: false,
    paranoid: true,
    tableName: 'metrics'
  });

  Metrics.associate = function (models) {

    Metrics.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }
    });

    Metrics.belongsTo(models.Sprint, {
      as: 'sprint',
      foreignKey: {
        name: 'sprintId',
        field: 'sprint_id'
      }
    });

    Metrics.belongsTo(models.User, {
      as: 'user',
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
    'createdAt',
    'projectId',
    'sprintId',
    'userId'
  ];

  return Metrics;
};
