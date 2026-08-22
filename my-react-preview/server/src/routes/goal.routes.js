/**
 * routes/goal.routes.js
 * Handles daily goal read + update.
 * Used by GoalContext.jsx on the frontend.
 *
 * Mount in server.js:
 *   const goalRoutes = require("./src/routes/goal.routes");
 *   app.use("/api/goal", goalRoutes);
 */

const express = require("express");
const pool    = require("../config/db");
const { authenticateToken } = require("../middleware/validate.middleware");

const router = express.Router();

// daily_goal_logs.user_id has a FOREIGN KEY to profiles(id), not users(id).
// Users can exist in `users` without ever getting a matching `profiles`
// row (confirmed: every test user we checked had 0 rows in profiles),
// which made every insert into daily_goal_logs fail with a foreign-key
// violation — surfaced to the browser as a generic 500. This ensures the
// FK target exists first, so goal tracking works regardless of whether
// a user has "properly" onboarded into profiles yet.
async function ensureProfile(userId) {
  await pool.query(
    `INSERT INTO profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
    [userId]
  );
}

// ── GET /api/goal/today ────────────────────────────────────────────
// Returns today's questions_done and target for the logged-in user.
// GoalContext calls this on mount.
router.get("/today", authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Try to get today's log — table may not exist yet if migration not run
    let done = 0, target = 50;
    try {
      await ensureProfile(req.userId);

      // Read user's default target first (needed for upsert below)
      try {
        const userResult = await pool.query(
          `SELECT daily_goal_target FROM users WHERE id = $1 LIMIT 1`,
          [req.userId]
        );
        target = userResult.rows[0]?.daily_goal_target ?? 50;
      } catch { /* column doesn't exist yet — use default 50 */ }

      // Upsert today's row (creates it if missing, leaves done intact if exists)
      const logResult = await pool.query(
        `INSERT INTO daily_goal_logs (user_id, log_date, questions_done, target)
         VALUES ($1, $2, 0, $3)
         ON CONFLICT (user_id, log_date) DO UPDATE
           SET target = EXCLUDED.target
         RETURNING questions_done, target`,
        [req.userId, today, target]
      );
      done   = logResult.rows[0].questions_done;
      target = logResult.rows[0].target;
      return res.json({ success: true, done, target });
    } catch { /* table doesn't exist yet — fall through */ }

    res.json({ success: true, done: 0, target });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/goal/target ──────────────────────────────────────────
// Updates the user's daily goal target.
// GoalContext calls this when user picks a new target.
router.post("/target", authenticateToken, async (req, res) => {
  try {
    const { target } = req.body;
    const n = parseInt(target);

    if (!n || n < 1 || n > 9999)
      return res.status(400).json({ success: false, error: "target must be a number between 1 and 9999" });

    // 1. Save to users table as the default going forward
    await pool.query(
      `UPDATE users SET daily_goal_target = $1 WHERE id = $2`,
      [n, req.userId]
    );

    await ensureProfile(req.userId);

    // 2. Upsert today's log row so it also reflects the new target
    const today = new Date().toISOString().split("T")[0];
    await pool.query(
      `INSERT INTO daily_goal_logs (user_id, log_date, questions_done, target)
       VALUES ($1, $2, 0, $3)
       ON CONFLICT (user_id, log_date)
       DO UPDATE SET target = $3`,
      [req.userId, today, n]
    );

    res.json({ success: true, target: n });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/goal/increment ───────────────────────────────────────
// Call this whenever a user answers a question in practice mode.
// Increments questions_done for today by `count` (default 1).
router.post("/increment", authenticateToken, async (req, res) => {
  try {
    const count  = parseInt(req.body.count ?? 1);
    const today  = new Date().toISOString().split("T")[0];

    await ensureProfile(req.userId);

    // Get current default target
    const userResult = await pool.query(
      `SELECT daily_goal_target FROM users WHERE id = $1 LIMIT 1`,
      [req.userId]
    );
    const defaultTarget = userResult.rows[0]?.daily_goal_target ?? 50;

    // Upsert: create today's row if missing, else increment
    const result = await pool.query(
      `INSERT INTO daily_goal_logs (user_id, log_date, questions_done, target)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, log_date)
       DO UPDATE SET questions_done = daily_goal_logs.questions_done + $3
       RETURNING questions_done, target`,
      [req.userId, today, count, defaultTarget]
    );

    res.json({
      success: true,
      done:   result.rows[0].questions_done,
      target: result.rows[0].target,
    });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
