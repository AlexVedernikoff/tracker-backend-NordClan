module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_suite_histories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      test_suite_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      value_str: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      prev_value_str: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      value_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      prev_value_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: queryInterface => queryInterface.dropTable('test_suite_histories'),
};
