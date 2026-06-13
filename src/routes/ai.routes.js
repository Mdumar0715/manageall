const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai.controller');

router.post('/analyze', AIController.analyze);
router.get('/suggestions', AIController.getSuggestions);

module.exports = router;
