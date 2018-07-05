const queries = require('./../../../models/queries');
const { getChangedProperty, detectAction } = require('./../utils');
const constants = require('./../constants');
const ACTIONS = constants.actions;

const entityWord = {
  create: 'задачу',
  update: 'задачи'
};

module.exports = function (model) {
  const changedProperty = getChangedProperty(model);
  const messageHandlers = declarativeHandlers();
  const messageHandler = messageHandlers.filter(handler => {
    return handler.statement(model, changedProperty);
  })[0];

  const answer = messageHandler ?
    messageHandler.answer(model) :
    generativeAnswer(model, changedProperty);

  return {
    message: answer.message,
    entities: answer.entities
  };
};


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

  if (model.action === 'update') {
    if ((values.value === null && values.prevValue) || (values.value === true && values.prevValue === false)) { // убрал
      result.message = 'убрал(-а)';
    } else if ((values.value && values.prevValue === null) || (values.value === false && values.prevValue === true)) { // установил
      result.message = 'установил(-а)';
    } else { // изменил
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
  case 'isTaskByClient': result.message += ' признак "От клиента"'; break;
  }

  if (model.field !== 'isTaskByClient') {
    result.message += ' ' + entityWord.update;
  } else {
    return result;
  }

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

function declarativeHandlers() {
  return [
    {
      name: 'create Task',
      statement: (model) => {
        return model.action === 'create' && model.entity === 'Task' && model.entityId === model.taskId;
      },
      answer: (model) => {
        return {
          message: `создал(-а) ${entityWord.create} '${model.task.name}'`,
          entities: {}
        };
      }
    },
    {
      name: 'create Subtask',
      statement: (model) => {
        return model.action === 'create' && model.entity === 'Task' && model.entityId !== model.taskId;
      },
      answer: (model) => {
        return {
          message: `создал(-а) под${entityWord.create} {subTask}`,
          entities: {
            subTask: model.subTask
          }
        };
      }
    },
    {
      name: 'set performer',
      statement: (model, values) => {
        return model.entity === 'Task' && model.field === 'performerId' && detectAction(values) === ACTIONS.SET;
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
      statement: (model, values) => {
        return model.entity === 'Task' && model.field === 'performerId' && detectAction(values) === ACTIONS.DELETE;
      },
      answer: (model) => {
        return {
          message: 'убрал(-а) исполнителя {prevPerformer}',
          entities: {
            prevPerformer: model.prevPerformer
          },
        };
      }
    },
    {
      name: 'change performer',
      statement: (model, values) => {
        return model.entity === 'Task' && model.field === 'performerId' && detectAction(values) === ACTIONS.CHANGE;
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
