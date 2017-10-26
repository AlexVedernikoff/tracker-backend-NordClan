const createError = require('http-errors');
const _ = require('underscore');
const { diffBetweenObjects } = require('./utils');

const excludeFileds =  ['id', 'updated_at', 'updatedAt', 'createdAt', 'created_at', 'authorId'];

module.exports = function(sequelize) {
  _.extend(sequelize.Model.prototype, {
    hasHistory: function() {
      this.revisionable = true;
      this.addHook('afterCreate', onCreate);
      this.addHook('afterUpdate', onUpdate);
      this.addHook('afterDestroy', onUpdate);
      return this;
    },
  });

  function onCreate(model) {
    const userId = model.$modelOptions.sequelize.context.user.id;
    const taskId = model.taskId ? model.taskId :
      this.options.name.singular === 'Task' ? model.id : null;

    sequelize.models.ModelHistory.create({
      entity: this.options.name.singular,
      entityId: model.id,
      userId: userId,
      taskId: taskId,
      action: 'create',
    }).catch((err) => {
      createError(err);
    });
  }

  function onUpdate(model) {
    const diffObj = diffBetweenObjects(model.dataValues, model._previousDataValues, excludeFileds);
    if(_.isEmpty(diffObj)) return;

    const userId = model.$modelOptions.sequelize.context.user.id;
    const modelNameForm = sequelize.models[this.options.name.plural] ||
      sequelize.models[this.options.name.singular];

    const entity = this.options.name.singular;
    const taskId = getTaskId(model, this.options);
    const histories = getHistories(diffObj, model, modelNameForm , userId, taskId, entity);
    sequelize.models.ModelHistory.bulkCreate(histories)
      .catch((err) => {
        if(err) throw createError(err);
      });
  }

  function getTaskId(model, options) {
    return model.taskId ? model.taskId :
      options.name.singular === 'Task' ? model.id : null;
  }

  function getHistories(diffObj, model, modelNameForm, userId, taskId, entity) {
    return Object.keys(diffObj).map((key) => {
      const type = modelNameForm.attributes[key].type.key;

      return {
        entity: entity,
        entityId: model.id,
        userId: userId,
        taskId: taskId,
        action: 'update',
        field: key,
        valueInt: (type === 'INTEGER') ? diffObj[key].newVal : null,
        prevValueInt: (type === 'INTEGER') ? diffObj[key].oldVal : null,
        valueStr: (type === 'STRING') ? diffObj[key].newVal : null,
        prevValueStr: (type === 'STRING') ? diffObj[key].oldVal : null,
        valueDate: (type === 'DATE') ? diffObj[key].newVal : null,
        prevValueDate: (type === 'DATE') ? diffObj[key].oldVal : null,
        valueFloat: (type === 'FLOAT') ? diffObj[key].newVal : null,
        prevValueFloat: (type === 'FLOAT') ? diffObj[key].oldVal : null,
        valueText: (type === 'TEXT') ? diffObj[key].newVal : null,
        prevValueText: (type === 'TEXT') ? diffObj[key].oldVal : null
      };
    });
  }
};
