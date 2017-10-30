const queries = require('./../../../models/queries');
const { getChangedProperty } = require('./../utils');
const { detectAction } = require('./../utils');
const constants = require('./../constants');

module.exports = function(model) {
  const changedProperty = getChangedProperty(model);
  const message = getMessage(model.entity, model.field, changedProperty);
  const entities = getEntities();
  return { message, entities };
};

function getMessage(entity, field, changedProperty) {
  const action = detectAction(changedProperty);
  const resource = `${action}_${entity}_${field}`.toUpperCase();
  console.log(resource);
  const message = constants.resources[resource];
  const properties = transformProperties(field, changedProperty);

  return insertChangedProperties(message, properties);
}

function getEntities() {
  return {};
}

function insertChangedProperties(message, changedProperty) {
  let updatedMessage = message;
  updatedMessage = changedProperty.prevValue ?
    updatedMessage.replace('{prevValue}', changedProperty.prevValue) :
    updatedMessage;

  updatedMessage = changedProperty.value ?
    updatedMessage.replace('{value}', changedProperty.value) :
    updatedMessage;

  return updatedMessage;
}

function transformProperties(field, changedProperty) {
  const transformValue = (field, property) => {
    const dictionary = {
      statusId: queries.dictionary.getName('TaskStatusesDictionary', property)
    };

    return dictionary[field] || property;
  };

  const value = changedProperty ?
    transformValue(field, changedProperty.value) :
    null;

  const prevValue = changedProperty ?
    transformValue(field, changedProperty.prevValue) :
    null;

  return { value, prevValue };
}
