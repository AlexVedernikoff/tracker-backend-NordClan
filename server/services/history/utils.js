const ACTIONS = require('./constants').actions;

exports.getChangedProperty = function(model) {
  const types = ['Int', 'Str', 'Date', 'Float', 'Text'];
  const currentType = types.filter(type => {
    return model[`value${type}`] || model[`prevValue${type}`];
  })[0];

  return {
    prevValue: model[`prevValue${currentType}`] || null,
    value: model[`value${currentType}`] || null
  };
};

exports.detectAction = function(changedProperty) {
  if (!changedProperty.value && changedProperty.prevValue) {
    return ACTIONS.DELETE;
  } else if (changedProperty.value && !changedProperty.prevValue) {
    return ACTIONS.SET;
  } else if (!changedProperty.value && !changedProperty.prevValue) {
    return ACTIONS.CREATE;
  } else if (changedProperty.value && changedProperty.prevValue) {
    return ACTIONS.CHANGE;
  }
};
