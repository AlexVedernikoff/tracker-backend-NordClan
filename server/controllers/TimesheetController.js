const createError = require('http-errors');
const _ = require('underscore');
const moment = require('moment');
const models = require('../models');
const queries = require('../models/queries');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');
const Sequelize = require('../orm/index');

/**
 * Функция поиска таймшитов
 */
exports.getTimesheets = async function (req, res, next) {
  console.log('Функция поиска таймшитов (getTimesheets)');
  try {
    const where = {
      userId: req.query.userId,
      deletedAt: null
    };
    if (req.query.onDate) {
      let date = new Date(req.query.onDate);
      Object.assign(where, { onDate: { $eq: date } });
    }
    if (req.params && req.params.sheetId) {
      Object.assign(where, { id: { $eq: req.params.sheetId } });
    }
    if (req.query && req.query.sheetId) {
      Object.assign(where, { id: { $eq: req.query.sheetId } });
    }
    if (req.body && req.body.sheetId) {
      Object.assign(where, { id: { $eq: req.body.sheetId } });
    }
    if (req.query.taskId) {
      Object.assign(where, { taskId: { $eq: req.query.taskId } });
    }
    if (req.query.taskStatusId) {
      Object.assign(where, { taskStatusId: { $eq: req.query.taskStatusId } });
    }

    const timesheets = await models.Timesheet.findAll({
      where: where,
      attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId', 'isVisible', 'sprintId', 'taskId'],
      order: [
        ['createdAt', 'ASC']
      ],
      include: [
        {
          as: 'task',
          model: models.Task,
          required: false,
          attributes: ['id', 'name', 'plannedExecutionTime', 'factExecutionTime'],
          paranoid: false,
          include: [
            {
              as: 'project',
              model: models.Project,
              required: false,
              attributes: ['id', 'name'],
              paranoid: false,
            },
            {
              as: 'taskStatus',
              model: models.TaskStatusesDictionary,
              required: false,
              attributes: ['id', 'name'],
              paranoid: false,
            }
          ]
        },
        {
          as: 'taskStatus',
          model: models.TaskStatusesDictionary,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false
        },
        {
          as: 'projectMaginActivity',
          model: models.Project,
          required: false,
          attributes: ['id', 'name'],
          paranoid: false,
        },
      ]
    });
    let result = [];
    timesheets.map(ds => {

      if (ds.dataValues.task && ds.dataValues.task.dataValues.project) {
        Object.assign(ds.dataValues, { project: ds.dataValues.task.dataValues.project, isDraft: false });
        delete ds.dataValues.task.dataValues.project;
      }

      if (ds.dataValues.projectMaginActivity) {
        Object.assign(ds.dataValues, { project: ds.dataValues.projectMaginActivity.dataValues, isDraft: false });
        delete ds.dataValues.projectMaginActivity;
      }


      ds.dataValues.onDate =  ds.onDate;
      result.push(ds.dataValues);
    });
    return result;
  } catch (e) {
    return next(createError(e));
  }
};

/**
 * Функция составления треков на текущий день
 */
exports.getTracksOnCurrentDay = async function (req, res, next) {
  let result;
  let timesheets =  this.getTimesheets(req, res, next);
  let draftsheets = TimesheetDraftController.getDrafts(req, res, next);
  timesheets = await timesheets;
  draftsheets = await draftsheets;
  result = { tracks: [...timesheets, ...draftsheets] };
  return result;
};

/**
 *  Функция составления треков на не текущий день
 */
exports.getTracksOnOtherDay = async function (req, res, next) {
  let result;
  let timesheets = await this.getTimesheets(req, res, next);
  result = { tracks: timesheets };
  return result;
};

/**
 *  Функция составления треков для трекера
 */
exports.getTracks = async function (req, res, next) {
  let result;
  const today = moment().format('YYYY-MM-DD');
  req.query.userId = req.user.id;
  if (moment(req.query.onDate).isSame(today)) {
    result = await this.getTracksOnCurrentDay(req, res, next);
  } else {
    result = await this.getTracksOnOtherDay(req, res, next);
  }
  return result;
};

/**
 *  Функция загрузки треков на неделю 
 */
