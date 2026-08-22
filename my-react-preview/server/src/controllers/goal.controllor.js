// goalController.js
// Handles daily goal tracking for GoalContext.jsx
// Tables: daily_goal_logs, users (daily_goal_target column)

const pool = require("../config/db");

// ── GET /api/goal/today ──────────────────────────────────────────
// Returns today's goal target and questions_done for the logged-in user.
// GoalContext calls this on mount — this was returning 404 because
// the route didn't exist yet, causing the infinite loading in navbar.
async function getToday(req, res) {
  try {
    const userId = req.userId;
    const today  = new Date().toISOString().split("T")[0];

    // Get or create today's log row
    const { rows: existing } = await pool.query(
      `SELECT questions_done, target FROM daily_goal_logs
       WHERE user_id = $1 AND log_date = $2`,
      [userId, today]
    );

    if (existing.length) {
      return res.json({ success: true, done: existing[0].questions_done, target: existing[0].target });
    }

    // No row yet for today — read target from users table
    const { rows: userRows } = await pool.query(
      `SELECT daily_goal_target FROM users WHERE id = $1`,
      [userId]
    );
    const target = userRows[0]?.daily_goal_target ?? 50;

    // Insert today's row with 0 progress
    await pool.query(
      `INSERT INTO daily_goal_logs (user_id, log_date, questions_done, target)
       VALUES ($1, $2, 0, $3)
       ON CONFLICT (user_id, log_date) DO NOTHING`,
      [userId, today, target]
    );

    res.json({ success: true, done: 0, target });
  } catch (err) {
    
    res.status(500).json({ success: false, error: "Failed to load goal" });
  }
}

// ── POST /api/goal/target ────────────────────────────────────────
// Updates the user's daily target (called from navbar goal buttons)
async function updateTarget(req, res) {
  try {
    const userId = req.userId;
    const { target } = req.body;
    if (!target || target < 1) {
      return res.status(400).json({ success: false, error: "Invalid target" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Update the user's default target
    await pool.query(
      `UPDATE users SET daily_goal_target = $1 WHERE id = $2`,
      [target, userId]
    );

    // Also update today's log if it exists
    await pool.query(
      `UPDATE daily_goal_logs SET target = $1
       WHERE user_id = $2 AND log_date = $3`,
      [target, userId, today]
    );

    // Get today's current done count to return in sync
    const { rows } = await pool.query(
      `SELECT questions_done FROM daily_goal_logs
       WHERE user_id = $1 AND log_date = $2`,
      [userId, today]
    );

    res.json({ success: true, target, done: rows[0]?.questions_done ?? 0 });
  } catch (err) {
    
    res.status(500).json({ success: false, error: "Failed to update target" });
  }
}

// ── POST /api/goal/increment ─────────────────────────────────────
// Increments today's questions_done by `count` (default 1).
// Called from PracticeSession after each answered question.
async function increment(req, res) {
  try {
    const userId = req.userId;
    const count  = Math.max(1, parseInt(req.body.count) || 1);
    const today  = new Date().toISOString().split("T")[0];

    // Get user's target for upsert
    const { rows: userRows } = await pool.query(
      `SELECT daily_goal_target FROM users WHERE id = $1`,
      [userId]
    );
    const target = userRows[0]?.daily_goal_target ?? 50;

    // Upsert: create row if not exists, increment if exists
    const { rows } = await pool.query(
      `INSERT INTO daily_goal_logs (user_id, log_date, questions_done, target)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, log_date)
       DO UPDATE SET questions_done = daily_goal_logs.questions_done + $3
       RETURNING questions_done, target`,
      [userId, today, count, target]
    );

    res.json({
      success: true,
      done:   rows[0].questions_done,
      target: rows[0].target,
    });
  } catch (err) {
    
    res.status(500).json({ success: false, error: "Failed to increment goal" });
  }
}

module.exports = { getToday, updateTarget, increment };
