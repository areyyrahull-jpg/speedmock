import { useEffect, useMemo } from "react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";

/* ════════════════════════════════════════════════════════════════
   CSS
════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--b:#1e1e2c;
--f:#e91e8c;--fl:#ff3aaa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--purple:#a855f7;
--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}

@keyframes tr-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes tr-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes tr-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes tr-count{from{opacity:0}to{opacity:1}}

.tr-page{min-height:100vh;background:var(--bg);padding:0 0 60px}

/* ── HERO ── */
.tr-hero{
  padding:40px 24px 32px;text-align:center;position:relative;overflow:hidden;
  background:radial-gradient(ellipse 60% 50% at 50% 0%, rgba(233,30,140,.1), transparent 70%);
  animation:tr-rise .4s ease both;
}
.tr-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:10px}
.tr-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:tr-pulse 2s infinite}
.tr-test-name{font-size:13px;color:var(--m);margin-bottom:18px}

.tr-score-ring{position:relative;width:180px;height:180px;margin:0 auto 16px;animation:tr-pop .5s cubic-bezier(.34,1.56,.64,1) both}
.tr-score-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.tr-score-val{font-family:'Bebas Neue',sans-serif;font-size:3.2rem;line-height:1;letter-spacing:1px;color:var(--t)}
.tr-score-max{font-size:13px;color:var(--m);margin-top:2px}
.tr-score-lbl{font-size:9px;color:var(--m);letter-spacing:2px;text-transform:uppercase;margin-top:4px}

.tr-grade-badge{
  display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:100px;
  font-size:13px;font-weight:700;margin-top:4px;animation:tr-rise .5s .1s ease both;
}
.tr-grade-badge.excellent{background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.3)}
.tr-grade-badge.good{background:rgba(245,158,11,.12);color:var(--amber);border:1px solid rgba(245,158,11,.3)}
.tr-grade-badge.poor{background:rgba(239,68,68,.12);color:var(--red);border:1px solid rgba(239,68,68,.3)}

/* ── BODY ── */
.tr-body{padding:24px 40px;max-width:1100px;margin:0 auto}
.tr-section-label{
  font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--m);
  margin-bottom:16px;display:flex;align-items:center;gap:10px;
}
.tr-section-label::after{content:'';flex:1;height:1px;background:var(--b)}
.tr-section{margin-bottom:32px;animation:tr-rise .5s ease both}

/* ── QUICK STATS ── */
.tr-stats-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.tr-stat-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:14px;padding:18px;
  transition:transform .2s,border-color .2s;
}
.tr-stat-card:hover{transform:translateY(-2px);border-color:rgba(233,30,140,.25)}
.tr-stat-icon{font-size:20px;margin-bottom:8px}
.tr-stat-val{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:1px;line-height:1}
.tr-stat-lbl{font-size:10px;color:var(--m);text-transform:uppercase;letter-spacing:1px;margin-top:5px}
.tr-stat-sub{font-size:10px;color:var(--m2);margin-top:3px}

/* ── ACCURACY + TIME GRID ── */
.tr-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.tr-card{background:var(--bg2);border:1px solid var(--b);border-radius:16px;padding:24px}
.tr-card-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:2px;color:var(--t);margin-bottom:4px}
.tr-card-sub{font-size:11px;color:var(--m);margin-bottom:18px;line-height:1.5}

/* accuracy donut center */
.tr-acc-row{display:flex;align-items:center;gap:24px}
.tr-acc-center{position:relative;width:140px;height:140px;flex-shrink:0}
.tr-acc-center-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.tr-acc-pct{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--t);line-height:1}
.tr-acc-lbl{font-size:9px;color:var(--m);letter-spacing:1px;margin-top:2px}

.tr-acc-legend{display:flex;flex-direction:column;gap:10px;flex:1}
.tr-acc-legend-item{display:flex;align-items:center;justify-content:space-between;font-size:12px}
.tr-acc-legend-left{display:flex;align-items:center;gap:8px;color:var(--m)}
.tr-acc-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.tr-acc-legend-val{font-family:'DM Mono',monospace;font-weight:700;color:var(--t)}

