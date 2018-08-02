const TaskTypes = [
  { id: 1, nameEn: 'Feature' },
  { id: 3, nameEn: 'Add. Feature' },
  { id: 2, nameEn: 'Bug' },
  { id: 4, nameEn: 'Regres. Bug' }
];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface
      .addColumn('task_types_dictionary', 'nameEn', {
        type: Sequelize.STRING
      })
      .then(() =>
        Promise.all(
          TaskTypes.map(type =>
            queryInterface.sequelize.query(
              `
            UPDATE task_types_dictionary
            SET nameEn = :nameEn,
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
    return queryInterface.removeColumn('task_types_dictionary', 'nameEn');
  }
};
