module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('metric_types', 'calc_every_sprint', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
      .then(() => {
        return queryInterface.sequelize.query(`
          UPDATE metric_types SET "calc_every_sprint" = false WHERE id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,57);
          UPDATE metric_types SET "calc_every_sprint" = true WHERE id NOT IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,57);
        `);
      });
  },
  down: function (queryInterface) {
    return queryInterface.removeColumn('metric_types', 'calc_every_sprint');
  },
};
