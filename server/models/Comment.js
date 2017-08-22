const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function(sequelize, DataTypes) {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validate: {
        isInt: true,
      }
    },
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      }
    },
    parentId: {
      field: 'parent_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
      }
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      trim: true,
      type: DataTypes.TEXT,
      defaultValue: null
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
  }, {
    indexes: [
      {
        method: 'BTREE',
        fields: ['task_id']
      }
    ],
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'comments',
    hooks: {
      afterFind: function(model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }

  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.Task, {
      as: 'task',
      foreignKey: {
        name: 'taskId',
        field: 'task_id'
      }
    });
    Comment.belongsTo(models.User, {
      as: 'author',
      foreignKey: {
        name: 'authorId',
        field: 'author_id'
      }
    });
    Comment.belongsTo(models.Comment, {
      as: 'parentComment',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id'
      }
    });
    Comment.hasMany(models.Comment, {
      as: 'childComment',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id'
      }
    });
  };

  Comment.defaultSelect = ['id', 'taskId', 'parentId', 'authorId', 'text', 'createdAt', 'updatedAt'];

  return Comment;
};