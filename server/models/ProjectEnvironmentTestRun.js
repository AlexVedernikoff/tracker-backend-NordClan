module.exports = function (sequelize, DataTypes) {
  const ProjectEnvironmentTestRun = sequelize.define(
    'ProjectEnvironmentTestRun',
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
      projectEnvironmentId: {
        type: DataTypes.INTEGER,
        field: 'project_environment_id',
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
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      timestamps: true,
      paranoid: true,
      underscored: true,
      tableName: 'project_environment_test_run'
    }
  );

  ProjectEnvironmentTestRun.associate = function (models) {
    models.TestRun.belongsToMany(models.ProjectEnvironment, {
      through: { model: ProjectEnvironmentTestRun },
      as: 'testRunEnvironments',
      foreignKey: {
        name: 'testRunId',
        field: 'test_run_id'
      }
    });

    models.ProjectEnvironment.belongsToMany(models.TestRun, {
      as: 'projectEnvorinmentTestRuns',
      through: ProjectEnvironmentTestRun,
      foreignKey: {
        name: 'projectEnvironmentId',
        field: 'project_environment_id'
      }
    });
  };

  return ProjectEnvironmentTestRun;
};
