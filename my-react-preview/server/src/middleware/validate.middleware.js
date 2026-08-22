/**
 * middleware/validate.middleware.js
 * Authentication and validation middleware
 */

const jwt = require("jsonwebtoken");
const { validateSession } = require("../services/session.service");

/**
 * Verify JWT token and extract userId. Also checks the request's device id
 * (sent as X-Device-Id header) against the user's active Redis sessions —
 * if it's been evicted (another device took its slot), reject distinctly
 * so the frontend can show "logged out because another device signed in"
 * instead of a generic auth error.
 *
 * Requests that don't send X-Device-Id are NOT blocked (fail-open) so this
 * doesn't break any existing call site that hasn't been updated yet.
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      req.userId   = decoded.userId;
      req.deviceId = req.headers["x-device-id"] || null;

      if (req.deviceId) {
        try {
          const valid = await validateSession(req.userId, req.deviceId);
          if (!valid) {
            return res.status(401).json({
              success: false,
              code: "DEVICE_LOGGED_OUT",
              message: "You've been logged out because you signed in on another device.",
            });
          }
        } catch (sessionErr) {
          // Redis hiccup shouldn't lock the user out — log and continue.
          
        }
      }

      next();
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

/**
 * Validate request body fields
 */
const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  validateFields,
};
