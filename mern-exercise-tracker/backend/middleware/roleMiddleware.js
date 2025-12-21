// backend/middleware/roleMiddleware.js
// Usage: router.get('/users', authVerify, allowRoles('admin'), handler)

module.exports = function allowRoles(...roles) {
  // normalize arguments: allowRoles(['admin']) or allowRoles('admin','doctor')
  const allowed = roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles;
  const allowedNorm = allowed.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const role = String(req.user.role).toLowerCase();
    if (!allowedNorm.includes(role)) {
      return res.status(403).json({ message: 'Insufficient role' });
    }

    next();
  };
};