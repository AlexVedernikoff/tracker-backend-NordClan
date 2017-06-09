const express = require('express');
const router = express.Router();
const ProjectController = require('./ProjectController');
const PortfolioController = require('./PortfolioController');


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


router.get('/projects-sync-force', ProjectController.syncForce);
router.get('/portfolios-sync-force', PortfolioController.syncForce);




module.exports = router;
