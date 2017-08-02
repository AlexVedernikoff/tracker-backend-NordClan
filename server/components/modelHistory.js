const createError = require('http-errors');
const Sequelize = require('sequelize');
const _ = require('underscore');

const commonExcludeFileds =  ['id', 'updated_at', 'updatedAt', 'createdAt', 'created_at', 'authorId'];

module.exports = function(sequelize) {
  
  
  _.extend(sequelize.Model.prototype, {
    hasHistory: function() {
      this.revisionable = true;

      this.addHook('afterCreate', afterHook);
      this.addHook('afterUpdate', afterHook);
      this.addHook('afterDestroy', afterHook);
      
      
      return this;
    },
  });
  
  const afterHook = function(model) {
    const userId = model.$modelOptions.sequelize.context.user.id;
    const modelNamePlural = model.$modelOptions.name.plural;
    const modelNameSingular = model.$modelOptions.name.singular;
    let diffObj = {};
    let action;
    
    
    if(model.$options.isNewRecord) {
      action = 'create';
    } else {
      action = 'update';
      diffObj = diff(model.dataValues, model._previousDataValues);
    }
    
    const taskId = model.taskId ? model.taskId :
      this.options.name.singular === 'Task' ? model.id : null;
    
    
    if(model.$options.isNewRecord) {
      sequelize.models.ModelHistory.create({
        entity: this.options.name.singular,
        entityId: model.id,
        userId: userId,
        taskId: taskId,
        action: action,
      })
        .catch((err) => {
          if(err) throw createError(err);
        });
    } else if(!_.isEmpty(diffObj)) {
      
      const arr = [];
      Object.keys(diffObj).forEach((key) => {
        let type;
        
        if(sequelize.models[modelNamePlural]) {
          type = sequelize.models[modelNamePlural].attributes[key].type.key;
        } else {
          type = sequelize.models[modelNameSingular].attributes[key].type.key;
        }
        
        
        arr.push({
          entity: this.options.name.singular,
          entityId: model.id,
          userId: userId,
          taskId: taskId,
          action: action,
          field: key,
          valueInt: (type === 'INTEGER') ? diffObj[key].newVal : null,
          prevValueInt: (type === 'INTEGER') ? diffObj[key].oldVal : null,
          valueStr: (type === 'STRING') ? diffObj[key].newVal : null,
          prevValueStr: (type === 'STRING') ? diffObj[key].oldVal : null,
          valueDate: (type === 'DATE') ? diffObj[key].newVal : null,
          prevValueDate: (type === 'DATE') ? diffObj[key].oldVal : null,
        });
      });
      
      
  
      sequelize.models.ModelHistory.bulkCreate(arr)
        .catch((err) => {
          if(err) throw createError(err);
        });
      
    }
    
  };

};

function diff(newValue, oldValue) {
  const dataValues = _.omit(newValue, commonExcludeFileds);
  const _previousDataValues = _.omit(oldValue, commonExcludeFileds);
  
  
  // Разница двух объектов
  const diffKeys = _.keys(_.omit(dataValues, (val,key) => {
    let newValue = val;
    let oldValue = _previousDataValues[key];
    
    //console.log(newValue, oldValue);
    if(newValue && newValue.toString().match(/^[0-9]+$/))  newValue = +newValue;
    if(oldValue && oldValue.toString().match(/^[0-9]+$/))  oldValue = +oldValue;
    //console.log(newValue, oldValue);
    
    return newValue === oldValue;
  }));
  
  const diffObj = {};
  diffKeys.forEach((key) => {
    diffObj[key] = {
      newVal: dataValues[key],
      oldVal: _previousDataValues[key],
    };
  });
  return diffObj;
}
