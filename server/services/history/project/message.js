const _ = require('underscore');
const queries = require('./../../../models/queries');
const { getChangedProperty } = require('./../utils');
const { detectAction } = require('./../utils');
const constants = require('./../constants');

module.exports = async function (model) {
  const changedProperty = getChangedProperty(model);
  const resourceName = getResourceName(model, changedProperty);
  const resource = constants.resources[resourceName];

  if (!resource) {
    console.error('Message not found');
    return;
  }

  const { message, entities, messageEn } = await getResources(resource, model, changedProperty);
  return { message, entities, messageEn };
};

function getResourceName (model, changedProperty) {
  const action = detectAction(changedProperty);
  return model.field
    ? `${action}_${model.entity}_${model.field}`.toUpperCase()
    : `${action}_${model.entity}`.toUpperCase();
}

async function getResources (resource, model, changedProperty) {
  const message = await transformMessage(resource.message, changedProperty, model);
  const messageEn = await transformMessage(resource.messageEn, changedProperty, model, 'en');
  const properties = await transformProperties(model.entity, model.field, changedProperty);
  const propertiesEn = await transformProperties(model.entity, model.field, changedProperty, 'en');
  const entitiesName = resource.entities || [];
  const entities = entitiesName.reduce((acc, name) => {
    const key = getKey(name);
    acc[key] = getEntity(name, model);
    return acc;
  }, {});

  return {
    message: insertChangedProperties(message, properties),
    messageEn: insertChangedProperties(messageEn, propertiesEn),
    entities
  };
}

function getKey (name) {
  const keys = name.split('.');
  return keys[keys.length - 1];
}

function getEntity (name, model) {
  return name.split('.').reduce((acc, item) => acc[item], model);
}

async function transformMessage (message, changedProperty, model, locale = 'ru') {
  const flags = message.match(/{([^{}]+)}/g) || [];
  const dictionary = {
    role: async () => await getUserRole(changedProperty, locale),
    action: () => getUserAction(changedProperty, locale),
    tag: () => model.itemTag.tag.name
  };

  return await flags
    .map(flag => flag.replace(/[{}]/g, ''))
    .filter(flag => dictionary[flag])
    .reduce(async (pr, flag) => {
      const acc = await pr;
      const replacement = await dictionary[flag]();
      return acc.replace(`{${flag}}`, replacement);
    }, Promise.resolve(message));
}

function getUserAction (changedProperty, locale = 'ru') {
  switch (locale) {
  case 'ru':
    return changedProperty.value.length > changedProperty.prevValue.length
      ? 'добавил'
      : 'удалил';
  case 'en':
    return changedProperty.value.length > changedProperty.prevValue.length
      ? 'added'
      : 'removed';
  default:
    return undefined;
  }
}

async function getUserRole (changedProperty, locale = 'ru') {
  const rolesBefore = changedProperty.prevValue.match(/[0-9]+/g) || [];
  const rolesAfter = changedProperty.value.match(/[0-9]+/g) || [];
  const [ biggerArray, smallerArray ] = rolesBefore.length < rolesAfter.length
    ? [ rolesAfter, rolesBefore ]
    : [ rolesBefore, rolesAfter ];

  const value = _.difference(biggerArray, smallerArray)[0];
  return await queries.dictionary.getName('ProjectRolesDictionary', value, locale);
}

function insertChangedProperties (message, changedProperty) {
  let updatedMessage = message;
  updatedMessage = changedProperty.prevValue
    ? updatedMessage.replace('{prevValue}', changedProperty.prevValue)
    : updatedMessage;
  updatedMessage = changedProperty.value
    ? updatedMessage.replace('{value}', changedProperty.value)
    : updatedMessage;

  return updatedMessage;
}

async function transformProperties (entity, field, changedProperty, locale = 'ru') {
  const transformValue = async (value) => {
    const dictionary = {
      [field]: await queries.dictionary.getName(`${entity}StatusesDictionary`, value, locale)
    };

    return dictionary[field] || value;
  };

  const value = changedProperty
    ? await transformValue(changedProperty.value)
    : null;

  const prevValue = changedProperty
    ? await transformValue(changedProperty.prevValue)
    : null;

  return { value, prevValue };
}
