const { Metrics, User, Sprint } = require('../../../models');
const _ = require('lodash');

exports.list = async (params) => {
  const startDate = params.startDate
    ? new Date(params.startDate)
    : new Date();

  const endDate = params.endDate
    ? new Date(params.endDate)
    : new Date();

  delete params.startDate;
  delete params.endDate;

  const metrics = await Metrics.findAll({
    where: {
      createdAt: {
        $between: [startDate, endDate]
      },
      ...params
    },
    order: [['createdAt', 'ASC']]
  });

  return await handleCommandMetric(metrics);
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

async function handleCommandMetric (metrics) {
  const teamMetricsObj = metrics.reduce((acc, cur) => {
    if (cur.typeId === 61) {
      acc[cur.id] = cur;
      acc[cur.id].dataValues.value = JSON.parse(cur.dataValues.value);
    }
    return acc;
  }, {});

  const usersMap = await findUsersFromTeamMetric(teamMetricsObj);

  for (const metricId in teamMetricsObj) {
    const data = [];
    for (const [userId, user] of usersMap) {
      if (teamMetricsObj[metricId] && teamMetricsObj[metricId].dataValues.value[userId]) {
        data.push({
          user: user,
          ...teamMetricsObj[metricId].dataValues.value[userId]
        });
      }
    }

    teamMetricsObj[metricId].dataValues.value = data;
  }

  metrics.forEach((metric, index) => {
    if (metric.typeId === 61) {
      metrics[index] = teamMetricsObj[metric.id];
    }
  });

  return metrics;
}

async function findUsersFromTeamMetric (teamMetricsObj) {

  const usersIds = [];
  for (const metricId in teamMetricsObj) {
    for (const userId in teamMetricsObj[metricId].dataValues.value) {
      usersIds.push(userId);
    }
  }

  const usersArr = await User.findAll({
    attributes: User.defaultSelect,
    where: {
      id: {
        $in: _.uniq(usersIds)
      }
    },
    order: [['firstNameRu', 'ASC'], ['lastNameRu', 'ASC']]
  });

  // console.log(usersArr);

  return usersArr.reduce((map, user) => {
    map.set(user.id, user.dataValues);
    return map;
  }, new Map());
}
