module.exports = {
  up: function (queryInterface) {
    return queryInterface.sequelize.query(`
    ALTER TABLE project_histories DROP CONSTRAINT project_histories_entity_id_fkey;
    `);
  },
  down: function (queryInterface) {
    return queryInterface.sequelize.query(`
     ALTER TABLE project_histories
     ADD CONSTRAINT project_histories_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES users (id);
    `);
  }
};