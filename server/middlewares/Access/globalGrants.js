const USER = {
  user: {
    'autocomplete': true,
    'me': true,
    'read': true
  },
  tag: {
    'autocompliter': true,
    'create': true,
    'list': true,
    'delete': true
  },
  project: {
    'create': true,
    'read': true,
    'update': true
  },
  projectUsers: {
    'create': true,
    'list': true,
    'delete': true
  },
  portfolio: {
    'list': true,
    'update': true,
    'read': true
  },
  sprint: {
    'create': true,
    'read': true,
    'update': true,
    'list': true
  },
  task: {
    'create': true,
    'read': true,
    'update': true,
    'list': true
  },
  taskLinks: {
    'create': true,
    'delete': true
  },
  comment: {
    'create': true,
    'update': true,
    'delete': true,
    'list': true
  },
  attachment: {
    'upload': true,
    'delete': true
  },
  history: {
    'list': true
  },
  timesheet: {
    'create': true,
    'update': true,
    'delete': true,
    'list': true,
    'trackAll': true
  }
};

module.exports = {
  USER: {
    ...USER
  },
  ADMIN: {
    ...USER,
    project: {
      ...USER.project,
      'delete': true
    },
    sprint: {
      ...USER.sprint,
      'delete': true
    },
    task: {
      ...USER.task,
      'delete': true
    },
    portfolio: {
      ...USER.portfolio,
      'list': true,
      'delete': true
    }
  },
  SYSTEM_USER: {
    timesheet: {
      'update': true,
      'list': true
    },
    project: {
      'read': true,
      'create': true
    }
  },
  VISOR: {
    ...USER
  }
};
