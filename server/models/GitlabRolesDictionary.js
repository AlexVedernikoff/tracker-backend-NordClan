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
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'gitlab_roles'
  });


  GitlabRoles.associate = function (models) {
    GitlabRoles.hasMany(models.GitlabUsers, {
      as: 'gitlabRoles',
      foreignKey: {
        name: 'roleId',
        field: 'role_id'
      }});
  };

  GitlabRoles.GUEST = 1;
  GitlabRoles.DEVELOPER = 2;
  GitlabRoles.REPORTER = 3;
  GitlabRoles.MAINTAINER = 4;

  return GitlabRoles;
};
