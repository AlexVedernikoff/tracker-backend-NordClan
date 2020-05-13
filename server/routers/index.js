const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/api/v1/ProjectController');
const PortfolioController = require('../controllers/api/v1/PortfolioController');
const SprintController = require('../controllers/api/v1/SprintController');
const TaskController = require('../controllers/api/v1/TaskController');
const AuthController = require('../controllers/api/v1/AuthController');
const TagController = require('../controllers/api/v1/TagController');
const UserController = require('../controllers/api/v1/UserController');
const DictionaryController = require('../controllers/api/v1/DictionaryController');
const ProjectUsersController = require('../controllers/api/v1/ProjectUsersController');
const ReportsController = require('../controllers/api/v1/ReportsController');
const TaskTasksController = require('../controllers/api/v1/TaskTasksController');
const UploadController = require('../controllers/api/v1/UploadController');
const TimesheetController = require('../controllers/api/v1/TimesheetController');
const CommentController = require('../controllers/api/v1/TaskCommentController');
const HistoryController = require('../controllers/api/v1/HistoryController');
const MetricsController = require('../controllers/api/v1/MetricsController');
const MilestonesController = require('../controllers/api/v1/MilestonesController');
const GlobalAccess = require('../middlewares/Access/RouterGlobalAccessMiddleWare');
const JiraController = require('../controllers/api/v1/JiraController');
const TestCaseController = require('../controllers/api/v1/TestCaseController');
const TestSuiteController = require('../controllers/api/v1/TestSuiteController');
const TestPlanController = require('../controllers/api/v1/TestPlanController');
const { replaceAuthHeader } = require('../middlewares/Jira/RepalceAuthHeaderMiddleWare');

router.post('/milestones', MilestonesController.create);
router.put('/milestones/:id', MilestonesController.update);
router.delete('/milestones/:id', MilestonesController.delete);

// Auth
router.post('/auth/login', AuthController.login);
router.delete('/auth/logout', AuthController.logout);

// User
router.put('/user', GlobalAccess.can('user', 'updateRole'), UserController.updateUserRole);
router.put(
  '/user/update-profile',
  GlobalAccess.can('user', 'updateCurrentUserProfile'),
  UserController.updateCurrentUserProfile
);
router.patch(
  '/user/update-profile',
  GlobalAccess.can('user', 'updateUserProfile'),
  UserController.updateCurrentUserProfileByParams
);
router.get('/user/autocompleter', GlobalAccess.can('user', 'autocomplete'), UserController.autocomplete);
router.get(
  '/user/autocompleter/external',
  GlobalAccess.can('user', 'autocompleteExternal'),
  UserController.autocompleteExternal
);
router.get('/users/devops', GlobalAccess.can('projectUsers', 'list'), UserController.devOpsUsers);
router.get('/users/all', GlobalAccess.can('companyReports', 'read'), UserController.getAllUsers);
router.put('/users/update', GlobalAccess.can('user', 'updateUsersProfile'), UserController.updateUserProfile);
router.post('/users/create', GlobalAccess.can('user', 'createUser'), UserController.createUser);
router.get('/user/me', GlobalAccess.can('user', 'me'), UserController.me);
router.put(
  '/user/external/:id/refresh',
  GlobalAccess.can('user', 'refreshTokenExternal'),
  UserController.refreshTokenExternal
);
router.get('/user/roles', GlobalAccess.can('user', 'usersRoles'), UserController.getUsersRoles);
router.post('/user/external', GlobalAccess.can('user', 'createExternal'), UserController.createExternal);
router.get('/user/external', GlobalAccess.can('user', 'getExternalUsers'), UserController.getExternalUsers);
router.put('/user/external/:id', GlobalAccess.can('user', 'updateExternal'), UserController.updateExternal);
router.get('/user/internal', GlobalAccess.can('companyReports', 'read'), UserController.getInternalUsers);

router.put('/user/password/:token', UserController.setPassword);
router.put('/user/test/:id', GlobalAccess.can('user', 'updateTestUser'), UserController.updateTestUser);
router.get('/user/:id', GlobalAccess.can('user', 'read'), UserController.read);
router.get('/user', GlobalAccess.can('user', 'read'), UserController.getUser);
router.post('/user/:id/avatar', GlobalAccess.can('user', 'changeAvatar'), UploadController.uploadAvatar);
router.delete('/user/:id/avatar', GlobalAccess.can('user', 'changeAvatar'), UploadController.deleteAvatar);

// Tags
router.get('/project/:projectId/tags', GlobalAccess.can('project', 'read'), TagController.listByProject);
router.get('/:taggable(project|task)/tag', GlobalAccess.can('tag', 'autocompliter'), TagController.autocompliter);
router.post('/:taggable(project|task)/:taggableId/tag', GlobalAccess.can('tag', 'create'), TagController.create);
router.get('/:taggable(project|task)/:taggableId/tag', GlobalAccess.can('tag', 'list'), TagController.list);
router.delete('/:taggable(project|task)/:taggableId/tag/:tag', GlobalAccess.can('tag', 'delete'), TagController.delete);

