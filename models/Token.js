module.exports = function(sequelize, DataTypes) {
  const Token = sequelize.define('Token', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      defaultValue: null
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'tokens'
  });

  Token.associate = function(models) {
    Token.belongsTo(models.User, {foreignKey: {
      name: 'userId',
      field: 'user_id'
    }});
    
  };

  return Token;
};







