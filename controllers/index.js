const express = require('express');
const router = express.Router();
const ProjectController = require('./ProjectController');
const PortfolioController = require('./PortfolioController');
const SprintController = require('./SprintController');


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


router.get('/project-sync-force', ProjectController.syncForce);
router.get('/portfolio-sync-force', PortfolioController.syncForce);
router.get('/sprint-sync-force', SprintController.syncForce);




module.exports = router;
