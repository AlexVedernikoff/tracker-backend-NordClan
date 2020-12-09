module.exports = function (sequelize, DataTypes) {
  const TestCaseExecution = sequelize.define(
    'TestCaseExecution',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      testRunExecutionId: {
        type: DataTypes.INTEGER,
        field: 'test_run_execution_id',
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      testCaseId: {
        type: DataTypes.INTEGER,
        field: 'test_case_id',
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: true,
        },
      },
      whoClosed: {
        type: DataTypes.INTEGER,
        field: 'who_closed',
        allowNull: true,
        validate: {
          isInt: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isIssueCreated: {
        type: DataTypes.BOOLEAN,
        field: 'is_issue_created',
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' },
    },
    {
      tableName: 'test_case_execution',
      paranoid: true,
      timestamps: true,
      underscored: true,
    }
  );

  TestCaseExecution.associate = function (models) {

    TestCaseExecution.belongsTo(models.TestCase, {
      as: 'testCaseInfo',
      foreignKey: {
        name: 'testCaseId',
        field: 'test_case_id',
      },
    });

    TestCaseExecution.belongsTo(models.TestRunExecution, {
      as: 'testRunExecutionInfo',
      foreignKey: {
        name: 'testRunExecutionId',
        field: 'test_run_execution_id',
      },
    });

    TestCaseExecution.hasMany(models.TestStepExecution, {
      as: 'testStepExecutionData',
      foreignKey: {
        name: 'testCaseExecutionId',
        field: 'test_case_execution_id',
      },
      onDelete: 'CASCADE',
    });

    TestCaseExecution.belongsTo(models.TestCaseStepExecutionStatusDictionary, {
      as: 'testCaseStatus',
      foreignKey: 'status',
    });

    TestCaseExecution.hasMany(models.TestCaseExecutionAttachments, {
      as: 'attachments',
      foreignKey: {
        name: 'testCaseExecutionId',
        field: 'test_case_execution_id',
      },
    });

    TestCaseExecution.belongsTo(models.User, {
      as: 'closedUserInfo',
      foreignKey: 'who_closed',
    });


  };

  return TestCaseExecution;
};
