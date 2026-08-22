// useAnalytics.js — rewritten against the REAL, populated schema.
//
// The previous version read from test_attempts, test_subject_results,
// test_topic_results, and daily_goal_logs — all of which exist as tables
// but are NEVER WRITTEN TO by the actual test-taking flow (tests.js writes
// to user_test_attempts + user_question_responses instead). Every query
// silently returned empty results with no error surfaced, which is why
// analytics always looked blank no matter how many tests were taken.
//
// This version derives everything from the two tables that are actually
// populated:
//   - user_test_attempts        (score, accuracy, completed_at, ...)
//   - user_question_responses   (per-question answers, has created_at +
//                                 user_id directly — used to derive daily/
//                                 weekly/monthly goal progress without
//                                 needing daily_goal_logs at all)
// Subject/topic breakdowns are built by joining question_id -> questions
// .subject_id/.topic_id -> subjects/topics manually in JS rather than via
// a Postgres embed, so a missing/unconfigured FK relationship can't
// silently return nothing (same lesson learned from the exam-name embed
// issue in UseTestQuestion.js).

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const SUBJECT_COLORS = {
  "General Awareness":        "#22c55e",
  "General Intelligence & Reasoning": "#e91e8c",
  "English Language":         "#0ea5e9",
  "English Comprehension":    "#0ea5e9",
  "Quantitative Aptitude":    "#f59e0b",
  "Quant / Maths":            "#f59e0b",
};
const FALLBACK_COLORS = ["#e91e8c", "#0ea5e9", "#f59e0b", "#22c55e", "#a78bfa", "#f472b6"];

const TEST_TYPE_LABEL = {
  PYQ: "PYQ Test", FULL: "Full Test", SUBJECT_WISE: "Subject Test", TOPIC_WISE: "Topic Test",
};

// Mirrors usePractice.js's EXAM_UUID_MAP — kept as its own copy here rather
// than a cross-folder import so this file doesn't depend on that file's
// location staying stable. If you add a new exam, update both.
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
const EXAM_NAMES = {
  cgl: "SSC CGL", chsl: "SSC CHSL", cpo: "SSC CPO", mts: "SSC MTS", gd: "SSC GD",
  ntpc: "RRB NTPC", groupd: "RRB Group D", alp: "RRB ALP", je: "SSC JE",
};
function examDisplayName(code) { return EXAM_NAMES[(code || "").toLowerCase()] || "SSC CGL"; }

