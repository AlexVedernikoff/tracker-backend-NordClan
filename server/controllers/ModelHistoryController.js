const createError = require('http-errors');
const models = require('../models');
const queries = require('../models/queries');
const Sequelize = require('sequelize');

const entityWord = {};
let entity;

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
      limit: req.query.pageSize,
      include: [
        {
          as: 'user',
          model: models.User,
          attributes: models.User.defaultSelect
        },
        {
          as: 'task',
          model: models.Task,
          attributes: ['name'],
          required: false,
        },
        {
          as: 'sprint',
          model: models.Sprint,
          where: Sequelize.literal('"ModelHistory"."field" = \'sprintId\'' ),
          attributes: ['name'],
          required: false,
          paranoid: false,
        },
        {
          as: 'prevSprint',
          model: models.Sprint,
          where: Sequelize.literal('"ModelHistory"."field" = \'sprintId\'' ),
          attributes: ['name'],
          required: false,
          paranoid: false,
        },
        

      ],
      offset: req.query.currentPage > 0 ? +req.query.pageSize * (+req.query.currentPage - 1) : 0,
      order: [['createdAt', 'ASC']],
    })
    .then((models) => {
  
      models.forEach(model => {
        
        console.log(model.sprint);
        console.log(model.prevSprint);
        
        result.push({
          date: model.createdAt,
          message: generateMessage(model),
          user: model.user
        });
        
      });
      
      res.json(result);
    })
    .catch(err => next(err));
  
};

function generateMessage(model) {
  let message = '';
  
  
  if(model.action === 'create') {
    message = 'cоздал(-а)';
    message += ' ' + entityWord.create;
    message += ` '${model.task.name}'`;
    return message;
  }
  
  if(model.action === 'update') {
    if(model.field === 'deletedAt') {
      message = 'удалил(-а)';
    } else {
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
  }
  
  const values = getValues(model);
  
  
  
  message += ' ' + entityWord.update;
  
  if(values.prevValue !== null && values.prev) {
    message += ` с '${transformValue(model, values, 'prev')}' на `;
  } else if(values.prevValue !== null) {
    message += ` с '${transformValue(model, values, 'prev')}'`;
  }
  
  
  if(values.value !== null)
    message += ` на '${transformValue(model, values)}'`;
  
  
  return message;
}



function transformValue(model, values, prev = false) {
  const field = model.field;
  let value = prev ? values.prevValue : values.value;
  
    
  switch(entity + '_' + field) {
  case 'task_statusId': value = queries.dictionary.getName('TaskStatusesDictionary', value); break;
  case 'task_typeId': value = queries.dictionary.getName('TaskTypesDictionary', value); break;
  case 'task_sprintId': value = prev ? model.prevSprint.name : model.sprint.name; break;
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
  
  if(model.valueInt !== null) {
    result.value = model.valueInt;
  }
  if(model.valueStr !== null) {
    result.value = model.valueStr;
  }
  if(model.valueDate !== null) {
    result.value = model.valueDate;
  }
  
  return result;
}