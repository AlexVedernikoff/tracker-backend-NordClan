const USER = {
  user: {
    'autocomplete':  { granted: true },
    'me':  { granted: true },
    'read':  { granted: true },
  },
  tag: {
    'autocompliter':  { granted: true },
    'create':  { granted: true },
    'list':  { granted: true },
    'delete':  { granted: true },
  },
  project: {
    'create':  { granted: true },
    'read':  { granted: true },
    'update':  { granted: true },
  },
  projectUsers: {
    'create':  { granted: true },
    'list':  { granted: true },
    'delete':  { granted: true },
  },
  portfolio: {
    'update':  { granted: true },
    'read':  { granted: true },
  },
  sprint: {
    'create':  { granted: true },
    'read':  { granted: true },
    'update':  { granted: true },
    'list':  { granted: true },
  },
  task: {
    'create':  { granted: true },
    'read':  { granted: true },
    'list':  { granted: true },
  },
  taskLinks: {
    'create':  { granted: true },
    'delete':  { granted: true },
  },
  comment: {
    'create':  { granted: true },
    'update':  { granted: true },
    'delete':  { granted: true },
    'list':  { granted: true },
  },
  attachment: {
    'upload':  { granted: true },
    'delete':  { granted: true },
  },
  history: {
    'list':  { granted: true },
  },
  timesheet: {
    'create':  { granted: true },
    'update':  { granted: true },
    'delete':  { granted: true },
    'list':  { granted: true },
    'trackAll':  { granted: true },
  },
};


module.exports = {
  USER: {
    ...USER
  },
  ADMIN: {
    ...USER,
    project: {
      ...USER.project,
      'delete':  { granted: true },
    },
    sprint: {
      ...USER.sprint,
      'delete':  { granted: true },
    },
    task: {
      ...USER.task,
      'delete':  { granted: true },
    },
    portfolio: {
      ...USER.portfolio,
      'list':  { granted: true },
      'delete':  { granted: true },
    },
  },
  SYSTEM_USER: {
    timesheet: {
      'update':  { granted: true },
      'list':  { granted: true },
    },
    project: {
      'read':  { granted: true },
    },
  },
  VISOR: {
    ...USER,
  }
};
