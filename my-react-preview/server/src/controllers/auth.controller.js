/**
 * auth.controller.js
 * Authentication for SpeedMock
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite");
const pool = require("../../src/config/db");
const redis = require("../../src/config/redis");
const { sendSMS } = require("../services/otp.services");
const sessionService = require("../services/session.service");

const getClientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
  req.socket?.remoteAddress ||
  null;

const getLocation = (req) => {
  const ip = getClientIp(req);
  if (!ip || ip === "::1" || ip.startsWith("127.")) return "Local";
  const geo = geoip.lookup(ip);
  if (!geo) return null;
  return [geo.city, geo.region, geo.country].filter(Boolean).join(", ");
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpKey = (mobile, purpose) => `otp:${purpose}:${mobile}`;
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });

const ok = (res, data, status = 200) => res.status(status).json({ success: true, ...data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

const PLAN_DEVICE_LIMITS = {
  monthly: 1,
  "1 month": 1,
  quarterly: 2,
  "3 months": 2,
  yearly: 3,
  "6 months": 3,
};

const getDeviceLimit = (row) => {
  if (row.sub_status !== "active" || !row.sub_plan) return 1;
  return PLAN_DEVICE_LIMITS[String(row.sub_plan).toLowerCase().trim()] || 1;
};

const withDeviceLimit = (row) => {
  const { sub_status, sub_plan, sub_expiry, ...user } = row;
  return { ...user, devicesAllowed: getDeviceLimit(row) };
};

const applyReferralCode = async (newUserId, referralCode) => {
  const normalizedCode = (referralCode || "").trim();
  if (!normalizedCode) return null;

  try {
    const referrerRes = await pool.query(
      "SELECT id FROM users WHERE UPPER(referral_code) = UPPER($1) LIMIT 1",
      [normalizedCode]
    );

    if (!referrerRes.rows.length) {
      return { success: false, reason: "invalid_code" };
    }

    const referrerId = referrerRes.rows[0].id;
    if (referrerId === newUserId) {
      return { success: false, reason: "self_referral" };
    }

    await pool.query("UPDATE users SET referred_by = $1 WHERE id = $2", [referrerId, newUserId]);
    await pool.query(
      `INSERT INTO referrals (referrer_id, referred_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (referrer_id, referred_id) DO NOTHING`,
      [referrerId, newUserId]
    );

    return { success: true, referrerId };
  } catch (err) {
    return { success: false, reason: "db_error" };
  }
};

const checkMobile = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return fail(res, "Enter a valid 10-digit mobile number.");
    }

    const result = await pool.query("SELECT id, name FROM users WHERE mobile = $1 LIMIT 1", [mobile]);
    const exists = result.rows.length > 0;

    return ok(res, {
      exists,
      name: exists ? result.rows[0].name.split(" ")[0] : null,
    });
  } catch (err) {
    return fail(res, "Server error. Please try again.", 500);
  }
};

const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return fail(res, "Enter a valid 10-digit mobile number.");
    }

    const existing = await pool.query("SELECT id FROM users WHERE mobile = $1 LIMIT 1", [mobile]);
    if (existing.rows.length > 0) {
      return fail(res, "This mobile number is already registered. Please login instead.", 409);
    }

    const rlKey = `otp_rate:${mobile}`;
    const attempts = await redis.incr(rlKey);
    if (attempts === 1) await redis.expire(rlKey, 600);
    if (attempts > 3) {
      return fail(res, "Too many OTP requests. Wait 10 minutes.", 429);
    }

    const otp = generateOTP();
    await redis.set(otpKey(mobile, "register"), otp, "EX", 120);
    console.log(`[SpeedMock] Registration OTP generated for ${mobile}: ${otp}`);
    await sendSMS(mobile, `${otp} is your SpeedMock verification OTP. Valid for 2 minutes. Do not share.`);

    return ok(res, { sent: true, expiresIn: 120 });
  } catch (err) {
    return fail(res, "Failed to send OTP. Please try again.", 500);
  }
};

const register = async (req, res) => {
  try {
    const { name, mobile, password, email, otp, referralCode } = req.body;

    if (!name || name.trim().length < 2) return fail(res, "Please enter your full name.");
    if (!mobile || !/^\d{10}$/.test(mobile)) return fail(res, "Enter a valid 10-digit mobile number.");
    if (!password || password.length < 6) return fail(res, "Password must be at least 6 characters.");
    if (!otp || !/^\d{6}$/.test(otp)) return fail(res, "Enter the 6-digit OTP sent to your mobile.");

    const storedOTP = await redis.get(otpKey(mobile, "register"));
    if (!storedOTP) return fail(res, "OTP has expired.");
    if (storedOTP !== otp) return fail(res, "Incorrect OTP.");

    const existing = await pool.query("SELECT id FROM users WHERE mobile = $1 LIMIT 1", [mobile]);
    if (existing.rows.length > 0) {
      return fail(res, "This mobile number is already registered. Please login instead.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const insertResult = await pool.query(
      `INSERT INTO users (name, mobile, email, password_hash, plan, created_at)
       VALUES ($1, $2, $3, $4, 'free', NOW())
       RETURNING id, name, mobile, email, plan, created_at`,
      [name.trim(), mobile, email?.toLowerCase() || null, passwordHash]
    );

    const user = insertResult.rows[0];
    await pool.query("INSERT INTO free_credits (user_id, credits_remaining) VALUES ($1, 2)", [user.id]);


await pool.query(
  `INSERT INTO subscriptions (user_id, plan_name, status, starts_at)
   VALUES ($1, NULL, 'trial', NOW())`,
  [user.id]
);
    let referralResult = null;
    if (referralCode) {
      referralResult = await applyReferralCode(user.id, referralCode);
    }

    await redis.del(otpKey(mobile, "register"));
    const token = signToken(user.id);

    const { deviceId, deviceName, deviceType } = req.body;
    const deviceLimit = 1;
    await sessionService.enforceDeviceLimit(user.id, deviceId, deviceLimit);
    const activeDeviceId = await sessionService.createSession(user.id, {
      deviceId,
      deviceName,
      deviceType,
      location: getLocation(req),
    });

    return ok(
      res,
      { token, user: withDeviceLimit({ ...user, sub_status: null, sub_plan: null, sub_expiry: null }), referralApplied: referralResult?.success || false, deviceId: activeDeviceId },
      201
    );
  } 
  catch (err) {
    console.error("Registration error:", err);
    return fail(res, "Registration failed. Please try again.", 500);
  }
};

const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return fail(res, "Enter a valid 10-digit mobile number.");
    }

    if (!password) {
      return fail(res, "Please enter your password.");
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.mobile, u.email, u.password_hash,
              u.plan, u.is_admin,
              s.status AS sub_status,
              s.end_date AS sub_expiry,
              s.plan_name AS sub_plan,
              fc.credits_remaining AS free_credits
       FROM users u
       LEFT JOIN subscriptions s
              ON s.user_id = u.id AND s.status = 'active'
       LEFT JOIN free_credits fc
              ON fc.user_id = u.id
       WHERE u.mobile = $1
       LIMIT 1`,
      [mobile]
    );

    if (!result.rows.length) {
      return fail(res, "This mobile number is not registered. Please create an account.", 404);
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return fail(res, "Incorrect password. Please try again.");
    }

    delete user.password_hash;
    const token = signToken(user.id);

    const { deviceId, deviceName, deviceType } = req.body;
    const deviceLimit = getDeviceLimit(user);
    const evicted = await sessionService.enforceDeviceLimit(user.id, deviceId, deviceLimit);
    if (evicted.length) {
      // device limit enforcement handled in session service
    }

    const activeDeviceId = await sessionService.createSession(user.id, {
      deviceId,
      deviceName,
      deviceType,
      location: getLocation(req),
    });

    return ok(res, { token, user: withDeviceLimit(user), deviceId: activeDeviceId });
  } catch (err) {
    return fail(res, "Login failed. Please try again.", 500);
  }
};

const sendRecoveryOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return fail(res, "Enter a valid 10-digit mobile number.");
    }

    const otp = generateOTP();
    await redis.set(otpKey(mobile, "recovery"), otp, "EX", 120);
    await sendSMS(mobile, `${otp} is your SpeedMock password reset OTP. Valid for 2 minutes. Do not share.`);

    return ok(res, { sent: true, expiresIn: 120 });
  } catch (err) {
    return fail(res, "Failed to send recovery OTP. Please try again.", 500);
  }
};

const verifyRecoveryOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return fail(res, "Enter a valid 10-digit mobile number.");
    }

    const storedOTP = await redis.get(otpKey(mobile, "recovery"));
    if (!storedOTP || storedOTP !== otp) {
      return fail(res, "Invalid or expired recovery OTP.", 400);
    }

    const token = jwt.sign({ mobile, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: 300 });
    return ok(res, { resetToken: token });
  } catch (err) {
    return fail(res, "Failed to verify recovery OTP. Please try again.", 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, password } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return fail(res, "Enter a valid 10-digit mobile number.");
    }

    if (!password || password.length < 6) {
      return fail(res, "Password must be at least 6 characters.");
    }

    const storedOTP = await redis.get(otpKey(mobile, "recovery"));
    if (!storedOTP || storedOTP !== otp) {
      return fail(res, "Invalid or expired recovery OTP.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE mobile = $2", [passwordHash, mobile]);
    await redis.del(otpKey(mobile, "recovery"));

    return ok(res, { message: "Password reset successfully." });
  } catch (err) {
    return fail(res, "Failed to reset password. Please try again.", 500);
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.mobile, u.email, u.plan, u.is_admin,
              s.status AS sub_status,
              s.end_date AS sub_expiry,
              s.plan_name AS sub_plan,
              fc.credits_remaining AS free_credits
       FROM users u
       LEFT JOIN subscriptions s
              ON s.user_id = u.id AND s.status = 'active'
       LEFT JOIN free_credits fc
              ON fc.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [req.userId]
    );

    if (!result.rows.length) {
      return fail(res, "User not found.", 404);
    }

    return ok(res, { user: withDeviceLimit(result.rows[0]) });
  } catch (err) {
    return fail(res, "Failed to fetch profile.", 500);
  }
};

const logout = async (req, res) => {
  try {
    await sessionService.removeSession(req.userId, req.deviceId);
    return ok(res, { message: "Logged out successfully." });
  } catch (err) {
    return fail(res, "Logout failed.", 500);
  }
};

module.exports = {
  checkMobile,
  sendOTP,
  register,
  login,
  sendRecoveryOTP,
  verifyRecoveryOTP,
  resetPassword,
  getMe,
  logout,
};
