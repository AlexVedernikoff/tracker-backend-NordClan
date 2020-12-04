module.exports = function (sequelize, DataTypes) {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      trim: true,
      allowNull: false
    },
    psId: {
      field: 'ps_id',
      trim: true,
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    underscored: true,
    timestamps: false,
    paranoid: false,
    tableName: 'departments'
  });

  Department.associate = function (models) {
    Department.belongsToMany(models.User, { through: models.UserDepartments });
  };

  return Department;
};
