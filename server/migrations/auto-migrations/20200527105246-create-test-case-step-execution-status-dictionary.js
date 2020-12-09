const testCaseStepStatus = [
  {id: 1, name: 'Провален', nameEn: 'Failed'},
  {id: 2, name: 'Блокирован', nameEn: 'Blocked'},
  {id: 3, name: 'Пропущен', nameEn: 'Skip'},
  {id: 4, name: 'Пройден', nameEn: 'Passed'},
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_case_step_execution_status', {
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
      Promise.all(testCaseStepStatus.map(status =>
        queryInterface.sequelize.query(
          `
          INSERT INTO test_case_step_execution_status
          VALUES (:id, :name, :nameEn)
          `,
          {
            replacements: status,
          }
        )
      ));
    });
  },

  down: queryInterface => queryInterface.dropTable('test_case_step_execution_status'),
};