/* time breakdown */
.tr-time-total{
  display:flex;align-items:center;justify-content:space-between;
  background:var(--bg3);border:1px solid var(--b);border-radius:12px;padding:16px;margin-bottom:16px;
}
.tr-time-total-val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--t);letter-spacing:1px}
.tr-time-total-lbl{font-size:10px;color:var(--m);text-transform:uppercase;letter-spacing:1px}
.tr-time-total-pace{font-size:11px;padding:4px 10px;border-radius:100px;font-weight:700}
.tr-time-total-pace.fast{background:rgba(34,197,94,.1);color:var(--green)}
.tr-time-total-pace.slow{background:rgba(239,68,68,.1);color:var(--red)}

/* ── SUBJECT TABLE ── */
.tr-table{background:var(--bg2);border:1px solid var(--b);border-radius:16px;overflow:hidden}
.tr-table-row{
  display:grid;grid-template-columns:1.8fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 1fr;gap:10px;
  padding:14px 20px;align-items:center;border-bottom:1px solid var(--b);font-size:12px;
}
.tr-table-row:last-child{border-bottom:none}
.tr-table-row.head{font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--m);background:var(--bg3)}
.tr-table-row.total{font-weight:700;background:rgba(233,30,140,.04)}
.tr-subject-name{display:flex;align-items:center;gap:10px;font-weight:600;color:var(--t)}
.tr-subject-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.tr-num{font-family:'DM Mono',monospace;text-align:center}
.tr-num.correct{color:var(--green)}
.tr-num.wrong{color:var(--red)}
.tr-num.skip{color:var(--m)}

/* accuracy pill in table */
.tr-acc-pill{
  display:inline-flex;align-items:center;justify-content:center;gap:4px;
  padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;font-family:'DM Mono',monospace;
}

/* time bar in table */
.tr-time-cell{display:flex;align-items:center;gap:8px}
.tr-time-bar-track{flex:1;height:5px;background:var(--bg3);border-radius:100px;overflow:hidden;min-width:40px}
.tr-time-bar-fill{height:100%;border-radius:100px;background:var(--blue)}
.tr-time-val{font-family:'DM Mono',monospace;font-size:11px;color:var(--m);white-space:nowrap}

/* ── BAR CHART CARD ── */
.tr-legend{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:4px}
.tr-legend-item{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--m)}
.tr-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

/* ── ACTION BUTTONS ── */
.tr-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.tr-btn{
  padding:13px 28px;border-radius:12px;border:none;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:8px;
}
.tr-btn-primary{background:linear-gradient(135deg,var(--f),var(--fl));color:#fff}
.tr-btn-primary:hover{box-shadow:0 8px 24px rgba(233,30,140,.35);transform:translateY(-2px)}
.tr-btn-ghost{background:var(--bg2);color:var(--t);border:1px solid var(--b)}
.tr-btn-ghost:hover{border-color:rgba(233,30,140,.3)}

@media(max-width:900px){
  .tr-body{padding:20px}
  .tr-stats-grid{grid-template-columns:repeat(2,1fr)}
  .tr-grid-2{grid-template-columns:1fr}
  .tr-acc-row{flex-direction:column;text-align:center}
  .tr-table-row{grid-template-columns:1.4fr 1fr 1fr 1fr;font-size:11px}
  .tr-table-row > :nth-child(5),
  .tr-table-row > :nth-child(7){display:none}
}
@media(max-width:480px){
  .tr-stats-grid{grid-template-columns:1fr 1fr}
  .tr-score-ring{width:150px;height:150px}
  .tr-score-val{font-size:2.6rem}
}
`;

const inject = () => {
  if (document.getElementById("tr-css")) return;
  const s = document.createElement("style");
  s.id = "tr-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ════════════════════════════════════════════════════════════════
   DEMO DATA — shape matches what TestScreen.onSubmit + scoring
   would produce. Replace via props in real usage.
════════════════════════════════════════════════════════════════ */
const DEMO_RESULT = {
  testName: "SSC CGL Mock Test #14",
  marksPerQ: 2,
  negativeMarking: 0.5,
  totalQuestions: 100,
  correct: 58,
  wrong: 22,
  unattempted: 20,
  totalTimeSecs: 3600,        // allotted
  timeTakenSecs: 3210,        // actually used
  rank: 142,
  totalCandidates: 4380,
  sections: [
    { name: "General Intelligence & Reasoning", color: "#0ea5e9", total: 25, correct: 17, wrong: 5, unattempted: 3, timeTakenSecs: 820 },
    { name: "General Awareness",                color: "#f59e0b", total: 25, correct: 12, wrong: 8, unattempted: 5, timeTakenSecs: 540 },
    { name: "Quantitative Aptitude",            color: "#22c55e", total: 25, correct: 16, wrong: 6, unattempted: 3, timeTakenSecs: 1180 },
    { name: "English Comprehension",            color: "#e91e8c", total: 25, correct: 13, wrong: 3, unattempted: 9, timeTakenSecs: 670 },
  ],
};

/* ─── HELPERS ──────────────────────────────────────────────────── */
const fmtTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2,"0")}s`;
};

