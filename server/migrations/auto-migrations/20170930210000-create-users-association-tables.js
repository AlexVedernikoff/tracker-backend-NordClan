module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('user_email_association', {
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
      external_user_email: {
        type: Sequelize.STRING
      },
      internal_user_email: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('user_email_association');
  }
};
