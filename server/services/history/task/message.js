const queries = require('./../../../models/queries');
const { getChangedProperty, detectAction } = require('./../utils');
const constants = require('./../constants');
const ACTIONS = constants.actions;

const entityWord = {
  ru: {
    create: 'задачу',
    update: 'задачи',
    delete: 'задачу'
  },
  en: {
    create: 'task',
    update: 'task',
    delete: 'task'
  }
};

module.exports = async function (model) {
  const changedProperty = getChangedProperty(model);
  const messageHandlers = declarativeHandlers();
  const messageHandler = await messageHandlers.filter(handler => {
    return handler.statement(model, changedProperty);
  })[0];

  const answer = messageHandler
    ? messageHandler.answer(model)
    : await generativeAnswer(model, changedProperty);

  return {
    message: answer.message,
    messageEn: answer.messageEn,
    entities: answer.entities
  };
};


//TODO refactoring
async function generativeAnswer (model, values) {
  const result = {
    message: '',
    messageEn: '',
    entities: {}
  };

  if (model.sprint) result.entities.sprint = model.sprint;
  if (model.prevSprint) result.entities.prevSprint = model.prevSprint;
  if (model.parentTask) result.entities.parentTask = model.parentTask;
  if (model.prevParentTask) result.entities.prevParentTask = model.prevParentTask;

  if (model.action === 'update') {
    if ((values.value === null && values.prevValue) || (values.value === true && values.prevValue === false)) { // убрал
      result.message = 'убрал(-а)';
      result.messageEn = 'removed';
    } else if ((values.value && values.prevValue === null) || (values.value === false && values.prevValue === true)) { // установил
      result.message = 'установил(-а)';
      result.messageEn = 'setted';
    } else { // изменил
      result.message = 'изменил(-а)';
      result.messageEn = 'changed';
    }
  }

  switch (model.field) {
  case 'statusId':
    result.message += ' статус';
    result.messageEn += ' status';
    break;
  case 'name':
    result.message += ' название';
    result.messageEn += ' name';
    break;
  case 'typeId':
    result.message += ' тип';
    result.messageEn += ' type';
    break;
  case 'sprintId':
    result.message += ' спринт';
    result.messageEn += ' sprint';
    break;
  case 'description':
    result.message += ' описание';
    result.messageEn += ' description';
    break;
  case 'prioritiesId':
    result.message += ' приоритет';
    result.messageEn += ' приоритет';
    break;
  case 'plannedExecutionTime':
    result.message += ' планируемое время исполнения';
    result.messageEn += ' planned time';
    break;
  case 'factExecutionTime':
    result.message += ' фактическое время исполнения';
    result.messageEn += ' fact execution time';
    break;
  case 'parentId':
    result.message += ' родителя';
    result.messageEn += ' parent';
    break;
  case 'isTaskByClient':
    result.message += ' признак "От клиента"';
    result.messageEn += ' "From client"';
    break;
  default:
    break;
  }

  if (model.field !== 'isTaskByClient') {
    result.message += ' ' + entityWord.ru.update;
    result.messageEn += ' ' + entityWord.en.update;
  } else {
    return result;
  }

  if (values.value === null && values.prevValue) { // убрал
    result.message += ` '${await transformValue(model, values, 'prev')}'`;
    result.messageEn += ` '${await transformValue(model, values, 'prev', 'en')}'`;
  } else if (values.value && values.prevValue === null) { // установил
    result.message += ` '${await transformValue(model, values)}'`;
    result.messageEn += ` '${await transformValue(model, values, false, 'en')}'`;
  } else { // изменил
    if (values.prevValue !== null) {
      result.message += ` с '${await transformValue(model, values, 'prev')}'`;
      result.messageEn += ` from '${await transformValue(model, values, 'prev', 'en')}'`;
    }
    if (values.value !== null) {
      result.message += ` на '${await transformValue(model, values)}'`;
      result.messageEn += ` to '${await transformValue(model, values, false, 'en')}'`;
    }
  }

  return result;
}

async function transformValue (model, changedProperty, hasPrevChangedProperty = false, locale = 'ru') {
  const currentValue = hasPrevChangedProperty
    ? changedProperty.prevValue
    : changedProperty.value;

  const changedValue = {
    statusId: await queries.dictionary.getName('TaskStatusesDictionary', currentValue, locale),
    typeId: await queries.dictionary.getName('TaskTypesDictionary', currentValue, locale),
    sprintId: hasPrevChangedProperty ? '{prevSprint}' : '{sprint}',
    parentId: hasPrevChangedProperty ? '{prevParentTask}' : '{parentTask}'
  };

  return changedValue[model.field] || currentValue;
}

function declarativeHandlers () {
  return [
    {
      name: 'create Task',
      statement: (model) => {
        return model.action === 'create' && model.entity === 'Task' && model.entityId === model.taskId;
      },
      answer: (model) => {
        return {
          message: `создал(-а) ${entityWord.ru.create} '${model.task.name}'`,
          messageEn: `created ${entityWord.en.create} '${model.task.name}'`,
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
          message: `создал(-а) под${entityWord.ru.create} {subTask}`,
          messageEn: `created sub${entityWord.en.create} {subTask}`,
          entities: {
            subTask: model.subTask
          }
        };
      }
    },
    {
      name: 'remove Subtask',
      statement: (model) => {
        return model.action === 'update' && model.entity === 'Task' && model.entityId !== model.taskId;
      },
      answer: (model) => {
        return {
          message: `отменил(-а) под${entityWord.ru.delete} {subTask}`,
          messageEn: `removed sub${entityWord.en.delete} {subTask}`,
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
          messageEn: 'setted performer {performer}',
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
          messageEn: 'removed performer {prevPerformer}',
          entities: {
            prevPerformer: model.prevPerformer
          }
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
          messageEn: 'changed performer from {prevPerformer} to {performer}',
          entities: {
            performer: model.performer,
            prevPerformer: model.prevPerformer
          }
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
          messageEn: 'created a connection with task {linkedTask}',
          entities: {
            linkedTask: model.taskTasks
          }
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
          messageEn: 'removed connection with task {linkedTask}',
          entities: {
            linkedTask: model.taskTasks
          }
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
          messageEn: `created tag '${model.itemTag ? model.itemTag.tag.name : ''}'`
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
          message: `удалил(-а) тег '${model.itemTag ? model.itemTag.tag.name : ''}'`,
          messageEn: `deleted tag '${model.itemTag ? model.itemTag.tag.name : ''}'`
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
          messageEn: 'attached file {file}',
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
          messageEn: 'removed file {file}',
          entities: {
            file: model.taskAttachments
          }
        };
      }
    }
  ];
}