const getGrade = (pct) => {
  if (pct >= 70) return { label: "Excellent! 🎉", cls: "excellent" };
  if (pct >= 45) return { label: "Good Attempt 👍", cls: "good" };
  return { label: "Needs Practice 💪", cls: "poor" };
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
/**
 * Props:
 *  result: {
 *    testName, marksPerQ, negativeMarking,
 *    totalQuestions, correct, wrong, unattempted,
 *    totalTimeSecs, timeTakenSecs,
 *    rank, totalCandidates,
 *    sections: [{ name, color, total, correct, wrong, unattempted, timeTakenSecs }]
 *  }
 *  onRetake: fn()
 *  onViewSolutions: fn()
 *  onBackToDashboard: fn()
 */
export default function TestResult({
  result = DEMO_RESULT,
  onRetake,
  onViewSolutions,
  onBackToDashboard,
}) {
  useEffect(() => { inject(); }, []);

  const r = result;
  const marksGained = r.correct * r.marksPerQ;
  const marksLost   = r.wrong * r.negativeMarking;
  const score       = +(marksGained - marksLost).toFixed(2);
  const maxMarks    = r.totalQuestions * r.marksPerQ;
  const scorePct    = Math.max(0, Math.min(100, Math.round((score / maxMarks) * 100)));

  const attempted   = r.correct + r.wrong;
  const accuracy    = attempted > 0 ? Math.round((r.correct / attempted) * 100) : 0;
  const percentile  = r.rank && r.totalCandidates
    ? (100 - (r.rank / r.totalCandidates) * 100).toFixed(1)
    : null;

  const grade = getGrade(scorePct);

  // donut data for score ring
  const donutData = [{ name: "score", value: scorePct, fill: scoreColor(scorePct) }];

  // accuracy breakdown for legend
  const accBreakdown = [
    { label: "Correct",     value: r.correct,     color: "var(--green)" },
    { label: "Wrong",       value: r.wrong,       color: "var(--red)" },
    { label: "Unattempted", value: r.unattempted, color: "var(--m2)" },
  ];

  // time per section for bar chart
  const timeChartData = r.sections.map(s => ({
    name: s.name.split(" ").slice(0,2).join(" "),
    mins: +(s.timeTakenSecs / 60).toFixed(1),
    fill: s.color,
  }));

  const avgTimePerQ = r.timeTakenSecs / r.totalQuestions;
  const totalTimeMins = Math.round(r.timeTakenSecs / 60);
  const allottedMins  = Math.round(r.totalTimeSecs / 60);
  const timeUsedPct   = Math.round((r.timeTakenSecs / r.totalTimeSecs) * 100);

  return (
    <div className="tr-page">

      {/* ── HERO ── */}
      <div className="tr-hero">
        <div className="tr-eyebrow"><span className="tr-dot"/>Test Result</div>
        <div className="tr-test-name">{r.testName}</div>

        <div className="tr-score-ring">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={donutData} startAngle={90} endAngle={-270}
              innerRadius="78%" outerRadius="100%"
            >
              <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false}/>
              <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#1a1a24" }} angleAxisId={0}/>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="tr-score-center">
            <div className="tr-score-val">{score}</div>
            <div className="tr-score-max">/ {maxMarks} marks</div>
            <div className="tr-score-lbl">{scorePct}% SCORE</div>
          </div>
        </div>

        <div className={`tr-grade-badge ${grade.cls}`}>{grade.label}</div>

        {r.rank && (
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--m)" }}>
            Rank <strong style={{ color: "var(--t)" }}>#{r.rank}</strong> of {r.totalCandidates?.toLocaleString()}
            {percentile && <> · <strong style={{ color: "var(--f)" }}>{percentile} percentile</strong></>}
          </div>
        )}
      </div>

      <div className="tr-body">

        {/* ── QUICK STATS ── */}
        <div className="tr-section">
          <div className="tr-stats-grid">
            <div className="tr-stat-card">
              <div className="tr-stat-icon">✅</div>
              <div className="tr-stat-val" style={{ color: "var(--green)" }}>{r.correct}</div>
              <div className="tr-stat-lbl">Correct</div>
              <div className="tr-stat-sub">+{marksGained} marks</div>
            </div>
            <div className="tr-stat-card">
              <div className="tr-stat-icon">❌</div>
              <div className="tr-stat-val" style={{ color: "var(--red)" }}>{r.wrong}</div>
              <div className="tr-stat-lbl">Wrong</div>
              <div className="tr-stat-sub">-{marksLost} marks</div>
            </div>
            <div className="tr-stat-card">
              <div className="tr-stat-icon">⬜</div>
              <div className="tr-stat-val" style={{ color: "var(--m)" }}>{r.unattempted}</div>
              <div className="tr-stat-lbl">Skipped</div>
              <div className="tr-stat-sub">0 marks</div>
            </div>
            <div className="tr-stat-card">
              <div className="tr-stat-icon">🎯</div>
              <div className="tr-stat-val" style={{ color: "var(--f)" }}>{accuracy}%</div>
              <div className="tr-stat-lbl">Accuracy</div>
              <div className="tr-stat-sub">{r.correct}/{attempted} attempted</div>
            </div>
            <div className="tr-stat-card">
              <div className="tr-stat-icon">⏱️</div>
              <div className="tr-stat-val" style={{ color: "var(--blue)" }}>{totalTimeMins}<span style={{fontSize:"1.1rem",color:"var(--m)"}}>m</span></div>
              <div className="tr-stat-lbl">Time Taken</div>
              <div className="tr-stat-sub">of {allottedMins}m · {timeUsedPct}% used</div>
            </div>
          </div>
        </div>

        {/* ── ACCURACY + TIME OVERVIEW ── */}
        <div className="tr-section">
          <div className="tr-section-label">Overview</div>
          <div className="tr-grid-2">

            {/* overall accuracy donut */}
            <div className="tr-card">
              <div className="tr-card-title">Overall Accuracy</div>
              <div className="tr-card-sub">Based on attempted questions only</div>

              <div className="tr-acc-row">
                <div className="tr-acc-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={[{ value: accuracy, fill: scoreColor(accuracy) }]}
                      startAngle={90} endAngle={-270}
                      innerRadius="74%" outerRadius="100%"
                    >
                      <PolarAngleAxis type="number" domain={[0,100]} tick={false}/>
                      <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#1a1a24" }}/>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="tr-acc-center-text">
                    <div className="tr-acc-pct">{accuracy}%</div>
                    <div className="tr-acc-lbl">ACCURACY</div>
                  </div>
                </div>

                <div className="tr-acc-legend">
                  {accBreakdown.map(item => (
                    <div className="tr-acc-legend-item" key={item.label}>
                      <div className="tr-acc-legend-left">
                        <span className="tr-acc-legend-dot" style={{ background: item.color }}/>
                        {item.label}
                      </div>
                      <span className="tr-acc-legend-val">{item.value} Qs</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--b)", margin: "4px 0" }}/>
                  <div className="tr-acc-legend-item">
                    <div className="tr-acc-legend-left">Total Questions</div>
                    <span className="tr-acc-legend-val">{r.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* time breakdown */}
            <div className="tr-card">
              <div className="tr-card-title">Time Management</div>
              <div className="tr-card-sub">How your time was distributed across sections</div>

              <div className="tr-time-total">
                <div>
                  <div className="tr-time-total-val">{fmtTime(r.timeTakenSecs)}</div>
                  <div className="tr-time-total-lbl">Total Time Used</div>
                </div>
                <div className={`tr-time-total-pace ${timeUsedPct <= 90 ? "fast" : "slow"}`}>
                  {timeUsedPct <= 90 ? `✓ ${allottedMins - totalTimeMins}m saved` : "⚠ Ran close to limit"}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={timeChartData} layout="vertical" margin={{ top:0, right:30, left:0, bottom:0 }}>
                  <XAxis type="number" tick={{ fill:"#7a7a90", fontSize:10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}m`}/>
                  <YAxis type="category" dataKey="name" width={130} tick={{ fill:"#7a7a90", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v)=>[`${v} min`, "Time"]}
                    contentStyle={{ background:"rgba(19,19,26,.96)", border:"1px solid rgba(233,30,140,.3)", borderRadius:10 }}
                    labelStyle={{ color:"#f0f0f0" }}/>
                  <Bar dataKey="mins" radius={[0,6,6,0]} barSize={16}>
                    {timeChartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                    <LabelList dataKey="mins" position="right" formatter={(v)=>`${v}m`}
                      style={{ fill:"#7a7a90", fontSize:10, fontFamily:"DM Mono, monospace" }}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ fontSize: 11, color: "var(--m)", marginTop: 10, textAlign: "center" }}>
                Avg. <strong style={{ color: "var(--t)" }}>{avgTimePerQ.toFixed(1)}s</strong> per question
              </div>
            </div>
          </div>
        </div>

        {/* ── SUBJECT-WISE TABLE ── */}
        <div className="tr-section">
          <div className="tr-section-label">Subject-wise Breakdown</div>
          <div className="tr-table">
            <div className="tr-table-row head">
              <div>Subject</div>
              <div className="tr-num">Correct</div>
              <div className="tr-num">Wrong</div>
              <div className="tr-num">Skip</div>
              <div className="tr-num">Marks</div>
              <div>Accuracy</div>
              <div>Time</div>
            </div>

            {r.sections.map(sec => {
              const secAttempted = sec.correct + sec.wrong;
              const secAcc = secAttempted > 0 ? Math.round((sec.correct / secAttempted) * 100) : 0;
              const secMarks = +(sec.correct * r.marksPerQ - sec.wrong * r.negativeMarking).toFixed(2);
              const secMax = sec.total * r.marksPerQ;
              const timePct = Math.min(100, Math.round((sec.timeTakenSecs / r.timeTakenSecs) * 100));

              return (
                <div className="tr-table-row" key={sec.name}>
                  <div className="tr-subject-name">
                    <span className="tr-subject-dot" style={{ background: sec.color }}/>
                    {sec.name}
                  </div>
                  <div className="tr-num correct">{sec.correct}</div>
                  <div className="tr-num wrong">{sec.wrong}</div>
                  <div className="tr-num skip">{sec.unattempted}</div>
                  <div className="tr-num" style={{ color: "var(--t)", fontWeight: 700 }}>
                    {secMarks}/{secMax}
                  </div>
                  <div>
                    <span className="tr-acc-pill" style={{
                      background: scoreColor(secAcc) + "1a",
                      color: scoreColor(secAcc),
                    }}>{secAcc}%</span>
                  </div>
                  <div className="tr-time-cell">
                    <div className="tr-time-bar-track">
                      <div className="tr-time-bar-fill" style={{ width: `${timePct}%`, background: sec.color }}/>
                    </div>
                    <span className="tr-time-val">{fmtTime(sec.timeTakenSecs)}</span>
                  </div>
                </div>
              );
            })}

            {/* TOTAL row */}
            <div className="tr-table-row total">
              <div className="tr-subject-name">TOTAL</div>
              <div className="tr-num correct">{r.correct}</div>
              <div className="tr-num wrong">{r.wrong}</div>
              <div className="tr-num skip">{r.unattempted}</div>
              <div className="tr-num" style={{ color: "var(--t)" }}>{score}/{maxMarks}</div>
              <div>
                <span className="tr-acc-pill" style={{ background: scoreColor(accuracy)+"1a", color: scoreColor(accuracy) }}>{accuracy}%</span>
              </div>
              <div className="tr-time-val" style={{ fontWeight: 700, color: "var(--t)" }}>{fmtTime(r.timeTakenSecs)}</div>
            </div>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="tr-actions">
          <button className="tr-btn tr-btn-ghost" onClick={onBackToDashboard}>← Dashboard</button>
          <button className="tr-btn tr-btn-ghost" onClick={onViewSolutions}>📖 View Solutions</button>
          <button className="tr-btn tr-btn-primary" onClick={onRetake}>🔄 Retake Test</button>
        </div>
      </div>
    </div>
  );
}

/* color scale for score/accuracy */
function scoreColor(pct) {
  if (pct >= 70) return "#22c55e";
  if (pct >= 45) return "#f59e0b";
  return "#ef4444";
}
