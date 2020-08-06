module.exports = function (sequelize, DataTypes) {
  const ProjectEnvironmentTestPlan = sequelize.define(
    'ProjectEnvironmentTestPlan',
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
      testPlanId: {
        type: DataTypes.INTEGER,
        field: 'test_plan_id',
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
      tableName: 'project_environment_test_plan'
    }
  );

  ProjectEnvironmentTestPlan.associate = function (models) {
    models.TestPlan.belongsToMany(models.ProjectEnvironment, {
      through: ProjectEnvironmentTestPlan
    });

    models.ProjectEnvironment.belongsToMany(models.TestPlan, {
      through: ProjectEnvironmentTestPlan
    });
  };

  return ProjectEnvironmentTestPlan;
};
