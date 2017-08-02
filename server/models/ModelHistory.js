module.exports = function(sequelize, DataTypes) {
  const ModelHistory = sequelize.define('ModelHistory', {
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      field: 'entity_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    field: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prevValueStr: {
      field: 'prev_value',
      type: DataTypes.STRING,
      allowNull: true
    },
    valueStr: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prevValueInt: {
      field: 'prev_value_int',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valueInt: {
      field: 'value_int',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prevValueDate: {
      field: 'prev_value_date',
      type: DataTypes.DATE,
      allowNull: true
    },
    valueDate: {
      field: 'value_date',
      type: DataTypes.DATE,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: false,
    tableName: 'model_histories'
  });
  
  ModelHistory.associate = function(models) {
    ModelHistory.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      constraints: true,
    });
  
    ModelHistory.belongsTo(models.Task, {
      as: 'task',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });
  
    ModelHistory.belongsTo(models.Sprint, {
      as: 'sprint',
      foreignKey: {
        name: 'valueInt',
        field: 'value_int'
      },
      constraints: false,
    });
    
    ModelHistory.belongsTo(models.Sprint, {
      as: 'prevSprint',
      foreignKey: {
        name: 'prevValueInt',
        field: 'prev_value_int'
      },
      constraints: false,
    });
    
    ModelHistory.belongsTo(models.TaskUsers, {
      as: 'performer',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });
    
  
    ModelHistory.belongsTo(models.TaskTasks, {
      as: 'taskTasks',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });
    
    
    ModelHistory.belongsTo(models.ItemTag, {
      as: 'itemTag',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });
    
  };
  
  return ModelHistory;
};
