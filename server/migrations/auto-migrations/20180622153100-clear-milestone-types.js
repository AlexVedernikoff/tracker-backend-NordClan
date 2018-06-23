
module.exports = {
  up: function (queryInterface) {
    return Promise.all([
      queryInterface.removeColumn(
        'Milestones',
        'typeId'
      ),
      queryInterface.dropTable('milestone_types_dictionary')
    ]);
  },
  down: function () {
    return Promise.resolve();
  }
};
