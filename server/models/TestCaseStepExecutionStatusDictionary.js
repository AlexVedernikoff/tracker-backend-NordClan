module.exports = function (sequelize, DataTypes) {
  const TestCaseStepExecutionStatusDictionary = sequelize.define('TestCaseStepExecutionStatusDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    },
    nameEn: {
      field: 'name_en',
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'test_case_step_execution_status'
  });

  return TestCaseStepExecutionStatusDictionary;
};
