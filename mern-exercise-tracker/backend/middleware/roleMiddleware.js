// backend/middleware/roleMiddleware.js

// Middleware to check user role
const allowRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user data found' });
    }

    // Check if user has the required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: You are not authorized for this action. Required role(s): ${roles.join(', ')}` });
    }

    // User has the correct role, proceed
    next();
  };
};

module.exports = allowRoles;
