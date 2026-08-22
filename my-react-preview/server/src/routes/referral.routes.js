/**
 * routes/referral.routes.js
 *
 * Mount in server.js:
 *   const referralRoutes = require("./src/routes/referral.routes");
 *   app.use("/api/referral", referralRoutes);
 *
 * Endpoints:
 *   GET  /api/referral/me          → my code, stats, referral list, pending rewards
 *   POST /api/referral/apply/:code → called after registration to link referrer
 *   POST /api/referral/check-rewards → called after payment to auto-grant rewards
 */

const express = require("express");
const pool    = require("../config/db");
const { authenticateToken } = require("../middleware/validate.middleware");

const router = express.Router();

// ── GET /api/referral/me ─────────────────────────────────────────
// Returns everything the ReferralCard needs:
//   code, totalReferred, converted, pendingRewards, rewardHistory, referralList
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const uid = req.userId;

    // 1. Get user's referral code (generate if missing)
    const userRes = await pool.query(
      "SELECT referral_code FROM users WHERE id = $1 LIMIT 1",
      [uid]
    );
    let code = userRes.rows[0]?.referral_code;

    if (!code) {
      // Generate a unique 8-char code from userId
      code = uid.replace(/-/g, "").substring(0, 8).toUpperCase();
      await pool.query(
        "UPDATE users SET referral_code = $1 WHERE id = $2",
        [code, uid]
      );
    }

    // 2. Referral stats
    const statsRes = await pool.query(
      `SELECT
         COUNT(*)                                          AS total,
         COUNT(*) FILTER (WHERE status = 'converted')     AS converted,
         COUNT(*) FILTER (WHERE status = 'pending')       AS pending
       FROM referrals
       WHERE referrer_id = $1`,
      [uid]
    );
    const stats = statsRes.rows[0];

    // 3. Referred users list (name, mobile, status, date)
    const listRes = await pool.query(
      `SELECT u.name, u.mobile, r.status, r.created_at, r.converted_at
       FROM referrals r
       JOIN users u ON u.id = r.referred_id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [uid]
    );

    // 4. Pending unapplied rewards
    const rewardsRes = await pool.query(
      `SELECT id, months_granted, reason, created_at
       FROM referral_rewards
       WHERE user_id = $1 AND applied = false
       ORDER BY created_at DESC`,
      [uid]
    );

    // 5. Applied rewards history
    const historyRes = await pool.query(
      `SELECT months_granted, reason, applied_at
       FROM referral_rewards
       WHERE user_id = $1 AND applied = true
       ORDER BY applied_at DESC`,
      [uid]
    );

    res.json({
      success: true,
      code,
      stats: {
        total:     Number(stats.total),
        converted: Number(stats.converted),
        pending:   Number(stats.pending),
      },
      referrals:      listRes.rows,
      pendingRewards: rewardsRes.rows,
      rewardHistory:  historyRes.rows,
    });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/referral/apply/:code ───────────────────────────────
// Called right after registration with a referral code.
// Links the new user (req.userId) to the referrer.
// Does NOT require auth — called right after registration before login.
router.post("/apply/:code", authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const newUserId = req.userId;

    if (!code) return res.status(400).json({ success: false, error: "No code provided" });

    // Find referrer by code
    const referrerRes = await pool.query(
      "SELECT id FROM users WHERE UPPER(referral_code) = UPPER($1) LIMIT 1",
      [code.trim()]
    );
    if (!referrerRes.rows.length)
      return res.status(404).json({ success: false, error: "Invalid referral code" });

    const referrerId = referrerRes.rows[0].id;

    // Can't refer yourself
    if (referrerId === newUserId)
      return res.status(400).json({ success: false, error: "You can't refer yourself" });

    // Link in users table
    await pool.query(
      "UPDATE users SET referred_by = $1 WHERE id = $2",
      [referrerId, newUserId]
    );

    // Create referral row
    await pool.query(
      `INSERT INTO referrals (referrer_id, referred_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (referrer_id, referred_id) DO NOTHING`,
      [referrerId, newUserId]
    );

    res.json({ success: true, message: "Referral applied" });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/referral/check-rewards ────────────────────────────
// Call this after a successful payment/subscription for req.userId.
// Marks referral as converted, then checks if referrer qualifies
// for a free month (every 2 converted referrals = 1 free month).
router.post("/check-rewards", authenticateToken, async (req, res) => {
  try {
    const buyerId = req.userId;

    // 1. Find if this buyer was referred by someone
    const referredRes = await pool.query(
      "SELECT referred_by FROM users WHERE id = $1 LIMIT 1",
      [buyerId]
    );
    const referrerId = referredRes.rows[0]?.referred_by;
    if (!referrerId) return res.json({ success: true, rewarded: false });

    // 2. Mark the referral as converted
    await pool.query(
      `UPDATE referrals
       SET status = 'converted', converted_at = NOW()
       WHERE referrer_id = $1 AND referred_id = $2 AND status = 'pending'`,
      [referrerId, buyerId]
    );

    // 3. Count total converted (not yet rewarded) referrals for referrer
    const countRes = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM referrals
       WHERE referrer_id = $1 AND status = 'converted'`,
      [referrerId]
    );
    const convertedCount = Number(countRes.rows[0].cnt);

    // 4. Grant 1 free month for every 2 converted referrals
    //    Track how many rewards already granted to avoid double-rewarding
    const rewardsRes = await pool.query(
      "SELECT COUNT(*) AS cnt FROM referral_rewards WHERE user_id = $1",
      [referrerId]
    );
    const rewardsAlreadyGiven = Number(rewardsRes.rows[0].cnt);
    const rewardsDue = Math.floor(convertedCount / 2);

    let rewarded = false;
    if (rewardsDue > rewardsAlreadyGiven) {
      // Grant the new reward
      await pool.query(
        `INSERT INTO referral_rewards (user_id, months_granted, reason)
         VALUES ($1, 1, '2 friends subscribed')`,
        [referrerId]
      );

      // Apply it to their subscription immediately
      await pool.query(
        `UPDATE subscriptions
         SET end_date = COALESCE(end_date, NOW()) + INTERVAL '1 month',
             status = 'active'
         WHERE user_id = $1
         AND id = (SELECT id FROM subscriptions WHERE user_id = $1 ORDER BY starts_at DESC LIMIT 1)`,
        [referrerId]
      );

      // Mark reward as applied
      await pool.query(
        `UPDATE referral_rewards
         SET applied = true, applied_at = NOW()
         WHERE user_id = $1 AND applied = false`,
        [referrerId]
      );

      rewarded = true;
    }

    res.json({ success: true, rewarded, convertedCount, rewardsDue });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
