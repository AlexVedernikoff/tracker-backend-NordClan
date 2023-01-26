module.exports = {
  up: (queryInterface, Sequelize)=> {
    return queryInterface.createTable('user_guides', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        primaryKey: true,
      },
      is_off_time_guide_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_vacation_guide_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_sick_leave_guide_complete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_guide_modal_shown: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    });
  },

  down: queryInterface => queryInterface.dropTable('UserGuides'),
};