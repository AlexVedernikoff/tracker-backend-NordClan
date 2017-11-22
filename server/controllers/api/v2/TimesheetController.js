const createError = require('http-errors');
const Sequelize = require('../../../orm/index');
const queries = require('../../../models/queries');
const models = require('../../../models');
const moment = require('moment');

exports.create = async (req, res, next) => {
  const isNeedCreateTimesheet = await queries.timesheet.isNeedCreateTimesheet(req.body);
  if (!isNeedCreateTimesheet) {
    return next(createError(400, `Some timesheet already exists on date ${req.body.onDate}`));
  }

  try {
    const timesheetParams = {
      ...req.body,
      userId: req.user.id
    };

    const timesheet = await createTimesheet(timesheetParams);
    res.json(timesheet);
  } catch (ex) {
    return next(ex);
  }
};

exports.getTracksAll = async (req, res, next) => {
  const result = {};
  const dateArr = getDateArray(req.query.startDate, req.query.endDate);

  await Promise.all(dateArr.map(async (onDate) => {
    req.query.onDate = onDate;
    const tracks = await getTracks(req, res, next);
    // пройти по трекам
    const scales = {};
    tracks.tracks.map(track => {
      models.TimesheetTypesDictionary.values.map(value => {
        if (track.typeId === value.id) {
          if (scales.hasOwnProperty(value.id)) {
            scales[value.id] = +scales[value.id] + +track.spentTime;
          } else {
            scales[value.id] = 0;
            scales[value.id] = +scales[value.id] + +track.spentTime;
          }
        }
      });
    });
    let sum = 0;
    Object.keys(scales).map(key => {
      sum += +scales[key];
    });
    Object.assign(scales, {all: sum});
    const tr = tracks.tracks;
    result[onDate] = { tracks: tr, scales};
    return;
  }));

  res.json(result);
};

const getTracks = async (req, res, next) => {
  const { onDate } = req.query;
  const today = moment().format('YYYY-MM-DD');
  req.query.userId = req.user.id;
  const timesheets = await getTimesheets(req, res, next);
  const drafts = moment(onDate).isSame(today) // Если текущий день, то добавляю драфты
    ? await TimesheetDraftController.getDrafts({
      ...req,
      query: {
        ...req.query,
        onDate
      }
    }, res, next)
    : [];
  return {
    tracks: [
      ... await timesheets,
      ... await drafts
    ]
  };
};


function getDateArray (startDate, endDate) {
  const dateFormat = 'YYYY-MM-DD';
  const start = moment(startDate);
  const end = moment(endDate);
  const difference = end.diff(start, 'days');

  if (!start.isValid() || !end.isValid() || difference <= 0) {
    return 'Invalid dates specified. Please check format and or make sure that the dates are different';
  }

  return [
    end.format(dateFormat),
    ...dateRangeInArray(difference, end, dateFormat)
  ];
}

function dateRangeInArray (difference, end, format) {
  const arr = [];
  for (let i = 0; i < difference; i++) {
    arr.push(end.subtract(1, 'd').format(format));
  }
  return arr;
}

exports.list = () => {}

exports.update = () => {}

exports.delete = () => {}

//TODO Вынести в отдельный сервис
async function createTimesheet (timesheetParams) {
  const transaction = await Sequelize.transaction();

  const isNeedUpdateTask = timesheetParams.taskId
    && timesheetParams.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION;

  if (isNeedUpdateTask) {
    const task = await queries.task.findOneActiveTask(timesheetParams.taskId,
      ['id', 'factExecutionTime'],
      transaction);

    await models.Task.update({
      factExecutionTime: models.sequelize.literal(`"fact_execution_time" + ${timesheetParams.spentTime}`)
    }, {
      where: { id: task.id },
      transaction
    });
  }

  const timesheet = await models.Timesheet.create(timesheetParams, {
    transaction
  });

  await transaction.commit();
  return await queries.timesheet.getTimesheet(timesheet.id);
}
