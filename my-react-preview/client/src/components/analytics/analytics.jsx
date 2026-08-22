import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import { useAnalytics, useTestDeepDive } from "../../services/useanalytics";
import { useAuth } from "../../context/AuthContext";
import { useGoal } from "../../context/GoalContext";
import { useExam } from "../../context/ExamContext"; // ← adjust path to match your project structure
import { useTheme } from "../../context/ThemeContext"; // ← adjust path to match your project structure

/* ─── CSS ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Outfit', sans-serif; background: #0b0b10; color: #f0f0f0; }

:root {
  --bg:   #0b0b10;
  --bg2:  #13131a;
  --bg3:  #1a1a24;
  --b:    #1e1e2c;
  --b2:   rgba(233,30,140,0.18);
  --f:    #e91e8c;
  --fl:   #ff3aaa;
  --blue: #0ea5e9;
  --green:#22c55e;
  --amber:#f59e0b;
  --red:  #ef4444;
  --t:    #f0f0f0;
  --m:    #7a7a90;
  --m2:   #3a3a50;
}

/* Same light palette used across TestScreen.jsx, for a consistent look
   between the test-taking flow and analytics. Applied directly on .an-page
   (see data-theme attribute in the JSX below) rather than relying on
   ThemeContext to set it globally — that attribute isn't reliably applied
   anywhere in the DOM, so each page manages its own theming instead. */
[data-theme="light"] {
  --bg:   #f5f5f8;
  --bg2:  #ffffff;
  --bg3:  #f0f0f4;
  --b:    #e2e2ea;
  --t:    #16161e;
  --m:    #6b6b80;
  --m2:   #b8b8c8;
}

@keyframes an-rise   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
@keyframes an-count  { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
@keyframes an-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.8)} }
@keyframes an-glow   { 0%,100%{box-shadow:0 0 0 rgba(233,30,140,0)} 50%{box-shadow:0 0 20px rgba(233,30,140,.3)} }

.an-page {
  min-height: 100vh; background: var(--bg);
  padding: 0 0 60px;
  /* scanline texture */
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(233,30,140,0.015) 2px, rgba(233,30,140,0.015) 4px
  );
}

/* ── HEADER ── */
.an-header {
  padding: 36px 40px 28px;
  border-bottom: 1px solid var(--b);
  background: linear-gradient(180deg, rgba(233,30,140,.06) 0%, transparent 100%);
  animation: an-rise .4s ease both;
}
.an-header-top {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 12px;
  margin-bottom: 6px;
}
.an-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--f);
  display: flex; align-items: center; gap: 7px;
}
.an-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--f); box-shadow: 0 0 6px var(--f);
  animation: an-pulse 2s ease-in-out infinite;
}
.an-h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem,4vw,3.2rem);
  letter-spacing: 3px; color: var(--t); line-height: 1;
}
.an-exam-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; border-radius: 100px;
  background: rgba(233,30,140,.09);
  border: 1px solid rgba(233,30,140,.25);
  font-size: 12px; font-weight: 600; color: var(--f);
}
.an-range-tabs {
  display: flex; gap: 4px;
  background: var(--bg2); border: 1px solid var(--b);
  border-radius: 9px; padding: 4px;
}
.an-range-tab {
  padding: 6px 14px; border-radius: 7px; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  background: transparent; color: var(--m);
  font-family: 'Outfit', sans-serif; transition: all .2s;
}
.an-range-tab.active { background: var(--f); color: #fff; }

/* ── BACK TO DASHBOARD BUTTON ── */
.an-back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  color: var(--t); cursor: pointer;
  border: 1px solid var(--b);
  background: var(--bg2);
  font-family: 'Outfit', sans-serif;
  position: relative; overflow: hidden;
  transition: color .25s, border-color .25s, transform .2s;
}
.an-back-btn::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(233,30,140,.15), rgba(233,30,140,.04));
  opacity: 0; transition: opacity .25s;
}
.an-back-btn:hover { border-color: var(--f); transform: translateY(-1px); color: var(--f); }
.an-back-btn:hover::before { opacity: 1; }
.an-back-btn:active { transform: translateY(0); }
.an-back-arrow { font-size: 16px; transition: transform .25s cubic-bezier(.4,0,.2,1); display: inline-block; }
.an-back-btn:hover .an-back-arrow { transform: translateX(-3px); }

/* ── BODY ── */
.an-body { padding: 32px 40px; }

/* ── SECTION ── */
.an-section { margin-bottom: 36px; animation: an-rise .5s ease both; }
.an-section-label {
  font-size: 9px; font-weight: 800; letter-spacing: 3px;
  text-transform: uppercase; color: var(--m); margin-bottom: 16px;
  display: flex; align-items: center; gap: 10px;
}
.an-section-label::after {
  content: ''; flex: 1; height: 1px; background: var(--b);
}

/* ── CARDS ── */
.an-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.an-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.an-grid-3-1 { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; }

