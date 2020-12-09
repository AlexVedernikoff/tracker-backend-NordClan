const Statuses = [
  {id: 1, name: 'В процессе', nameEn: 'In progress'},
  {id: 2, name: 'Приостановлен', nameEn: 'Paused'},
  {id: 3, name: 'Завершен', nameEn: 'Finished'},
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('project_statuses', 'name_en', {
        type: Sequelize.STRING,
      })
      .then(() =>
        Promise.all(
          Statuses.map(status =>
            queryInterface.sequelize.query(
              `
            UPDATE project_statuses
            SET name_en = :nameEn
            WHERE id = :id
        `,
              {
                replacements: status,
              }
            )
          )
        )
      );
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('project_statuses', 'name_en');
  },
};
