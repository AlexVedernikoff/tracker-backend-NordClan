const hooks = require('../components/sequelizeHooks/draftMagicActivity');

module.exports = function (sequelize, DataTypes) {
  const ProjectUsers = sequelize.define('ProjectUsers', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    rolesIds: {
      field: 'roles_ids',
      type: DataTypes.STRING,
      allowNull: true
    },
    authorId: {
      field: 'author_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    underscored: true,
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    tableName: 'project_users'
  });

  ProjectUsers.associate = function (models) {
    ProjectUsers.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }});

    ProjectUsers.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }});

    ProjectUsers.hasOne(models.Timesheet, {
      as: 'timesheet',
      targetKey: {
        name: 'userId',
        field: 'user_id'
      },
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
  };

  ProjectUsers.addHistoryForProject();

  return ProjectUsers;
};
