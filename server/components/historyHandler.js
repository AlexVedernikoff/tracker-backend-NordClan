const excludeFileds = ['id', 'updated_at', 'updatedAt', 'createdAt', 'created_at', 'authorId', 'completedAt', 'completed_at'];
const createError = require('http-errors');
const _ = require('underscore');
const { diffBetweenObjects } = require('./utils');

exports.historyHandler = function (sequelize, historyModel) {
  function getHistoryModelId (model, entity) {
    const modelIdProperty = `${historyModel.toLowerCase()}Id`;
    const modelId = model[modelIdProperty] || model.id;
    return entity === 'ItemTag' ? model.taggableId : modelId;
  }

  function getHistories (diffObj, model, modelNameForm, userId, modelId, entity) {
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
        valueDate: (type === 'DATE' || type === 'DATEONLY') ? diffObj[key].newVal : null,
        prevValueDate: (type === 'DATE' || type === 'DATEONLY') ? diffObj[key].oldVal : null,
        valueFloat: (type === 'FLOAT') ? diffObj[key].newVal : null,
        prevValueFloat: (type === 'FLOAT') ? diffObj[key].oldVal : null,
        valueText: (type === 'TEXT') ? diffObj[key].newVal : null,
        prevValueText: (type === 'TEXT') ? diffObj[key].oldVal : null
      };
    });
  }

  return {
    onCreate: function (model, instance) {
      const userId = model.authorId
        ? model.authorId
        : instance.transaction.options.historyAuthorId;


      const modelIdProperty = `${historyModel.toLowerCase()}Id`;
      const entity = this.options.name.singular;
      const modelId = getHistoryModelId(model, entity);
      const modelName = `${historyModel}History`;

      sequelize.models[modelName].create({
        entity: entity,
        entityId: model.id,
        userId: userId,
        [modelIdProperty]: modelId,
        action: 'create'
      }, { logging: (text) => {console.log(text);} }).catch((err) => {
        createError(err);
      });
    },

    onUpdate: function (model, instance) {
      const userId = instance.historyAuthorId;

      const diffObj = diffBetweenObjects(model.dataValues, model._previousDataValues, excludeFileds);
      if (_.isEmpty(diffObj)) return;

      const modelNameForm = sequelize.models[this.options.name.plural]
        || sequelize.models[this.options.name.singular];

      const entity = this.options.name.singular;
      const modelId = getHistoryModelId(model, entity);

      const histories = getHistories(diffObj, model, modelNameForm, userId, modelId, entity);
      const modelName = `${historyModel}History`;

      sequelize.models[modelName].bulkCreate(histories)
        .catch((err) => {
          if (err) throw createError(err);
        });
    }
  };
};
