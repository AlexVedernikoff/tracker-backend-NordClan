const express = require('express');
const router = express.Router();
const ProjectController = require('./Project');


router.post('/project', ProjectController.create);
router.get('/project/:id', ProjectController.read);
router.put('/project/:id', ProjectController.update);
router.delete('/project/:id', ProjectController.delete);
router.get('/project', ProjectController.list);
router.get('/projects-sync-force', ProjectController.syncForce);

module.exports = router;
