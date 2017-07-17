module.exports = function(sequelize, DataTypes) {
  const SprintStatuses = sequelize.define('SprintStatusesDictionary', {
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
    tableName: 'sprint_statuses'
  });

  SprintStatuses.values = [
    {id: 1, name: 'Не в процессе'},
    {id: 2, name: 'В процессе'},
  ];

  return SprintStatuses;
};