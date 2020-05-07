module.exports = function (sequelize, DataTypes) {
  const TestCaseSteps = sequelize.define('TestCaseSteps', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    testCaseId: {
      field: 'test_case_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expectedResult: {
      field: 'expected_result',
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'test_case_steps'
  });

  TestCaseSteps.associate = function (models) {
    TestCaseSteps.belongsTo(models.TestCase, {
      as: 'TestCaseData',
      foreignKey: {
        name: 'testCaseId',
        field: 'test_case_id'
      }
    });
  };

  return TestCaseSteps;
};
