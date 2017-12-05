const models = require('../../../models');
const moment = require('moment');
const { Task } = models;
const TimesheetService = require('../../timesheets');

exports.update = async (body, taskId, user, isSystemUser) => {
  const attributes = ['id', 'statusId', 'performerId', 'projectId'].concat(Object.keys(body));
  const updatedFields = {};

  const task = await Task.findByPrimary(taskId, { attributes, lock: 'UPDATE' });

  if (!task) {
    throw new Error('Task not found');
  }

  if (!user.canReadProject(task.projectId)) {
    throw new Error('Access denied');
  }

  if (task.statusId === models.TaskStatusesDictionary.CLOSED_STATUS && !body.status) {
    throw new Error('Task is closed');
  }

  if (body.performerId === 0) {
    body.performerId = null;
  }

  if (body.performerId > 0) {
    const performer = await models.User.findByPrimary(body.performerId, { attributes: models.User.defaultSelect });
    updatedFields.performer = performer;
  }

  if (body.sprintId === 0) {
    updatedFields.sprint = {
      id: 0,
      name: 'Backlog'
    };
    body.sprintId = null;
  }

  if (body.parentId === 0) {
    updatedFields.parentTask = null;
    body.parentId = null;
  }

  const transaction = await models.sequelize.transaction();
  await task.updateAttributes(body, { transaction });

  const updatedTask = await Task.findByPrimary(taskId, {
    attributes: ['id'],
    transaction,
    include: [
      {
        as: 'sprint',
        model: models.Sprint,
        attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
      }
    ]
  });

  if (body.sprintId > 0 && updatedTask.sprint) {
    updatedFields.sprint = updatedTask.sprint;
  }

  const now = moment().format('YYYY-MM-DD');
  const needCreateDraft = await TimesheetService.isNeedCreateDraft(body, task, now, isSystemUser);

  if (needCreateDraft) {
    const draftParams = {
      taskId: task.id,
      userId: task.performerId,
      onDate: now,
      typeId: 1,
      taskStatusId: task.dataValues.statusId,
      isVisible: true
    };

    await TimesheetService.createDraft(draftParams, user.id, transaction);
  }

  transaction.commit();

  updatedFields.id = task.id;

  return { updatedTask, updatedFields, createdDraft: {} };
};
