const {
  jiraSync,
  createProject,
  getJiraProjects,
  setProjectAssociation,
  jiraAuth
} = require('../../../services/synchronizer/index');
const createError = require('http-errors');

// TODO: провести ревью и допилить
exports.jiraSynchronize = async function (req, res, next) {
  try {
    const { payload } = req.body;
    await jiraSync(payload);
    res.sendStatus(200);
  } catch (e) {
    next(createError(e));
  }
};

/**
 * @param id - id проекта в jira
 * @param authorId - id пользователя симтрека
 */
exports.createJiraProject = async function (req, res, next) {
  try {
    const { id, authorId, prefix } = req.body;
    const project = await createProject(req.headers, id, authorId, prefix);
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
    const { projectId, issueTypesAssociation, statusesAssociation } = req.body;
    const projectAssociations = await setProjectAssociation(
      projectId,
      issueTypesAssociation,
      statusesAssociation
    );
    res.json(projectAssociations);
  } catch (e) {
    next(createError(e));
  }
};

exports.jiraAuth = async function (req, res, next) {
  try {
    const { username, password, server } = req.body;
    const {
      data: { token }
    } = await jiraAuth(username, password, server);
    res.json({ token });
  } catch (e) {
    next(createError(e));
  }
};

exports.getJiraProjects = async function (req, res, next) {
  try {
    const { data: projects } = await getJiraProjects(req.headers);
    res.json({ projects });
  } catch (e) {
    next(createError(e));
  }
};
