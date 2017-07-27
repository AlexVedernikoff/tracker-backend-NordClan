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


router.post('/auth/login', AuthController.login);
router.delete('/auth/logout', AuthController.logout);

router.get('/user/autocompleter', UserController.autocomplete);
router.get('/user/me', UserController.me);
router.get('/user/:id', UserController.read);

router.get('/:taggable(project|task)/tag', TagController.autocompliter);
router.post('/:taggable(project|task)/:taggableId/tag', TagController.create);
router.get('/:taggable(project|task)/:taggableId/tag', TagController.list);
router.delete('/:taggable(project|task)/:taggableId/tag/:tag', TagController.delete);

router.post('/project', ProjectController.create);
router.get('/project/:id', ProjectController.read);
router.put('/project/:id', ProjectController.update);
router.delete('/project/:id', ProjectController.delete);
router.get('/project', ProjectController.list);
router.put('/project/:id/status', ProjectController.setStatus);

router.post('/project/:projectId/users', ProjectUsersController.create);
router.get('/project/:projectId/users', ProjectUsersController.list);
router.delete('/project/:projectId/users/:userId', ProjectUsersController.delete);

router.get('/portfolio', PortfolioController.list);
router.put('/portfolio/:id', PortfolioController.update);
router.get('/portfolio/:id', PortfolioController.read);
// Отключил т.к. портфели выбираются или создаются при создании проекта. Остальное в системе не используется
/* router.post('/portfolio', PortfolioController.create);
router.delete('/portfolio/:id', PortfolioController.delete);
*/

router.post('/sprint', SprintController.create);
router.get('/sprint/:id', SprintController.read);
router.put('/sprint/:id', SprintController.update);
router.delete('/sprint/:id', SprintController.delete);
router.get('/sprint', SprintController.list);
router.put('/sprint/:id/status', SprintController.setStatus);

router.post('/task', TaskController.create);
router.get('/task/:id', TaskController.read);
router.put('/task/:id', TaskController.update);
router.delete('/task/:id', TaskController.delete);
router.get('/task', TaskController.list);
router.put('/task/:taskId/status', TaskController.setStatus);
router.post('/task/:taskId/users', TaskUsersController.create);
router.post('/task/:taskId/links/', TaskTasksController.create);
router.delete('/task/:taskId/links/:linkedTaskId', TaskTasksController.delete);

// Timesheets
router.post('/task/:taskId/timesheet', TimesheetController.create);
router.put('/task/:taskId/timesheet/:timesheetId', TimesheetController.update);
router.delete('/task/:taskId/timesheet/:timesheetId', TimesheetController.delete);
router.get('/task/:taskId/timesheet', TimesheetController.list);



router.get('/:entity(project|task|sprint)/status/dictionary/', DictionaryController.status);
router.get('/dictionary/project-roles', DictionaryController.projectRoles);

router.post('/:entity(project|task)/:entityId/attachment', UploadController.upload);
router.delete('/:entity(project|task)/:entityId/attachment/:attachmentId', UploadController.delete);

module.exports = router;