// Local calendar-day key (YYYY-MM-DD), using the BROWSER'S timezone —
// NOT date.toISOString(), which always converts to UTC first. For any
// timezone ahead of UTC (IST/UTC+5:30, which is presumably every real user
// of this app), that conversion silently shifts local midnight back to the
// previous day's evening in UTC — so every "today" computed via
// `d.toISOString().split("T")[0]` was actually yesterday's date, no matter
// what time someone practiced. This is almost certainly why goal progress
// "didn't reflect" — it was being looked up under the wrong calendar day.
function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useAnalytics(userId, range = "7d", examCode = "cgl") {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const examUuid = EXAM_UUID_MAP[(examCode || "cgl").toLowerCase()] || EXAM_UUID_MAP.cgl;

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("No user ID available — make sure you're logged in.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const days = range === "30d" ? 30 : 7;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);
      const sinceISO = sinceDate.toISOString();

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const sevenAgoStart = new Date(); sevenAgoStart.setDate(sevenAgoStart.getDate() - 6); sevenAgoStart.setHours(0, 0, 0, 0);
      const cal31Start = new Date(); cal31Start.setDate(cal31Start.getDate() - 30); cal31Start.setHours(0, 0, 0, 0);

      // ── 1. Profile (daily goal target only — goal stays combined
      // across all exams by design, unlike everything else below) ──
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("daily_goal_target")
        .eq("id", userId)
        .maybeSingle();
      if (profileErr) console.error("[analytics] profile fetch error:", profileErr);

      let goalTarget = profile?.daily_goal_target;
      if (!goalTarget) {
        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("daily_goal_target")
          .eq("id", userId)
          .maybeSingle();
        if (userErr) console.error("[analytics] users fallback fetch error:", userErr);
        goalTarget = userRow?.daily_goal_target || 50;
      }

      // ── 2. Daily goal history (7-day chart, 31-day calendar, streak) ─
      // Read straight from daily_goal_logs — the SAME table GoalContext/
      // the dashboard reads from (updated by both test submissions and
      // practice-bank attempts). Previously this was recomputed here from
      // user_question_responses alone, which only covers test attempts —
      // practice-bank questions log to a separate table (practice_attempts)
      // and were invisible to this count, causing analytics' weekly chart
      // and calendar to disagree with the dashboard's "today" number even
      // though both are tracking the same underlying activity.
      const { data: goalLogs, error: goalLogsErr } = await supabase
        .from("daily_goal_logs")
        .select("log_date, questions_done, target")
        .eq("user_id", userId)
        .gte("log_date", localDateKey(cal31Start))
        .order("log_date", { ascending: true });
      if (goalLogsErr) console.error("[analytics] daily_goal_logs fetch error:", goalLogsErr);

      const countsByDate = {}; // "YYYY-MM-DD" -> questions_done
      const targetByDate  = {}; // "YYYY-MM-DD" -> that day's target
      const loggedDates = new Set();
      (goalLogs || []).forEach((r) => {
        countsByDate[r.log_date] = r.questions_done;
        targetByDate[r.log_date] = r.target;
        loggedDates.add(r.log_date);
      });

      // Fallback for days with NO daily_goal_logs row at all — daily_goal_logs
      // only started being written to recently (see tests.js/usePractice.js),
      // so any activity before that would otherwise show as a hard zero even
      // though it genuinely happened. Reconstruct those days directly from
      // the real underlying activity tables.
      const [{ data: histResponses, error: histRespErr }, { data: histPractice, error: histPracticeErr }] = await Promise.all([
        supabase.from("user_question_responses").select("created_at").eq("user_id", userId).gte("created_at", cal31Start.toISOString()),
        supabase.from("practice_attempts").select("attempted_at").eq("user_id", userId).gte("attempted_at", cal31Start.toISOString()),
      ]);
      if (histRespErr) console.error("[analytics] historical responses fetch error:", histRespErr);
      if (histPracticeErr) console.error("[analytics] historical practice fetch error:", histPracticeErr);

      const fallbackCounts = {};
      (histResponses || []).forEach(r => {
        const d = localDateKey(new Date(r.created_at));
        if (!loggedDates.has(d)) fallbackCounts[d] = (fallbackCounts[d] || 0) + 1;
      });
      (histPractice || []).forEach(r => {
        const d = localDateKey(new Date(r.attempted_at));
        if (!loggedDates.has(d)) fallbackCounts[d] = (fallbackCounts[d] || 0) + 1;
      });
      Object.entries(fallbackCounts).forEach(([d, count]) => { countsByDate[d] = count; });

      const todayStr = localDateKey(todayStart);
      const todayDone = countsByDate[todayStr] || 0;

      const goalHistory = fillLast7Days(countsByDate, goalTarget, targetByDate);
      const goalCalendar = build31DayCalendar(countsByDate, goalTarget, targetByDate);
      const streak = calculateStreak(countsByDate, goalTarget, targetByDate);

      // ── 3. Test attempts — filtered to the selected exam only ─────
      const { data: testAttempts, error: attemptsErr } = await supabase
        .from("user_test_attempts")
        .select("id, test_id, test_type, exam_id, score, max_score, accuracy, completed_at, duration_seconds")
        .eq("user_id", userId)
        .eq("exam_id", examUuid)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(7);
      if (attemptsErr) console.error("[analytics] test attempts fetch error:", attemptsErr);

      const last7Tests = (testAttempts || [])
        .slice().reverse()
        .map((t, i) => ({
          label: `T${i + 1}`,
          date: new Date(t.completed_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          score: Math.round(Number(t.score) || 0),
          accuracy: Math.round(Number(t.accuracy) || 0),
          exam: TEST_TYPE_LABEL[t.test_type] || t.test_type || "Test",
        }));

      const examAccuracy = {
        exam: examDisplayName(examCode),
        current:  testAttempts?.[0] ? Math.round(Number(testAttempts[0].accuracy) || 0) : 0,
        previous: testAttempts?.[1] ? Math.round(Number(testAttempts[1].accuracy) || 0)
                  : (testAttempts?.[0] ? Math.round(Number(testAttempts[0].accuracy) || 0) : 0),
      };

      // PYQ-specific attempts, with real test names, for the "PYQ Test
      // Deep-Dive" picker below — separate from the general last7Tests
      // (which spans all test types for the trend chart).
      const { data: pyqAttempts, error: pyqErr } = await supabase
        .from("user_test_attempts")
        .select("id, test_id, score, max_score, accuracy, completed_at")
        .eq("user_id", userId)
        .eq("exam_id", examUuid)
        .eq("test_type", "PYQ")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(30);
      if (pyqErr) console.error("[analytics] pyq attempts fetch error:", pyqErr);

      let pyqTests = [];
      if (pyqAttempts?.length) {
        const pyqTestIds = [...new Set(pyqAttempts.map(a => a.test_id))];
        const { data: pyqTestRows, error: pyqTestErr } = await supabase
          .from("pyq_tests")
          .select("id, test_name")
          .in("id", pyqTestIds);
        if (pyqTestErr) console.error("[analytics] pyq_tests fetch error:", pyqTestErr);
        const nameByTestId = Object.fromEntries((pyqTestRows || []).map(t => [t.id, t.test_name]));
        pyqTests = pyqAttempts.map(a => ({
          attemptId: a.id,
          testName: nameByTestId[a.test_id] || "PYQ Test",
          completedAt: a.completed_at,
          score: Math.round(Number(a.score) || 0),
          maxScore: a.max_score,
          accuracy: Math.round(Number(a.accuracy) || 0),
        }));
      }

      // ── 4. Totals (all completed attempts for this exam) ──────────
      const { data: allAttempts, error: allAttemptsErr } = await supabase
        .from("user_test_attempts")
        .select("score, duration_seconds")
        .eq("user_id", userId)
        .eq("exam_id", examUuid)
        .not("completed_at", "is", null);
      if (allAttemptsErr) console.error("[analytics] all attempts fetch error:", allAttemptsErr);

      const testsDone = allAttempts?.length || 0;
      const scores = (allAttempts || []).map(a => Number(a.score) || 0);
      const avgScore = testsDone ? Math.round(scores.reduce((s, v) => s + v, 0) / testsDone) : 0;
      const topScore = testsDone ? Math.round(Math.max(...scores)) : 0;
      const timeMins = Math.round((allAttempts || []).reduce((s, a) => s + (a.duration_seconds || 0), 0) / 60);

      // ── 5. Subject-wise accuracy — this exam's questions only ─────
      // No FK embed relied on — question_id -> subject_id -> subject_name
      // resolved manually in JS so a missing/unconfigured relationship in
      // PostgREST can't silently return nothing.
      const { data: respRows, error: respErr } = await supabase
        .from("user_question_responses")
        .select("question_id, is_correct, created_at")
        .eq("user_id", userId)
        .gte("created_at", sinceISO);
      if (respErr) console.error("[analytics] responses fetch error:", respErr);

      let subjects = [];
      let weakTopics = [];
      const questionIds = [...new Set((respRows || []).map(r => r.question_id))];

      if (questionIds.length) {
        const { data: qRows, error: qErr } = await supabase
          .from("questions")
          .select("id, subject_id, topic_id, exam_id")
          .in("id", questionIds)
          .eq("exam_id", examUuid); // scope the breakdown to the selected exam
        if (qErr) console.error("[analytics] questions fetch error:", qErr);

        const subjectIdByQ = {}, topicIdByQ = {};
        (qRows || []).forEach(q => { subjectIdByQ[q.id] = q.subject_id; topicIdByQ[q.id] = q.topic_id; });

        const subjectIds = [...new Set((qRows || []).map(q => q.subject_id).filter(Boolean))];
        const topicIds   = [...new Set((qRows || []).map(q => q.topic_id).filter(Boolean))];

        const [{ data: subjRows, error: subjErr }, { data: topicRows, error: topicErr }] = await Promise.all([
          subjectIds.length
            ? supabase.from("subjects").select("id, subject_name").in("id", subjectIds)
            : Promise.resolve({ data: [], error: null }),
          topicIds.length
            ? supabase.from("topics").select("id, topic_name").in("id", topicIds)
            : Promise.resolve({ data: [], error: null }),
        ]);
        if (subjErr) console.error("[analytics] subjects fetch error:", subjErr);
        if (topicErr) console.error("[analytics] topics fetch error:", topicErr);

        const subjectNameById = Object.fromEntries((subjRows || []).map(s => [s.id, s.subject_name]));
        const topicNameById   = Object.fromEntries((topicRows || []).map(t => [t.id, t.topic_name]));

        const bySubject = {}, byTopic = {};
        (respRows || []).forEach(r => {
          const subjName = subjectNameById[subjectIdByQ[r.question_id]];
          if (subjName) (bySubject[subjName] ||= []).push(r.is_correct ? 100 : 0);

          const topicName = topicNameById[topicIdByQ[r.question_id]];
          if (topicName) (byTopic[topicName] ||= []).push(r.is_correct ? 100 : 0);
        });

        subjects = Object.entries(bySubject)
          .map(([name, vals], i) => ({
            name, accuracy: avg(vals),
            color: SUBJECT_COLORS[name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          }))
          .sort((a, b) => b.accuracy - a.accuracy);

        weakTopics = Object.entries(byTopic)
          .map(([topic, vals]) => ({ topic, accuracy: avg(vals), tests: vals.length }))
          .filter(t => t.tests >= 2) // avoid single-question noise
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 5);
      }

      // ── 6. Typing sessions (separate feature, own table) ──────────
      const { data: typingRows, error: typingErr } = await supabase
        .from("typing_sessions")
        .select("wpm, accuracy, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12);
      if (typingErr) console.error("[analytics] typing fetch error:", typingErr);

      const typingData = (typingRows || []).slice().reverse();
      const speedTrend = typingData.map((t, i) => ({
        label: `S${i + 1}`,
        wpm: Math.round(Number(t.wpm) || 0),
        accuracy: Math.round(Number(t.accuracy) || 0),
      }));

      const typing = {
        sessions:    typingData.length,
        avgSpeed:    avg(typingData.map(t => Number(t.wpm) || 0)),
        topSpeed:    max(typingData.map(t => Number(t.wpm) || 0)),
        avgAccuracy: avg(typingData.map(t => Number(t.accuracy) || 0)),
        topAccuracy: max(typingData.map(t => Number(t.accuracy) || 0)),
      };

      setData({
        goal: { target: goalTarget, done: todayDone, streak },
        goalHistory,
        goalCalendar,
        examAccuracy,
        totals: { testsDone, avgScore, topScore, timeMins },
        last7Tests,
        pyqTests,
        subjects,
        weakTopics,
        typing,
        speedTrend,
        selectedExam: examCode,
      });

    } catch (err) {
      console.error("Analytics fetch error:", err.message, err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [userId, range, examCode]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  return { data, loading, error, refetch: fetchAll };
}

// ── useTestDeepDive ──────────────────────────────────────────────
// Advanced per-test analysis for a single completed PYQ attempt:
// section-wise accuracy for that test, plus weak topics enriched with
// (a) a trend vs the user's all-time history on that topic — are they
//     actually improving on it, or stuck? — and
// (b) an accuracy breakdown by question difficulty within that topic.
export function useTestDeepDive(userId, attemptId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchDeepDive = useCallback(async () => {
    if (!userId || !attemptId) { setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: respRows, error: respErr } = await supabase
        .from("user_question_responses")
        .select("question_id, is_correct, time_spent_seconds")
        .eq("user_id", userId)
        .eq("test_attempt_id", attemptId);
      if (respErr) throw respErr;

      const questionIds = [...new Set((respRows || []).map(r => r.question_id))];
      if (!questionIds.length) { setData({ sections: [], weakTopics: [] }); return; }

      const { data: qRows, error: qErr } = await supabase
        .from("questions")
        .select("id, subject_id, topic_id, difficulty")
        .in("id", questionIds);
      if (qErr) throw qErr;

      const subjectIds = [...new Set((qRows || []).map(q => q.subject_id).filter(Boolean))];
      const topicIds   = [...new Set((qRows || []).map(q => q.topic_id).filter(Boolean))];

      const [{ data: subjRows }, { data: topicRows }] = await Promise.all([
        subjectIds.length ? supabase.from("subjects").select("id, subject_name").in("id", subjectIds) : Promise.resolve({ data: [] }),
        topicIds.length   ? supabase.from("topics").select("id, topic_name").in("id", topicIds)       : Promise.resolve({ data: [] }),
      ]);
      const subjName  = Object.fromEntries((subjRows || []).map(s => [s.id, s.subject_name]));
      const topicName = Object.fromEntries((topicRows || []).map(t => [t.id, t.topic_name]));
      const qMeta = Object.fromEntries((qRows || []).map(q => [q.id, q]));

      // Section (subject) breakdown for THIS test
      const bySection = {};
      (respRows || []).forEach(r => {
        const q = qMeta[r.question_id]; if (!q) return;
        const name = subjName[q.subject_id] || "Other";
        (bySection[name] ||= []).push(r.is_correct ? 100 : 0);
      });
      const sections = Object.entries(bySection)
        .map(([name, vals]) => ({ name, accuracy: avg(vals), questions: vals.length }))
        .sort((a, b) => b.accuracy - a.accuracy);

      // Topic breakdown for THIS test, with per-difficulty split
      const byTopic = {};
      (respRows || []).forEach(r => {
        const q = qMeta[r.question_id]; if (!q || !q.topic_id) return;
        const key = q.topic_id;
        (byTopic[key] ||= { name: topicName[key] || "Unknown topic", vals: [], byDifficulty: {} });
        byTopic[key].vals.push(r.is_correct ? 100 : 0);
        const level = q.difficulty || "unspecified";
        (byTopic[key].byDifficulty[level] ||= []).push(r.is_correct ? 100 : 0);
      });

      const candidates = Object.entries(byTopic)
        .map(([id, t]) => ({ id, ...t, accuracy: avg(t.vals) }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 6); // weakest 6 topics from this test

      // Enrich each weak topic with an all-time trend + sparkline history
      const weakTopics = await Promise.all(candidates.map(async (t) => {
        const { data: histQ } = await supabase.from("questions").select("id").eq("topic_id", t.id);
        const histQIds = (histQ || []).map(q => q.id);

        let trend = "steady", trendDelta = 0, history = [];
        if (histQIds.length) {
          const { data: histResp } = await supabase
            .from("user_question_responses")
            .select("is_correct, created_at")
            .eq("user_id", userId)
            .in("question_id", histQIds)
            .order("created_at", { ascending: true });

          if (histResp?.length >= 4) {
            const mid = Math.floor(histResp.length / 2);
            const early = avg(histResp.slice(0, mid).map(r => r.is_correct ? 100 : 0));
            const later = avg(histResp.slice(mid).map(r => r.is_correct ? 100 : 0));
            trendDelta = later - early;
            trend = trendDelta > 8 ? "improving" : trendDelta < -8 ? "declining" : "steady";
          }
          // Compact sparkline: bucket the full history into up to 8 points
          const n = histResp?.length || 0;
          const bucketSize = Math.max(1, Math.ceil(n / 8));
          for (let i = 0; i < n; i += bucketSize) {
            history.push(avg(histResp.slice(i, i + bucketSize).map(r => r.is_correct ? 100 : 0)));
          }
        }

        const difficultyBreakdown = Object.entries(t.byDifficulty)
          .map(([level, vals]) => ({ level, accuracy: avg(vals), count: vals.length }));

        return {
          topic: t.name,
          accuracy: t.accuracy,
          questionsInTest: t.vals.length,
          trend, trendDelta, history,
          difficultyBreakdown,
        };
      }));

      setData({ sections, weakTopics });
    } catch (err) {
      console.error("[deep-dive] error:", err.message, err);
      setError(err.message || "Failed to load test analysis");
    } finally {
      setLoading(false);
    }
  }, [userId, attemptId]);

  useEffect(() => { fetchDeepDive(); }, [fetchDeepDive]);
  return { data, loading, error };
}

// ── Helpers ──────────────────────────────────────────────────────
function avg(arr) { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0; }
function max(arr) { return arr.length ? Math.round(Math.max(...arr)) : 0; }

function fillLast7Days(countsByDate, defaultTarget, targetByDate = {}) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = localDateKey(d);
    return {
      day: dayNames[d.getDay()],
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      done: countsByDate[dateStr] || 0,
      target: targetByDate[dateStr] ?? defaultTarget,
    };
  });
}

function build31DayCalendar(countsByDate, defaultTarget, targetByDate = {}) {
  return Array.from({ length: 31 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (30 - i));
    const dateStr = localDateKey(d);
    const target = targetByDate[dateStr] ?? defaultTarget;
    return (countsByDate[dateStr] || 0) >= target ? 1 : 0;
  });
}

function calculateStreak(countsByDate, defaultTarget, targetByDate = {}) {
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateKey(d);
    const target = targetByDate[dateStr] ?? defaultTarget;
    if ((countsByDate[dateStr] || 0) >= target) streak++;
    else break;
  }
  return streak;
}
