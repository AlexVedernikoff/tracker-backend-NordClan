module.exports = function (sequelize, DataTypes) {
  const UserEmailAssociation = sequelize.define(
    'UserEmailAssociation',
    {
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
      externalUserEmail: {
        field: 'external_user_email',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      internalUserEmail: {
        field: 'internal_user_email',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isInt: true
        }
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
      deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
    },
    {
      underscored: true,
      timestamps: true,
      paranoid: true,
      tableName: 'user_email_association'
    }
  );

  UserEmailAssociation.associate = function (models) {
    UserEmailAssociation.belongsTo(models.Project, {
      as: 'project',
      foreignKey: {
        name: 'projectId',
        field: 'project_id'
      }
    });
  };

  return UserEmailAssociation;
};
