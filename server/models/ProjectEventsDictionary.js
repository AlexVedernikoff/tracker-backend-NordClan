module.exports = function (sequelize, DataTypes) {
  const ProjectEvents = sequelize.define('ProjectEventsDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      trim: true,
      allowNull: false,
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'project_events',
  });

  ProjectEvents.values = [
    {id: 1, name: 'Новая задача в проекте'},
    {id: 2, name: 'Присвоена новая задача'},
    {id: 3, name: 'Новый комментарий к задаче'},
    {id: 4, name: 'Задача завершена'},
    {id: 5, name: 'Новое упоминание в комментарии к задаче'},
    {id: 6, name: 'Ошибка просчёта метрик'},
  ];

  return ProjectEvents;
};
