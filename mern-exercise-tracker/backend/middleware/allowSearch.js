const jwt = require('jsonwebtoken');

/**
 * allowSearch middleware
 * - Accepts either:
 *   1) a normal auth JWT (decoded should include role: 'patient'|'admin')
 *   2) a short-lived verify token with purpose === 'verify_search' and payload.email or payload.patientId
 *
 * Usage in routes:
 *   const allowSearch = require('../middleware/allowSearch');
 *   router.get('/search', allowSearch, handler);
 */
module.exports = async function allowSearch(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(403).json({ message: 'Not authorized to search donors' });
    }

    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // token invalid or expired
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // If token is a normal auth token with role info, allow patients and admins
    if (decoded && decoded.role) {
      const role = String(decoded.role).toLowerCase();
      if (role === 'patient' || role === 'admin') {
        // attach req.user if not already set by earlier auth middleware
        if (!req.user) req.user = decoded;
        return next();
      }
      return res.status(403).json({ message: 'Insufficient role to search donors' });
    }

    // Otherwise check for verify token purpose
    if (decoded && decoded.purpose === 'verify_search') {
      // attach verified patient info for downstream use (if present)
      req.verifiedPatient = {
        patientId: decoded.patientId || decoded.id || null,
        email: decoded.email || null,
        name: decoded.name || null,
      };
      return next();
    }

    // Any other token shape: reject
    return res.status(403).json({ message: 'Not authorized to search donors' });
  } catch (err) {
    console.error('allowSearch error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};