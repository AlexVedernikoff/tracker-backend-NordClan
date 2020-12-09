module.exports = function (sequelize, DataTypes) {
  const ProjectRoles = sequelize.define('ProjectRolesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(30),
      trim: true,
      allowNull: false,
    },
    nameEn: {
      field: 'name_en',
      type: DataTypes.STRING(30),
      trim: true,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['code'],
      },
    ],
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'project_roles',
  });

  ProjectRoles.ADMIN_IDS = [1, 2];
  ProjectRoles.MAINTAINER_IDS = [...ProjectRoles.ADMIN_IDS, 8];
  ProjectRoles.UNBILLABLE_ID = 2;
  ProjectRoles.UNBILLABLE_ID = 10;
  ProjectRoles.CUSTOMER_ID = 11;

  return ProjectRoles;

};
