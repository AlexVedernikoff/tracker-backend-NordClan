const timesheetTypes = [
  {id: 1, name: 'Implementation', codeName: 'IMPLEMENTATION', isMagicActivity: false, order: 0},
  {id: 2, name: 'Совещание', codeName: 'MEETING', isMagicActivity: true, order: 1},
  {id: 3, name: 'Преселлинг и оценка', codeName: 'PRESALE', isMagicActivity: true, order: 2},
  {id: 4, name: 'Обучение', codeName: 'EDUCATION', isMagicActivity: true, order: 3},
  {id: 5, name: 'Отпуск', codeName: 'VACATION', isMagicActivity: true, order: 4},
  {id: 6, name: 'Командировка', codeName: 'BUSINESS_TRIP', isMagicActivity: true, order: 5},
  {id: 7, name: 'Больничный', codeName: 'HOSPITAL', isMagicActivity: true, order: 6},
  {id: 8, name: 'Управление', codeName: 'CONTROL', isMagicActivity: true, order: 7}
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    const columns = [
      queryInterface.addColumn(
        'timesheets_types',
        'code_name',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addColumn(
        'timesheets_types',
        'isMagicActivity',
        {
          type: Sequelize.BOOLEAN
        }
      ),
      queryInterface.addColumn(
        'timesheets_types',
        'order',
        {
          type: Sequelize.INTEGER
        }
      )
    ];

    const inserts = timesheetTypes.map((type) => queryInterface.sequelize.query(`
      UPDATE timesheets_types
      SET name = :name,
      code_name = :codeName,
      is_magic_activity = :isMagicActivity,
      "order" = :order
      WHERE id = :id
    `, {
      replacements: type
    }));

    return Promise
      .all(inserts);
    //.then(() => Promise.all(inserts));
  },
  down: function (queryInterface) {

  }
};
