module.exports = function (sequelize, DataTypes) {
  const TestRunHistory = sequelize.define('TestRunHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    testRunId: {
      field: 'test_run_id',
      type: DataTypes.INTEGER,
      allowNull: false
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
    prevValueTime: {
      field: 'prev_value_time',
      type: DataTypes.TIME,
      allowNull: true
    },
    valueTime: {
      field: 'value_time',
      type: DataTypes.TIME,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' }
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    tableName: 'test_run_histories'
  });

  TestRunHistory.associate = function (models) {
    TestRunHistory.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      constraints: true
    });

    TestRunHistory.belongsTo(models.TestRun, {
      as: 'testRunnData',
      foreignKey: {
        name: 'testRunId',
        field: 'test_run_id'
      },
      constraints: true
    });

  };
  return TestRunHistory;
};
