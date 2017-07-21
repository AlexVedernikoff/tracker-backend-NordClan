module.exports = function(sequelize, DataTypes) {
  const TaskFiles = sequelize.define('TaskFiles', {
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
  }, {
    underscored: true,
    timestamps: true,
    paranoid: false,
    tableName: 'task_files'
  });
  
  
  return TaskFiles;
};
