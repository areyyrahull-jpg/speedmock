import { useState, useEffect, useRef, useCallback } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import { useLocation, useNavigate } from "react-router-dom";

/* ─── PASSAGES ───────────────────────────────────────────────────── */
const passages = [
  "The Indian government has taken several steps to improve the infrastructure of the country. Roads, railways, and airways have been developed to connect remote areas with major cities. The economy is growing at a steady pace and new opportunities are being created for the youth of the nation.",
  "Education plays a vital role in the development of any nation. A well educated population can contribute significantly to the growth of the country. The government has launched several schemes to promote literacy and provide quality education to children in rural and urban areas.",
  "Science and technology have transformed the way people live and work. Modern inventions have made life easier and more comfortable for millions of people around the world. The internet has connected people across different countries and has opened new avenues for communication and trade.",
  "Agriculture is the backbone of the Indian economy. A large portion of the population depends on farming for their livelihood. The government has introduced various schemes to help farmers increase their productivity and improve their standard of living through modern techniques.",
  "The constitution of India guarantees fundamental rights to all citizens. Every person has the right to equality before the law regardless of their caste religion or gender. The judiciary plays an important role in protecting these rights and ensuring justice for all people.",
  "Health is the most important asset a person can have. A healthy body and mind are essential for leading a productive and fulfilling life. The government has established hospitals and health centres across the country to provide affordable medical care to all sections of society.",
  "Environmental protection has become one of the most pressing challenges of our time. Pollution and climate change are threatening the natural balance of our planet. It is the responsibility of every citizen to take care of the environment and preserve it for future generations.",
  "Sports play an important role in building character and promoting physical fitness among the youth. The government has been investing in sports infrastructure and training programmes to help Indian athletes compete at the international level and bring glory to the nation.",
];

function getPassage() {
  return passages[Math.floor(Math.random() * passages.length)];
}

function calcWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds === 0) return 0;
  const words = correctChars / 5;
  const minutes = elapsedSeconds / 60;
  return Math.round(words / minutes);
}

function calcAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/* ─── RESULT SCREEN ─────────────────────────────────────────────── */
function ResultScreen({ stats, duration, onRetry, onNewPassage, onBack }) {
  const grade =
    stats.wpm >= 50 ? { label: "Excellent", color: "#22c55e", icon: "🏆" } :
    stats.wpm >= 35 ? { label: "Good",      color: "#4db6f7", icon: "🎯" } :
    stats.wpm >= 20 ? { label: "Average",   color: "var(--hinb)", icon: "📈" } :
                      { label: "Keep Going",color: "#ef4444", icon: "💪" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--g9)", display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      backgroundImage:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(233,30,140,0.1) 0%,transparent 60%)" }}>
      <style>{`
:root{
          --f:#e91e8c;--fb:#ff3aaa;--fd:#b5005f;
          --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;--g7:#252532;
          --g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
          --hin:#ff6f00;--hinb:#ffa726;--hind:#e65100;
        }


        [data-pqtheme="light"]{
          --g9:#f5f5f8;--g8:#ffffff;--g75:#eeeef4;--g7:#e4e4ec;
          --g6:#d4d4df;--g4:#6b6b80;--g3:#5a5a70;--g2:#1a1a2e;--w:#ffffff;
          --f:#c026d3;--fb:#d946ef;--fd:#9c1abf;
          --hin:#b45309;--hinb:#d97706;--hind:#92400e;
        }
        [data-pqtheme="yellow"]{
          --g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;--g7:#ddd0a8;
          --g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#2e1f0a;--w:#f4ecd8;
          --f:#b45309;--fb:#d97706;--fd:#92400e;
          --hin:#b45309;--hinb:#d97706;--hind:#92400e;
        }
        [data-pqtheme] .page,[data-pqtheme] .practice-page,[data-pqtheme]{background:var(--g9)!important;color:var(--g2)!important}
        [data-pqtheme] *{transition:background .2s ease,color .15s ease,border-color .15s ease}
        .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px;flex-shrink:0}
        .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
        .pq-theme-btn:hover{opacity:.85}
        .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.08);box-shadow:0 0 0 1px var(--g6)}

        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes popIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif;background:var(--g9)}
      `}</style>

      <div style={{ width:"100%", maxWidth:580, animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>

        {/* Grade badge */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:"3.5rem", marginBottom:8 }}>{grade.icon}</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", letterSpacing:3,
            color:grade.color, filter:`drop-shadow(0 0 20px ${grade.color}88)` }}>
            {grade.label}
          </div>
          <div style={{ fontSize:"0.78rem", color:"var(--g4)", letterSpacing:"2px", textTransform:"uppercase", marginTop:4 }}>
            {duration} minute practice complete
          </div>
        </div>

        {/* Main stats */}
        <div style={{ background:"var(--g8)", border:"1px solid rgba(233,30,140,0.2)", borderRadius:20, overflow:"hidden", marginBottom:14, position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,var(--fd),var(--fb))` }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
            {[
              { val:stats.wpm,      unit:"WPM",    label:"Speed",    color:"var(--fb)" },
              { val:`${stats.accuracy}%`, unit:"",label:"Accuracy",  color:"#22c55e" },
              { val:stats.errors,   unit:"",       label:"Errors",   color: stats.errors > 10 ? "#ef4444" : "var(--hinb)" },
            ].map((s,i)=>(
              <div key={i} style={{ padding:"28px 16px", textAlign:"center", borderRight: i<2?"1px solid var(--g6)":"none" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.8rem", letterSpacing:2, color:s.color, lineHeight:1, animation:"countUp 0.6s ease both", animationDelay:`${i*0.1}s` }}>
                  {s.val}<span style={{ fontSize:"1rem", color:s.color+"88" }}>{s.unit}</span>
                </div>
                <div style={{ fontSize:"0.62rem", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--g4)", marginTop:5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed breakdown */}
        <div style={{ background:"var(--g8)", border:"1px solid var(--g6)", borderRadius:16, padding:"18px 20px", marginBottom:14 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"2px", color:"var(--g4)", marginBottom:14 }}>DETAILED BREAKDOWN</div>
          {[
            { label:"Characters Typed",    val: stats.totalChars },
            { label:"Correct Characters",  val: stats.correctChars, color:"#22c55e" },
            { label:"Wrong Characters",    val: stats.errors,        color: stats.errors > 0 ? "#ef4444":"#22c55e" },
            { label:"Words Typed",         val: Math.floor(stats.correctChars / 5) },
            { label:"Net WPM",             val: stats.wpm,           color:"var(--fb)" },
            { label:"SSC Cut-off (35 WPM)",val: stats.wpm >= 35 ? "✓ Passed":"✗ Not yet", color: stats.wpm >= 35 ? "#22c55e":"#ef4444" },
          ].map(r=>(
            <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--g7)" }}>
              <span style={{ fontSize:"0.82rem", color:"var(--g3)" }}>{r.label}</span>
              <span style={{ fontSize:"0.88rem", fontWeight:700, color:r.color||"#fff" }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* SSC progress bar */}
        <div style={{ background:"var(--g8)", border:"1px solid var(--g6)", borderRadius:14, padding:"14px 18px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.74rem", fontWeight:700, color:"var(--g4)", letterSpacing:"1px", textTransform:"uppercase" }}>SSC Progress</span>
            <span style={{ fontSize:"0.74rem", fontWeight:700, color:"var(--fb)" }}>{stats.wpm}/35 WPM target</span>
          </div>
          <div style={{ height:8, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min((stats.wpm/35)*100,100)}%`,
              background:"linear-gradient(90deg,var(--fd),var(--fb))",
              borderRadius:50, transition:"width 1s ease" }} />
          </div>
          <div style={{ fontSize:"0.7rem", color:"var(--g4)", marginTop:6 }}>
            {stats.wpm >= 35
              ? `🎉 You've crossed the SSC cut-off! Keep maintaining.`
              : `${35 - stats.wpm} more WPM needed to reach SSC CHSL cut-off`}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={onRetry} style={{ flex:1, height:46, background:"linear-gradient(135deg,var(--fb),var(--fd))", color:"#fff", border:"none", borderRadius:12, fontFamily:"'Outfit',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 18px rgba(233,30,140,0.35)" }}>
            🔄 Retry Same Passage
          </button>
          <button onClick={onNewPassage} style={{ flex:1, height:46, background:"rgba(233,30,140,0.1)", color:"var(--fb)", border:"1.5px solid rgba(233,30,140,0.3)", borderRadius:12, fontFamily:"'Outfit',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer" }}>
            📄 New Passage
          </button>
        </div>
        <button onClick={onBack} style={{ width:"100%", marginTop:10, height:42, background:"transparent", color:"var(--g4)", border:"1px solid var(--g6)", borderRadius:12, fontFamily:"'Outfit',sans-serif", fontSize:"0.86rem", fontWeight:600, cursor:"pointer" }}>
          ← Back to Practice Selection
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function EnglishPractice({ duration: propDuration = 1, onBack }) {
  const location = useLocation();
  const [theme, setTheme] = usePqTheme();
  const navigate = useNavigate();
  const duration = location.state?.duration || propDuration;
  const totalSeconds = duration * 60;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const [status, setStatus]         = useState("idle");    // idle | countdown | typing | finished
  const [countdown, setCountdown]   = useState(3);
  const [timeLeft, setTimeLeft]     = useState(totalSeconds);
  const [passage, setPassage]       = useState(getPassage);
  const [input, setInput]           = useState("");
  const [started, setStarted]       = useState(false);
  const [stats, setStats]           = useState(null);

  // live stats
  const [liveWPM, setLiveWPM]       = useState(0);
  const [liveAcc, setLiveAcc]       = useState(100);
  const [liveErr, setLiveErr]       = useState(0);

  const inputRef    = useRef(null);
  const timerRef    = useRef(null);
  const startTime   = useRef(null);

  /* ── COUNTDOWN ── */
  useEffect(() => {
    if (status !== "countdown") return;
    if (countdown === 0) { setStatus("typing"); inputRef.current?.focus(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown]);

  /* ── TYPING TIMER ── */
  useEffect(() => {
    if (status !== "typing") return;
    startTime.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); finishTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  /* ── LIVE STATS UPDATE ── */
  useEffect(() => {
    if (status !== "typing") return;
    const elapsed = (Date.now() - (startTime.current || Date.now())) / 1000;
    let correct = 0, errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === passage[i]) correct++;
      else errors++;
    }
    setLiveWPM(calcWPM(correct, Math.max(elapsed, 1)));
    setLiveAcc(calcAccuracy(correct, input.length));
    setLiveErr(errors);
  }, [input]);

  const finishTest = useCallback(() => {
    clearInterval(timerRef.current);
    const elapsed = (Date.now() - startTime.current) / 1000;
    let correct = 0, errors = 0;
    const inp = inputRef.current?.value || "";
    for (let i = 0; i < inp.length; i++) {
      if (inp[i] === passage[i]) correct++;
      else errors++;
    }
    setStats({
      wpm: calcWPM(correct, elapsed),
      accuracy: calcAccuracy(correct, inp.length),
      errors,
      correctChars: correct,
      totalChars: inp.length,
    });
    setStatus("finished");
  }, [passage]);

  const handleInput = (e) => {
    const val = e.target.value;
    if (val.length > passage.length) return;
    setInput(val);
    // auto-finish when passage fully typed
    if (val.length === passage.length) finishTest();
  };

  const startPractice = () => { setCountdown(3); setStatus("countdown"); };

  const retry = () => {
    setInput(""); setTimeLeft(totalSeconds);
    setLiveWPM(0); setLiveAcc(100); setLiveErr(0);
    setStats(null); setCountdown(3); setStatus("countdown");
  };

  const newPassage = () => {
    setPassage(getPassage());
    setInput(""); setTimeLeft(totalSeconds);
    setLiveWPM(0); setLiveAcc(100); setLiveErr(0);
    setStats(null); setCountdown(3); setStatus("countdown");
  };

  /* ── RENDER CHARACTERS ── */
  const renderPassage = () => {
    return passage.split("").map((char, i) => {
      let color = "var(--g4)";
      let bg = "transparent";
      let underline = false;
      if (i < input.length) {
        if (input[i] === char) { color = "#22c55e"; }
        else { color = "#fff"; bg = "rgba(239,68,68,0.35)"; }
      } else if (i === input.length) {
        underline = true; color = "#fff";
      }
      return (
        <span key={i} style={{
          color, background:bg,
          borderBottom: underline ? "2px solid var(--fb)" : "none",
          borderRadius:2,
          fontFamily:"'Courier Prime',monospace",
          fontSize:"1.05rem", lineHeight:1.85,
          transition:"color 0.05s",
        }}>{char}</span>
      );
    });
  };

  /* ── FINISHED ── */
  if (status === "finished" && stats) {
    return <ResultScreen stats={stats} duration={duration} onRetry={retry} onNewPassage={newPassage} onBack={handleBack} />;
  }

  /* ── COUNTDOWN ── */
  if (status === "countdown") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--g9)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;800&display=swap');
          @keyframes scaleIn{from{opacity:0;transform:scale(2)}to{opacity:1;transform:scale(1)}}
          *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Outfit',sans-serif;background:var(--g9)}
        `}</style>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"10rem", letterSpacing:4,
          background:"linear-gradient(135deg,var(--fb),var(--fd))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          filter:"drop-shadow(0 0 40px rgba(233,30,140,0.6))", animation:"scaleIn 0.4s ease both", lineHeight:1 }}>
          {countdown === 0 ? "GO!" : countdown}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem", letterSpacing:3, color:"var(--g4)", marginTop:16 }}>
          {countdown > 0 ? "GET READY" : "START TYPING!"}
        </div>
      </div>
    );
  }

  /* ── IDLE ── */
  const timerPct = (timeLeft / totalSeconds) * 100;
  const timerColor = timeLeft > totalSeconds * 0.5 ? "#22c55e" : timeLeft > totalSeconds * 0.25 ? "var(--hinb)" : "#ef4444";
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&family=Courier+Prime&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 5px var(--fb)}50%{box-shadow:0 0 18px var(--fb)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--f)44;border-radius:3px}

        .practice-page{min-height:100vh;background:var(--g9);padding:28px 5% 60px;
          background-image:linear-gradient(rgba(233,30,140,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(233,30,140,0.022) 1px,transparent 1px);
          background-size:52px 52px;}

        /* top bar */
        .top-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;}
        .back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;transition:color 0.18s;}
        .back-btn:hover{color:var(--fb);}
        .mode-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(233,30,140,0.08);border:1px solid rgba(233,30,140,0.25);border-radius:50px;padding:5px 16px;}
        .mode-dot{width:6px;height:6px;border-radius:50%;background:var(--fb);box-shadow:0 0 7px var(--fb);animation:pulse 1.6s ease-in-out infinite;}
        .mode-text{font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--fb);}

        /* live stats */
        .live-stats{display:flex;gap:0;border:1px solid var(--g6);border-radius:14px;overflow:hidden;margin-bottom:20px;animation:fadeUp 0.4s ease both;}
        .ls-item{flex:1;padding:12px 10px;text-align:center;border-right:1px solid var(--g6);background:var(--g8);}
        .ls-item:last-child{border-right:none;}
        .ls-val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:1.5px;line-height:1;}
        .ls-lbl{font-size:0.58rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g4);margin-top:3px;}

        /* timer */
        .timer-wrap{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;}
        .timer-ring{position:relative;width:80px;height:80px;flex-shrink:0;}
        .timer-svg{transform:rotate(-90deg);}
        .timer-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:2px;color:#fff;}
        .timer-label{font-size:0.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g4);}

        /* passage box */
        .passage-wrap{background:var(--g8);border:1.5px solid var(--g6);border-radius:16px;padding:24px 22px;margin-bottom:16px;position:relative;animation:fadeUp 0.5s 0.1s ease both;}
        .passage-wrap.active-border{border-color:rgba(233,30,140,0.4);box-shadow:0 0 0 3px rgba(233,30,140,0.08);}
        .passage-text{line-height:1.85;word-break:break-word;user-select:none;}

        /* input */
        .type-input{width:100%;background:var(--g75);border:1.5px solid var(--g6);border-radius:14px;padding:16px 18px;
          font-family:'Courier Prime',monospace;font-size:1rem;color:#fff;outline:none;resize:none;
          transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:14px;line-height:1.6;}
        .type-input:focus{border-color:var(--f);box-shadow:0 0 0 3px rgba(233,30,140,0.1);}
        .type-input::placeholder{color:var(--g6);}
        .type-input:disabled{opacity:0.4;cursor:not-allowed;}

        /* progress */
        .progress-wrap{margin-bottom:16px;}
        .progress-info{display:flex;justify-content:space-between;margin-bottom:6px;}
        .progress-lbl{font-size:0.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g4);}
        .progress-bar{height:6px;background:var(--g7);border-radius:50;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--fd),var(--fb));border-radius:50;transition:width 0.2s;}

        /* start/stop */
        .start-btn{width:100%;height:52px;background:linear-gradient(135deg,var(--fb),var(--fd));color:#fff;border:none;border-radius:14px;
          font-family:'Outfit',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.22s;
          box-shadow:0 4px 22px rgba(233,30,140,0.36);}
        .start-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(233,30,140,0.52);}
        .stop-btn{width:100%;height:46px;background:rgba(239,68,68,0.1);color:#ef4444;border:1.5px solid rgba(239,68,68,0.3);border-radius:14px;
          font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;transition:all 0.22s;margin-top:10px;}
        .stop-btn:hover{background:rgba(239,68,68,0.18);border-color:rgba(239,68,68,0.6);}

        /* hint */
        .hint{font-size:0.75rem;color:var(--g4);text-align:center;margin-top:10px;line-height:1.5;}

        @media(max-width:600px){
          .live-stats{grid-template-columns:1fr 1fr;}
          .passage-wrap{padding:18px 16px;}
        }
      `}</style>

      <div className="practice-page" data-pqtheme={theme}>

        {/* TOP BAR */}
        <div className="top-bar">
          <button className="back-btn" onClick={handleBack}>← Back</button>
          <div className="mode-pill">
            <span className="mode-dot"/>
            <span className="mode-text">⌨ English — {duration} Min Practice</span>
          </div>
          {status === "typing" && (
            <button className="stop-btn" style={{width:"auto",padding:"6px 18px",margin:0}} onClick={finishTest}>
              End Early
            </button>
          )}
        </div>

        {/* LIVE STATS */}
        <div className="live-stats">
          {[
            { val:status==="typing"?liveWPM:0, unit:"WPM",  lbl:"Speed",    color:"var(--fb)" },
            { val:status==="typing"?liveAcc:100, unit:"%",  lbl:"Accuracy", color:"#22c55e" },
            { val:status==="typing"?liveErr:0, unit:"",     lbl:"Errors",   color: liveErr>5?"#ef4444":"var(--hinb)" },
            { val:status==="typing"?input.length:0, unit:"",lbl:"Chars",    color:"#4db6f7" },
          ].map((s,i)=>(
            <div className="ls-item" key={i}>
              <div className="ls-val" style={{color:s.color}}>{s.val}<span style={{fontSize:"0.9rem",opacity:0.7}}>{s.unit}</span></div>
              <div className="ls-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* TIMER */}
        <div className="timer-wrap">
          <div className="timer-ring">
            <svg className="timer-svg" width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--g7)" strokeWidth="6"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke={timerColor} strokeWidth="6"
                strokeDasharray={`${2*Math.PI*34}`}
                strokeDashoffset={`${2*Math.PI*34*(1-timerPct/100)}`}
                strokeLinecap="round"
                style={{transition:"stroke-dashoffset 1s linear, stroke 0.5s"}}
              />
            </svg>
            <div className="timer-num" style={{color:timerColor}}>{mm}:{ss}</div>
          </div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:2,color:"#fff"}}>
              {status==="typing"?"Time Remaining":status==="idle"?"Ready to Start":""}
            </div>
            <div className="timer-label">{duration} Minute Session</div>
          </div>
        </div>

        {/* PASSAGE */}
        <div className={`passage-wrap${status==="typing"?" active-border":""}`}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.7rem",letterSpacing:"2px",color:"rgba(233,30,140,0.6)",marginBottom:10,textTransform:"uppercase"}}>
            Type this passage ↓
          </div>
          <div className="passage-text">{renderPassage()}</div>
        </div>

        {/* PROGRESS */}
        {status==="typing" && (
          <div className="progress-wrap">
            <div className="progress-info">
              <span className="progress-lbl">Progress</span>
              <span style={{fontSize:"0.72rem",color:"var(--fb)",fontWeight:700}}>{Math.round((input.length/passage.length)*100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${(input.length/passage.length)*100}%`}}/>
            </div>
          </div>
        )}

        {/* INPUT */}
        <textarea
          ref={inputRef}
          className="type-input"
          rows={3}
          placeholder={status==="idle"?"Click Start Practice below to begin typing...":"Start typing here..."}
          value={input}
          onChange={handleInput}
          disabled={status!=="typing"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* ACTIONS */}
        {status === "idle" && (
          <>
            <button className="start-btn" onClick={startPractice}>
              ⚡ Start {duration} Minute Practice
            </button>
            <p className="hint">
              💡 Tip — Read the passage once before starting. Focus on accuracy first, speed will follow.
            </p>
          </>
        )}

        {status === "typing" && (
          <button className="stop-btn" onClick={finishTest}>
            ⏹ Finish & See Results
          </button>
        )}
      </div>
    </>
  );
}