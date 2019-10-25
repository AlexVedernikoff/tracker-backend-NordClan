const USER = {
  user: {
    'autocomplete': true,
    'autocompleteExternal': true,
    'me': true,
    'read': true,
    'changeAvatar': true
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
    'update': true,
    'getGitlabNamespaces': true,
    'createGitlabProject': true,
    'addGitlabProject': true,
    'getGitlabProjects': true
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
    'list': true,
    'delete': true
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
  },
  companyReports: {
    'export': true,
    'read': true
  },
  metrics: {
    'list': true
  }
};

module.exports = {
  USER: {
    ...USER
  },
  DEV_OPS: {
    ...USER
  },
  ADMIN: {
    ...USER,
    project: {
      ...USER.project,
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
    },
    user: {
      ...USER.user,
      'usersRoles': true,
      'updateRole': true,
      'updateUserProfile': true,
      'createExternal': true,
      'getExternalUsers': true,
      'updateExternal': true,
      'refreshTokenExternal': true,
      'updateTestUser': true,
      'updateUsersProfile': true,
      'createUser': true
    },
    companyReports: {
      ...USER.companyReports
    },
    timesheet: {
      ...USER.timesheet,
      'approve': true,
      'reject': true
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
    ...USER,
    companyReports: {
      'export': true,
      'read': true
    },
    timesheet: {
      ...USER.timesheet,
      'approve': true,
      'reject': true
    }
  },
  EXTERNAL_USER: {
    user: {
      'autocomplete': true,
      'me': true,
      'read': true
    },
    tag: {
      'autocompliter': true,
      'list': true
    },
    project: {
      'read': true
    },
    projectUsers: {
      'list': true
    },
    portfolio: {
      'list': true,
      'read': true
    },
    sprint: {
      'read': true,
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
    }
  },
  EXTERNAL_SERVICE: {
    jira: {
      'setStatus': true,
      'synchronize': true
    }
  }
};
