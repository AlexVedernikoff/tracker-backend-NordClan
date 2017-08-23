module.exports = function(sequelize, DataTypes) {
    const TimesheetStatusesDictionary = sequelize.define('TimesheetStatusesDictionary', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(15),
        trim: true,
        allowNull: false
      },
    }, {
      underscored: true,
      timestamps: false,
      paranoid: false,
      tableName: 'timesheets_statuses'
    });
    
    TimesheetStatusesDictionary.values = [
      {id: 1, name: ''},
      {id: 2, name: ''},
      {id: 3, name: ''},
      {id: 4, name: ''},
      {id: 5, name: ''},
      {id: 6, name: ''},
    ];
    
    return TimesheetStatusesDictionary;
  };