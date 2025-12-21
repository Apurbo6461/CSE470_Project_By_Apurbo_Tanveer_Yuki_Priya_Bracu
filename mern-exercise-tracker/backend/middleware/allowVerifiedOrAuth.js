const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * allowVerifiedOrAuth
 * Accepts either:
 *  - a full auth JWT (payload.role === 'patient' || 'admin') OR
 *  - a short-lived verify token (payload.purpose === 'verify_search')
 *
 * If a short-lived verify token is provided, attaches req.verifiedPatient.
 * If a full auth token is provided, attaches req.user (compatible with existing authVerify usage).
 */
module.exports = function allowVerifiedOrAuth(req, res, next) {
  const authHeader = String(req.headers.authorization || '');

  if (!authHeader) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);

    // Short-lived verify token for search
    if (payload.purpose && payload.purpose === 'verify_search') {
      req.verifiedPatient = {
        id: payload.patientId,
        email: payload.email,
        name: payload.name
      };
      return next();
    }

    // Regular authenticated token: expect role to be set on payload
    if (payload.role && (payload.role === 'patient' || payload.role === 'admin')) {
      req.user = payload;
      return next();
    }

    return res.status(403).json({ message: 'Not authorized' });
  } catch (err) {
    console.warn('Token verify error:', err && err.message ? err.message : err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};