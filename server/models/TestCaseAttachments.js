const ModelsHooks = require('../components/sequelizeHooks/deleteUnderscoredTimeStamp');

module.exports = function (sequelize, DataTypes) {
  const TestCaseAttachments = sequelize.define('TestCaseAttachments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    testCaseId: {
      field: 'test_case_id',
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
    createdAt: { type: DataTypes.DATE, field: 'created_at', allowNull: true },
    deletedAt: { type: DataTypes.DATE, field: 'deleted_at', allowNull: true },
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    tableName: 'test_case_attachments',
    hooks: {
      afterFind: function (model) {
        ModelsHooks.deleteUnderscoredTimeStampsAttributes(model);
      },
    },
  });

  TestCaseAttachments.associate = function (models) {
    TestCaseAttachments.belongsTo(models.TestCase, {
      as: 'testCaseAttachments',
      foreignKey: {
        name: 'testCaseId',
        field: 'test_case_id',
        allowNull: false,
      },
    });
  };

  TestCaseAttachments.defaultSelect = ['id', 'fileName', 'path', 'previewPath', 'size', 'type', 'deletedAt'];

  TestCaseAttachments.addHistoryForTestCase();

  return TestCaseAttachments;
};
