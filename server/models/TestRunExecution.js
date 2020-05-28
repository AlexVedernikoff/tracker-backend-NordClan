module.exports = function (sequelize, DataTypes) {
  const TestRunExecution = sequelize.define(
    'TestRunExecution',
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
      testRunId: {
        type: DataTypes.INTEGER,
        field: 'test_run_id',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      projectId: {
        type: DataTypes.INTEGER,
        field: 'project_id',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      projectEnvironmentId: {
        type: DataTypes.INTEGER,
        field: 'project_environment_id',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      startedBy: {
        type: DataTypes.INTEGER,
        field: 'started_by',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      startTime: {
        type: DataTypes.DATE,
        field: 'start_time',
        allowNull: true
      },
      finishTime: {
        type: DataTypes.DATE,
        field: 'finish_time',
        allowNull: true
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      tableName: 'test_run_execution',
      paranoid: true,
      timestamps: true
    }
  );

  TestRunExecution.associate = function (models) {

    TestRunExecution.belongsTo(models.TestRun, {
      as: 'testRunInfo',
      foreignKey: {
        name: 'testRunId',
        field: 'test_run_id'
      }
    });

    TestRunExecution.belongsTo(models.Project, {
      as: 'projectInfo',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }
    });

    TestRunExecution.belongsTo(models.ProjectEnvironment, {
      as: 'projectEnvironmentInfo',
      foreignKey: {
        name: 'projectEnvironmentId',
        field: 'project_environment_id'
      }
    });

    TestRunExecution.belongsTo(models.User, {
      as: 'startedByUser',
      foreignKey: {
        name: 'startedBy',
        field: 'started_by'
      }
    });

    TestRunExecution.hasMany(models.TestCaseExecution, {
      as: 'testCaseExecutionData',
      foreignKey: {
        name: 'testRunExecutionId',
        field: 'test_run_execution_id'
      }
    });

  };

  return TestRunExecution;
};
