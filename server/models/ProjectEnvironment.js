module.exports = function (sequelize, DataTypes) {
  const ProjectEnvironment = sequelize.define(
    'ProjectEnvironment',
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        trim: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        field: 'project_id',
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'project_environment',
    }
  );

  ProjectEnvironment.associate = function (models) {
    ProjectEnvironment.belongsTo(models.Project, {
      as: 'projectInfo',
      foreignKey: {
        name: 'projectId',
        field: 'project_id',
      },
    });
  };

  return ProjectEnvironment;
};
