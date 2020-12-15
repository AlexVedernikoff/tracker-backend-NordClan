const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const ProjectAttachments = sequelize.define('ProjectAttachments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fileName: {
      field: 'file_name',
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: false,
    },
    previewPath: {
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: true,
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
      type: DataTypes.STRING(80),
      trim: true,
      allowNull: false,
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'},
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    tableName: 'project_attachments',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      },
    },
  });

  ProjectAttachments.defaultSelect = ['id', 'fileName', 'path', 'previewPath', 'size', 'type'];

  ProjectAttachments.addHistoryForProject();

  return ProjectAttachments;
};
