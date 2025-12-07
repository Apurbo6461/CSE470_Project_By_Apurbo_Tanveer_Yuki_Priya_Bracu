// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assuming the User model exists
const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Personalized message based on user role
    let welcomeMessage = '';
    switch (user.role) {
      case 'admin':
        welcomeMessage = 'Welcome Admin';
        break;
      case 'doctor':
        welcomeMessage = 'Welcome Doctor';
        break;
      case 'patient':
        welcomeMessage = 'Patient, you have access';
        break;
      case 'donor':
        welcomeMessage = 'Welcome Donor';
        break;
      case 'hospital':
        welcomeMessage = 'Welcome Hospital';
        break;
      default:
        welcomeMessage = 'Welcome User';
    }

    res.json({ token, role: user.role, message: welcomeMessage });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
