// PracticeSession.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuestions, useLogAttempt, useBookmark } from "../../services/usePractice";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import "./practice.css";

const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" };

export default function PracticeSession() {
  const { examId, subjectCode, topicId } = useParams();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier"); // "1" | "2" | null (non-tiered exams)
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const { topic, questions, previousAttempts, loading, error } = useQuestions(topicId, language, tier);
  const logAttempt = useLogAttempt();
  const { bookmarked, toggle: toggleBookmark } = useBookmark();

  const [index, setIndex]           = useState(0);
  const [selected, setSelected]     = useState(null);
  const [revealed, setRevealed]     = useState(false);
  const [statusByQ, setStatusByQ]   = useState({});
  const [timerOn, setTimerOn]       = useState(true);
  const [seconds, setSeconds]       = useState(0);
  const [streak, setStreak]         = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stamp, setStamp]           = useState(null); // "correct" | "incorrect" | null, briefly shown
  const [showSummary, setShowSummary] = useState(false);
  const intervalRef = useRef(null);
  const [theme, setTheme] = usePqTheme();

  const current = questions[index];

  // ── Resume previous progress ────────────────────────────────
  useEffect(() => {
    if (!questions.length) return;
    if (!Object.keys(previousAttempts).length) return;

    setStatusByQ(prev => {
      if (Object.keys(prev).length) return prev;
      return { ...previousAttempts };
    });

    const firstUnattemptedIndex = questions.findIndex(q => previousAttempts[q.id] == null);
    const resumeIndex = firstUnattemptedIndex === -1 ? questions.length - 1 : firstUnattemptedIndex;
    setIndex(resumeIndex);
    setRevealed(previousAttempts[questions[resumeIndex]?.id] != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, previousAttempts]);

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    setSeconds(0);
    clearInterval(intervalRef.current);
    if (timerOn) intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [index, timerOn]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleSelect = useCallback((optionIndex) => {
    if (revealed || !current) return;
    clearInterval(intervalRef.current);
    const isCorrect = optionIndex === current.correct_index;

    setSelected(optionIndex);
    setRevealed(true);
    setStatusByQ(prev => ({ ...prev, [current.id]: isCorrect ? "correct" : "incorrect" }));
    setStamp(isCorrect ? "correct" : "incorrect");
    setTimeout(() => setStamp(null), 700);

    setStreak(prev => {
      const next = isCorrect ? prev + 1 : 0;
      setBestStreak(b => Math.max(b, next));
      return next;
    });

    logAttempt({
      questionId: current.id,
      topicId,
      isCorrect,
      timeTakenSec: timerOn ? seconds : null,
    });
  }, [revealed, current, timerOn, seconds, topicId, logAttempt]);

  const goTo = useCallback((i) => {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
    setSelected(null);
    setRevealed(statusByQ[questions[i]?.id] != null);
  }, [questions, statusByQ]);

  const handleNext = () => {
    if (index === questions.length - 1) {
      setShowSummary(true);
    } else {
      goTo(index + 1);
    }
  };

  if (loading) return <div className="pq-loading">Loading questions…</div>;
  if (error)   return <div className="pq-error">Couldn't load questions: {error}</div>;
  if (!questions.length) return <div className="pq-error">No questions in this topic yet.</div>;

  const answeredCount = Object.keys(statusByQ).length;
  const correctCount = Object.values(statusByQ).filter(s => s === "correct").length;
  const allAnswered = answeredCount === questions.length;

  if (showSummary) {
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    return (
      <div className="pq-session" data-pqtheme={theme}>
        <div className="pq-summary-card">
          <div className="pq-summary-icon">{accuracy >= 70 ? "🎯" : accuracy >= 40 ? "📈" : "💪"}</div>
          <h1 className="pq-summary-title">{topic?.name} — done.</h1>
          <p className="pq-summary-sub">
            {accuracy >= 70 ? "Strong accuracy — that's exam-ready form." :
             accuracy >= 40 ? "Solid attempt. A second pass will sharpen this." :
             "Good start — this is exactly what practice is for."}
          </p>
          <div className="pq-summary-stats">
            <div className="pq-summary-stat"><div className="pq-summary-num">{correctCount}/{answeredCount}</div><div>Correct</div></div>
            <div className="pq-summary-stat"><div className="pq-summary-num">{accuracy}%</div><div>Accuracy</div></div>
            <div className="pq-summary-stat"><div className="pq-summary-num">{bestStreak}</div><div>Best streak</div></div>
          </div>
          <div className="pq-summary-actions">
            <button className="pq-btn-ghost" onClick={() => navigate(`/practice/${examId}/${subjectCode}`)}>Back to topics</button>
            <button className="pq-btn-primary" onClick={() => { setShowSummary(false); goTo(0); }}>Review answers</button>
          </div>
        </div>
      </div>
    );
  }

  const diffClass = `pq-diff-${current.difficulty}`;
  const isBookmarked = bookmarked.has(current.id);

  return (
    <div className="pq-session" data-pqtheme={theme}>
      <div className="pq-content">
      <div className="pq-top-row">
        <button className="pq-back" onClick={() => navigate(`/practice/${examId}/${subjectCode}`)}>Back to Topics</button>
        <PqThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="pq-session-layout">
        {/* ── MAIN ── */}
        <div className="pq-main">
          <div className="pq-toolbar">
            <div className="pq-toolbar-left">
              <span className="pq-topic-title">{topic?.subject_name} · {topic?.name}</span>
              {streak >= 2 && (
                <span className="pq-streak">
                  <span className="pq-streak-flame">🔥</span>{streak} streak
                </span>
              )}
            </div>

            <div className="pq-toolbar-right">
              <label className="pq-timer-toggle">
                <input type="checkbox" checked={timerOn} onChange={() => setTimerOn(v => !v)} />
                Timer
              </label>
              {timerOn && <span className="pq-timer-display">{formatTime(seconds)}</span>}
              <button
                className={`pq-bookmark-btn${isBookmarked ? " active" : ""}`}
                onClick={() => toggleBookmark(current.id, current.question_text_en || current.question_text)}
                title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
              >
                {isBookmarked ? "🔖" : "📑"}
              </button>
              <div className="ts-lang-pill">
                <button className={`ts-lang-btn${language === "en" ? " active" : ""}`} onClick={() => setLanguage("en")}>EN</button>
                <button className={`ts-lang-btn${language === "hi" ? " active" : ""}`} onClick={() => setLanguage("hi")}>हि</button>
              </div>
            </div>
          </div>

          <div className="pq-progress-track">
            <div className="pq-progress-fill" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="pq-question-card" key={current.id}>
            {stamp && <div className={`pq-stamp pq-stamp-${stamp}`}>{stamp === "correct" ? "✓" : "✗"}</div>}

            <span className={`pq-difficulty-tag ${diffClass}`}>{DIFFICULTY_LABEL[current.difficulty]}</span>

            <div className="pq-question-text">
              <span className="pq-question-num">Q{index + 1}</span>
              {current.question_text}
            </div>

            <div className="pq-options">
              {current.options.map((opt, i) => {
                let cls = "pq-option";
                if (revealed) {
                  if (i === current.correct_index) cls += " correct";
                  else if (i === selected) cls += " incorrect";
                } else if (i === selected) {
                  cls += " selected";
                }
                return (
                  <div key={i} className={cls} onClick={() => handleSelect(i)}>
                    <span className="pq-option-letter">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </div>
                );
              })}
            </div>

            {revealed && current.explanation && (
              <div className="pq-explanation">
                <strong>{selected === current.correct_index ? "Correct. " : "Not quite. "}</strong>
                {current.explanation}
              </div>
            )}

            <div className="pq-nav-buttons">
              <button onClick={() => goTo(index - 1)} disabled={index === 0}>← Previous</button>
              <button className="pq-btn-primary" onClick={handleNext} disabled={!revealed}>
                {index === questions.length - 1 ? "Finish topic" : "Next →"}
              </button>
            </div>
          </div>
        </div>

        {/* ── SIDE PANEL: OMR-style answer sheet ── */}
        <div className="pq-side-panel">
          <div className="pq-side-header">
            <div className="pq-side-title">Answer Sheet</div>
            <div className="pq-side-score">{correctCount}/{answeredCount || 0}</div>
          </div>

          <div className="pq-omr-grid">
            {questions.map((q, i) => {
              const status = statusByQ[q.id];
              let cls = "pq-omr-bubble";
              if (i === index) cls += " current";
              if (status === "correct")   cls += " correct";
              if (status === "incorrect") cls += " incorrect";
              return (
                <div key={q.id} className={cls} onClick={() => goTo(i)}>
                  <span>{i + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="pq-side-legend">
            <div><span className="pq-legend-dot current" /> Current</div>
            <div><span className="pq-legend-dot correct" /> Correct</div>
            <div><span className="pq-legend-dot incorrect" /> Incorrect</div>
            <div><span className="pq-legend-dot" /> Unattempted</div>
          </div>

          {allAnswered && (
            <button className="pq-btn-primary pq-side-finish" onClick={() => setShowSummary(true)}>
              View summary →
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
