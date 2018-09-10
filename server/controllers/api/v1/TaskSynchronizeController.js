const { jiraSync, createProject, setProjectAssociation, jiraAuth } = require('../../../services/taskSynchronizer/index');
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

exports.createJiraProject = async function (req, res, next) {
  // TODO:
// заренеймить файлы и пути в симтреке касательно джиры
// заменить аксиос на стоковый реквестер в ноде
  const { key } = req.body;
  try {
    const project = await createProject(key);
    res.json(project);
  } catch (e) {
    next(createError(e));
  }
};

/**
 // TODO: добавить емейлы пользователей
 {
  "projectId": 2,
  "issueTypesAssociation":[
    {"internalTaskTypeId":"1", "externalTaskTypeId": 5}
  ],
  "statusesAssociation": [
    {"internalStatusId":"1", "externalStatusId": 5}
  ]
}
 */
exports.setJiraProjectAssociation = async function (req, res, next) {
  try {
    const projectAssociations = await setProjectAssociation(req.body.projectId, req.body.issueTypesAssociation, req.body.statusesAssociation);
    res.json(projectAssociations);
  } catch (e) {
    next(createError(e));
  }
};

exports.jiraAuth = async function (req, res, next) {
  const { username, password, server } = req.body;
  try {
    const token = await jiraAuth(username, password, server);
    res.json(token);
  } catch (e) {
    next(createError(e));
  }
};
