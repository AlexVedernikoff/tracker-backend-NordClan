const { Metrics } = require('../../../models');
const moment = require('moment');

exports.list = async (params) => {
  const dateFormat = 'YYYY-MM-DD';
  const now = moment();
  const startDate = params.startDate
    ? new Date(params.startDate)
    : now.format(dateFormat);

  const endDate = params.endDate
    ? new Date(params.endDate)
    : now.add(1, 'days').format(dateFormat);

  endDate.setMinutes(endDate.getMinutes() + 10);

  delete params.startDate;
  delete params.endDate;

  return await Metrics.findAll({
    where: {
      createdAt: {
        $between: [startDate, endDate]
      },
      ...params
    }
  });
};

exports.validate = (params) => {
  const paramsChecker = {
    typeId: {
      type: 'number',
      interval: {
        min: 0,
        max: 40
      }
    },
    startDate: {
      type: 'string',
      regExp: /\d{4}-\d{2}-\d{2}/
    },
    endDate: {
      type: 'string',
      regExp: /\d{4}-\d{2}-\d{2}/
    },
    projectId: {
      type: 'number'
    },
    sprintId: {
      type: 'number'
    },
    userId: {
      type: 'number'
    },
    recalculate: {
      type: 'boolean'
    }
  };

  const errors = Object.entries(params)
    .filter(([key, value]) => {
      const checker = paramsChecker[key];
      return checker.type !== typeof value
        || !checkInterval(checker.interval, value)
        || !checkRegExp(checker.regExp, value);
    });

  return errors.length > 0 ? generateMessage(errors) : null;
};

function checkInterval (interval, value) {
  if (!interval) {
    return true;
  }

  return value >= interval.min && value <= interval.max;
}

function checkRegExp (regExp, value) {
  if (!regExp) {
    return true;
  }

  return regExp.test(value);
}

function generateMessage (errors) {
  const incorrectParams = errors
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `Incorrect params - ${incorrectParams}`;
}
