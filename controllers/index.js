const express = require('express');
const router = express.Router();
const ProjectController = require('./ProjectController');
const PortfolioController = require('./PortfolioController');
const SprintController = require('./SprintController');
const TaskController = require('./TaskController');
const AuthController = require('./AuthController');


router.post('/project', ProjectController.create);
router.get('/project/:id', ProjectController.read);
router.put('/project/:id', ProjectController.update);
router.delete('/project/:id', ProjectController.delete);
router.get('/project', ProjectController.list);


router.post('/portfolio', PortfolioController.create);
router.get('/portfolio/:id', PortfolioController.read);
router.put('/portfolio/:id', PortfolioController.update);
router.delete('/portfolio/:id', PortfolioController.delete);
router.get('/portfolio', PortfolioController.list);

router.post('/sprint', SprintController.create);
router.get('/sprint/:id', PortfolioController.read);
router.put('/sprint/:id', SprintController.update);
router.delete('/sprint/:id', SprintController.delete);
router.get('/sprint', SprintController.list);

router.post('/task', TaskController.create);
router.get('/task/:id', TaskController.read);
router.put('/task/:id', TaskController.update);
router.delete('/task/:id', TaskController.delete);
router.get('/task', TaskController.list);

router.post('/auth/login', AuthController.login);
router.delete('/auth/logout', AuthController.logout);
router.put('/auth/refresh', AuthController.refresh);


module.exports = router;
