// useTestsList.js
// ════════════════════════════════════════════════════════
//  Fetches test catalogs from the new schema and merges in the
//  signed-in user's attempt status from user_test_attempts, into the
//  shape TestCard expects:
//    { id, title, questions, marks, duration, year, category,
//      free, status, score, progress, ... }
//
//  Catalogs:
//    pyq      → pyq_tests          (grouped by year)
//    subject  → subject_wise_tests (grouped by subject)
//    topic    → topic_wise_tests   (grouped by subject, see useTopicsBySubject)
// ════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../services/supabaseClient";
/* ────────────────────────────────────────────────────────
   SHARED CONSTANTS — imported by UseTestQuestion.js too
──────────────────────────────────────────────────────── */
export const ATTEMPT_TYPE = {
  pyq:          "PYQ",
  full:         "FULL",
  subject:      "SUBJECT_WISE",
  topic:        "TOPIC_WISE",
};

// Display names for the exam codes used throughout the app (ExamContext
// stores/selects by these codes, e.g. localStorage's "selectedExam").
// Used so pages can show the real selected exam's name instead of a
// hardcoded default like "SSC CGL" regardless of what's actually selected.
export const EXAM_NAMES = {
  cgl:    "SSC CGL",
  chsl:   "SSC CHSL",
  cpo:    "SSC CPO",
  mts:    "SSC MTS",
  gd:     "SSC GD",
  ntpc:   "RRB NTPC",
  groupd: "RRB Group D",
  alp:    "RRB ALP",
  je:     "SSC JE",
};

export function examDisplayName(examIdOrCode) {
  if (!examIdOrCode) return "SSC CGL";
  return EXAM_NAMES[examIdOrCode.toLowerCase()] || examIdOrCode;
}

export const SECTION_PALETTE = [
  "#d946ef", "#0ea5e9", "#f59e0b",
  "#3ED9A0", "#a855f7", "#ef4444",
  "#f97316", "#06b6d4", "#84cc16",
];
/* ────────────────────────────────────────────────────────
   EXAM ID RESOLUTION
   UI uses short ids ("cgl"); schema keys on exams.id (UUID) /
   exams.exam_code (enum). Map short id → exam_code, look up the UUID
   once, cache it.
──────────────────────────────────────────────────────── */
const EXAM_UUID_MAP = {
  cgl:    "e529465e-8b5c-4246-b5a8-450776867dbb",
  chsl:   "6ccd898f-7cbc-4292-abd0-47a4a6c2b7d0",
  cpo:    "545ba185-42d0-4295-895e-91931e198c6a",
  mts:    "977e9c47-04f1-4f9d-b453-619b13a286c1",
  gd:     "ad11c111-d4dd-4e43-973b-bc12f53fc6e1",
  ntpc:   "4c7c3f8b-471e-4df8-951c-6ea04c16efac",
  groupd: "03a2b7f0-e6c0-497d-b299-0c71666a53d4",
  alp:    "281117c7-4878-4a98-8746-54931b11c6bc",
  je:     "b336a62d-223f-44fd-b388-190d97d206ba",
};

const _examIdCache = {};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveExamId(examId) {
  if (!examId) return null;
  if (UUID_RE.test(examId)) return examId;
  if (_examIdCache[examId]) return _examIdCache[examId];
  const uuid = EXAM_UUID_MAP[examId.toLowerCase()];
  if (!uuid) throw new Error(`Unknown exam code: ${examId}`);
  _examIdCache[examId] = uuid;
  return uuid;
}

/* ────────────────────────────────────────────────────────
   SHARED: latest attempt per test id
──────────────────────────────────────────────────────── */
async function fetchAttemptsMap(userId, attemptType, testIds) {
  const map = {};
  if (!userId || !testIds?.length) return map;
  const { data, error } = await supabase
    .from("user_test_attempts")
    .select("id, test_id, score, max_score, total_questions, attempted_questions, completed_at, started_at")
    .eq("user_id", userId)
    .eq("test_type", attemptType)
    .in("test_id", testIds)
    .order("started_at", { ascending: false });
  if (error) throw error;
  (data || []).forEach(a => { if (!map[a.test_id]) map[a.test_id] = a; });
  return map;
}

function deriveStatus(a, totalQuestions) {
  if (!a) return { status: "not-attempted" };
  // completed_at is the only indicator — no status column in schema
  if (a.completed_at) return { status: "completed", score: a.score, attemptId: a.id };
  const progress = totalQuestions
    ? Math.round(((a.attempted_questions || 0) / totalQuestions) * 100)
    : 0;
  return { status: "in-progress", progress, attemptId: a.id };
}

