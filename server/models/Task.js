const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    name: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    typeId: {
      field: 'type_id',
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    statusId: {
      field: 'status_id',
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    description: {
      trim: true,
      type: DataTypes.TEXT,
      defaultValue: null
    },
    plannedExecutionTime: {
      field: 'planned_execution_time',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      isDecimal: {
        isFloat: true
      },
      get: function () {
        return +('' + this.getDataValue('plannedExecutionTime'));
      }
    },
    factExecutionTime: {
      field: 'fact_execution_time',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      isDecimal: {
        isFloat: true
      },
      get: function () {
        return +('' + this.getDataValue('factExecutionTime'));
      }
    },
    prioritiesId: {
      field: 'priorities_id',
      type: DataTypes.INTEGER,
      defaultValue: 3,
      validate: {
        isInt: true
      }
    },
    performerId: {
      field: 'performer_id',
      type: DataTypes.INTEGER,
      allowNull: true
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
    tableName: 'tasks',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });

  Task.associate = function (models) {
    Task.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id',
        allowNull: false
      }
    });

    Task.belongsTo(models.TaskStatusesDictionary, {
      as: 'taskStatus',
      foreignKey: {
        name: 'statusId',
        field: 'status_id',
        allowNull: false
      }
    });

    Task.belongsTo(models.TaskTypesDictionary, {
      as: 'type',
      foreignKey: {
        name: 'typeId',
        field: 'type_id',
        allowNull: false
      }
    });

    Task.belongsTo(models.Task, {
      as: 'parentTask',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id'
      }
    });

    Task.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'authorId',
        field: 'author_id'
      }
    });

    Task.hasMany(models.Task, {
      as: 'subTasks',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id'
      }
    });

    Task.belongsToMany(models.Task, {
      as: 'linkedTasks',
      through: {
        model: models.TaskTasks,
        unique: false
      },
      foreignKey: {
        name: 'taskId',
        field: 'task_id'
      }
    });

    Task.belongsTo(models.Sprint, {
      as: 'sprint',
      foreignKey: {
        name: 'sprintId',
        field: 'sprint_id'
      }
    });

    Task.belongsToMany(models.Tag, {
      as: 'tags',
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'task'
        }
      },
      foreignKey: 'taggable_id',
      constraints: false
    });

    Task.belongsToMany(models.Tag, {
      as: 'tagForQuery',
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'task'
        }
      },
      foreignKey: 'taggable_id',
      constraints: false
    });

    Task.belongsTo(models.User, {
      as: 'performer',
      foreignKey: {
        name: 'performerId',
        field: 'performer_id'
      }
    });

    Task.hasMany(models.TaskAttachments, {
      as: 'attachments',
      foreignKey: 'task_id'
    });

  };

  Task.addHistoryForTask();

  return Task;
};


