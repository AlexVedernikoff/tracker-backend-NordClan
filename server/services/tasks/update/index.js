const models = require('../../../models');
const moment = require('moment');
const { Task, Sprint, Project } = models;
const TimesheetService = require('../../timesheets');

async function update (body, taskId, user) {
  const originTask = await getOriginTask(taskId, body);
  const { error } = validateTask(originTask, body, user);
  if (error) {
    throw new Error(error);
  }

  const taskParams = getTaskParams(body);
  const updatedAttributes = await originTask.updateAttributes(taskParams);
  const updatedTask = await appendAdditionalFields(updatedAttributes);

  const createdDraft = body.statusId
    ? await createDraftIfNeeded(originTask, body.statusId, transaction)
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

async function getOriginTask (taskId, body) {
  const attributes = ['id', 'statusId', 'performerId', 'projectId'].concat(Object.keys(body));
  return await Task.findByPrimary(taskId,
    {
      attributes,
      include: [
        {
          as: 'project',
          model: Project,
          attributes: ['prefix']
        }
      ]
    });
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

async function appendAdditionalFields (updatedAttributes, body, taskId) {
  const fields = { ...updatedAttributes, id: taskId };

  if (fields.performerId && fields.performerId > 0) {
    const performer = await models.User.findByPrimary(body.performerId, { attributes: models.User.defaultSelect });
    fields.performer = performer;
  }

  if (fields.sprintId === 0) {
    fields.sprint = {
      id: 0,
      name: 'Backlog'
    };
  }

  if (fields.parentId === 0) {
    fields.parentTask = null;
  }

  if (fields.sprintId && fields.sprintId > 0) {
    const sprint = await Sprint.findByPrimary(body.sprintId, {
      attributes: ['id', 'name', 'statusId', 'factStartDate', 'factFinishDate', 'allottedTime']
    });

    fields.sprint = sprint;
  }

  return fields;
}

async function createDraftIfNeeded (task, statusId, transaction) {
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
