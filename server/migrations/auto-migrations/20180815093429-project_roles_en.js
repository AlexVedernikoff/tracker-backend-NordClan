const Roles = [
  {id: 1, name: 'Account', nameEn: 'Account'},
  {id: 2, name: 'PM', nameEn: 'PM'},
  {id: 3, name: 'UX', nameEn: 'UX'},
  {id: 4, name: 'Аналитик', nameEn: 'Analyst'},
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

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('project_roles', 'name_en', {
        type: Sequelize.STRING
      })
      .then(() =>
        Promise.all(
          Roles.map(role =>
            queryInterface.sequelize.query(
              `
            UPDATE project_roles
            SET name_en = :nameEn, name = :name
            WHERE id = :id
        `,
              {
                replacements: role
              }
            )
          )
        )
      );
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('project_roles', 'name_en');
  }
};
