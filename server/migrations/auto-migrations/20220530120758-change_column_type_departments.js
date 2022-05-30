

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
        alter table departments drop column type;
        drop type department_type;
        create type department_type as enum ('department', 'office', 'subdivision');
        alter table departments add column type department_type default 'department'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
        alter table departments drop column type;
    `);
  },
};
