module.exports = function (sequelize, DataTypes) {
  const TimesheetStatusesDictionary = sequelize.define('TimesheetStatusesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(15),
      trim: true,
      allowNull: false
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
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'timesheets_statuses'
  });

  TimesheetStatusesDictionary.values = [
    {id: 1, name: 'inprogress', nameRu: 'В процессе', isBlocked: false},
    {id: 2, name: 'rejected', nameRu: 'Отменено', isBlocked: false},
    {id: 3, name: 'submitted', nameRu: 'Отправлено', isBlocked: true},
    {id: 4, name: 'approved', nameRu: 'Согласовано', isBlocked: true}
  ];

  TimesheetStatusesDictionary.NON_BLOCKED_IDS = [1, 2];
  TimesheetStatusesDictionary.ALL_IDS = [1, 2, 3, 4];

  return TimesheetStatusesDictionary;
};
