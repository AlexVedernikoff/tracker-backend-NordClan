module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable('test_case', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status_id: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
      severity_id: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 3,
      },
      pre_conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      post_conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration: {
        type: Sequelize.TIME,
        defaultValue: '00:10:00',
      },
      test_suite_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    return queryInterface.createTable('test_case_steps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      test_case_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  down: queryInterface => {
    queryInterface.dropTable('test_case');
    return queryInterface.dropTable('test_case_steps');
  },
};
