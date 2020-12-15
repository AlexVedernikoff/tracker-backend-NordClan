const models = require('../../models');
const moment = require('moment');
const { ErrorsLogs } = models;


async function create (model) {
  const satinizeModel = {
    location: 'none',
    error: '',
    componentStack: null,
    state: null,
    ...model,
  };
  await ErrorsLogs.create(satinizeModel);
  await clearOlder1Month();
}

async function clearOlder1Month () {
  await ErrorsLogs.destroy({
    where: {
      createdAt: {$lte: moment().subtract(1, 'month').toDate() },
    },
  });
}

module.exports = {
  create,
};
