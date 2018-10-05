const { Metrics, User } = require('../../../models');
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

  const result = await addUsersObjetsToMetrics(metrics);

  return result;
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

async function addUsersObjetsToMetrics (metrics) {
  const indexes = [];
  const usersIds = metrics
    .reduce((acc, cur, index) => {
      if (cur.typeId === 61 && cur.value.length > 3) {
        indexes.push(index);
        const value = JSON.parse(cur.value);
        metrics[index].value = value;
        value.forEach((item) => {
          acc.push(item.userId);
        });
      }
      return acc;
    }, []);

  const users = await User.findAll({
    attributes: User.defaultSelect,
    where: {
      id: {
        $in: _.uniq(usersIds)
      }
    }
  })
    .then((items) => {
      const map = new Map();
      items.forEach((user) => {
        map.set(user.id, user.dataValues);
      });
      return map;
    });


  indexes.forEach((index) => {
    metrics[index].value = metrics[index].value.map((item) => {
      item.user = users.get(item.userId);
      delete item.userId;
      return item;
    });
  });

  return metrics;
}
