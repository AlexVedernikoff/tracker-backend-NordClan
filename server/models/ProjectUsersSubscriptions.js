module.exports = function (sequelize, DataTypes) {
  const ProjectUsersSubscriptions = sequelize.define('ProjectUsersSubscriptions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    projectUserId: {
      field: 'project_user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    projectEventId: {
      field: 'project_event_id',
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isInt: true
      }
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: true,
    tableName: 'project_users_subscriptions'
  });

  ProjectUsersSubscriptions.associate = function (models) {
    ProjectUsersSubscriptions.belongsTo(models.ProjectUsers, {
      as: 'projectUser',
      foreignKey: {
        name: 'projectUserId',
        field: 'project_user_id'
      }
    });

    ProjectUsersSubscriptions.belongsTo(models.ProjectEventsDictionary, {
      as: 'projectEvent',
      foreignKey: {
        name: 'projectEventId',
        field: 'project_event_id',
        allowNull: false
      }
    });
  };

  ProjectUsersSubscriptions.defaultSelect = ['id', 'projectUserId', 'projectEventId'];

  return ProjectUsersSubscriptions;
};
