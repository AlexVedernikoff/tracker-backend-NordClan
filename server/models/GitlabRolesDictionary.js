module.exports = function (sequelize, DataTypes) {
  const GitlabRoles = sequelize.define('GitlabRolesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    },
    codeName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'code_name'
    },
    accessLevel: {
      type: DataTypes.INTEGER,
      field: 'access_level'
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'gitlab_roles'
  });


  GitlabRoles.associate = function (models) {
    GitlabRoles.hasMany(models.GitlabUserRoles, {
      as: 'gitlabRoles',
      foreignKey: {
        name: 'roleId',
        field: 'role_id'
      }});
  };

  GitlabRoles.ACCESS_GUEST = 10;
  GitlabRoles.ACCESS_DEVELOPER = 20;
  GitlabRoles.ACCESS_REPORTER = 30;
  GitlabRoles.ACCESS_MAINTAINER = 40;
  GitlabRoles.ACCESS_OWNER = 50;

  return GitlabRoles;
};
