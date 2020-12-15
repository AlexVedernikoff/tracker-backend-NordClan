module.exports = function (sequelize, DataTypes) {
  const MilestoneTypesDictionary = sequelize.define('MilestoneTypesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
    nameEn: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name_en',
    },
    codeName: {
      field: 'code_name',
      type: DataTypes.STRING(25),
    },
  },
  {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'milestone_types_dictionary',
  });

  return MilestoneTypesDictionary;
};
