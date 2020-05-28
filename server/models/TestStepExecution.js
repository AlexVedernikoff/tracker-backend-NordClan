module.exports = function (sequelize, DataTypes) {
  const TestStepExecution = sequelize.define(
    'TestStepExecution',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      testCaseExecutionId: {
        type: DataTypes.INTEGER,
        field: 'test_case_execution_id',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      testStepId: {
        type: DataTypes.INTEGER,
        field: 'test_step_id',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      tableName: 'test_step_execution',
      paranoid: true,
      timestamps: true,
      underscored: true
    }
  );

  TestStepExecution.associate = function (models) {

    TestStepExecution.belongsTo(models.TestCaseExecution, {
      as: 'TestCaseExecutionInfo',
      foreignKey: {
        name: 'testCaseExecutionId',
        field: 'test_case_execution_id'
      }
    });

    TestStepExecution.belongsTo(models.TestCaseSteps, {
      as: 'testStepInfo',
      foreignKey: {
        name: 'testStepId',
        field: 'test_step_id'
      }
    });

    TestStepExecution.belongsTo(models.TestCaseStepExecutionStatusDictionary, {
      as: 'testStepStatus',
      foreignKey: 'status'
    });

    TestStepExecution.hasMany(models.TestStepExecutionAttachments, {
      as: 'attachments',
      foreignKey: {
        name: 'testStepExecutionId',
        field: 'test_step_execution_id'
      }
    });

  };

  return TestStepExecution;
};
