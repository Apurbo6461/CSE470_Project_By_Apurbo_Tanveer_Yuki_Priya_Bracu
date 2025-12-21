const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * POST /api/auth/register
 * Public. Create a user with role 'donor' by default (or accept role in body if you want).
 * Body: { name, email, password, phone, role? }
 * Returns: { token, role, user: { _id, name, email, role }, message }
 */
router.post('/register', async (req, res) => {
  try {
    const { name = '', email = '', password = '', phone = '', role = 'donor' } = req.body || {};
    const normEmail = String(email || '').trim().toLowerCase();
    if (!normEmail || !password || !name) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email: normEmail }).lean();
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // create user (pre-save hook will hash password)
    const user = new User({ name: String(name).trim(), email: normEmail, password, phone: String(phone || '').trim(), role });
    await user.save();

    const payload = { _id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });

    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };

    return res.status(201).json({ token, role: user.role, user: safeUser, message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, role, user, message }
 */
router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body || {};
    const normEmail = String(email || '').trim().toLowerCase();
    if (!normEmail || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: normEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { _id: user._id.toString(), name: user.name || '', email: user.email, role: user.role || 'donor' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });

    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };

    return res.json({ token, role: user.role, user: safeUser, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;