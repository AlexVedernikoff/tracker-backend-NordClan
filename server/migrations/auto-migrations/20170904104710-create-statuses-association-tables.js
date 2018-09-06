module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('task_statuses_association', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: { model: 'projects', key: 'id' }
      },
      external_status_id: {
        type: Sequelize.INTEGER
      },
      internal_status_id: {
        type: Sequelize.INTEGER,
        references: { model: 'task_statuses', key: 'id' }
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
  down: function (queryInterface) {
    return queryInterface.dropTable('statuses_association');
  }
};

