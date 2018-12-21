module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('gitlab_user_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'project_users', key: 'id' }
      },
      gitlab_project_id: {
        type: Sequelize.INTEGER
      },
      gitlab_role_id: {
        type: Sequelize.INTEGER,
        references: { model: 'gitlab_roles', key: 'id' }
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
    return queryInterface.dropTable('gitlab_user_roles');
  }
};