.an-card {
  background: var(--bg2); border: 1px solid var(--b);
  border-radius: 16px; padding: 22px;
  position: relative; overflow: hidden;
  transition: border-color .2s, transform .2s;
}
.an-card:hover { border-color: rgba(233,30,140,.3); transform: translateY(-2px); }
.an-card-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--f), transparent);
}
.an-card-label {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--m); margin-bottom: 10px;
}
.an-card-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem; letter-spacing: 1px; line-height: 1;
}
.an-card-sub {
  font-size: 11px; color: var(--m); margin-top: 5px; line-height: 1.5;
}
.an-delta {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; padding: 2px 8px;
  border-radius: 100px; margin-top: 6px;
}
.an-delta.up   { background: rgba(34,197,94,.12); color: var(--green); }
.an-delta.down { background: rgba(239,68,68,.12);  color: var(--red); }
.an-delta.flat { background: rgba(245,158,11,.12); color: var(--amber); }

/* ── GOAL RING CARD ── */
.an-goal-card {
  background: var(--bg2); border: 1px solid var(--b);
  border-radius: 16px; padding: 22px;
  display: flex; align-items: center; gap: 20px;
}
.an-ring-wrap { position: relative; flex-shrink: 0; }
.an-ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.an-ring-pct {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem; letter-spacing: 1px; color: var(--t); line-height: 1;
}
.an-ring-lbl { font-size: 9px; color: var(--m); letter-spacing: 1px; margin-top: 2px; }
.an-goal-info { flex: 1; }
.an-goal-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem; letter-spacing: 1.5px; color: var(--t); margin-bottom: 4px;
}
.an-streak-row {
  display: flex; gap: 5px; margin-top: 12px;
}
.an-streak-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700;
}
.an-streak-dot.hit   { background: rgba(233,30,140,.2); color: var(--f); border: 1px solid rgba(233,30,140,.3); }
.an-streak-dot.today { background: var(--f); color: #fff; box-shadow: 0 0 10px rgba(233,30,140,.5); }
.an-streak-dot.miss  { background: var(--bg3); color: var(--m2); border: 1px solid var(--b); }

/* ── CHART CARD ── */
.an-chart-card {
  background: var(--bg2); border: 1px solid var(--b);
  border-radius: 16px; padding: 24px;
  position: relative; overflow: hidden;
}
.an-chart-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.3rem; letter-spacing: 2px; color: var(--t);
  margin-bottom: 4px;
}
.an-chart-sub { font-size: 11px; color: var(--m); margin-bottom: 20px; line-height: 1.5; }

/* recharts overrides */
.recharts-cartesian-grid-horizontal line,
.recharts-cartesian-grid-vertical line { stroke: rgba(255,255,255,.04); }
.recharts-tooltip-wrapper { outline: none; }

/* ── CUSTOM TOOLTIP ── */
.an-tooltip {
  background: rgba(19,19,26,.96); border: 1px solid rgba(233,30,140,.3);
  border-radius: 10px; padding: 10px 14px;
  font-family: 'Outfit', sans-serif; font-size: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
}
.an-tooltip-title { font-weight: 700; color: var(--t); margin-bottom: 6px; }
.an-tooltip-row { display: flex; align-items: center; gap: 8px; color: var(--m); margin-top: 3px; }
.an-tooltip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.an-tooltip-val { font-family: 'DM Mono', monospace; font-weight: 500; color: var(--t); margin-left: auto; }

/* ── SUBJECT BARS ── */
.an-subject-row {
  display: flex; flex-direction: column; gap: 12px;
}
.an-sub-item { }
.an-sub-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 6px;
}
.an-sub-name { font-size: 12px; font-weight: 600; color: var(--t); }
.an-sub-pct  { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; }
.an-sub-track {
  height: 7px; background: var(--bg3);
  border-radius: 100px; overflow: hidden;
}
.an-sub-fill {
  height: 100%; border-radius: 100px;
  transition: width 1s cubic-bezier(.4,0,.2,1);
}

/* ── WEAK TOPICS ── */
.an-weak-list { display: flex; flex-direction: column; gap: 10px; }
.an-weak-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 10px;
  background: var(--bg3); border: 1px solid var(--b);
  transition: border-color .2s;
}
.an-weak-item:hover { border-color: rgba(233,30,140,.25); }
.an-weak-rank {
  font-family: 'DM Mono', monospace;
  font-size: 11px; color: var(--m2);
  flex-shrink: 0; width: 18px;
}
.an-weak-name { flex: 1; font-size: 12px; font-weight: 500; color: var(--t); }
.an-weak-tag {
  font-size: 10px; font-weight: 700; padding: 2px 9px;
  border-radius: 100px;
}
.an-weak-tests { font-size: 10px; color: var(--m); flex-shrink: 0; }

