const timesheetTypes = [
  {
    id: 1,
    nameEn: 'Implementation',
  },
  {
    id: 2,
    nameEn: 'Meeting',
  },
  {
    id: 3,
    nameEn: 'Presale and mark',
  },
  {
    id: 4,
    nameEn: 'Education',
  },
  {
    id: 5,
    nameEn: 'Vacation',
  },
  {
    id: 6,
    nameEn: 'Business trip',
  },
  {
    id: 7,
    nameEn: 'Hospital',
  },
  {
    id: 8,
    nameEn: 'Control',
  },
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('timesheets_types', 'name_en', {
        type: Sequelize.STRING,
      })
      .then(() =>
        Promise.all(
          timesheetTypes.map(type =>
            queryInterface.sequelize.query(
              `
        UPDATE timesheets_types
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
    return queryInterface.removeColumn('timesheets_types', 'name_en');
  },
};
