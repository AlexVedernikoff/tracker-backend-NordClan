const {
  jiraSync,
  createProject,
  getJiraProjects,
  setProjectAssociation,
  jiraAuth,
  getActiveSimtrackProjects,
  createBatch,
  getProjectAssociations,
  setAssociateWithJiraProject
} = require('../../../services/synchronizer/index');
const createError = require('http-errors');

exports.jiraSynchronize = async function (req, res, next) {
  try {
    const { payload } = req.body;
    const response = await jiraSync(req.headers, payload);
    res.json(response);
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
  ],
  "userEmailAssociation": [
    {"internalUserEmail":"abs@simbirsoft.com", "externalUserEmail": "anm@mail.ru"}
  ]
}
 */
exports.setJiraProjectAssociation = async function (req, res, next) {
  try {
    const { projectId, issueTypesAssociation, statusesAssociation, userEmailAssociation } = req.body;
    const projectAssociations = await setProjectAssociation(
      projectId,
      issueTypesAssociation,
      statusesAssociation,
      userEmailAssociation
    );
    res.json(projectAssociations);
  } catch (e) {
    next(createError(e));
  }
};

exports.jiraAuth = async function (req, res, next) {
  try {
    const { username, password, server, email } = req.body;
    const {
      data: { token }
    } = await jiraAuth(username, password, server, email);
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

exports.associateWithJiraProject = async function (req, res, next) {
  try {
    const { data: projects } = await getJiraProjects(req.headers);
    const { jiraProjectId, simTrackProjectId, jiraHostName } = req.body;
    const jiraProject = projects.find((p) => p.id === jiraProjectId);
    if (!jiraProject) {
      throw createError(404, 'Not found jira project');
    }
    await setAssociateWithJiraProject(simTrackProjectId, jiraProjectId, jiraHostName);
    res.end();
  } catch (e) {
    next(createError(e));
  }
};

exports.clearAssociationWithJiraProject = async function (req, res, next) {
  try {
    const { simTrackProjectId } = req.body;

  } catch (e) {
    next(createError(e));
  }
};

exports.getActiveSimtrackProjects = async function (req, res, next) {
  try {
    const projects = await getActiveSimtrackProjects();
    res.json(projects);
  } catch (e) {
    next(createError(e));
  }
};

exports.getProjectAssociation = async function (req, res, next) {
  try {
    const { projectId } = req.query;
    const associations = await getProjectAssociations(projectId);
    res.json(associations);
  } catch (e) {
    next(createError(e));
  }
};

exports.createBatch = async function (req, res, next) {
  try {
    const { pid } = req.body;
    const response = await createBatch(req.headers, pid);
    res.json(response.data);
  } catch (e) {
    next(createError(e));
  }
};
