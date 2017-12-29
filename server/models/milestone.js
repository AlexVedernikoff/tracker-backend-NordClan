module.exports = function (sequelize, DataTypes) {
  const Milestone = sequelize.define('Milestone', {
    name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    done: DataTypes.BOOLEAN,
    projectId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        models.Metrics.belongsTo(models.Project, {
          as: 'project',
          foreignKey: {
            name: 'projectId',
            field: 'project_id'
          }
        });
      }
    }
  });
  return Milestone;
};
