const timesheetTypes = [
  {
    id: 1,
    nameEn: 'Implementation'
  },
  {
    id: 2,
    nameEn: 'Meeting'
  },
  {
    id: 3,
    nameEn: 'Presale  and mark'
  },
  {
    id: 4,
    nameEn: 'Education'
  },
  {
    id: 5,
    nameEn: 'Vacation'
  },
  {
    id: 6,
    nameEn: 'Buisness trip'
  },
  {
    id: 7,
    nameEn: 'Hospital'
  },
  {
    id: 8,
    nameEn: 'Control'
  }
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('timesheets_types', 'nameEn', {
        type: Sequelize.STRING(25)
      })
    ]).then(() =>
      Promise.all(
        timesheetTypes.map(type =>
          queryInterface.sequelize.query(
            `
        UPDATE timesheets_types
        SET nameEn = :nameEn,
        WHERE id = :id
    `
          )
        )
      )
    );
  },

  down: function (queryInterface) {
    return Promise.all([
      queryInterface.removeColumn('timesheets_types', 'nameEn')
    ]);
  }
};
