try {
  const a = require('./backend/middleware/authMiddleware');
  const r = require('./backend/middleware/roleMiddleware');

  console.log('authMiddleware ->', typeof a);
  console.log('authMiddleware inspect ->', typeof a === 'function' ? 'function' : a);
  console.log('roleMiddleware ->', typeof r);
  console.log('roleMiddleware inspect ->', typeof r === 'function' ? 'function' : r);

  if (typeof r === 'function') {
    try {
      const maybe = r('admin');
      console.log('allowRoles("admin") ->', typeof maybe);
    } catch (err) {
      console.error('allowRoles("admin") threw:', err && err.stack ? err.stack : err);
    }
  }
} catch (err) {
  console.error('require error:', err && err.stack ? err.stack : err);
}