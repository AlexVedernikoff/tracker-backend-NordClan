const {getTaskFactTimeByQa} = require('../../../services/timesheets/spent');

async function getQaTimeByTask (task) {
  let qaPercent;
  let qaPlannedTime;

  if (task.sprint) {
    qaPercent = task.sprint.qaPercent ? task.sprint.qaPercent : 0;
  }

  if (!qaPercent) {
    qaPercent = task.project ? task.project.qaPercent : 0;
  }

  if (qaPercent && task.plannedExecutionTime) {
    qaPlannedTime = qaPercent * task.plannedExecutionTime * 0.01;
  }
  const qaFactExecutionTime = await getTaskFactTimeByQa(task.id);
  return {'qaFactExecutionTime': qaFactExecutionTime, 'qaPlannedTime': qaPlannedTime};
}

module.exports = { getQaTimeByTask };
