module.exports = function (sequelize, DataTypes) {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      trim: true,
      allowNull: false,
      validate: {
        len: [2, 50],
      },
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
    ],
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'tags',
  });

  Tag.associate = function (models) {
    Tag.belongsToMany(models.Task, {
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'task',
        },
      },
      foreignKey: 'tag_id',
      constraints: false,
    });

    Tag.belongsToMany(models.Project, {
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'project',
        },
      },
      foreignKey: 'tag_id',
      constraints: false,
    });

    Tag.belongsToMany(models.Sprint, {
      through: {
        model: models.ItemTag,
        unique: false,
        scope: {
          taggable: 'sprint',
        },
      },
      foreignKey: 'tag_id',
      constraints: false,
    });

    Tag.hasMany(models.ItemTag, {
      as: 'itemTags',
      foreignKey: {
        name: 'tagId',
        field: 'tag_id',
      },
    });

  };

  return Tag;
};
