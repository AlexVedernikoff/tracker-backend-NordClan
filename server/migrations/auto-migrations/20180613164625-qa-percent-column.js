

module.exports = {
  up: function (queryInterface, Sequelize) {

    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.addColumn(
          'sprints',
          'qa_percent',
          {
            type: Sequelize.INTEGER,
          }
        ),
        queryInterface.addColumn(
          'projects',
          'qa_percent',
          {
            type: Sequelize.INTEGER,
          }
        ),
      ]))
      .then(() => Promise.all([
        queryInterface.sequelize.query(
          'UPDATE sprints SET "qa_percent" = 0;'
        ),
        queryInterface.sequelize.query(
          'UPDATE projects SET "qa_percent" = 30;'
        ),
      ]));
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(() => Promise.all([
        queryInterface.removeColumn(
          'sprints',
          'qa_percent'
        ),
        queryInterface.removeColumn(
          'projects',
          'qa_percent'
        ),
      ]));
  },
};
