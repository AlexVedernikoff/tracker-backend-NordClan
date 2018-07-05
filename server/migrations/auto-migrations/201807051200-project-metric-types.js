module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('metric_types', [
      { id: 51, name: '% часов затраченных на роль 11(Android)' },
      { id: 52, name: '% часов затраченных на роль 12 (iOS)' },
      { id: 53, name: 'Часы затраченные на роль 11(Android)' },
      { id: 54, name: 'Часы затраченные на роль 12(iOS)' }
    ]);
  },

  down: (queryInterface, Sequalize) => {
    return (
      queryInterface.bulkDelete(
        'metric_types',
        { id: { [Sequalize.Op.in]: [51, 52, 53, 54] } }
      )
    );
  }
};
