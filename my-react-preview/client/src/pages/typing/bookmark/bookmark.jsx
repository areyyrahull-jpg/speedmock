import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import "./../../../styles/themetoggle.css";
import "./bookmarks.css";

const THEME_STORAGE_KEY = "bookmarks-pq-theme";
const THEME_OPTIONS = [
  { value: "light", icon: "☀️", label: "Light theme" },
  { value: "dark", icon: "🌙", label: "Dark theme" },
  { value: "yellow", icon: "💡", label: "Warm light theme" },
];

/**
 * Local, self-contained theme state — matches the contract documented
 * in themetoggle.css exactly (values: "dark" | "light" | "yellow").
 * If you already have a shared usePqTheme hook / PqThemeToggle component
 * elsewhere in the app, swap this out for that import instead so state
 * stays in sync across pages.
 */
function usePqTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors (e.g. private browsing) */
    }
  }, [theme]);

  return [theme, setTheme];
}

function PqThemeToggle({ theme, setTheme }) {
  return (
    <div className="pq-theme-toggle">
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`pq-theme-btn ${theme === opt.value ? "active" : ""}`}
          onClick={() => setTheme(opt.value)}
          aria-label={opt.label}
          aria-pressed={theme === opt.value}
          title={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

const SOURCE = {
  PRACTICE: "practice",
  PYQ: "pyq",
  OTHER: "other", // legacy `bookmarks` table rows saved without a question_id
};

const SOURCE_LABEL = {
  [SOURCE.PRACTICE]: "Practice Bank",
  [SOURCE.PYQ]: "PYQ",
  [SOURCE.OTHER]: "Saved Question",
};

/**
 * Normalize a row from `user_bookmarks` (joined to `questions`) into the
 * shape used throughout this page. Practice-bank and PYQ questions both
 * live in the `questions` table and are distinguished by `is_pyq`.
 */
function normalizeStructuredBookmark(bookmark) {
  const q = bookmark.questions;
  if (!q) return null;
  const subject = q.subjects;

  return {
    key: `ub:${bookmark.id}`,
    bookmarkRowId: bookmark.id,
    bookmarkTable: "user_bookmarks",
    question_id: q.id,
    source: q.is_pyq ? SOURCE.PYQ : SOURCE.PRACTICE,
    pyq_year: q.pyq_year || null,
    subject_id: q.subject_id || "other",
    subject: subject?.subject_name || "General",
    subject_code: subject?.subject_code || "",
    topic: q.topics?.topic_name || "General",
    text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
    answer: q.correct_option ? q.correct_option.toUpperCase().charCodeAt(0) - 65 : null,
    correct_option: q.correct_option,
    explanation: q.explanation,
    difficulty: (q.difficulty || "medium").toString().toLowerCase(),
    marks: q.marks || 1,
    created_at: bookmark.created_at,
  };
}

/**
 * Normalize a row from the legacy `bookmarks` table. These only ever
 * stored raw text + topic, so there's no options/answer to quiz on.
 */
function normalizeLegacyBookmark(row) {
  return {
    key: `lb:${row.id}`,
    bookmarkRowId: row.id,
    bookmarkTable: "bookmarks",
    question_id: null,
    source: SOURCE.OTHER,
    pyq_year: null,
    subject_id: "other",
    subject: row.topic || "Other Saved Questions",
    subject_code: "",
    topic: row.topic || "General",
    text: row.question_text,
    options: [],
    answer: null,
    correct_option: null,
    explanation: null,
    difficulty: null,
    marks: null,
    created_at: row.saved_at,
  };
}

function sourceBadgeClass(source) {
  if (source === SOURCE.PYQ) return "source-pyq";
  if (source === SOURCE.OTHER) return "source-other";
  return "source-practice";
}

function accentVar(source) {
  if (source === SOURCE.PYQ) return "var(--bp-pyq)";
  if (source === SOURCE.OTHER) return "var(--bp-other)";
  return "var(--bp-accent)";
}

/**
 * Question Viewer Modal
 */
function QuestionViewer({ question, onClose, onRemoveBookmark, onPrev, onNext, hasPrev, hasNext, index, total }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [question.key]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasPrev, hasNext, onClose, onPrev, onNext]);

  const handleOption = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  const hasQuizData = question.options && question.options.length > 0;

  return (
    <div className="bp-modal-overlay" onClick={onClose}>
      <div className="bp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bp-modal-head">
          <span className="bp-modal-progress">Q{index + 1} of {total}</span>
          <button className="bp-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="bp-modal-subject">
          <div className="bp-modal-bar" style={{ background: accentVar(question.source) }} />
          <h3 className="bp-modal-subject-name">{question.subject}</h3>
        </div>

        <p className="bp-modal-question">{question.text}</p>

        <div className="bp-tags" style={{ marginBottom: 20 }}>
          <span className={`bp-badge ${sourceBadgeClass(question.source)}`}>
            {SOURCE_LABEL[question.source]}{question.pyq_year ? ` · ${question.pyq_year}` : ""}
          </span>
          {question.topic && <span className="bp-tag">{question.topic}</span>}
          {question.difficulty && (
            <span className={`bp-tag difficulty-${question.difficulty}`}>{question.difficulty}</span>
          )}
        </div>

        {hasQuizData ? (
          <>
            <div style={{ marginBottom: 20 }}>
              {question.options.map((opt, i) => {
                let stateClass = "";
                if (revealed) {
                  if (i === question.answer) stateClass = "correct";
                  else if (i === selected) stateClass = "incorrect";
                } else if (i === selected) {
                  stateClass = "selected";
                }
                return (
                  <div
                    key={i}
                    onClick={() => handleOption(i)}
                    className={`bp-option ${revealed ? "revealed" : ""} ${stateClass}`}
                  >
                    <span className="bp-option-letter">{String.fromCharCode(65 + i)}.</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>

            {revealed && question.explanation && (
              <div className="bp-explanation">
                <p><strong>Explanation: </strong>{question.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bp-legacy-note">
            This bookmark was saved without answer options attached, so it can't be quizzed here — it's shown for reference only.
          </div>
        )}

        <div className="bp-modal-nav">
          <button className="bp-nav-btn" onClick={onPrev} disabled={!hasPrev}>← Prev</button>
          <button className="bp-nav-remove" onClick={onRemoveBookmark}>Remove Bookmark</button>
          <button className="bp-nav-btn" onClick={onNext} disabled={!hasNext}>Next →</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Bookmark Page
 */
export default function BookmarkPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [theme, setTheme] = usePqTheme();

  const [allQuestions, setAllQuestions] = useState([]); // flat normalized list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerKey, setViewerKey] = useState(null);
  const [filter, setFilter] = useState("all"); // all | practice | pyq | other

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        if (!isAuthenticated || !user) {
          setLoading(false);
          return;
        }

        const [structuredRes, legacyRes] = await Promise.all([
          supabase
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
                is_pyq,
                pyq_year,
                subjects:subject_id( id, subject_name, subject_code ),
                topics:topic_id( id, topic_name )
              )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("bookmarks")
            .select("id, question_text, topic, saved_at")
            .eq("user_id", user.id)
            .order("saved_at", { ascending: false }),
        ]);

        if (structuredRes.error) throw structuredRes.error;
        if (legacyRes.error) throw legacyRes.error;

        const structured = (structuredRes.data || [])
          .map(normalizeStructuredBookmark)
          .filter(Boolean);
        const legacy = (legacyRes.data || []).map(normalizeLegacyBookmark);

        setAllQuestions([...structured, ...legacy]);
      } catch (err) {
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated, user]);

  const handleRemoveBookmark = useCallback(async (question) => {
    try {
      if (!user) return;

      const { error: delErr } = await supabase
        .from(question.bookmarkTable)
        .delete()
        .eq("id", question.bookmarkRowId)
        .eq("user_id", user.id);

      if (delErr) throw delErr;

      setAllQuestions((prev) => prev.filter((q) => q.key !== question.key));
      setViewerKey(null);
    } catch (err) {
      
      setError(err.message);
    }
  }, [user]);

  // ---- derived data ----

  const counts = useMemo(() => {
    const c = { all: allQuestions.length, practice: 0, pyq: 0, other: 0 };
    allQuestions.forEach((q) => { c[q.source] += 1; });
    return c;
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    if (filter === "all") return allQuestions;
    return allQuestions.filter((q) => q.source === filter);
  }, [allQuestions, filter]);

  const subjects = useMemo(() => {
    const grouped = {};
    filteredQuestions.forEach((q) => {
      const id = q.subject_id;
      if (!grouped[id]) {
        grouped[id] = { id, name: q.subject, questions: [] };
      }
      grouped[id].questions.push(q);
    });
    return Object.values(grouped).sort((a, b) => b.questions.length - a.questions.length);
  }, [filteredQuestions]);

  const viewerList = useMemo(() => {
    if (!viewerKey) return null;
    const subject = subjects.find((s) => s.questions.some((q) => q.key === viewerKey));
    return subject ? subject.questions : null;
  }, [viewerKey, subjects]);

  const viewerIndex = viewerList ? viewerList.findIndex((q) => q.key === viewerKey) : -1;
  const viewerQuestion = viewerIndex >= 0 ? viewerList[viewerIndex] : null;

  // ---- render states ----

  if (!isAuthenticated) {
    return (
      <div className="theme-scope bookmarks-page" data-pqtheme={theme}>
        <div className="bp-state">
          <h2 className="bp-state-title">Please log in to view bookmarks</h2>
          <button className="bp-btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="theme-scope bookmarks-page" data-pqtheme={theme}>
        <div className="bp-content">
          <div className="bp-top-row"><button className="bp-back" onClick={() => navigate(-1)}>← Back</button></div>
          <div className="bp-skeleton" />
          <div className="bp-skeleton" />
          <div className="bp-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-scope bookmarks-page" data-pqtheme={theme}>
        <div className="bp-state">
          <h2 className="bp-state-title">Something went wrong</h2>
          <p className="bp-state-body">{error}</p>
          <button className="bp-btn-primary" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="theme-scope bookmarks-page" data-pqtheme={theme}>
        <div className="bp-state">
          <h2 className="bp-state-title">No bookmarks yet</h2>
          <p className="bp-state-body">Bookmark questions while practicing or reviewing PYQs to build a personal revision list here.</p>
          <button className="bp-btn-primary" onClick={() => navigate("/practice")}>Start Practicing</button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-scope bookmarks-page" data-pqtheme={theme}>
      <div className="bp-content">
        <div className="bp-top-row">
          <button className="bp-back" onClick={() => navigate(-1)}>← Back</button>
          <PqThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        <div className="bp-hero">
          <p className="bp-eyebrow">Revision List</p>
          <h1 className="bp-title">Bookmarks</h1>
          <p className="bp-subtitle">{counts.all} question{counts.all !== 1 ? "s" : ""} saved for review</p>

          <div className="bp-stats">
            <div className="bp-stat">
              <div className="bp-stat-value">{counts.practice}</div>
              <div className="bp-stat-label"><span className="bp-stat-dot" style={{ background: "var(--bp-accent)" }} />Practice Bank</div>
            </div>
            <div className="bp-stat">
              <div className="bp-stat-value">{counts.pyq}</div>
              <div className="bp-stat-label"><span className="bp-stat-dot" style={{ background: "var(--bp-pyq)" }} />Previous Year</div>
            </div>
            {counts.other > 0 && (
              <div className="bp-stat">
                <div className="bp-stat-value">{counts.other}</div>
                <div className="bp-stat-label"><span className="bp-stat-dot" style={{ background: "var(--bp-other)" }} />Other Saved</div>
              </div>
            )}
          </div>
        </div>

        <div className="bp-filters">
          {[
            ["all", "All"],
            ["practice", "Practice Bank"],
            ["pyq", "PYQ"],
            ...(counts.other > 0 ? [["other", "Other"]] : []),
          ].map(([key, label]) => (
            <button
              key={key}
              className={`bp-chip ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label} <span className="bp-chip-count">{counts[key]}</span>
            </button>
          ))}
        </div>

        {subjects.map((subject) => {
          const easy = subject.questions.filter((q) => q.difficulty === "easy").length;
          const medium = subject.questions.filter((q) => q.difficulty === "medium").length;
          const hard = subject.questions.filter((q) => q.difficulty === "hard").length;
          const graded = easy + medium + hard || 1;

          return (
            <div key={subject.id} className="bp-subject">
              <div className="bp-subject-head">
                <h2 className="bp-subject-name">{subject.name}</h2>
                <div className="bp-subject-bar" aria-hidden="true">
                  <span className="easy" style={{ width: `${(easy / graded) * 100}%` }} />
                  <span className="medium" style={{ width: `${(medium / graded) * 100}%` }} />
                  <span className="hard" style={{ width: `${(hard / graded) * 100}%` }} />
                </div>
                <span className="bp-subject-count">{subject.questions.length} question{subject.questions.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="bp-cards">
                {subject.questions.map((question) => (
                  <div
                    key={question.key}
                    className={`bp-card ${question.source}`}
                    onClick={() => setViewerKey(question.key)}
                  >
                    <div className="bp-card-body">
                      <p className="bp-card-text">{question.text}</p>
                      <div className="bp-tags">
                        <span className={`bp-badge ${sourceBadgeClass(question.source)}`}>
                          {SOURCE_LABEL[question.source]}{question.pyq_year ? ` · ${question.pyq_year}` : ""}
                        </span>
                        {question.topic && <span className="bp-tag">{question.topic}</span>}
                        {question.difficulty && (
                          <span className={`bp-tag difficulty-${question.difficulty}`}>{question.difficulty}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="bp-remove"
                      onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(question); }}
                      title="Remove bookmark"
                      aria-label="Remove bookmark"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {viewerQuestion && viewerList && (
        <QuestionViewer
          question={viewerQuestion}
          index={viewerIndex}
          total={viewerList.length}
          hasPrev={viewerIndex > 0}
          hasNext={viewerIndex < viewerList.length - 1}
          onClose={() => setViewerKey(null)}
          onPrev={() => setViewerKey(viewerList[viewerIndex - 1].key)}
          onNext={() => setViewerKey(viewerList[viewerIndex + 1].key)}
          onRemoveBookmark={() => handleRemoveBookmark(viewerQuestion)}
        />
      )}
    </div>
  );
}
