const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const TestRunTestCases = sequelize.define(
    'TestRunTestCases',
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
      testRunId: {
        field: 'test_run_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      testCaseId: {
        field: 'test_case_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      assignedTo: {
        field: 'assigned_to',
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: true,
        },
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' },
    },
    {
      tableName: 'test_run_test_cases',
      timestamps: true,
      paranoid: true,
      underscored: true,
      hooks: {
        afterFind: function (model) {
          ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
        },
      },
    }
  );

  TestRunTestCases.associate = function (models) {
    // models.TestPlan.belongsToMany(models.TestCase, {
    //   through: { model: TestPlanTestCases },
    //   as: 'testCaseData',
    //   foreignKey: {
    //     name: 'testPlanId',
    //     field: 'test_plan_id'
    //   }
    // });

    // models.TestCase.belongsToMany(models.TestPlan, {
    //   through: { model: TestPlanTestCases },
    //   as: 'testPlanData',
    //   foreignKey: {
    //     name: 'testCaseId',
    //     field: 'test_case_id'
    //   }
    // });

    TestRunTestCases.belongsTo(models.User, {
      foreignKey: {
        name: 'assignedTo',
        field: 'assigned_to',
      },
      as: 'assignedUser',
    });

    TestRunTestCases.belongsTo(models.TestCase, {
      foreignKey: {
        name: 'testCaseId',
        field: 'test_case_id',
      },
      as: 'testCaseInfo',
    });

    TestRunTestCases.belongsTo(models.TestRun, {
      foreignKey: {
        name: 'testRunId',
        field: 'test_run_id',
      },
      as: 'testRunInfo',
    });
  };

  return TestRunTestCases;
};
