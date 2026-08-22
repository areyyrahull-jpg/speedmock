/**
 * testListShared.jsx
 * ─────────────────────────────────────────────────────────────────
 * Shared CSS, TestCard, and PageHeader used across ALL test listing
 * pages: PYQPapers, SubjectWiseTests, TopicWiseTests, MockTests,
 * NewSyllabusTests.
 *
 * Import in each page:
 *   import { inject, TestCard, PageHeader, FilterBar, scoreColor }
 *     from "./testListShared";
 * ─────────────────────────────────────────────────────────────────
 */
import { useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   SHARED CSS
════════════════════════════════════════════════════════════════ */
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--bg4:#21212e;--b:#1e1e2c;
--f:#e91e8c;--fl:#ff3aaa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--purple:#a855f7;
--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}

@keyframes tl-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes tl-pulse{0%,100%{opacity:1}50%{opacity:.5}}

.tl-page{min-height:100vh;background:var(--bg);padding-bottom:60px}

/* ── HEADER ── */
.tl-header{padding:32px 40px 24px;animation:tl-rise .4s ease both}
.tl-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;gap:7px;margin-bottom:6px}
.tl-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:tl-pulse 2s infinite}
.tl-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);letter-spacing:3px;color:var(--t);line-height:1}
.tl-sub{font-size:13px;color:var(--m);margin-top:6px}
.tl-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--m);cursor:pointer;
margin-bottom:14px;transition:color .2s}
.tl-back:hover{color:var(--f)}

/* ── CUSTOM TEST CTA ── */
.tl-custom-cta{
  display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:12px 22px;border-radius:12px;
  background:linear-gradient(135deg,var(--f),var(--fl));color:#fff;font-size:13px;font-weight:700;
  border:none;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .25s ease;
  box-shadow:0 4px 16px rgba(233,30,140,.25);
}
.tl-custom-cta:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(233,30,140,.45)}
.tl-custom-cta:active{transform:translateY(0)}

/* ── SUBJECT/CHIP TABS (for topic-wise) ── */
.tl-chip-tabs{display:flex;gap:8px;margin-top:18px;flex-wrap:wrap}
.tl-chip{
  display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:100px;
  background:var(--bg2);border:1px solid var(--b);cursor:pointer;font-size:12px;font-weight:600;
  color:var(--m);transition:all .2s;
}
.tl-chip.active{background:rgba(233,30,140,.1);border-color:rgba(233,30,140,.35);color:var(--f)}
.tl-chip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

/* ── BODY ── */
.tl-body{padding:0 40px 24px}

/* ── FILTER BAR ── */
.tl-filters{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.tl-search{
  flex:1;min-width:200px;display:flex;align-items:center;gap:10px;padding:10px 16px;
  background:var(--bg2);border:1px solid var(--b);border-radius:10px;
}
.tl-search input{flex:1;background:none;border:none;outline:none;color:var(--t);font-size:13px;font-family:'Outfit',sans-serif}
.tl-search input::placeholder{color:var(--m2)}
.tl-filter-pill{display:flex;gap:4px;background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:4px}
.tl-filter-btn{
  padding:7px 14px;border-radius:7px;border:none;font-size:11.5px;font-weight:600;cursor:pointer;
  background:transparent;color:var(--m);font-family:'Outfit',sans-serif;transition:all .15s;white-space:nowrap;
}
.tl-filter-btn.active{background:var(--f);color:#fff}

/* ── GROUP ── */
.tl-group{margin-bottom:28px;animation:tl-rise .5s ease both}
.tl-group-label{
  font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--m);
  margin-bottom:14px;display:flex;align-items:center;gap:10px;
}
.tl-group-label::after{content:'';flex:1;height:1px;background:var(--b)}
.tl-group-count{font-family:'DM Mono',monospace;color:var(--m2)}

/* ── GRID ── */
.tl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.tl-grid.cols-4{grid-template-columns:repeat(4,1fr)}

/* ── TEST CARD ── */
.tl-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:14px;padding:18px;
  position:relative;overflow:hidden;transition:transform .2s,border-color .2s;
  display:flex;flex-direction:column;
}
.tl-card:hover{transform:translateY(-3px);border-color:rgba(233,30,140,.3)}
.tl-card.locked{opacity:.55}

.tl-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
.tl-card-icon{
  width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:17px;flex-shrink:0;
}
.tl-card-badge{font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;
padding:4px 9px;border-radius:100px;flex-shrink:0}
.tl-card-badge.free{background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.25)}
.tl-card-badge.new{background:rgba(233,30,140,.12);color:var(--f);border:1px solid rgba(233,30,140,.25)}
.tl-card-badge.locked{background:rgba(122,122,144,.1);color:var(--m);border:1px solid var(--b)}