/* ── TYPING STAT CARD ── */
.an-typing-card {
  background: var(--bg2); border: 1px solid var(--b);
  border-radius: 16px; padding: 22px;
  border-top: 2px solid;
  transition: transform .2s, border-color .2s;
}
.an-typing-card:hover { transform: translateY(-2px); }
.an-typing-icon {
  width: 44px; height: 44px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; margin-bottom: 14px;
}
.an-typing-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--m); margin-bottom: 6px; }
.an-typing-val { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; letter-spacing: 1px; line-height: 1; }
.an-typing-unit { font-family: 'Outfit', sans-serif; font-size: 13px; color: var(--m); margin-left: 4px; }
.an-typing-sub  { font-size: 11px; color: var(--m); margin-top: 5px; }

/* ── LEGEND ── */
.an-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.an-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--m); }
.an-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

@media (max-width: 900px) {
  .an-body   { padding: 20px; }
  .an-header { padding: 24px 20px 20px; }
  .an-grid-4 { grid-template-columns: repeat(2,1fr); }
  .an-grid-2 { grid-template-columns: 1fr; }
  .an-grid-3-1 { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .an-grid-4 { grid-template-columns: 1fr 1fr; }
}
`;

/* ─── HELPERS ──────────────────────────────────────────────────── */
const inject = () => {
  try {
    if (document.getElementById("an-css")) return;
    const s = document.createElement("style");
    s.id = "an-css"; s.textContent = CSS;
    document.head.appendChild(s);
  } catch (err) {
    console.error("Failed to inject analytics CSS:", err);
  }
};

/* ─── CUSTOM TOOLTIP ───────────────────────────────────────────── */
function AnTooltip({ active, payload, label, unit1, unit2, color1, color2 }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <div className="an-tooltip-title">{label}</div>
      {payload.map((p, i) => (
        <div className="an-tooltip-row" key={i}>
          <div className="an-tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="an-tooltip-val">
            {p.value}{i === 0 ? (unit1 || "") : (unit2 || "")}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── GOAL RING ────────────────────────────────────────────────── */
function GoalRing({ done, target, size = 110 }) {
  const pct  = Math.min(1, done / target);
  const r    = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const days = ["M","T","W","T","F","S","S"];

  return (
    <div className="an-goal-card">
      <div className="an-ring-wrap" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100"
          style={{ transform: "rotate(-90deg)" }}>
          {/* track */}
          <circle cx="50" cy="50" r={r} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          {/* fill */}
          <circle cx="50" cy="50" r={r} fill="none"
            stroke="url(#goalGrad)" strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"/>
          <defs>
            <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e91e8c"/>
              <stop offset="100%" stopColor="#ff3aaa"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="an-ring-center">
          <span className="an-ring-pct">{Math.round(pct*100)}%</span>
          <span className="an-ring-lbl">DONE</span>
        </div>
      </div>

      <div className="an-goal-info">
        <div className="an-goal-title">Daily Goal</div>
        <div style={{ fontSize: 13, color: "var(--m)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--t)", fontWeight: 700 }}>{done}</span>
          <span style={{ color: "var(--m2)" }}> / {target}</span>
          <span style={{ color: "var(--m)" }}> questions today</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--m)", marginTop: 4 }}>
          {target - done > 0
            ? `${target - done} more to hit today's target`
            : "✓ Daily target hit!"}
        </div>
        <div className="an-streak-row">
          {days.map((d, i) => (
            <div key={i}
              className={`an-streak-dot ${
                i < 5 ? "hit" : i === 5 ? "today" : "miss"
              }`}
            >{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ACCURACY DONUT ───────────────────────────────────────────── */
function AccuracyDonut({ current, previous, exam }) {
  const r    = 40;
  const circ = 2 * Math.PI * r;
  const pct  = current / 100;
  const delta = current - previous;

  return (
    <div className="an-goal-card" style={{ flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 90 90"
            style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r={r} fill="none"
              stroke="rgba(255,255,255,.05)" strokeWidth="8"/>
            <circle cx="45" cy="45" r={r} fill="none"
              stroke={current >= 70 ? "#22c55e" : current >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8"
              strokeDasharray={`${circ * pct} ${circ}`}
              strokeLinecap="round"/>
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.5rem", color: "var(--t)", lineHeight: 1 }}>
              {current}%
            </span>
            <span style={{ fontSize: 9, color: "var(--m)", letterSpacing: 1 }}>ACC</span>
          </div>
        </div>
        <div>
          <div className="an-card-label">{exam} Accuracy</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", letterSpacing: 1, color: "var(--t)", lineHeight: 1 }}>
            {current}%
          </div>
          <div className={`an-delta ${delta > 0 ? "up" : delta < 0 ? "down" : "flat"}`}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)}% vs prev
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUBJECT BARS ─────────────────────────────────────────────── */
function SubjectBars({ subjects }) {
  return (
    <div className="an-subject-row">
      {subjects.map(s => (
        <div className="an-sub-item" key={s.name}>
          <div className="an-sub-header">
            <span className="an-sub-name">{s.name}</span>
            <span className="an-sub-pct" style={{ color: s.color }}>{s.accuracy}%</span>
          </div>
          <div className="an-sub-track">
            <div className="an-sub-fill"
              style={{ width: `${s.accuracy}%`, background: s.color, boxShadow: `0 0 8px ${s.color}44` }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── WEAK TOPICS ──────────────────────────────────────────────── */
function WeakTopics({ topics }) {
  const getColor = (acc) =>
    acc < 45 ? "#ef4444" : acc < 55 ? "#f59e0b" : "#22c55e";

  return (
    <div className="an-weak-list">
      {topics.map((t, i) => (
        <div className="an-weak-item" key={t.topic}>
          <span className="an-weak-rank">#{i + 1}</span>
          <span className="an-weak-name">{t.topic}</span>
          <span className="an-weak-tag"
            style={{
              background: getColor(t.accuracy) + "18",
              color:      getColor(t.accuracy),
              border:     `1px solid ${getColor(t.accuracy)}33`,
            }}>
            {t.accuracy}% acc
          </span>
          <span className="an-weak-tests">{t.tests} tests</span>
        </div>
      ))}
    </div>
  );
}

/* ─── PYQ TEST DEEP-DIVE ──────────────────────────────────────────
   Advanced per-test analysis: pick any past PYQ attempt, see its
   section-wise accuracy, and weak topics enriched with an all-time
   trend (improving/declining vs your history on that topic) plus a
   difficulty-level breakdown. */
function TrendBadge({ trend, trendDelta }) {
  const cfg = {
    improving: { icon: "📈", color: "#22c55e", label: `+${trendDelta}% improving` },
    declining: { icon: "📉", color: "#ef4444", label: `${trendDelta}% declining` },
    steady:    { icon: "➖", color: "#7a7a90", label: "steady" },
  }[trend] || { icon: "➖", color: "#7a7a90", label: "steady" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700,
      color: cfg.color, background: cfg.color + "18", border: `1px solid ${cfg.color}33`,
      borderRadius: 999, padding: "3px 8px",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Sparkline({ values }) {
  if (!values || values.length < 2) return <div style={{ fontSize: 10, color: "var(--m)" }}>Not enough history yet</div>;
  const data = values.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke="#e91e8c" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DeepDiveWeakTopicCard({ t }) {
  const getColor = (acc) => acc < 45 ? "#ef4444" : acc < 55 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{
      background: "var(--bg3)", border: "1px solid var(--b)", borderRadius: 12, padding: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t)" }}>{t.topic}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: getColor(t.accuracy) }}>{t.accuracy}%</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <TrendBadge trend={t.trend} trendDelta={t.trendDelta} />
        <span style={{ fontSize: 10.5, color: "var(--m)" }}>{t.questionsInTest} Qs in this test</span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "var(--m)", marginBottom: 2 }}>All-time trend on this topic</div>
        <Sparkline values={t.history} />
      </div>

      {t.difficultyBreakdown?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "var(--m)", marginBottom: 4 }}>By difficulty</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {t.difficultyBreakdown.map(db => (
              <div key={db.level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10.5, color: "var(--t)", width: 64, textTransform: "capitalize" }}>{db.level}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: "var(--bg2)", overflow: "hidden" }}>
                  <div style={{ width: `${db.accuracy}%`, height: "100%", background: getColor(db.accuracy), borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--m)", width: 28, textAlign: "right" }}>{db.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TestDeepDiveSection({ pyqTests, userId }) {
  const [selectedId, setSelectedId] = useState(pyqTests[0]?.attemptId || null);
  const { data: dd, loading: ddLoading, error: ddError } = useTestDeepDive(userId, selectedId);

  useEffect(() => {
    // If the exam/test list changes and the currently selected attempt
    // no longer belongs to it, fall back to the most recent one.
    if (pyqTests.length && !pyqTests.some(t => t.attemptId === selectedId)) {
      setSelectedId(pyqTests[0].attemptId);
    }
  }, [pyqTests]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pyqTests.length) {
    return (
      <div className="an-section" style={{ animationDelay: ".25s" }}>
        <div className="an-section-label">PYQ Test Deep-Dive</div>
        <div className="an-chart-card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 13, color: "var(--m)" }}>Take a PYQ test to see a detailed breakdown here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="an-section" style={{ animationDelay: ".25s" }}>
      <div className="an-section-label">PYQ Test Deep-Dive</div>
      <div className="an-chart-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div>
            <div className="an-chart-title">Section & Topic Breakdown</div>
            <div className="an-chart-sub">Advanced per-test analysis, including weak-topic trends</div>
          </div>
          <select
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              background: "var(--bg3)", color: "var(--t)", border: "1px solid var(--b)",
              borderRadius: 8, padding: "8px 10px", fontSize: 12, fontFamily: "'Outfit',sans-serif",
              maxWidth: "100%",
            }}
          >
            {pyqTests.map(t => (
              <option key={t.attemptId} value={t.attemptId}>
                {t.testName} — {new Date(t.completedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} ({t.accuracy}% acc)
              </option>
            ))}
          </select>
        </div>

        {ddLoading ? (
          <div style={{ textAlign: "center", padding: 24, color: "var(--m)", fontSize: 12.5 }}>Loading test analysis…</div>
        ) : ddError ? (
          <div style={{ textAlign: "center", padding: 24, color: "#ef4444", fontSize: 12.5 }}>{ddError}</div>
        ) : (
          <div className="an-grid-3-1">
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t)", marginBottom: 10 }}>Section-wise accuracy</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(dd?.sections || []).map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11.5, color: "var(--t)", width: 150 }}>{s.name}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 5, background: "var(--bg3)", overflow: "hidden" }}>
                      <div style={{
                        width: `${s.accuracy}%`, height: "100%", borderRadius: 5,
                        background: s.accuracy < 45 ? "#ef4444" : s.accuracy < 55 ? "#f59e0b" : "#22c55e",
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--m)", width: 60, textAlign: "right" }}>{s.accuracy}% · {s.questions}Q</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t)", marginBottom: 10 }}>Weak topics from this test</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(dd?.weakTopics || []).map(t => <DeepDiveWeakTopicCard key={t.topic} t={t} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────────────── */
export default function Analytics({ userId: userIdProp }) {
  useEffect(() => {
    try { inject(); } catch (err) { console.error("Analytics useEffect error:", err); }
  }, []);

  const [range, setRange] = useState("7d");
  const navigate = useNavigate();

  const authData = useAuth();
  const user = authData?.user;
  const userId = userIdProp || user?.id;
  const { goalTarget: ctxGoalTarget, goalDone: ctxGoalDone } = useGoal();

  // Always call the hook unconditionally (React Hooks Rules)
  const { selectedExam: examCode } = useExam();
  const { theme, toggleTheme } = useTheme();
  const { data: d, loading, error, refetch } = useAnalytics(userId, range, examCode);

  if (loading) {
    return (
      <div className="an-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize: 40, marginBottom: 12, animation: "an-pulse 1.4s infinite" }}>📊</div>
          <div style={{ color: "var(--m)", fontSize: 13 }}>Loading your analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !d) {
    return (
      <div className="an-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <div style={{ textAlign:"center", maxWidth: 320 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "var(--t)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Couldn't load analytics</div>
          <div style={{ color: "var(--m)", fontSize: 12, marginBottom: 16 }}>{error || "Unknown error"}</div>
          <button onClick={() => { console.log("Refetch clicked"); refetch(); }} style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid var(--b2)",
            background: "var(--bg2)", color: "var(--f)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Outfit',sans-serif"
          }}>Retry</button>
        </div>
      </div>
    );
  }

  // Provide safe defaults for data to prevent null reference errors
  const safeData = d || {
    goal: { done: 0, target: 50, streak: 0 },
    goalHistory: [],
    goalCalendar: [],
    examAccuracy: { exam: "SSC CGL", current: 0, previous: 0 },
    totals: { testsDone: 0, avgScore: 0, topScore: 0, timeMins: 0 },
    last7Tests: [],
    pyqTests: [],
    subjects: [],
    weakTopics: [],
    typing: { sessions: 0, avgSpeed: 0, topSpeed: 0, avgAccuracy: 0, topAccuracy: 0 },
    speedTrend: [],
    selectedExam: "cgl",
  };

  // Use safe data for rest of component
  // Override goal with GoalContext — single source of truth shared with navbar
  const data = {
    ...safeData,
    goal: {
      ...safeData.goal,
      target: ctxGoalTarget,
      done:   ctxGoalDone,
    },
  };

  // Empty state — new user with no data yet
  const isEmpty = data.totals.testsDone === 0 && data.typing.sessions === 0 && data.goal.done === 0;

  const selectedExam = data.examAccuracy.exam || "SSC CGL";

  // Typing-trend charts read d.speedTrend[0] for the "Gain"/"Improvement"
  // badges. When the user has no typing sessions yet that array is empty,
  // so d.speedTrend[0].wpm threw a TypeError and crashed the whole page.
  // These safe fallbacks (and hasTyping) keep the page rendering.
  const hasTyping  = d.speedTrend.length > 0;
  const firstSpeed = d.speedTrend[0]?.wpm ?? 0;
  const firstAcc   = d.speedTrend[0]?.accuracy ?? 0;

  const handleNavigate = (page) => {
    if (page === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (page === "pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("speedmock_auth_token");
    localStorage.removeItem("speedmock_user");
    localStorage.removeItem("speedmock_device_id");
    navigate("/login");
  };


  return (
    <div className="an-page" data-theme={theme}>
      {/* ── HEADER ── */}
      <div className="an-header">
        <div className="an-header-top">
          <div>
            <div className="an-eyebrow">
              <span className="an-eyebrow-dot"/>
              Performance Tracker
            </div>
            
            <h1 className="an-h1">Your Analytics</h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button className="an-back-btn" onClick={() => navigate("/dashboard")}>
              <span className="an-back-arrow">←</span>
              Dashboard
            </button>
            <div className="an-exam-pill">
              📋 {selectedExam}
            </div>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              style={{
                width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg2)", border: "1px solid var(--b)", color: "var(--t)", cursor: "pointer", fontSize: 15,
              }}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            <div className="an-range-tabs">
              {["7d","30d"].map(r => (
                <button key={r}
                  className={`an-range-tab${range===r?" active":""}`}
                  onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="an-body">

        {isEmpty && (
          <div className="an-section" style={{
            background: "var(--bg2)", border: "1px solid var(--b)",
            borderRadius: 16, padding: "32px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🚀</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", letterSpacing: 2, color: "var(--t)", marginBottom: 6 }}>
              No Activity Yet
            </div>
            <div style={{ color: "var(--m)", fontSize: 13, lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
              Attempt a mock test, complete your daily PYQ goal, or take a typing test —
              your performance charts will appear here automatically.
            </div>
          </div>
        )}

        {/* ══ ROW 1: Goal + Accuracy + Quick Stats ══ */}
        <div className="an-section">
          <div className="an-section-label">Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: 16 }}>

            <GoalRing done={data.goal.done} target={data.goal.target} />
            <AccuracyDonut current={d.examAccuracy.current} previous={d.examAccuracy.previous} exam={d.examAccuracy.exam} />

            {[
              { label: "Tests Done",  val: d.totals.testsDone, unit: "",    sub: "All exams combined",  color: "var(--f)",     accent: "#e91e8c" },
              { label: "Avg Score",   val: `${d.totals.avgScore}%`, unit: "", sub: "Across all attempts", color: "var(--amber)", accent: "#f59e0b" },
              { label: "Study Time",  val: Math.floor(d.totals.timeMins/60), unit: "h", sub: `${d.totals.timeMins%60}min remaining`, color: "var(--blue)", accent: "#0ea5e9" },
            ].map(c => (
              <div className="an-card" key={c.label}>
                <div className="an-card-accent" style={{ background: `linear-gradient(90deg,${c.accent},transparent)` }}/>
                <div className="an-card-label">{c.label}</div>
                <div className="an-card-val" style={{ color: c.color }}>
                  {c.val}<span style={{ fontSize: "1.2rem", color: "var(--m)" }}>{c.unit}</span>
                </div>
                <div className="an-card-sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ ROW 1.5: Daily Goal Consistency ══ */}
        <div className="an-section" style={{ animationDelay: ".08s" }}>
          <div className="an-section-label">Goal Consistency</div>
          <div className="an-grid-3-1">

            {/* Bar chart — last 7 days vs target */}
            <div className="an-chart-card">
              <div className="an-chart-title">Daily Goal — Last 7 Days</div>
              <div className="an-chart-sub">Questions completed vs your target of {data.goal.target}/day</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d.goalHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="day" tick={{ fill: "#7a7a90", fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: "#7a7a90", fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <Tooltip
                    contentStyle={{ background:"rgba(19,19,26,.96)", border:"1px solid rgba(233,30,140,.3)", borderRadius:10 }}
                    labelStyle={{ color:"#f0f0f0" }}
                    formatter={(v, n, p) => [`${v} / ${p.payload.target}`, "Questions"]}/>
                  <ReferenceLine y={data.goal.target} stroke="rgba(233,30,140,0.3)" strokeDasharray="4 4"
                    label={{ value:`target ${data.goal.target}`, fill:"#7a3a55", fontSize:10, position:"right" }}/>
                  <Bar dataKey="done" radius={[6,6,0,0]} barSize={28}>
                    {d.goalHistory.map((g, i) => (
                      <Cell key={i} fill={g.done >= g.target ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="an-legend" style={{ marginTop: 10, marginBottom: 0 }}>
                <div className="an-legend-item"><div className="an-legend-dot" style={{ background:"#22c55e" }}/>Goal hit</div>
                <div className="an-legend-item"><div className="an-legend-dot" style={{ background:"#ef4444" }}/>Goal missed</div>
              </div>
            </div>

            {/* Calendar heatmap — last 31 days */}
            <div className="an-chart-card">
              <div className="an-chart-title">31-Day Streak</div>
              <div className="an-chart-sub">
                {d.goalCalendar.filter(x=>x===1).length} of {d.goalCalendar.length} days hit
                · current streak <span style={{ color: "var(--f)", fontWeight: 700 }}>{data.goal.streak} days 🔥</span>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: 6, marginTop: 8,
              }}>
                {d.goalCalendar.map((hit, i) => (
                  <div key={i} title={hit ? "Goal completed" : "Goal missed"}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 6,
                      background: hit ? "rgba(34,197,94,.7)" : "var(--bg3)",
                      border: hit ? "1px solid rgba(34,197,94,.9)" : "1px solid var(--b)",
                      boxShadow: hit ? "0 0 8px rgba(34,197,94,.35)" : "none",
                    }}/>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 16 }}>
                <div style={{ fontSize: 11, color: "var(--m)" }}>
                  Consistency rate
                </div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", color:"var(--green)", letterSpacing:1 }}>
                  {Math.round(d.goalCalendar.filter(x=>x===1).length / d.goalCalendar.length * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ ROW 2: Last 7 Tests ══ */}
        <div className="an-section" style={{ animationDelay: ".1s" }}>
          <div className="an-section-label">Test Progress</div>
          <div className="an-chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div className="an-chart-title">Last 7 Tests — Score & Accuracy</div>
                <div className="an-chart-sub">Track how each attempt performed over time</div>
              </div>
              <div className="an-legend">
                <div className="an-legend-item">
                  <div className="an-legend-dot" style={{ background: "#e91e8c" }}/>Score %
                </div>
                <div className="an-legend-item">
                  <div className="an-legend-dot" style={{ background: "#0ea5e9" }}/>Accuracy %
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.last7Tests} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e91e8c" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#e91e8c" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#7a7a90", fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[40, 100]} tick={{ fill: "#7a7a90", fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<AnTooltip unit1="%" unit2="%"/>}/>
                <ReferenceLine y={70} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4"
                  label={{ value: "70% threshold", fill: "#3a3a50", fontSize: 10, position: "right" }}/>
                <Area type="monotone" dataKey="score" name="Score"
                  stroke="#e91e8c" strokeWidth={2.5} fill="url(#gradScore)"
                  dot={{ fill: "#e91e8c", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#ff3aaa", stroke: "#fff", strokeWidth: 2 }}/>
                <Area type="monotone" dataKey="accuracy" name="Accuracy"
                  stroke="#0ea5e9" strokeWidth={2} fill="url(#gradAcc)"
                  dot={{ fill: "#0ea5e9", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#38bdf8", stroke: "#fff", strokeWidth: 2 }}/>
              </AreaChart>
            </ResponsiveContainer>

            {/* mini test cards below chart */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginTop: 16 }}>
              {d.last7Tests.map((t, i) => (
                <div key={i} style={{
                  padding: "8px 10px", borderRadius: 8,
                  background: "var(--bg3)", border: "1px solid var(--b)",
                  textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 600,
                    color: t.score >= 70 ? "#22c55e" : t.score >= 55 ? "#f59e0b" : "#ef4444" }}>
                    {t.score}%
                  </div>
                  <div style={{ fontSize: 9, color: "var(--m)", marginTop: 2 }}>{t.date}</div>
                  <div style={{ fontSize: 9, color: "var(--m2)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.exam}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ROW 3: Subject Accuracy + Weak Topics ══ */}
        <div className="an-section" style={{ animationDelay: ".2s" }}>
          <div className="an-section-label">Subject Breakdown</div>
          <div className="an-grid-3-1">

            <div className="an-chart-card">
              <div className="an-chart-title">Subject-wise Accuracy</div>
              <div className="an-chart-sub">Performance breakdown for {selectedExam}</div>

              {/* bar chart */}
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={d.subjects} layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0,100]} tick={{ fill: "#7a7a90", fontSize: 10 }}
                    axisLine={false} tickLine={false} tickFormatter={v => `${v}%`}/>
                  <YAxis type="category" dataKey="name" width={140}
                    tick={{ fill: "#7a7a90", fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v) => [`${v}%`, "Accuracy"]}
                    contentStyle={{ background: "rgba(19,19,26,.96)", border: "1px solid rgba(233,30,140,.3)", borderRadius: 10 }}
                    labelStyle={{ color: "#f0f0f0" }} itemStyle={{ color: "#e91e8c" }}/>
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={14}>
                    {d.subjects.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ marginTop: 16 }}>
                <SubjectBars subjects={d.subjects} />
              </div>
            </div>

            <div className="an-chart-card">
              <div className="an-chart-title">Weak Topics</div>
              <div className="an-chart-sub">Focus here to improve overall score</div>
              <WeakTopics topics={d.weakTopics} />
            </div>
          </div>
        </div>

        {/* ══ ROW 3.5: PYQ Test Deep-Dive ══ */}
        <TestDeepDiveSection pyqTests={data.pyqTests} userId={userId} />

        {/* ══ ROW 4: Typing Stat Cards ══ */}
        <div className="an-section" style={{ animationDelay: ".3s" }}>
          <div className="an-section-label">Typing Performance</div>
          <div className="an-grid-4">
            {[
              { label: "Avg Speed",       val: d.typing.avgSpeed,    unit: "WPM", sub: `Over ${d.typing.sessions} sessions`, icon: "⌨️", accent: "#0ea5e9", iconBg: "rgba(14,165,233,.1)" },
              { label: "Highest Speed",   val: d.typing.topSpeed,    unit: "WPM", sub: "Personal best",                      icon: "⚡", accent: "#e91e8c", iconBg: "rgba(233,30,140,.1)" },
              { label: "Avg Accuracy",    val: d.typing.avgAccuracy, unit: "%",   sub: `Over ${d.typing.sessions} sessions`, icon: "🎯", accent: "#22c55e", iconBg: "rgba(34,197,94,.1)"  },
              { label: "Best Accuracy",   val: d.typing.topAccuracy, unit: "%",   sub: "Personal best",                      icon: "🏆", accent: "#f59e0b", iconBg: "rgba(245,158,11,.1)" },
            ].map(c => (
              <div className="an-typing-card"
                key={c.label}
                style={{ borderTopColor: c.accent }}>
                <div className="an-typing-icon" style={{ background: c.iconBg }}>{c.icon}</div>
                <div className="an-typing-lbl">{c.label}</div>
                <div className="an-typing-val" style={{ color: c.accent }}>
                  {c.val}
                  <span className="an-typing-unit">{c.unit}</span>
                </div>
                <div className="an-typing-sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ ROW 5: Speed & Accuracy Trend Charts ══ */}
        <div className="an-section" style={{ animationDelay: ".4s" }}>
          <div className="an-section-label">Typing Trends</div>
          {!hasTyping ? (
            <div className="an-chart-card" style={{ textAlign: "center", padding: "32px 24px" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>⌨️</div>
              <div style={{ color: "var(--m)", fontSize: 13 }}>
                No typing sessions yet — take a typing test to see your speed &amp; accuracy trends here.
              </div>
            </div>
          ) : (
          <div className="an-grid-2">

            {/* Speed Trend */}
            <div className="an-chart-card">
              <div className="an-chart-title">Speed Trend</div>
              <div className="an-chart-sub">WPM across last {d.speedTrend.length} typing sessions</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={d.speedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.28}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="label" tick={{ fill: "#7a7a90", fontSize: 10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: "#7a7a90", fontSize: 10 }} axisLine={false} tickLine={false}/>
                  <Tooltip
                    formatter={(v) => [`${v} WPM`, "Speed"]}
                    contentStyle={{ background:"rgba(19,19,26,.96)", border:"1px solid rgba(14,165,233,.3)", borderRadius:10 }}
                    labelStyle={{ color:"#f0f0f0" }} itemStyle={{ color:"#0ea5e9" }}/>
                  <ReferenceLine y={d.typing.avgSpeed} stroke="rgba(14,165,233,0.25)" strokeDasharray="4 4"
                    label={{ value:`avg ${d.typing.avgSpeed}`, fill:"#3a5a70", fontSize:10, position:"right" }}/>
                  <Area type="monotone" dataKey="wpm" name="Speed"
                    stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gradSpeed)"
                    dot={{ fill: "#0ea5e9", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#38bdf8", stroke: "#fff", strokeWidth: 2 }}/>
                </AreaChart>
              </ResponsiveContainer>

              {/* speed badges */}
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { label: "Avg",  val: `${d.typing.avgSpeed} WPM`,  color: "#0ea5e9" },
                  { label: "Best", val: `${d.typing.topSpeed} WPM`,  color: "#22c55e" },
                  { label: "Gain", val: `+${Math.max(0, d.typing.topSpeed - firstSpeed)} WPM`, color: "#e91e8c" },
                ].map(b => (
                  <div key={b.label} style={{ padding: "5px 12px", borderRadius: 100,
                    background: b.color + "14", border: `1px solid ${b.color}30`,
                    fontSize: 11, fontWeight: 600, color: b.color }}>
                    {b.label}: {b.val}
                  </div>
                ))}
              </div>
            </div>

            {/* Accuracy Trend */}
            <div className="an-chart-card">
              <div className="an-chart-title">Accuracy Trend</div>
              <div className="an-chart-sub">Typing accuracy across last {d.speedTrend.length} sessions</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={d.speedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTypAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="label" tick={{ fill: "#7a7a90", fontSize: 10 }} axisLine={false} tickLine={false}/>
                  <YAxis domain={[80, 100]} tick={{ fill: "#7a7a90", fontSize: 10 }} axisLine={false} tickLine={false}/>
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Accuracy"]}
                    contentStyle={{ background:"rgba(19,19,26,.96)", border:"1px solid rgba(34,197,94,.3)", borderRadius:10 }}
                    labelStyle={{ color:"#f0f0f0" }} itemStyle={{ color:"#22c55e" }}/>
                  <ReferenceLine y={d.typing.avgAccuracy} stroke="rgba(34,197,94,0.2)" strokeDasharray="4 4"
                    label={{ value:`avg ${d.typing.avgAccuracy}%`, fill:"#2a5a3a", fontSize:10, position:"right" }}/>
                  <Line type="monotone" dataKey="accuracy" name="Accuracy"
                    stroke="#22c55e" strokeWidth={2.5}
                    dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#4ade80", stroke: "#fff", strokeWidth: 2 }}/>
                </LineChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { label: "Avg",         val: `${d.typing.avgAccuracy}%`,  color: "#22c55e" },
                  { label: "Best",        val: `${d.typing.topAccuracy}%`,  color: "#0ea5e9" },
                  { label: "Improvement", val: `+${Math.max(0, d.typing.topAccuracy - firstAcc)}%`, color: "#e91e8c" },
                ].map(b => (
                  <div key={b.label} style={{ padding: "5px 12px", borderRadius: 100,
                    background: b.color + "14", border: `1px solid ${b.color}30`,
                    fontSize: 11, fontWeight: 600, color: b.color }}>
                    {b.label}: {b.val}
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>

      </div>
    </div>
  );
}
