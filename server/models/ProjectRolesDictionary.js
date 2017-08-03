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
    {id: 1, code: 'account', name: 'Account'},
    {id: 2, code: 'pm', name: 'PM'},
    {id: 3, code: 'ux', name: 'UX'},
    {id: 4, code: 'analyst', name: 'Аналитик'},
    {id: 5, code: 'back', name: 'Back'},
    {id: 6, code: 'front', name: 'Front'},
    {id: 7, code: 'mobile', name: 'Mobile'},
    {id: 8, code: 'teamLead', name: 'TeamLead(Code review)'},
    {id: 10, code: 'unbillable', name: 'Unbillable'},
  ];

  return ProjectRoles;
};