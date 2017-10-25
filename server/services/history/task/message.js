const queries = require('./../../../models/queries');

const entityWord = {
  create: 'задачу',
  update: 'задачи'
};

const ACTIONS = {
  SET: 'SET',
  DELETE: 'DELETE',
  CHANGE: 'CHANGE',
  CREATE: 'CREATE'
};

function getAction(values) {
  if (!values.value && values.preValue) {
    return ACTIONS.DELETE;
  } else if (values.value && values.prevValue) {
    return ACTIONS.SET;
  } else if (!values.value && !values.prevValue) {
    return ACTIONS.CREATE;
  } else if (values.value && values.prevValue) {
    return ACTIONS.CHANGE;
  }
}

exports.getAnswer = function (model) {
  const values = getValues(model);
  const initState  = {
    message: '',
    entities: {},
  };

  const messageHandlers = getAllHandlers(model, values);
  const messageHandler = messageHandlers.filter(handler => {
    return handler.statement(model);
  })[0];

  const answer = messageHandler ? messageHandler.answer(model) : initState;
  return {
    message: addPropertyDiff(answer.message, model, values),
    entities: answer.entities
  };
};

function getValues(model) {
  const types = ['Int', 'Str', 'Date', 'Float', 'Text'];
  const currentType = types.filter(type => {
    return model[`value${type}`] && model[`prevValue${type}`];
  });

  return {
    prevValue: model[`prevValue${currentType}`],
    value: model[`value${currentType}`]
  };
}

function getAllHandlers(model, values) {
  return [
    ...declarativeHandlers(model, values),
    ...generativeHandlers(model, values)
  ];
}

function addPropertyDiff(message, model, values) {
  const properties = {
    entity: {
      statusId: ' статус',
      name: ' название',
      typeId: ' тип',
      sprintId: ' спринт',
      description: ' описание',
      prioritiesId: ' приоритет',
      plannedExecutionTime: ' планируемое время исполнения',
      factExecutionTime: ' фактическое время исполнения',
      parentId: ' родителя'
    },
    changedValues: [
      {
        statement: ACTIONS.SET,
        message: ` '${transformValue(model, values, 'prev')}'`
      },
      {
        statement: ACTIONS.DELETE,
        message: ` '${transformValue(model, values)}'`
      },
      {
        statement: ACTIONS.CHANGE,
        message: ` с '${transformValue(model, values, 'prev')}'`
      },
      {
        statement: ACTIONS.CHANGE,
        message: ` на '${transformValue(model, values)}'`
      }
    ]
  };

  const action = getAction(values);
  const entity = properties.entity[model.field];
  const diff = properties.changedValues
    .filter(value => {
      return value.statement === action;
    })
    .map(value => {
      return value.message;
    })
    .join(' ');

  const suffix = `${entity} ${entityWord.update} ${diff}`;
  return diff ? `${message} ${suffix}` : message;
}

function transformValue(model, values, prev = false) {
  const value = prev ? values.prevValue : values.value;

  const valueTypes = {
    statusId: queries.dictionary.getName('TaskStatusesDictionary', value),
    typeId: queries.dictionary.getName('TaskTypesDictionary', value),
    sprintId: prev ? '{prevSprint}' : '{sprint}',
    parentId: prev ? '{prevParentTask}' : '{parentTask}'
  };

  return valueTypes[model.field];
}

function generativeHandlers(model, values) {
  const messages = {
    update: {
      DELETE: 'убрал(-а)',
      SET: 'установил(-а)',
      CHANGE: 'изменил(-а)'
    }
  };

  const action = getAction(values);
  const entityHandlers = ['sprint', 'prevSprint', 'parentTask', 'prevParentTask'];
  const message = messages[model.action] ? messages[model.action][action] : '';

  return entityHandlers.map(entity => {
    return {
      name: `${action} ${entity}`,
      statement: (model) => {
        return typeof(model[entity]) !== 'undefined';
      },
      answer: (model) => {
        return {
          message: message,
          entities: {
            [entity]: model[entity]
          }
        };
      }
    };
  });
}

//TODO generate all handlers
function declarativeHandlers(model, values) {
  const action = getAction(values);
  return [
    {
      name: 'create Task',
      statement: (model) => {
        return model.action === 'create' && model.entity === 'Task';
      },
      answer: (model) => {
        return {
          message: `создал(-а) ${entityWord.create} '${model.task.name}'`,
          entities: {}
        };
      }
    },
    {
      name: 'set performer',
      statement: (model) => {
        return model.entity === 'Task' && model.field === 'performerId' && action === ACTIONS.SET;
      },
      answer: (model) => {
        return {
          message: 'установил(-а) исполнителя {performer}',
          entities: {
            performer: model.performer
          }
        };
      }
    },
    {
      name: 'delete performer',
      statement: (model) => {
        return model.entity === 'Task' && model.field === 'performerId' && action === ACTIONS.DELETE;
      },
      answer: (model) => {
        return {
          message: 'убрал(-а) исполнителя {prevPerformer}',
          entities: {
            performer: model.performer
          },
        };
      }
    },
    {
      name: 'change performer',
      statement: (model) => {
        model.entity === 'Task' && model.field === 'performerId' && action === ACTIONS.CHANGE;
      },
      answer: (model) => {
        return {
          message: 'изменил(-а) исполнителя {prevPerformer} на {performer}',
          entities: {
            performer: model.performer,
            prevPerformer: model.prevPerformer
          },
        };
      }
    },
    {
      name: 'create link',
      statement: (model) => {
        return model.entity === 'TaskTask' && model.action === 'create' && model.field === null;
      },
      answer: (model) => {
        return {
          message: 'создал(-а) связь с задачей {linkedTask}',
          entities: {
            linkedTask: model.taskTasks
          },
        };
      }
    },
    {
      name: 'delete link',
      statement: (model) => {
        return model.entity === 'TaskTask' && model.action === 'update' && model.field !== null;
      },
      answer: (model) => {
        return {
          message: 'удалил(-а) связь с задачей {linkedTask}',
          entities: {
            linkedTask: model.taskTasks
          },
        };
      }
    },
    {
      name: 'create tag',
      statement: (model) => {
        return model.entity === 'ItemTag' && model.action === 'create' && model.field === null;
      },
      answer: (model) => {
        return {
          message: `создал(-а) тег '${model.itemTag ? model.itemTag.tag.name : ''}'`,
        };
      }
    },
    {
      name: 'delete tag',
      statement: (model) => {
        return model.entity === 'ItemTag' && model.action === 'update' && model.field !== null;
      },
      answer: (model) => {
        return {
          message: `удалил(-а) тег '${model.itemTag ? model.itemTag.tag.name : ''}'`
        };
      }
    },
    {
      name: 'attach file',
      statement: (model) => {
        return model.entity === 'TaskAttachment' && model.action === 'create' && model.field === null;
      },
      answer: (model) => {
        return {
          message: 'прикрепил(-а) файл {file}',
          entities: {
            file: model.taskAttachments
          }
        };
      }
    },
    {
      name: 'detach file',
      statement: (model) => {
        return model.entity === 'TaskAttachment' && model.action === 'update' && model.field !== null;
      },
      answer: (model) => {
        return {
          message: 'удалил(-а) файл {file}',
          entities: {
            file: model.taskAttachments
          }
        };
      }
    }
  ];
}
