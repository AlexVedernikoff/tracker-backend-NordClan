

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
        alter table departments drop column is_office;
        create type department_type as enum ('department', 'office');
        alter table departments add column type department_type default 'department'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
        alter table departments drop column type;
        alter table departments add column is_office integer
    `);
  },
};
