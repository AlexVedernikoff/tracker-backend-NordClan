module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('metric_types', [
      { id: 41, name: 'Количество открытых фич вне плана' },
    ]);
  },

  down: (queryInterface, Sequalize) => {
    return (
      queryInterface.bulkDelete(
        'metric_types',
        { id: { [Sequalize.Op.in]: [41] } }
      )
    );
  },
};
