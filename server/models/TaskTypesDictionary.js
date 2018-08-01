module.exports = function (sequelize, DataTypes) {
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
    nameEn: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'task_types'
  });


  TaskTypes.associate = function (models) {
    TaskTypes.hasMany(models.Task, {
      as: 'taskTypes',
      foreignKey: {
        name: 'typeId',
        field: 'type_id'
      }});
  };

  TaskTypes.values = [
    {id: 1, name: 'Фича', nameEn: 'Feature'},
    {id: 3, name: 'Доп. Фича', nameEn: 'Add. Feature'},
    {id: 2, name: 'Баг', nameEn: 'Bug'},
    {id: 4, name: 'Регрес. Баг', nameEn: 'Regres. Bug'}
  ];

  TaskTypes.defaultSelect = ['id', 'name', 'nameEn'];

  return TaskTypes;
};
