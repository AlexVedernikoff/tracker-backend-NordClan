module.exports = function (sequelize, DataTypes) {
  const GitlabUsers = sequelize.define('GitlabUsers', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    roleId: {
      field: 'role_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    userId: {
      field: 'user_id',
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

  GitlabUsers.associate = function (models) {
    GitlabUsers.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });

    GitlabUsers.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }
    });

    GitlabUsers.belongsTo(models.GitlabRolesDictionary, {
      as: 'role',
      foreignKey: {
        name: 'roleId',
        field: 'role_id'
      }
    });
  };

  //todo: нужно ли это?
  GitlabUsers.addHistoryForProject();

  return GitlabUsers;
};
