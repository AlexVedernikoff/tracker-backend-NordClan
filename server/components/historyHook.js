const _ = require('underscore');
const { historyHandler } = require('./historyHandler');

module.exports = function (sequelize) {
  _.extend(sequelize.Model.prototype, {
    addHistoryForTask: function () {
      const entity = 'Task';
      const handler = historyHandler(sequelize, entity);

      this.revisionable = true;
      this.addHook('afterCreate', handler.onCreate);
      this.addHook('afterUpdate', handler.onUpdate);
      this.addHook('afterDestroy', handler.onDelete);
      return this;
    },

    addHistoryForProject: function () {
      const entity = 'Project';
      const handler = historyHandler(sequelize, entity);

      this.revisionable = true;
      this.addHook('afterCreate', handler.onCreate);
      this.addHook('afterUpdate', handler.onUpdate);
      this.addHook('afterDestroy', handler.onDelete);
      return this;
    },

    addHistoryForTestCase: function () {
      const entity = 'TestCase';
      const handler = historyHandler(sequelize, entity);
      this.revisionable = true;
      this.addHook('afterCreate', handler.onCreate);
      this.addHook('afterUpdate', handler.onUpdate);
      this.addHook('afterDestroy', handler.onDelete);
      return this;
    },

    addHistoryForTestSuite: function () {
      const entity = 'TestSuite';
      const handler = historyHandler(sequelize, entity);
      this.revisionable = true;
      this.addHook('afterCreate', handler.onCreate);
      this.addHook('afterUpdate', handler.onUpdate);
      this.addHook('afterDestroy', handler.onDelete);
      return this;
    },

    addHistoryForTestRun: function () {
      const entity = 'TestRun';
      const handler = historyHandler(sequelize, entity);
      this.revisionable = true;
      this.addHook('afterCreate', handler.onCreate);
      this.addHook('afterUpdate', handler.onUpdate);
      this.addHook('afterDestroy', handler.onDelete);
      return this;
    },
  });
};
