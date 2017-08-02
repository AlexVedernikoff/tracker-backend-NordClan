const createError = require('http-errors');
const Sequelize = require('sequelize');
const _ = require('underscore');


const commonExcludeFileds =  ['id', 'updated_at', 'updatedAt', 'createdAt', 'created_at', 'authorId'];

module.exports = function(sequelize) {
  
  
  _.extend(sequelize.Model.prototype, {
    hasHistory: function() {
      this.revisionable = true;
      //runMigration(this, sequelize);

      
      // this.attributes[options.revisionAttribute] = {
      //   type: Sequelize.INTEGER,
      //   defaultValue: 0
      // };
      //this.refreshAttributes();
      
      
      // this.addHook('beforeCreate', beforeHook);
      // this.addHook('beforeUpdate', beforeHook);
      this.addHook('afterCreate', afterHook);
      this.addHook('afterUpdate', afterHook);
      this.addHook('afterDestroy', afterHook);
      
      // create association
      // this.hasMany(sequelize.models.ModelHistory, {
      //   foreignKey: {
      //     name: 'entityId',
      //     field: 'entity_id'
      //   },
      //   constraints: false,
      //   scope: {
      //     entity: this.name
      //   }
      // });

      
      return this;
    },
  });
  
  const afterHook = function(model) {
    console.log(model);
    
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
    
    
    
    if(model.$options.isNewRecord) {
      sequelize.models.ModelHistory.create({
        entity: this.options.name.singular,
        entityId: model.id,
        userId: userId,
        action: action,
        // field: (model.linkedTaskId) ? 'linkedTaskId' : null,
        // valueInt: (model.linkedTaskId) ? model.linkedTaskId : null,
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
  
  // console.log(dataValues);
  // console.log(_previousDataValues);
  
  
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

function runMigration(ctx, sequelize) {
  const tableName = ctx.getTableName();
  sequelize.getQueryInterface()
    .describeTable(tableName)
    .then(function (attributes) {
      if(!attributes) throw createError(500, 'can\'t describeTable');
      
      return sequelize.getQueryInterface().addColumn(tableName, 'revision', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }).then(function () {
        return null;
      });

    })
    .catch(function (err) {
      throw createError(err);
    });
}