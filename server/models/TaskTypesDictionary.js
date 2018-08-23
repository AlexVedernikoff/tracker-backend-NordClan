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
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name_en'
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

  TaskTypes.defaultSelect = ['id', 'name', 'nameEn'];

  return TaskTypes;
};
