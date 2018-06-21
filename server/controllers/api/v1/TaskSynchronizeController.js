const { jiraSync } = require('../../../services/taskSynchronizer/index');

exports.jiraSynchronize = function (req, res, next) {
  // обработка запроса
  //валидация каждой задачи и таймшита
  // использование сервиса
  const p = jiraSync([]);


};
