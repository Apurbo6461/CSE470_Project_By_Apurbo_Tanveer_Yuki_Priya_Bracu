// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function authVerify(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const payload = jwt.verify(token, SECRET);

    req.user = {
      _id: payload._id || payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error('authVerify error:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authVerify;