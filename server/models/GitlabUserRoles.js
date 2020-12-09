const ACCESS_GUEST = 10;
const ACCESS_REPORTER = 20;
const ACCESS_DEVELOPER = 30;
const ACCESS_MAINTAINER = 40;
const ACCESS_OWNER = 50;
const validAccessLevels = [ACCESS_GUEST, ACCESS_DEVELOPER, ACCESS_REPORTER, ACCESS_MAINTAINER];
const projectUserRoleMapping = {
  1: ACCESS_REPORTER, // Account
  2: ACCESS_REPORTER, // PM
  3: ACCESS_REPORTER, // UX
  4: ACCESS_REPORTER, // Analyst
  5: ACCESS_DEVELOPER, // Back
  6: ACCESS_DEVELOPER, // Front
  7: ACCESS_DEVELOPER, // Mobile
  8: ACCESS_MAINTAINER, // TeamLead
  9: ACCESS_REPORTER, // QA
  10: ACCESS_GUEST, // Unbillable
  12: ACCESS_DEVELOPER, // Android
  13: ACCESS_DEVELOPER, // IOS
  14: ACCESS_MAINTAINER, // DevOps
  default: ACCESS_GUEST,
};

module.exports = function (sequelize, DataTypes) {
  const GitlabUserRoles = sequelize.define('GitlabUserRoles', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    accessLevel: {
      field: 'access_level',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        isIn: [validAccessLevels],
      },
    },
    expiresAt: {
      field: 'expires_at',
      type: DataTypes.DATE,
      allowNull: false,
    },
    projectUserId: {
      field: 'project_user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    gitlabProjectId: {
      field: 'gitlab_project_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: true,
    paranoid: false,
    tableName: 'gitlab_user_roles',
  });

  GitlabUserRoles.associate = function (models) {
    GitlabUserRoles.belongsTo(models.ProjectUsers, {
      as: 'projectUser',
      foreignKey: {
        name: 'projectUserId',
        field: 'project_user_id',
      },
    });
  };

  GitlabUserRoles.ACCESS_GUEST = ACCESS_GUEST;
  GitlabUserRoles.ACCESS_DEVELOPER = ACCESS_DEVELOPER;
  GitlabUserRoles.ACCESS_REPORTER = ACCESS_REPORTER;
  GitlabUserRoles.ACCESS_MAINTAINER = ACCESS_MAINTAINER;
  GitlabUserRoles.ACCESS_OWNER = ACCESS_OWNER;
  GitlabUserRoles.ACCESS_LEVELS = validAccessLevels;

  GitlabUserRoles.isRolesValid = function (roles) {
    return !roles || roles.every(({ accessLevel, gitlabProjectId }) => gitlabProjectId && ~validAccessLevels.indexOf(accessLevel));
  };

  GitlabUserRoles.fromProjectUserRole = (projectUserRoleIds, gitlabProjectIds) =>
    gitlabProjectIds.reduce((result, gitlabProjectId) => {
      const allRoles = projectUserRoleIds.map(
        projectUserRoleId =>
          ({
            gitlabProjectId,
            accessLevel: projectUserRoleMapping[projectUserRoleId] || projectUserRoleMapping.default,
          }),
        []
      );
      const highestRole = allRoles.reduce(
        (lastHighestRole, roleObject) =>
          (!lastHighestRole || lastHighestRole.accessLevel < roleObject.accessLevel) ? roleObject : lastHighestRole,
        null
      );
      result.push(highestRole);
      return result;
    }, []);

  return GitlabUserRoles;
};
