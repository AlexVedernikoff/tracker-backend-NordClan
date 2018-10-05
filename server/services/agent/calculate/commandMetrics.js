const { TaskStatusesDictionary } = require('../../../models');

module.exports = function (sprint) {
  const sprintHistory = {};

  sprint.tasks.forEach((task) => {

    // Для отладки
    if (task.id !== 2013) {
      return;
    }
    const taskTimesheets = task.timesheets.sort((a, b) => a.onDate - b.onDate);
    /** Объеденяю таймшиты по дням */
    const timesheetGroupByDay = getTimesheetGroupByDay(taskTimesheets);
    /** Из истории таски создаю историю статусов и исполнителей в рамках задачи */
    const statusHistory = getHistoryOfStatuses(task);
    /** Сортирую тайшиты, в т.ч. по истории если нужно */
    const soretedSheets = getSortSheets(timesheetGroupByDay, statusHistory);
    /** Делаю подсчет выполненных тасок, возвратов */
    const taskUserHistory = getTaskUsersHistory(soretedSheets);
    /** Добавляю данные по таски в стоирю по спринту */
    taskHistoryToSprintHistory(taskUserHistory, sprintHistory, task);

    // console.log('statusHistory', statusHistory);
    console.log('soretedSheets', soretedSheets);
    console.log('taskUserHistory', taskUserHistory);
    console.log('history', sprintHistory);

  });

  /** Финальное преобразование данных, агрегирую данные в сводный объект */
  const result = finalCalc(sprintHistory);
  console.log('result', result);

  return result;
};


function getTimesheetGroupByDay (timesheets) {
  const map = new Map();
  // Заношу в мапу шиты с группировкой по дате, что бы потом осортировать то что в группе в другой функции
  timesheets.forEach((cur) => {
    // Пропускаю пустые шиты
    if (+cur.spentTime === 0) {
      return;
    }

    // Объеденяю по дате
    const date = cur.onDate.toISOString();

    if (!map.has(date)) {
      map.set(date, []);
    }

    map.get(date).push(cur);
  });
  return map;
}

/*function getHistoryOfStatuses (task) {
  const localHistory = [];
  let prevUserId = null;
  let userId = null;

  let prevStatusId = null;
  let statusId = task.statusId;

  if (task.performerId) {
    userId = task.performerId;
    localHistory.push({
      userId: userId,
      prevUserId: null,
      statusId: statusId,
      prevStatusId: null,
      createdAt: task.updatedAt
    });
  }

  // Сортирую от новых записей к старым что бы составить истрию переходов между исполнителями
  task.history.sort((a, b) => b.createdAt - a.createdAt).forEach((historyItem) => {

    if (historyItem.field === 'statusId') {
      prevStatusId = statusId;
      statusId = historyItem.prevValueInt;

      localHistory.push({
        userId: userId,
        prevUserId: prevUserId,
        statusId: statusId,
        prevStatusId: prevStatusId,
        createdAt: historyItem.createdAt
      });
      return;
    }

    if (historyItem.field === 'performerId') {
      prevUserId = userId;
      userId = historyItem.prevValueInt;

      localHistory.push({
        userId: userId,
        prevUserId: prevUserId,
        statusId: statusId,
        prevStatusId: prevStatusId,
        createdAt: historyItem.createdAt
      });
    }
  });

  return localHistory;
}*/

function getHistoryOfStatuses (task) {
  /*
  userId - dev|qa
   */
  const result = [];
  const taskHistory = task.history.sort((a, b) => a.createdAt - b.createdAt);
  const firstStatusRecord = taskHistory.find(item => item.field === 'statusId');
  const firstUserRecord = taskHistory.find(item => item.field === 'performerId');
  let statusId = firstStatusRecord && firstStatusRecord.prevValueInt || task.statusId;
  let userId = firstUserRecord && firstUserRecord.prevValueInt || task.performerId;

  result.push({
    userId: userId,
    dev: isDevelopStatus(statusId),
    qa: isQaStatus(statusId),
    createdAt: task.createdAt
  });

  // Сортирую от новых записей к старым что бы составить истрию переходов между исполнителями
  taskHistory.forEach((historyItem) => {

    if (historyItem.field === 'statusId') {
      statusId = historyItem.valueInt;

      result.push({
        userId: userId,
        dev: isDevelopStatus(statusId),
        qa: isQaStatus(statusId),
        createdAt: historyItem.createdAt
      });
      return;
    }

    if (historyItem.field === 'performerId') {
      userId = historyItem.valueInt;

      result.push({
        userId: userId,
        dev: isDevelopStatus(statusId),
        qa: isQaStatus(statusId),
        createdAt: historyItem.createdAt
      });
    }
  });

  return result;
}

function isQaAndDevExists (sheets) {
  let dev = false;
  let qa = false;
  sheets.forEach((sheet) => {
    if (isDevelopStatus(sheet.taskStatusId)) {
      dev = true;
      return;
    }

    if (isQaStatus(sheet.taskStatusId)) {
      qa = true;
    }
  });

  return dev && qa;
}

function isQaFirstInHistory (dayHistory) {
  let isDevFirst = false;
  let isQaFirst = false;
  dayHistory.forEach((sheet) => {
    if (isDevelopStatus(sheet.taskStatusId) && !isQaFirst) {
      isDevFirst = true;
      return;
    }

    if (isQaStatus(sheet.taskStatusId) && !isDevFirst) {
      isQaFirst = true;
    }
  });

  return isQaFirst;
}

