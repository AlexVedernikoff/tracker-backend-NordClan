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
      const date = new Date(req.query.onDate);
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
              paranoid: false
            },
            {
              as: 'taskStatus',
              model: models.TaskStatusesDictionary,
              required: false,
              attributes: ['id', 'name'],
              paranoid: false
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
          paranoid: false
        }
      ]
    });
    const result = [];
    timesheets.map(ds => {

      if (ds.dataValues.task && ds.dataValues.task.dataValues.project) {
        Object.assign(ds.dataValues, { project: ds.dataValues.task.dataValues.project, isDraft: false });
        delete ds.dataValues.task.dataValues.project;
      }

      if (ds.dataValues.projectMaginActivity) {
        Object.assign(ds.dataValues, { project: ds.dataValues.projectMaginActivity.dataValues, isDraft: false });
        delete ds.dataValues.projectMaginActivity;
      }


      ds.dataValues.onDate = ds.onDate;
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
  let timesheets = this.getTimesheets(req, res, next);
  let draftsheets = TimesheetDraftController.getDrafts(req, res, next);
  timesheets = await timesheets;
  draftsheets = await draftsheets;
  return { tracks: [...draftsheets, ...timesheets] };
};

/**
 *  Функция составления треков на не текущий день
 */
exports.getTracksOnOtherDay = async function (req, res, next) {
  const timesheets = await this.getTimesheets(req, res, next);
  return { tracks: timesheets };
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
  function pushDates (difference, end, format) {
    const arr = [];
    for (let i = 0; i < difference; i++) {
      arr.push(end.subtract(1, 'd').format(format));
    }
    return arr;
  }


  try {
    const result = {};

    // Отрефакторить это
    // Это безобразие с датами надо переписать
    const dateFormat = 'YYYY-MM-DD';
    const dates = [];
    const start = moment(req.query.startDate);
    const end = moment(req.query.endDate);

    const difference = end.diff(start, 'days');

    if (!start.isValid() || !end.isValid() || difference <= 0) {
      throw Error('Invalid dates specified. Please check format and or make sure that the dates are different');
    }
    dates.push(end.format(dateFormat));

    const dateArr = dates.concat(pushDates(difference, end, dateFormat));


    await Promise.all(dateArr.map(async (onDate) => {
      console.log(onDate);
      req.query.onDate = onDate;
      const tracks = await this.getTracks(req, res, next);
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
  } catch (e) {
    return next(createError(e));
  }

};

/**
 * Функция поиска драфтшита его ?удаления и создание нового таймшита
 */
exports.setDraftTimesheetTime = async function (req, res, next) {
  let t;
  console.log('Функция поиска драфтшита его ?удаления и создание нового таймшита');

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

    if (!await queries.timesheet.isNeedCreateTimesheet(tmp)) {
      return next(createError(400, `Some timesheet already exists on date ${tmp.onDate}`));
    }

    const createTs = await models.Timesheet.create(tmp, { transaction: t });
    await t.commit();

    return await queries.timesheet.getTimesheet(createTs.dataValues.id);
  } catch (e) {
    await t.rollback();
    return next(createError(e));
  }
};

async function _setAdditionalInfo (tmp, req) {
  tmp.userRoleId = null;
  tmp.isBillible = false;
  tmp.onDate = moment().format('YYYY-MM-DD');

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
    const tmp = {};
    delete req.body.isDraft;
    const timesheet = await this.getTimesheets(req, res, next);
    if (_.isEmpty(timesheet)) return next(createError(404, 'Timesheet not found'));
    Object.assign(tmp, timesheet[0]);
    await models.Timesheet.update(req.body, { where: { id: tmp.id } });

    if (tmp.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      const task = await queries.task.findOneActiveTask(tmp.taskId, ['id', 'factExecutionTime'], t);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${tmp.spentTime})`)}, { where: { id: task.id }, transaction: t });
    }

    await t.commit();

    return await queries.timesheet.getTimesheet(tmp.id);
  } catch (e) {
    await t.rollback();
    next(createError(e));
  }
};

exports.createTimesheetNoDraft = async function (req, res, next) {
  let t;

  try {
    t = await Sequelize.transaction();
    const timesheetObj = req.body;
    timesheetObj.userId = req.user.id;

    if (timesheetObj.taskId && +timesheetObj.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
      const task = await queries.task.findOneActiveTask(timesheetObj.taskId, ['id', 'factExecutionTime'], t);
      await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" + (${req.body.spentTime} - ${timesheetObj.spentTime})`)}, { where: { id: task.id }, transaction: t });
    }

    const timesheet = await models.Timesheet.create(req.body, { transaction: t});
    await t.commit();
    return await queries.timesheet.getTimesheet(timesheet.id);

  } catch (e) {
    await t.rollback();
    return next(createError(e));
  }
};

