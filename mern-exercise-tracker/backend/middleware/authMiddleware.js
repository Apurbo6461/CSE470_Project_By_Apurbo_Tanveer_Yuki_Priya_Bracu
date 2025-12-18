const jwt = require("jsonwebtoken");

const authVerify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token missing, please login" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* OPTIONAL: admin helper (does NOT affect old code) */
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

/**
 * ✅ EXPORT BOTH WAYS — BACKWARD COMPATIBLE
 */
module.exports = authVerify;
module.exports.authVerify = authVerify;
module.exports.verifyAdmin = verifyAdmin;
