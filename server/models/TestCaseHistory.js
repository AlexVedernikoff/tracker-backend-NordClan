module.exports = function (sequelize, DataTypes) {
  const TestCaseHistory = sequelize.define('TestCaseHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    testCaseId: {
      field: 'test_case_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    field: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prevValueStr: {
      field: 'prev_value_str',
      type: DataTypes.STRING,
      allowNull: true,
    },
    valueStr: {
      field: 'value_str',
      type: DataTypes.STRING,
      allowNull: true,
    },
    prevValueInt: {
      field: 'prev_value_int',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    valueInt: {
      field: 'value_int',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prevValueDate: {
      field: 'prev_value_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
    valueDate: {
      field: 'value_date',
      type: DataTypes.DATE,
      allowNull: true,
    },
    prevValueTime: {
      field: 'prev_value_time',
      type: DataTypes.TIME,
      allowNull: true,
    },
    valueTime: {
      field: 'value_time',
      type: DataTypes.TIME,
      allowNull: true,
    },
    prevValueText: {
      field: 'prev_value_text',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valueText: {
      field: 'value_text',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    tableName: 'test_case_histories',
  });

  TestCaseHistory.associate = function (models) {
    TestCaseHistory.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
      },
      constraints: true,
    });

    TestCaseHistory.belongsTo(models.TestCase, {
      as: 'testCaseData',
      foreignKey: {
        name: 'testCaseId',
        field: 'test_case_id',
      },
      constraints: true,
    });

  };
  return TestCaseHistory;
};
