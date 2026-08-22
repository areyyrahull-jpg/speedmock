// useTestQuestions.js
// ════════════════════════════════════════════════════════
//  Loads everything TestScreen needs to run a SPECIFIC test from the
//  new schema, for any test type (pyq / subject / topic):
//    <type>_tests            → metadata (name, duration)
//    <type>_test_questions   → ordered question list → questions bank
//    pyq_test_sections       → sections (PYQ only; others = 1 subject)
//
//  correct_option / correct_answer are NEVER selected, so the answer
//  key stays server-side. Scoring runs through the submit_test_attempt
//  RPC (see submitTestAttempt below).
// ════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../services/supabaseClient";
import { resolveExamId, ATTEMPT_TYPE, SECTION_PALETTE } from "./UseTestList";
import { pauseAttempt } from "../../../services/testApi";

/* Per-type table/column config. */
const TYPE_CFG = {
  pyq: {
    table: "pyq_tests",
    link: "pyq_test_questions",
    fk: "pyq_test_id",
    sectionTable: "pyq_test_sections",
    perQMarks: true,
  },
  subject: {
    table: "subject_wise_tests",
    link: "subject_wise_test_questions",
    fk: "subject_wise_test_id",
    sectionTable: null,
    perQMarks: false,
  },
  topic: {
    table: "topic_wise_tests",
    link: "topic_wise_test_questions",
    fk: "topic_wise_test_id",
    sectionTable: null,
    perQMarks: false,
  },
};