function isDevelopStatus (statusId) {
  return TaskStatusesDictionary.DEVELOP_STATUSES.indexOf(statusId) !== -1 || statusId === TaskStatusesDictionary.STATUS_NEW;
}

function isQaStatus (statusId) {
  return TaskStatusesDictionary.QA_STATUSES.indexOf(statusId) !== -1;
}

function filterHistoryByDay (history, date) {
  const from = new Date(date);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  from.setMilliseconds(0);
  const to = new Date(from.valueOf());
  to.setMilliseconds(86400000 - 1);

  return history.filter((item) => {
    return from <= item.createdAt && item.createdAt <= to;
  });
}

function getSortSheets (timesheetGroupByDay, statusHistory) {
  const returnMap = new Map();

  timesheetGroupByDay.forEach((day, index) => {

    // В этот день только 1 запись в таймшитах
    if (day.length === 1) {
      const sheet = day[0];
      returnMap.set(sheet.id, sheet);
      return;
    }

    // Есть ли тут qa и dev?
    const qaAndDev = isQaAndDevExists(day);

    if (!qaAndDev) {
      day.forEach(sheet => {
        returnMap.set(sheet.id, sheet);
      });
      return;
    }

    if (qaAndDev) {
      // Если в один день была и qa и dev, то нужно идти в историю и смотреть последовательность стадий dev или qa.
      // Нужно остортировать все тш по истории статусов и исполнителей
      const dayHistory = filterHistoryByDay(statusHistory, index);
      console.log('dayHistory', dayHistory);
      dayHistory.forEach((item) => {
        day.forEach((sheet, dayIndex) => {
          if (item.userId === sheet.userId) {
            returnMap.set(sheet.id, sheet);
            delete day[dayIndex];
          }
        });
      });

    }

  });

  return returnMap;

}

// Финальное преобразование данных
function finalCalc (history) {
  const result = [];
  for (const userId in history) {
    const userMetric = {
      userId: +userId,
      done: 0,
      return: 0,
      bugs: 0
    };

    for (const taskId in history[userId]) {
      history[userId][taskId].doneCount && userMetric.done++;
      history[userId][taskId].returnCount && userMetric.return++;
      if (history[userId][taskId].linkedBugsCount) {
        userMetric.bugs += history[userId][taskId].linkedBugsCount;
      }
    }

    result.push(userMetric);
  }
  return result;
}

function getTaskUsersHistory (soretedSheets) {
  const taskUserHistory = new Map(); // История по выполнениям и возвратоам у исполнителей задачи
  let activePerformerId = null; // Текущий исполнитель
  let previousPerformerId = null; // Предыдущий исполнетель
  let isQaPrevious = false; // Для того что бы не посчитать возврат по несколько раз

  for (const sheetItem of soretedSheets.values()) {
    console.log('userId', sheetItem.userId, 'taskStatusId', sheetItem.taskStatusId, 'onDate', sheetItem.onDate, 'time', sheetItem.spentTime);

    // Разработка
    if (TaskStatusesDictionary.DEVELOP_STATUSES.indexOf(sheetItem.taskStatusId) !== -1) {
      previousPerformerId = activePerformerId;
      activePerformerId = sheetItem.userId;

      // Чувак разрабатывал это проект! Занести его в список!
      if (!taskUserHistory.has(sheetItem.userId)) {
        taskUserHistory.set(sheetItem.userId, {
          qa: 0, // qa проверки
          return: 0 // возвраты
        });
      }

      // Проверка возврат ли?
      for (const userId of taskUserHistory.keys()) {
        // Засчитываем возврат только предыдущему исполнетелю, а не всем. И только если перед этим был qa таймшит
        if (taskUserHistory.get(userId).qa && userId === previousPerformerId && isQaPrevious) {
          taskUserHistory.get(userId).return += 1;
        }
      }

      isQaPrevious = false;
    }

    // Тестирование. Делаю так что бы условие срабатывало только если тестированием ним шла разработка
    if (TaskStatusesDictionary.QA_STATUSES.indexOf(sheetItem.taskStatusId) !== -1) {

      for (const userId of taskUserHistory.keys()) {
        taskUserHistory.get(userId).qa = true;
      }

      isQaPrevious = true;
    }

  }
  return taskUserHistory;
}

function taskHistoryToSprintHistory (taskUserHistory, history, task) {
  // Подвожу итоги задачи dev и qa через другую переменную что бы легче было отлаживать
  for (const userId of taskUserHistory.keys()) {
    if (taskUserHistory.get(userId).qa) {
      if (!history[userId]) {
        history[userId] = {};
      }

      if (!history[userId][task.id]) {
        history[userId][task.id] = {
          userId: userId,
          doneCount: 1,
          returnCount: taskUserHistory.get(userId).return,
          linkedBugsCount: task.linkedTasks.length
        };
      } else {
        history[userId][task.id].doneCount++;
        history[userId][task.id].doneCount += task.linkedTasks.length;
        if (taskUserHistory.get(userId).return) {
          history[userId][task.id].return++;
        }
      }

    }
  }
}
