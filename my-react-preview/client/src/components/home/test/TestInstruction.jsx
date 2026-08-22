import { useState, useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--b:#1e1e2c;--f:#e91e8c;--fl:#ff3aaa;
--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}
@keyframes ti-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes ti-pulse{0%,100%{opacity:1}50%{opacity:.5}}

.ti-page{min-height:100vh;background:var(--bg);padding:36px 24px;display:flex;justify-content:center}
.ti-wrap{max-width:880px;width:100%}

.ti-header{text-align:center;margin-bottom:28px;animation:ti-rise .4s ease both}
.ti-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:8px}
.ti-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:ti-pulse 2s infinite}
.ti-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);letter-spacing:3px;color:var(--t);line-height:1.1}
.ti-sub{font-size:13px;color:var(--m);margin-top:8px}

.ti-card{background:var(--bg2);border:1px solid var(--b);border-radius:18px;padding:24px;margin-bottom:18px;
animation:ti-rise .5s ease both}
.ti-card-title{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;color:var(--t);
margin-bottom:14px;display:flex;align-items:center;gap:10px}

/* test meta grid */
.ti-meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.ti-meta-item{background:var(--bg3);border:1px solid var(--b);border-radius:12px;padding:16px;text-align:center}
.ti-meta-icon{font-size:22px;margin-bottom:8px}
.ti-meta-val{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--t);letter-spacing:1px}
.ti-meta-lbl{font-size:10px;color:var(--m);letter-spacing:1px;text-transform:uppercase;margin-top:2px}

/* sections breakdown */
.ti-sections{display:flex;flex-direction:column;gap:8px}
.ti-section-row{display:flex;align-items:center;justify-content:space-between;
padding:11px 16px;background:var(--bg3);border:1px solid var(--b);border-radius:10px}
.ti-section-name{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--t)}
.ti-section-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ti-section-meta{font-size:12px;color:var(--m);font-family:'DM Mono',monospace}

/* marking scheme */
.ti-mark-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.ti-mark-item{background:var(--bg3);border:1px solid var(--b);border-radius:12px;padding:14px;text-align:center}
.ti-mark-val{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:1px}
.ti-mark-lbl{font-size:10px;color:var(--m);text-transform:uppercase;letter-spacing:1px;margin-top:4px}

/* instructions list */
.ti-list{display:flex;flex-direction:column;gap:10px}
.ti-list-item{display:flex;gap:12px;font-size:13px;color:var(--m);line-height:1.6}
.ti-list-num{width:22px;height:22px;border-radius:50%;background:rgba(233,30,140,.1);
color:var(--f);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}

