module.exports = function (sequelize, DataTypes) {
  const ProjectTypesDictionary = sequelize.define('ProjectTypesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        len: [1, 25],
      },
    },
    codeName: {
      field: 'code_name',
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        len: [1, 25],
      },
    },
    nameEn: {
      field: 'name_en',
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        len: [1, 25],
      },
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'project_types',
  });

  return ProjectTypesDictionary;
};
