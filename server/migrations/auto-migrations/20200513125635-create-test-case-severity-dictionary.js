const testCaseSeverity = [
  {id: 1, name: 'Не установлен', nameEn: 'Not set'},
  {id: 2, name: 'Блокирующий', nameEn: 'Blocker'},
  {id: 3, name: 'Критичный', nameEn: 'Critical'},
  {id: 4, name: 'Крупный', nameEn: 'Major'},
  {id: 5, name: 'Обычный', nameEn: 'Normal'},
  {id: 6, name: 'Мелкий', nameEn: 'Minor'},
  {id: 7, name: 'Тривиальный', nameEn: 'Trivial'},
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_case_severity', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    }).then(() => {
      Promise.all(testCaseSeverity.map(severity =>
        queryInterface.sequelize.query(
          `
          INSERT INTO test_case_severity
          VALUES (:id, :name, :nameEn)
          `,
          {
            replacements: severity,
          }
        )
      ));
    });
  },

  down: queryInterface => queryInterface.dropTable('test_case_severity'),
};
