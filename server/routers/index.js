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
const TaskUsersController = require('../controllers/TaskUsersController');
const TaskTasksController = require('../controllers/TaskTasksController');
const UploadController = require('../controllers/UploadController');
const TimesheetController = require('../controllers/TimesheetController');
const CommentController = require('../controllers/TaskCommentController');
const ModelHistoryController = require('../controllers/ModelHistoryController');
const TimesheetDraftController = require('../controllers/TimesheetDraftController');

// Auth
router.post('/auth/login', AuthController.login);
router.delete('/auth/logout', AuthController.logout);

// User
router.get('/user/autocompleter', UserController.autocomplete);
router.get('/user/me', UserController.me);
router.get('/user/:id', UserController.read);

// Tags
router.get('/:taggable(project|task)/tag', TagController.autocompliter);
router.post('/:taggable(project|task)/:taggableId/tag', TagController.create);
router.get('/:taggable(project|task)/:taggableId/tag', TagController.list);
router.delete('/:taggable(project|task)/:taggableId/tag/:tag', TagController.delete);

// Projects
router.post('/project', ProjectController.create);
router.get('/project/:id', ProjectController.read);
router.put('/project/:id', ProjectController.update);
router.delete('/project/:id', ProjectController.delete);
router.get('/project', ProjectController.list);
router.put('/project/:id/status', ProjectController.setStatus);  // Deprecated
router.post('/project/:projectId/users', ProjectUsersController.create);
router.get('/project/:projectId/users', ProjectUsersController.list);
router.delete('/project/:projectId/users/:userId', ProjectUsersController.delete);

// Portfolios
router.get('/portfolio', PortfolioController.list);
router.put('/portfolio/:id', PortfolioController.update);
router.get('/portfolio/:id', PortfolioController.read);
// Отключил т.к. портфели выбираются или создаются при создании проекта. Остальное в системе не используется
/* router.post('/portfolio', PortfolioController.create);
router.delete('/portfolio/:id', PortfolioController.delete);
*/

// Sprints
router.post('/sprint', SprintController.create);
router.get('/sprint/:id', SprintController.read);
router.put('/sprint/:id', SprintController.update);
router.delete('/sprint/:id', SprintController.delete);
router.get('/sprint', SprintController.list);

// Tasks
router.post('/task', TaskController.create);
router.get('/task/:id', TaskController.read);
router.put('/task/:id', TaskController.update);
router.delete('/task/:id', TaskController.delete);
router.get('/task', TaskController.list);
router.post('/task/:taskId/users', TaskUsersController.create); // Deprecated. но еще используется, аналог put /task/:id
router.post('/task/:taskId/links/', TaskTasksController.create);
router.delete('/task/:taskId/links/:linkedTaskId', TaskTasksController.delete);

// Timesheets
router.post('/timesheet/', TimesheetController.actionCreate.bind(TimesheetController));
router.get('/timesheet/tracksAll/', TimesheetController.getTracksAll.bind(TimesheetController));
router.get('/timesheet', TimesheetController.actionList);
router.get('/task/timesheet/getTimesheets', TimesheetController.actionList);// Deprecated. но еще используется, аналог /timesheet
router.put('/timesheetDraft/:timesheetDraftId/', TimesheetDraftController.updateVisible); // Deprecated. но еще используется
router.put('/timesheet/:sheetId/', TimesheetController.actionCreate.bind(TimesheetController)); // Deprecated. но еще используется
router.put('/timesheet/', TimesheetController.actionCreate.bind(TimesheetController));
router.delete('/timesheet/:timesheetId', TimesheetController.delete);

// Comments
router.post('/task/:taskId/comment', CommentController.create);
router.put('/task/:taskId/comment/:commentId', CommentController.update);
router.delete('/task/:taskId/comment/:commentId', CommentController.delete);
router.get('/task/:taskId/comment', CommentController.list);

// Dictionaries
router.get('/dictionary/:entity(project|task|sprint|timesheet)/status', DictionaryController.status);
router.get('/dictionary/project/roles', DictionaryController.projectRoles);
router.get('/dictionary/timesheet/types', DictionaryController.timesheetTypes);

router.get('/:entity(project|task|sprint|timesheet)/status/dictionary/', DictionaryController.status); // Deprecated
router.get('/project/roles/dictionary', DictionaryController.projectRoles); // Deprecated
router.get('/timesheet/types/dictionary', DictionaryController.timesheetTypes); // Deprecated
router.get('/task/timesheet/types/dictionary', DictionaryController.timesheetTypes); // Deprecated. но еще используется

// Attachments
router.post('/:entity(project|task)/:entityId/attachment', UploadController.upload);
router.delete('/:entity(project|task)/:entityId/attachment/:attachmentId', UploadController.delete);

// ModelHistory
router.get('/:entity(project|task)/:entityId/history', ModelHistoryController.list);

// Deprecated
router.post('/task/:taskId/timesheet', TimesheetController.actionCreate); // Deprecated
router.put('/task/:taskId/timesheet/:timesheetId', TimesheetController.update); // Deprecated
router.post('/timesheet/:taskId/setTime/', TimesheetController.createOrUpdateTimesheet.bind(TimesheetController)); // Deprecated
router.get('/timesheet/tracks/', TimesheetController.getTracks.bind(TimesheetController)); // Deprecated
// TimesheetsDraft, системные?
router.post('/task/:taskId/timesheetDraft', TimesheetDraftController.createDraft); // Deprecated
router.get('/timesheetDraft/:userId', TimesheetDraftController.getDrafts); // Deprecated

module.exports = router;
