module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_case_histories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      test_case_id: {
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
      value_int: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      prev_value_int: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      value_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      prev_value_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      value_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      prev_value_date: {
        type: Sequelize.DATE,
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

  down: queryInterface => queryInterface.dropTable('test_case_histories'),
};
