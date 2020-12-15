module.exports = function (sequelize, DataTypes) {
  return sequelize.define('SystemToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'system_tokens',
  });
};
