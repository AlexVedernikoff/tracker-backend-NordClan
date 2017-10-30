module.exports = function(sequelize, DataTypes) {
  const ProjectRoles = sequelize.define('ProjectRolesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false
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
  }, {
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
    ],
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
    {id: 9, code: 'qa', name: 'QA'},
    {id: 10, code: 'unbillable', name: 'Unbillable'},
  ];

  ProjectRoles.ADMIN_IDS = [1,2];
  ProjectRoles.UNBILLABLE_ID = 2;
  ProjectRoles.UNBILLABLE_ID = 10;
  return ProjectRoles;
};