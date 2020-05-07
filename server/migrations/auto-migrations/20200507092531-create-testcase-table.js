module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_case', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'needs work', 'actual'),
        defaultValue: 'actual'
      },
      severity: {
        type: Sequelize.ENUM('not set', 'blocker', 'critical', 'major', 'normal', 'minor', 'trivial'),
        allowNull: true
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 3
      },
      pre_conditions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      post_conditions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      duration: {
        type: Sequelize.TIME,
        defaultValue: '00:10:00'
      },
      test_suite_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
    return await queryInterface.createTable('test_case_steps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_case_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    queryInterface.dropTable('test_case');
    return queryInterface.dropTable('test_case_steps');
  }
};
