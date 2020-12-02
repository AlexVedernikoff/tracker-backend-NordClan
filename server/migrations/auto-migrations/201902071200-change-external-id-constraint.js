module.exports = {
  up: function (queryInterface) {
    queryInterface.sequelize.query('ALTER TABLE tasks DROP CONSTRAINT tasks_external_id_key');
    queryInterface.sequelize.query('ALTER TABLE tasks ADD CONSTRAINT task_external_id_uq UNIQUE(project_id, external_id);');

    queryInterface.sequelize.query('ALTER TABLE timesheets DROP CONSTRAINT timesheets_external_id_key');
    queryInterface.sequelize.query('ALTER TABLE timesheets ADD CONSTRAINT timesheets_external_id_uq UNIQUE(project_id, external_id);');

    queryInterface.sequelize.query('ALTER TABLE sprints DROP CONSTRAINT sprints_external_id_key');
    queryInterface.sequelize.query('ALTER TABLE sprints ADD CONSTRAINT sprints_external_id_uq UNIQUE(project_id, external_id);');
  },

  down: function (queryInterface) {
    queryInterface.sequelize.query('ALTER TABLE tasks DROP CONSTRAINT task_external_id_uq');
    queryInterface.sequelize.query('ALTER TABLE tasks ADD CONSTRAINT tasks_external_id_key UNIQUE(external_id);');

    queryInterface.sequelize.query('ALTER TABLE timesheets DROP CONSTRAINT timesheets_external_id_uq');
    queryInterface.sequelize.query('ALTER TABLE timesheets ADD CONSTRAINT timesheets_external_id_key UNIQUE(external_id);');

    queryInterface.sequelize.query('ALTER TABLE sprints DROP CONSTRAINT sprints_external_id_uq');
    queryInterface.sequelize.query('ALTER TABLE sprints ADD CONSTRAINT sprints_external_id_key UNIQUE(external_id);');
  }
};
