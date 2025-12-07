// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authVerify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token missing" });
  }

  // Extract token: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Export middleware
module.exports = authVerify;