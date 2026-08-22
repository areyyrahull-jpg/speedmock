// services/usePractice.js - WIRED TO YOUR SUPABASE SCHEMA
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { useGoal } from "../context/GoalContext"; // ← adjust path to match your project structure

/**
 * Resolves an exam code like "cgl" or "ssc-cgl" → actual UUID from exams table.
 * Caches in memory so repeated calls don't hit the DB.
 */
// Hardcoded exam code → UUID map (from your Supabase exams table)
// No DB query needed — these UUIDs never change
const EXAM_UUID_MAP = {
  "cgl":    "e529465e-8b5c-4246-b5a8-450776867dbb",
  "chsl":   "6ccd898f-7cbc-4292-abd0-47a4a6c2b7d0",
  "cpo":    "545ba185-42d0-4295-895e-91931e198c6a",
  "mts":    "977e9c47-04f1-4f9d-b453-619b13a286c1",
  "gd":     "ad11c111-d4dd-4e43-973b-bc12f53fc6e1",
  "ntpc":   "4c7c3f8b-471e-4df8-951c-6ea04c16efac",
  "groupd": "03a2b7f0-e6c0-497d-b299-0c71666a53d4",
  "alp":    "281117c7-4878-4a98-8746-54931b11c6bc",
  "je":     "b336a62d-223f-44fd-b388-190d97d206ba",
};
// Add this near the top of usePractice.js, below EXAM_UUID_MAP
const SUBJECT_CODE_ALIAS = {
  "qa":        "QUANT",
  "quant":     "QUANT",
  "maths":     "QUANT",
  "math":      "QUANT",
  "reasoning": "REASONING",
  "gi":        "REASONING",
  "english":   "ENGLISH",
  "eng":       "ENGLISH",
  "ga":        "GA",
  "gk":        "GA",
  "gen_sci":   "GEN_SCI",
};

function resolveSubjectCode(code) {
  if (!code) return null;
  const lower = code.toLowerCase();
  return SUBJECT_CODE_ALIAS[lower] || code.toUpperCase();
}

function resolveExamUuid(examId) {
  if (!examId) return null;
  // Already a UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(examId)) return examId;
  const uuid = EXAM_UUID_MAP[examId.toLowerCase()];
  if (!uuid) throw new Error(`Unknown exam code: ${examId}`);
  return uuid;
}

/**
 * Fetch subjects for an exam from your database
 */
export function useSubjects(examId) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);

        // Resolve exam code → UUID (examId may be "cgl", "ntpc" etc.)
        const examUuid = await resolveExamUuid(examId);

        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, subject_code, subject_name, marks, display_order")
          .eq("exam_id", examUuid)
          .order("display_order", { ascending: true });

        if (subjectsError) throw subjectsError;

        const subjectIds = subjectsData.map((s) => s.id);

        // Real published question count per subject (don't trust the stored counter column)
        const { data: questionRows, error: qError } = await supabase
          .from("questions")
          .select("id, subject_id")
          .eq("status", "PUBLISHED")
          .in("subject_id", subjectIds);

        if (qError) throw qError;

        const questionCountBySubject = {};
        (questionRows || []).forEach((q) => {
          questionCountBySubject[q.subject_id] = (questionCountBySubject[q.subject_id] || 0) + 1;
        });

        // Real topic count per subject
        const { data: topicRows, error: tError } = await supabase
          .from("topics")
          .select("id, subject_id")
          .in("subject_id", subjectIds);

        if (tError) throw tError;

        const topicCountBySubject = {};
        (topicRows || []).forEach((t) => {
          topicCountBySubject[t.subject_id] = (topicCountBySubject[t.subject_id] || 0) + 1;
        });

        // Transform to match your UI format
        const transformed = subjectsData.map((s) => ({
          id: s.id,
          code: s.subject_code,
          name: s.subject_name,
          marks: s.marks,
          question_count: questionCountBySubject[s.id] || 0,
          topic_count: topicCountBySubject[s.id] || 0,
          display_order: s.display_order,
        }));

        setSubjects(transformed);
      } catch (err) {
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [examId]);

  return { subjects, loading, error };
}

