const models = require('../../../models');
const moment = require('moment');
const { Task, Project } = models;
const TimesheetService = require('../../timesheets');
const { findByPrimary } = require('./request');

async function update (body, taskId, user) {
  const originTask = await findByPrimary(taskId);
  const { error } = validateTask(originTask, body, user);
  if (error) {
    throw new Error(error);
  }

  const taskParams = getTaskParams(body);
  await originTask.updateAttributes(taskParams, { historyAuthorId: user.id });

  const updatedTask = await findByPrimary(taskId);

  const createdDraft = body.statusId
    ? await createDraftIfNeeded(originTask, body.statusId)
    : null;

  const { activeTask, stoppedTasks } = body.statusId
    ? await updateTasksStatuses(updatedTask, originTask)
    : { stoppedTasks: [] };

  return {
    updatedTasks: [ updatedTask, ...stoppedTasks ],
    createdDraft,
    activeTask,
    projectId: originTask.projectId
  };
}

function getTaskParams (body) {
  const params = { ...body };

  if (params.performerId === 0) {
    params.performerId = null;
  }

  if (params.sprintId === 0) {
    params.sprintId = null;
  }

  if (params.parentId === 0) {
    params.parentId = null;
  }

  return params;
}

async function createDraftIfNeeded (task, statusId) {
  const onDate = moment().format('YYYY-MM-DD');
  const needCreateDraft = await TimesheetService.isNeedCreateDraft(task, statusId, onDate);

  const draftParams = {
    taskId: task.id,
    userId: task.performerId,
    onDate,
    typeId: 1,
    taskStatusId: statusId,
    isVisible: true
  };

  if (needCreateDraft) {
    await TimesheetService.createDraft(draftParams);
  }

  return needCreateDraft
    ? await TimesheetService.getDraft(draftParams)
    : null;
}

async function updateTasksStatuses (updatedTask, originTask) {
  const performerId = updatedTask.dataValues.performerId || originTask.performerId;
  const activeTasks = updatedTask.dataValues.statusId
    ? await getActiveTasks(performerId)
    : [];

  const activeTask = activeTasks.find(task => task.id === updatedTask.dataValues.id)
    || await getLastActiveTask(performerId);

  const stoppedTasksIds = activeTasks
    .reduce((acc, task) => {
      if (task.id !== updatedTask.dataValues.id) {
        acc.push(task.id);
      }
      return acc;
    }, []);

  const stoppedTasks = await stopTasks(stoppedTasksIds);

  return { activeTask, stoppedTasks };
}

async function getLastActiveTask (performerId) {
  return await Task.findOne({
    where: {
      performerId
    },
    order: [['updated_at', 'DESC']],
    include: [
      {
        as: 'project',
        model: Project,
        attributes: ['prefix']
      }
    ]
  });
}

async function getActiveTasks (performerId) {
  const playStatuses = [2, 4, 6];
  const tasks = await Task.findAll({
    where: {
      performerId,
      statusId: {
        $or: playStatuses
      }
    },
    include: [
      {
        as: 'project',
        model: Project,
        attributes: ['prefix']
      }
    ]
  });

  return tasks;
}

async function stopTasks (ids) {
  if (ids.length > 0) {
    const stoppedTasks = await Task.update({ statusId: models.sequelize.literal('status_id + 1') },
      { where: { id: { $or: ids }}, returning: true });
    return stoppedTasks[1];
  }
  return [];
}

function validateTask (task, body, user) {
  if (!task) {
    return { error: 'Task not found' };
  }

  if (!user.canReadProject(task.projectId)) {
    return { error: 'Access denied' };
  }

  if (task.statusId === models.TaskStatusesDictionary.CLOSED_STATUS && !body.status) {
    return { error: 'Task is closed' };
  }

  return {};
}

module.exports = {
  update,
  getActiveTasks,
  getLastActiveTask
};
