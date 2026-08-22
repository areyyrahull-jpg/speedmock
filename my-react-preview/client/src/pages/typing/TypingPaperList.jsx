import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";

/* ════════════════════════════════════════════════════════════════
   TypingPaperList — shown after rules screen, before the actual test
   User picks a paper → parent receives { id, passage, label, category }

   Props:
     papers   — array of paper objects (see shape below)
     language — "english" | "hindi" (for colour theming)
     onSelect — fn({ id, passage, label, category }) — user clicked Start
     onBack   — fn() — go back to rules screen
════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');
:root{
  --g9:#0b0b10;--g8:#13131a;--g75:#171720;--g7:#1e1e2c;--g6:#23232f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#f0f0f0;
}
[data-pqtheme="light"]{--g9:#f4f4f7;--g8:#ffffff;--g75:#f7f7fa;--g7:#e8e8ef;--g6:#d8d8e4;--g4:#6b6b80;--g3:#5a5a70;--g2:#2a2a3a;--w:#1a1a2e;}
[data-pqtheme="yellow"]{--g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;--g7:#ddd0a8;--g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#3a2e1f;--w:#3a2e1f;}

.tpl-page{min-height:100vh;background:var(--g9);font-family:'Outfit',sans-serif;color:var(--w);padding:0 0 60px}
.tpl-header{padding:24px 28px 0;display:flex;align-items:center;gap:14px}
.tpl-back{background:none;border:none;color:var(--g4);font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif}
.tpl-back:hover{color:var(--w)}
.tpl-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:2px;color:var(--w);margin-left:auto}
.pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px;flex-shrink:0}
.pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
.pq-theme-btn:hover{opacity:.85}
.pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.1);box-shadow:0 0 0 1px var(--g6)}

.tpl-body{padding:22px 28px}
.tpl-shell{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:0 28px;align-items:start}
@media(max-width:800px){.tpl-shell{grid-template-columns:1fr}}
.tpl-adslot{
  display:flex;align-items:center;justify-content:center;
  background:var(--g8);border:1px dashed var(--g6);border-radius:12px;
  color:var(--g4);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;
}
.tpl-premium{
  background:linear-gradient(160deg,var(--g8),var(--g75));border:1px solid rgba(233,30,140,.35);
  border-radius:14px;padding:18px 16px;display:flex;flex-direction:column;gap:12px;
}

/* category switcher tabs */
.tpl-tabs{display:flex;gap:8px;padding:0 28px;margin-top:18px;flex-wrap:wrap}
.tpl-tab{
  display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:100px;
  border:1.5px solid var(--g6);background:var(--g8);color:var(--g4);
  font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;cursor:pointer;
  transition:all .18s;
}
.tpl-tab:hover{color:var(--w);border-color:var(--g4)}
.tpl-tab--active{
  background:var(--tab-color-bg,rgba(14,165,233,.12));
  border-color:var(--tab-color,#0ea5e9);
  color:var(--tab-color,#0ea5e9);
}
.tpl-tab-count{
  font-size:11px;font-weight:800;padding:1px 8px;border-radius:100px;
  background:rgba(128,128,128,.18);
}
.tpl-tab--active .tpl-tab-count{background:var(--tab-color,#0ea5e9);color:#fff}

/* category label */
.tpl-cat-label{
  display:flex;align-items:center;gap:10px;
  font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;
  color:var(--cat-color,var(--g4));margin:24px 0 12px;
}
.tpl-cat-label::after{content:'';flex:1;height:1px;background:var(--g7)}
.tpl-cat-dot{width:8px;height:8px;border-radius:50%;background:var(--cat-color,var(--g4));box-shadow:0 0 6px var(--cat-color,var(--g4))}

/* paper card */
.tpl-card{
  background:var(--g8);border:1px solid var(--g7);border-radius:14px;
  padding:18px 20px;margin-bottom:10px;display:flex;align-items:center;gap:16px;
  transition:border-color .2s,transform .2s;
}
.tpl-card:hover{border-color:rgba(233,30,140,.3);transform:translateY(-1px)}
.tpl-card-icon{
  width:44px;height:44px;border-radius:11px;display:flex;align-items:center;
  justify-content:center;font-size:20px;flex-shrink:0;
}
.tpl-card-info{flex:1;min-width:0}
.tpl-card-label{font-size:14px;font-weight:700;color:var(--w);margin-bottom:3px;overflow-wrap:break-word}
.tpl-card-meta{font-size:11.5px;color:var(--g4);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.tpl-card-badge{
  font-size:9px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;
  padding:3px 9px;border-radius:100px;
}
.tpl-card-preview{
  font-size:11px;color:var(--g4);margin-top:8px;line-height:1.6;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.tpl-start-btn{
  padding:10px 20px;border-radius:10px;border:none;font-size:12.5px;font-weight:700;
  cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;flex-shrink:0;
  transition:all .2s;
}
.tpl-start-btn:hover{transform:translateY(-1px)}
@media(max-width:420px){
  .tpl-card{flex-wrap:wrap;padding:16px}
  .tpl-card-info{flex-basis:100%;order:1}
  .tpl-start-btn{order:2;margin-left:60px}
}
`;

const injectCSS = () => {
  let s = document.getElementById("tpl-css");
  if (!s) {
    s = document.createElement("style");
    s.id = "tpl-css";
    document.head.appendChild(s);
  }
  // Always refresh content — a stale tag left over from an earlier version
  // of this component (e.g. across hot-reloads) would otherwise never
  // update, silently freezing old styling in place.
  if (s.textContent !== CSS) s.textContent = CSS;
};

const CATEGORIES = {
  pyq: {
    label: "PYQ — Previous Year Papers",
    dot: "🏛️",
    color: "#0ea5e9",
    badgeStyle: { background:"rgba(14,165,233,.12)", color:"#0ea5e9", border:"1px solid rgba(14,165,233,.25)" },
    iconBg: "rgba(14,165,233,.1)",
    btnStyle: { background:"linear-gradient(135deg,#0ea5e9,#38bdf8)", color:"#fff", boxShadow:"0 4px 14px rgba(14,165,233,.3)" },
  },
  extra: {
    label: "Extra — Good Level Passages",
    dot: "⭐",
    color: "#f59e0b",
    badgeStyle: { background:"rgba(245,158,11,.12)", color:"#f59e0b", border:"1px solid rgba(245,158,11,.25)" },
    iconBg: "rgba(245,158,11,.1)",
    btnStyle: { background:"linear-gradient(135deg,#f59e0b,#fbbf24)", color:"#fff", boxShadow:"0 4px 14px rgba(245,158,11,.3)" },
  },
};

export default function TypingPaperList({ papers = [], language = "english", onSelect, onBack, isSubscribed = false }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [theme, setTheme] = usePqTheme();

  if (typeof document !== "undefined") injectCSS();

  const pyqPapers   = papers.filter(p => p.category === "pyq");
  const extraPapers = papers.filter(p => p.category === "extra");

  const [activeCat, setActiveCat] = useState(pyqPapers.length ? "pyq" : "extra");

  const renderGroup = (list, catKey) => {
    if (list.length === 0) return null;
    const cat = CATEGORIES[catKey];
    return (
      <>
        {list.map(paper => (
          <div className="tpl-card" key={paper.id}>
            <div className="tpl-card-icon" style={{ background: cat.iconBg }}>
              {paper.icon || cat.dot}
            </div>
            <div className="tpl-card-info">
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
                <div className="tpl-card-label">{paper.label}</div>
                <span className="tpl-card-badge" style={cat.badgeStyle}>
                  {catKey === "pyq" ? `PYQ ${paper.year || ""}` : "Extra"}
                </span>
              </div>
              <div className="tpl-card-meta">
                <span>⏱ 15 min</span>
                <span>·</span>
                <span>{paper.passage?.split(" ").length ?? 0} words</span>
                {paper.source && <><span>·</span><span>{paper.source}</span></>}
              </div>
              {/* passage preview toggle */}
              <div className="tpl-card-preview" style={{ maxHeight: expanded === paper.id ? "none" : undefined, WebkitLineClamp: expanded === paper.id ? "unset" : 2 }}>
                {paper.passage}
              </div>
              <button onClick={() => setExpanded(expanded === paper.id ? null : paper.id)}
                style={{ background:"none", border:"none", color:"var(--g4)", fontSize:11, cursor:"pointer", padding:"4px 0", fontFamily:"'Outfit',sans-serif" }}>
                {expanded === paper.id ? "▲ Show less" : "▼ Preview passage"}
              </button>
            </div>
            <button className="tpl-start-btn" style={cat.btnStyle}
              onClick={() => onSelect({ ...paper, category: catKey })}>
              Start →
            </button>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="tpl-page" data-pqtheme={theme}>
      <div className="tpl-header">
        <button className="tpl-back" onClick={onBack}>← Back</button>
        <div className="tpl-title">
          {language === "hindi" ? "पेपर चुनें" : "Select a Paper"}
        </div>
        <PqThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      {/* category switcher — PYQ vs Extra */}
      <div className="tpl-tabs">
        {pyqPapers.length > 0 && (
          <button
            className={`tpl-tab${activeCat === "pyq" ? " tpl-tab--active" : ""}`}
            style={{ "--tab-color": CATEGORIES.pyq.color, "--tab-color-bg": "rgba(14,165,233,.12)" }}
            onClick={() => setActiveCat("pyq")}
          >
            <span>{CATEGORIES.pyq.dot}</span>
            {language === "hindi" ? "पिछले वर्षों के पेपर" : "PYQ Papers"}
            <span className="tpl-tab-count">{pyqPapers.length}</span>
          </button>
        )}
        {extraPapers.length > 0 && (
          <button
            className={`tpl-tab${activeCat === "extra" ? " tpl-tab--active" : ""}`}
            style={{ "--tab-color": CATEGORIES.extra.color, "--tab-color-bg": "rgba(245,158,11,.12)" }}
            onClick={() => setActiveCat("extra")}
          >
            <span>{CATEGORIES.extra.dot}</span>
            {language === "hindi" ? "अतिरिक्त अच्छे पैसेज" : "Extra Good Passages"}
            <span className="tpl-tab-count">{extraPapers.length}</span>
          </button>
        )}
      </div>

      <div className="tpl-shell">
        <div style={{ position:"sticky", top:16, display:"flex", flexDirection:"column", gap:12 }}>
          {isSubscribed ? (
            <div className="tpl-premium">
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"1.1rem" }}>⭐</span>
                <span style={{ fontSize:"0.78rem", fontWeight:800, color:"#ff3aaa" }}>
                  {language === "hindi" ? "प्रीमियम सक्रिय" : "Premium Active"}
                </span>
              </div>
              <div style={{ fontSize:"0.68rem", color:"var(--g4)", lineHeight:1.6 }}>
                {language === "hindi"
                  ? "कोई विज्ञापन नहीं — बिना रुकावट practice करें।"
                  : "No ads — practice without interruption."}
              </div>
              <div style={{ height:1, background:"var(--g6)" }} />
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:"0.62rem", color:"var(--g4)", textTransform:"uppercase" }}>PYQ</span>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--w)" }}>{pyqPapers.length}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:"0.62rem", color:"var(--g4)", textTransform:"uppercase" }}>Extra</span>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--w)" }}>{extraPapers.length}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="tpl-adslot" style={{ height:250, flexDirection:"column", gap:8 }}>
                <span>Ad Space</span>
                <button
                  onClick={() => navigate("/subscription")}
                  style={{ background:"none", border:"1px solid rgba(233,30,140,.35)", borderRadius:50, padding:"4px 12px", color:"#ff3aaa", fontSize:"10px", fontWeight:700, textTransform:"none", letterSpacing:"normal", cursor:"pointer" }}
                >
                  {language === "hindi" ? "⭐ Premium से विज्ञापन हटाएं" : "⭐ Remove ads with Premium"}
                </button>
              </div>
              <div className="tpl-adslot" style={{ height:400 }}>Ad Space</div>
            </>
          )}
        </div>

        <div className="tpl-body" style={{ padding:0 }}>
          {activeCat === "pyq" && renderGroup(pyqPapers, "pyq")}
          {activeCat === "extra" && renderGroup(extraPapers, "extra")}
          {papers.length === 0 && (
            <div style={{ textAlign:"center", color:"var(--g4)", padding:"60px 20px", fontSize:13 }}>
              No papers available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
