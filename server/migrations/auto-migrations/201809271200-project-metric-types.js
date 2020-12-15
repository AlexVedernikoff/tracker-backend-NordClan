module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('metric_types', [
      { id: 61, name: 'Метрика по комманде. UserId, кол-во выполненных задач, кол-во возвратов задач, кол-во пофикшенных багов, кол-во возвратов багов, кол-во связанных багов' },
    ])
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE metrics ALTER COLUMN "value" TYPE text');
      });
  },

  down: (queryInterface, Sequalize) => {
    return queryInterface.bulkDelete(
      'metric_types',
      { id: { [Sequalize.Op.in]: [61] } }
    )
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE metrics ALTER COLUMN "value" TYPE character varying(255)');
      });
  },
};
