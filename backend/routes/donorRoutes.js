const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', donorController.getDonors);
router.get('/nearby', donorController.getNearbyDonors);

// Protected routes
router.use(protect);
router.post('/register', donorController.registerDonor);
router.patch('/:donorId/availability', donorController.updateAvailability);

module.exports = router;