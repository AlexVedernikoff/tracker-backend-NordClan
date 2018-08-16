const Statuses = [
  {id: 1, name: 'Не в процессе', nameEn: 'In progress'},
  {id: 2, name: 'В процессе', nameEn: 'Stopped'}
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('sprint_statuses', 'name_en', {
        type: Sequelize.STRING
      })
      .then(() =>
        Promise.all(
          Statuses.map(status =>
            queryInterface.sequelize.query(
              `
            UPDATE sprint_statuses
            SET name_en = :nameEn
            WHERE id = :id
        `,
              {
                replacements: status
              }
            )
          )
        )
      );
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('sprint_statuses', 'name_en');
  }
};
