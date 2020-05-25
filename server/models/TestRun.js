module.exports = function (sequelize, DataTypes) {
  const TestRun = sequelize.define(
    'TestRun',
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
      runtime: {
        type: DataTypes.TIME,
        allowNull: true
      },
      projectId: {
        type: DataTypes.INTEGER,
        field: 'project_id',
        allowNull: false
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'test_run'
    }
  );

  TestRun.associate = function (models) {
    TestRun.hasMany(models.TestRunTestCases, {
      as: 'testRunTestCases',
      foreignKey: {
        name: 'testRunId',
        field: 'test_run_id'
      }
    });
  };

  TestRun.addHistoryForTestRun();

  return TestRun;
};
