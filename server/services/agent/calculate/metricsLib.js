const { TaskStatusesDictionary } = require('../../../models');
const moment = require('moment');
const _ = require('underscore');
const exactMath = require('exact-math');


module.exports = async function (metricsTypeId, input){

  let projectBurndown, projectRiskBurndown, totalBugsAmount, totalClientBugsAmount, totalRegressionBugsAmount, rolesIdsConf, roleId,
    totalTimeSpent, totalTimeSpentWithRole, totalTimeSpentInPercent, sprintBurndown, closedTasksDynamics, laborCostsTotal, laborCostsClosedTasks,
    laborCostsWithoutRating, taskTypeIdsConf, taskTypeId, openedTasksAmount, unratedFeaturesTotal, unsceduledOpenedFeatures,
    spentTimeByBacklog, spentTimeBySprint, spentTimeByTask;

  const countSpentTimeByTask = (task) =>
    task.timesheets.reduce((sum, timesheet) => (exactMath.add(sum, timesheet.spentTime)), 0);

  const countSpentTimeByTasks = (tasks) =>
    tasks.reduce((tasksSum, task) => (exactMath.add(tasksSum, countSpentTimeByTask(task))), 0);


  switch (metricsTypeId){
  case (1):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.createdAt,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (2):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.completedAt,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (3):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.budget,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (4):
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.riskBudget,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (5):
    projectBurndown = input.project.budget || 0;
    spentTimeByBacklog = countSpentTimeByTasks(input.project.tasksInBacklog);
    projectBurndown = exactMath.sub(projectBurndown, parseFloat(spentTimeByBacklog));
    if (input.project.sprints.length > 0){
      if (input.project.sprints.length === 0) return;
      input.project.sprints.forEach(function (sprint){
        spentTimeBySprint = countSpentTimeByTasks(sprint.tasks);
        projectBurndown = exactMath.sub(projectBurndown, parseFloat(spentTimeBySprint));
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': projectBurndown,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (6):
    projectRiskBurndown = input.project.riskBudget || 0;
    spentTimeByBacklog = countSpentTimeByTasks(input.project.tasksInBacklog);
    projectRiskBurndown = exactMath.sub(projectRiskBurndown, parseFloat(spentTimeByBacklog));
    if (input.project.sprints.length > 0){
      if (input.project.sprints.length === 0) return;
      input.project.sprints.forEach(function (sprint){
        spentTimeBySprint = countSpentTimeByTasks(sprint.tasks);
        console.log(spentTimeBySprint);
        projectRiskBurndown = exactMath.sub(projectRiskBurndown, parseFloat(spentTimeBySprint));
      });
    }
    console.log('PROJECT ID');
    console.log(input.project.id);
    console.log(projectRiskBurndown);
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': projectRiskBurndown,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (7):
    totalBugsAmount = 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        const bugs = _.filter(sprint.tasks, (task) => {
          return (TaskStatusesDictionary.DONE_STATUSES.indexOf(task.statusId) === -1 && task.typeId === 2);
        });
        totalBugsAmount += bugs.length;
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalBugsAmount,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (8):
    totalClientBugsAmount = 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        const clientBugs = _.filter(sprint.tasks, (task) => {
          return (TaskStatusesDictionary.DONE_STATUSES.indexOf(task.statusId) === -1 && task.typeId === 5);
        });
        totalClientBugsAmount += clientBugs.length;
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalClientBugsAmount,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

  case (9):
    totalRegressionBugsAmount = 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        const regressionBugs = _.filter(sprint.tasks, (task) => {
          return (TaskStatusesDictionary.DONE_STATUSES.indexOf(task.statusId) === -1 && task.typeId === 4);
        });
        totalRegressionBugsAmount = exactMath.add(totalRegressionBugsAmount, regressionBugs.length);
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalRegressionBugsAmount,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

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
    rolesIdsConf = {
      '10': 1,
      '11': 2,
      '12': 3,
      '13': 4,
      '14': 5,
      '15': 6,
      '16': 7,
      '17': 8,
      '18': 9,
      '19': 10
    };
    roleId = rolesIdsConf[metricsTypeId.toString()];
    totalTimeSpent = 0;
    totalTimeSpentWithRole = 0;
    totalTimeSpentInPercent = 0;
    if (input.project.sprints.length > 0 && input.project.projectUsers.length > 0){
      input.project.sprints.forEach(function (sprint){
        if (sprint.tasks.length === 0) return;
        sprint.tasks.forEach(function (task){
          spentTimeByTask = countSpentTimeByTask(task);
          if (!spentTimeByTask) return;
          totalTimeSpent = exactMath.add(totalTimeSpent, spentTimeByTask);
          input.project.projectUsers.forEach(function (projectUser){
            if (projectUser.user.id === task.performerId && _.find(projectUser.roles, {projectRoleId: roleId})) {
              totalTimeSpentWithRole = exactMath.add(totalTimeSpentWithRole, spentTimeByTask);
            }
          });
        });
      });
    }
    totalTimeSpentInPercent = exactMath.div(totalTimeSpentWithRole, totalTimeSpent) * 100 || 0;
    totalTimeSpentInPercent = parseFloat(totalTimeSpentInPercent.toFixed(2));
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalTimeSpentInPercent,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

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
    rolesIdsConf = {
      '20': 1,
      '21': 2,
      '22': 3,
      '23': 4,
      '24': 5,
      '25': 6,
      '26': 7,
      '27': 8,
      '28': 9,
      '29': 10
    };
    roleId = rolesIdsConf[metricsTypeId.toString()];
    totalTimeSpentWithRole = 0;
    if (input.project.sprints.length > 0 && input.project.projectUsers.length > 0){
      input.project.sprints.forEach(function (sprint){
        if (sprint.tasks.length === 0) return;
        sprint.tasks.forEach(function (task){
          input.project.projectUsers.forEach(function (projectUser){
            spentTimeByTask = countSpentTimeByTask(task);
            if (!spentTimeByTask) return;
            if (projectUser.user.id === task.performerId && _.find(projectUser.roles, {projectRoleId: roleId})) {
              totalTimeSpentWithRole = exactMath.add(totalTimeSpentWithRole, parseFloat(spentTimeByTask) || 0);
            }
          });

        });
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalTimeSpentWithRole,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    };

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
      'userId': null
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
      'userId': null
    };

  case (32):
    closedTasksDynamics = 0;
    laborCostsTotal = 0;
    laborCostsClosedTasks = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
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
      'userId': null
    };

  case (33):
    laborCostsWithoutRating = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        spentTimeByTask = countSpentTimeByTask(task);
        if (
          task.plannedExecutionTime
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
      'userId': null
    };

  case (34):
    laborCostsTotal = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        spentTimeByTask = countSpentTimeByTask(task);
        if (!task.spentTimeByTask || task.typeId !== 1) return;
        laborCostsTotal = exactMath.add(laborCostsTotal, parseFloat(spentTimeByTask));
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': laborCostsTotal,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    };

  case (35):
  case (36):
  case (37):
  case (38):
  case (39):
    taskTypeIdsConf = {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5
    };
    taskTypeId = taskTypeIdsConf[metricsTypeId.toString()];
    openedTasksAmount = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (TaskStatusesDictionary.DONE_STATUSES.indexOf(task.statusId) !== -1 || task.typeId !== taskTypeId) return;
        openedTasksAmount++;
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': openedTasksAmount,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    };

  case (40):
    unratedFeaturesTotal = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (task.plannedExecutionTime || task.typeId !== 1) return;
        unratedFeaturesTotal++;
      });
    }
    return {
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': unratedFeaturesTotal,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    };

  case (41):
    unsceduledOpenedFeatures = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (
          task.typeId === 1
          && (
            moment(task.createdAt).isAfter(input.sprint.factStartDate)
            || (
              task.history
              && task.history.length > 0
              && moment(task.history[task.history.length - 1].createdAt).isAfter(input.sprint.factStartDate)
            )
          )
        ){
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
      'userId': null
    };

  default:
    break;

  }
};
