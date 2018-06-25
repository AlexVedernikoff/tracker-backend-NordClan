const EnumTypes = [
  {id: 1, name: 'Получение отзыва', codeName: 'GET_REVIEW'},
  {id: 2, name: 'Демо Клиенту', codeName: 'DEMO_CLIENT'},
  {id: 3, name: 'Внутренняя демо', codeName: 'DEMO_INSIDE'},
  {id: 4, name: 'Другое', codeName: 'OTHER'}
];


module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('milestone_types_dictionary', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(25)
      },
      codeName: {
        field: 'code_name',
        type: Sequelize.STRING(25)
      }
    })
      .then(() => Promise.all(EnumTypes.map((type) => queryInterface.sequelize.query(`
        INSERT INTO milestone_types_dictionary (name, code_name)
        VALUES (:name, :codeName);
        `, { replacements: type }))))
      .then(()=> queryInterface.addColumn(
        'Milestones',
        'typeId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'milestone_types_dictionary',
            key: 'id'
          }
        }
      ));
  },
  down: function (queryInterface) {
    return Promise.all([
      queryInterface.removeColumn(
        'Milestones',
        'typeId'
      ),
      queryInterface.dropTable('milestone_types_dictionary')
    ]);
  }
};
