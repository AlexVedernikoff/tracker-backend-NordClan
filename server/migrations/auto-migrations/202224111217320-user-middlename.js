
module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('users', 'middle_name_ru', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn('users', 'middle_name_en', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
    ]);
  },

  down: function (queryInterface) {
    return Promise.all([
      queryInterface.removeColumn('users', 'middle_name_ru'),
      queryInterface.removeColumn('users', 'middle_name_en'),
    ]);
  },
};
