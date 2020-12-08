const excludeFileds = ['id', 'updated_at', 'updatedAt', 'createdAt', 'created_at', 'authorId', 'completedAt', 'completed_at'];
const createError = require('http-errors');
const _ = require('underscore');
const { diffBetweenObjects } = require('./utils');
const { firstLetterDown } = require('./StringHelper');

exports.historyHandler = function (sequelize, historyModel) {
  function getHistoryModelId (model, entity) {
    const modelIdProperty = `${firstLetterDown(historyModel)}Id`;
    const modelId = model[modelIdProperty] || model.id;
    return entity === 'ItemTag' ? model.taggableId : modelId;
  }

  function getHistories (diffObj, model, modelNameForm, userId, modelId, entity) {
    const modelIdProperty = `${firstLetterDown(historyModel)}Id`;
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
        valueTime: (type === 'TIME') ? diffObj[key].newVal : null,
        prevValueTime: (type === 'TIME') ? diffObj[key].oldVal : null,
        valueFloat: (type === 'FLOAT') ? diffObj[key].newVal : null,
        prevValueFloat: (type === 'FLOAT') ? diffObj[key].oldVal : null,
        valueText: (type === 'TEXT') ? diffObj[key].newVal : null,
        prevValueText: (type === 'TEXT') ? diffObj[key].oldVal : null,
        valueBoolean: (type === 'BOOLEAN') ? diffObj[key].newVal : null,
        prevValueBoolean: (type === 'BOOLEAN') ? diffObj[key].oldVal : null,
      };
    });
  }

  function getUserId (model, instance) {
    if (instance.historyAuthorId) return instance.historyAuthorId;
    if (model.authorId) return model.authorId;
    if (instance.transaction
      && instance.transaction.options.historyAuthorId) return instance.transaction.options.historyAuthorId;
    return null;
  }

  async function handleCreateOrDeleteEvent (model, instance, eventType, entity) {
    const userId = getUserId(model, instance);
    const camelCaseModelName = firstLetterDown(historyModel);
    const modelIdProperty = `${camelCaseModelName}Id`;
    const modelId = getHistoryModelId(model, entity);
    const modelName = `${historyModel}History`;
    return sequelize.models[modelName].create({
      entity,
      entityId: model.id,
      userId,
      [modelIdProperty]: modelId,
      action: eventType,
      testCaseId: model.id,
    });
  }

  return {
    onCreate: function (model, instance) {
      const entity = this.options.name.singular;
      handleCreateOrDeleteEvent(model, instance, 'create', entity)
        .catch((err) => {
          if (err) {
            throw createError(err);
          }
        });

      // Сведения о созданной подзадаче в родительской задаче
      if (entity === 'Task' && model.parentId > 0) {
        const userId = getUserId(model, instance);
        const camelCaseModelName = firstLetterDown(historyModel);
        const modelIdProperty = `${camelCaseModelName}Id`;
        const modelId = getHistoryModelId(model, entity);
        const modelName = `${historyModel}History`;
        sequelize.models[modelName].create({
          entity: entity,
          entityId: modelId,
          userId: userId,
          [modelIdProperty]: model.parentId,
          action: 'create',
        }).catch((err) => {
          if (err) {
            throw createError(err);
          }
        });
      }

    },

    onUpdate: function (model, instance) {
      const userId = getUserId(model, instance);
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
          if (err) {
            throw createError(err);
          }
        });

      // Сведения об удаленной подзадаче в родительской задаче
      if (entity === 'Task' && model.parentId > 0) {
        const modelIdProperty = `${firstLetterDown(historyModel)}Id`;

        sequelize.models[modelName].bulkCreate({
          entity: entity,
          entityId: modelId,
          userId: userId,
          [modelIdProperty]: model.parentId,
          action: 'update',
        }).catch((err) => {
          if (err) {
            throw createError(err);
          }
        });
      }
    },

    onDelete: function (model, instance) {
      const entity = this.options.name.singular;
      handleCreateOrDeleteEvent(model, instance, 'delete', entity)
        .catch((err) => {
          if (err) {
            throw createError(err);
          }
        });
    },
  };
};
