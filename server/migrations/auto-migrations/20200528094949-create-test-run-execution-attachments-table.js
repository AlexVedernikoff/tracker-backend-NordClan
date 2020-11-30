module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable('test_case_execution_attachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_case_execution_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      preview_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
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

    return queryInterface.createTable('test_step_execution_attachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_step_execution_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      preview_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
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
  },

  down: queryInterface => {
    queryInterface.dropTable('test_case_execution_attachments');
    return queryInterface.dropTable('test_step_execution_attachments');
  }

};
