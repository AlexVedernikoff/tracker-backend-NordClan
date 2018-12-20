module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('gitlab_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gitlab_project_id: {
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: { model: 'projects', key: 'id' }
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down (queryInterface) {
    return queryInterface.dropTable('gitlab_users');
  }
};