// Projects
router.post('/project', GlobalAccess.can('project', 'create'), ProjectController.create);
router.get('/project/:id', GlobalAccess.can('project', 'read'), ProjectController.read);
router.put('/project/:id', GlobalAccess.can('project', 'update'), ProjectController.update);
router.delete('/project/:id', GlobalAccess.can('project', 'delete'), ProjectController.delete);
router.get('/project', GlobalAccess.can('project', 'read'), ProjectController.list);
router.post(
  '/project/addGitlabProject',
  GlobalAccess.can('project', 'addGitlabProject'),
  ProjectController.addGitlabProject
);
router.get(
  '/project/:id/getGitlabProjects',
  GlobalAccess.can('project', 'getGitlabProjects'),
  ProjectController.getProjects
);

router.post('/project/:projectId/users', GlobalAccess.can('projectUsers', 'create'), ProjectUsersController.create);
router.get('/project/:projectId/users', GlobalAccess.can('projectUsers', 'list'), ProjectUsersController.list);
router.delete(
  '/project/:projectId/users/:userId',
  GlobalAccess.can('projectUsers', 'delete'),
  ProjectUsersController.delete
);

router.get(
  '/project/gitLab/getGitlabNamespaces',
  GlobalAccess.can('project', 'getGitlabNamespaces'),
  ProjectController.getGitlabNamespaces
);
router.post(
  '/project/:id/createGitlabProject',
  GlobalAccess.can('project', 'createGitlabProject'),
  ProjectController.createGitlabProject
);

// Project reports
router.get('/project/:projectId/reports/period', GlobalAccess.can('project', 'read'), ReportsController.byPeriod);

// Project time sheets
router.get('/project/:projectId/timesheet', GlobalAccess.can('project', 'read'), TimesheetController.listProject);

// Portfolios
router.get('/portfolio', GlobalAccess.can('portfolio', 'list'), PortfolioController.list);
router.put('/portfolio/:id', GlobalAccess.can('portfolio', 'update'), PortfolioController.update);
router.get('/portfolio/:id', GlobalAccess.can('portfolio', 'read'), PortfolioController.read);
// Отключил т.к. портфели выбираются или создаются при создании проекта. Остальное в системе не используется
/* router.post('/portfolio', PortfolioController.create);
router.delete('/portfolio/:id', PortfolioController.delete);
*/

// Sprints
router.post('/sprint', GlobalAccess.can('sprint', 'create'), SprintController.create);
router.get('/sprint/:id', GlobalAccess.can('sprint', 'read'), SprintController.read);
router.put('/sprint/:id', GlobalAccess.can('sprint', 'update'), SprintController.update);
router.delete('/sprint/:id', GlobalAccess.can('sprint', 'delete'), SprintController.delete);
router.get('/sprint', GlobalAccess.can('sprint', 'list'), SprintController.list);

// Tasks
router.post('/task', GlobalAccess.can('task', 'create'), TaskController.create);
router.get('/task/:id', GlobalAccess.can('task', 'read'), TaskController.read);
router.put('/task/:id', GlobalAccess.can('task', 'update'), TaskController.update);
router.put('/tasks', GlobalAccess.can('task', 'update'), TaskController.updateAllByAttribute);
router.delete('/task/:id', GlobalAccess.can('task', 'delete'), TaskController.delete);
router.get('/task', GlobalAccess.can('task', 'list'), TaskController.list);
router.post('/task/:taskId/links/', GlobalAccess.can('taskLinks', 'create'), TaskTasksController.create);
router.delete('/task/:taskId/links/:linkedTaskId', GlobalAccess.can('taskLinks', 'delete'), TaskTasksController.delete);
router.get('/task/:id/spent/', GlobalAccess.can('task', 'read'), TaskController.getSpentTime);
router.post('/task/:id/createGitlabBranch/', TaskController.createGitlabBranch);
router.get('/task/:id/getGitlabBranchesById/', TaskController.getGitlabBranchesById);
router.get('/task/:id/getGitlabBranchesByRepoId/', TaskController.getGitlabBranchesByRepoId);

// Timesheets
router.post('/timesheet/', GlobalAccess.can('timesheet', 'create'), TimesheetController.create);
router.put('/timesheet/submit', GlobalAccess.can('timesheet', 'update'), TimesheetController.submit);
router.put('/timesheet/approve', GlobalAccess.can('timesheet', 'approve'), TimesheetController.approve);
router.put('/timesheet/reject', GlobalAccess.can('timesheet', 'reject'), TimesheetController.reject);
router.get('/timesheet/tracksAll/', GlobalAccess.can('timesheet', 'trackAll'), TimesheetController.getTracksAll);
router.get('/company-timesheets/', GlobalAccess.can('companyReports', 'read'), TimesheetController.listAllProjects);
router.get(
  '/company-timesheets/average-employees',
  GlobalAccess.can('companyReports', 'read'),
  TimesheetController.getAverageNumberOfEmployees
);
router.get(
  '/company-timesheets/reports/period',
  GlobalAccess.can('companyReports', 'export'),
  ReportsController.companyByPeriod
);
router.get('/timesheet', GlobalAccess.can('timesheet', 'list'), TimesheetController.list);
router.put('/timesheet', GlobalAccess.can('timesheet', 'update'), TimesheetController.update);
router.delete('/timesheet/:timesheetId', GlobalAccess.can('timesheet', 'delete'), TimesheetController.delete);
router.put('/draftsheet/', GlobalAccess.can('timesheet', 'update'), TimesheetController.updateDraft);

