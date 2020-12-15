const EnumTypes = [
  { id: 1, nameEn: 'Get feedback' },
  { id: 2, nameEn: 'Demo for client' },
  { id: 3, nameEn: 'Inner demo' },
  { id: 4, nameEn: 'Other' },
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('milestone_types_dictionary', 'name_en', {
        type: Sequelize.STRING,
      })
      .then(() =>
        Promise.all(
          EnumTypes.map(type =>
            queryInterface.sequelize.query(
              `
          UPDATE milestone_types_dictionary
          SET name_en = :nameEn
          WHERE id = :id
      `,
              {
                replacements: type,
              }
            )
          )
        )
      );
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('milestone_types_dictionary', 'name_en');
  },
};
