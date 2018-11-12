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
    }
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
  // Определяю самый свижий результат подстчета метрики 61
  const newerMetric = findNewerMetricByType(metrics, 61);

  if (!newerMetric) {
    return metrics;
  }

  // Получаю данные из метрики, они нужны для сортировки по алфовиту
  const { value, sprintMap, usersMap } = await extractCommandData(metrics[newerMetric.index]);

  // Формирую зультат для фронта
  const result = [];
  for (const [sprintId, sprint] of sprintMap) {
    const item = {
      sprint,
      data: []
    };


    for (const [userId, user] of usersMap) {
      if (value[sprintId][userId]) {
        item.data.push({
          user,
          ...value[sprintId][userId]
        });
      }
    }

    result.push(item);
  }

  // Подменяю данные
  metrics[newerMetric.index].dataValues = {
    ...metrics[newerMetric.index].dataValues,
    value: JSON.stringify(result)
  };

  // Удаляю остальные метрики с типом 61
  return metrics.filter((metric) => {
    return metric.typeId !== 61 || metric.id === newerMetric.id;
  });
}

function findNewerMetricByType (metrics, typeId) {
  let newerMetric;

  metrics.forEach((metric, index) => {
    if (metric.typeId === typeId) {
      if (!newerMetric || metric.createdAt > newerMetric.createdAt) {
        newerMetric = {
          index,
          id: metric.id,
          createdAt: metric.createdAt
        };
      }
    }
  });

  return newerMetric;
}

async function extractCommandData (metric) {
  const value = JSON.parse(metric.value);
  const sprintIds = [];
  const usersIds = [];

  for (const sprintId in value) {
    sprintIds.push(sprintId);
    for (const userId in value[sprintId]) {
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

  const usersMap = usersArr.reduce((map, user) => {
    map.set(user.id, user.dataValues);
    return map;
  }, new Map());

  const sprintArr = await Sprint.findAll({
    attributes: Sprint.defaultSelect,
    where: {
      id: {
        $in: _.uniq(sprintIds)
      }
    },
    order: [['factStartDate', 'ASC']]
  });

  const sprintMap = sprintArr.reduce((map, sprint) => {
    map.set(sprint.id, sprint.dataValues);
    return map;
  }, new Map());

  return {
    value,
    usersMap,
    sprintMap
  };
}
