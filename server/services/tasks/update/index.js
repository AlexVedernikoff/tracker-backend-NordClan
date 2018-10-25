const models = require('../../../models');
const moment = require('moment');
const { Task, Project, Sprint } = models;
const TimesheetService = require('../../timesheets');
const { findByPrimary } = require('./request');
const createError = require('http-errors');
const {getQaTimeByTask} = require('../utils');

const {
  DEVELOP_STATUSES,
  CODE_REVIEW_STATUSES,
  QA_STATUSES
} = models.TaskStatusesDictionary;

async function update (body, taskId, user) {
  try {
    const originTask = await findByPrimary(taskId, user.globalRole);
    const {error} = await validateTask(originTask, body, user);
    if (error) {
      throw new Error(error);
    }

    const oldPerformer = originTask.performerId;
    const oldStatus = originTask.statusId;

    const taskParams = getTaskParams(body);
    await originTask.updateAttributes(taskParams, {historyAuthorId: user.id});

    const changedTaskData = {
      'performerId': (originTask.performerId !== oldPerformer),
      'statusId': (originTask.statusId !== oldStatus)
    };

    const updatedTask = await findByPrimary(taskId, user.globalRole);

    const createdDraft = body.statusId && body.performerId !== 0
      ? await createDraftIfNeeded(originTask, body.statusId)
      : null;

    const {activeTask, stoppedTasks} = body.statusId
      ? await updateTasksStatuses(updatedTask, originTask, user.id)
      : {stoppedTasks: []};

    const {qaFactExecutionTime, qaPlannedTime} = await getQaTimeByTask(updatedTask);
    updatedTask.dataValues.qaFactExecutionTime = qaFactExecutionTime;
    updatedTask.dataValues.qaPlannedTime = qaPlannedTime;


    return {
      updatedTasks: [updatedTask, ...stoppedTasks],
      updatedTask,
      createdDraft,
      activeTask,
      projectId: originTask.projectId,
      changedTaskData
    };
  } catch (error) {
    throw error;
  }
}

async function updateAllByAttribute (attr, taskIds, user) {
  try {
    const originTasks = await Task.findAll({
      where: {
        id: taskIds
      }
    });

    const validTaskIds = await getValidTaskIds(originTasks, attr, user);

    if (attr.sprintId) await validateSprint(attr.sprintId);

    const updatedTasks = await Task.update(attr, {
      where: {
        id: validTaskIds
      },
      returning: true
    });
    return updatedTasks[1];
  } catch (error) {
    throw error;
  }
}

async function validateSprint (sprintId) {
  try {
    if (!await Sprint.findByPrimary(sprintId)) throw createError(404, 'Invalid sprint.');
  } catch (error) {
    throw error;
  }
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

async function createDraftIfNeeded (task, statusId) {
  try {
    const statuses = [
      DEVELOP_STATUSES,
      CODE_REVIEW_STATUSES,
      QA_STATUSES
    ];
    const onDate = moment().format('YYYY-MM-DD');
    const needCreateDraft = await TimesheetService.isNeedCreateDraft(task, statusId, onDate);
    if (needCreateDraft && task.performer) {
      const currentStageStatuses = statuses.find(item => item.includes(statusId));
      const draftParams = {
        taskId: task.id,
        userId: task.performerId,
        onDate,
        typeId: 1,
        taskStatusId: currentStageStatuses[1],
        projectId: task.projectId,
        isVisible: true
      };
      await TimesheetService.createDraft(draftParams);
      return TimesheetService.getDraft(draftParams);
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

async function updateTasksStatuses (updatedTask, originTask, currentUserId) {
  try {
    const activeTasks = updatedTask.dataValues.statusId
      ? await getActiveTasks(currentUserId)
      : [];
    const activeTask = activeTasks.find(task => task.id === updatedTask.dataValues.id)
      || await getLastActiveTask(currentUserId);
    const stoppedTasksIds = activeTasks
      .reduce((acc, task) => {
        if (task.id !== updatedTask.dataValues.id) {
          acc.push(task.id);
        }
        return acc;
      }, []);
    const stoppedTasks = await stopTasks(stoppedTasksIds);
    return { activeTask, stoppedTasks };
  } catch (error) {
    throw error;
  }
}

async function getLastActiveTask (currentUserId) {
  try {
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
  } catch (error) {
    throw error;
  }
}

async function getActiveTasks (currentUserId) {
  try {
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
  } catch (error) {
    throw error;
  }
}

async function stopTasks (ids) {
  try {
    if (ids.length > 0) {
      const stoppedTasks = await Task.update({statusId: models.sequelize.literal('status_id + 1')},
        {where: {id: {$or: ids}}, returning: true});
      return stoppedTasks[1];
    }
    return [];
  } catch (error) {
    throw error;
  }
}

async function getValidTaskIds (tasks, body, user) {
  try {
    await Promise.all(tasks.map(task => validateTask(task, body, user)));
    return tasks.map(task => task.id);
  } catch (error) {
    throw error;
  }
}

async function validateTask (task, body, user) {
  try {
    if (!task) {
      throw createError(404, 'Task not found');
    }
    if (!user.canReadProject(task.projectId)) {
      throw createError(403, 'Access denied');
    }
    if (user.isDevOpsProject(task.projectId)) {
      throw createError(403, 'Access denied');
    }
    if (task.statusId === models.TaskStatusesDictionary.CLOSED_STATUS
      && (!body.statusId || body.statusId === models.TaskStatusesDictionary.CLOSED_STATUS)) {
      throw createError(403, 'Task is closed');
    }
    if (body.hasOwnProperty('projectId')) {
      throw createError(400, 'projectId excess property');
    }
    if (body.hasOwnProperty('sprintId')) {
      const projectBySprint = await models.Sprint.findByPrimary(body.sprintId, {
        attributes: ['projectId']
      });
      if (body.sprintId !== 0 && (!projectBySprint || (projectBySprint && task.projectId !== projectBySprint.projectId))) {
        throw createError(400, 'sprintId wrong');
      }
    }
    return {};
  } catch (error) {
    throw error;
  }
}

module.exports = {
  updateAllByAttribute,
  update,
  getActiveTasks,
  getLastActiveTask
};
