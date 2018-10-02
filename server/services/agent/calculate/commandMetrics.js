const { TaskStatusesDictionary } = require('../../../models');

module.exports = function (sprint) {

  // const history = {};

  sprint.tasks.forEach((task) => {

    // Для отладки
    if (task.id !== 1951) {
      return;
    }

    // const taskUserHistory = {}; // История по выполнениям и возвратоам у исполнителей задачи
    // const activePerformerId = null; // Текущий исполнитель
    // const previousPerformerId = null; // Предыдущий исполнетель
    // const isQaPrevious = false; // Для того что бы не посчитать возврат по несколько раз
    const timesheetGroupByDay = getTimesheetGroupByDay(task.timesheets.sort((a, b) => a.onDate - b.onDate), new Map());
    // const statusHistory = getStatusHistoryForDayAndUser(task)
    const tempMap2 = new Map();


    timesheetGroupByDay.forEach((day, index) => {

      // В этот день только 1 запись в таймшитах
      if (day.length === 1) {
        const sheet = day[0];
        tempMap2.set(sheet.id, sheet);
        return;
      }

      // Есть ли тут qa и dev?
      const qaAndDev = isQaAndDevExists(day);

      if (!qaAndDev) {
        day.forEach(sheet => {
          tempMap2.set(sheet.id, sheet);
        });
        return;
      }

      if (qaAndDev) {
        // Если в один день была и qa и dev, то нужно идти в историю и смотреть последовательность стадий dev или qa.
        // Нужно остортировать все тш по истории статусов и владельцев
        const from = new Date(index);
        from.setHours(0);
        from.setMinutes(0);
        from.setSeconds(0);
        from.setMilliseconds(0);
        const to = new Date(from.valueOf());
        to.setMilliseconds(86400000 - 1);

        const dayHistory = task.history.filter((item) => {
          return from <= item.createdAt && item.createdAt <= to;
        });

        // if (isQaFirstInHistory(dayHistory)) {
        //
        // }

        // console.log(statuses);


        console.log(from.toISOString());
        console.log(to.toISOString());
        console.log(1);
        return;
      }

      if (qaAndDev && day.length === 2) {
        tempMap2.set(day[0].id, day[0]);
        tempMap2.set(day[1].id, day[1]);
        // return;
      }


      const sheet = day[0];
      tempMap2.set(sheet.id, sheet);


    });

    //console.log(timesheetGroupByDay);
    // console.log(statusHistory);

    return;

    // task.timesheets.sort((a, b) => a.onDate - b.onDate).forEach((sheetItem) => {
    //   // Пропускаю пустые шиты
    //   if (+sheetItem.spentTime === 0) {
    //     return;
    //   }
    //
    //   console.log('userId', sheetItem.userId, 'taskStatusId', sheetItem.taskStatusId, 'onDate', sheetItem.onDate, 'time', sheetItem.spentTime);
    //
    //   // Разработка
    //   if (sheetItem.taskStatusId === 3) {
    //     isQaPrevious = false;
    //     previousPerformerId = activePerformerId;
    //     activePerformerId = sheetItem.userId;
    //
    //     // Чувак разрабатывал это проект! Занести его в список!
    //     if (!taskUserHistory[sheetItem.userId]) {
    //       taskUserHistory[sheetItem.userId] = {
    //         qa: 0, // qa проверки
    //         return: 0 // возвраты
    //       };
    //     }
    //
    //     // Проверка возврат ли?
    //     for (const userId in taskUserHistory) {
    //       // Засчитываем возврат только предыдущему исполнетелю, а не всем. И только если перед этим был qa таймшит
    //       if (taskUserHistory[userId].qa && userId === previousPerformerId && isQaPrevious) {
    //         taskUserHistory[userId].return += 1;
    //       }
    //     }
    //
    //   }
    //
    //   // Тестирование. Делаю так что бы условие срабатывало только если тестированием ним шла разработка
    //   if (sheetItem.taskStatusId === 7) {
    //     for (const userId in taskUserHistory) {
    //       taskUserHistory[userId].qa = true;
    //     }
    //     isQaPrevious = true;
    //   }
    //
    //
    // });

    // Подвожу итоги задачи dev и qa через другую переменную что бы легче было отлаживать
    // for (const userId in taskUserHistory) {
    //   if (taskUserHistory[userId].qa) {
    //     if (!history[userId]) {
    //       history[userId] = {};
    //     }
    //
    //     if (!history[userId][task.id]) {
    //       history[userId][task.id] = {
    //         userId: userId,
    //         doneCount: 1,
    //         returnCount: taskUserHistory[userId].return,
    //         linkedBugsCount: task.linkedTasks.length
    //       };
    //     } else {
    //       history[userId][task.id].doneCount++;
    //       history[userId][task.id].doneCount += task.linkedTasks.length;
    //       if (taskUserHistory[userId].return) {
    //         history[userId][task.id].return++;
    //       }
    //     }
    //
    //   }
    //
    // }
    //
    // console.log('taskUserHistory', taskUserHistory);
    // console.log('history', history);

  });

  // Финальное преобразование данных
  // const result = [];
  // for (const userId in history) {
  //   const userMetric = {
  //     userId: +userId,
  //     done: 0,
  //     return: 0,
  //     linkedBugs: 0
  //   };
  //
  //   for (const taskId in history[userId]) {
  //     history[userId][taskId].doneCount && userMetric.done++;
  //     history[userId][taskId].returnCount && userMetric.return++;
  //     if (history[userId][taskId].linkedBugsCount) {
  //       userMetric.linkedBugsCount += history[userId][taskId].linkedBugs;
  //     }
  //   }
  //
  //   result.push(userMetric);
  // }
  //
  // console.log('result', result);

  return {};
};


