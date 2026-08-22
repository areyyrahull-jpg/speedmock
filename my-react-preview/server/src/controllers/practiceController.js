const pool = require("../config/db");

// ── Exam code lookup ─────────────────────────────────────────────
// Maps dashboard short IDs → real exam_code values in the exams table
const EXAM_CODE_MAP = {
  cgl:    "SSC_CGL",
  chsl:   "SSC_CHSL",
  cpo:    "SSC_CPO",
  mts:    "SSC_MTS",
  gd:     "SSC_GD",
  ntpc:   "RRB_NTPC",
  groupd: "RRB_GROUP_D",
  alp:    "RRB_ALP",
  je:     "RRB_JE",
};

function resolveExamCode(examId) {
  return EXAM_CODE_MAP[examId?.toLowerCase()] || null;
}

// Converts 'A'/'B'/'C'/'D' → 0/1/2/3
function optionLetterToIndex(letter) {
  return { A: 0, B: 1, C: 2, D: 3 }[letter?.toUpperCase()] ?? 0;
}

// ── GET /api/practice/subjects?examId=cgl ──────────────────────
async function getSubjects(req, res) {
  try {
    const { examId } = req.query;
    if (!examId) return res.status(400).json({ error: "examId is required" });

    const examCode = resolveExamCode(examId);
    if (!examCode) return res.status(400).json({ error: `Unknown examId: ${examId}` });

    // Uses question_bank_subjects view for accurate question counts
    // Falls back to subjects.question_count if view returns nothing
    const { rows } = await pool.query(
      `SELECT
         s.id,
         s.subject_code            AS code,
         s.subject_name            AS name,
         '📘'                      AS icon,
         'rgba(99,102,241,.15)'    AS color,
         COALESCE(qbs.total_questions, s.question_count, 0) AS question_count,
         COUNT(DISTINCT t.id)::int AS topic_count
       FROM subjects s
       JOIN exams e ON e.id = s.exam_id
       LEFT JOIN topics t ON t.subject_id = s.id
       LEFT JOIN question_bank_subjects qbs ON qbs.subject_id = s.id AND qbs.exam_id = s.exam_id
       WHERE e.exam_code::text = $1
       GROUP BY s.id, qbs.total_questions
       ORDER BY s.display_order ASC NULLS LAST, s.id`,
      [examCode]
    );

    res.json({ subjects: rows });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to load subjects" });
  }
}

// ── GET /api/practice/topics?examId=cgl&subjectCode=qa ─────────
async function getTopics(req, res) {
  try {
    const { examId, subjectCode } = req.query;
    const userId = req.userId;
    if (!examId || !subjectCode) {
      return res.status(400).json({ error: "examId and subjectCode are required" });
    }

    const examCode = resolveExamCode(examId);
    if (!examCode) return res.status(400).json({ error: `Unknown examId: ${examId}` });

    // Resolve subject
    const { rows: subjectRows } = await pool.query(
      `SELECT s.id, s.subject_name AS name, '📘' AS icon
       FROM subjects s
       JOIN exams e ON e.id = s.exam_id
       WHERE e.exam_code::text = $1
         AND LOWER(s.subject_code) = LOWER($2)`,
      [examCode, subjectCode]
    );
    const subject = subjectRows[0];
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // Use topic_question_stats view for counts; join practice_attempts for user progress
    const { rows: topics } = await pool.query(
      `SELECT
         t.id,
         t.topic_name AS name,
         t.tier,
         COALESCE(tqs.total_questions, t.question_count, 0) AS question_count,
         COUNT(DISTINCT pa.question_id)::int                               AS attempted_count,
         COUNT(DISTINCT pa.question_id) FILTER (WHERE pa.is_correct)::int AS correct_count
       FROM topics t
       LEFT JOIN topic_question_stats tqs ON tqs.topic_id = t.id
       LEFT JOIN practice_attempts pa
              ON pa.topic_id = t.id
             AND pa.user_id  = $2
       WHERE t.subject_id = $1
       GROUP BY t.id, tqs.total_questions
       ORDER BY t.tier ASC NULLS LAST, t.display_order ASC NULLS LAST, t.id`,
      [subject.id, userId]
    );

    const tiers = [...new Set(topics.map(t => t.tier).filter(Boolean))].sort();

    res.json({ subject, topics, tiers });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to load topics" });
  }
}

