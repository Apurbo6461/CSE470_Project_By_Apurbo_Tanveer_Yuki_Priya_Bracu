const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

// Protected routes
router.use(protect);

router.post('/', emergencyController.createEmergency);
router.get('/', emergencyController.getUserEmergencies);
router.get('/:emergencyId', emergencyController.getEmergency);
router.patch('/:emergencyId', emergencyController.updateEmergency);
router.post('/:emergencyId/respond', emergencyController.respondToEmergency);

module.exports = router;