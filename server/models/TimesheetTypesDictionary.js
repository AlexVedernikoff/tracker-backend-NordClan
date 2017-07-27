module.exports = function(sequelize, DataTypes) {
  const TimesheetTypesDictionary = sequelize.define('TimesheetTypesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(15),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 15]
      }
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'timesheets_types'
  });
  
  TimesheetTypesDictionary.values = [
    {id: 1, name: 'Implementation'},
    {id: 2, name: 'Больничный'},
    {id: 3, name: 'Командировка'},
    {id: 4, name: 'Отпуск'},
    {id: 5, name: 'Совещание'},
    {id: 6, name: 'Обучение'},
  ];
  
  return TimesheetTypesDictionary;
};