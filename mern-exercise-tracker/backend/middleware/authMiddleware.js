// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authVerify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token missing, please login' });
  }

  // Extract token: "Bearer <token>"
  const token = authHeader.split(' ')[1]; // Token is the second part after "Bearer"

  if (!token) {
    return res.status(401).json({ error: 'Token not provided in authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Export middleware
module.exports = authVerify;
