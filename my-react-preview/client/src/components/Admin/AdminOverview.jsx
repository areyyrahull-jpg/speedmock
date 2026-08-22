import { useState, useEffect } from "react";
import { apiFetch } from "../../services/apiFetch";

export default function AdminOverview({ onJumpToQuestions }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { ok, data } = await apiFetch("/api/admin/stats");
        if (!ok || !data.success) throw new Error(data.message || "Failed to load stats");
        setStats(data.stats);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="adm-loading"><div className="adm-spinner"/>Loading dashboard...</div>;
  if (error)   return <div className="adm-empty"><div className="adm-empty-icon">⚠️</div><div className="adm-empty-title">{error}</div></div>;

  const maxByExam = Math.max(1, ...Object.values(stats.byExam || {}));

  return (
    <>
      {/* ── STAT CARDS ── */}
      <div className="adm-stats-grid">
        {[
          { icon:"❓", val: stats.totalQuestions.toLocaleString(), lbl:"Total Questions",    color:"var(--f)" },
          { icon:"📝", val: stats.totalTests.toLocaleString(),     lbl:"Total Tests",        color:"var(--amber)" },
          { icon:"👥", val: stats.totalUsers.toLocaleString(),     lbl:"Registered Users",   color:"var(--blue)" },
          { icon:"⚡", val: stats.attemptsToday.toLocaleString(),  lbl:"Attempts Today",     color:"var(--green)" },
        ].map(s => (
          <div className="adm-stat-card" key={s.lbl}>
            <div className="adm-stat-icon">{s.icon}</div>
            <div className="adm-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="adm-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── TEST COUNTS BY TYPE ── */}
      <div className="adm-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon:"📜", val: stats.pyqTests,     lbl:"PYQ Papers",       color:"var(--purple)" },
          { icon:"🎯", val: stats.fullTests,     lbl:"Full Mock Tests",  color:"var(--f)" },
          { icon:"📚", val: stats.subjectTests,  lbl:"Subject-wise",     color:"var(--blue)" },
          { icon:"🔬", val: stats.topicTests,    lbl:"Topic-wise",       color:"var(--green)" },
        ].map(s => (
          <div className="adm-stat-card" key={s.lbl}>
            <div className="adm-stat-icon">{s.icon}</div>
            <div className="adm-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="adm-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── QUESTIONS BY EXAM ── */}
      <div className="adm-table-wrap" style={{ padding: 22 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", letterSpacing:1.5, marginBottom:4 }}>
          QUESTION COVERAGE BY EXAM
        </div>
        <div style={{ fontSize:11.5, color:"var(--m)", marginBottom:18 }}>Click a bar to jump to that exam's questions</div>

        {Object.keys(stats.byExam || {}).length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">📭</div>
            <div className="adm-empty-title">No questions yet</div>
            <div className="adm-empty-sub">Create a test and add questions via the Questions tab.</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(stats.byExam).sort((a,b)=>b[1]-a[1]).map(([examId, count]) => (
              <div key={examId} style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}
                onClick={() => onJumpToQuestions?.(examId)}>
                <div style={{ width:130, fontSize:12.5, fontWeight:600, color:"var(--t)", flexShrink:0 }}>{examId.toUpperCase()}</div>
                <div style={{ flex:1, height:18, background:"var(--bg3)", borderRadius:100, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:100, width:`${(count/maxByExam)*100}%`,
                    background:"linear-gradient(90deg,var(--f),var(--fl))", transition:"width .5s" }}/>
                </div>
                <div className="adm-mono" style={{ width:50, textAlign:"right", fontSize:12.5 }}>{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
