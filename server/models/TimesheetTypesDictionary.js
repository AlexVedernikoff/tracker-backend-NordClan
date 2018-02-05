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
        len: [1, 15]
      }
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'timesheets_types'
  });

  TimesheetTypesDictionary.values = [
    {id: 1, name: 'Implementation'},
    {id: 2, name: 'Совещание'},
    {id: 3, name: 'Преселлинг и оценка'},
    {id: 4, name: 'Обучение'},
    {id: 5, name: 'Отпуск'},
    {id: 6, name: 'Командировка'},
    {id: 7, name: 'Больничный'},
    {id: 8, name: 'Управление'}
  ];

  TimesheetTypesDictionary.IMPLEMENTATION = 1;
  TimesheetTypesDictionary.HOSPITAL = 2;
  TimesheetTypesDictionary.BUSINESS_TRIP = 3;
  TimesheetTypesDictionary.VACATION = 4;
  TimesheetTypesDictionary.MEETING = 5;
  TimesheetTypesDictionary.EDUCATION = 6;
  TimesheetTypesDictionary.CONTROL = 7;
  TimesheetTypesDictionary.PRESALE = 8;

  TimesheetTypesDictionary.magicActivities = [2, 3, 4, 5, 6, 7, 8];

  return TimesheetTypesDictionary;
};
