const queries = require('./../../../models/queries');
const { getChangedProperty } = require('./../utils');
const { detectAction } = require('./../utils');
const constants = require('./../constants');

module.exports = function(model) {
  const changedProperty = getChangedProperty(model);
  const resourceName = getResourceName(model, changedProperty);
  const resource = constants.resources[resourceName];
  console.log(resourceName);

  if (!resource) return;

  const { message, entities } = getResources(resource, model, changedProperty);
  return { message, entities };
};

function getResourceName(model, changedProperty) {
  const action = detectAction(changedProperty);
  return model.field ?
    `${action}_${model.entity}_${model.field}`.toUpperCase() :
    `${action}_${model.entity}`.toUpperCase();
}

function getResources(resource, model, changedProperty) {
  const message = transformMessage(resource.message, changedProperty);
  const properties = transformProperties(model.field, changedProperty);
  const entitiesName = resource.entities || [];
  const entities = entitiesName.reduce((acc, name) => {
    acc[name] = model[name];
    return acc;
  }, {});

  return {
    message: insertChangedProperties(message, properties),
    entities
  };
}

function transformMessage(message, changedProperty) {
  //TODO bad regexp
  const flags = message.match(/{([^{}]+)}/g) || [];
  const dictionary = {
    role: (changedProperty) => getUserRole(changedProperty),
    action: (changedProperty) => getUserAction(changedProperty)
  };

  console.log(flags);

  return flags
    .map(flag => flag.replace(/[{}]/g, ''))
    .filter(flag => dictionary[flag])
    .reduce((acc, flag) => {
      const replacement = dictionary[flag](changedProperty);
      console.log(replacement);
      return acc.replace(`{${flag}}`, replacement);
    }, message);
}

function getUserAction(changedProperty) {
  return changedProperty.value.length > changedProperty.prevValue.length ?
    'добавил' : 'удалил';
}

function getUserRole(changedProperty) {
  const rolesBefore = changedProperty.prevValue.match(/[0-9]+/g);
  const rolesAfter = changedProperty.prevValue.match(/[0-9]+/g);

  const roleId = rolesBefore
    .concat(rolesAfter)
    .filter((value, index, self) => self.indexOf(value) === index)[0];

  return queries.dictionary.getName('ProjectRolesDictionary', roleId);
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
