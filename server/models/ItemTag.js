module.exports = function (sequelize, DataTypes) {
  const ItemTag = sequelize.define('ItemTag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tagId: {
      field: 'tag_id',
      type: DataTypes.INTEGER,
      unique: 'item_tag_taggable',
    },
    taggable: {
      type: DataTypes.STRING,
      unique: 'item_tag_taggable',
    },
    taggableId: {
      field: 'taggable_id',
      type: DataTypes.INTEGER,
      unique: 'item_tag_taggable',
      references: null,
    },
  }, {
    indexes: [
      {
        method: 'BTREE',
        fields: ['tag_id'],
      },
    ],
    underscored: true,
    timestamps: true,
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: 'item_tags',
  });

  ItemTag.associate = function (models) {
    ItemTag.belongsTo(models.Tag, {
      as: 'tag',
      foreignKey: {
        name: 'tagId',
        field: 'tag_id',
      },
    },
    { onDelete: 'cascade' });
  };

  ItemTag.addHistoryForTask();
  ItemTag.addHistoryForProject();

  return ItemTag;
};
