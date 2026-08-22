/**
 * routes/auth.routes.js
 * Authentication endpoints
 */

const express  = require("express");
const bcrypt   = require("bcryptjs");
const pool     = require("../config/db");
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/validate.middleware");
const { getSessions, removeSession, removeAllSessions } = require("../services/session.service");

const router = express.Router();

// ── public routes ────────────────────────────────────────────────
router.post("/check-mobile",        authController.checkMobile);
router.post("/send-otp",            (req,res,next)=>{next();}, authController.sendOTP);
router.post("/register",            authController.register);
router.post("/login",               authController.login);
router.post("/send-recovery-otp",   authController.sendRecoveryOTP);
router.post("/verify-recovery-otp", authController.verifyRecoveryOTP);
router.post("/reset-password",      authController.resetPassword);

// ── protected routes (require valid JWT) ─────────────────────────
router.get("/me",     authenticateToken, authController.getMe);
router.post("/logout", authenticateToken, authController.logout);

// PUT /api/auth/profile — update name and email
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success:false, error:"Name cannot be empty" });

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, mobile, email, plan`,
      [name.trim(), email?.toLowerCase() || null, req.userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success:false, error:"User not found" });

    res.json({ success:true, user: result.rows[0] });
  } catch (err) {
    
    res.status(500).json({ success:false, error:err.message });
  }
});

// POST /api/auth/change-password — verify current then update
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword)
      return res.status(400).json({ success:false, error:"Current password required" });
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ success:false, error:"New password must be at least 8 characters" });

    // Fetch current hash from DB
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1 LIMIT 1",
      [req.userId]
    );
    if (!result.rows.length)
      return res.status(404).json({ success:false, error:"User not found" });

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid)
      return res.status(400).json({ success:false, error:"Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [newHash, req.userId]
    );

    res.json({ success:true, message:"Password changed successfully" });
  } catch (err) {
    
    res.status(500).json({ success:false, error:err.message });
  }
});

// GET /api/auth/sessions — list all active devices
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const sessions = await getSessions(req.userId);
    res.json({ success:true, sessions });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
});

// POST /api/auth/logout-device — remove one device
router.post("/logout-device", authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId)
      return res.status(400).json({ success:false, error:"deviceId required" });
    if (deviceId === req.deviceId)
      return res.status(400).json({ success:false, error:"Use /logout to log out current device" });

    await removeSession(req.userId, deviceId);
    res.json({ success:true, message:"Device logged out successfully" });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
});

// POST /api/auth/logout-all — remove all other devices
router.post("/logout-all", authenticateToken, async (req, res) => {
  try {
    await removeAllSessions(req.userId, req.deviceId);
    res.json({ success:true, message:"All other devices logged out" });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
});

module.exports = router;



/**
 * POST /api/auth/check-mobile
 * Check if mobile number is registered
 */
router.post("/check-mobile", authController.checkMobile);

/**
 * POST /api/auth/send-otp
 * Send OTP for registration
 */
router.post("/send-otp",
  (req, res, next) => {
    
    next();
  },
  authController.sendOTP
);
/**
 * POST /api/auth/register
 * Register new user with OTP verification
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Login with mobile and password
 */
router.post("/login", authController.login);

/**
 * POST /api/auth/send-recovery-otp
 * Send OTP for password recovery
 */
router.post("/send-recovery-otp", authController.sendRecoveryOTP);

/**
 * POST /api/auth/verify-recovery-otp
 * Verify recovery OTP
 */
router.post("/verify-recovery-otp", authController.verifyRecoveryOTP);

/**
 * POST /api/auth/reset-password
 * Reset password with recovery token
 */
router.post("/reset-password", authController.resetPassword);

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
router.get("/me", authenticateToken, authController.getMe);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", authenticateToken, authController.logout);




//change password
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword)
      return res.status(400).json({ success:false, error:"Current password required" });
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ success:false, error:"New password must be at least 8 characters" });

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      phone:    req.user.phone,
      password: currentPassword,
    });
    if (signInErr)
      return res.status(400).json({ success:false, error:"Current password is incorrect" });

    const { error: updateErr } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );
    if (updateErr) throw updateErr;

    res.json({ success:true, message:"Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
});


//get session
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const sessions = await getSessions(req.user.id);
    res.json({ success:true, sessions });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
});


//logout device
router.post("/logout-device", authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId)
      return res.status(400).json({ success:false, error:"deviceId required" });

    if (deviceId === req.deviceId)
      return res.status(400).json({ success:false, error:"Use /logout to log out current device" });

    await removeSession(req.user.id, deviceId);
    res.json({ success:true, message:"Device logged out successfully" });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
});

// logout all other devices (keep current)
router.post("/logout-all", authenticateToken, async (req, res) => {
  try {
    await removeAllSessions(req.user.id, req.deviceId);
    res.json({ success: true, message: "All other devices logged out" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;