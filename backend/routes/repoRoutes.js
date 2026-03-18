const express = require('express');
const router = express.Router();
const { analyzeRepo, getRepoOverview, getRepoHealth, getRepoFiles, searchRepo, getRecommendations, getHistory } = require('../controllers/repoController');

// Define API routes
router.get('/history', getHistory);
router.post('/analyze', analyzeRepo);
router.get('/:id/overview', getRepoOverview);
router.get('/:id/health', getRepoHealth);
router.get('/:id/files', getRepoFiles);
router.post('/:id/search', searchRepo);
router.get('/:id/recommendations', getRecommendations);

module.exports = router;
