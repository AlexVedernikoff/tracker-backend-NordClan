const ACCESS_GUEST = 10;
const ACCESS_DEVELOPER = 20;
const ACCESS_REPORTER = 30;
const ACCESS_MAINTAINER = 40;
const ACCESS_OWNER = 50;
const validAccessLevels = [ACCESS_GUEST, ACCESS_DEVELOPER, ACCESS_REPORTER, ACCESS_MAINTAINER];

module.exports = function (sequelize, DataTypes) {
  const GitlabUserRoles = sequelize.define('GitlabUserRoles', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    accessLevel: {
      field: 'access_level',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        isIn: [validAccessLevels]
      }
    },
    expiresAt: {
      field: 'expires_at',
      type: DataTypes.DATE,
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
    gitlabProjectId: {
      field: 'gitlab_project_id',
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
    tableName: 'gitlab_user_roles'
  });

  GitlabUserRoles.associate = function (models) {
    GitlabUserRoles.belongsTo(models.ProjectUsers, {
      as: 'projectUser',
      foreignKey: {
        name: 'projectUserId',
        field: 'project_user_id'
      }
    });
  };

  GitlabUserRoles.ACCESS_GUEST = ACCESS_GUEST;
  GitlabUserRoles.ACCESS_DEVELOPER = ACCESS_DEVELOPER;
  GitlabUserRoles.ACCESS_REPORTER = ACCESS_REPORTER;
  GitlabUserRoles.ACCESS_MAINTAINER = ACCESS_MAINTAINER;
  GitlabUserRoles.ACCESS_OWNER = ACCESS_OWNER;
  GitlabUserRoles.ACCESS_LEVELS = validAccessLevels;

  GitlabUserRoles.isRolesValid = function (roles) {
    return !roles || roles.every(({ accessLevel, expiresAt, projectId }) => projectId && expiresAt && ~validAccessLevels.indexOf(accessLevel));
  };

  return GitlabUserRoles;
};
