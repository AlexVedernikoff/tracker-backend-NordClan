const { jiraSync } = require('../../../services/taskSynchronizer/index');
const createError = require('http-errors');

exports.jiraSynchronize = function (req, res, next) {
  // обработка запроса
  //валидация каждой задачи и таймшита
  // использование сервиса
  try {
    const p = jiraSync(req.body.payload);
    console.log(p);
    res.sendStatus(200);
  } catch (e) {
    next(createError(e));
  }


};
