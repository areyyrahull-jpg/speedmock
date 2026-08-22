/**
 * routes/progress.routes.js
 * Serves user XP for the navbar rank badge.
 * XP = correct answers × 2 + test attempts × 5
 *
 * Mount in server.js:
 *   const progressRoutes = require("./src/routes/progress.routes");
 *   app.use("/api/progress", progressRoutes);
 */

const express = require("express");
const pool    = require("../config/db");
const { authenticateToken } = require("../middleware/validate.middleware");

const router = express.Router();

// GET /api/progress/xp — returns user's total XP
router.get("/xp", authenticateToken, async (req, res) => {
  try {
    // Total attempts
    const attemptsRes = await pool.query(
      "SELECT COUNT(*) AS cnt FROM test_attempts WHERE user_id = $1",
      [req.userId]
    );
    // Total correct (accuracy × 100 per attempt)
    const correctRes = await pool.query(
      "SELECT COALESCE(SUM(accuracy * 100 / 100), 0) AS correct FROM test_attempts WHERE user_id = $1",
      [req.userId]
    );

    const attempts = Number(attemptsRes.rows[0].cnt);
    const correct  = Math.round(Number(correctRes.rows[0].correct));
    const xp       = correct * 2 + attempts * 5;

    res.json({ success: true, xp, correct, attempts });
  } catch (err) {
    
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
