const Statues = [
  {id: 1, name: 'Новая', nameEn: 'New'},
  {id: 2, name: 'Разработка в процессе', nameEn: 'Develop play'},
  {id: 3, name: 'Разработка окончена', nameEn: 'Develop stop'},
  {id: 4, name: 'Code Review в процессе', nameEn: 'Code Review play'},
  {id: 5, name: 'Code Review окончено', nameEn: 'Code Review stop'},
  {id: 6, name: 'QA в процессе', nameEn: 'QA play'},
  {id: 7, name: 'QA окончено', nameEn: 'QA stop'},
  {id: 8, name: 'Завершено', nameEn: 'Done'},
  {id: 9, name: 'Отменена', nameEn: 'Canceled'},
  {id: 10, name: 'Закрыта', nameEn: 'Closed'}
];

//На русский не переведено

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('task_statuses', 'name_en', {
        type: Sequelize.STRING
      })
      .then(() =>
        Promise.all(
          Statues.map(status =>
            queryInterface.sequelize.query(
              `
            UPDATE task_statuses
            SET name_en = :nameEn, name = :nameEn
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
    return queryInterface.removeColumn('task_statuses', 'name_en');
  }
};