.tl-card-title{font-size:13.5px;font-weight:700;color:var(--t);line-height:1.4;margin-bottom:6px;flex:1}
.tl-card-meta{display:flex;gap:12px;font-size:11px;color:var(--m);margin-bottom:14px;flex-wrap:wrap}
.tl-card-meta-item{display:flex;align-items:center;gap:4px}

/* progress / score */
.tl-card-status{margin-bottom:14px}
.tl-score-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.tl-score-val{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:1px}
.tl-score-lbl{font-size:10px;color:var(--m);text-transform:uppercase;letter-spacing:1px}
.tl-progress-track{height:5px;background:var(--bg3);border-radius:100px;overflow:hidden}
.tl-progress-fill{height:100%;border-radius:100px;transition:width .5s}
.tl-not-attempted{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--m2);padding:8px 0}

/* footer / button */
.tl-card-footer{margin-top:auto;display:flex;gap:8px}
.tl-btn-half{flex:1;padding:10px 6px;font-size:11.5px}
.tl-btn{
  width:100%;padding:10px;border-radius:9px;border:none;font-size:12px;font-weight:700;cursor:pointer;
  font-family:'Outfit',sans-serif;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
}
.tl-btn-start{background:linear-gradient(135deg,var(--f),var(--fl));color:#fff}
.tl-btn-start:hover{box-shadow:0 6px 18px rgba(233,30,140,.35);transform:translateY(-1px)}
.tl-btn-resume{background:rgba(245,158,11,.12);color:var(--amber);border:1px solid rgba(245,158,11,.3)}
.tl-btn-resume:hover{background:rgba(245,158,11,.2)}
.tl-btn-review{background:var(--bg3);color:var(--t);border:1px solid var(--b)}
.tl-btn-review:hover{border-color:rgba(233,30,140,.3)}
.tl-btn-locked{background:var(--bg3);color:var(--m2);border:1px solid var(--b);cursor:not-allowed}

/* ── EMPTY STATE ── */
.tl-empty{text-align:center;padding:60px 20px;color:var(--m);background:var(--bg2);border:1px solid var(--b);border-radius:16px}
.tl-empty-icon{font-size:40px;margin-bottom:12px}
.tl-empty-title{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:2px;color:var(--t);margin-bottom:6px}

@media(max-width:1000px){.tl-grid{grid-template-columns:repeat(2,1fr)}.tl-grid.cols-4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:680px){
  .tl-header,.tl-body{padding-left:20px;padding-right:20px}
  .tl-grid{grid-template-columns:1fr}
  .tl-filters{flex-direction:column;align-items:stretch}
  .tl-filter-pill{overflow-x:auto}
}
`;

export const inject = () => {
  if (document.getElementById("tl-css")) return;
  const s = document.createElement("style");
  s.id = "tl-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

export const useInjectCSS = () => { useEffect(() => { inject(); }, []); };

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
export const scoreColor = (pct) => pct >= 70 ? "var(--green)" : pct >= 45 ? "var(--amber)" : "var(--red)";

export const ICON_BY_CATEGORY = {
  "Full Length Mocks":     { icon: "📝", bg: "rgba(233,30,140,.1)" },
  "Sectional Tests":       { icon: "⚡", bg: "rgba(14,165,233,.1)" },
  "Quantitative Aptitude": { icon: "🔢", bg: "rgba(34,197,94,.1)" },
  "Reasoning":             { icon: "🧠", bg: "rgba(168,85,247,.1)" },
  "English":               { icon: "📖", bg: "rgba(14,165,233,.1)" },
  "General Awareness":     { icon: "🌍", bg: "rgba(245,158,11,.1)" },
  "New Syllabus":          { icon: "✨", bg: "rgba(233,30,140,.1)" },
  default:                 { icon: "📋", bg: "rgba(122,122,144,.1)" },
};

/* ════════════════════════════════════════════════════════════════
   PAGE HEADER
════════════════════════════════════════════════════════════════ */
export function PageHeader({ eyebrow, title, subtitle, onBack, children }) {
  return (
    <div className="tl-header">
      {onBack && <div className="tl-back" onClick={onBack}>← Back to Dashboard</div>}
      <div className="tl-eyebrow"><span className="tl-dot"/>{eyebrow}</div>
      <h1 className="tl-h1">{title}</h1>
      <div className="tl-sub">{subtitle}</div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FILTER BAR — search + status pills
════════════════════════════════════════════════════════════════ */
export function FilterBar({ search, onSearch, statusFilter, onStatusChange, placeholder }) {
  return (
    <div className="tl-filters">
      <div className="tl-search">
        🔍
        <input placeholder={placeholder || "Search tests..."} value={search} onChange={e => onSearch(e.target.value)} />
      </div>
      <div className="tl-filter-pill">
        {[
          { id: "all", label: "All" },
          { id: "not-attempted", label: "Not Attempted" },
          { id: "in-progress", label: "In Progress" },
          { id: "completed", label: "Completed" },
        ].map(f => (
          <button key={f.id} className={`tl-filter-btn${statusFilter===f.id?" active":""}`} onClick={() => onStatusChange(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TEST CARD
════════════════════════════════════════════════════════════════ */
export function TestCard({ test, isSubscribed, onStart, onResume, onReview }) {
  const locked = !test.free && !isSubscribed;
  const meta = ICON_BY_CATEGORY[test.category] || ICON_BY_CATEGORY.default;
  const scorePct = test.score ? Math.round((test.score / test.marks) * 100) : 0;

  return (
    <div className={`tl-card${locked ? " locked" : ""}`}>
      <div className="tl-card-top">
        <div className="tl-card-icon" style={{ background: meta.bg }}>{test.icon || meta.icon}</div>
        {locked ? (
          <span className="tl-card-badge locked">🔒 Locked</span>
        ) : test.isNew ? (
          <span className="tl-card-badge new">✨ New</span>
        ) : test.free ? (
          <span className="tl-card-badge free">Free</span>
        ) : null}
      </div>

      <div className="tl-card-title">{test.title}</div>

      <div className="tl-card-meta">
        <div className="tl-card-meta-item">📝 {test.questions} Qs</div>
        <div className="tl-card-meta-item">🎯 {test.marks} Marks</div>
        <div className="tl-card-meta-item">⏱️ {test.duration} min</div>
      </div>

      <div className="tl-card-status">
        {test.status === "completed" && (
          <>
            <div className="tl-score-row">
              <span className="tl-score-val" style={{ color: scoreColor(scorePct) }}>{test.score}/{test.marks}</span>
              <span className="tl-score-lbl">Score · {scorePct}%</span>
            </div>
            <div className="tl-progress-track">
              <div className="tl-progress-fill" style={{ width: `${scorePct}%`, background: scoreColor(scorePct) }}/>
            </div>
          </>
        )}
        {test.status === "in-progress" && (
          <>
            <div className="tl-score-row">
              <span className="tl-score-val" style={{ color: "var(--amber)" }}>{test.progress}%</span>
              <span className="tl-score-lbl">In Progress</span>
            </div>
            <div className="tl-progress-track">
              <div className="tl-progress-fill" style={{ width: `${test.progress}%`, background: "var(--amber)" }}/>
            </div>
          </>
        )}
        {test.status === "not-attempted" && (
          <div className="tl-not-attempted">⬜ Not attempted yet</div>
        )}
      </div>

      <div className="tl-card-footer">
        {locked ? (
          <button className="tl-btn tl-btn-locked" disabled>🔒 Subscribe to Unlock</button>
        ) : test.status === "completed" ? (
          <>
            <button className="tl-btn tl-btn-start tl-btn-half" onClick={() => onStart?.(test)}>🔄 Retake</button>
            <button className="tl-btn tl-btn-review tl-btn-half" onClick={() => onReview?.(test)}>📖 Solutions</button>
          </>
        ) : test.status === "in-progress" ? (
          <button className="tl-btn tl-btn-resume" onClick={() => onResume?.(test)}>▶ Resume Test</button>
        ) : (
          <button className="tl-btn tl-btn-start" onClick={() => onStart?.(test)}>🚀 Start Test</button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */
export function EmptyState({ title = "No Tests Found", sub = "Try adjusting your search or filters." }) {
  return (
    <div className="tl-empty">
      <div className="tl-empty-icon">🔍</div>
      <div className="tl-empty-title">{title}</div>
      <div style={{ fontSize: 12 }}>{sub}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GENERIC FILTER HOOK — returns [search, setSearch, statusFilter, setStatusFilter, filterFn]
════════════════════════════════════════════════════════════════ */
import { useState } from "react";

export function useTestFilters() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filterFn = (t) => {
    const normalizedSearch = search.trim().toLowerCase();
    const queryTokens = normalizedSearch ? normalizedSearch.split(/\s+/).filter(Boolean) : [];

    const searchableText = [
      t.title,
      t.category,
      t.subject,
      t.topic,
      t.year,
      t.questions,
      t.marks,
      t.duration,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = queryTokens.length === 0 || queryTokens.every(token => searchableText.includes(token));

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  };

  return { search, setSearch, statusFilter, setStatusFilter, filterFn };
}