/* status legend */
.ti-legend-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.ti-legend-item{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--m)}
.ti-legend-box{width:22px;height:22px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
font-size:10px;font-weight:700;color:#fff;border:1px solid}

/* language toggle */
.ti-lang{display:flex;background:var(--bg3);border:1px solid var(--b);border-radius:9px;padding:4px;width:fit-content}
.ti-lang-btn{padding:8px 18px;border-radius:7px;border:none;font-size:12px;font-weight:700;cursor:pointer;
background:transparent;color:var(--m);font-family:'Outfit',sans-serif;transition:all .2s}
.ti-lang-btn.active{background:var(--f);color:#fff}

/* checkbox agree */
.ti-agree{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--bg3);
border:1px solid var(--b);border-radius:12px;cursor:pointer;margin-top:6px;transition:border-color .2s}
.ti-agree.checked{border-color:rgba(233,30,140,.4)}
.ti-checkbox{width:20px;height:20px;border-radius:5px;border:2px solid var(--m2);flex-shrink:0;
display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;transition:all .2s}
.ti-checkbox.checked{background:var(--f);border-color:var(--f)}
.ti-agree-text{font-size:12px;color:var(--m)}

/* start button */
.ti-start-btn{width:100%;padding:16px;border-radius:12px;border:none;
background:linear-gradient(135deg,var(--f),var(--fl));color:#fff;
font-size:15px;font-weight:800;letter-spacing:1px;cursor:pointer;
display:flex;align-items:center;justify-content:center;gap:10px;
transition:all .2s;margin-top:18px;animation:ti-rise .6s ease both}
.ti-start-btn:hover:not(:disabled){box-shadow:0 8px 28px rgba(233,30,140,.4);transform:translateY(-2px)}
.ti-start-btn:disabled{opacity:.4;cursor:not-allowed}

@media(max-width:700px){
  .ti-meta-grid{grid-template-columns:repeat(2,1fr)}
  .ti-mark-grid{grid-template-columns:1fr}
  .ti-legend-grid{grid-template-columns:1fr}
}
`;

const inject = () => {
  if (document.getElementById("ti-css")) return;
  const s = document.createElement("style");
  s.id = "ti-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ─── DEMO TEST CONFIG (replace via props/API) ──────────────────── */
const DEFAULT_TEST = {
  examName: "SSC CGL Tier-I",
  testName: "Mock Test #14 — Full Length",
  totalQuestions: 100,
  totalMarks: 200,
  durationMins: 60,
  negativeMarking: 0.5,
  marksPerQ: 2,
  sections: [
    { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 25, time: null },
    { name: "General Awareness",                color: "#f59e0b", questions: 25, time: null },
    { name: "Quantitative Aptitude",            color: "#22c55e", questions: 25, time: null },
    { name: "English Comprehension",            color: "#e91e8c", questions: 25, time: null },
  ],
};

export default function TestInstructions({ test = DEFAULT_TEST, onStart }) {
  useEffect(() => { inject(); }, []);
  const [lang, setLang] = useState("en");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="ti-page">
      <div className="ti-wrap">

        {/* HEADER */}
        <div className="ti-header">
          <div className="ti-eyebrow"><span className="ti-dot"/>Test Instructions</div>
          <h1 className="ti-h1">{test.testName}</h1>
          <div className="ti-sub">{test.examName} · Read carefully before starting</div>
        </div>

        {/* TEST META */}
        <div className="ti-card">
          <div className="ti-card-title">📋 Test Overview</div>
          <div className="ti-meta-grid">
            <div className="ti-meta-item">
              <div className="ti-meta-icon">⏱️</div>
              <div className="ti-meta-val">{test.durationMins}</div>
              <div className="ti-meta-lbl">Minutes</div>
            </div>
            <div className="ti-meta-item">
              <div className="ti-meta-icon">📝</div>
              <div className="ti-meta-val">{test.totalQuestions}</div>
              <div className="ti-meta-lbl">Questions</div>
            </div>
            <div className="ti-meta-item">
              <div className="ti-meta-icon">🎯</div>
              <div className="ti-meta-val">{test.totalMarks}</div>
              <div className="ti-meta-lbl">Total Marks</div>
            </div>
            <div className="ti-meta-item">
              <div className="ti-meta-icon">📊</div>
              <div className="ti-meta-val">{test.sections.length}</div>
              <div className="ti-meta-lbl">Sections</div>
            </div>
          </div>
        </div>

        {/* SECTIONS */}
        <div className="ti-card">
          <div className="ti-card-title">📚 Section-wise Breakdown</div>
          <div className="ti-sections">
            {test.sections.map((s, i) => (
              <div className="ti-section-row" key={i}>
                <div className="ti-section-name">
                  <span className="ti-section-dot" style={{ background: s.color }}/>
                  {s.name}
                </div>
                <div className="ti-section-meta">{s.questions} Qs · {s.questions * test.marksPerQ} marks</div>
              </div>
            ))}
          </div>
        </div>

        {/* MARKING SCHEME */}
        <div className="ti-card">
          <div className="ti-card-title">⚖️ Marking Scheme</div>
          <div className="ti-mark-grid">
            <div className="ti-mark-item">
              <div className="ti-mark-val" style={{ color: "var(--green)" }}>+{test.marksPerQ}</div>
              <div className="ti-mark-lbl">Correct Answer</div>
            </div>
            <div className="ti-mark-item">
              <div className="ti-mark-val" style={{ color: "var(--red)" }}>-{test.negativeMarking}</div>
              <div className="ti-mark-lbl">Wrong Answer</div>
            </div>
            <div className="ti-mark-item">
              <div className="ti-mark-val" style={{ color: "var(--m)" }}>0</div>
              <div className="ti-mark-lbl">Not Attempted</div>
            </div>
          </div>
        </div>

        {/* QUESTION STATUS LEGEND */}
        <div className="ti-card">
          <div className="ti-card-title">🎨 Question Status Guide</div>
          <div className="ti-legend-grid">
            <div className="ti-legend-item">
              <div className="ti-legend-box" style={{ background: "var(--bg3)", borderColor: "var(--m2)", color: "var(--m)" }}>1</div>
              Not Visited
            </div>
            <div className="ti-legend-item">
              <div className="ti-legend-box" style={{ background: "var(--red)", borderColor: "var(--red)" }}>2</div>
              Not Answered
            </div>
            <div className="ti-legend-item">
              <div className="ti-legend-box" style={{ background: "var(--green)", borderColor: "var(--green)" }}>3</div>
              Answered
            </div>
            <div className="ti-legend-item">
              <div className="ti-legend-box" style={{ background: "#a855f7", borderColor: "#a855f7" }}>4</div>
              Marked for Review
            </div>
            <div className="ti-legend-item" style={{ gridColumn: "span 2" }}>
              <div className="ti-legend-box" style={{ background: "#a855f7", borderColor: "var(--green)", position: "relative" }}>
                5
                <span style={{ position: "absolute", bottom: -2, right: -2, width: 9, height: 9, borderRadius: "50%", background: "var(--green)", border: "1.5px solid var(--bg2)" }}/>
              </div>
              Answered &amp; Marked for Review (will be considered for evaluation)
            </div>
          </div>
        </div>

        {/* GENERAL INSTRUCTIONS */}
        <div className="ti-card">
          <div className="ti-card-title">📜 General Instructions</div>
          <div className="ti-list">
            {[
              "The countdown timer at the top right shows remaining time. Test auto-submits when time expires.",
              "Click on a question number in the palette (right side) to jump directly to it.",
              "Click 'Save & Next' to save your answer and move to the next question.",
              "Click 'Mark for Review & Next' to flag a question for later — your answer (if any) is saved.",
              "Click 'Clear Response' to deselect a chosen option for the current question.",
              "Use the section tabs to switch between subjects. You can revisit any section anytime before submitting.",
              "Do not refresh or close the browser tab — your progress is auto-saved every 30 seconds.",
            ].map((txt, i) => (
              <div className="ti-list-item" key={i}>
                <span className="ti-list-num">{i+1}</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LANGUAGE SELECT */}
        <div className="ti-card">
          <div className="ti-card-title">🌐 Choose Question Language</div>
          <div className="ti-lang">
            <button className={`ti-lang-btn${lang==="en"?" active":""}`} onClick={()=>setLang("en")}>English</button>
            <button className={`ti-lang-btn${lang==="hi"?" active":""}`} onClick={()=>setLang("hi")}>हिंदी</button>
          </div>
          <div style={{ fontSize:11, color:"var(--m)", marginTop:10 }}>
            You can switch the language anytime during the test from the top bar.
          </div>
        </div>

        {/* AGREE CHECKBOX */}
        <div className={`ti-agree${agreed?" checked":""}`} onClick={()=>setAgreed(a=>!a)}>
          <div className={`ti-checkbox${agreed?" checked":""}`}>{agreed ? "✓" : ""}</div>
          <div className="ti-agree-text">
            I have read and understood the instructions. I agree that in case of
            any discrepancy, the decision of SpeedMock will be final. I am aware
            that switching tabs or exiting fullscreen may be flagged.
          </div>
        </div>

        {/* START BUTTON */}
        <button
          className="ti-start-btn"
          disabled={!agreed}
          onClick={() => onStart?.({ language: lang })}
        >
          🚀 Start Test — {test.durationMins} Minutes
        </button>
      </div>
    </div>
  );
}
