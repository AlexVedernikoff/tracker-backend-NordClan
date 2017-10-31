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
    'delete':  { granted: false },
  },
  projectUsers: {
    'create':  { granted: true },
    'list':  { granted: true },
    'delete':  { granted: true },
  },
  portfolio: {
    'list':  { granted: true },
    'update':  { granted: true },
    'read':  { granted: true },
  },
  sprint: {
    'create':  { granted: true },
    'read':  { granted: true },
    'update':  { granted: true },
    'delete':  { granted: false },
    'list':  { granted: true },
  },
  task: {
    'create':  { granted: true },
    'read':  { granted: true },
    'update':  { granted: true },
    'delete':  { granted: false },
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
};


module.exports = {
  USER: {
    ...USER
  },
  ADMIN: {
    ...USER,
    project: {
      'delete':  { granted: true },
    },
    sprint: {
      'delete':  { granted: true },
    },
    task: {
      'delete':  { granted: true },
    }
  },
  SYSTEM_USER: {

  }
};
