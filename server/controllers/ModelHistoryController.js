const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');
const Sequelize = require('sequelize');

const entityWord = {};
let entity;

// Контроллер настроен только под задачи и требудет дороботок под проекты
exports.list = function(req, res, next){
  if(req.query.currentPage && !req.query.currentPage.match(/^\d+$/)) return next(createError(400, 'currentPage must be int'));
  if(req.query.pageSize && !req.query.pageSize.match(/^\d+$/)) return next(createError(400, 'pageSize must be int'));
  
  if(!req.query.pageSize) {
    req.query.pageSize = 25;
  }
  
  if(!req.query.currentPage) {
    req.query.currentPage = 1;
  }
  
  entity = req.params.entity;
  
  const where = {
    taskId: entity === 'task' ? req.params.entityId : null,
  };
  
  if(req.params.entity === 'task') {
    entityWord.create = 'задачу';
    entityWord.update = 'задачи';
  } else if(req.params.entity === 'project') {
    entityWord.create = 'проект';
    entityWord.update = 'проекта';
  }
  
  const result = [];
  
  models.ModelHistory
    .findAll({
      where: where,
      limit: req.query.pageSize,
      offset: req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
      order: [['createdAt', 'DESC']],
      include: [
        {
          as: 'parentTask',
          model: models.Task,
          where: Sequelize.literal('"ModelHistory"."field" = \'parentId\'' ),
          attributes: ['id','name', 'deletedAt'],
          required: false,
          paranoid: false,
        },
        {
          as: 'prevParentTask',
          model: models.Task,
          where: Sequelize.literal('"ModelHistory"."field" = \'parentId\'' ),
          attributes: ['id','name', 'deletedAt'],
          required: false,
          paranoid: false,
        },
        {
          as: 'sprint',
          model: models.Sprint,
          where: Sequelize.literal('"ModelHistory"."field" = \'sprintId\'' ),
          attributes: ['id', 'name', 'deletedAt'],
          required: false,
          paranoid: false,
        },
        {
          as: 'prevSprint',
          model: models.Sprint,
          where: Sequelize.literal('"ModelHistory"."field" = \'sprintId\'' ),
          attributes: ['id', 'name', 'deletedAt'],
          required: false,
          paranoid: false,
        },
        {
          as: 'author',
          model: models.User,
          attributes: models.User.defaultSelect,
          paranoid: false,
          required: false,
        },
        {
          as: 'task',
          model: models.Task,
          where: Sequelize.literal('"ModelHistory"."entity" = \'Task\'' ),
          attributes: ['id','name', 'deletedAt'],
          paranoid: false,
          required: false,
        },
        {
          as: 'taskTasks',
          model: models.TaskTasks,
          where: Sequelize.literal('"ModelHistory"."entity" = \'TaskTask\'' ),
          paranoid: false,
          required: false,
          include: [
            {
              as: 'task',
              model: models.Task,
              attributes: ['id', 'name', 'deletedAt'],
            }
          ]
        },
        {
          as: 'performer',
          model: models.TaskUsers,
          where: Sequelize.literal('"ModelHistory"."entity" = \'TaskUser\'' ),
          attributes: ['id', 'userId'],
          required: false,
          paranoid: false,
          include: [
            {
              as: 'user',
              model: models.User,
              attributes: models.User.defaultSelect,
              required: false,
              paranoid: false,
            },
          ]
        },
        {
          as: 'itemTag',
          model: models.ItemTag,
          where: Sequelize.literal('"ModelHistory"."entity" = \'ItemTag\'' ),
          required: false,
          paranoid: false,
          include: [
            {
              as: 'tag',
              model: models.Tag,
              attributes: ['name'],
              required: false,
              paranoid: false,
            },
          ]
        },
        {
          as: 'taskAttachments',
          model: models.TaskAttachments,
          where: Sequelize.literal('"ModelHistory"."entity" = \'TaskAttachment\'' ),
          attributes: models.TaskAttachments.defaultSelect,
          required: false,
          paranoid: false,
        },
      ],
    })
    .then((models) => {
  
      models.forEach(model => {
        const messageWithUsedModels = messageHandler(model);
        
        result.push({
          id: model.id,
          date: model.createdAt,
          message: messageWithUsedModels.message,
          entities: messageWithUsedModels.entities,
          author: model.author
        });
        
      });
      
      res.json(result);
    })
    .catch(err => next(err));
  
};

