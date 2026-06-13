const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/health.controller');

router.get('/', HealthController.getAll);
router.get('/today', HealthController.getToday);
router.post('/', HealthController.upsert);
router.put('/:id', HealthController.update);

module.exports = router;
