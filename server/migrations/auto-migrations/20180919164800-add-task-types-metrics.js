module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('metric_types', [
      { id: 58, name: 'Количество открытых задач от клиента' },
      { id: 59, name: 'Количество открытых доп.фич от клиента' },
      { id: 60, name: 'Количество открытых регрессионных багов от клиента' },

    ]);
  },

  down: (queryInterface, Sequalize) => {
    return (
      queryInterface.bulkDelete(
        'metric_types',
        { id: { [Sequalize.Op.in]: [58, 59, 60] } }
      )
    );
  },
};
