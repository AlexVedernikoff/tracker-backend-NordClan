module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('metric_types', [
      { id: 57, name: 'Часы затраченные на фикс багов' }
    ]);
  },

  down: (queryInterface, Sequalize) => {
    return (
      queryInterface.bulkDelete(
        'metric_types',
        { id: { [Sequalize.Op.in]: [57] } }
      )
    );
  }
};

