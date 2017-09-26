'use strict';

var Common = require('../utils.js');

var Estimate = require('../estimate/class.js');
var Feature = require('../feature/class.js');
var Phase = require('../phase/class.js');
var Statistic = require('../statistic/class.js');
var Task = require('../task/class.js');
var User = require('../user/class.js');

var globalRules = {

  estimate: {
    all: {
      filter: {},
      access: ['list', 'view', 'update', 'delete', 'create', 'export', 'status']
    },

    ownEstimate: {
      filter: {authors: '{$user.id}'},
      access: ['list', 'view', 'update', 'delete', 'export', 'status']
    },

    approvers: {
      filter: {approvers: '{$user.id}'},
      access: ['list', 'view', 'update', 'export']
    }
  },

  phase: {
    all: {
      filter: {},
      access: ['list', 'view', 'update', 'delete', 'create']
    },

    ownEstimate: {
      filter: {authors: '{$user.id}'},
      access: ['list', 'view', 'update', 'delete']
    },

    approvers: {
      filter: {approvers: '{$user.id}'},
      access: ['list', 'view']
    }
  },

  feature: {
    all: {
      filter: {},
      access: ['list', 'view', 'update', 'delete', 'create']
    },

    ownEstimate: {
      filter: {authors: '{$user.id}'},
      access: ['list', 'view', 'update', 'delete']
    },

    approvers: {
      filter: {approvers: '{$user.id}'},
      access: ['list', 'view']
    }
  },

  task: {
    all: {
      filter: {},
      access: ['list', 'view', 'update', 'delete', 'create']
    },

    ownEstimate: {
      filter: {authors: '{$user.id}'},
      access: ['list', 'view', 'update', 'delete']
    },

    approvers: {
      filter: {approvers: '{$user.id}'},
      access: ['list', 'view']
    }
  },

  user: {
    public: {
      filter: {},
      access: ['list']
    },

    all: {
      filter: {},
      access: ['list', 'view', 'update', 'delete', 'create']
    },

    ownUser: {
      filter: {_id: '{$user.id}'},
      access: ['list', 'view', 'update', 'delete']
    },
  },

};

function validate(entity, rule, access, data) {
  if (!globalRules[entity] || !globalRules[entity][rule]) {
    return rule === 'all';
  }

  return checkRule(Object.assign({}, globalRules[entity][rule]), access, data);
}

function checkRule(rule, access, object) {
  if (rule.access && rule.access.indexOf(access) < 0) {
    return false;
  }

  rule.filter = rule.filter ? Common.parsePlaceholders(rule.filter, object) : null;

  return rule;
}

module.exports = {validate: validate, rules: globalRules};
