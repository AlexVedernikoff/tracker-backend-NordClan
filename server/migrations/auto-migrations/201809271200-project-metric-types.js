module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('metric_types', [
      { id: 61, name: 'Количество возвратов dev->qa и обратно qa->dev|new' },
      { id: 62, name: 'Количество связных багов ' },
      { id: 63, name: 'Количество выполненных задач dev->qa ' }
    ])
      .then(() => {
        // return queryInterface.sequelize.query('ALTER TABLE metrics ALTER COLUMN "value" TYPE text');
      });
  },

  down: (queryInterface, Sequalize) => {
    return queryInterface.bulkDelete(
      'metric_types',
      { id: { [Sequalize.Op.in]: [61, 62, 63] } }
    )
      .then(() => {
        // return queryInterface.sequelize.query('ALTER TABLE metrics ALTER COLUMN "value" TYPE character varying(255)');
      });
  }
};