function getTimesheetGroupByDay (timesheets, map) {
  // Заношу во мапу шиты с группировкой по дате, что бы потом осортировать то что в группе
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
//
// function getStatusHistoryForDayAndUser (task) {
//   const localHistory = [];
//   let activePerformerId = null;
//   let activeStatusId = task.statusId;
//
//   if (task.performerId) {
//     activePerformerId = task.performerId;
//     localHistory.push({
//       userId: activePerformerId,
//       prevStatusId: null,
//       statusId: activeStatusId,
//       date: task.updatedAt
//     });
//   }
//
//   // Сортирую от новых записей к старым что бы составить истрию переходов между исполнителями
//   task.history.sort((a, b) => b.createdAt - a.createdAt).forEach((historyItem) => {
//
//     if (historyItem.field === 'statusId') {
//       activeStatusId = historyItem.prevValueInt;
//
//       localHistory.push({
//         userId: activePerformerId,
//         statusId: activeStatusId,
//         date: historyItem.createdAt
//       });
//       return;
//     }
//
//     if (historyItem.field === 'performerId') {
//       activePerformerId = historyItem.prevValueInt;
//
//       localHistory.push({
//         userId: activePerformerId,
//         statusId: activeStatusId,
//         date: historyItem.createdAt
//       });
//       return;
//     }
//   });
//
//   return localHistory;
// }

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

// function isQaFirstInHistory (dayHistory) {
//   let isDevFirst = false;
//   let isQaFirst = false;
//   dayHistory.forEach((sheet) => {
//     if (isDevelopStatus(sheet.taskStatusId) && !isQaFirst) {
//       isDevFirst = true;
//       return;
//     }
//
//     if (isQaStatus(sheet.taskStatusId) && !isDevFirst) {
//       isQaFirst = true;
//     }
//   });
//
//   return isDevFirst && isQaFirst;
// }

function isDevelopStatus (statusId) {
  return TaskStatusesDictionary.DEVELOP_STATUSES.indexOf(statusId) !== -1 || statusId === TaskStatusesDictionary.STATUS_NEW;
}

function isQaStatus (statusId) {
  return TaskStatusesDictionary.QA_STATUSES.indexOf(statusId) !== -1;
}

