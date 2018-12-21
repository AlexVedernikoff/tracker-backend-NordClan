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
  getJiraProjectById,
  getJiraProjectUsers
} = require('../../../services/synchronizer/index');
const createError = require('http-errors');

// принимает данные для синхронизации и проводит синхронизацию
exports.jiraSynchronize = async function (req, res, next) {
  try {
    const { payload } = req.body;
    const response = await jiraSync(req.headers, payload);
    res.json(response);
  } catch (e) {
    next(createError(e));
  }
};

// авторизация
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

// получить проекты из жиры
exports.getJiraProjects = async function (req, res, next) {
  try {
    const { data: projects } = await getJiraProjects(req.headers);
    res.json({ projects });
  } catch (e) {
    next(createError(e));
  }
};

// пока не делаем
exports.clearAssociationWithJiraProject = async function (req, res, next) {
  try {
    await clearProjectAssociate(req.params.id);
    res.end();
  } catch (e) {
    next(createError(e));
  }
};

// для питонистов
exports.getActiveSimtrackProjects = async function (req, res, next) {
  try {
    const projects = await getActiveSimtrackProjects();
    res.json(projects);
  } catch (e) {
    next(createError(e));
  }
};

// отдает существующие ассоциации у проекта
exports.getProjectAssociation = async function (req, res, next) {
  try {
    const associations = await getProjectAssociations(req.params.projectId);
    res.json(associations);
  } catch (e) {
    next(createError(e));
  }
};

// отдает всю инфу из жиры
exports.getJiraProject = async function (req, res, next) {
  try {
    const [ { data }, users ] = await Promise.all([
      getJiraProjectById(req.params.jiraProjectId, req.headers),
      getJiraProjectUsers(req.headers, req.params.jiraProjectId)
    ]);
    res.json({
      issue_type: data.issue_types,
      status_type: data.status_type,
      users
    });
  } catch (e) {
    if (e.response && [404].indexOf(e.response.status) !== -1) {
      return next(createError(404, e.response.data));
    }

    next(createError(e));
  }
};

// вручную запускат синхронизацию
exports.createBatch = async function (req, res, next) {
  try {
    const { pid } = req.body;
    const response = await createBatch(req.headers, pid);
    res.json(response.data);
  } catch (e) {
    next(createError(e));
  }
};


// // Устарело
// exports.associateWithJiraProject = async function (req, res, next) {
//   try {
//     const { data: projects } = await getJiraProjects(req.headers);
//     const { jiraProjectId, simtrackProjectId, jiraHostName } = req.body;
//     const jiraProject = projects.find((p) => p.id === jiraProjectId);
//     if (!jiraProject) {
//       throw createError(404, 'Not found jira project');
//     }
//     const jiraExternalId = await setAssociateWithJiraProject(simtrackProjectId, jiraProjectId, jiraHostName, jiraProject.name);
//     res.json({jiraExternalId, jiraProjectName: jiraProject.name});
//   } catch (e) {
//     console.error(e);
//     next(createError(e));
//   }
// };
//
// /**
//  // TODO: добавить емейлы пользователей
//  {
//   "projectId": 2,
//   "issueTypesAssociation":[
//     {"internalTaskTypeId":"1", "externalTaskTypeId": 5}
//   ],
//   "statusesAssociation": [
//     {"internalStatusId":"1", "externalStatusId": 5}
//   ],
//   "userEmailAssociation": [
//     {"internalUserEmail":"abs@simbirsoft.com", "externalUserEmail": "anm@mail.ru"}
//   ]
// }
//  */
// // Устарело
// exports.setJiraProjectAssociation = async function (req, res, next) {
//   try {
//     const { projectId, issueTypesAssociation, statusesAssociation, userEmailAssociation } = req.body;
//     const projectAssociations = await setProjectAssociation(
//       projectId,
//       issueTypesAssociation,
//       statusesAssociation,
//       userEmailAssociation
//     );
//     res.json(projectAssociations);
//   } catch (e) {
//     next(createError(e));
//   }
// };


exports.linkProject = async function (req, res, next) {
  try {
    // link Project
    const simtrackProjectId = req.params.projectId;
    const { data: projects } = await getJiraProjects(req.headers);
    const { jiraProjectId, jiraHostName } = req.body;
    const jiraProject = projects.find((p) => p.id === jiraProjectId);
    if (!jiraProject) {
      throw createError(404, 'Not found jira project');
    }
    const jiraExternalId = await setAssociateWithJiraProject(simtrackProjectId, jiraProjectId, jiraHostName, jiraProject.name);

    // create Association
    const { issueTypesAssociation, statusesAssociation, userEmailAssociation } = req.body;
    const projectAssociations = await setProjectAssociation(
      simtrackProjectId,
      issueTypesAssociation,
      statusesAssociation,
      userEmailAssociation
    );

    res.json({
      jiraExternalId,
      jiraProjectName: jiraProject.name,
      ...projectAssociations
    });


  } catch (e) {
    next(createError(e));
  }
};
