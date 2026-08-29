// server/routes/tests.js
//
// Mount with: app.use('/api/tests', require('./routes/tests'));

const express = require("express");
const pool    = require("../config/db");
const { authenticateToken } = require("../middleware/validate.middleware");
const redis   = require("../config/redis");

const router = express.Router();

// aliases so rest of file works unchanged
const requireAuth = (req, res, next) => {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    // normalize — old tokens used 'id', new ones use 'userId'
    req.userId =
      req.userId ||
      (req.user && req.user.id) ||
      (req.user && req.user.userId);
      // ← temporary
    if (!req.userId) return res.status(401).json({ error: "Not authenticated" });
    req.userId = String(req.userId);
    next();
  });
};
const redisClient   = redis;

// supabaseAdmin shim — wraps pool.query into a chainable Supabase-like API
// so all the existing .from().select().eq()... calls work without rewriting
const supabaseAdmin = {
  from: (table) => new QueryBuilder(table),
};

class QueryBuilder {
  constructor(table) {
    this._table  = table;
    this._select = "*";
    this._wheres = [];
    this._order  = [];
    this._limit  = null;
    this._single = false;
    this._insert = null;
    this._update = null;
    this._upsert = null;
    this._notNull= [];
    this._inList = [];
    this._vals   = [];
    this._rpc    = false;
  }
  select(cols) { this._select = cols; return this; }
  eq(col, val) { this._wheres.push({ col, val, op:"=" }); return this; }
  not(col, op, val) {
    if (op==="is" && val===null) this._notNull.push(col);
    return this;
  }
  in(col, vals) { this._inList.push({ col, vals }); return this; }
  order(col, { ascending=true }={}) { this._order.push(`${col} ${ascending?"ASC":"DESC"}`); return this; }
  limit(n) { this._limit = n; return this; }
  single() { this._single = true; return this; }

  insert(data) { this._insert = Array.isArray(data)?data:[data]; return this; }
  upsert(data, { onConflict }={}) { this._upsert = { data:Array.isArray(data)?data:[data], onConflict }; return this; }
  update(data) { this._update = data; return this; }

  async _run() {
    try {
      if (this._insert) {
        const rows = this._insert;
        const keys = Object.keys(rows[0]);
        const placeholders = rows.map((_, ri) =>
          `(${keys.map((_,ci)=>`$${ri*keys.length+ci+1}`).join(",")})`
        ).join(",");
        const vals = rows.flatMap(r=>keys.map(k=>r[k]));
        const q = `INSERT INTO ${this._table} (${keys.join(",")}) VALUES ${placeholders}`;
        if (this._select && this._select!=="*") {
          const { rows: ret } = await pool.query(q+" RETURNING "+this._select, vals);
          return { data: this._single ? ret[0]||null : ret, error: null };
        }
        await pool.query(q, vals);
        return { data: null, error: null };
      }

      if (this._upsert) {
        const { data: rows, onConflict } = this._upsert;
        const keys = Object.keys(rows[0]);
        const placeholders = rows.map((_,ri)=>
          `(${keys.map((_,ci)=>`$${ri*keys.length+ci+1}`).join(",")})`
        ).join(",");
        const vals = rows.flatMap(r=>keys.map(k=>r[k]));
        const updateCols = keys.filter(k => {
          return !(onConflict && onConflict.split(",").includes(k));
        }).map(k=>`${k}=EXCLUDED.${k}`).join(",");
        const conflictCols = onConflict || keys[0];
        const q = `INSERT INTO ${this._table} (${keys.join(",")}) VALUES ${placeholders}
          ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateCols}`;
        await pool.query(q, vals);
        return { data: null, error: null };
      }

      if (this._update) {
        const keys = Object.keys(this._update);
        const setClauses = keys.map((k,i)=>`${k}=$${i+1}`).join(",");
        const vals = keys.map(k=>this._update[k]);
        let whereIdx = vals.length;
        const whereClauses = this._wheres.map(w => {
  const isUuid = typeof w.val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(w.val);
  return `${w.col} ${w.op} $${++whereIdx}${isUuid ? "::uuid" : ""}`;
});
        vals.push(...this._wheres.map(w=>w.val));
        const q = `UPDATE ${this._table} SET ${setClauses}${whereClauses.length?" WHERE "+whereClauses.join(" AND "):""}`;
        await pool.query(q, vals);
        return { data: null, error: null };
      }

      // SELECT
      let q = `SELECT ${this._select} FROM ${this._table}`;
      const vals = [];
      const conds = [];
  this._wheres.forEach(w => {
  vals.push(w.val);
  const isUuid = typeof w.val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(w.val);
  conds.push(`${w.col} ${w.op} $${vals.length}${isUuid ? "::uuid" : ""}`);
});   
      this._notNull.forEach(col=>conds.push(`${col} IS NOT NULL`));
      this._inList.forEach(({col,vals:v})=>{
        vals.push(v);conds.push(`${col}=ANY($${vals.length})`);
      });
      if (conds.length) q+=` WHERE ${conds.join(" AND ")}`;
      if (this._order.length) q+=` ORDER BY ${this._order.join(",")}`;
      if (this._limit) q+=` LIMIT ${this._limit}`;
      const { rows } = await pool.query(q, vals);
      return { data: this._single ? rows[0]||null : rows, error: null };
    } catch(err) {
      return { data: null, error: err };
    }
  }

