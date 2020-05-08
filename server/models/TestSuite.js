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
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      timestamps: true,
      paranoid: true,
      underscored: true,
      tableName: 'test_suite',
      hooks: {
        afterFind: function (model) {
          ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
        }
      }
    }
  );

  TestSuite.associate = function (models) {
    TestSuite.hasMany(models.TestCase, {
      as: 'testCases',
      foreignKey: {
        name: 'testSuiteId',
        field: 'test_suite_id'
      }
    });
  };

  return TestSuite;
};
