module.exports = function (sequilize, DataTypes) {
  const ErrorsLogs = sequilize.define('ErrorsLogs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    location: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    componentStack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'errors_logs',
    timestamp: true,
    createdAt: 'created_at',
    updatedAt: false,
    deletedAt: false,
    paranoid: false,
  });


  return ErrorsLogs;
};