  then(resolve, reject) { return this._run().then(resolve, reject); }
}

const LETTERS = ["A", "B", "C", "D"];
const letterToIndex = (letter) => (letter ? LETTERS.indexOf(letter) : null);

const UI_TYPE = { FULL: "full", PYQ: "pyq", SUBJECT_WISE: "subject", TOPIC_WISE: "topic" };

/* ---------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------- */
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function computeAccuracy(correct, wrong) {
  const attempted = correct + wrong;
  if (!attempted) return 0;
  return Math.round((correct / attempted) * 1000) / 10; // one decimal place
}

// Batch-resolves title/duration/label/examId/totalQuestions for a set of
// attempt rows, one query per test_type instead of one per row.
async function fetchTestMetaMap(rows) {
  const ids = { PYQ: new Set(), FULL: new Set(), SUBJECT_WISE: new Set(), TOPIC_WISE: new Set() };
  rows.forEach((r) => {
    const set = ids[r.test_type];
    if (set) set.add(r.test_id);
  });

  const metaMap = {};

  if (ids.FULL.size) {
    const { data } = await supabaseAdmin
      .from("full_tests")
      .select("id, test_name, duration_minutes, total_questions, exam_id")
      .in("id", [...ids.FULL]);
    (data || []).forEach((t) => {
      metaMap[`FULL:${t.id}`] = {
        title: t.test_name,
        duration: t.duration_minutes,
        totalQuestions: t.total_questions,
        examId: t.exam_id,
        label: "Full Paper",
      };
    });
  }

  if (ids.PYQ.size) {
    const { data } = await supabaseAdmin
      .from("pyq_tests")
      .select("id, test_name, duration_minutes, total_questions, exam_id, test_year")
      .in("id", [...ids.PYQ]);
    (data || []).forEach((t) => {
      metaMap[`PYQ:${t.id}`] = {
        title: t.test_name,
        duration: t.duration_minutes,
        totalQuestions: t.total_questions,
        examId: t.exam_id,
        label: `Previous Year · ${t.test_year}`,
      };
    });
  }

  if (ids.SUBJECT_WISE.size) {
    const { data } = await supabaseAdmin
      .from("subject_wise_tests")
      .select("id, test_name, duration_minutes, total_questions, exam_id, subjects ( subject_name )")
      .in("id", [...ids.SUBJECT_WISE]);
    (data || []).forEach((t) => {
      metaMap[`SUBJECT_WISE:${t.id}`] = {
        title: t.test_name,
        duration: t.duration_minutes,
        totalQuestions: t.total_questions,
        examId: t.exam_id,
        label: (t.subjects && t.subjects.subject_name) || "Subject",
      };
    });
  }

  if (ids.TOPIC_WISE.size) {
    const { data } = await supabaseAdmin
      .from("topic_wise_tests")
      .select("id, test_name, duration_minutes, total_questions, exam_id, subjects ( subject_name ), topics ( topic_name )")
      .in("id", [...ids.TOPIC_WISE]);
    (data || []).forEach((t) => {
      metaMap[`TOPIC_WISE:${t.id}`] = {
        title: t.test_name,
        duration: t.duration_minutes,
        totalQuestions: t.total_questions,
        examId: t.exam_id,
        label: `${(t.subjects && t.subjects.subject_name) || "Unknown"} · ${(t.topics && t.topics.topic_name) || "Unknown"}`,
      };
    });
  }

  return metaMap;
}

