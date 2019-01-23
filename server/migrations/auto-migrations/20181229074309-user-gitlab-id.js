module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'gitlab_user_id', {
      type: Sequelize.INTEGER
    });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('users', 'gitlab_user_id');
  }
};
