const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const PortfolioController = require('../controllers/PortfolioController');
const SprintController = require('../controllers/SprintController');
const TaskController = require('../controllers/TaskController');
const AuthController = require('../controllers/AuthController');
const TagController = require('../controllers/TagController');
const UserController = require('../controllers/UserController');
const DictionaryController = require('../controllers/DictionaryController');
const ProjectUsersController = require('../controllers/ProjectUsersController');
const TaskTasksController = require('../controllers/TaskTasksController');
const UploadController = require('../controllers/UploadController');
const TimesheetController = require('../controllers/TimesheetController');
const CommentController = require('../controllers/TaskCommentController');
const HistoryController = require('../controllers/HistoryController');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');
const GlobalAccess = require('../middlewares/Access/RouterGlobalAccessMiddleWare');

// Auth
router.post('/auth/login', AuthController.login);
router.delete('/auth/logout', AuthController.logout);

// User
router.get('/user/autocompleter', GlobalAccess.can('user', 'autocomplete'), UserController.autocomplete);
router.get('/user/me', GlobalAccess.can('user', 'me'), UserController.me);
router.get('/user/:id', GlobalAccess.can('user', 'read'), UserController.read);

// Tags
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

router.post('/project/:projectId/users', GlobalAccess.can('projectUsers', 'create'), ProjectUsersController.create);
router.get('/project/:projectId/users', GlobalAccess.can('projectUsers', 'list'), ProjectUsersController.list);
router.delete('/project/:projectId/users/:userId', GlobalAccess.can('projectUsers', 'delete'), ProjectUsersController.delete);

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
router.delete('/task/:id', GlobalAccess.can('task', 'delete'), TaskController.delete);
router.get('/task', GlobalAccess.can('task', 'list'), TaskController.list);
router.post('/task/:taskId/links/', GlobalAccess.can('taskLinks', 'create'), TaskTasksController.create);
router.delete('/task/:taskId/links/:linkedTaskId', GlobalAccess.can('taskLinks', 'delete'), TaskTasksController.delete);

// Timesheets
router.post('/timesheet/', GlobalAccess.can('timesheet', 'create'), TimesheetController.create.bind(TimesheetController));
router.get('/timesheet/tracksAll/', GlobalAccess.can('timesheet', 'trackAll'), TimesheetController.getTracksAll);
router.get('/timesheet', GlobalAccess.can('timesheet', 'list'), TimesheetController.list);
router.put('/timesheet/', GlobalAccess.can('timesheet', 'update'), TimesheetController.update.bind(TimesheetController));
router.delete('/timesheet/:timesheetId', GlobalAccess.can('timesheet', 'delete'), TimesheetController.delete);
router.put('/draftsheet/', GlobalAccess.can('timesheet', 'update'), TimesheetController.updateDraft.bind(TimesheetController));

// Comments
router.post('/task/:taskId/comment', GlobalAccess.can('comment', 'create'), CommentController.create);
router.put('/task/:taskId/comment/:commentId', GlobalAccess.can('comment', 'update'), CommentController.update);
router.delete('/task/:taskId/comment/:commentId', GlobalAccess.can('comment', 'delete'), CommentController.delete);
router.get('/task/:taskId/comment', GlobalAccess.can('comment', 'list'), CommentController.list);

// Dictionaries
router.get('/dictionary/:entity(project|task|sprint|timesheet)/status', DictionaryController.status);
router.get('/dictionary/project/roles', DictionaryController.projectRoles);
router.get('/dictionary/task/types', DictionaryController.taskTypes);
router.get('/dictionary/timesheet/types', DictionaryController.timesheetTypes);
router.get('/:entity(project|task|sprint|timesheet)/status/dictionary/', DictionaryController.status); // Deprecated. но еще используется
router.get('/project/roles/dictionary', DictionaryController.projectRoles); // Deprecated. но еще используется
router.get('/timesheet/types/dictionary', DictionaryController.timesheetTypes); // Deprecated. но еще используется
router.get('/task/timesheet/types/dictionary', DictionaryController.timesheetTypes); // Deprecated. но еще используется

// Attachments
router.post('/:entity(project|task)/:entityId/attachment', GlobalAccess.can('attachment', 'upload'), UploadController.upload);
router.delete('/:entity(project|task)/:entityId/attachment/:attachmentId', GlobalAccess.can('attachment', 'delete'), UploadController.delete);

// History
router.get('/:entity(project|task)/:entityId/history', GlobalAccess.can('history', 'list'), HistoryController.list);

module.exports = router;