export function useTestQuestions(testId, userId, testType = "pyq", language = "en") {
  const cfg = TYPE_CFG[testType] || TYPE_CFG.pyq;

  const [test, setTest]                = useState(null);
  const [questions, setQuestions]      = useState([]);
  const [existingAttempt, setExisting] = useState(null);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(null);

  const fetchAll = useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    setError(null);

    try {
      // ── 1. Test metadata ──────────────────────────────────────
      const { data: testRow, error: testErr } = await supabase
        .from(cfg.table)
        .select("id, exam_id, test_name, duration_minutes, total_questions, exams(exam_name)")
        .eq("id", testId)
        .single();
      if (testErr) throw testErr;

      // Sectional timing applies to SSC CGL only (per real exam pattern —
      // CHSL/other PYQ tests use a single overall timer). Adjust this
      // check if you add an explicit column instead of matching on name.
      // exams.exam_name is stored spelled out ("SSC Combined Graduate Level"),
      // not as "CGL" — so matching on the exam's UUID directly is exact and
      // won't silently break if the name text ever changes.
      const CGL_EXAM_UUID = "e529465e-8b5c-4246-b5a8-450776867dbb";
      const examName = testRow.exams?.exam_name || "";
      const sectional = testRow.exam_id === CGL_EXAM_UUID
        || /\bcgl\b|combined graduate level/i.test(examName);

      // ── 2. Sections ───────────────────────────────────────────
      let sections = [];
      if (cfg.sectionTable) {
        const { data: secRows, error: secErr } = await supabase
          .from(cfg.sectionTable)
          .select("subject_id, section_order, subjects(subject_name)")
          .eq(cfg.fk, testId)
          .order("section_order", { ascending: true });
        if (secErr) throw secErr;
        sections = (secRows || []).map((s, i) => ({
          id: s.subject_id,
          name: s.subjects?.subject_name || "Section",
          color: SECTION_PALETTE[i % SECTION_PALETTE.length],
        }));
      }

      // ── 3. Questions — answer key NOT selected ────────────────
      const linkCols = cfg.perQMarks
        ? "question_order, marks, negative_marking"
        : "question_order";

      // Fetch Hindi columns only when needed to save bandwidth
      const hiCols = language === "hi"
        ? ", question_text_hi, option_a_hi, option_b_hi, option_c_hi, option_d_hi, explanation_hi"
        : "";

      const { data: qRows, error: qErr } = await supabase
        .from(cfg.link)
        .select(`
          ${linkCols},
          questions:question_id (
            id, subject_id, question_text, image_url,
            option_a, option_b, option_c, option_d${hiCols}
          )
        `)
        .eq(cfg.fk, testId)
        .order("question_order", { ascending: true });
      if (qErr) throw qErr;

      // Helper: pick Hindi if available, fall back to English
      const pick = (q, hiKey, enKey) =>
        (language === "hi" && q[hiKey]) ? q[hiKey] : q[enKey];

      const mappedQuestions = (qRows || []).map((row, i) => {
        const q = row.questions || {};
        const LETTERS = ["A", "B", "C", "D"];
        const options = [
          pick(q, "option_a_hi", "option_a"),
          pick(q, "option_b_hi", "option_b"),
          pick(q, "option_c_hi", "option_c"),
          pick(q, "option_d_hi", "option_d"),
        ]
          // Tag with the real DB letter BEFORE filtering — if e.g. option_b
          // is null, this keeps option_c correctly tagged "C" (not shifted
          // down to fill "B"'s slot, which used to make submitted answers
          // point at the wrong letter for any question with a gap).
          .map((text, idx) => ({ text, letter: LETTERS[idx] }))
          .filter(o => o.text != null && o.text !== "");
        return {
          id: q.id,
          number: row.question_order ?? i + 1,
          sectionId: q.subject_id,
          text: pick(q, "question_text_hi", "question_text") || undefined,
          imageUrl: q.image_url || undefined,
          options,
        };
      });

      // Derive sections from question subjects when there's no section table
      if (sections.length === 0) {
        const seen = new Map();
        mappedQuestions.forEach(q => {
          if (q.sectionId && !seen.has(q.sectionId)) {
            seen.set(q.sectionId, {
              id: q.sectionId,
              name: q.sectionId,
              color: SECTION_PALETTE[seen.size % SECTION_PALETTE.length],
            });
          }
        });
        sections = Array.from(seen.values());
        // backfill nicer section names
        if (sections.length) {
          const { data: subjRows } = await supabase
            .from("subjects")
            .select("id, subject_name")
            .in("id", sections.map(s => s.id));
          const nameById = {};
          (subjRows || []).forEach(s => { nameById[s.id] = s.subject_name; });
          sections = sections.map(s => ({ ...s, name: nameById[s.id] || s.name }));
        }
      }

      const first = qRows?.[0];
      setTest({
        id: testRow.id,
        examId: testRow.exam_id,
        testType,
        testName: testRow.test_name,
        durationMins: testRow.duration_minutes,
        marksPerQ: (cfg.perQMarks ? first?.marks : 1) ?? 1,
        negativeMarking: (cfg.perQMarks ? first?.negative_marking : 0.25) ?? 0.25,
        sections,
        sectional, // true → TestScreen enforces per-section time limits (SSC CGL)
      });
      setQuestions(mappedQuestions);

      // ── 4. Resume — most recent in-progress attempt ───────────
      if (userId) {
        const { data: attempt } = await supabase
          .from("user_test_attempts")
          .select("id, attempted_questions, completed_at")
          .eq("user_id", userId)
          .eq("test_id", testId)
          .eq("test_type", ATTEMPT_TYPE[testType] || "PYQ")
          .is("completed_at", null)          // in-progress = not yet completed
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setExisting(attempt || null);
      } else {
        setExisting(null);
      }
    } catch (err) {
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [testId, userId, testType, cfg, language]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { test, questions, existingAttempt, loading, error, refetch: fetchAll };
}


/**
 * createAttempt — inserts an in-progress user_test_attempts row.
 * total_questions / max_score are NOT NULL in the schema.
 */
export async function createAttempt({
  userId, examId, testId, testType = "pyq", totalQuestions = 0, maxScore = 0,
}) {
  const examUuid = await resolveExamId(examId);

  const { data, error } = await supabase
    .from("user_test_attempts")
    .insert({
      user_id:             userId,
      exam_id:             examUuid,
      test_id:             testId,
      test_type:           ATTEMPT_TYPE[testType] || "PYQ",
      total_questions:     totalQuestions,
      max_score:           maxScore || totalQuestions,
      attempted_questions: 0,
      correct_answers:     0,
      wrong_answers:       0,
      skipped:             totalQuestions,
      score:               0,
      accuracy:            0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}


/**
 * savePauseState — persists in-progress snapshot via the backend API
 * (which stores it in Redis). user_test_attempts has no saved_state /
 * progress_pct / status columns — those don't exist in the schema.
 * We update attempted_questions so the progress ring still shows on cards.
 */
export async function savePauseState({ attemptId, payload, totalQuestions }) {
  const answeredCount = Object.keys(payload?.answers || {}).length;

  // Update attempted_questions so test cards show partial progress
  await supabase
    .from("user_test_attempts")
    .update({ attempted_questions: answeredCount })
    .eq("id", attemptId);

  // Persist full state to Redis via backend
  return pauseAttempt(attemptId, payload);
}


/**
 * submitTestAttempt — submits via the backend API which does server-side
 * scoring. The supabase.rpc("submit_test_attempt") RPC doesn't exist.
 * Converts answers from option INDEX → option LETTER before sending.
 */
export async function submitTestAttempt({ attemptId, test, questions, payload }) {
  // Convert option index -> the option's real DB letter (A/B/C/D) for the
  // backend. Looked up per-question via `questions[].options[idx].letter`
  // rather than a flat OPTION_LETTERS[idx] map, because a question with a
  // null option (fewer than 4 populated) would otherwise shift every
  // option after the gap into the wrong letter.
  const questionById = Object.fromEntries(questions.map(q => [q.id, q]));
  const answers = {};
  Object.entries(payload?.answers || {}).forEach(([qid, idx]) => {
    if (idx == null) return;
    const letter = questionById[qid]?.options?.[idx]?.letter;
    if (letter) answers[qid] = letter;
  });

  const { submitAttempt } = await import("../../../services/testApi");
  const result = await submitAttempt(attemptId, {
    answers,
    timePerQ:       payload?.timePerQ || {},
    timeTakenSecs:  payload?.timeTakenSecs || 0,
    autoSubmitted:  payload?.autoSubmitted || false,
  });

  // colour sections from the running test's section list
  const colorBySubject = {};
  (test.sections || []).forEach((s, i) => {
    colorBySubject[s.id] = s.color || SECTION_PALETTE[i % SECTION_PALETTE.length];
  });

  return {
    testName:       test.testName,
    marksPerQ:      test.marksPerQ ?? 1,
    negativeMarking:test.negativeMarking ?? 0.25,
    totalQuestions: result.totalQuestions ?? questions.length,
    correct:        result.correct,
    wrong:          result.wrong,
    unattempted:    result.skipped,
    totalTimeSecs:  (test.durationMins || 0) * 60,
    timeTakenSecs:  payload?.timeTakenSecs || 0,
    score:          result.score,
    maxScore:       result.maxScore,
    sections:       [],
  };
}
