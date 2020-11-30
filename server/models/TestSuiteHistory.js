module.exports = function (sequelize, DataTypes) {
  const TestSuiteHistory = sequelize.define('TestSuiteHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    testSuiteId: {
      field: 'test_suite_id',
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
    tableName: 'test_suite_histories'
  });

  TestSuiteHistory.associate = function (models) {
    TestSuiteHistory.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      constraints: true
    });

    TestSuiteHistory.belongsTo(models.TestSuite, {
      as: 'testSuiteData',
      foreignKey: {
        name: 'testSuiteId',
        field: 'test_suite_id'
      },
      constraints: true
    });

  };
  return TestSuiteHistory;
};
