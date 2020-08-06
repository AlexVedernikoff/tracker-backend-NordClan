module.exports = function (sequelize, DataTypes) {
  const TestCase = sequelize.define(
    'TestCase',
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
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'status_id',
        validate: {
          isInt: true,
          min: 1,
          max: 3
        }
      },
      severityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'severity_id',
        validate: {
          isInt: true,
          min: 1,
          max: 7
        }
      },
      priority: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        validate: {
          isInt: true,
          min: 1,
          max: 5
        }
      },
      preConditions: {
        field: 'pre_conditions',
        type: DataTypes.TEXT,
        allowNull: true
      },
      postConditions: {
        field: 'post_conditions',
        type: DataTypes.TEXT,
        allowNull: true
      },
      projectId: {
        field: 'project_id',
        type: DataTypes.INTEGER,
        allowNull: true
      },
      duration: {
        type: DataTypes.TIME,
        allowNull: true
      },
      testSuiteId: {
        field: 'test_suite_id',
        type: DataTypes.INTEGER,
        allowNull: true
      },
      authorId: {
        field: 'author_id',
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'test_case'
    }
  );

  TestCase.associate = function (models) {
    TestCase.belongsTo(models.User, {
      as: 'authorInfo',
      foreignKey: {
        name: 'authorId',
        field: 'author_id'
      }
    });

    TestCase.belongsTo(models.TestSuite, {
      as: 'testSuiteInfo',
      foreignKey: {
        name: 'testSuiteId',
        field: 'test_suite_id',
        allowNull: false
      }
    });

    TestCase.belongsTo(models.TestCaseStatusesDictionary, {
      as: 'testCaseStatus',
      foreignKey: {
        name: 'statusId',
        field: 'status_id',
        allowNull: false
      }
    });

    TestCase.belongsTo(models.TestCaseSeverityDictionary, {
      as: 'testCaseSeverity',
      foreignKey: {
        name: 'severityId',
        field: 'severity_id',
        allowNull: false
      }
    });

    TestCase.hasMany(models.TestCaseSteps, {
      as: 'testCaseSteps',
      foreignKey: {
        name: 'testCaseId',
        field: 'test_case_id'
      }
    });

    TestCase.belongsTo(models.Project, {
      as: 'testCaseProject',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }
    });
  };

  TestCase.addHistoryForTestCase();

  return TestCase;
};
