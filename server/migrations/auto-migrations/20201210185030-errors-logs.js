

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.createTable('errors_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      componentStack: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      state: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: function (queryInterface) {
    queryInterface.dropTable('errors_logs');
  },
};
