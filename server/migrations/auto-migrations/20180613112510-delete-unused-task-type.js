module.exports = {
  up: function (queryInterface) {
    queryInterface.sequelize.query('UPDATE tasks SET "type_id" = 2, "is_task_by_client" = true WHERE "type_id" = 5;');
    queryInterface.sequelize.query('DELETE FROM task_types WHERE "id" = 5');
  },

  down: function (queryInterface) {
    queryInterface.sequelize.query('INSERT INTO task_types (id, name) VALUES (5, \'Баг от клиента\');');
    queryInterface.sequelize.query('UPDATE tasks SET "type_id" = 5, "is_task_by_client" = false WHERE "type_id" = 2;');
  },
};
