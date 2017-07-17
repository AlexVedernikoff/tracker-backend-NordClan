module.exports = function(sequelize, DataTypes) {
  const ProjectRoles = sequelize.define('ProjectRolesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
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
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'project_roles'
  });

  ProjectRoles.values = [
    {id: 1, name: 'Develop'},
    {id: 2, name: 'Back'},
    {id: 3, name: 'Front'},
    {id: 4, name: 'Code Review'},
    {id: 5, name: 'QA'},
    {id: 10, name: 'Unbillable'},
  ];

  return ProjectRoles;
};