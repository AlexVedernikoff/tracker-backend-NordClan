module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('MetricTypesDictionary', [
      { id: 51, name: '% часов затраченных на роль 11(Android)' },
      { id: 52, name: '% часов затраченных на роль 12 (iOS)' },
      { id: 53, name: 'Часы затраченные на роль 11(Android)' },
      { id: 54, name: 'Часы затраченные на роль 12(iOS)' }
    ]);
  },

  down: queryInterface => {
    return (
      queryInterface.bulkDelete('MetricTypesDictionary'),
      [
        { id: 51, name: '% часов затраченных на роль 11(Android)' },
        { id: 52, name: '% часов затраченных на роль 12 (iOS)' },
        { id: 53, name: 'Часы затраченные на роль 11(Android)' },
        { id: 54, name: 'Часы затраченные на роль 12(iOS)' }
      ]
    );
  }
};
