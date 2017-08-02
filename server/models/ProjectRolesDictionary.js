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
    {id: 1, code: 'dev', name: 'Develop'},
    {id: 2, code: 'back', name: 'Back'},
    {id: 3, code: 'front', name: 'Front'},
    {id: 4, code: 'review', name: 'Code Review'},
    {id: 5, code: 'qa', name: 'QA'},
    {id: 10, code: 'unbillable', name: 'Unbillable'},
  ];

  return ProjectRoles;
};