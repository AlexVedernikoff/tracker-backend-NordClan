module.exports = function (sequelize, DataTypes) {
  const Milestone = sequelize.define('Milestone', {
    name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    done: DataTypes.BOOLEAN,
    projectId: DataTypes.INTEGER,
    typeId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        models.Metrics.belongsTo(models.Project, {
          as: 'project',
          foreignKey: {
            name: 'projectId'
          }
        });

        models.Milestone.belongsTo(models.MilestoneTypesDictionary, {
          as: 'MilestoneTypesDictionary',
          foreignKey: {
            name: 'typeId',
            field: 'typeId',
            allowNull: false
          }
        });
      }
    }
  });

  return Milestone;
};