exports.getTracksAll = async function (req, res, next) {

  // Это безобразие с датами надо переписать
  function pushDates(difference, end, format) {
    const arr = [];
    for(let i = 0; i < difference; i++) {
      arr.push(end.subtract(1, 'd').format(format));
    }
    return arr;
  }


  try {
    const result = {};

    // Отрефакторить это
    // Это безобразие с датами надо переписать
    const dateFormat = 'YYYY-MM-DD';
    let dates = [];
    const start = moment(req.query.startDate);
    const end = moment(req.query.endDate);

    const difference = end.diff(start, 'days');

    if (!start.isValid() || !end.isValid() || difference <= 0) {
      throw Error('Invalid dates specified. Please check format and or make sure that the dates are different');
    }
    dates.push(end.format(dateFormat));

    const dateArr = dates.concat(pushDates(difference, end, dateFormat));


    await Promise.all(dateArr.map(async (onDate) => {
      req.query.onDate = onDate;
      const tracks =  await this.getTracks(req, res, next);
      // пройти по трекам
      const scales = {};
      tracks.tracks.map(track => {
        models.TimesheetTypesDictionary.values.map(value => {
          if (track.typeId == value.id) {
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
      let tr = tracks.tracks;
      result[onDate] = { tracks: tr, scales};
      return;
    }));

    res.json(result);
  } catch (e) {
    return next(createError(e));
  }

};

/**
 * Функция поиска драфтшита его удаления и создание нового таймшита
 */
exports.setDraftTimesheetTime = async function (req, res, next) {
  let t;
  console.log('Функция поиска драфтшита его удаления и создание нового таймшита');

  try {
    t = await Sequelize.transaction();
  } catch (e) {
    return next(createError(e));
  }


  try {
    delete req.body.isDraft;
    let tmp = {};


    if (req.params.sheetId) {
      const draftsheet = await TimesheetDraftController.getDrafts(req, res, next);
      if (!draftsheet || draftsheet.length === 0) {
        await t.rollback();
        return next(createError(404, 'Drafts not found'));
      }
      Object.assign(tmp, draftsheet[0]);


    } else {
      Object.assign(tmp, req.body);
    }


    delete tmp.id;
    if (tmp.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      await models.TimesheetDraft.destroy({ where: { id: tmp.id }, transaction: t });
    }
    if (tmp.taskId) {
      const task = await queries.task.findOneActiveTask(tmp.taskId, ['id', 'factExecutionTime'], t);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${tmp.spentTime})`) }, {
        where: {
          id: task.dataValues.id
        },
        transaction: t
      });
    }

    tmp = await _setAdditionalInfo(tmp, req);
    Object.assign(tmp, { spentTime: req.body.spentTime });
    const createTs = await models.Timesheet.create(tmp, { transaction: t });
    await t.commit();

    return await queries.timesheet.getTimesheet(createTs.dataValues.id);
  } catch (e) {
    await t.rollback();
    return next(createError(e));
  }
};

async function _setAdditionalInfo(tmp, req) {
  tmp.userRoleId = null;
  tmp.isBillible = false;

  if (tmp.projectId) {
    const roles = await queries.projectUsers.getUserRolesByProject();

    if (roles) {
      tmp.isBillible = !!~roles.indexOf(models.ProjectRolesDictionary.UNBILLABLE_ID);
      const index = roles.indexOf(models.ProjectRolesDictionary.UNBILLABLE_ID);
      if (index > -1) roles.splice(index, 1);
      tmp.userRoleId = roles;
    }

  }

  if (!tmp.userId) {
    tmp.userId = req.user.id;
  }

  if (!tmp.onDate) {
    tmp.onDate = moment().format('YYYY-MM-DD');
  }

  return tmp;
}

/**
 * Функция поиска и обновления таймшита
 */
exports.setTimesheetTime = async function (req, res, next) {
  console.log('Функция поиска и обновления таймшита');
  let t;

  try {
    t = await Sequelize.transaction();
  } catch (e) {
    next(createError(e));
  }

  try {
    let tmp = {};
    delete req.body.isDraft;
    let timesheet = await this.getTimesheets(req, res, next);
    if (_.isEmpty(timesheet)) return next(createError(404, 'Timesheet not found'));
    Object.assign(tmp, timesheet[0]);
    await models.Timesheet.update(req.body, { where: { id: tmp.id } });

    if (tmp.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      let task = await queries.task.findOneActiveTask(tmp.taskId, ['id', 'factExecutionTime'], t);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${tmp.spentTime})`)}, { where: { id: task.id }, transaction: t });
    }

    await t.commit();

    return await queries.timesheet.getTimesheet(tmp.id);
  } catch (e) {
    await t.rollback();
    next(createError(e));
  }
};


/**
 * Функция для проставления времени для таймшитов в трекере
 */

exports.setTrackTimesheetTime = async function (req, res, next) {

  if (req.body.spentTime && req.body.spentTime < 0) return next(createError(400, 'spentTime wrong'));

  let result;
  req.query.userId = req.user.id;
  if (req.body.isDraft == 'true') {
    console.log('isDraft true');
    if (req.body.spentTime) {
      result = await this.setDraftTimesheetTime(req, res, next);
    } else if (req.body.comment || 'isVisible' in req.body) {
      const newDate = {};
      if (req.body.comment) newDate.comment = req.body.comment;
      if ('isVisible' in req.body) newDate.isVisible = req.body.isVisible;

      const draftsheet = await TimesheetDraftController.getDrafts(req, res, next);
      const tmp = {};
      Object.assign(tmp, draftsheet[0]);
      await models.TimesheetDraft.update(newDate, { where: { id: tmp.id }});
      result = await queries.timesheetDraft.findDraftSheet(req.user.id, tmp.id);
    }
    res.json(result);
  } else {
    console.log('isDraft false');
    if (req.body.spentTime) {
      result = await this.setTimesheetTime(req, res, next);
    } else if (req.body.comment || 'isVisible' in req.body) {
      const newDate = {};
      if (req.body.comment) newDate.comment = req.body.comment;
      if ('isVisible' in req.body) newDate.isVisible = req.body.isVisible;

      const timesheet = await this.getTimesheets(req, res, next);
      const tmp = {};

      Object.assign(tmp, timesheet[0]);
      await models.Timesheet.update(newDate, { where: { id: tmp.id }});
      result = await queries.timesheet.getTimesheet(tmp.id);
    }
    res.json(result);
  }
};

/**
 * Функция для создания или обновления таймшитов в UI таблице таймшитов
 */
exports.createOrUpdateTimesheet = async function (req, res, next) {
  req.query.onDate = req.body.onDate;
  req.query.taskId = req.params.taskId;
  req.query.userId = req.user.id;
  req.query.taskStatusId = req.body.taskStatusId;
  let result = await this.setDraftTimesheetTime(req, res, next);
  if (!result) {
    result = await this.setTimesheetTime(req, res, next);
  }
  res.json(result);
};

/**
 * @deprecated create
 */
exports.create = async function (req, res, next) {
  if (!req.params.taskId.match(/^[0-9]+$/)) return next(createError(400, 'taskId must be int'));
  try {
    await queries.task.isCanCreateUpdateTimesheet(req.user.id, req.params.taskId);
    Object.assign(req.body, { userId: req.user.id, taskId: req.params.taskId });
    let newsheet = await models.Timesheet.create(req.body);
    let result = await queries.timesheet.getTimesheet(newsheet.id);
    res.json(result);
  } catch (e) {
    return next(e);
  }
};
/**
 * @deprecated update
 */
exports.update = async function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  try {
    let timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, req.params.timesheetId);
    if (!timesheetModel) return next(createError(404, 'Timesheet not found'));
    let result = await timesheetModel.updateAttributes(req.body);
    res.json(result);
  } catch (e) {
    return next(e);
  }
};


