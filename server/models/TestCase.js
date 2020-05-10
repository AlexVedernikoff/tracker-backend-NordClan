const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');
const createError = require('http-errors');

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
      status: {
        type: DataTypes.ENUM('draft', 'needs work', 'actual'),
        allowNull: true
      },
      severity: {
        type: DataTypes.ENUM('not set', 'blocker', 'critical', 'major', 'normal', 'minor', 'trivial'),
        allowNull: true
      },
      priority: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        validate: {
          isInt: true
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
      expectedResult: {
        field: 'expected_result',
        type: DataTypes.TEXT,
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
      underscored: true,
      tableName: 'test_case',
      hooks: {
        afterFind: function (model) {
          ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
        }
      }
    }
  );

  TestCase.associate = function (models) {
    TestCase.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'authorId',
        field: 'author_id'
      }
    });

    TestCase.belongsTo(models.TestSuite, {
      as: 'testSuite',
      foreignKey: {
        name: 'testSuiteId',
        field: 'test_suite_id',
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
  };
  return TestCase;
};