/**
 * Fetch topics for a subject from your database.
 * `tier` ("1" | "2" | null) filters which questions count toward each topic's
 * totals — a question with tier IS NULL applies to both tiers.
 */
export function useTopics(examId, subjectCode, tier = null) {
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId || !subjectCode) return;

    const fetchTopics = async () => {
      try {
        setLoading(true);
        const examUuid = await resolveExamUuid(examId);

        // Get subject by exam UUID + subject code
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("id, subject_name, subject_code, marks")
          .eq("exam_id", examUuid)
          .eq("subject_code", resolveSubjectCode(subjectCode))
          .single();

        if (subjectError) throw subjectError;

        setSubject({
          id: subjectData.id,
          name: subjectData.subject_name,
          code: subjectData.subject_code,
          marks: subjectData.marks,
        });

        // Get topics for this subject (basic info only — counts come from real data below)
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("id, topic_name, topic_code, display_order")
          .eq("subject_id", subjectData.id)
          .order("display_order", { ascending: true });

        if (topicsError) throw topicsError;

        const topicIds = topicsData.map((t) => t.id);

        // Real published questions for this subject, so counts are always accurate
        // and respect the selected tier (tier IS NULL = applies to both tiers).
        const { data: questionRows, error: qError } = await supabase
          .from("questions")
          .select("id, topic_id, tier")
          .eq("subject_id", subjectData.id)
          .eq("status", "PUBLISHED");

        if (qError) throw qError;

        const tierLabel = tier ? `Tier-${tier}` : null;
        const relevantQuestions = tierLabel
          ? (questionRows || []).filter((q) => q.tier == null || q.tier === tierLabel)
          : (questionRows || []);

        const questionIdsByTopic = {};
        relevantQuestions.forEach((q) => {
          if (!questionIdsByTopic[q.topic_id]) questionIdsByTopic[q.topic_id] = new Set();
          questionIdsByTopic[q.topic_id].add(q.id);
        });

        // Real attempted/correct counts for the logged-in user
        const attemptedByTopic = {}; // topicId -> { questionId -> lastIsCorrect }
        const userStr = localStorage.getItem("speedmock_user");
        const user = userStr ? JSON.parse(userStr) : null;

        if (user && topicIds.length) {
          const { data: attempts, error: attemptsError } = await supabase
            .from("practice_attempts")
            .select("question_id, topic_id, is_correct")
            .eq("user_id", user.id)
            .in("topic_id", topicIds);

          if (attemptsError) throw attemptsError;

          (attempts || []).forEach((a) => {
            if (!attemptedByTopic[a.topic_id]) attemptedByTopic[a.topic_id] = {};
            attemptedByTopic[a.topic_id][a.question_id] = a.is_correct;
          });
        }

        const transformed = topicsData.map((t) => {
          const qIds = questionIdsByTopic[t.id] || new Set();
          const attemptsForTopic = attemptedByTopic[t.id] || {};

          let attempted_count = 0;
          let correct_count = 0;
          qIds.forEach((qid) => {
            if (qid in attemptsForTopic) {
              attempted_count += 1;
              if (attemptsForTopic[qid]) correct_count += 1;
            }
          });

          return {
            id: t.id,
            name: t.topic_name,
            code: t.topic_code,
            question_count: qIds.size,
            attempted_count,
            correct_count,
          };
        });

        setTopics(transformed);
      } catch (err) {
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [examId, subjectCode, tier]);

  return { subject, topics, loading, error };
}

/**
 * Fetch questions for a topic from your database
 */