function formatHistoryRow(row, metaMap) {
  const meta = metaMap[`${row.test_type}:${row.test_id}`] || { title: "Untitled test", duration: 0, label: row.test_type };
  return {
    attemptId: row.id,
    testId: row.test_id,
    testType: row.test_type, // raw enum — frontend sends this back when re-attempting
    examId: row.exam_id,
    type: UI_TYPE[row.test_type],
    title: meta.title,
    label: meta.label,
    date: formatDate(row.started_at),
    duration: formatDuration(meta.duration),
    summary: {
      score: Number(row.score),
      maxScore: row.max_score,
      correct: row.correct_answers,
      wrong: row.wrong_answers,
      skipped: row.skipped,
      total: row.total_questions,
      accuracy: row.accuracy != null ? Number(row.accuracy) : computeAccuracy(row.correct_answers, row.wrong_answers),
    },
  };
}

// Loads { name, questions[] } sections for FULL / PYQ tests, grouping
// questions by their subject (full_test_questions has no section_id of
// its own — the question's own subject_id is what ties it to a section).
async function loadFullOrPyqSections(kind, testId, lang = "en") {
  const testsTable = kind === 'FULL' ? 'full_test_sections' : 'pyq_test_sections';
  const linkTable  = kind === 'FULL' ? 'full_test_questions' : 'pyq_test_questions';
  const fkCol      = kind === 'FULL' ? 'full_test_id' : 'pyq_test_id';

  const { rows: sectionRows } = await pool.query(
    `SELECT ts.section_order, s.id AS subject_id, s.subject_name
     FROM ${testsTable} ts JOIN subjects s ON s.id = ts.subject_id
     WHERE ts.${fkCol} = $1::uuid ORDER BY ts.section_order`,
    [testId]
  );
  const { rows: linkRows } = await pool.query(
    `SELECT question_id, question_order FROM ${linkTable} WHERE ${fkCol} = $1::uuid ORDER BY question_order`,
    [testId]
  );
  if (!linkRows.length) return [];
  const questionIds = linkRows.map(r => r.question_id);
  // Hindi columns are only fetched when requested (View Solutions passes
  // ?lang=hi) — previously this query never fetched them at all, so
  // review mode always showed English regardless of the language toggle.
  const hiCols = lang === "hi"
    ? ", question_text_hi, option_a_hi, option_b_hi, option_c_hi, option_d_hi, explanation_hi"
    : "";
  const { rows: questionRows } = await pool.query(
    `SELECT id, subject_id, question_text, option_a, option_b, option_c, option_d,
            correct_option, explanation, difficulty, marks, negative_marking, image_url${hiCols}
     FROM questions WHERE id = ANY($1::uuid[])`,
    [questionIds]
  );
  const qById = Object.fromEntries(questionRows.map(q => [q.id, q]));
  const orderedQuestions = linkRows.map(r => qById[r.question_id]).filter(Boolean);
  const orderBySubject = Object.fromEntries(
    sectionRows.map(s => [s.subject_id, { order: s.section_order, name: s.subject_name }])
  );
  const bySubject = {};
  orderedQuestions.forEach(q => {
    const meta = orderBySubject[q.subject_id] || { order: 999, name: 'General' };
    if (!bySubject[q.subject_id]) bySubject[q.subject_id] = { name: meta.name, order: meta.order, questions: [] };
    bySubject[q.subject_id].questions.push(q);
  });
  return Object.values(bySubject).sort((a,b) => a.order - b.order).map(s => ({ name: s.name, questions: s.questions }));
}
async function loadSubjectWiseSections(testId) {
  const { rows: testRows } = await pool.query(
    `SELECT s.subject_name FROM subject_wise_tests t JOIN subjects s ON s.id = t.subject_id WHERE t.id = $1::uuid`,
    [testId]
  );
  const { rows: linkRows } = await pool.query(
    `SELECT question_id FROM subject_wise_test_questions WHERE subject_wise_test_id = $1::uuid ORDER BY question_order`,
    [testId]
  );
  const questionIds = linkRows.map(r => r.question_id);
  if (!questionIds.length) return [{ name: (testRows[0] && testRows[0].subject_name) || 'Subject', questions: [] }];
  const { rows: questions } = await pool.query(
    `SELECT id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, marks, negative_marking, image_url FROM questions WHERE id = ANY($1::uuid[])`,
    [questionIds]
  );
  const qById = Object.fromEntries(questions.map(q => [q.id, q]));
  return [{ name: (testRows[0] && testRows[0].subject_name) || 'Subject', questions: linkRows.map(r => qById[r.question_id]).filter(Boolean) }];
}
async function loadTopicWiseSections(testId) {
  const { rows: testRows } = await pool.query(
    `SELECT s.subject_name, t.topic_name FROM topic_wise_tests tw JOIN subjects s ON s.id = tw.subject_id JOIN topics t ON t.id = tw.topic_id WHERE tw.id = $1::uuid`,
    [testId]
  );
  const { rows: linkRows } = await pool.query(
    `SELECT question_id FROM topic_wise_test_questions WHERE topic_wise_test_id = $1::uuid ORDER BY question_order`,
    [testId]
  );
  const questionIds = linkRows.map(r => r.question_id);
  const name = testRows[0] ? testRows[0].subject_name + ' · ' + testRows[0].topic_name : 'Topic';
  if (!questionIds.length) return [{ name, questions: [] }];
  const { rows: questions } = await pool.query(
    `SELECT id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, marks, negative_marking, image_url FROM questions WHERE id = ANY($1::uuid[])`,
    [questionIds]
  );
  const qById = Object.fromEntries(questions.map(q => [q.id, q]));
  return [{ name, questions: linkRows.map(r => qById[r.question_id]).filter(Boolean) }];
}
async function loadSections(testType, testId, lang = "en") {
  if (testType === "FULL") return loadFullOrPyqSections("FULL", testId, lang);
  if (testType === "PYQ") return loadFullOrPyqSections("PYQ", testId, lang);
  if (testType === "SUBJECT_WISE") return loadSubjectWiseSections(testId);
  if (testType === "TOPIC_WISE") return loadTopicWiseSections(testId);
  throw new Error(`Unknown test_type: ${testType}`);
}

