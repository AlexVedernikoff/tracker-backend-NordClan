const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function(sequelize, DataTypes) {
  const TaskAttachments = sequelize.define('TaskAttachments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    taskId: {
      field: 'task_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fileName: {
      field: 'file_name',
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: false
    },
    previewPath: {
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: true
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    size: {
      field: 'size',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    tableName: 'task_attachments',
    hooks: {
      afterFind: function(model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });
  
  TaskAttachments.defaultSelect = ['id', 'fileName', 'path', 'previewPath', 'size', 'type', 'deletedAt'];
  
  TaskAttachments.hasHistory();
  
  return TaskAttachments;
};
