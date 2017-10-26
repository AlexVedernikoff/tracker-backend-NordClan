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

function getAction(changedProperty) {
  if (!changedProperty.value && changedProperty.preValue) {
    return ACTIONS.DELETE;
  } else if (changedProperty.value && !changedProperty.prevValue) {
    return ACTIONS.SET;
  } else if (!changedProperty.value && !changedProperty.prevValue) {
    return ACTIONS.CREATE;
  } else if (changedProperty.value && changedProperty.prevValue) {
    return ACTIONS.CHANGE;
  }
}

exports.getAnswer = function (model) {
  const changedProperty = getChangedProperty(model);
  const messageHandlers = declarativeHandlers(model, changedProperty);
  const messageHandler = messageHandlers.filter(handler => {
    return handler.statement(model);
  })[0];

  const answer = messageHandler ?
    messageHandler.answer(model) :
    generativeAnswer(model, changedProperty);

  return {
    message: answer.message,
    entities: answer.entities
  };
};

function getChangedProperty(model) {
  const types = ['Int', 'Str', 'Date', 'Float', 'Text'];
  const currentType = types.filter(type => {
    return model[`value${type}`] || model[`prevValue${type}`];
  })[0];

  return {
    prevValue: model[`prevValue${currentType}`] || null,
    value: model[`value${currentType}`] || null
  };
}

function transformValue(model, changedProperty, hasPrevChangedProperty = false) {
  const currentValue = hasPrevChangedProperty ?
    changedProperty.prevValue :
    changedProperty.value;

  const changedValue = {
    statusId: queries.dictionary.getName('TaskStatusesDictionary', currentValue),
    typeId: queries.dictionary.getName('TaskTypesDictionary', currentValue),
    sprintId: hasPrevChangedProperty ? '{prevSprint}' : '{sprint}',
    parentId: hasPrevChangedProperty ? '{prevParentTask}' : '{parentTask}'
  };

  return changedValue[model.field] || currentValue;
}

//TODO refactoring
function generativeAnswer(model, values) {
  let result = {
    message: '',
    entities: {}
  };

  if(model.sprint) result.entities.sprint = model.sprint;
  if(model.prevSprint) result.entities.prevSprint = model.prevSprint;
  if(model.parentTask) result.entities.parentTask = model.parentTask;
  if(model.prevParentTask) result.entities.prevParentTask = model.prevParentTask;

  if(model.action === 'update') {
    if(values.value  === null && values.prevValue) { // убрал
      result.message = 'убрал(-а)';
    } else if (values.value  && values.prevValue === null) { // установил
      result.message = 'установил(-а)';
    }else { // изменил
      result.message = 'изменил(-а)';
    }
  }

  switch(model.field) {
  case 'statusId': result.message += ' статус'; break;
  case 'name': result.message += ' название'; break;
  case 'typeId': result.message += ' тип'; break;
  case 'sprintId': result.message += ' спринт'; break;
  case 'description': result.message += ' описание'; break;
  case 'prioritiesId': result.message += ' приоритет'; break;
  case 'plannedExecutionTime': result.message += ' планируемое время исполнения'; break;
  case 'factExecutionTime': result.message += ' фактическое время исполнения'; break;
  case 'parentId': result.message += ' родителя'; break;
  }

  result.message += ' ' + entityWord.update;

  if(values.value  === null && values.prevValue) { // убрал
    result.message += ` '${transformValue(model, values, 'prev')}'`;
  } else if (values.value  && values.prevValue === null) { // установил
    result.message += ` '${transformValue(model, values)}'`;
  }else { // изменил
    if(values.prevValue !== null)
      result.message += ` с '${transformValue(model, values, 'prev')}'`;
    if(values.value !== null)
      result.message += ` на '${transformValue(model, values)}'`;
  }

  return result;
}

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
