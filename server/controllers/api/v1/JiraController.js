const {
  jiraSync,
  createProject,
  getJiraProjects,
  setProjectAssociation,
  jiraAuth,
  getActiveSimtrackProjects,
  createBatch,
  getProjectAssociations,
  setAssociateWithJiraProject,
  clearProjectAssociate,
  getJiraProjectById
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

exports.jiraAuth = async function (req, res, next) {
  try {
    const { username, password, server, email } = req.body;
    const {
      data: { token }
    } = await jiraAuth(username, password, server, email);
    res.json({ token });
  } catch (e) {
    if (e.response && [401, 403].indexOf(e.response.status) !== -1) {
      return next(createError(401, e.response.data));
    }

    next(createError(401, e));
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


exports.clearAssociationWithJiraProject = async function (req, res, next) {
  try {
    await clearProjectAssociate(req.params.id);
    res.end();
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
    const associations = await getProjectAssociations(req.params.projectId);
    res.json(associations);
  } catch (e) {
    next(createError(e));
  }
};

exports.getJiraProject = async function (req, res, next) {
  try {
    const { data } = await getJiraProjectById(req.params.jiraProjectId, req.headers);
    res.json({
      issue_type: data.issue_types,
      status_type: data.status_type
    });
  } catch (e) {
    if (e.response && [404].indexOf(e.response.status) !== -1) {
      return next(createError(404, e.response.data));
    }

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


// Устарело
exports.associateWithJiraProject = async function (req, res, next) {
  try {
    const { data: projects } = await getJiraProjects(req.headers);
    const { jiraProjectId, simtrackProjectId, jiraHostName } = req.body;
    const jiraProject = projects.find((p) => p.id === jiraProjectId);
    if (!jiraProject) {
      throw createError(404, 'Not found jira project');
    }
    const jiraExternalId = await setAssociateWithJiraProject(simtrackProjectId, jiraProjectId, jiraHostName, jiraProject.name);
    res.json({jiraExternalId, jiraProjectName: jiraProject.name});
  } catch (e) {
    console.error(e);
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
// Устарело
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


exports.linkProject = async function (req, res, next) {
  try {
    const { data: projects } = await getJiraProjects(req.headers);
    const { jiraProjectId, simtrackProjectId, jiraHostName } = req.body;
    const jiraProject = projects.find((p) => p.id === jiraProjectId);
    if (!jiraProject) {
      throw createError(404, 'Not found jira project');
    }
    const jiraExternalId = await setAssociateWithJiraProject(simtrackProjectId, jiraProjectId, jiraHostName, jiraProject.name);
    res.json({jiraExternalId, jiraProjectName: jiraProject.name});


  } catch (e) {
    next(createError(e));
  }
};
