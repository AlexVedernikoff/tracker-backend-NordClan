module.exports = function (sequelize, DataTypes) {
  const TimesheetTypesDictionary = sequelize.define('TimesheetTypesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        len: [1, 25]
      }
    },
    nameEn: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        len: [1, 25]
      }
    },
    codeName: {
      field: 'code_name',
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        len: [1, 25]
      }
    },
    isMagicActivity: {
      field: 'is_magic_activity',
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'timesheets_types'
  });

  return TimesheetTypesDictionary;
};
