const TaskTypes = [
  { id: 1, nameEn: 'Feature' },
  { id: 3, nameEn: 'Add. Feature' },
  { id: 2, nameEn: 'Bug' },
  { id: 4, nameEn: 'Regres. Bug' }
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('task_types', 'name_en', {
        type: Sequelize.STRING
      })
      .then(() =>
        Promise.all(
          TaskTypes.map(type =>
            queryInterface.sequelize.query(
              `
            UPDATE task_types
            SET name_en = :nameEn
            WHERE id = :id
        `,
              {
                replacements: type
              }
            )
          )
        )
      );
  },

  down: function (queryInterface) {
    return queryInterface.removeColumn('task_types', 'name_en');
  }
};