exports.actionCreate = async function (req, res, next) {
  if (req.body.spentTime && req.body.spentTime < 0) return next(createError(400, 'spentTime wrong'));
  if (req.params.sheetId) {
    req.body.sheetId = req.params.sheetId;
  }

  let result;
  req.query.userId = req.user.id;
  if ('' + req.body.isDraft === 'true') {
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
    if (!req.body.sheetId) {
      if (!await queries.timesheet.isNeedCreateTimesheet(req.body)) {
        return next(createError(400, `Some timesheet already exists on date ${req.body.onDate}`));
      }

      result = await this.createTimesheetNoDraft(req, res, next);
    } else if (req.body.spentTime) {
      result = await this.setTimesheetTime(req, res, next);
    } else {
      const newDate = {};
      Object.assign(newDate, req.body);

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
 * @deprecated update
 */
exports.update = async function (req, res, next) {
  if (!req.params.timesheetId.match(/^[0-9]+$/)) return next(createError(400, 'timesheetId must be int'));
  try {
    const timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, req.params.timesheetId);
    if (!timesheetModel) return next(createError(404, 'Timesheet not found'));
    const result = await timesheetModel.updateAttributes(req.body);
    res.json(result);
  } catch (e) {
    return next(e);
  }
};


exports.delete = async function (req, res, next) {
  req.checkParams('timesheetId', 'timesheetId must be integer or comma-separated integers. Exp: 1,2,3').matches(/^\d+(,\d+)*$/);
  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) next(createError(400, validationResult));

  let t;

  try {
    const timesheetIds = req.params.timesheetId.split(',');
    t = await Sequelize.transaction();

    await Promise.all(timesheetIds.map(async (id) => {
      const timesheetModel = await queries.timesheet.canUserChangeTimesheet(req.user.id, id);
      if (timesheetModel.taskId && +timesheetModel.typeId === models.TimesheetTypesDictionary.IMPLEMENTATION) {
        const task = await queries.task.findOneActiveTask(timesheetModel.taskId, ['id', 'factExecutionTime'], t);
        await models.Task.update({ factExecutionTime: models.sequelize.literal(`"fact_execution_time" - ${timesheetModel.spentTime}`)}, { where: { id: task.id }, transaction: t });
      }

      await timesheetModel.destroy({transaction: t});
    }));


    t.commit();
    res.end();

  } catch (e) {
    await t.rollback();
    return next(createError(e));
  }
};

exports.actionList = async function (req, res, next) {
  try {
    await _actionListReqValidate(req);
    const timesheets = await _actionListGetData(req);
    res.json(_actionListTransformData(timesheets));

  } catch (e) {
    return next(e);
  }
};

async function _actionListReqValidate (req) {
  if (req.isSystemUser) {
    // В роуте можно использовать либо userId либо userPSId. Одно из них обязательно
    if (req.query.userId) {
      req.checkQuery('userId', 'userId must be int').isInt();
    } else if (req.query.userPSId) {
      req.checkQuery('userPSId', 'userPSId string must be Ascii').isAscii();
    } else {
      req.checkQuery('userId', 'userId must be int').isInt();
      req.checkQuery('userPSId', 'userPSId string must be Ascii').isAscii();
    }
  } else {
    req.query.userId = req.user.id;
  }


  req.checkQuery('dateBegin', 'date must be in YYYY-MM-DD format').isISO8601();
  req.checkQuery('dateEnd', 'date must be in YYYY-MM-DD format').isISO8601();

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) throw createError(400, validationResult);
}

async function _actionListGetData (req) {
  const where = await _actionListGetWhere(req);
  const include = await _actionListGetInclude(req);

  return await models.Timesheet.findAll({
    where: where,
    attributes: ['id', [models.sequelize.literal('to_char(on_date, \'YYYY-MM-DD\')'), 'onDate'], 'typeId', 'spentTime', 'comment', 'isBillible', 'userRoleId', 'taskStatusId', 'statusId', 'userId'],
    order: [
      ['createdAt', 'ASC']
    ],
    include: include
  });
}

function _actionListGetWhere (req) {
  const where = {
    deletedAt: null,
    onDate: {
      $and: {
        $gte: new Date(req.query.dateBegin),
        $lte: new Date(req.query.dateEnd)
      }
    }
  };

  if (req.query.userId) {
    where.userId = req.query.userId;
  }

  return where;
}

function _actionListGetInclude (req) {
  const include = [
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
          paranoid: false
        }
      ]
    },
    {
      as: 'project',
      model: models.Project,
      required: false,
      attributes: ['id', 'name'],
      paranoid: false
    }
  ];

  if (req.query.userPSId && !req.query.userId) {
    include.push({
      as: 'user',
      model: models.User,
      required: true,
      attributes: [],
      paranoid: false,
      where: {
        psId: req.query.userPSId
      }
    });
  }

  return include;
}


function _actionListTransformData (timesheets) {
  timesheets.forEach(model => {
    // переношу из задачи в корень объекта
    if (model.task && !model.dataValues.project) {
      model.dataValues.project = model.task.project.dataValues;
      delete model.task.project.dataValues;
    }
  });
  return timesheets;
}
