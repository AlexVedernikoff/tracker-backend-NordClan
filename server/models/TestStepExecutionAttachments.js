const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const TestStepExecutionAttachments = sequelize.define('TestStepExecutionAttachments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    testStepExecutionId: {
      field: 'test_step_execution_id',
      type: DataTypes.INTEGER,
      allowNull: false
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
      field: 'preview_path',
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: true
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(80),
      trim: true,
      allowNull: false
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
  }, {
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'test_step_execution_attachments',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      }
    }
  });

  TestStepExecutionAttachments.associate = function (models) {
    TestStepExecutionAttachments.belongsTo(models.TestStepExecution, {
      as: 'testStepExecutionInfo',
      foreignKey: {
        name: 'testStepExecutionId',
        field: 'test_step_execution_id'
      }
    });
  };

  return TestStepExecutionAttachments;
};
