module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('test_case_attachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_case_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'test_case', key: 'id' }
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      previewPath: {
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
        allowNull: true,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex('test_case_attachments', ['test_case_id']));
    //.then(() => {
    //  return queryInterface.addColumn(
    //    'test_case',
    //    'attachments', // name of the key we're adding
    //    {
    //      type: Sequelize.INTEGER,
    //      references: {
    //        model: 'test_case_attachments', // name of Source model
    //        key: 'id'
    //      },
    //      onUpdate: 'CASCADE',
    //      onDelete: 'SET NULL'
    //    }
    //  );
    //});
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeIndex('test_case_attachments', ['test_case_id']).then(
      () => queryInterface.dropTable('test_case_attachments')
    );
  }
};
