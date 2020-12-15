const indexes = [
  {
    table: 'task_attachments',
    field: 'task_id',
  },
  {
    table: 'project_attachments',
    field: 'project_id',
  },

  {
    table: 'Milestones',
    field: 'projectId',
  },


  {
    table: 'projects',
    field: 'portfolio_id',
  },

  {
    table: 'sprints',
    field: 'project_id',
  },
  {
    table: 'sprints',
    field: 'fact_start_date',
  },
  {
    table: 'sprints',
    field: 'fact_finish_date',
  },

  {
    table: 'task_tasks',
    field: 'linked_task_id',
  },
  {
    table: 'task_tasks',
    field: 'task_id',
  },


  {
    table: 'timesheets',
    field: 'sprint_id',
  },
  {
    table: 'timesheets',
    field: 'user_id',
  },
  {
    table: 'timesheets',
    field: 'project_id',
  },
  {
    table: 'timesheets',
    field: 'task_id',
  },


  {
    table: 'tasks',
    field: 'status_id',
  },
  {
    table: 'tasks',
    field: 'sprint_id',
  },
  {
    table: 'tasks',
    field: 'project_id',
  },
  {
    table: 'tasks',
    field: 'type_id',
  },
  {
    table: 'tasks',
    field: 'performer_id',
  },
  {
    table: 'tasks',
    field: 'author_id',
  },
  {
    table: 'tasks',
    field: 'priorities_id',
  },
  {
    table: 'tasks',
    field: 'parent_id',
  },
];

module.exports = {
  up: queryInterface => {
    return Promise.all(indexes.map(index => queryInterface.addIndex(index.table, {
      fields: [index.field],
      name: index.table + '_' + index.field,
    })));
  },

  down: (queryInterface) => {
    return Promise.all(indexes.map(index => queryInterface.removeIndex(index.table, index.table + '_' + index.field)));
  },
};
