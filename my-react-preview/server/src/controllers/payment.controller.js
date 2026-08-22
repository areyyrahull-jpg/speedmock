/**
 * payment.controller.js
 * Backend payment/subscription handlers — Razorpay integrated
 */

const Razorpay = require("razorpay");
const crypto   = require("crypto");
const pool     = require("../../src/config/db");

// ─── RAZORPAY INSTANCE ────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── PLAN MAP — must match frontend PLANS config ──────────────────
const PLAN_MAP = {
  monthly:   { name: "1 Month",  price: 30,  days: 30  },
  quarterly: { name: "3 Months", price: 70,  days: 90  },
  yearly:    { name: "6 Months", price: 100, days: 180 },
};

// ─── HELPERS ──────────────────────────────────────────────────────
const ok   = (res, data, status = 200) =>
  res.status(status).json({ success: true, ...data });
const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

// ═══════════════════════════════════════════════════════════════════
//  GET /api/payment/subscription/:userId
//  Get user's active subscription + free-trial credit state.
//  Combines what used to be two separate direct-Supabase queries
//  (subscriptions + free_credits) into one authenticated backend
//  call, so the frontend never talks to Supabase's REST API for
//  this data (which is blocked by RLS since this app authenticates
//  via its own JWT, not Supabase Auth — auth.uid() is always NULL
//  there, so any RLS policy silently returns zero rows).
// ═══════════════════════════════════════════════════════════════════
const getSubscription = async (req, res) => {
  try {
    const userId = req.userId; // from authenticateToken middleware

    const [subResult, creditsResult] = await Promise.all([
      pool.query(
        `SELECT id, plan_name, status, starts_at, end_date, amount, payment_status
         FROM subscriptions
         WHERE user_id = $1
         ORDER BY starts_at DESC
         LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT credits_remaining, created_at
         FROM free_credits
         WHERE user_id = $1
         LIMIT 1`,
        [userId]
      ),
    ]);

    const subscription = subResult.rows[0] || null;
    const freeCredits  = creditsResult.rows[0] || null;

    return ok(res, { subscription, freeCredits });
  } catch (error) {
    
    return fail(res, "Failed to fetch subscription.", 500);
  }
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/payment/history/:userId
//  Get user's payment history
// ═══════════════════════════════════════════════════════════════════
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId; // from authenticateToken middleware

    const result = await pool.query(
      `SELECT id, plan_name, amount, status, razorpay_order_id, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    return ok(res, { payments: result.rows });
  } catch (error) {
    
    return fail(res, "Failed to fetch payment history.", 500);
  }
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/payment/create-order
//  Creates a Razorpay order and returns orderId + keyId to frontend
//
//  Body: { planId }   ("monthly" | "quarterly" | "yearly")
//  userId comes from the JWT via authenticateToken — never trust body
// ═══════════════════════════════════════════════════════════════════
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.userId; // from JWT — do NOT read from body
    const { planId } = req.body;

    if (!planId) return fail(res, "planId is required.");

    const plan = PLAN_MAP[planId];
    if (!plan) return fail(res, `Invalid planId: "${planId}". Must be monthly, quarterly, or yearly.`);

    // Create order on Razorpay
    const order = await razorpay.orders.create({
      amount:   plan.price * 100, // Razorpay works in paise
      currency: "INR",
      receipt:  `rcpt_${Date.now()}`,
      notes: {
        userId,
        planId,
        planName: plan.name,
      },
    });

    

    return ok(res, {
      orderId: order.id,
      amount:  order.amount,   // in paise
      keyId:   process.env.RAZORPAY_KEY_ID, // public key — safe to send
    });
  } catch (error) {
    
    return fail(res, "Failed to create payment order.", 500);
  }
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/payment/verify
//  1. Verifies Razorpay HMAC signature
//  2. Upserts subscription row (handles upgrades/renewals)
//  3. Inserts payment record
//
//  Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId }
//  userId comes from the JWT via authenticateToken — never trust body
// ═══════════════════════════════════════════════════════════════════
const verifyPayment = async (req, res) => {
  try {
    const userId = req.userId; // from JWT — do NOT read from body

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    // ── 1. Validate required fields ──────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return fail(res, "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature, planId");
    }

    const plan = PLAN_MAP[planId];
    if (!plan) return fail(res, `Invalid planId: "${planId}".`);

    // ── 2. Verify HMAC signature ─────────────────────────────────
    //  Razorpay signs: "<order_id>|<payment_id>" with your key_secret
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      
      return fail(res, "Payment verification failed: invalid signature.", 400);
    }

    // ── 3. Compute subscription dates ────────────────────────────
    const startDate = new Date();
    const endDate   = new Date(startDate.getTime() + plan.days * 86400000);

    // ── 4. Upsert subscription ───────────────────────────────────
    //  ON CONFLICT handles re-subscriptions and plan upgrades cleanly.
    //  Requires a UNIQUE constraint on subscriptions(user_id) — add one
    //  if missing: ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    const subResult = await pool.query(
      `INSERT INTO subscriptions
         (user_id, plan_name, status, starts_at, end_date, amount, payment_status)
       VALUES ($1, $2, 'active', $3, $4, $5, 'paid')
       ON CONFLICT (user_id) DO UPDATE
         SET plan_name      = EXCLUDED.plan_name,
             status         = 'active',
            starts_at     = EXCLUDED.starts_at,
             end_date       = EXCLUDED.end_date,
             amount         = EXCLUDED.amount,
             payment_status = 'paid'
       RETURNING *`,
      [userId, plan.name, startDate, endDate, plan.price]
    );

    // ── 5. Record payment ─────────────────────────────────────────
    await pool.query(
      `INSERT INTO payments
         (user_id, plan_name, amount, status,
          razorpay_order_id, razorpay_payment_id, razorpay_signature, created_at)
       VALUES ($1, $2, $3, 'success', $4, $5, $6, NOW())`,
      [
        userId, plan.name, plan.price,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
      ]
    );

    // ── 6. Trigger referral reward check ─────────────────────────
    // If this buyer was referred by someone, mark their referral as
    // converted and grant 1 free month to the referrer for every 2
    // paid referrals — runs silently, never blocks the payment response.
    try {
      const referredRes = await pool.query(
        "SELECT referred_by FROM users WHERE id = $1 LIMIT 1",
        [userId]
      );
      const referrerId = referredRes.rows[0]?.referred_by;

      if (referrerId) {
        // Mark referral as converted
        await pool.query(
          `UPDATE referrals
           SET status = 'converted', converted_at = NOW()
           WHERE referrer_id = $1 AND referred_id = $2 AND status = 'pending'`,
          [referrerId, userId]
        );

        // Count total converted referrals for referrer
        const countRes = await pool.query(
          `SELECT COUNT(*) AS cnt FROM referrals WHERE referrer_id = $1 AND status = 'converted'`,
          [referrerId]
        );
        const convertedCount = Number(countRes.rows[0].cnt);

        // Count rewards already given
        const rewardsRes = await pool.query(
          "SELECT COUNT(*) AS cnt FROM referral_rewards WHERE user_id = $1",
          [referrerId]
        );
        const rewardsGiven = Number(rewardsRes.rows[0].cnt);
        const rewardsDue   = Math.floor(convertedCount / 2);

        if (rewardsDue > rewardsGiven) {
          // Grant 1 free month
          await pool.query(
            `INSERT INTO referral_rewards (user_id, months_granted, reason, applied, applied_at)
             VALUES ($1, 1, '2 friends subscribed', true, NOW())`,
            [referrerId]
          );

          // Extend referrer's subscription by 1 month
          await pool.query(
            `UPDATE subscriptions
             SET end_date = COALESCE(end_date, NOW()) + INTERVAL '1 month',
                 status   = 'active'
             WHERE user_id = $1
             AND id = (SELECT id FROM subscriptions WHERE user_id = $1 ORDER BY starts_at DESC LIMIT 1)`,
            [referrerId]
          );
        }
      }
    } catch (refErr) {
      // Never fail the payment response due to referral errors
      console.error("Referral reward update failed:", refErr.message || refErr);
    }

    return ok(res, { subscription: subResult.rows[0] }, 201);
  } catch (error) {
    
    return fail(res, "Payment verification failed.", 500);
  }
};

module.exports = {
  getSubscription,
  getPaymentHistory,
  createPaymentOrder,
  verifyPayment,
};
