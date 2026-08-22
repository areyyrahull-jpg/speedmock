// src/middleware/requireAuth.js
//
// Wraps your existing authenticateToken middleware.
// Your app uses httpOnly session cookies (not localStorage tokens) for auth —
// this ensures req.userId is always a plain string from whatever field
// authenticateToken sets (req.userId, req.user.id, or req.user.userId).

const { authenticateToken } = require("./validate.middleware");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  authenticateToken(req, res, (err) => {
    
    if (err) return next(err);
    const id = req.userId || req.user?.id;
    if (!id) return res.status(401).json({ error: "Not authenticated" });
    req.userId = String(id);
    next();
  });
}

module.exports = { requireAuth };
