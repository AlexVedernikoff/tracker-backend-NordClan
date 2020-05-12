module.exports = function (sequelize, DataTypes) {
  const TestPlan = sequelize.define(
    'TestPlan',
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
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'test_plan'
    }
  );

  TestPlan.associate = function (models) {
    TestPlan.hasMany(models.TestPlanTestCases, {
      as: 'testPlanTestCases',
      foreignKey: {
        name: 'testPlanId',
        field: 'test_plan_id'
      }
    });
  };

  return TestPlan;
};
