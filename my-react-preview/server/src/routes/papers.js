// server/routes/papers.js
// Mount with: app.use('/api/papers', require('./routes/papers'));
//
// GET /api/papers/:examCode          → all tiers + test counts (for tab setup)
// GET /api/papers/:examCode/:tier    → full + pyq tests for that exam/tier

const express = require("express");
const { supabaseAdmin } = require("../config/supabaseAdmin");
const { requireAuth } = require("../middleware/requireAuth");
const router = express.Router();

// Which exams have multiple stages and what to call them in the UI
const TIER_CONFIG = {
  SSC_CGL:  { stages: ["TIER_1", "TIER_2"],  labels: { TIER_1: "Tier 1", TIER_2: "Tier 2" } },
  SSC_CPO:  { stages: ["TIER_1", "TIER_2"],  labels: { TIER_1: "Tier 1", TIER_2: "Tier 2" } },
  SSC_CHSL: { stages: ["TIER_1", "TIER_2"],  labels: { TIER_1: "Tier 1", TIER_2: "Tier 2" } },
  RRB_NTPC: { stages: ["CBT_1",  "CBT_2"],   labels: { CBT_1:  "CBT 1",  CBT_2:  "CBT 2"  } },
  RRB_ALP:  { stages: ["CBT_1",  "CBT_2"],   labels: { CBT_1:  "CBT 1",  CBT_2:  "CBT 2"  } },
};

/* ── helpers ── */
function formatTest(row, kind) {
  return {
    id:            row.id,
    kind,                                    // "full" | "pyq"
    title:         row.test_name,
    tier:          row.tier,
    totalQ:        row.total_questions,
    durationMins:  row.duration_minutes,
    isActive:      row.is_active,
    // PYQ extras
    year:          row.test_year  ?? null,
    date:          row.test_date  ?? null,
  };
}

/* ─────────────────────────────────────────────────────────────────
   GET /api/papers/:examCode
   Returns exam metadata + available tiers with test counts.
   Used by the page to build the tab row without fetching all tests.
───────────────────────────────────────────────────────────────── */
router.get("/:examCode", requireAuth, async (req, res) => {
  const { examCode } = req.params;

  const { data: exam, error } = await supabaseAdmin
    .from("exams")
    .select("id, exam_code, exam_name, duration_minutes")
    .eq("exam_code", examCode)
    .single();

  if (error || !exam) return res.status(404).json({ error: "Exam not found" });

  const config = TIER_CONFIG[examCode];
  const stages = config ? config.stages : ["TIER_1"];
  const labels = config ? config.labels : { TIER_1: "Stage 1" };

  // Count tests per tier in parallel
  const [fullCounts, pyqCounts] = await Promise.all([
    supabaseAdmin
      .from("full_tests")
      .select("tier")
      .eq("exam_id", exam.id)
      .eq("is_active", true),
    supabaseAdmin
      .from("pyq_tests")
      .select("tier")
      .eq("exam_id", exam.id)
      .eq("is_active", true),
  ]);

  const countByTier = {};
  stages.forEach(s => { countByTier[s] = { full: 0, pyq: 0, total: 0 }; });
  (fullCounts.data || []).forEach(r => {
    if (countByTier[r.tier]) { countByTier[r.tier].full++; countByTier[r.tier].total++; }
  });
  (pyqCounts.data || []).forEach(r => {
    if (countByTier[r.tier]) { countByTier[r.tier].pyq++; countByTier[r.tier].total++; }
  });

  const tiers = stages.map(s => ({
    key:   s,
    label: labels[s] || s,
    ...countByTier[s],
  }));

  res.json({
    examCode:  exam.exam_code,
    examName:  exam.exam_name,
    examId:    exam.id,
    tiers,
    multiTier: stages.length > 1,
  });
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/papers/:examCode/:tier
   Returns full + pyq tests for that exam + tier, with each user's
   attempt count attached.
───────────────────────────────────────────────────────────────── */
router.get("/:examCode/:tier", requireAuth, async (req, res) => {
  const { examCode, tier } = req.params;

  const { data: exam, error: examErr } = await supabaseAdmin
    .from("exams")
    .select("id, exam_code, exam_name")
    .eq("exam_code", examCode)
    .single();

  if (examErr || !exam) return res.status(404).json({ error: "Exam not found" });

  const [{ data: fullTests }, { data: pyqTests }] = await Promise.all([
    supabaseAdmin
      .from("full_tests")
      .select("id, test_name, tier, total_questions, duration_minutes, is_active, display_order")
      .eq("exam_id", exam.id)
      .eq("tier", tier)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabaseAdmin
      .from("pyq_tests")
      .select("id, test_name, tier, total_questions, duration_minutes, is_active, display_order, test_year, test_date")
      .eq("exam_id", exam.id)
      .eq("tier", tier)
      .eq("is_active", true)
      .order("test_year", { ascending: false }),
  ]);

  // Fetch this user's attempt counts for all these tests in one query
  const fullIds = (fullTests || []).map(t => t.id);
  const pyqIds  = (pyqTests  || []).map(t => t.id);
  const allIds  = [...fullIds, ...pyqIds];

  let attemptCounts = {};
  if (allIds.length) {
    const { data: attempts } = await supabaseAdmin
      .from("user_test_attempts")
      .select("test_id")
      .eq("user_id", req.userId)
      .in("test_id", allIds)
      .not("completed_at", "is", null);

    (attempts || []).forEach(a => {
      attemptCounts[a.test_id] = (attemptCounts[a.test_id] || 0) + 1;
    });
  }

  const attach = (rows, kind) =>
    (rows || []).map(r => ({
      ...formatTest(r, kind),
      attemptCount: attemptCounts[r.id] || 0,
    }));

  res.json({
    examCode:  exam.exam_code,
    examName:  exam.exam_name,
    tier,
    fullTests: attach(fullTests, "full"),
    pyqTests:  attach(pyqTests,  "pyq"),
  });
});

module.exports = router;
