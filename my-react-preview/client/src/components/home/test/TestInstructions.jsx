// TestInstructions.jsx
// ─────────────────────────────────────────────────────────────────
//  Pre-test instructions screen shown by TestRunner before TestScreen.
//  Receives the loaded test (name, duration, marking, sections,
//  questions) and calls onStart({ language }) when the candidate is
//  ready to begin.
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
.ti-page{min-height:100vh;background:#0b0b10;color:#f0f0f0;font-family:'Outfit',sans-serif;
  padding:40px 20px;display:flex;justify-content:center}
.ti-card{width:100%;max-width:720px;background:#13131a;border:1px solid #1e1e2c;border-radius:18px;
  padding:32px;animation:ti-rise .4s ease both}
@keyframes ti-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.ti-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#e91e8c;margin-bottom:8px}
.ti-h1{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:2px;line-height:1.1;margin-bottom:6px}
.ti-sub{font-size:13px;color:#7a7a90;margin-bottom:24px}
.ti-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.ti-stat{background:#1a1a24;border:1px solid #1e1e2c;border-radius:12px;padding:16px;text-align:center}
.ti-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:#e91e8c;letter-spacing:1px}
.ti-stat-lbl{font-size:10px;color:#7a7a90;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.ti-section-label{font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#7a7a90;
  margin:20px 0 12px;display:flex;align-items:center;gap:10px}
.ti-section-label::after{content:'';flex:1;height:1px;background:#1e1e2c}
.ti-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.ti-list li{font-size:13px;color:#c8c8d4;line-height:1.6;display:flex;gap:10px}
.ti-list li::before{content:'•';color:#e91e8c;font-weight:700}
.ti-sections{display:flex;flex-direction:column;gap:8px}
.ti-sec-row{display:flex;align-items:center;justify-content:space-between;background:#1a1a24;
  border:1px solid #1e1e2c;border-radius:10px;padding:12px 16px;font-size:13px}
.ti-sec-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:10px}
.ti-lang{display:flex;gap:8px;margin:8px 0 24px}
.ti-lang-btn{padding:9px 18px;border-radius:9px;border:1px solid #1e1e2c;background:#1a1a24;color:#7a7a90;
  font-size:12px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s}
.ti-lang-btn.active{background:rgba(233,30,140,.12);border-color:rgba(233,30,140,.35);color:#e91e8c}
.ti-agree{display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:#c8c8d4;margin-bottom:20px;cursor:pointer}
.ti-agree input{margin-top:2px;accent-color:#e91e8c}
.ti-start{width:100%;padding:14px;border-radius:11px;border:none;font-size:14px;font-weight:800;cursor:pointer;
  font-family:'Outfit',sans-serif;background:linear-gradient(135deg,#e91e8c,#ff3aaa);color:#fff;transition:all .2s;letter-spacing:.5px}
.ti-start:disabled{opacity:.4;cursor:not-allowed}
.ti-start:not(:disabled):hover{box-shadow:0 8px 24px rgba(233,30,140,.4);transform:translateY(-2px)}
`;

const inject = () => {
  if (document.getElementById("ti-css")) return;
  const s = document.createElement("style");
  s.id = "ti-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

export default function TestInstructions({ test, onStart }) {
  useEffect(() => { inject(); }, []);

  const [language, setLanguage] = useState("en");
  const [agreed, setAgreed] = useState(false);

  const questions = test?.questions || [];
  const sections = test?.sections || [];
  const totalQ = questions.length;
  const marksPerQ = test?.marksPerQ ?? 1;
  const totalMarks = totalQ * marksPerQ;

  return (
    <div className="ti-page">
      <div className="ti-card">
        <div className="ti-eyebrow">Instructions</div>
        <h1 className="ti-h1">{test?.testName || "Test"}</h1>
        <div className="ti-sub">Read the instructions carefully before you begin.</div>

        <div className="ti-stats">
          <div className="ti-stat">
            <div className="ti-stat-val">{totalQ}</div>
            <div className="ti-stat-lbl">Questions</div>
          </div>
          <div className="ti-stat">
            <div className="ti-stat-val">{totalMarks}</div>
            <div className="ti-stat-lbl">Marks</div>
          </div>
          <div className="ti-stat">
            <div className="ti-stat-val">{test?.durationMins ?? "—"}</div>
            <div className="ti-stat-lbl">Minutes</div>
          </div>
        </div>

        {sections.length > 0 && (
          <>
            <div className="ti-section-label">Sections</div>
            <div className="ti-sections">
              {sections.map((s, i) => (
                <div className="ti-sec-row" key={s.id || i}>
                  <span>
                    <span className="ti-sec-dot" style={{ background: s.color || "#e91e8c" }} />
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ti-section-label">Key Points</div>
        <ul className="ti-list">
          <li>The timer starts as soon as you begin and the test auto-submits when it ends.</li>
          <li>Each correct answer awards {marksPerQ} mark{marksPerQ === 1 ? "" : "s"};
            {" "}{test?.negativeMarking ? `${test.negativeMarking} is deducted for each wrong answer.` : "there is no negative marking."}</li>
          <li>You can mark questions for review and revisit them before submitting.</li>
          <li>Do not refresh or close the tab — resume is not supported for this test.</li>
        </ul>

        <div className="ti-section-label">Language</div>
        <div className="ti-lang">
          {[{ id: "en", label: "English" }, { id: "hi", label: "हिंदी" }].map(l => (
            <button
              key={l.id}
              className={`ti-lang-btn${language === l.id ? " active" : ""}`}
              onClick={() => setLanguage(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <label className="ti-agree">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          I have read and understood the instructions and am ready to begin the test.
        </label>

        <button
          className="ti-start"
          disabled={!agreed || totalQ === 0}
          onClick={() => onStart?.({ language })}
        >
          🚀 Start Test
        </button>
      </div>
    </div>
  );
}
