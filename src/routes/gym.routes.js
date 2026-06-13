const express = require('express');
const router = express.Router();
const GymController = require('../controllers/gym.controller');

router.get('/', GymController.getAll);
router.get('/day/:day', GymController.getByDay);
router.post('/', GymController.create);
router.put('/:id', GymController.update);
router.delete('/:id', GymController.delete);

module.exports = router;
