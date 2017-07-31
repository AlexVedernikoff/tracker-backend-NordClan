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
      this.hasMany(sequelize.models.ModelHistory, {
        foreignKey: {
          name: 'entityId',
          field: 'entity_id'
        },
        constraints: false,
        scope: {
          entity: this.name
        }
      });
      
      return this;
    },
  });
  
  const afterHook = function(model) {
    const userId = model.$modelOptions.sequelize.context.user.id;
    let diffObj = {};
    let action;
    console.log(model.$options.isNewRecord);
    
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
      })
        .catch((err) => {
          if(err) throw createError(err);
        });
    } else if(!_.isEmpty(diffObj)) {
      
      const arr = [];
      Object.keys(diffObj).forEach((key) => {
        arr.push({
          entity: this.options.name.singular,
          entityId: model.id,
          userId: userId,
          action: action,
          field: key,
          value: diffObj[key].newVal,
          previousValue: diffObj[key].oldVal,
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
  let dataValues = _.omit(newValue, commonExcludeFileds);
  let _previousDataValues = _.omit(oldValue, commonExcludeFileds);
  
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