exports.delete = async function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));

  try {
    const timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, req.params.timesheetId);
    await timesheetModel.destroy();
    res.end();
  } catch (e) {
    return next(e);
  }
};

exports.actionList = async function (req, res, next) {
  try {
    await _actionListReqValidate(req);
    const where = await _actionListGetWhere(req);
    const timesheets = await _actionListGetData(where);
    res.json(_actionListTransformData(timesheets));

  } catch (e) {
    return next(e);
  }
};

async function _actionListReqValidate(req) {
  req.checkQuery('userId', 'userId must be int').isInt();
  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) throw createError(400, validationResult);
}

function _actionListGetWhere(req) {
  return {
    deletedAt: null,
    userId: req.query.userId,
    onDate: {
      $and: {
        $gte: new Date(req.query.dateBegin),
        $lte: new Date(req.query.dateEnd),
      }
    }
  };
}

async function _actionListGetData(where) {
  return await models.Timesheet.findAll({
    where: where,
    attributes: ['id', 'onDate', 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId'],
    order: [
      ['createdAt', 'ASC']
    ],
    include: [
      {
        as: 'task',
        model: models.Task,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
        include: [
          {
            as: 'project',
            model: models.Project,
            required: false,
            attributes: ['id', 'name'],
            paranoid: false,
          }
        ]
      },
      {
        as: 'projectMaginActivity',
        model: models.Project,
        required: false,
        attributes: ['id', 'name'],
        paranoid: false,
      },
    ],
  });
}

function _actionListTransformData(timesheets) {

  timesheets.forEach(model => {

    if(model.task) {
      model.project = model.task.project;
      delete model.task.project;
    }

    if (model.projectMaginActivity) {
      model.project = model.projectMaginActivity;
      delete model.projectMaginActivity;
    }

  });

  return timesheets;
}
