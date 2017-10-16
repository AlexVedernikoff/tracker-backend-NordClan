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
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
      allowNull: true
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
    valueFloat: {
      field: 'value_float',
      type: DataTypes.FLOAT,
      allowNull: true
    },
    prevValueFloat: {
      field: 'prev_value_float',
      type: DataTypes.FLOAT,
      allowNull: true
    },
    valueText: {
      field: 'value_text',
      type: DataTypes.TEXT,
      allowNull: true
    },
    prevValueText: {
      field: 'prev_value_text',
      type: DataTypes.TEXT,
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
    ModelHistory.belongsTo(models.Task, {
      as: 'parentTask',
      foreignKey: {
        name: 'valueInt',
        field: 'value_int'
      },
      constraints: false,
    });
    
    ModelHistory.belongsTo(models.Task, {
      as: 'prevParentTask',
      foreignKey: {
        name: 'prevValueInt',
        field: 'prev_value_int'
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
    
    ModelHistory.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      constraints: true,
    });
    
    ModelHistory.belongsTo(models.Task, {
      as: 'task',
      foreignKey: {
        name: 'taskId',
        field: 'task_id'
      },
      constraints: true,
    });
    
  
    ModelHistory.belongsTo(models.User, {
      as: 'performer',
      foreignKey: {
        name: 'valueInt',
        field: 'value_int'
      },
      constraints: true,
    });
    
    ModelHistory.belongsTo(models.User, {
      as: 'prevPerformer',
      foreignKey: {
        name: 'prevValueInt',
        field: 'prev_value_int'
      },
      constraints: true,
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
    
    ModelHistory.belongsTo(models.TaskAttachments, {
      as: 'taskAttachments',
      foreignKey: {
        name: 'entityId',
        field: 'entity_id'
      },
      constraints: false,
    });
    
  };
  
  return ModelHistory;
};
