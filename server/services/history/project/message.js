const _ = require('underscore');
const queries = require('./../../../models/queries');
const { getChangedProperty } = require('./../utils');
const { detectAction } = require('./../utils');
const constants = require('./../constants');

module.exports = function(model) {
  const changedProperty = getChangedProperty(model);
  const resourceName = getResourceName(model, changedProperty);
  const resource = constants.resources[resourceName];

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
  const message = transformMessage(resource.message, changedProperty, model);
  const properties = transformProperties(model.field, changedProperty);
  const entitiesName = resource.entities || [];
  const entities = entitiesName.reduce((acc, name) => {
    const key = getKey(name);
    acc[key] = getEntity(name, model);
    return acc;
  }, {});

  return {
    message: insertChangedProperties(message, properties),
    entities
  };
}

function getKey(name) {
  const keys = name.split('.');
  return keys[keys.length - 1];
}

function getEntity(name, model) {
  return name.split('.').reduce((acc, item) => acc[item], model);
}

function transformMessage(message, changedProperty, model) {
  //TODO Плохой regexp, символы {} попадают в группу, а надо без них
  //из этого делаю лишний map
  const flags = message.match(/{([^{}]+)}/g) || [];
  const dictionary = {
    role: (changedProperty) => getUserRole(changedProperty),
    action: (changedProperty) => getUserAction(changedProperty),
    tag: (changedProperty, model) => model.itemTag.tag.name
  };

  return flags
    .map(flag => flag.replace(/[{}]/g, ''))
    .filter(flag => dictionary[flag])
    .reduce((acc, flag) => {
      const replacement = dictionary[flag](changedProperty, model);
      return acc.replace(`{${flag}}`, replacement);
    }, message);
}

function getUserAction(changedProperty) {
  return changedProperty.value.length > changedProperty.prevValue.length ?
    'добавил' : 'удалил';
}

function getUserRole(changedProperty) {
  const rolesBefore = changedProperty.prevValue.match(/[0-9]+/g) || [];
  const rolesAfter = changedProperty.value.match(/[0-9]+/g) || [];
  const [ biggerArray, smallerArray ] = rolesBefore.length < rolesAfter.length ?
    [ rolesAfter, rolesBefore ] :
    [ rolesBefore, rolesAfter ];

  const value = _.difference(biggerArray, smallerArray)[0];
  return queries.dictionary.getName('ProjectRolesDictionary', value);
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
      statusId: queries.dictionary.getName('ProjectStatusesDictionary', property)
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
