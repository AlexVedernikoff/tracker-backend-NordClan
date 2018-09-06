const { jiraSync, createProject, setProjectAssociation } = require('../../../services/taskSynchronizer/index');
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

exports.createJiraProject = function (req, res, next) {


};

/**
 {
  "issueTypesAssociation":[
    {"projectId": 2, "internalTaskTypeId":"1", "externalTaskTypeId": 5}
  ],
  "statusesAssociation": [
  {"projectId": 2, "internalStatusId":"1", "externalStatusId": 5}
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
