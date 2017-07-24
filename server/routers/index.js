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


router.post('/auth/login', AuthController.login);
router.delete('/auth/logout', AuthController.logout);

router.get('/user/autocompleter', UserController.autocomplete);
router.get('/user/me', UserController.me);
router.get('/user/:id', UserController.raed);

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
// Отключил т.к. портфели выбираются или создаются при создании проекта. Остальное в системе не используется
/* router.post('/portfolio', PortfolioController.create);
router.get('/portfolio/:id', PortfolioController.read);
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

router.get('/tag/autocompliter/:taggable', TagController.autocompliter);
router.post('/tag', TagController.create);
router.delete('/tag/:taggable/:id', TagController.delete);
router.get('/tag/:taggable/:id', TagController.list);

router.get('/dictionary/statuses/:entity', DictionaryController.statuses);
router.get('/dictionary/project-roles', DictionaryController.projectRoles);

router.post('/upload/:entity/:entityId',  UploadController.upload);
router.delete('/upload/:entity/:entityId/:attachmentId',  UploadController.delete);


module.exports = router;