// Merges raw question rows + this attempt's responses into the shape
// testhistory.jsx's transformAttemptForReview expects:
//   q.correct     = option INDEX (0-3)  ← NOT letter
//   q.userAnswer  = option INDEX (0-3) or null
//   q.status      = "correct" | "wrong" | "skipped"
//   section.total = total question count in section
function attachResponses(sections, responses, lang = "en") {
  const LETTERS = ["A","B","C","D"];
  // correct_option / selected_option can be stored lowercase in the DB —
  // normalize before comparing against the uppercase LETTERS array.
  const letterToIdx = (l) => l ? LETTERS.indexOf(l.toUpperCase()) : null;
  const byQuestion = Object.fromEntries(responses.map((r) => [r.question_id, r]));
  const pick = (q, hiKey, enKey) => (lang === "hi" && q[hiKey]) ? q[hiKey] : q[enKey];

  return sections.map((section) => {
    const questions = section.questions.map((q, idx) => {
      const r = byQuestion[q.id];
      const status = !r || r.selected_option == null ? "skipped" : r.is_correct ? "correct" : "wrong";
      return {
        number:      idx + 1,
        text:        pick(q, "question_text_hi", "question_text"),
        options:     [
          pick(q, "option_a_hi", "option_a"),
          pick(q, "option_b_hi", "option_b"),
          pick(q, "option_c_hi", "option_c"),
          pick(q, "option_d_hi", "option_d"),
        ],
        correct:     letterToIdx(q.correct_option),  // INDEX for testhistory.jsx
        userAnswer:  r ? letterToIdx(r.selected_option) : null, // INDEX
        explanation: pick(q, "explanation_hi", "explanation"),
        status,
      };
    });
    return {
      name:    section.name,
      total:   questions.length,           // testhistory.jsx uses sec.total
      correct: questions.filter((q) => q.status === "correct").length,
      wrong:   questions.filter((q) => q.status === "wrong").length,
      skipped: questions.filter((q) => q.status === "skipped").length,
      questions,
    };
  });
}

