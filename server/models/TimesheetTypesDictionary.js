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
      allowNull: false,
      validate: {
        len: [1, 15]
      }
    },
    nameRu: {
      field: 'name_ru',
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        len: [1, 15]
      }
    },
    isBlocked: {
      field: 'is_blocked',
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'timesheets_types'
  });
  
  TimesheetTypesDictionary.values = [
    {id: 1, name: 'inprogress', nameRu: 'В процессе', isBlocked: false},
    {id: 2, name: 'rejected', nameRu: 'Отменено', isBlocked: false},
    {id: 3, name: 'submitted', nameRu: 'Отправлено', isBlocked: true},
    {id: 4, name: 'approved', nameRu: 'Согласовано', isBlocked: true}
  ];
  
  return TimesheetTypesDictionary;
};