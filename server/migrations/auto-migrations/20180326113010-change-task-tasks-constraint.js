

module.exports = {
  up: function (migration, DataTypes) {
    migration.sequelize.query(`ALTER TABLE task_tasks DROP CONSTRAINT task_tasks_task_id_linked_task_id_key; 
                               ALTER TABLE public.task_tasks ADD CONSTRAINT 
                               task_tasks_task_id_linked_task_id_key_deleted_at UNIQUE (id, linked_task_id, task_id, 
                               deleted_at)`);
  }
};
