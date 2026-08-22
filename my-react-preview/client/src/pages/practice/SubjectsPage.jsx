// SubjectsPage.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useSubjects } from "../../services/usePractice";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import "./practice.css";

export default function SubjectsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { subjects, loading, error } = useSubjects(examId);
  const [theme, setTheme] = usePqTheme();

  if (loading) return <div className="pq-loading">Loading subjects…</div>;
  if (error)   return <div className="pq-error">Couldn't load subjects: {error}</div>;

  return (
    <div className="pq-page" data-pqtheme={theme}>
      <div className="pq-content">
        <div className="pq-top-row">
          <button className="pq-back" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          <PqThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        <div className="pq-hero">
          <div className="pq-hero-eyebrow">Practice Question Bank</div>
          <h1 className="pq-h1">Pick your subject.</h1>
          <p className="pq-sub">Every question here is built for accuracy under pressure — the way it counts on exam day.</p>
        </div>

        {subjects.length === 0 ? (
          <div className="pq-empty">
            <div className="pq-empty-icon">📭</div>
            <div className="pq-empty-title">No subjects yet</div>
            <div className="pq-empty-body">Questions for this exam haven't been added yet. Check back soon.</div>
          </div>
        ) : (
          <div className="pq-subject-grid">
            {subjects.map((s, i) => (
              <div
                key={s.id}
                className="pq-ticket"
                style={{ "--accent": s.color || "rgba(217,70,239,.5)", animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/practice/${examId}/${s.code}`)}
              >
                <div className="pq-ticket-top">
                  <span className="pq-ticket-icon">{s.icon}</span>
                  <span className="pq-ticket-count">{s.question_count}<small>Qs</small></span>
                </div>
                <div className="pq-ticket-name">{s.name}</div>
                <div className="pq-ticket-meta">{s.topic_count} topic{s.topic_count !== 1 ? "s" : ""}</div>
                <div className="pq-ticket-stub">
                  <span>Start practicing</span>
                  <span className="pq-ticket-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
