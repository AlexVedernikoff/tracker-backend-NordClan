module.exports = function (sequelize, DataTypes) {
  const GitlabUserRoles = sequelize.define('GitlabUserRoles', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    roleId: {
      field: 'role_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    projectUserId: {
      field: 'project_user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false
    }
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    tableName: 'gitlab_users'
  });

  GitlabUserRoles.associate = function (models) {
    GitlabUserRoles.belongsTo(models.ProjectUsers, {
      as: 'projectUser',
      foreignKey: {
        name: 'projectUserId',
        field: 'project_user_id'
      }
    });

    GitlabUserRoles.belongsTo(models.GitlabRolesDictionary, {
      as: 'role',
      foreignKey: {
        name: 'roleId',
        field: 'role_id'
      }
    });
  };

  return GitlabUserRoles;
};
