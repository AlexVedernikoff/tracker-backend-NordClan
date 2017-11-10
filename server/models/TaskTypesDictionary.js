module.exports = function(sequelize, DataTypes) {
  const TaskTypes = sequelize.define('TaskTypesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'task_types'
  });
  
  
  TaskTypes.associate = function(models) {
    TaskTypes.hasMany(models.Task, {
      as: 'taskTypes',
      foreignKey: {
        name: 'typeId',
        field: 'type_id'
      }});
  };
  
  TaskTypes.values = [
    {id: 1, name: 'Фича'},
    {id: 3, name: 'Доп. Фича'},
    {id: 2, name: 'Баг'},
    {id: 4, name: 'Регрес. Баг'},
    {id: 5, name: 'Баг от клиента'}
  ];
  
  return TaskTypes;
};