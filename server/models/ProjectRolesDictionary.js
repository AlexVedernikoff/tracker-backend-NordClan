module.exports = function (sequelize, DataTypes) {
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
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(30),
      trim: true,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['code']
      }
    ],
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'project_roles'
  });

  ProjectRoles.ADMIN_IDS = [1, 2];
  ProjectRoles.UNBILLABLE_ID = 2;
  ProjectRoles.UNBILLABLE_ID = 10;
  ProjectRoles.CUSTOMER_ID = 11;

  ProjectRoles.values = [
    {id: 1, name: 'Account', nameEn: 'Account'},
    {id: 2, name: 'PM', nameEn: 'PM'},
    {id: 3, name: 'UX', nameEn: 'UX'},
    {id: 4, name: 'Аналитик', nameEn: 'Аналитик'},
    {id: 5, name: 'Back', nameEn: 'Back'},
    {id: 6, name: 'Front', nameEn: 'Front'},
    {id: 7, name: 'Mobile', nameEn: 'Mobile'},
    {id: 8, name: 'TeamLead(Code review)', nameEn: 'TeamLead(Code review)'},
    {id: 9, name: 'QA', nameEn: 'QA'},
    {id: 10, name: 'Unbillable', nameEn: 'Unbillable'},
    {id: 11, name: 'Customer', nameEn: 'Customer'},
    {id: 12, name: 'Android', nameEn: 'Android'},
    {id: 13, name: 'IOS', nameEn: 'IOS'},
    {id: 14, name: 'DevOps', nameEn: 'DevOps'}
  ];

  return ProjectRoles;

};
