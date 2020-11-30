const testCaseStatuses = [
  {id: 1, name: 'Драфт', nameEn: 'Draft'},
  {id: 2, name: 'Требует доработки', nameEn: 'Needs work'},
  {id: 3, name: 'Активный', nameEn: 'Actual'}
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_case_statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }).then(() => {
      Promise.all(testCaseStatuses.map(status =>
        queryInterface.sequelize.query(
          `
          INSERT INTO test_case_statuses
          VALUES (:id, :name, :nameEn)
          `,
          {
            replacements: status
          }
        )
      ));
    });
  },

  down: queryInterface => queryInterface.dropTable('test_case_statuses')
};
