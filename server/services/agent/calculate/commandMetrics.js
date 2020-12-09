const { TaskStatusesDictionary, TaskTypesDictionary } = require('../../../models');

module.exports = function (sprint) {
  const result = {};

  sprint.tasks.forEach((task) => {

    /** Объеденяю таймшиты по дням */
    const timesheetGroupByDay = getTimesheetGroupByDay(task);
    /** Из истории таски (task_history) создаю историю статусов и исполнителей в рамках задачи */
    const statusHistory = getHistoryOfStatuses(task);
    /** Сортирую тайшиты, в т.ч. подключаю историю статусов если нужно */
    const sortedSheets = sortSheets(timesheetGroupByDay, statusHistory);
    /** Делаю подсчет выполненных тасок, возвратов */
    const taskUserHistory = getTaskUsersHistory(sortedSheets);
    /** Добавляю данные по таске в результирующий объект */
    taskHistoryToSprintHistory(taskUserHistory, task, result);

  });

  return result;
};


function getTimesheetGroupByDay (task) {
  const timesheets = task.timesheets.sort((a, b) => a.onDate - b.onDate);
  const map = new Map();
  // Заношу в мапу шиты с группировкой по дате, для дальнейшенй обработке
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
    createdAt: task.createdAt,
  });

  // Сортирую от новых записей к старым что бы составить истрию переходов между исполнителями
  taskHistory.forEach((historyItem) => {

    if (historyItem.field === 'statusId') {
      statusId = historyItem.valueInt;

      result.push({
        userId: userId,
        dev: isDevelopStatus(statusId),
        qa: isQaStatus(statusId),
        createdAt: historyItem.createdAt,
      });
      return;
    }

    if (historyItem.field === 'performerId') {
      userId = historyItem.valueInt;

      result.push({
        userId: userId,
        dev: isDevelopStatus(statusId),
        qa: isQaStatus(statusId),
        createdAt: historyItem.createdAt,
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

function isDevelopStatus (statusId) {
  return TaskStatusesDictionary.DEVELOP_STATUSES.indexOf(statusId) !== -1 || statusId === TaskStatusesDictionary.STATUS_NEW;
}

function isQaStatus (statusId) {
  return TaskStatusesDictionary.QA_STATUSES.indexOf(statusId) !== -1;
}

function filterHistoryByDay (history, date) {
  let firstIndex;
  const from = new Date(date);
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  from.setMilliseconds(0);
  const to = new Date(from.valueOf());
  to.setMilliseconds(86400000 - 1);

  const result = history.filter((item, index) => {
    if (from <= item.createdAt && item.createdAt <= to) {
      if (!firstIndex) {
        firstIndex = index;
      }
      return true;
    }
  });

  if (!firstIndex) {
    firstIndex = history.length;
  }

  if (history[firstIndex - 1]) {
    result.unshift(history[firstIndex - 1]);
  }

  return result;
}

function sortSheets (timesheetGroupByDay, statusHistory) {
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

      dayHistory.forEach((item) => {
        day.forEach((sheet, dayIndex) => {
          if (
            item.userId === sheet.userId
            && ((item.qa && isQaStatus(sheet.taskStatusId)) || (item.dev && isDevelopStatus(sheet.taskStatusId)))
          ) {
            returnMap.set(sheet.id, sheet);
            delete day[dayIndex];
          }
        });
      });

    }

  });

  return returnMap;

}

function getTaskUsersHistory (soretedSheets) {
  const taskUserHistory = new Map(); // История по выполнениям и возвратоам у исполнителей задачи
  let activePerformerId = null; // Текущий исполнитель
  let previousPerformerId = null; // Предыдущий исполнетель
  let isQaPrevious = false; // Для того что бы не посчитать возврат по несколько раз

  for (const sheetItem of soretedSheets.values()) {

    // Разработка
    if (TaskStatusesDictionary.DEVELOP_STATUSES.indexOf(sheetItem.taskStatusId) !== -1) {
      previousPerformerId = activePerformerId;
      activePerformerId = sheetItem.userId;

      // Чувак разрабатывал это проект! Занести его в список!
      if (!taskUserHistory.has(sheetItem.userId)) {
        taskUserHistory.set(sheetItem.userId, {
          qa: 0, // qa проверки
          return: 0, // возвраты
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

function taskHistoryToSprintHistory (taskUserHistory, task, history) {
  // Подвожу итоги задачи dev и qa через другую переменную что бы легче было отлаживать
  for (const userId of taskUserHistory.keys()) {
    if (taskUserHistory.get(userId).qa) {


      if (!history[userId]) {
        history[userId] = {
          taskDoneCount: 0,
          taskReturnCount: 0,
          bugDoneCount: 0,
          bugReturnCount: 0,
          linkedBugsCount: 0,
        };
      }

      if (task.linkedTasks.length) {
        history[userId].linkedBugsCount += task.linkedTasks.length;
      }

      // Фича
      if (TaskTypesDictionary.FEATURES_TYPES.indexOf(task.typeId) !== -1) {
        history[userId].taskDoneCount++;
        if (taskUserHistory.get(userId).return) {
          history[userId].taskReturnCount++;
        }

      // Баг
      } else if (TaskTypesDictionary.BUGS_TYPES.indexOf(task.typeId) !== -1) {
        history[userId].bugDoneCount++;
        if (taskUserHistory.get(userId).return) {
          history[userId].bugReturnCount++;
        }

      }
    }
  }
}