// Comments
router.post('/task/:taskId/comment', GlobalAccess.can('comment', 'create'), CommentController.create);
router.put('/task/:taskId/comment/:commentId', GlobalAccess.can('comment', 'update'), CommentController.update);
router.delete('/task/:taskId/comment/:commentId', GlobalAccess.can('comment', 'delete'), CommentController.delete);
router.get('/task/:taskId/comment', GlobalAccess.can('comment', 'list'), CommentController.list);

// Dictionaries
router.get('/dictionary/:entity(project|task|sprint|timesheet)/status', DictionaryController.status);
router.get('/dictionary/project/roles', DictionaryController.projectRoles);
router.get('/dictionary/project/types', DictionaryController.projectTypes);
router.get('/dictionary/task/types', DictionaryController.taskTypes);
router.get('/dictionary/timesheet/types', DictionaryController.timesheetTypes);
router.get('/:entity(project|task|sprint|timesheet)/status/dictionary/', DictionaryController.status); // Deprecated. но еще используется
router.get('/project/roles/dictionary', DictionaryController.projectRoles); // Deprecated. но еще используется
router.get('/timesheet/types/dictionary', DictionaryController.timesheetTypes); // Deprecated. но еще используется
router.get('/task/timesheet/types/dictionary', DictionaryController.timesheetTypes); // Deprecated. но еще используется
router.get('/dictionary/milestone/types', DictionaryController.milestoneTypes);
router.get('/dictionary/departments', DictionaryController.departments);

// Attachments
router.post(
  '/:entity(project|task)/:entityId/attachment',
  GlobalAccess.can('attachment', 'upload'),
  UploadController.upload
);
router.delete(
  '/:entity(project|task)/:entityId/attachment/:attachmentId',
  GlobalAccess.can('attachment', 'delete'),
  UploadController.delete
);

// History
router.get('/:entity(project|task)/:entityId/history', GlobalAccess.can('history', 'list'), HistoryController.list);

// Metrics
router.post('/metrics', GlobalAccess.can('metrics', 'list'), MetricsController.list);

// JiraS
router.post('/jira/auth', JiraController.jiraAuth);
router.get('/jira/project', replaceAuthHeader(), JiraController.getJiraProjects);
router.get('/jira/project/:jiraProjectId/info', replaceAuthHeader(), JiraController.getJiraProject);
router.get('/project/:projectId/jira/association', JiraController.getProjectAssociation);
router.post('/project/:projectId/jira/link', replaceAuthHeader(), JiraController.linkProject);
router.post('/jira/project/:jiraProjectId/handleSync', replaceAuthHeader(), JiraController.createBatch);
router.get('/jira/getActiveProjects', JiraController.getActiveSimtrackProjects); // Нужно питонистам
router.post('/jira/synchronize', GlobalAccess.can('jira', 'synchronize'), JiraController.jiraSynchronize);
router.get('/jira/cleanProjectAssociation/:id', JiraController.clearAssociationWithJiraProject); // эксперементальная функция, не документирована
router.post('/jira/setJiraSynchronizeStatus', GlobalAccess.can('jira', 'setStatus'), JiraController.setJiraSyncStatus);
router.get('/jira/getJiraSyncStatuses/:simtrackProjectId', JiraController.getJiraSyncStatuses);

//TestCases
router.get('/test-case', TestCaseController.getAllTestCases);
router.get('/test-case/:id', TestCaseController.getTestCaseById);
router.post('/test-case', TestCaseController.createTestCase);
router.put('/test-case/:id', TestCaseController.updateTestCase);
router.delete('/test-case/:id', TestCaseController.deleteTestCase);

//TestSuite
router.get('/test-suite', TestSuiteController.getAllTestSuites);
router.get('/test-suite/:id', TestSuiteController.getTestSuiteById);
router.post('/test-suite', TestSuiteController.createTestSuite);
router.put('/test-suite/:id', TestSuiteController.updateTestSuite);
router.delete('/test-suite/:id', TestSuiteController.deleteTestSuite);

//TestPlan
router.get('/test-plan', TestPlanController.getAllTestPlans);
router.get('/test-plan/:id', TestPlanController.getTestPlanById);
router.post('/test-plan', TestPlanController.createTestPlan);
router.put('/test-plan/:id', TestPlanController.updateTestPlan);
router.delete('/test-plan/:id', TestPlanController.deleteTestPlan);

module.exports = { routes: router };