export function useQuestions(topicId, language = "en", tier = null) {
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [previousAttempts, setPreviousAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topicId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);

        // Get current user from localStorage (your app uses JWT auth, not Supabase Auth)
        const userStr = localStorage.getItem("speedmock_user");
        const user = userStr ? JSON.parse(userStr) : null;

        // Get topic info
        const { data: topicData, error: topicError } = await supabase
          .from("topics")
          .select(`
            id,
            topic_name,
            topic_code,
            subject_id,
            subjects:subject_id(id, subject_name)
          `)
          .eq("id", topicId)
          .single();

        if (topicError) throw topicError;

        setTopic({
          id: topicData.id,
          name: topicData.topic_name,
          code: topicData.topic_code,
          subject_name: topicData.subjects.subject_name,
        });

        // Fetch Hindi columns only when needed to save bandwidth
        const hiCols = language === "hi"
          ? `, question_text_hi, option_a_hi, option_b_hi, option_c_hi, option_d_hi, explanation_hi`
          : "";

        // Get questions for this topic - your questions table structure
        let query = supabase
          .from("questions")
          .select(`id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, marks, question_type, tier${hiCols}`)
          .eq("topic_id", topicId)
          .eq("status", "PUBLISHED");

        // tier IS NULL = applies to both tiers, so always included alongside the selected tier
        if (tier) {
          query = query.or(`tier.is.null,tier.eq.Tier-${tier}`);
        }

        const { data: questionsData, error: questionsError } = await query
          .order("created_at", { ascending: true });

        if (questionsError) throw questionsError;

        // Helper: pick Hindi if available, fall back to English silently
        const pick = (q, hiKey, enKey) =>
          (language === "hi" && q[hiKey]) ? q[hiKey] : q[enKey];

        // Transform questions - match your format
        const transformedQuestions = questionsData.map((q) => ({
          id: q.id,
          question_text: pick(q, "question_text_hi", "question_text"),
          question_text_en: q.question_text, // keep EN text for bookmark lookup
          options: [
            pick(q, "option_a_hi", "option_a"),
            pick(q, "option_b_hi", "option_b"),
            pick(q, "option_c_hi", "option_c"),
            pick(q, "option_d_hi", "option_d"),
          ].filter(Boolean),
          correct_index: q.correct_option ? q.correct_option.charCodeAt(0) - 65 : 0,
          correct_option: q.correct_option,
          difficulty: q.difficulty.toLowerCase(),
          explanation: pick(q, "explanation_hi", "explanation"),
          marks: q.marks || 1,
          question_type: q.question_type || "MCQ",
        }));

        setQuestions(transformedQuestions);

        // Get previous attempts if user is logged in
        if (user) {
          const { data: attempts, error: attemptsError } = await supabase
            .from("practice_attempts")
            .select("question_id, is_correct")
            .eq("user_id", user.id)
            .eq("topic_id", topicId)
            .in(
              "question_id",
              questionsData.map((q) => q.id)
            );

          if (!attemptsError && attempts) {
            const attemptsMap = {};
            attempts.forEach((a) => {
              attemptsMap[a.question_id] = a.is_correct ? "correct" : "incorrect";
            });
            setPreviousAttempts(attemptsMap);
          }
        }
      } catch (err) {
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topicId, language, tier]); // re-fetch when language or tier changes

  return { topic, questions, previousAttempts, loading, error };
}

/**
 * Log a question attempt to your practice_attempts table
 */
