module.exports = function (sequelize, DataTypes) {
  const SprintStatuses = sequelize.define('SprintStatusesDictionary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20],
      },
    },
    nameEn: {
      field: 'name_en',
      type: DataTypes.STRING(20),
      trim: true,
      allowNull: false,
      validate: {
        len: [1, 20],
      },
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'sprint_statuses',
  });

  SprintStatuses.associate = function (models) {
    SprintStatuses.hasMany(models.Sprint, {
      as: 'sprintStatuses',
      foreignKey: {
        name: 'statusId',
        field: 'status_id',
      }});
  };

  SprintStatuses.NOT_IN_PROCESS_STATUS = 1;
  SprintStatuses.IN_PROCESS_STATUS = 2;

  return SprintStatuses;
};
