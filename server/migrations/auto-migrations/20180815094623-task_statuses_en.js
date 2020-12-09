const Statues = [
  {id: 1, name: 'New', nameEn: 'New'},
  {id: 2, name: 'Develop play', nameEn: 'Develop play'},
  {id: 3, name: 'Develop stop', nameEn: 'Develop stop'},
  {id: 4, name: 'Code Review play', nameEn: 'Code Review play'},
  {id: 5, name: 'Code Review stop', nameEn: 'Code Review stop'},
  {id: 6, name: 'QA play', nameEn: 'QA play'},
  {id: 7, name: 'QA stop', nameEn: 'QA stop'},
  {id: 8, name: 'Done', nameEn: 'Done'},
  {id: 9, name: 'Canceled', nameEn: 'Canceled'},
  {id: 10, name: 'Closed', nameEn: 'Closed'},
];

//На русский не переведено

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('task_statuses', 'name_en', {
        type: Sequelize.STRING,
      })
      .then(() =>
        Promise.all(
          Statues.map(status =>
            queryInterface.sequelize.query(
              `
            UPDATE task_statuses
            SET name_en = :nameEn, name = :name
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
    return queryInterface.removeColumn('task_statuses', 'name_en');
  },
};
