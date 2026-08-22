import { useState, useEffect, useRef, useCallback } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import { useLocation, useNavigate } from "react-router-dom";

/* ─── HINDI PASSAGES ─────────────────────────────────────────────── */
const passages = [
  "भारत सरकार ने देश के विकास के लिए अनेक महत्वपूर्ण कदम उठाए हैं। सड़कों, रेलवे और हवाई मार्गों का विकास किया गया है ताकि दूरदराज के क्षेत्रों को प्रमुख शहरों से जोड़ा जा सके। अर्थव्यवस्था निरंतर प्रगति कर रही है और युवाओं के लिए नए अवसर सृजित हो रहे हैं।",
  "शिक्षा किसी भी राष्ट्र के विकास में महत्वपूर्ण भूमिका निभाती है। एक शिक्षित जनसंख्या देश की प्रगति में महत्वपूर्ण योगदान दे सकती है। सरकार ने साक्षरता को बढ़ावा देने और ग्रामीण तथा शहरी क्षेत्रों के बच्चों को गुणवत्तापूर्ण शिक्षा प्रदान करने के लिए अनेक योजनाएं शुरू की हैं।",
  "विज्ञान और प्रौद्योगिकी ने लोगों के जीवन और कार्य करने के तरीके को बदल दिया है। आधुनिक आविष्कारों ने दुनिया भर के लाखों लोगों के जीवन को आसान और अधिक आरामदायक बना दिया है। इंटरनेट ने विभिन्न देशों के लोगों को जोड़ा है और संचार तथा व्यापार के नए रास्ते खोले हैं।",
  "कृषि भारतीय अर्थव्यवस्था की रीढ़ है। जनसंख्या का एक बड़ा हिस्सा अपनी आजीविका के लिए खेती पर निर्भर है। सरकार ने किसानों को आधुनिक तकनीकों के माध्यम से उनकी उत्पादकता बढ़ाने और जीवन स्तर सुधारने में मदद करने के लिए विभिन्न योजनाएं शुरू की हैं।",
  "भारत का संविधान सभी नागरिकों को मौलिक अधिकारों की गारंटी देता है। प्रत्येक व्यक्ति को जाति, धर्म या लिंग की परवाह किए बिना कानून के समक्ष समानता का अधिकार है। न्यायपालिका इन अधिकारों की रक्षा करने और सभी लोगों के लिए न्याय सुनिश्चित करने में महत्वपूर्ण भूमिका निभाती है।",
  "स्वास्थ्य सबसे महत्वपूर्ण संपत्ति है जो एक व्यक्ति के पास हो सकती है। एक स्वस्थ शरीर और मन एक उत्पादक और संतोषजनक जीवन जीने के लिए आवश्यक है। सरकार ने समाज के सभी वर्गों को किफायती चिकित्सा सेवा प्रदान करने के लिए पूरे देश में अस्पताल और स्वास्थ्य केंद्र स्थापित किए हैं।",
  "पर्यावरण संरक्षण हमारे समय की सबसे गंभीर चुनौतियों में से एक बन गया है। प्रदूषण और जलवायु परिवर्तन हमारे ग्रह के प्राकृतिक संतुलन को खतरे में डाल रहे हैं। प्रत्येक नागरिक की जिम्मेदारी है कि वह पर्यावरण की देखभाल करे और इसे भावी पीढ़ियों के लिए सुरक्षित रखे।",
  "खेल चरित्र निर्माण और युवाओं में शारीरिक स्वास्थ्य को बढ़ावा देने में महत्वपूर्ण भूमिका निभाते हैं। सरकार भारतीय एथलीटों को अंतरराष्ट्रीय स्तर पर प्रतिस्पर्धा करने में मदद करने के लिए खेल बुनियादी ढांचे और प्रशिक्षण कार्यक्रमों में निवेश कर रही है।",
];

function getPassage() {
  return passages[Math.floor(Math.random() * passages.length)];
}

function calcWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds === 0) return 0;
  // Hindi words avg ~4.5 chars
  const words = correctChars / 4.5;
  const minutes = elapsedSeconds / 60;
  return Math.round(words / minutes);
}

function calcAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/* ─── RESULT SCREEN ─────────────────────────────────────────────── */
function ResultScreen({ stats, duration, layout, onRetry, onNewPassage, onBack }) {
  const navigate = useNavigate();
  
  const grade =
    stats.wpm >= 40 ? { label: "शानदार!",    color: "#22c55e", icon: "🏆" } :
    stats.wpm >= 30 ? { label: "अच्छा!",      color: "#4db6f7", icon: "🎯" } :
    stats.wpm >= 18 ? { label: "ठीक है",      color: "var(--hinb)", icon: "📈" } :
                      { label: "कोशिश जारी!", color: "#ef4444", icon: "💪" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--g9)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:20,
      backgroundImage:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(255,111,0,0.1) 0%,transparent 60%)" }}>
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

        {/* Grade */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:"3.5rem", marginBottom:8 }}>{grade.icon}</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", letterSpacing:3,
            color:grade.color, filter:`drop-shadow(0 0 20px ${grade.color}88)` }}>
            {grade.label}
          </div>
          <div style={{ fontSize:"0.75rem", color:"var(--g4)", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:4 }}>
            {duration} मिनट अभ्यास पूर्ण · {layout === "kruti" ? "Kruti Dev" : "Mangal"}
          </div>
        </div>

        {/* Main stats */}
        <div style={{ background:"var(--g8)", border:"1px solid rgba(255,111,0,0.22)", borderRadius:20,
          overflow:"hidden", marginBottom:14, position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
            background:"linear-gradient(90deg,var(--hind),var(--hinb))" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
            {[
              { val:stats.wpm,            unit:"WPM", label:"गति",       color:"var(--hinb)" },
              { val:`${stats.accuracy}%`, unit:"",    label:"सटीकता",    color:"#22c55e" },
              { val:stats.errors,         unit:"",    label:"गलतियाँ",   color: stats.errors > 10 ? "#ef4444" : "var(--hinb)" },
            ].map((s,i)=>(
              <div key={i} style={{ padding:"28px 16px", textAlign:"center",
                borderRight: i<2 ? "1px solid var(--g6)" : "none" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.8rem",
                  letterSpacing:2, color:s.color, lineHeight:1,
                  animation:"countUp 0.6s ease both", animationDelay:`${i*0.1}s` }}>
                  {s.val}<span style={{ fontSize:"1rem", color:s.color+"88" }}>{s.unit}</span>
                </div>
                <div style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"1px",
                  textTransform:"uppercase", color:"var(--g4)", marginTop:5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background:"var(--g8)", border:"1px solid var(--g6)", borderRadius:16,
          padding:"18px 20px", marginBottom:14 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem",
            letterSpacing:"2px", color:"var(--g4)", marginBottom:14 }}>विस्तृत विवरण</div>
          {[
            { label:"कुल टाइप किए अक्षर",    val: stats.totalChars },
            { label:"सही अक्षर",             val: stats.correctChars,  color:"#22c55e" },
            { label:"गलत अक्षर",             val: stats.errors,         color: stats.errors>0?"#ef4444":"#22c55e" },
            { label:"अनुमानित शब्द",          val: Math.floor(stats.correctChars / 4.5) },
            { label:"नेट WPM",               val: stats.wpm,            color:"var(--hinb)" },
            { label:"SSC कट-ऑफ (30 WPM)",   val: stats.wpm >= 30 ? "✓ पास" : "✗ अभी नहीं",
              color: stats.wpm >= 30 ? "#22c55e" : "#ef4444" },
          ].map(r=>(
            <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--g7)" }}>
              <span style={{ fontSize:"0.82rem", color:"var(--g3)" }}>{r.label}</span>
              <span style={{ fontSize:"0.88rem", fontWeight:700, color:r.color||"#fff" }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* SSC Progress bar */}
        <div style={{ background:"var(--g8)", border:"1px solid var(--g6)", borderRadius:14,
          padding:"14px 18px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--g4)",
              letterSpacing:"1px", textTransform:"uppercase" }}>SSC प्रगति</span>
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--hinb)" }}>
              {stats.wpm}/30 WPM लक्ष्य
            </span>
          </div>
          <div style={{ height:8, background:"var(--g7)", borderRadius:50, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min((stats.wpm/30)*100,100)}%`,
              background:"linear-gradient(90deg,var(--hind),var(--hinb))",
              borderRadius:50, transition:"width 1s ease" }} />
          </div>
          <div style={{ fontSize:"0.7rem", color:"var(--g4)", marginTop:6 }}>
            {stats.wpm >= 30
              ? "🎉 आपने SSC हिंदी टाइपिंग कट-ऑफ पार कर लिया है!"
              : `SSC CHSL हिंदी कट-ऑफ तक पहुँचने के लिए ${30 - stats.wpm} और WPM चाहिए`}
          </div>
        </div>

        {/* Half errors note */}
        <div style={{ background:"rgba(255,111,0,0.06)", border:"1px solid rgba(255,111,0,0.18)",
          borderRadius:12, padding:"11px 14px", marginBottom:16,
          fontSize:"0.75rem", color:"var(--g3)", lineHeight:1.6 }}>
          ⚠ <strong style={{color:"var(--hinb)"}}>SSC नियम:</strong> मात्रा की गलती = आधी गलती (Half Error)। 10 आधी गलतियाँ = 1 पूरी गलती।
        </div>

        {/* Buttons */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={onRetry} style={{ flex:1, height:46,
            background:"linear-gradient(135deg,var(--hinb),var(--hind))", color:"#fff", border:"none",
            borderRadius:12, fontFamily:"'Outfit',sans-serif", fontSize:"0.9rem", fontWeight:700,
            cursor:"pointer", boxShadow:"0 4px 18px rgba(255,111,0,0.35)" }}>
            🔄 फिर से करें
          </button>
          <button onClick={onNewPassage} style={{ flex:1, height:46,
            background:"rgba(255,111,0,0.1)", color:"var(--hinb)",
            border:"1.5px solid rgba(255,111,0,0.3)", borderRadius:12,
            fontFamily:"'Outfit',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer" }}>
            📄 नया अनुच्छेद
          </button>
        </div>
        <button onClick={() => navigate("/hindihome")} style={{ width:"100%", marginTop:10, height:42,
          background:"transparent", color:"var(--g4)", border:"1px solid var(--g6)",
          borderRadius:12, fontFamily:"'Outfit',sans-serif", fontSize:"0.86rem",
          fontWeight:600, cursor:"pointer" }}>
          ← वापस जाएं
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function HindiPractice({ duration = 1, layout = "kruti", onBack }) {
  const location = useLocation();
  const [theme, setTheme] = usePqTheme();
  const navigate = useNavigate();
  const durationFromState = location?.state?.duration || duration;
  const layoutFromState = location?.state?.layout || layout;
  const totalSeconds = durationFromState * 60;

  const [status, setStatus]       = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft]   = useState(totalSeconds);
  const [passage, setPassage]     = useState(getPassage);
  const [input, setInput]         = useState("");
  const [stats, setStats]         = useState(null);
  const [liveWPM, setLiveWPM]     = useState(0);
  const [liveAcc, setLiveAcc]     = useState(100);
  const [liveErr, setLiveErr]     = useState(0);

  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const startTime = useRef(null);

  /* ── COUNTDOWN ── */
  useEffect(() => {
    if (status !== "countdown") return;
    if (countdown === 0) { setStatus("typing"); setTimeout(()=>inputRef.current?.focus(),50); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown]);

  /* ── TIMER ── */
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

  /* ── LIVE STATS ── */
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
    const inp = inputRef.current?.value || "";
    let correct = 0, errors = 0;
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

  /* ── RENDER PASSAGE ── */
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
          color, background: bg,
          borderBottom: underline ? "2px solid var(--hinb)" : "none",
          borderRadius: 2,
          fontSize: "1.1rem",
          lineHeight: 2,
          transition: "color 0.05s",
        }}>{char}</span>
      );
    });
  };

  /* ── FINISHED ── */
  if (status === "finished" && stats) {
    return (
      <ResultScreen
        stats={stats} duration={durationFromState} layout={layoutFromState}
        onRetry={retry} onNewPassage={newPassage} onBack={onBack}
      />
    );
  }

  /* ── COUNTDOWN ── */
  if (status === "countdown") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--g9)", display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@700;800&display=swap');
          @keyframes scaleIn{from{opacity:0;transform:scale(2)}to{opacity:1;transform:scale(1)}}
          *{box-sizing:border-box;margin:0;padding:0}body{background:var(--g9)}
        `}</style>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"10rem", letterSpacing:4,
          background:"linear-gradient(135deg,var(--hinb),var(--hind))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          filter:"drop-shadow(0 0 40px rgba(255,111,0,0.6))",
          animation:"scaleIn 0.4s ease both", lineHeight:1 }}>
          {countdown === 0 ? "शुरू!" : countdown}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem",
          letterSpacing:3, color:"var(--g4)", marginTop:16 }}>
          {countdown > 0 ? "तैयार रहें" : "टाइप करना शुरू करें!"}
        </div>
      </div>
    );
  }

  /* ── IDLE / TYPING ── */
  const timerPct = (timeLeft / totalSeconds) * 100;
  const timerColor = timeLeft > totalSeconds*0.5 ? "#22c55e" : timeLeft > totalSeconds*0.25 ? "var(--hinb)" : "#ef4444";
  const mm = String(Math.floor(timeLeft / 60)).padStart(2,"0");
  const ss = String(timeLeft % 60).padStart(2,"0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 5px var(--hinb)}50%{box-shadow:0 0 18px var(--hinb)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--hin)44;border-radius:3px}

        .practice-page{min-height:100vh;background:var(--g9);padding:28px 5% 60px;
          background-image:linear-gradient(rgba(255,111,0,0.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,111,0,0.018) 1px,transparent 1px);
          background-size:52px 52px;}

        .top-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;}
        .back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;transition:color 0.18s;}
        .back-btn:hover{color:var(--hinb);}
        .mode-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,111,0,0.1);border:1px solid rgba(255,111,0,0.28);border-radius:50px;padding:5px 16px;}
        .mode-dot{width:6px;height:6px;border-radius:50%;background:var(--hinb);box-shadow:0 0 7px var(--hinb);animation:pulse 1.6s ease-in-out infinite;}
        .mode-text{font-size:0.68rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--hinb);}

        .live-stats{display:flex;gap:0;border:1px solid var(--g6);border-radius:14px;overflow:hidden;margin-bottom:20px;animation:fadeUp 0.4s ease both;}
        .ls-item{flex:1;padding:12px 10px;text-align:center;border-right:1px solid var(--g6);background:var(--g8);}
        .ls-item:last-child{border-right:none;}
        .ls-val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:1.5px;line-height:1;}
        .ls-lbl{font-size:0.58rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--g4);margin-top:3px;}

        .timer-wrap{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;}
        .timer-ring{position:relative;width:80px;height:80px;flex-shrink:0;}
        .timer-svg{transform:rotate(-90deg);}
        .timer-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:2px;color:#fff;}

        .passage-wrap{background:var(--g8);border:1.5px solid var(--g6);border-radius:16px;padding:24px 22px;margin-bottom:16px;position:relative;animation:fadeUp 0.5s 0.1s ease both;}
        .passage-wrap.active-border{border-color:rgba(255,111,0,0.4);box-shadow:0 0 0 3px rgba(255,111,0,0.08);}
        .passage-label{font-family:'Bebas Neue',sans-serif;font-size:0.7rem;letter-spacing:"2px";color:rgba(255,111,0,0.6);margin-bottom:10px;text-transform:uppercase;}
        .passage-text{line-height:2;word-break:break-all;user-select:none;}

        .layout-note{display:inline-flex;align-items:center;gap:6px;background:rgba(255,111,0,0.07);border:1px solid rgba(255,111,0,0.18);border-radius:8px;padding:5px 12px;margin-bottom:12px;font-size:0.72rem;color:var(--hinb);font-weight:600;}

        .type-input{width:100%;background:var(--g75);border:1.5px solid var(--g6);border-radius:14px;padding:16px 18px;
          font-size:1.05rem;color:#fff;outline:none;resize:none;
          transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:14px;line-height:1.8;font-family:inherit;}
        .type-input:focus{border-color:var(--hin);box-shadow:0 0 0 3px rgba(255,111,0,0.1);}
        .type-input::placeholder{color:var(--g6);}
        .type-input:disabled{opacity:0.4;cursor:not-allowed;}

        .progress-wrap{margin-bottom:16px;}
        .progress-info{display:flex;justify-content:space-between;margin-bottom:6px;}
        .progress-lbl{font-size:0.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g4);}
        .progress-bar{height:6px;background:var(--g7);border-radius:50;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--hind),var(--hinb));border-radius:50;transition:width 0.2s;}

        .start-btn{width:100%;height:52px;background:linear-gradient(135deg,var(--hinb),var(--hind));color:#fff;border:none;border-radius:14px;font-family:'Outfit',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.22s;box-shadow:0 4px 22px rgba(255,111,0,0.36);}
        .start-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(255,111,0,0.52);}
        .stop-btn{width:100%;height:46px;background:rgba(239,68,68,0.1);color:#ef4444;border:1.5px solid rgba(239,68,68,0.3);border-radius:14px;font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;transition:all 0.22s;margin-top:10px;}
        .stop-btn:hover{background:rgba(239,68,68,0.18);border-color:rgba(239,68,68,0.6);}
        .hint{font-size:0.75rem;color:var(--g4);text-align:center;margin-top:10px;line-height:1.5;}
      `}</style>

      <div className="practice-page" data-pqtheme={theme}>

        {/* TOP BAR */}
        <div className="top-bar">
          <button className="back-btn" onClick={() => navigate("/hindihome")}>← वापस</button>
          <div className="mode-pill">
            <span className="mode-dot"/>
            <span className="mode-text">🇮🇳 हिंदी — {durationFromState} मिनट · {layoutFromState === "kruti" ? "Kruti Dev" : "Mangal"}</span>
          </div>
          {status === "typing" && (
            <button className="stop-btn" style={{width:"auto",padding:"6px 18px",margin:0}} onClick={finishTest}>
              समाप्त करें
            </button>
          )}
        </div>

        {/* LIVE STATS */}
        <div className="live-stats">
          {[
            { val:status==="typing"?liveWPM:0,   unit:"WPM", lbl:"गति",      color:"var(--hinb)" },
            { val:status==="typing"?liveAcc:100,  unit:"%",   lbl:"सटीकता",  color:"#22c55e" },
            { val:status==="typing"?liveErr:0,    unit:"",    lbl:"गलतियाँ", color: liveErr>5?"#ef4444":"var(--hinb)" },
            { val:status==="typing"?input.length:0,unit:"",   lbl:"अक्षर",   color:"#4db6f7" },
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
                style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}
              />
            </svg>
            <div className="timer-num" style={{color:timerColor}}>{mm}:{ss}</div>
          </div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:2,color:"#fff"}}>
              {status==="typing" ? "समय शेष" : "शुरू करने के लिए तैयार"}
            </div>
            <div style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)",marginTop:3}}>
              {durationFromState} मिनट सत्र · {layoutFromState === "kruti" ? "Kruti Dev" : "Mangal"}
            </div>
          </div>
        </div>

        {/* LAYOUT NOTE */}
        <div className="layout-note">
          ⌨ सुनिश्चित करें कि आपका सिस्टम <strong style={{marginLeft:3}}>{layoutFromState === "kruti" ? "Kruti Dev" : "Mangal / Inscript"}</strong> पर सेट है
        </div>

        {/* PASSAGE */}
        <div className={`passage-wrap${status==="typing"?" active-border":""}`}>
          <div className="passage-label">यह अनुच्छेद टाइप करें ↓</div>
          <div className="passage-text">{renderPassage()}</div>
        </div>

        {/* PROGRESS */}
        {status === "typing" && (
          <div className="progress-wrap">
            <div className="progress-info">
              <span className="progress-lbl">प्रगति</span>
              <span style={{fontSize:"0.72rem",color:"var(--hinb)",fontWeight:700}}>
                {Math.round((input.length/passage.length)*100)}%
              </span>
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
          placeholder={status==="idle" ? "नीचे 'अभ्यास शुरू करें' पर क्लिक करके टाइप करना शुरू करें..." : "यहाँ टाइप करें..."}
          value={input}
          onChange={handleInput}
          disabled={status !== "typing"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* ACTIONS */}
        {status === "idle" && (
          <>
            <button className="start-btn" onClick={startPractice}>
              ⚡ {durationFromState} मिनट अभ्यास शुरू करें
            </button>
            <p className="hint">
              💡 टिप — शुरू करने से पहले अनुच्छेद एक बार पढ़ें। पहले सटीकता पर ध्यान दें, गति अपने आप आएगी।
            </p>
          </>
        )}

        {status === "typing" && (
          <button className="stop-btn" onClick={finishTest}>
            ⏹ समाप्त करें और परिणाम देखें
          </button>
        )}
      </div>
    </>
  );
}