const { TaskStatusesDictionary } = require('../../../models');
const moment = require('moment');
const exactMath = require('exact-math');
const commandMetrics = require('./commandMetrics');


module.exports = async function (metricsTypeId, input) {

  let sprintBurndown, closedTasksDynamics, laborCostsTotal, laborCostsClosedTasks,
    laborCostsWithoutRating, taskTypeIdsConf, taskTypeId, openedTasksAmount, unratedFeaturesTotal, unsceduledOpenedFeatures,
    spentTimeBySprint, spentTimeByTask, isTaskFromClient;

  const countSpentTimeByTask = (task) => {
    if (!task.timesheets) {
      return 0;
    } else {
      return task.timesheets.reduce((sum, timesheet) => {
        return (exactMath.add(sum, parseFloat(timesheet.spentTime)));
      }, 0);
    }
  };

  const countSpentTimeByTasks = (tasks) =>
    tasks.reduce((tasksSum, task) => {
      return (exactMath.add(tasksSum, countSpentTimeByTask(task)));
    }, 0);

  switch (metricsTypeId) {
  case (1):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.createdAt,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };

  case (2):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.completedAt,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };

  case (3):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.budget,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };

  case (4):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.riskBudget,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };

  case (5): {
    if (input.project.sprints.length === 0
        && input.project.tasksInBacklog.length === 0) return;

    const budget = parseFloat(input.project.budget) || 0;
    const value = exactMath.sub(budget, input.project.spentTimeAllProject);

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (6): {
    if (input.project.sprints.length === 0
        && input.project.tasksInBacklog.length === 0) return;

    const projectRiskBurndown = parseFloat(input.project.riskBudget) || 0;
    const value = exactMath.sub(projectRiskBurndown, input.project.spentTimeAllProject);

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (7): {
    const value = input.project.bugsCount;

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (8): {
    const value = input.project.bugsCountFromClient;

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (9): {
    const value = input.project.bugsCountRegression;

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (10):
  case (11):
  case (12):
  case (13):
  case (14):
  case (15):
  case (16):
  case (17):
  case (18):
  case (19):
  case (51):
  case (52):
  case (55): {
    const rolesIdsConf = {
      '10': 1,
      '11': 2,
      '12': 3,
      '13': 4,
      '14': 5,
      '15': 6,
      '16': 7,
      '17': 8,
      '18': 9,
      '19': 10,
      '51': 11,
      '52': 12,
      '55': 13,
    };

    const value = parseFloat(
      (exactMath.div(input.project.spentTimeAllProject, input.project.spentTimeByRoles[rolesIdsConf[metricsTypeId.toString()]]) * 100 || 0).toFixed(2)
    );

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (20):
  case (21):
  case (22):
  case (23):
  case (24):
  case (25):
  case (26):
  case (27):
  case (28):
  case (29):
  case (53):
  case (54):
  case (56): {
    const rolesIdsConf = {
      '20': 1,
      '21': 2,
      '22': 3,
      '23': 4,
      '24': 5,
      '25': 6,
      '26': 7,
      '27': 8,
      '28': 9,
      '29': 10,
      '53': 11,
      '54': 12,
      '56': 13,
    };
    const value = input.project.spentTimeByRoles[rolesIdsConf[metricsTypeId.toString()]];

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': value,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null,
    };
  }

  case (30):
    sprintBurndown = input.sprint.budget || 0;
    spentTimeBySprint = countSpentTimeByTasks(input.sprint.tasks);
    if (!spentTimeBySprint) return;
    sprintBurndown = exactMath.sub(sprintBurndown, parseFloat(spentTimeBySprint) || 0);
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': sprintBurndown,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (31):
    sprintBurndown = input.sprint.budget || 0;
    spentTimeBySprint = countSpentTimeByTasks(input.sprint.tasks);
    if (!spentTimeBySprint) return;
    sprintBurndown = exactMath.sub(sprintBurndown, parseFloat(spentTimeBySprint) || 0);
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': sprintBurndown,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (32):
    closedTasksDynamics = 0;
    laborCostsTotal = 0;
    laborCostsClosedTasks = 0;
    if (input.sprint.tasks.length > 0) {
      input.sprint.tasks.forEach(function (task) {
        if (!task.plannedExecutionTime) return;
        laborCostsTotal = exactMath.add(laborCostsTotal, parseFloat(task.plannedExecutionTime) || 0);
        if (task.typeId === 1 && task.statusId === TaskStatusesDictionary.CLOSED_STATUS) {
          laborCostsClosedTasks = exactMath.add(laborCostsClosedTasks, parseFloat(task.plannedExecutionTime) || 0);
        }
      });
    }

    closedTasksDynamics = exactMath.sub(laborCostsTotal, laborCostsClosedTasks);
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': closedTasksDynamics,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (33):
    laborCostsWithoutRating = 0;
    if (input.sprint.tasks.length > 0) {
      input.sprint.tasks.forEach(function (task) {
        spentTimeByTask = countSpentTimeByTask(task);
        if (
          +task.plannedExecutionTime
            || task.typeId !== 1
            || task.statusId !== TaskStatusesDictionary.CLOSED_STATUS
            || !spentTimeByTask
        ) return;
        laborCostsWithoutRating = exactMath.add(laborCostsWithoutRating, spentTimeByTask);
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': laborCostsWithoutRating,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (34):
    laborCostsTotal = 0;
    if (input.sprint.tasks.length > 0) {
      input.sprint.tasks.forEach(function (task) {
        spentTimeByTask = countSpentTimeByTask(task);
        if (!spentTimeByTask || task.typeId !== 1) return;
        laborCostsTotal = exactMath.add(laborCostsTotal, parseFloat(spentTimeByTask));
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': laborCostsTotal,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (40):
    unratedFeaturesTotal = 0;
    if (input.sprint.tasks.length > 0) {
      input.sprint.tasks.forEach(function (task) {
        if ((task.plannedExecutionTime && parseInt(task.plannedExecutionTime) !== 0)
            || task.typeId !== 1) return;
        unratedFeaturesTotal++;
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': unratedFeaturesTotal,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (41):
    unsceduledOpenedFeatures = 0;
    if (input.sprint.tasks.length > 0) {
      input.sprint.tasks.forEach(function (task) {
        const changeSprint = task.history.filter((item) => item.field === 'sprintId');

        if (
          task.typeId === 1
            && (
              moment(task.createdAt).isAfter(input.sprint.factStartDate)
              || (
                changeSprint
                && changeSprint.length > 0
                && moment(changeSprint[changeSprint.length - 1].createdAt).isAfter(input.sprint.factStartDate)
              )
            )
        ) {
          unsceduledOpenedFeatures++;
        }
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': unsceduledOpenedFeatures,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (57):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.timeByBugs,
      'projectId': input.project.id,
      'sprintId': input.sprint ? input.sprint.id : null,
      'userId': null,
    };

  case (58): // количество открытых задач от клиента
  case (59): // количество открытых доп фич от клиента
  case (60): // количество открытых регрессионных багов от клиента
  case (35): // количество открытых задач
  case (36): // количество открытых доп фич
  case (37): // количество открытых багов
  case (38): // количество открытых регрессионных багов
  case (39): // количество открытых багов от клиента
    taskTypeIdsConf = {
      // второй признак принадлежность к клиенту
      '35': [1, false],
      '36': [3, false],
      '37': [2, false],
      '38': [4, false],
      '58': [1, true],
      '59': [3, true],
      '39': [2, true],
      '60': [4, true],
    };
    [taskTypeId, isTaskFromClient] = taskTypeIdsConf[metricsTypeId.toString()];
    openedTasksAmount = 0;
    if (input.sprint.tasks.length > 0) {
      input.sprint.tasks.forEach(function (task) {
        if (TaskStatusesDictionary.DONE_STATUSES_WITH_CANCELLED.indexOf(task.statusId) !== -1 || task.typeId !== taskTypeId || task.isTaskByClient !== isTaskFromClient) return;
        openedTasksAmount++;
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': openedTasksAmount,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null,
    };

  case (61): {

    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': JSON.stringify(commandMetrics(input.sprint)),
      'projectId': input.project.id,
      'sprintId': input.sprint ? input.sprint.id : null,
      'userId': null,
    };
  }
  default:
    break;
  }
};