function messageHandler(model) {
  const entities = {};
  let message = '';
  const values = getValues(model);
  
  
  // Создал задачу
  if(model.action === 'create' && model.entity === 'Task') {
    message = 'cоздал(-а)';
    message += ' ' + entityWord.create;
    message += ` '${model.task.name}'`;
    return message;
  }
  
  // Исполнители
  if( model.entity === 'TaskUser' && model.action === 'create' && model.field === null) {
    entities.performer = model.performer;
    message = 'установил(-а) исполнителя {performer}';
    return message;
  }
  if(model.entity === 'TaskUser' && model.action === 'update' && model.field !== null) {
    entities.performer = model.performer;
    message = 'убрал(-а) исполнителя {performer}';
    return message;
  }
  
  // Связанные задачи
  if(model.entity === 'TaskTask' && model.action === 'create' && model.field === null) {
    entities.linkedTask = model.taskTasks;
    message = 'создал(-а) связь с задачей {linkedTask}';
    return message;
  }
  if(model.entity === 'TaskTask' && model.action === 'update' && model.field !== null) {
    entities.linkedTask = model.taskTasks;
    message = 'удалил(-а) связь с задачей {linkedTask}';
    return message;
  }
  
  // Теги
  if(model.entity === 'ItemTag' && model.action === 'create' && model.field === null) {
    message = `создал(-а) тег '${model.itemTag.tag.name}'`;
    return message;
  }
  if(model.entity === 'ItemTag' && model.action === 'update' && model.field !== null) {
    message = `удалил(-а) тег '${model.itemTag.tag.name}'`;
    return message;
  }
  
  // Файлы
  if(model.entity === 'TaskAttachment' && model.action === 'create' && model.field === null) {
    entities.file = model.taskAttachments;
    message = 'прикрепил(-а) файл {file}';
    return message;
  }
  if(model.entity === 'TaskAttachment' && model.action === 'update' && model.field !== null) {
    entities.file = model.taskAttachments;
    message = 'удалил(-а) файл {file}';
    return message;
  }
  
  if(model.sprint) entities.sprint = model.sprint;
  if(model.prevSprint) entities.prevSprint = model.prevSprint;
  if(model.parentTask) entities.parentTask = model.parentTask;
  if(model.prevParentTask) entities.prevParentTask = model.prevParentTask;
  
  
  
  
  if(model.action === 'update') {
    if(values.value  === null && values.prevValue) { // убрал
      message = 'убрал(-а)';
    } else if (values.value  && values.prevValue === null) { // установил
      message = 'установил(-а)';
    }else { // изменил
      message = 'изменил(-а)';
    }
  }

  
  switch(model.field) {
  case 'statusId': message += ' статус'; break;
  case 'name': message += ' название'; break;
  case 'typeId': message += ' тип'; break;
  case 'sprintId': message += ' спринт'; break;
  case 'description': message += ' описание'; break;
  case 'prioritiesId': message += ' приоритет'; break;
  case 'plannedExecutionTime': message += ' планируемое время исполнения'; break;
  case 'factExecutionTime': message += ' фактическое время исполнения'; break;
  case 'parentId': message += ' родителя'; break;
  }
  
  message += ' ' + entityWord.update;
  
  if(values.value  === null && values.prevValue) { // убрал
    message += ` '${transformValue(model, values, 'prev')}'`;
  } else if (values.value  && values.prevValue === null) { // установил
    message += ` '${transformValue(model, values)}'`;
  }else { // изменил
    if(values.prevValue !== null)
      message += ` с '${transformValue(model, values, 'prev')}'`;
    if(values.value !== null)
      message += ` на '${transformValue(model, values)}'`;
    
  }
  
  return {
    message: message,
    entities: entities,
  };
}



function transformValue(model, values, prev = false) {
  const field = model.field;
  let value = prev ? values.prevValue : values.value;
  
  switch(entity + '_' + field) {
  case 'task_statusId': value = queries.dictionary.getName('TaskStatusesDictionary', value); break;
  case 'task_typeId': value = queries.dictionary.getName('TaskTypesDictionary', value); break;
  case 'task_sprintId': value = prev ? '{prevSprint}' : '{sprint}'; break;
  case 'task_parentId': value = prev ? '{prevParentTask}' : '{parentTask}'; break;
  }
  
  return value;
}


function getValues(model) {
  const result = {
    prevValue: null,
    value: null,
  };
  
  if(model.prevValueInt !== null) {
    result.prevValue = model.prevValueInt;
  }
  if(model.prevValueStr !== null) {
    result.prevValue = model.prevValueStr;
  }
  if(model.prevValueDate !== null) {
    result.prevValue = model.prevValueDate;
  }
  if(model.prevValueFloat !== null) {
    result.prevValue = model.prevValueFloat;
  }
  
  if(model.valueInt !== null) {
    result.value = model.valueInt;
  }
  if(model.valueStr !== null) {
    result.value = model.valueStr;
  }
  if(model.valueDate !== null) {
    result.value = model.valueDate;
  }
  if(model.valueFloat !== null) {
    result.value = model.valueFloat;
  }
  
  return result;
}