// ── GET /api/practice/questions?topicId=<uuid> ──────────────────
async function getQuestions(req, res) {
  try {
    const { topicId } = req.query;
    const userId = req.userId;
    if (!topicId) return res.status(400).json({ error: "topicId is required" });

    const { rows: topicRows } = await pool.query(
      `SELECT t.id, t.topic_name AS name, s.subject_name AS subject_name
       FROM topics t
       JOIN subjects s ON s.id = t.subject_id
       WHERE t.id = $1`,
      [topicId]
    );
    const topic = topicRows[0];
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const { rows: rawQuestions } = await pool.query(
      `SELECT id, question_text,
              option_a, option_b, option_c, option_d,
              correct_option, correct_answer,
              difficulty, explanation
       FROM questions
       WHERE topic_id = $1
         AND status = 'PUBLISHED'
       ORDER BY created_at`,
      [topicId]
    );

    // Transform to what PracticeSession.jsx expects:
    //   options[]     ← built from option_a/b/c/d
    //   correct_index ← 'A'→0, 'B'→1, 'C'→2, 'D'→3
    //   difficulty    ← lowercased ('EASY'→'easy')
    const questions = rawQuestions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
      correct_index: optionLetterToIndex(q.correct_option),
      difficulty: (q.difficulty || "MEDIUM").toLowerCase(),
      explanation: q.explanation || null,
    }));

    // Resume previous session — most recent attempt per question
    const { rows: attempts } = await pool.query(
      `SELECT DISTINCT ON (question_id) question_id, is_correct
       FROM practice_attempts
       WHERE topic_id = $1 AND user_id = $2
       ORDER BY question_id, attempted_at DESC`,
      [topicId, userId]
    );
    const previousAttempts = {};
    attempts.forEach(a => {
      previousAttempts[a.question_id] = a.is_correct ? "correct" : "incorrect";
    });

    res.json({ topic, questions, previousAttempts });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to load questions" });
  }
}

// ── POST /api/practice/attempt ───────────────────────────────────
async function logAttempt(req, res) {
  try {
    const userId = req.userId;
    const { questionId, topicId, isCorrect, timeTakenSec } = req.body;

    if (!questionId || !topicId || typeof isCorrect !== "boolean") {
      return res.status(400).json({ error: "questionId, topicId, isCorrect are required" });
    }

    await pool.query(
      `INSERT INTO practice_attempts (user_id, question_id, topic_id, is_correct, time_taken_sec)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [userId, questionId, topicId, isCorrect, timeTakenSec ?? null]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to log attempt" });
  }
}

// ── Bookmarks (matches real schema exactly) ──────────────────────
async function getBookmarks(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, question_text, topic, saved_at
       FROM bookmarks WHERE user_id = $1 ORDER BY saved_at DESC`,
      [req.userId]
    );
    res.json({ bookmarks: rows });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to load bookmarks" });
  }
}

async function addBookmark(req, res) {
  try {
    const userId = req.userId;
    const { questionText, topic } = req.body;
    if (!questionText || !topic) {
      return res.status(400).json({ error: "questionText and topic are required" });
    }

    const { rows: existing } = await pool.query(
      `SELECT id FROM bookmarks WHERE user_id = $1 AND question_text = $2`,
      [userId, questionText]
    );
    if (existing.length) return res.json({ bookmarked: true, id: existing[0].id });

    const { rows } = await pool.query(
      `INSERT INTO bookmarks (user_id, question_text, topic, saved_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [userId, questionText, topic]
    );
    res.status(201).json({ bookmarked: true, id: rows[0].id });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to add bookmark" });
  }
}

async function removeBookmark(req, res) {
  try {
    const { questionText } = req.body;
    if (!questionText) return res.status(400).json({ error: "questionText is required" });

    await pool.query(
      `DELETE FROM bookmarks WHERE user_id = $1 AND question_text = $2`,
      [req.userId, questionText]
    );
    res.json({ bookmarked: false });
  } catch (err) {
    
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
}

module.exports = {
  getSubjects,
  getTopics,
  getQuestions,
  logAttempt,
  getBookmarks,
  addBookmark,
  removeBookmark,
};