// For FULL/PYQ attempts only: a lightweight per-subject correct/wrong/
// skipped/total breakdown (no question text), used to power the
// section-wise overview on both the history card and the review header.
async function buildSectionBreakdown(attempt) {
  if (attempt.test_type !== "FULL" && attempt.test_type !== "PYQ") return null;

  const [sections, { data: responses }] = await Promise.all([
    loadSections(attempt.test_type, attempt.test_id),
    supabaseAdmin.from("user_question_responses").select("question_id, selected_option, is_correct").eq("test_attempt_id", attempt.id),
  ]);

  return attachResponses(sections, responses || []).map(({ name, correct, wrong, skipped, total }) => ({
    name,
    correct,
    wrong,
    skipped,
    total,
  }));
}

// Sums marks across a test's questions — used to seed max_score on reattempt.
async function computeMaxScore(testType, testId) {
  if (testType === "FULL" || testType === "PYQ") {
    const table = testType === "FULL" ? "full_test_questions" : "pyq_test_questions";
    const fk = testType === "FULL" ? "full_test_id" : "pyq_test_id";
    const { data } = await supabaseAdmin.from(table).select("marks").eq(fk, testId);
    return (data || []).reduce((sum, r) => sum + (r.marks || 1), 0);
  }
  const table = testType === "SUBJECT_WISE" ? "subject_wise_test_questions" : "topic_wise_test_questions";
  const fk = testType === "SUBJECT_WISE" ? "subject_wise_test_id" : "topic_wise_test_id";
  const { data } = await supabaseAdmin.from(table).select("questions ( marks )").eq(fk, testId);
  return (data || []).reduce((sum, r) => sum + ((r.questions && r.questions.marks) || 1), 0);
}

