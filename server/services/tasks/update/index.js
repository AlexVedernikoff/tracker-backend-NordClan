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

  const oldPerformer = originTask.performerId;
  const oldStatus = originTask.statusId;

  const taskParams = getTaskParams(body);
  await originTask.updateAttributes(taskParams, { historyAuthorId: user.id });

  const changedTaskData = {
    'performerId': (originTask.performerId !== oldPerformer),
    'statusId': (originTask.statusId !== oldStatus)
  };

  const updatedTask = await findByPrimary(taskId);

  const createdDraft = body.statusId
    ? await createDraftIfNeeded(originTask, body.statusId, user.id)
    : null;

  const { activeTask, stoppedTasks } = body.statusId
    ? await updateTasksStatuses(updatedTask, originTask, user.id)
    : { stoppedTasks: [] };

  return {
    updatedTasks: [ updatedTask, ...stoppedTasks ],
    createdDraft,
    activeTask,
    projectId: originTask.projectId,
    changedTaskData
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

  if ('factExecutionTime' in params) {
    delete params.factExecutionTime;
  }

  return params;
}

async function createDraftIfNeeded (task, statusId, currentUserId) {
  const onDate = moment().format('YYYY-MM-DD');
  const needCreateDraft = await TimesheetService.isNeedCreateDraft(task, statusId, onDate, currentUserId);
  const draftParams = {
    taskId: task.id,
    userId: task.performerId,
    onDate,
    typeId: 1,
    taskStatusId: statusId,
    projectId: task.projectId,
    isVisible: true
  };

  if (needCreateDraft) {
    await TimesheetService.createDraft(draftParams);
  }

  return needCreateDraft
    ? await TimesheetService.getDraft(draftParams)
    : null;
}

async function updateTasksStatuses (updatedTask, originTask, currentUserId) {
  const activeTasks = updatedTask.dataValues.statusId
    ? await getActiveTasks(currentUserId)
    : [];

  const activeTask = activeTasks.find(task => task.id === updatedTask.dataValues.id)
    || await getLastActiveTask(currentUserId);

  const stoppedTasks = activeTasks
    .reduce((acc, task) => {
      if (task.id !== updatedTask.dataValues.id) {
        acc.push(task);
      }
      return acc;
    }, []);

  await stopTasks(stoppedTasks, currentUserId);

  return { activeTask, stoppedTasks };
}

async function getLastActiveTask (currentUserId) {
  return await Task.findOne({
    where: {
      performerId: currentUserId
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

async function getActiveTasks (currentUserId) {
  const playStatuses = [2, 4, 6];
  const tasks = await Task.findAll({
    where: {
      performerId: currentUserId,
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

async function stopTasks (tasks, userId) {
  if (tasks.length > 0) {
    await Promise.all([
      tasks.map(task => {
        task.updateAttributes({ statusId: task.statusId + 1 }, { historyAuthorId: userId });
      })
    ]);
  }
}

function validateTask (task, body, user) {
  if (!task) {
    return { error: 'Task not found' };
  }

  if (!user.canReadProject(task.projectId)) {
    return { error: 'Access denied' };
  }

  if (task.statusId === models.TaskStatusesDictionary.CLOSED_STATUS &&
      (!body.statusId || body.statusId === models.TaskStatusesDictionary.CLOSED_STATUS)) {
    return { error: 'Task is closed' };
  }

  return {};
}

module.exports = {
  update,
  getActiveTasks,
  getLastActiveTask
};
