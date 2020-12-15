module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('sprints', 'entities_last_update', {
      type: Sequelize.DATE,
      allowNull: true,
    })
      .then(() => {
        return queryInterface.addColumn('sprints', 'metric_last_update', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('sprints', 'entities_last_update')
      .then(() => {
        return queryInterface.removeColumn('sprints', 'metric_last_update');
      });
  },
};
