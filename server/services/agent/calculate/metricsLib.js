const { TaskStatusesDictionary } = require('../../../models');
const _ = require('underscore');

module.exports = function (metricsTypeId, input){

  let projectBurndown, projectRiskBurndown, totalBugsAmount, totalClientBugsAmount, totalRegressionBugsAmount, rolesIdsConf, roleId, totalTimeSpent, totalTimeSpentWithRole, totalTimeSpentInPercent, sprintBurndown, closedTasksDynamics, laborCostsTotal, laborCostsClosedTasks, laborCostsWithoutRating, taskTypeIdsConf, taskTypeId, openedTasksAmount, unratedFeaturesTotal;

  switch (metricsTypeId){
  case (1):
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.createdAt,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (2):
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.completedAt,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (3):
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.budget,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (4):
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': input.project.riskBudget,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (5):
    projectBurndown = input.project.budget || 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        if (sprint.tasks.length === 0) return;
        sprint.tasks.forEach(function (task){
          if (!task.factExecutionTime) return;
          projectBurndown -= parseFloat(task.factExecutionTime) || 0;
        });
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': projectBurndown,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (6):
    projectRiskBurndown = input.project.riskBudget || 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        if (sprint.tasks.length === 0) return;
        sprint.tasks.forEach(function (task){
          if (!task.factExecutionTime) return;
          projectRiskBurndown -= parseFloat(task.factExecutionTime) || 0;
        });
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': projectRiskBurndown,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (7):
    totalBugsAmount = 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        totalBugsAmount += sprint.activeBugsAmount;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalBugsAmount,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (8):
    totalClientBugsAmount = 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        totalClientBugsAmount += sprint.clientBugsAmount;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalClientBugsAmount,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (9):
    totalRegressionBugsAmount = 0;
    if (input.project.sprints.length > 0){
      input.project.sprints.forEach(function (sprint){
        totalRegressionBugsAmount += sprint.regressionBugsAmount;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalRegressionBugsAmount,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

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
    if (input.project.sprints.length > 0 && input.project.users.length > 0){
      input.project.sprints.forEach(function (sprint){
        if (sprint.tasks.length === 0) return;
        sprint.tasks.forEach(function (task){
          if (!task.factExecutionTime) return;
          totalTimeSpent += task.factExecutionTime;
          input.project.users.forEach(function (user){
            if (user.id === task.performerId && _.find(user.projectUser.roles, {projectRoleId : roleId})) totalTimeSpentWithRole += task.factExecutionTime;
          });
        });
      });
    }
    totalTimeSpentInPercent = (totalTimeSpentWithRole / totalTimeSpent) * 100 || 0;
    totalTimeSpentInPercent = parseFloat(totalTimeSpentInPercent.toFixed(2));
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalTimeSpentInPercent,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

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
    if (input.project.sprints.length > 0 && input.project.users.length > 0){
      input.project.sprints.forEach(function (sprint){
        if (sprint.tasks.length === 0) return;
        sprint.tasks.forEach(function (task){
          input.project.users.forEach(function (user){
            if (!task.factExecutionTime) return;
            if (user.id === task.performerId && _.find(user.projectUser.roles, {projectRoleId : roleId})) {
              totalTimeSpentWithRole += parseFloat(task.factExecutionTime) || 0;
            }
          });

        });
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': totalTimeSpentWithRole,
      'projectId': input.project.id,
      'sprintId': null,
      'userId': null
    });

  case (30):
    sprintBurndown = input.sprint.budget || 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (!task.factExecutionTime) return;
        sprintBurndown -= parseFloat(task.factExecutionTime) || 0;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': sprintBurndown,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

  case (31):
    sprintBurndown = input.sprint.riskBudget || 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (!task.factExecutionTime) return;
        sprintBurndown -= parseFloat(task.factExecutionTime) || 0;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': sprintBurndown,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

  case (32):
    closedTasksDynamics = 0;
    laborCostsTotal = 0;
    laborCostsClosedTasks = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (!task.plannedExecutionTime) return;
        laborCostsTotal += parseFloat(task.plannedExecutionTime) || 0;
        if (task.typeId === 1) laborCostsClosedTasks += parseFloat(task.plannedExecutionTime) || 0;
      });
    }

    closedTasksDynamics = laborCostsTotal - laborCostsClosedTasks;
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': closedTasksDynamics,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

  case (33):
    laborCostsWithoutRating = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (
          task.plannedExecutionTime
            || task.typeId !== 1
            || task.statusId !== TaskStatusesDictionary.CLOSED_STATUS
            || !task.factExecutionTime
        ) return;
        laborCostsWithoutRating += task.factExecutionTime;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': laborCostsWithoutRating,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

  case (34):
    laborCostsTotal = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (!task.factExecutionTime || task.typeId !== 1) return;
        laborCostsTotal += parseFloat(task.factExecutionTime) || 0;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': laborCostsTotal,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

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
        if (task.statusId === TaskStatusesDictionary.CLOSED_STATUS || task.typeId !== taskTypeId) return;
        openedTasksAmount++;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': openedTasksAmount,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

  case (40):
    unratedFeaturesTotal = 0;
    if (input.sprint.tasks.length > 0){
      input.sprint.tasks.forEach(function (task){
        if (task.plannedExecutionTime || task.typeId !== 1) return;
        unratedFeaturesTotal++;
      });
    }
    return Promise.resolve({
      'typeId': metricsTypeId,
      'createdAt': input.executeDate,
      'value': unratedFeaturesTotal,
      'projectId': input.project.id,
      'sprintId': input.sprint.id,
      'userId': null
    });

  default:
    break;

  }
};
