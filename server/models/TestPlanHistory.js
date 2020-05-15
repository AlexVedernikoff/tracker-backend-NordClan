module.exports = function (sequelize, DataTypes) {
  const TestPlanHistory = sequelize.define('TestPlanHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    testPlanId: {
      field: 'test_plan_id',
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
    tableName: 'test_plan_histories'
  });

  TestPlanHistory.associate = function (models) {
    TestPlanHistory.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      constraints: true
    });

    TestPlanHistory.belongsTo(models.TestPlan, {
      as: 'testPlanData',
      foreignKey: {
        name: 'testPlanId',
        field: 'test_plan_id'
      },
      constraints: true
    });

  };
  return TestPlanHistory;
};
