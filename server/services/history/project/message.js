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
  const message = constants.resources[resource];

  return text(message, changedProperty);
}

function getEntities() {
  return {};
}

function text(message, changedProperty) {
  let updatedMessage = message;
  updatedMessage = changedProperty.prevValue ?
    updatedMessage.replace('{prevValue}', changedProperty.prevValue) :
    updatedMessage;

  updatedMessage = changedProperty.value ?
    updatedMessage.replace('{value}', changedProperty.value) :
    updatedMessage;

  return updatedMessage;
}