/* ---------------------------------------------------------------------
   GET /api/tests/history
--------------------------------------------------------------------- */
router.get("/history", requireAuth, async (req, res) => {
  try {
    

    const { data: rows, error } = await supabaseAdmin
      .from("user_test_attempts")
      .select("*")
      .eq("user_id", req.userId)
      .not("completed_at", "is", null)
      .order("started_at", { ascending: false });

    

    if (error) return res.status(500).json({ error: error.message });
    if (!rows.length) return res.json([]);

    const metaMap = await fetchTestMetaMap(rows);
    const formatted = await Promise.all(
      rows.map(async (r) => {
        const base = formatHistoryRow(r, metaMap);
        if (r.test_type === "FULL" || r.test_type === "PYQ") {
          try { base.sectionBreakdown = await buildSectionBreakdown(r); }
          catch { base.sectionBreakdown = null; }
        } else {
          base.sectionBreakdown = null;
        }
        return base;
      })
    );

    res.json(formatted);
  } catch(err) {
    
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------------------
   GET /api/tests/attempts/:attemptId
--------------------------------------------------------------------- */
router.get("/attempts/:attemptId", requireAuth, async (req, res) => {
  const { attemptId } = req.params;
  const lang = req.query.lang === "hi" ? "hi" : "en";

  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from("user_test_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", req.userId) // users can only ever read their own attempts
    .single();

  if (attemptError || !attempt) return res.status(404).json({ error: "Attempt not found" });

  const metaMap = await fetchTestMetaMap([attempt]);
  const meta = metaMap[`${attempt.test_type}:${attempt.test_id}`] || { title: "Untitled test", duration: 0, label: attempt.test_type };

  const [sections, { data: responses }] = await Promise.all([
    loadSections(attempt.test_type, attempt.test_id, lang),
    supabaseAdmin
      .from("user_question_responses")
      .select("question_id, selected_option, is_correct, time_spent_seconds")
      .eq("test_attempt_id", attemptId),
  ]);

  // Build timePerQ map from stored response data (qId -> seconds)
  const timePerQ = Object.fromEntries(
    (responses || [])
      .filter((r) => r.time_spent_seconds != null)
      .map((r) => [r.question_id, r.time_spent_seconds])
  );

  res.json({
    attemptId: attempt.id,
    testId: attempt.test_id,
    testType: attempt.test_type,
    type: UI_TYPE[attempt.test_type],
    title: meta.title,
    label: meta.label,
    date: formatDate(attempt.started_at),
    duration: formatDuration(meta.duration),
    summary: {
      score: Number(attempt.score),
      maxScore: attempt.max_score,
      correct: attempt.correct_answers,
      wrong: attempt.wrong_answers,
      skipped: attempt.skipped,
      total: attempt.total_questions,
      accuracy: attempt.accuracy != null ? Number(attempt.accuracy) : computeAccuracy(attempt.correct_answers, attempt.wrong_answers),
    },
    sections: attachResponses(sections, responses || [], lang),
    timePerQ, // { questionId: seconds } — used by review screen per-question time badge
  });
});

/* ---------------------------------------------------------------------
   POST /api/tests/reattempt   body: { testId, testType }
--------------------------------------------------------------------- */
router.post("/reattempt", requireAuth, async (req, res) => {
  const { testId, testType } = req.body || {};
  if (!testId || !testType || !UI_TYPE[testType]) {
    return res.status(400).json({ error: "testId and a valid testType are required" });
  }

  const metaMap = await fetchTestMetaMap([{ test_type: testType, test_id: testId }]);
  const meta = metaMap[`${testType}:${testId}`];
  if (!meta) return res.status(404).json({ error: "Test not found" });

  const maxScore = await computeMaxScore(testType, testId);

  const { data, error } = await supabaseAdmin
    .from("user_test_attempts")
    .insert({
      user_id: req.userId,
      test_id: testId,
      test_type: testType,
      exam_id: meta.examId,
      total_questions: meta.totalQuestions,
      max_score: maxScore,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Frontend should route to your test-taking flow with this id, e.g.
  // navigate(`/test/take/${data.id}`)
  res.json({ attemptId: data.id });
});

/* ---------------------------------------------------------------------
   POST /api/tests/attempts/:attemptId/submit

   Payload (from TestScreen.buildPayload()):
   {
     answers:        { qId: optionIndex },   // null = skipped
     timePerQ:       { qId: seconds },        // ← the per-question timer data
     timeTakenSecs:  number,
     autoSubmitted:  boolean,
     marked:         string[],
     bookmarked:     string[],
   }

   What this does:
     1. Loads the attempt + all question correct_options for this test
     2. Builds one user_question_responses row per question, including
        time_spent_seconds from timePerQ — this is where the per-question
        time data lives permanently in the DB
     3. Updates user_test_attempts with score, accuracy, completed_at etc.
--------------------------------------------------------------------- */
router.post("/attempts/:attemptId/submit", requireAuth, async (req, res) => {
  const { attemptId } = req.params;
  const {
    answers = {},
    timePerQ = {},
    timeTakenSecs = 0,
    autoSubmitted = false,
  } = req.body || {};

  // 1. Load the attempt (verify ownership)
  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from("user_test_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", req.userId)
    .single();

  if (attemptError || !attempt) return res.status(404).json({ error: "Attempt not found" });
  if (attempt.completed_at) return res.status(400).json({ error: "Attempt already submitted" });

  // 2. Load all questions for this test (need correct_option + marks + negative_marking)
  let sections;
  try {
    sections = await loadSections(attempt.test_type, attempt.test_id);
    if (!sections || !sections.length) {
      return res.status(500).json({ error: "No sections found for this test" });
    }
  } catch (err) {
    return res.status(500).json({ error: "loadSections failed: " + err.message });
  }
  const allQuestions = sections.flatMap((s) => s.questions);  // 3. Build response rows
  const marksPerQ     = allQuestions[0] && allQuestions[0].marks != null ? allQuestions[0].marks : 1;
  const negativePerQ  = allQuestions[0] && allQuestions[0].negative_marking != null ? allQuestions[0].negative_marking : 0.25;

  let correct = 0, wrong = 0, skipped = 0, score = 0;

  const responseRows = allQuestions.map((q) => {
    // answers keys come from the frontend as the question's `id` field.
    // In live tests that id is the real UUID from the DB.
    //
    // NOTE: the frontend (UseTestQuestion.js submitTestAttempt) already
    // converts the selected option index -> letter before sending, so
    // answers[q.id] arrives here as "A"/"B"/"C"/"D", not a numeric index.
    // Previously this line did `LETTERS[answers[q.id]]`, which re-indexed
    // an array using a *string* key ("A") instead of a number — that's
    // always undefined, so every submitted answer silently failed to
    // match q.correct_option and got marked wrong. Use the letter as-is.
    const selectedLetter = answers[q.id] !== undefined && answers[q.id] !== null
      ? answers[q.id]
      : null;

    const isSkipped  = selectedLetter === null;
    // correct_option is stored lowercase in the DB (e.g. "b") while
    // selectedLetter is uppercase (e.g. "B") — normalize both sides so
    // the comparison actually matches instead of always failing.
    const isCorrect  = !isSkipped && selectedLetter && q.correct_option
      && selectedLetter.toUpperCase() === q.correct_option.toUpperCase();
    const isWrong    = !isSkipped && !isCorrect;

    if (isCorrect) { correct++; score += marksPerQ; }
    else if (isWrong) { wrong++; score -= negativePerQ; }
    else skipped++;

    return {
      user_id:            req.userId,
      test_attempt_id:    attemptId,
      question_id:        q.id,
      selected_option:    selectedLetter,
      is_correct:         isSkipped ? null : isCorrect,
      marks_obtained:     isSkipped ? 0 : isCorrect ? marksPerQ : -negativePerQ,
      time_spent_seconds: timePerQ[q.id] ?? null, // ← per-question time stored here
    };
  });

  // 4. Upsert responses (upsert so re-submitting is safe)
  const { error: respError } = await supabaseAdmin
    .from("user_question_responses")
    .upsert(responseRows, { onConflict: "test_attempt_id,question_id" });

  if (respError) return res.status(500).json({ error: respError.message });

  // 5. Update the attempt summary
  const attempted  = correct + wrong;
  const accuracy   = attempted ? Math.round((correct / attempted) * 1000) / 10 : 0;

  const { error: updateError } = await supabaseAdmin
    .from("user_test_attempts")
    .update({
      attempted_questions: attempted,
      correct_answers:     correct,
      wrong_answers:       wrong,
      skipped:             skipped,
      score:               Math.max(0, score),
      accuracy,
      duration_seconds:    timeTakenSecs,
      completed_at:        new Date().toISOString(),
    })
    .eq("id", attemptId);

  if (updateError) return res.status(500).json({ error: updateError.message });


// 5c. Decrement the user's free trial test credit (floor at 0, never
  // negative). This is what useSubscription.js reads to compute
  // testsLocked — without this, credits_remaining never moves and tests
  // never lock after the free trial is used up. Applies to every test type.
  try {
    await pool.query(
      `UPDATE free_credits SET credits_remaining = GREATEST(credits_remaining - 1, 0) WHERE user_id = $1`,
      [req.userId]
    );
  } catch (creditErr) {
    console.error("[submit] free credit decrement failed:", creditErr.message);
  }
  // 5b. Update today's daily-goal progress with the actual attempted count.
  // This is the missing link: incrementGoal() exists in GoalContext but
  // nothing in the test-taking flow ever called it, so the daily goal
  // counter never moved no matter how many questions were answered.
  // Done here (server-side, at submit) rather than per-click on the
  // frontend so re-selecting an answer can't double-count, and so it
  // can't be missed if the frontend forgets to fire a separate request.
  if (attempted > 0) {
    try {
      // IST-safe calendar date, not new Date().toISOString() — that's UTC,
      // which would misfile anything submitted ~12:00am–5:29am IST under
      // the previous day (same class of bug as the frontend's analytics
      // date-key issue).
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
      const today = new Date(Date.now() + IST_OFFSET_MS).toISOString().split("T")[0];
      // daily_goal_logs.user_id FKs to profiles(id), not users(id) — make
      // sure the row exists first (see goal.routes.js for the same fix).
      await pool.query(
        `INSERT INTO profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
        [req.userId]
      );
      const userResult = await pool.query(
        `SELECT daily_goal_target FROM users WHERE id = $1 LIMIT 1`,
        [req.userId]
      );
      const defaultTarget =
        (userResult.rows[0] && userResult.rows[0].daily_goal_target) != null
          ? userResult.rows[0].daily_goal_target
          : 50;
      await pool.query(
        `INSERT INTO daily_goal_logs (user_id, log_date, questions_done, target)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, log_date)
         DO UPDATE SET questions_done = daily_goal_logs.questions_done + $3`,
        [req.userId, today, attempted, defaultTarget]
      );
    } catch (goalErr) {
      // Never let a goal-tracking hiccup break the actual test submission —
      // but do log it, so a future failure here doesn't go unnoticed again.
      console.error("[submit] daily goal update failed:", goalErr.message);
    }
  }

  // 6. Delete any saved pause state from Redis
  await redisClient.del(`pause:${attemptId}`).catch(() => {});

  res.json({
    attemptId,
    score: Math.max(0, score),
    maxScore: attempt.max_score,
    correct, wrong, skipped, accuracy,
    timeTakenSecs,
    autoSubmitted,
  });
});

/* ---------------------------------------------------------------------
   POST /api/tests/attempts/:attemptId/pause

   Saves the full TestScreen state to Redis so the user can resume on
   any device. TTL: 7 days (matches session lifetime).

   Payload: full TestScreen.buildPayload() output.
--------------------------------------------------------------------- */
router.post("/attempts/:attemptId/pause", requireAuth, async (req, res) => {
  const { attemptId } = req.params;

  // Verify ownership before touching Redis
  const { data: attempt, error } = await supabaseAdmin
    .from("user_test_attempts")
    .select("id")
    .eq("id", attemptId)
    .eq("user_id", req.userId)
    .single();

  if (error || !attempt) return res.status(404).json({ error: "Attempt not found" });

  const SEVEN_DAYS = 60 * 60 * 24 * 7;
  await redisClient.set(
    `pause:${attemptId}`,
    JSON.stringify(req.body),
    "EX",
    SEVEN_DAYS
  );

  res.json({ saved: true });
});

/* ---------------------------------------------------------------------
   GET /api/tests/attempts/:attemptId/resume

   Retrieves saved pause state so TestScreen can re-hydrate.
--------------------------------------------------------------------- */
router.get("/attempts/:attemptId/resume", requireAuth, async (req, res) => {
  const { attemptId } = req.params;

  // Verify ownership
  const { data: attempt, error } = await supabaseAdmin
    .from("user_test_attempts")
    .select("id, completed_at")
    .eq("id", attemptId)
    .eq("user_id", req.userId)
    .single();

  if (error || !attempt) return res.status(404).json({ error: "Attempt not found" });
  if (attempt.completed_at) return res.status(400).json({ error: "Attempt already submitted" });

  const raw = await redisClient.get(`pause:${attemptId}`);
  if (!raw) return res.status(404).json({ error: "No saved state found" });

  res.json(JSON.parse(raw));
});

module.exports = router;
