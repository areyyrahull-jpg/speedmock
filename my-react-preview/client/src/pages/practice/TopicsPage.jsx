// TopicsPage.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTopics } from "../../services/usePractice";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import "./practice.css";

// Exams that have a Tier 1 / Tier 2 structure. Others (MTS, GD, ALP, JE, etc.)
// have a single tier, so we skip the toggle for them entirely.
const TIERED_EXAMS = new Set(["cgl", "chsl", "ntpc"]);

export default function TopicsPage() {
  const { examId, subjectCode } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = usePqTheme();
  const [tier, setTier] = useState("1"); // "1" | "2" — which tier's questions to practice
  const hasTiers = TIERED_EXAMS.has(String(examId).toLowerCase());
  const { subject, topics, loading, error } = useTopics(examId, subjectCode, hasTiers ? tier : null);

  if (loading) return <div className="pq-loading">Loading topics…</div>;
  if (error)   return <div className="pq-error">Couldn't load topics: {error}</div>;

  const totalQ = topics.reduce((sum, t) => sum + t.question_count, 0);
  const totalAttempted = topics.reduce((sum, t) => sum + t.attempted_count, 0);

  return (
    <div className="pq-page" data-pqtheme={theme}>
      <div className="pq-content">
      <div className="pq-top-row">
        <button className="pq-back" onClick={() => navigate(`/practice/${examId}`)}>Back to Subjects</button>
        <PqThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="pq-hero">
        <div className="pq-hero-top">
          <div>
            <div className="pq-hero-eyebrow">{subject?.name}</div>
            <h1 className="pq-h1">Work through it, topic by topic.</h1>
          </div>
          {hasTiers && (
            <div className="pq-tier-toggle" role="tablist" aria-label="Select tier">
              <button
                type="button"
                className={`pq-tier-btn${tier === "1" ? " active" : ""}`}
                onClick={() => setTier("1")}
              >
                Tier 1
              </button>
              <button
                type="button"
                className={`pq-tier-btn${tier === "2" ? " active" : ""}`}
                onClick={() => setTier("2")}
              >
                Tier 2
              </button>
            </div>
          )}
        </div>
        {totalQ > 0 && (
          <p className="pq-sub">{totalAttempted} of {totalQ} questions attempted so far.</p>
        )}
      </div>

      {topics.length === 0 ? (
        <div className="pq-empty">
          <div className="pq-empty-icon">📭</div>
          <div className="pq-empty-title">No topics yet</div>
          <div className="pq-empty-body">This subject doesn't have any topics added yet.</div>
        </div>
      ) : (
        <div className="pq-topic-list">
          {topics.map((t, i) => {
            const pct = t.question_count > 0
              ? Math.round((t.attempted_count / t.question_count) * 100)
              : 0;
            const isComplete = pct === 100 && t.question_count > 0;
            const isStarted = t.attempted_count > 0 && !isComplete;

            return (
              <div
                key={t.id}
                className="pq-topic-row"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate(
                  hasTiers
                    ? `/practice/${examId}/${subjectCode}/${t.id}?tier=${tier}`
                    : `/practice/${examId}/${subjectCode}/${t.id}`
                )}
              >
                <div className="pq-topic-num">{String(i + 1).padStart(2, "0")}</div>

                <div className="pq-topic-info">
                  <div className="pq-topic-name">{t.name}</div>
                  <div className="pq-topic-meta">
                    {t.question_count} question{t.question_count !== 1 ? "s" : ""}
                    {t.attempted_count > 0 && ` · ${t.correct_count}/${t.attempted_count} correct`}
                  </div>
                </div>

                <div className="pq-topic-ring" style={{ "--pct": pct }}>
                  <svg viewBox="0 0 40 40">
                    <circle className="pq-ring-track" cx="20" cy="20" r="17" />
                    <circle className="pq-ring-fill" cx="20" cy="20" r="17" />
                  </svg>
                  <span className="pq-ring-label">{isComplete ? "✓" : `${pct}%`}</span>
                </div>

                <div className={`pq-topic-status${isComplete ? " done" : isStarted ? " active" : ""}`}>
                  {isComplete ? "Done" : isStarted ? "In progress" : "Start"}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
