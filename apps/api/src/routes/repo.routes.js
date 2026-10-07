const express = require('express');
const repoController = require('../controllers/repo.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/provider-repos', (req, res, next) => repoController.listAvailableProviderRepos(req, res, next));
router.post('/connect', (req, res, next) => repoController.connectRepository(req, res, next));
router.get('/', (req, res, next) => repoController.listConnectedRepositories(req, res, next));
router.get('/:id', (req, res, next) => repoController.getRepositoryDetails(req, res, next));
router.patch('/:id/config', (req, res, next) => repoController.updateRepositoryConfig(req, res, next));

module.exports = router;