export function useLogAttempt() {
  const { incrementGoal } = useGoal();

  return useCallback(
    async ({ questionId, topicId, isCorrect, timeTakenSec }) => {
      try {
        const user = (() => { try { return JSON.parse(localStorage.getItem("speedmock_user")); } catch { return null; } })();
        if (!user) return;

        // Your practice_attempts table structure
        const { error } = await supabase.from("practice_attempts").insert([
          {
            user_id: user.id,
            question_id: questionId,
            topic_id: topicId,
            is_correct: isCorrect,
            time_taken_sec: timeTakenSec ?? null,
            attempted_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        // Count this toward today's daily goal too — this was the same
        // missing link as the test-taking flow: incrementGoal() existed
        // in GoalContext but nothing calling this hook ever invoked it.
        incrementGoal(1);
      } catch (err) {
        
      }
    },
    [incrementGoal]
  );
}

/**
 * Bookmark management - uses your user_bookmarks table
 */
export function useBookmark() {
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const user = (() => { try { return JSON.parse(localStorage.getItem("speedmock_user")); } catch { return null; } })();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch the bookmarked question IDs for the logged-in user
        const { data, error } = await supabase
          .from("user_bookmarks")
          .select("question_id")
          .eq("user_id", user.id);

        if (error) throw error;

        const bookmarkedSet = new Set((data || []).map((b) => b.question_id));
        setBookmarked(bookmarkedSet);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const toggle = useCallback(
    async (questionIdOrText, questionText) => {
      try {
        const user = (() => { try { return JSON.parse(localStorage.getItem("speedmock_user")); } catch { return null; } })();
        if (!user) return;

        // Decide by checking whether the first argument IS a real UUID —
        // not by whether a second argument happens to be present. Previously,
        // any caller that passed a falsy/undefined second argument (even by
        // accident) would cause this to treat a valid question ID as search
        // TEXT instead, silently failing every bookmark save.
        let questionId = null;
        let textToFind = null;
        if (UUID_RE.test(questionIdOrText || "")) {
          questionId = questionIdOrText;
        } else {
          textToFind = questionIdOrText;
        }

        if (!questionId && textToFind) {
          const { data: question, error: findError } = await supabase
            .from("questions")
            .select("id")
            .eq("question_text", textToFind)
            .single();

          if (findError) {
            
            return;
          }

          questionId = question?.id;
        }

        if (!questionId) {
          
          return;
        }

        const isBookmarked = bookmarked.has(questionId);

        if (isBookmarked) {
          const { error } = await supabase
            .from("user_bookmarks")
            .delete()
            .eq("user_id", user.id)
            .eq("question_id", questionId);

          if (error) throw error;
          setBookmarked((prev) => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
        } else {
          const { error } = await supabase.from("user_bookmarks").insert([
            {
              user_id: user.id,
              question_id: questionId,
              created_at: new Date().toISOString(),
            },
          ]);

          if (error && error.code !== "23505") {
            throw error;
          }

          setBookmarked((prev) => {
            const next = new Set(prev);
            next.add(questionId);
            return next;
          });
        }
      } catch (err) {
        
      }
    },
    [bookmarked]
  );

  return { bookmarked, toggle, loading };
}

/**
 * Get all bookmarks for a user - uses your user_bookmarks table
 */
export function useAllBookmarks() {
  const [bookmarks, setBookmarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const user = (() => { try { return JSON.parse(localStorage.getItem("speedmock_user")); } catch { return null; } })();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch from your user_bookmarks with question and subject details
        const { data: bookmarksData, error: bookmarkError } = await supabase
          .from("user_bookmarks")
          .select(`
            id,
            created_at,
            questions:question_id(
              id,
              question_text,
              subject_id,
              topic_id,
              difficulty,
              explanation,
              option_a,
              option_b,
              option_c,
              option_d,
              correct_option,
              marks,
              subjects:subject_id(
                id,
                subject_name,
                subject_code
              ),
              topics:topic_id(
                id,
                topic_name
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (bookmarkError) throw bookmarkError;

        // Group by subject
        const groupedBySubject = {};
        (bookmarksData || []).forEach((bookmark) => {
          const q = bookmark.questions;
          const subject = q.subjects;
          const subjectId = q.subject_id;

          if (!groupedBySubject[subjectId]) {
            groupedBySubject[subjectId] = {
              id: subjectId,
              name: subject.subject_name,
              code: subject.subject_code,
              questions: [],
            };
          }

          groupedBySubject[subjectId].questions.push({
            id: q.id,
            text: q.question_text,
            subject: subject.subject_name,
            topic: q.topics?.topic_name || "General",
            difficulty: q.difficulty.toLowerCase(),
            explanation: q.explanation,
            options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
            answer: (q.correct_option || "A").charCodeAt(0) - 65,
            correct_option: q.correct_option,
            marks: q.marks || 1,
            tags: [q.topics?.topic_name || "General", q.difficulty],
          });
        });

        setBookmarks(groupedBySubject);
      } catch (err) {
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  return { bookmarks, loading, error };
}
