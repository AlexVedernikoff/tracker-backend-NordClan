module.exports = function (sequelize, DataTypes) {
  const UserGuide = sequelize.define('UserGuide', {
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    isOffTimeGuideCompleted: {
      field: 'is_off_time_guide_completed',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isVacationGuideCompleted: {
      field: 'is_vacation_guide_completed',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isSickLeaveGuideCompleted: {
      field: 'is_sick_leave_guide_complete',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isGuideModalShown: {
      field: 'is_guide_modal_shown',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'user_guides',
  });

  return UserGuide;
};