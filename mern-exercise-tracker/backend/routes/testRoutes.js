// backend/routes/testRoutes.js
const express = require('express');
const authVerify = require('../middleware/authMiddleware');  // Authentication middleware
const allowRoles = require('../middleware/roleMiddleware'); // Role-based authorization

const router = express.Router();

// Only admin can access
router.get('/admin-only', authVerify, allowRoles('admin'), (req, res) => {
  res.send('Welcome Admin!');
});

// Only doctor + admin can access
router.get('/doctor-data', authVerify, allowRoles('doctor', 'admin'), (req, res) => {
  res.send('Doctor access approved!');
});

// Only patients can access
router.get('/patient-info', authVerify, allowRoles('patient'), (req, res) => {
  res.send('Patient info accessed');
});

// Hospital + admin can access
router.get('/hospital-dashboard', authVerify, allowRoles('hospital', 'admin'), (req, res) => {
  res.send('Hospital dashboard');
});

// Only donor users can access
router.get('/donor-info', authVerify, allowRoles('donor'), (req, res) => {
  res.send('Donor access granted!');
});

module.exports = router;
