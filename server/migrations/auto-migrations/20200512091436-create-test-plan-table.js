

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_plan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      runtime: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: '00:10:00',
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: queryInterface => queryInterface.dropTable('test_plan'),
};
