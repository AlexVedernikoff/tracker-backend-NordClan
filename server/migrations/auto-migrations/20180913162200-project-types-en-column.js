const projectTypes = [
  { id: 1, nameEn: 'No type' },
  { id: 2, nameEn: 'Product' },
  { id: 3, nameEn: 'Intenrship' },
  { id: 4, nameEn: 'Internal' }
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('project_types', 'name_en', {
        type: Sequelize.STRING
      })
      .then(() =>
        Promise.all(
          projectTypes.map(type =>
            queryInterface.sequelize.query(
              `
                UPDATE project_types
                SET name_en = :nameEn
                WHERE id = :id
              `,
              {
                replacements: type
              }
            )
          )
        )
      );
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('project_types', 'name_en');
  }
};