/* ────────────────────────────────────────────────────────
   PYQ CATALOG
──────────────────────────────────────────────────────── */
async function fetchPyqTests(examId, userId) {
  const examUuid = await resolveExamId(examId);
  if (!examUuid) return [];

  const { data: catalog, error: catErr } = await supabase
    .from("pyq_tests")
    .select("id, test_name, test_year, test_date, total_questions, duration_minutes, display_order, is_active")
    .eq("exam_id", examUuid)
    .eq("is_active", true)
    .order("test_year", { ascending: false })
    .order("display_order", { ascending: true });
  if (catErr) throw catErr;
  if (!catalog?.length) return [];

  const testIds = catalog.map(t => t.id);

  // marks per paper = sum of section marks
  const marksByTest = {};
  const { data: sections, error: secErr } = await supabase
    .from("pyq_test_sections")
    .select("pyq_test_id, marks")
    .in("pyq_test_id", testIds);
  if (secErr) throw secErr;
  (sections || []).forEach(s => {
    marksByTest[s.pyq_test_id] = (marksByTest[s.pyq_test_id] || 0) + (s.marks || 0);
  });

  const attempts = await fetchAttemptsMap(userId, "PYQ", testIds);

  return catalog.map(t => ({
    id: t.id,
    title: t.test_name,
    questions: t.total_questions,
    marks: marksByTest[t.id] || t.total_questions,
    duration: t.duration_minutes,
    category: "PYQ",
    year: t.test_year,
    free: false,
    isNew: false,
    icon: "📜",
    ...deriveStatus(attempts[t.id], t.total_questions),
  }));
}

/* ────────────────────────────────────────────────────────
   SUBJECT-WISE CATALOG
──────────────────────────────────────────────────────── */
async function fetchSubjectTests(examId, userId) {
  const examUuid = await resolveExamId(examId);
  if (!examUuid) return [];

  const { data: catalog, error } = await supabase
    .from("subject_wise_tests")
    .select("id, test_name, test_number, total_questions, duration_minutes, display_order, is_active, subject_id, generated_by_user_id, subjects(subject_name)")
    .eq("exam_id", examUuid)
    .eq("is_active", true)
    .or(`generated_by_user_id.is.null${userId ? `,generated_by_user_id.eq.${userId}` : ""}`)
    .order("display_order", { ascending: true })
    .order("test_number", { ascending: true });
  if (error) throw error;
  if (!catalog?.length) return [];

  const attempts = await fetchAttemptsMap(userId, "SUBJECT_WISE", catalog.map(t => t.id));

  return catalog.map(t => ({
    id: t.id,
    title: t.test_name,
    questions: t.total_questions,
    marks: t.total_questions,
    duration: t.duration_minutes,
    category: t.subjects?.subject_name || "Subject",
    subjectId: t.subject_id,
    isCustom: !!t.generated_by_user_id,
    testType: "subject",
    free: false,
    isNew: false,
    ...deriveStatus(attempts[t.id], t.total_questions),
  }));
}

/**
 * @param {string} examId    short id, exam_code, or UUID
 * @param {string} testType  "pyq" | "subject"
 * @param {string} userId
 */
export function useTestsList(examId, testType, userId) {
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchTests = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);

    try {
      if (testType === "pyq") {
        setTests(await fetchPyqTests(examId, userId));
      } else if (testType === "subject") {
        setTests(await fetchSubjectTests(examId, userId));
      } else {
        console.warn(`useTestsList: unsupported testType "${testType}"`);
        setTests([]);
      }
    } catch (err) {
      console.error("useTestsList error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId, testType, userId]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  return { tests, loading, error, refetch: fetchTests };
}

/**
 * useTopicsBySubject — for TopicWiseTests.jsx.
 * Loads ALL topic-wise tests for an exam at once, grouped by subject_id,
 * and returns the subject list (with palette colours) so the chips can be
 * rendered dynamically from the DB instead of a hardcoded list.
 *
 * @returns { data: { [subjectId]: TestCard[] }, subjects: [{id,name,color,icon}], ... }
 */
export function useTopicsBySubject(examId, userId) {
  const [data, setData]         = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchAll = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);

    try {
      const examUuid = await resolveExamId(examId);
      if (!examUuid) { setData({}); setSubjects([]); return; }

      const { data: catalog, error: catErr } = await supabase
        .from("topic_wise_tests")
        .select("id, test_name, test_number, total_questions, duration_minutes, display_order, is_active, subject_id, topic_id, generated_by_user_id, subjects(subject_name, display_order)")
        .eq("exam_id", examUuid)
        .eq("is_active", true)
        .or(`generated_by_user_id.is.null${userId ? `,generated_by_user_id.eq.${userId}` : ""}`)
        .order("display_order", { ascending: true })
        .order("test_number", { ascending: true });
      if (catErr) throw catErr;

      const attempts = await fetchAttemptsMap(userId, "TOPIC_WISE", (catalog || []).map(t => t.id));

      const grouped = {};
      const subjMeta = {};
      (catalog || []).forEach(t => {
        if (!subjMeta[t.subject_id]) {
          subjMeta[t.subject_id] = {
            id: t.subject_id,
            name: t.subjects?.subject_name || "Subject",
            order: t.subjects?.display_order ?? 99,
          };
        }
        (grouped[t.subject_id] ||= []).push({
          id: t.id,
          title: t.test_name,
          questions: t.total_questions,
          marks: t.total_questions,
          duration: t.duration_minutes,
          subjectId: t.subject_id,
          topicId: t.topic_id,
          isCustom: !!t.generated_by_user_id,
          testType: "topic",
          free: false,
          isNew: false,
          ...deriveStatus(attempts[t.id], t.total_questions),
        });
      });

      const subjList = Object.values(subjMeta)
        .sort((a, b) => a.order - b.order)
        .map((s, i) => ({
          id: s.id,
          name: s.name,
          color: SECTION_PALETTE[i % SECTION_PALETTE.length],
          icon: "🔬",
        }));

      setData(grouped);
      setSubjects(subjList);
    } catch (err) {
      console.error("useTopicsBySubject error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId, userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { data, subjects, loading, error, refetch: fetchAll };
}
