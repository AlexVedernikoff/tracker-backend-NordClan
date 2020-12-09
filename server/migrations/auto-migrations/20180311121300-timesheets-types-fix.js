const timesheetTypes = [
  {id: 1, name: 'Implementation', codeName: 'IMPLEMENTATION', isMagicActivity: false, order: 0},
  {id: 2, name: 'Совещание', codeName: 'MEETING', isMagicActivity: true, order: 1},
  {id: 3, name: 'Преселлинг и оценка', codeName: 'PRESALE', isMagicActivity: true, order: 2},
  {id: 4, name: 'Обучение', codeName: 'EDUCATION', isMagicActivity: true, order: 3},
  {id: 5, name: 'Отпуск', codeName: 'VACATION', isMagicActivity: true, order: 4},
  {id: 6, name: 'Командировка', codeName: 'BUSINESS_TRIP', isMagicActivity: true, order: 5},
  {id: 7, name: 'Больничный', codeName: 'HOSPITAL', isMagicActivity: true, order: 6},
  {id: 8, name: 'Управление', codeName: 'CONTROL', isMagicActivity: true, order: 7},
];

module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => queryInterface.changeColumn(
        'timesheets_types',
        'name',
        {
          type: Sequelize.STRING(25),
        }
      )
      )
      .then(() => Promise.all([
        queryInterface.addColumn(
          'timesheets_types',
          'code_name',
          {
            type: Sequelize.STRING(25),
          }
        ),
        queryInterface.addColumn(
          'timesheets_types',
          'is_magic_activity',
          {
            type: Sequelize.BOOLEAN,
          }
        ),
        queryInterface.addColumn(
          'timesheets_types',
          'order',
          {
            type: Sequelize.INTEGER,
          }
        ),
      ]))
      .then(() => Promise.all(timesheetTypes.map((type) => queryInterface.sequelize.query(`
          UPDATE timesheets_types
          SET name = :name,
          code_name = :codeName,
          is_magic_activity = :isMagicActivity,
          "order" = :order
          WHERE id = :id
        `, {
        replacements: type,
      }))));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'timesheets_types',
          'code_name'
        ),
        queryInterface.removeColumn(
          'timesheets_types',
          'is_magic_activity'
        ),
        queryInterface.removeColumn(
          'timesheets_types',
          'order'
        ),
      ]));
  },
};
