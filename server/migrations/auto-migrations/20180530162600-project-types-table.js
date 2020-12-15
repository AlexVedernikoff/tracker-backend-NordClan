module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(() => queryInterface.createTable('project_types', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
        code_name: {
          type: Sequelize.STRING,
        },
      }))
      .then(() => queryInterface.bulkInsert('project_types', [
        { code_name: 'UNDEFINED', name: 'Без типа' },
        { code_name: 'PRODUCT', name: 'Продуктовый' },
        { code_name: 'INTERNSHIP', name: 'Стажировка' },
        { code_name: 'INTERNAL', name: 'Внутренний' },
      ], {}));
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('project_types');
  },
};
