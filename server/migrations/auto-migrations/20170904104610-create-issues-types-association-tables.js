module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('task_types_association', {
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
      external_task_type_id: {
        type: Sequelize.INTEGER
      },
      internal_task_type_id: {
        type: Sequelize.INTEGER,
        references: { model: 'task_types', key: 'id' }
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
    return queryInterface.dropTable('task_types_association');
  }
};

