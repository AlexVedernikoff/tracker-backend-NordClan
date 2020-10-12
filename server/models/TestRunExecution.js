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
      title: {
        type: DataTypes.STRING,
        trim: true,
        allowNull: false,
        validate: {
          len: [1, 255]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        trim: true
      },
      testRunId: {
        type: DataTypes.INTEGER,
        field: 'test_run_id',
        allowNull: true,
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
        allowNull: true
      },
      startedBy: {
        type: DataTypes.INTEGER,
        field: 'started_by',
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      executor: {
        type: DataTypes.INTEGER,
        field: 'executor_id',
        allowNull: true
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

    TestRunExecution.belongsTo(models.User, {
      as: 'executorUser',
      foreignKey: {
        name: 'executor',
        field: 'executor_id'
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
