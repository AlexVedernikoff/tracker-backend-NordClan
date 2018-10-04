module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'comments',
      'attachment_ids',
      {
        type: Sequelize.TEXT
      }
    );
  },
  down: queryInterface => {
    return queryInterface.removeColumn(
      'comments',
      'attachment_ids'
    );
  }
};
