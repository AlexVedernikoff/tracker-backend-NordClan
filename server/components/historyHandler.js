const excludeFileds =  ['id', 'updated_at', 'updatedAt', 'createdAt', 'created_at', 'authorId', 'completedAt', 'completed_at'];
const createError = require('http-errors');
const _ = require('underscore');
const { diffBetweenObjects } = require('./utils');

exports.historyHandler = function(sequelize, historyModel) {
  function getHistoryModelId(model) {
    const modelIdProperty = `${historyModel.toLowerCase()}Id`;
    return model[modelIdProperty] || model.id;
  }

  function getHistories(diffObj, model, modelNameForm, userId, modelId, entity) {
    const modelIdProperty = `${historyModel.toLowerCase()}Id`;
    return Object.keys(diffObj).map((key) => {
      const type = modelNameForm.attributes[key].type.key;
      return {
        entity: entity,
        entityId: model.id,
        userId: userId,
        [modelIdProperty]: modelId,
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

  return {
    onCreate: function(model) {
      const userId = model.$modelOptions.sequelize.context.user.id;
      const modelIdProperty = `${historyModel.toLowerCase()}Id`;
      const modelId = getHistoryModelId(model);
      const modelName = `${historyModel}History`;

      sequelize.models[modelName].create({
        entity: this.options.name.singular,
        entityId: model.id,
        userId: userId,
        [modelIdProperty]: modelId,
        action: 'create',
      }).catch((err) => {
        createError(err);
      });
    },

    onUpdate: function(model) {
      const diffObj = diffBetweenObjects(model.dataValues, model._previousDataValues, excludeFileds);
      if(_.isEmpty(diffObj)) return;

      const userId = model.$modelOptions.sequelize.context.user.id;
      const modelNameForm = sequelize.models[this.options.name.plural] ||
        sequelize.models[this.options.name.singular];

      const entity = this.options.name.singular;
      const modelId = getHistoryModelId(model);

      const histories = getHistories(diffObj, model, modelNameForm , userId, modelId, entity);
      const modelName = `${historyModel}History`;

      sequelize.models[modelName].bulkCreate(histories)
        .catch((err) => {
          if(err) throw createError(err);
        });
    }
  };
};
