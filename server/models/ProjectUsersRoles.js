module.exports = function (sequelize, DataTypes) {
  const ProjectUsersRoles = sequelize.define('ProjectUsersRoles', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    projectUserId: {
      field: 'project_user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    projectRoleId: {
      field: 'project_role_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: true,
    tableName: 'project_users_roles'
  });

  ProjectUsersRoles.associate = function (models) {
    ProjectUsersRoles.belongsTo(models.ProjectUsers, {
      as: 'projectUser',
      foreignKey: {
        name: 'projectUserId',
        field: 'project_user_id'
      }
    });

    ProjectUsersRoles.belongsTo(models.ProjectRolesDictionary, {
      as: 'projectRole',
      foreignKey: {
        name: 'projectRoleId',
        field: 'project_role_id',
        allowNull: false
      }
    });
  };

  return ProjectUsersRoles;
};
