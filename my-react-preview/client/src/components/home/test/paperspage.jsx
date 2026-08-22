// src/pages/PapersPage.jsx
//
// Shows full mocks + PYQ papers for CGL / CPO / CHSL / NTPC / ALP.
// Exams with multiple stages show Tier 1 / Tier 2 (or CBT 1 / CBT 2) tabs.
// Tapping "Start" launches TestScreen live; "Resume" restores saved state.

import { useState, useEffect } from "react";
import { Clock, FileText, BookOpen, ChevronRight, RotateCcw, Play, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import authService from "../../../services/authService";

/* ── tokens ─────────────────────────────────────────────────────── */
const C = {
  bg:           "#16171C",
  bgElevated:   "#1C1E25",
  surface:      "#202229",
  surfaceAlt:   "#272A33",
  border:       "#34363F",
  borderSoft:   "#2A2C34",
  ink:          "#F2F2F5",
  inkSoft:      "#9A9CAA",
  inkFaint:     "#6B6D79",
  fuchsia:      "#d946ef",
  fuchsiaBright:"#f472eb",
  fuchsiaDim:   "#6E2155",
  fuchsiaSoft:  "rgba(217,70,239,0.14)",
  fuchsiaBorder:"rgba(217,70,239,0.40)",
  green:        "#3ED9A0",
  greenSoft:    "rgba(62,217,160,0.12)",
  amber:        "#F59E0B",
  amberSoft:    "rgba(245,158,11,0.12)",
};

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
    .pp-display { font-family:'Sora','Inter',sans-serif; }
    .pp-body    { font-family:'Inter',sans-serif; }
    .pp-mono    { font-family:'JetBrains Mono',monospace; }
    .pp-focus:focus-visible { outline:2px solid ${C.fuchsia}; outline-offset:2px; }
    .pp-card { transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease; }
    .pp-card:hover { transform:translateY(-2px); border-color:${C.fuchsiaBorder}; box-shadow:0 12px 28px -16px rgba(0,0,0,.6); }
    .pp-exam-btn { transition:background .15s,border-color .15s,color .15s,box-shadow .15s; }
    .pp-exam-btn:hover { border-color:${C.fuchsiaBorder}; }
    .pp-tab { transition:background .15s,color .15s,border-color .15s; }
  `}</style>
);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function hdrs() {
  const t = authService.getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
async function apiFetch(path) {
  const r = await fetch(`${API}${path}`, { headers: hdrs() });
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error || `${r.status}`); }
  return r.json();
}

/* ── exam config ─────────────────────────────────────────────────── */
const EXAMS = [
  { code: "SSC_CGL",  label: "SSC CGL",  short: "CGL",  icon: "🏛️" },
  { code: "SSC_CPO",  label: "SSC CPO",  short: "CPO",  icon: "🚔" },
  { code: "SSC_CHSL", label: "SSC CHSL", short: "CHSL", icon: "📋" },
  { code: "RRB_NTPC", label: "RRB NTPC", short: "NTPC", icon: "🚆" },
  { code: "RRB_ALP",  label: "RRB ALP",  short: "ALP",  icon: "🛤️" },
];

/* ── small pieces ────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 0" }}>
      <Loader2 size={22} color={C.fuchsia} className="animate-spin" />
    </div>
  );
}

function ErrMsg({ msg }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"32px",borderRadius:14,background:C.surface,border:`1px solid ${C.border}`,color:C.inkSoft }} className="pp-body text-sm">
      <AlertTriangle size={16} color={C.fuchsia} />
      {msg}
    </div>
  );
}

function AttemptPip({ count }) {
  if (!count) return null;
  return (
    <span className="pp-mono" style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:C.greenSoft,color:C.green,border:`1px solid rgba(62,217,160,.3)` }}>
      {count}× attempted
    </span>
  );
}

function TestCard({ test, onStart }) {
  const isPyq  = test.kind === "pyq";
  const hasAttempts = test.attemptCount > 0;
  return (
    <div className="pp-card" style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"18px 20px",display:"flex",alignItems:"center",gap:16 }}>
      {/* icon */}
      <div style={{ width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:isPyq ? C.amberSoft : C.fuchsiaSoft,flexShrink:0 }}>
        {isPyq
          ? <BookOpen size={20} color={C.amber} />
          : <FileText size={20} color={C.fuchsia} />}
      </div>

      {/* info */}
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4 }}>
          <span className="pp-display" style={{ fontSize:14,fontWeight:700,color:C.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:220 }}>
            {test.title}
          </span>
          {isPyq && test.year && (
            <span className="pp-mono" style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:C.amberSoft,color:C.amber,border:`1px solid rgba(245,158,11,.3)` }}>
              {test.year}
            </span>
          )}
          <AttemptPip count={test.attemptCount} />
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16,color:C.inkFaint }} className="pp-body">
          <span style={{ fontSize:12,display:"flex",alignItems:"center",gap:4 }}>
            <Clock size={12} /> {test.durationMins} min
          </span>
          <span style={{ fontSize:12 }}>{test.totalQ} questions</span>
        </div>
      </div>

      {/* action */}
      <button
        onClick={() => onStart(test)}
        className="pp-focus pp-body"
        style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:10,border:"none",background:hasAttempts ? C.surfaceAlt : C.fuchsia,color:hasAttempts ? C.inkSoft : "#fff",fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0,transition:"background .15s,box-shadow .15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = C.fuchsiaBright; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = hasAttempts ? C.surfaceAlt : C.fuchsia; e.currentTarget.style.color = hasAttempts ? C.inkSoft : "#fff"; }}
      >
        {hasAttempts ? <RotateCcw size={14} /> : <Play size={14} />}
        {hasAttempts ? "Reattempt" : "Start"}
      </button>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────────── */
export function PapersPage({ onStartTest }) {
  const { isAuthenticated } = useAuth();

  const [activeExam, setActiveExam]     = useState("SSC_CGL");
  const [examMeta,   setExamMeta]       = useState(null);   // tiers, multiTier
  const [metaLoading, setMetaLoading]   = useState(false);
  const [activeTier, setActiveTier]     = useState(null);   // e.g. "TIER_1"
  const [activeType, setActiveType]     = useState("full"); // "full" | "pyq"
  const [papers,     setPapers]         = useState(null);
  const [papersLoading, setPapersLoading] = useState(false);
  const [err, setErr]                   = useState(null);

  /* load exam meta when exam changes */
  useEffect(() => {
    setExamMeta(null);
    setActiveTier(null);
    setPapers(null);
    setErr(null);
    setMetaLoading(true);
    apiFetch(`/papers/${activeExam}`)
      .then(data => {
        setExamMeta(data);
        setActiveTier(data.tiers[0]?.key || null);
      })
      .catch(e => setErr(e.message))
      .finally(() => setMetaLoading(false));
  }, [activeExam]);

  /* load papers when tier changes */
  useEffect(() => {
    if (!activeTier) return;
    setPapers(null);
    setErr(null);
    setPapersLoading(true);
    apiFetch(`/papers/${activeExam}/${activeTier}`)
      .then(data => setPapers(data))
      .catch(e => setErr(e.message))
      .finally(() => setPapersLoading(false));
  }, [activeExam, activeTier]);

  const shown = papers
    ? (activeType === "full" ? papers.fullTests : papers.pyqTests)
    : [];

  return (
    <div className="pp-body" style={{ minHeight:"100vh", background:C.bg, color:C.ink, position:"relative", overflow:"hidden" }}>
      {FONTS}

      {/* ambient glow */}
      <div style={{ pointerEvents:"none",position:"absolute",inset:0,top:0,height:320,background:`radial-gradient(ellipse 700px 280px at 50% -10%, ${C.fuchsiaDim}38, transparent 70%)` }} />

      <div style={{ position:"relative",maxWidth:860,margin:"0 auto",padding:"36px 20px 60px" }}>

        {/* ── page header ── */}
        <div style={{ marginBottom:6,fontSize:11,fontWeight:700,letterSpacing:"1.8px",textTransform:"uppercase",color:C.fuchsia }} className="pp-body">
          Practice Zone
        </div>
        <h1 className="pp-display" style={{ fontSize:32,fontWeight:800,marginBottom:6,color:C.ink }}>
          Papers
        </h1>
        <p className="pp-body" style={{ color:C.inkSoft,fontSize:14,marginBottom:28,maxWidth:480,lineHeight:1.6 }}>
          Full mock tests and previous year papers, stage-wise for every exam.
        </p>

        {/* ── exam selector ── */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28 }}>
          {EXAMS.map(ex => {
            const active = activeExam === ex.code;
            return (
              <button
                key={ex.code}
                onClick={() => setActiveExam(ex.code)}
                className="pp-exam-btn pp-focus pp-body"
                style={{
                  display:"flex",alignItems:"center",gap:8,padding:"10px 18px",
                  borderRadius:12,border:`1px solid ${active ? C.fuchsia : C.border}`,
                  background: active ? C.fuchsia : C.surface,
                  color: active ? "#fff" : C.inkSoft,
                  fontWeight:700,fontSize:13,cursor:"pointer",
                  boxShadow: active ? `0 0 0 1px ${C.fuchsiaBorder},0 6px 20px -8px rgba(217,70,239,.5)` : "none",
                }}
              >
                <span>{ex.icon}</span>
                {ex.short}
              </button>
            );
          })}
        </div>

        {/* ── loading meta ── */}
        {metaLoading && <Spinner />}
        {err && !metaLoading && <ErrMsg msg={err} />}

        {examMeta && (
          <>
            {/* ── exam name ── */}
            <div style={{ marginBottom:20 }}>
              <span className="pp-display" style={{ fontSize:18,fontWeight:700,color:C.ink }}>{examMeta.examName}</span>
            </div>

            {/* ── tier tabs (only for multi-tier exams) ── */}
            {examMeta.multiTier && (
              <div style={{ display:"flex",gap:4,marginBottom:20,background:C.surface,borderRadius:14,padding:4,width:"fit-content",border:`1px solid ${C.border}` }}>
                {examMeta.tiers.map(t => {
                  const active = activeTier === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTier(t.key)}
                      className="pp-tab pp-focus pp-body"
                      style={{
                        padding:"9px 22px",borderRadius:11,border:"none",cursor:"pointer",
                        background: active ? C.fuchsia : "transparent",
                        color: active ? "#fff" : C.inkSoft,
                        fontWeight:700,fontSize:13,
                        boxShadow: active ? `0 2px 12px rgba(217,70,239,.4)` : "none",
                      }}
                    >
                      {t.label}
                      <span className="pp-mono" style={{ marginLeft:8,fontSize:10,fontWeight:600,opacity:.8 }}>
                        {t.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── test type sub-tabs ── */}
            {papers && (
              <div style={{ display:"flex",gap:4,marginBottom:22,borderBottom:`1px solid ${C.border}`,paddingBottom:0 }}>
                {[
                  { key:"full", label:"Full Mocks", count: papers.fullTests.length },
                  { key:"pyq",  label:"Previous Year", count: papers.pyqTests.length },
                ].map(tab => {
                  const active = activeType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveType(tab.key)}
                      className="pp-focus pp-body"
                      style={{
                        padding:"10px 18px",border:"none",background:"transparent",cursor:"pointer",
                        color: active ? C.fuchsia : C.inkSoft,
                        fontWeight:700,fontSize:13,
                        borderBottom: active ? `2px solid ${C.fuchsia}` : "2px solid transparent",
                        marginBottom:-1,transition:"color .15s,border-color .15s",
                      }}
                    >
                      {tab.label}
                      <span className="pp-mono" style={{ marginLeft:7,fontSize:11,opacity:.7 }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── papers list ── */}
            {papersLoading && <Spinner />}

            {!papersLoading && papers && (
              shown.length === 0 ? (
                <div style={{ textAlign:"center",padding:"48px 0",color:C.inkFaint,fontSize:14 }} className="pp-body">
                  No {activeType === "full" ? "full mock" : "previous year"} papers available for this stage yet.
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  {shown.map(test => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onStart={(t) => onStartTest?.(t, activeExam)}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
