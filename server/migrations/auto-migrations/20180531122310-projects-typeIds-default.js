module.exports = {
  up: function (queryInterface) {
    queryInterface.sequelize.query('UPDATE projects SET "type_id" = 1 WHERE "type_id" IS NULL;');
  },

  down: function (queryInterface) {
    queryInterface.sequelize.query('UPDATE projects SET "type_id" = NULL WHERE "type_id" = 1;');
  }
};
