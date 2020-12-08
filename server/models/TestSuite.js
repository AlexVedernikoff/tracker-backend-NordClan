const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const TestSuite = sequelize.define(
    'TestSuite',
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
      title: {
        type: DataTypes.STRING,
        trim: true,
        allowNull: false,
        validate: {
          len: [1, 255],
        },
      },
      projectId: {
        field: 'project_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      parentSuiteId: {
        field: 'parent_suite_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        trim: true,
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'test_suite',
    }
  );

  TestSuite.associate = function (models) {
    TestSuite.hasMany(models.TestCase, {
      as: 'testCases',
      foreignKey: {
        name: 'testSuiteId',
        field: 'test_suite_id',
      },
    });

    TestSuite.belongsTo(models.Project, {
      as: 'testSuiteProject',
      foreignKey: {
        name: 'projectId',
        field: 'project_id',
      },
    });

    TestSuite.belongsTo(TestSuite, {
      as: 'parentSuite',
      foreignKey: {
        name: 'testSuiteId',
        field: 'parent_suite_id',
      },
    });
  };

  TestSuite.addHistoryForTestSuite();

  return TestSuite;
};
