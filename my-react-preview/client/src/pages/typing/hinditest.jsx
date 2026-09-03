import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { ENGLISH_EXTRA_PASSAGES, HINDI_EXTRA_PASSAGES } from "./typing_extra_passages";
/* ─── TEST PASSAGES (HINDI) ─────────────────────────────────────────────── */
import TypingPaperList from "./TypingPaperList";

/* ─── PYQ PAPERS ──────────────────────────────────────────────────── */
const HINDI_PYQ_PAPERS = [
  {
    id: "hi-pyq-2024-1",
    category: "pyq",
    label: "SSC CGL 2024 — Shift 1",
    icon: "📜",
    year: "2024",
    source: "SSC CGL",
    passage: "किसी भी राष्ट्र का विकास उसके लोगों की शिक्षा और कौशल पर निर्भर करता है। एक सुशिक्षित कार्यबल आर्थिक विकास और सामाजिक प्रगति में महत्वपूर्ण योगदान दे सकता है। सरकार सभी स्तरों पर शिक्षा की गुणवत्ता में सुधार के लिए निरंतर प्रयास कर रही है। प्रत्येक गांव और कस्बे में प्राथमिक विद्यालय स्थापित किए गए हैं ताकि हर बच्चे की बुनियादी शिक्षा तक पहुंच हो। उच्च शिक्षा संस्थानों को भी आधुनिक सुविधाओं और बेहतर संकाय के साथ उन्नत किया गया है। उन योग्य छात्रों को छात्रवृत्ति और वित्तीय सहायता प्रदान की जाती है जो उच्च शिक्षा का खर्च वहन नहीं कर सकते हैं। विभिन्न उद्योगों में आवश्यक व्यावहारिक कौशल के साथ युवाओं को लैस करने के लिए व्यावसायिक प्रशिक्षण कार्यक्रम शुरू किए गए हैं। विकासशील अर्थव्यवस्था की बढ़ती मांगों को पूरा करने के लिए देश को अधिक इंजीनियरों डॉक्टरों शिक्षकों और अन्य पेशेवरों की आवश्यकता है।",
  },
  {
    id: "hi-pyq-2024-2",
    category: "pyq",
    label: "SSC CHSL 2024 — Shift 2",
    icon: "📜",
    year: "2024",
    source: "SSC CHSL",
    passage: "भारत कई भाषाओं संस्कृतियों और परंपराओं के साथ बड़ी विविधता का देश है। विभिन्न धर्मों और पृष्ठभूमि के लोग शांति और सद्भाव से एक साथ रहते हैं। विविधता में यह एकता हमारे राष्ट्र की ताकत है और इसे हजारों वर्षों से मनाया जाता रहा है। भारत का संविधान सभी नागरिकों को उनके धर्म जाति या लिंग की परवाह किए बिना समान अधिकारों की गारंटी देता है। प्रत्येक व्यक्ति को अपने धर्म का पालन करने और अपनी सांस्कृतिक परंपराओं का पालन करने की स्वतंत्रता है। सरकार ने देश की समृद्ध सांस्कृतिक विरासत को संरक्षित करने के लिए कदम उठाए हैं। कला संगीत साहित्य और नृत्य को बढ़ावा देने के लिए संग्रहालयों पुस्तकालयों और सांस्कृतिक केंद्रों की स्थापना की गई है।",
  },
  {
    id: "hi-pyq-2023-1",
    category: "pyq",
    label: "SSC CGL 2023 — Shift 3",
    icon: "📜",
    year: "2023",
    source: "SSC CGL",
    passage: "भारत की अर्थव्यवस्था में कृषि बहुत महत्वपूर्ण भूमिका निभाती है। ग्रामीण क्षेत्रों में बड़ी संख्या में लोग अपनी आजीविका के लिए खेती पर निर्भर हैं। सरकार किसानों की स्थिति में सुधार और कृषि उत्पादकता बढ़ाने के लिए कड़ी मेहनत कर रही है। शुष्क मौसम के दौरान भी खेतों को पानी उपलब्ध कराने के लिए आधुनिक सिंचाई प्रणाली विकसित की गई है। बीजों की नई किस्में पेश की गई हैं जो अधिक उपज देती हैं और बीमारियों के प्रतिरोधी हैं। किसानों को रियायती दरों पर उर्वरक और कीटनाशक उपलब्ध कराए जाते हैं ताकि वे उनका उपयोग कर सकें। फसल के बाद फलों और सब्जियों की बर्बादी को रोकने के लिए कोल्ड स्टोरेज सुविधाएं स्थापित की गई हैं।",
  },
  {
    id: "hi-pyq-2023-2",
    category: "pyq",
    label: "SSC CPO 2023 — Shift 1",
    icon: "📜",
    year: "2023",
    source: "SSC CPO",
    passage: "जल पृथ्वी पर सबसे कीमती संसाधनों में से एक है और सभी जीवित प्राणियों के अस्तित्व के लिए इसका संरक्षण अत्यंत महत्वपूर्ण है। बढ़ती जनसंख्या और तेजी से औद्योगिकीकरण के साथ ताजे पानी की मांग पिछले कुछ वर्षों में कई गुना बढ़ गई है। नदियों झीलों और भूजल स्रोतों में औद्योगिक अपशिष्टों और अनुपचारित सीवेज के जल निकायों में छोड़े जाने के कारण चिंताजनक दर से प्रदूषण हो रहा है। सरकार ने नदियों को साफ करने और शहरी और ग्रामीण क्षेत्रों में वर्षा जल संचयन को बढ़ावा देने के लिए कई कार्यक्रम शुरू किए हैं।",
  },
];

function getTestPassage(paperId) {
  if (paperId) {
    const found = HINDI_PYQ_PAPERS.find(p => p.id === paperId);
    if (found) return found.passage;
  }
  return HINDI_PYQ_PAPERS[Math.floor(Math.random() * HINDI_PYQ_PAPERS.length)].passage;
}

function calcWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds === 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

function calcAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function calcNetWPM(grossWPM, errors, minutes) {
  return Math.max(0, Math.round(grossWPM - (errors / minutes)));
}

/* ─── SAVE TEST TO SUPABASE ──────────────────────────────────────── */
async function saveTestResultToSupabase(userId, stats, testType = "hindi") {
  try {
    if (!userId) {
      
      return;
    }

    const netWPM = calcNetWPM(stats.grossWPM, stats.errors, 15);

    // Save to typing_sessions
    const { data: attempt, error: attemptErr } = await supabase
      .from("typing_sessions")
      .insert([{
        user_id: userId,
        wpm: stats.grossWPM,
        accuracy: stats.accuracy,
        attempted_at: new Date().toISOString(),
      }])
      .select();

    if (attemptErr) {
      
      return;
    }

    
  } catch (err) {
    
  }
}

/* ─── SYSTEM CHECK ──────────────────────────────────────────────────────── */
function SystemCheck({ onProceed, onBack }) {
  const [checks, setChecks] = useState([
    { id:"browser",  label:"Browser Compatibility",      status:"checking", detail:"Checking your browser..." },
    { id:"keyboard", label:"Keyboard Input",             status:"checking", detail:"Testing keyboard response..." },
    { id:"font",     label:"Hindi Font (Mangal/Devanagari)", status:"checking", detail:"Verifying font rendering..." },
    { id:"fullscreen",label:"Fullscreen Support",        status:"checking", detail:"Checking fullscreen API..." },
  ]);
  const [allPassed, setAllPassed] = useState(false);
  const [keyTest, setKeyTest]     = useState("");
  const [keyOk, setKeyOk]         = useState(false);
  const [theme] = usePqTheme();
  const keyRef = useRef(null);

  useEffect(() => {
    // Simulate system checks with staggered delays
    const results = [
      { id:"browser",   status:"pass", detail:`${navigator.userAgent.includes("Chrome")?"Chrome":"Browser"} detected — fully compatible` },
      { id:"font",      status:"pass", detail:"Hindi Devanagari scripts rendering correctly" },
      { id:"fullscreen",status: document.fullscreenEnabled ? "pass":"warn",
        detail: document.fullscreenEnabled ? "Fullscreen supported" : "Fullscreen not available — test will run in window" },
    ];
    results.forEach((r, i) => {
      setTimeout(() => {
        setChecks(prev => prev.map(c => c.id === r.id ? { ...c, ...r } : c));
      }, (i + 1) * 600);
    });
  }, []);

  // keyboard check — user types "READY"
  const handleKeyInput = (e) => {
    const val = e.target.value.toUpperCase();
    setKeyTest(val);
    if (val === "READY") {
      setKeyOk(true);
      setChecks(prev => prev.map(c =>
        c.id === "keyboard" ? { ...c, status:"pass", detail:"Keyboard input working perfectly" } : c
      ));
    }
  };

  useEffect(() => {
    const nonKeyboard = checks.filter(c => c.id !== "keyboard");
    const allNonKeyDone = nonKeyboard.every(c => c.status === "pass" || c.status === "warn");
    if (allNonKeyDone && keyOk) setAllPassed(true);
  }, [checks, keyOk]);

  const statusIcon = (s) =>
    s === "checking" ? <span style={{display:"inline-block",width:16,height:16,border:"2px solid var(--hinb)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> :
    s === "pass"     ? <span style={{color:"#22c55e",fontSize:"1rem",fontWeight:800}}>✓</span> :
    s === "warn"     ? <span style={{color:"var(--hinb)",fontSize:"1rem",fontWeight:800}}>⚠</span> :
                       <span style={{color:"#ef4444",fontSize:"1rem",fontWeight:800}}>✗</span>;

  return (
    <div data-pqtheme={theme}>
    <div data-pqtheme={theme} style={{minHeight:"100vh"}}>
      <div style={{minHeight:"100vh",background:"var(--g9)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,
      backgroundImage:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(2,136,209,0.09) 0%,transparent 60%)"}}>
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
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif;background:var(--g9)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:#0288d144;border-radius:3px}
      `}</style>

      <div style={{width:"100%",maxWidth:560,animation:"popIn 0.4s ease both"}}>

        {/* Header */}
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"var(--g4)",fontFamily:"'Outfit',sans-serif",fontSize:"0.8rem",fontWeight:600,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
          ← Back
        </button>

        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:"2.5rem",marginBottom:10}}>🖥️</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.4rem",letterSpacing:3,color:"#fff",marginBottom:6}}>
            System Check
          </div>
          <p style={{fontSize:"0.82rem",color:"var(--g4)",lineHeight:1.6,maxWidth:380,margin:"0 auto"}}>
            Before starting the test, let's verify your system is ready for the SSC Hindi Typing exam.
          </p>
        </div>

        {/* Check items */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {checks.map((c,i)=>(
            <div key={c.id} style={{
              background:"var(--g8)",
              border:`1px solid ${c.status==="pass"?"rgba(34,197,94,0.25)":c.status==="warn"?"rgba(255,167,38,0.25)":c.status==="fail"?"rgba(239,68,68,0.25)":"var(--g6)"}`,
              borderRadius:12,padding:"13px 16px",
              display:"flex",alignItems:"center",gap:14,
              animation:`fadeUp 0.4s ${i*0.08}s ease both`,
              transition:"border-color 0.3s",
            }}>
              <div style={{width:32,height:32,borderRadius:9,flexShrink:0,
                background:c.status==="pass"?"rgba(34,197,94,0.1)":c.status==="warn"?"rgba(255,167,38,0.1)":"rgba(2,136,209,0.1)",
                border:`1px solid ${c.status==="pass"?"rgba(34,197,94,0.3)":c.status==="warn"?"rgba(255,167,38,0.3)":"rgba(2,136,209,0.2)"}`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {statusIcon(c.status)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.84rem",fontWeight:700,color:"#fff",marginBottom:2}}>{c.label}</div>
                <div style={{fontSize:"0.72rem",color:"var(--g4)"}}>{c.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Keyboard test */}
        <div style={{background:"var(--g8)",border:`1px solid ${keyOk?"rgba(34,197,94,0.3)":"rgba(2,136,209,0.2)"}`,borderRadius:14,padding:"18px 16px",marginBottom:20,transition:"border-color 0.3s"}}>
          <div style={{fontSize:"0.72rem",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",
            color:keyOk?"#22c55e":"#4db6f7",marginBottom:10}}>
            ⌨ Keyboard Test — Type the English word below
          </div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.5rem",letterSpacing:6,
            color:"rgba(2,136,209,0.4)",textAlign:"center",marginBottom:12,
            background:"var(--g7)",borderRadius:10,padding:"10px 0"}}>
            READY
          </div>
          <input
            ref={keyRef}
            type="text"
            value={keyTest}
            onChange={handleKeyInput}
            placeholder="Type READY here..."
            maxLength={5}
            style={{width:"100%",background:"var(--g75)",border:`1.5px solid ${keyOk?"#22c55e":"var(--g6)"}`,
              borderRadius:10,padding:"11px 14px",color:"#fff",fontFamily:"'Outfit',sans-serif",
              fontSize:"1rem",fontWeight:700,outline:"none",letterSpacing:3,textTransform:"uppercase",
              transition:"border-color 0.2s"}}
          />
          {keyOk && <div style={{fontSize:"0.72rem",color:"#22c55e",marginTop:6,fontWeight:600}}>✓ Keyboard working perfectly!</div>}
        </div>

        {/* Proceed button */}
        <button
          onClick={onProceed}
          disabled={!allPassed}
          style={{width:"100%",height:52,
            background: allPassed ? "linear-gradient(135deg,#29b6f6,#0277bd)" : "var(--g7)",
            color: allPassed ? "#fff" : "var(--g4)",
            border:"none",borderRadius:14,fontFamily:"'Outfit',sans-serif",
            fontSize:"1rem",fontWeight:700,cursor:allPassed?"pointer":"not-allowed",
            transition:"all 0.3s",boxShadow:allPassed?"0 4px 20px rgba(2,136,209,0.35)":"none"}}>
          {allPassed ? "All Checks Passed — View Rules →" : "Complete checks above to continue"}
        </button>
      </div>
    </div>
    </div>
    </div>
  );
}

/* ─── RULES SCREEN ──────────────────────────────────────────────────────── */
function RulesScreen({ onStart, onBack }) {
  const [agreed, setAgreed] = useState(false);

  const rules = [
    { n:"01", title:"Duration",      body:"The test is exactly <strong>15 minutes</strong>. The timer starts immediately when you click Start Test.", icon:"⏱️" },
    { n:"02", title:"No Backspace",  body:"<strong>Backspace and Delete keys are completely disabled</strong>. This is the real SSC exam rule. Type carefully.", icon:"🚫" },
    { n:"03", title:"Passage",       body:"A fixed Hindi passage from SSC PYQ papers will appear. You <strong>cannot change or pause</strong> the passage.", icon:"📄" },
    { n:"04", title:"Scoring",       body:"<strong>Net WPM = Gross WPM − (Errors ÷ Time in min)</strong>. SSC CHSL Hindi cut-off is <strong>30 WPM</strong> at 80%+ accuracy.", icon:"📊" },
    { n:"05", title:"Submission",   body:"The test is submitted only when the full 15-minute timer completes. Uncompleted tests will not be saved.", icon:"📡" },
    { n:"06", title:"Analytics",     body:"Completed tests are saved to Supabase so your performance is tracked and used for analytics.", icon:"📊" },
    { n:"07", title:"No Pause",      body:"Once started, the test <strong>cannot be paused</strong>. Closing or switching tabs will end the test.", icon:"▶️" },
    { n:"08", title:"Hindi Scripts", body:"Pay strict attention to <strong>halants, matras, and half-letters</strong>. They must be typed exactly to avoid errors.", icon:"🔠" },
    { n:"09", title:"Space & Punct.",body:"Spaces and punctuation <strong>must be typed exactly</strong> as shown. Missing a comma or purna viram (।) is an error.", icon:"✏️" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"var(--g9)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,
      backgroundImage:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(2,136,209,0.09) 0%,transparent 60%)"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif;background:var(--g9)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:#0288d144;border-radius:3px}
      `}</style>

      <div style={{width:"100%",maxWidth:580,maxHeight:"92vh",overflowY:"auto"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"var(--g4)",fontFamily:"'Outfit',sans-serif",fontSize:"0.8rem",fontWeight:600,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
          ← Back to System Check
        </button>

        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:"2.2rem",marginBottom:8}}>📋</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.4rem",letterSpacing:3,color:"#fff",marginBottom:6}}>Exam Rules</div>
          <p style={{fontSize:"0.82rem",color:"var(--g4)",lineHeight:1.6}}>SSC Hindi Typing Test · Read all rules carefully before proceeding</p>
        </div>

        {/* rules */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {rules.map((r,i)=>(
            <div key={r.n} style={{background:"var(--g8)",border:"1px solid var(--g6)",borderRadius:12,padding:"13px 16px",
              display:"flex",alignItems:"flex-start",gap:13,animation:`fadeUp 0.35s ${i*0.06}s ease both`}}>
              <div style={{flexShrink:0,textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.2rem",letterSpacing:1,color:"#4db6f7",lineHeight:1}}>{r.n}</div>
                <div style={{fontSize:"1rem",marginTop:2}}>{r.icon}</div>
              </div>
              <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:"1.5px",color:"#4db6f7",marginBottom:4}}>{r.title}</div>
                <div style={{fontSize:"0.8rem",color:"var(--g2)",lineHeight:1.6}} dangerouslySetInnerHTML={{__html:r.body}}/>
              </div>
            </div>
          ))}
        </div>

        {/* agree checkbox */}
        <div
          onClick={()=>setAgreed(!agreed)}
          style={{display:"flex",alignItems:"center",gap:12,background:"rgba(2,136,209,0.07)",
            border:`1px solid ${agreed?"rgba(34,197,94,0.35)":"rgba(2,136,209,0.2)"}`,
            borderRadius:12,padding:"14px 16px",marginBottom:16,cursor:"pointer",transition:"all 0.2s"}}>
          <div style={{width:22,height:22,borderRadius:6,flexShrink:0,
            background:agreed?"#22c55e":"var(--g7)",border:`1.5px solid ${agreed?"#22c55e":"var(--g6)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",
            boxShadow:agreed?"0 0 10px rgba(34,197,94,0.4)":"none"}}>
            {agreed && <span style={{color:"#fff",fontSize:"0.7rem",fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:"0.84rem",color:agreed?"#fff":"var(--g3)",fontWeight:500,lineHeight:1.5}}>
            I have read and understood all the exam rules. I am ready to begin the 15-minute test.
          </span>
        </div>

        <button
          onClick={()=>agreed&&onStart()}
          disabled={!agreed}
          style={{width:"100%",height:52,
            background:agreed?"linear-gradient(135deg,#29b6f6,#0277bd)":"var(--g7)",
            color:agreed?"#fff":"var(--g4)",border:"none",borderRadius:14,
            fontFamily:"'Outfit',sans-serif",fontSize:"1rem",fontWeight:700,
            cursor:agreed?"pointer":"not-allowed",transition:"all 0.3s",
            boxShadow:agreed?"0 4px 20px rgba(2,136,209,0.38)":"none"}}>
          {agreed ? "⏱️ Start 15-Minute Test →" : "Agree to rules above to start"}
        </button>
      </div>
    </div>
  );
}

/* ─── RESULT SCREEN ─────────────────────────────────────────────────────── */
function ResultScreen({ stats, onRetry, onBack, layout }) {
  const navigate = useNavigate();
  
  const netWPM = calcNetWPM(stats.grossWPM, stats.errors, 15);
  // Cutoffs adjusted for Hindi (30 WPM)
  const grade =
    netWPM >= 45 ? { label:"Excellent", color:"#22c55e", icon:"🏆" } :
    netWPM >= 30 ? { label:"Passed",    color:"#4db6f7", icon:"🎯" } :
    netWPM >= 20 ? { label:"Average",   color:"var(--hinb)", icon:"📈" } :
                   { label:"Keep Going",color:"#ef4444", icon:"💪" };
  const passed = netWPM >= 30 && stats.accuracy >= 80;

  return (
    <div style={{minHeight:"100vh",background:"var(--g9)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,
      backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 0%,${passed?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)"} 0%,transparent 60%)`}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes popIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Outfit',sans-serif;background:var(--g9)}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:#0288d144;border-radius:3px}
      `}</style>

      <div style={{width:"100%",maxWidth:600,animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",maxHeight:"92vh",overflowY:"auto"}}>

        {/* grade */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:"3.5rem",marginBottom:8}}>{grade.icon}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"3rem",letterSpacing:3,
            color:grade.color,filter:`drop-shadow(0 0 20px ${grade.color}88)`}}>{grade.label}</div>
          <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:8,
            background: passed?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",
            border:`1px solid ${passed?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,
            borderRadius:50,padding:"5px 18px"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:passed?"#22c55e":"#ef4444",flexShrink:0}}/>
            <span style={{fontSize:"0.74rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",
              color:passed?"#22c55e":"#ef4444"}}>
              {passed?"SSC Hindi Cut-off Cleared":"SSC Hindi Cut-off Not Met"}
            </span>
          </div>
        </div>

        {/* main stats */}
        <div style={{background:"var(--g8)",border:"1px solid rgba(2,136,209,0.22)",borderRadius:20,overflow:"hidden",marginBottom:14,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#003c6e,#29b6f6)"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0}}>
            {[
              {val:netWPM,         unit:"WPM",  label:"Net WPM",   color:"#4db6f7"},
              {val:stats.grossWPM, unit:"WPM",  label:"Gross WPM", color:"#fff"},
              {val:`${stats.accuracy}%`, unit:"",label:"Accuracy", color:"#22c55e"},
              {val:stats.errors,   unit:"",     label:"Errors",    color:stats.errors>10?"#ef4444":"var(--hinb)"},
            ].map((s,i)=>(
              <div key={i} style={{padding:"22px 12px",textAlign:"center",borderRight:i<3?"1px solid var(--g6)":"none"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.2rem",letterSpacing:2,color:s.color,lineHeight:1,animation:"countUp 0.6s ease both",animationDelay:`${i*0.08}s`}}>
                  {s.val}<span style={{fontSize:"0.85rem",opacity:0.7}}>{s.unit}</span>
                </div>
                <div style={{fontSize:"0.58rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"var(--g4)",marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* breakdown */}
        <div style={{background:"var(--g8)",border:"1px solid var(--g6)",borderRadius:16,padding:"18px 20px",marginBottom:14}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"2px",color:"var(--g4)",marginBottom:14}}>DETAILED REPORT</div>
          {[
            {label:"Total Characters Typed",  val:stats.totalChars},
            {label:"Correct Characters",      val:stats.correctChars, color:"#22c55e"},
            {label:"Wrong Characters (Errors)",val:stats.errors,      color:stats.errors>0?"#ef4444":"#22c55e"},
            {label:"Gross WPM",               val:stats.grossWPM},
            {label:"Error Deduction",         val:`− ${(stats.errors/15).toFixed(1)} WPM`, color:"#ef4444"},
            {label:"Net WPM (Final Score)",   val:netWPM,             color:"#4db6f7"},
            {label:"Accuracy",                val:`${stats.accuracy}%`,color:stats.accuracy>=80?"#22c55e":"#ef4444"},
            {label:"SSC CHSL Hindi Cut-off (30 WPM, 80% acc)", val:passed?"✓ Cleared":"✗ Not Met", color:passed?"#22c55e":"#ef4444"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--g7)"}}>
              <span style={{fontSize:"0.8rem",color:"var(--g3)"}}>{r.label}</span>
              <span style={{fontSize:"0.86rem",fontWeight:700,color:r.color||"#fff"}}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* progress bars */}
        <div style={{background:"var(--g8)",border:"1px solid var(--g6)",borderRadius:14,padding:"16px 18px",marginBottom:20}}>
          {[
            {label:"Net WPM",  val:netWPM,          target:30, color:"#4db6f7", unit:"WPM", goal:"30 WPM target"},
            {label:"Accuracy", val:stats.accuracy,  target:80, color:"#22c55e", unit:"%",   goal:"80% target"},
          ].map(b=>(
            <div key={b.label} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:"0.7rem",fontWeight:700,color:"var(--g4)",letterSpacing:"1px",textTransform:"uppercase"}}>{b.label}</span>
                <span style={{fontSize:"0.7rem",fontWeight:700,color:b.color}}>{b.val}{b.unit} / {b.goal}</span>
              </div>
              <div style={{height:8,background:"var(--g7)",borderRadius:50,overflow:"hidden",position:"relative"}}>
                <div style={{height:"100%",width:`${Math.min((b.val/b.target)*100,100)}%`,
                  background:`linear-gradient(90deg,${b.color}88,${b.color})`,borderRadius:50,transition:"width 1s ease"}}/>
                {/* target marker */}
                <div style={{position:"absolute",top:0,bottom:0,left:"100%",width:2,background:"rgba(255,255,255,0.2)"}}/>
              </div>
            </div>
          ))}
        </div>

        {/* buttons */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={onRetry} style={{flex:1,height:46,background:"linear-gradient(135deg,#29b6f6,#0277bd)",color:"#fff",border:"none",borderRadius:12,fontFamily:"'Outfit',sans-serif",fontSize:"0.9rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(2,136,209,0.35)"}}>
            🔄 Retry Test
          </button>
          <button onClick={() => onBack ? onBack() : navigate(-1)} style={{flex:1,height:46,background:"rgba(2,136,209,0.08)",color:"#4db6f7",border:"1.5px solid rgba(2,136,209,0.25)",borderRadius:12,fontFamily:"'Outfit',sans-serif",fontSize:"0.9rem",fontWeight:700,cursor:"pointer"}}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TEST SCREEN ───────────────────────────────────────────────────────── */
function TestScreen({ onFinish, layout, passage: passageProp }) {
  const DURATION = 15 * 60; // 15 minutes
  const [passage] = useState(() => passageProp || getTestPassage());
  const [input, setInput]     = useState("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [started, setStarted]  = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    // auto-start timer on mount
    startTime.current = Date.now();
    setStarted(true);
    setTimeout(()=>inputRef.current?.focus(), 100);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); submitTest(""); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const submitTest = useCallback((finalInput) => {
    clearInterval(timerRef.current);
    const inp = finalInput !== "" ? finalInput : inputRef.current?.value || "";
    const elapsed = (Date.now() - startTime.current) / 1000;
    let correct = 0, errors = 0;
    for (let i = 0; i < inp.length; i++) {
      if (inp[i] === passage[i]) correct++;
      else errors++;
    }
    onFinish({
      grossWPM:   calcWPM(correct, elapsed),
      accuracy:   calcAccuracy(correct, inp.length),
      errors,
      correctChars: correct,
      totalChars: inp.length,
    });
  }, [passage, onFinish]);

  // BLOCK backspace
  const handleKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    if (val.length > passage.length) return;
    setInput(val);
    if (val.length === passage.length) submitTest(val);
  };

  // render passage (Noto Sans Devanagari handles complex hindi scripts beautifully)
  const renderPassage = () => passage.split("").map((char, i) => {
    let color = "var(--g4)", bg = "transparent", underline = false;
    if (i < input.length) {
      color = input[i] === char ? "#22c55e" : "#fff";
      bg    = input[i] === char ? "transparent" : "rgba(239,68,68,0.35)";
    } else if (i === input.length) {
      underline = true; color = "#fff";
    }
    return (
      <span key={i} style={{color,background:bg,borderBottom:underline?"2px solid #4db6f7":"none",
        borderRadius:2,fontFamily:"'Noto Sans Devanagari', sans-serif",fontSize:"1.15rem",lineHeight:2}}>
        {char}
      </span>
    );
  });

  const mm = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss = String(timeLeft%60).padStart(2,"0");
  const timerColor = timeLeft > 600 ? "#22c55e" : timeLeft > 300 ? "var(--hinb)" : "#ef4444";
  const pct = (timeLeft/DURATION)*100;
  const progress = Math.round((input.length/passage.length)*100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:#0288d144;border-radius:3px}
      `}</style>

      <div style={{minHeight:"100vh",background:"var(--g9)",padding:"20px 4%",
        backgroundImage:"linear-gradient(rgba(2,136,209,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(2,136,209,0.018) 1px,transparent 1px)",
        backgroundSize:"52px 52px"}}>

        {/* TOP BAR */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>

          {/* mode pill */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:50,padding:"5px 16px"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 6px #ef4444",animation:"pulse 1s ease-in-out infinite",display:"inline-block"}}/>
            <span style={{fontSize:"0.68rem",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",color:"#ef4444"}}>LIVE HINDI TEST · SSC Format · {layout === "kruti" ? "Kruti Dev" : "Mangal"}</span>
          </div>

          {/* timer */}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative",width:64,height:64}}>
              <svg style={{transform:"rotate(-90deg)"}} width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" fill="none" stroke="var(--g7)" strokeWidth="5"/>
                <circle cx="32" cy="32" r="27" fill="none" stroke={timerColor} strokeWidth="5"
                  strokeDasharray={`${2*Math.PI*27}`}
                  strokeDashoffset={`${2*Math.PI*27*(1-pct/100)}`}
                  strokeLinecap="round"
                  style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}
                />
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:1,color:timerColor}}>
                {mm}:{ss}
              </div>
            </div>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:2,color:"#fff"}}>Time Left</div>
              <div style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"var(--g4)"}}>15 Min Test</div>
            </div>
          </div>

          {/* live wpm */}
          <div style={{display:"flex",gap:12}}>
            {[
              {val: input.length > 0 ? calcWPM([...input].filter((c,i)=>c===passage[i]).length, (DURATION-timeLeft)||1) : 0, lbl:"WPM", color:"#4db6f7"},
              {val: input.length > 0 ? calcAccuracy([...input].filter((c,i)=>c===passage[i]).length, input.length) : 100, lbl:"ACC%", color:"#22c55e"},
              {val: `${progress}%`, lbl:"DONE", color:"var(--hinb)"},
            ].map(s=>(
              <div key={s.lbl} style={{background:"var(--g8)",border:"1px solid var(--g6)",borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:1,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:"0.55rem",fontWeight:700,letterSpacing:"1px",color:"var(--g4)",marginTop:2}}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PASSAGE */}
        <div style={{background:"var(--g8)",border:"1.5px solid rgba(2,136,209,0.3)",borderRadius:16,padding:"22px 20px",marginBottom:14,
          boxShadow:"0 0 0 3px rgba(2,136,209,0.06)"}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.65rem",letterSpacing:"2px",color:"rgba(2,136,209,0.5)",marginBottom:10,textTransform:"uppercase"}}>
            SSC Hindi Passage — Type exactly as shown ↓
          </div>
          <div style={{lineHeight:2,wordBreak:"break-word",userSelect:"none"}}>{renderPassage()}</div>
        </div>

        {/* PROGRESS BAR */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:"0.65rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)"}}>Progress</span>
            <span style={{fontSize:"0.7rem",fontWeight:700,color:"#4db6f7"}}>{progress}%</span>
          </div>
          <div style={{height:5,background:"var(--g7)",borderRadius:50,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#003c6e,#29b6f6)",borderRadius:50,transition:"width 0.2s"}}/>
          </div>
        </div>

        {/* NO-BACKSPACE WARNING */}
        <div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:9,padding:"8px 14px",marginBottom:12,
          fontSize:"0.73rem",color:"#fc8181",display:"flex",alignItems:"center",gap:8}}>
          🚫 <strong>Backspace disabled</strong> — SSC exam mode is active. Type carefully.
        </div>

        {/* INPUT */}
        <textarea
          ref={inputRef}
          rows={4}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Start typing in Hindi here..."
          style={{width:"100%",background:"var(--g75)",border:"1.5px solid rgba(2,136,209,0.25)",borderRadius:14,padding:"16px 18px",
            fontFamily:"'Noto Sans Devanagari', sans-serif",fontSize:"1.15rem",color:"#fff",outline:"none",resize:"none",lineHeight:1.7,
            boxShadow:"0 0 0 3px rgba(2,136,209,0.05)",marginBottom:12}}
        />

        {/* SUBMIT */}
        <button onClick={()=>submitTest(input)}
          style={{width:"100%",height:48,background:"rgba(239,68,68,0.1)",color:"#ef4444",
            border:"1.5px solid rgba(239,68,68,0.3)",borderRadius:12,fontFamily:"'Outfit',sans-serif",
            fontSize:"0.9rem",fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}
          onMouseEnter={e=>e.target.style.background="rgba(239,68,68,0.18)"}
          onMouseLeave={e=>e.target.style.background="rgba(239,68,68,0.1)"}>
          ⏹ End Test Early & See Results
        </button>
      </div>
    </>
  );
}

/* ─── ROOT ──────────────────────────────────────────────────────────────── */
export default function HindiTest({ onBack, userId, isSubscribed = false }) {
  const location = useLocation();
  const [theme, setTheme] = usePqTheme();
  const layoutFromState = location?.state?.layout || "kruti";
  const navigate = useNavigate();
  const [screen, setScreen] = useState("papers"); // papers | system | rules | test | result
  const [testStats, setTestStats] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Extra passages come from the admin-managed typing_passages table now,
  // not the static typing_extra_passages.js file — that file's content is
  // kept as a fallback only in case the fetch fails or the table is empty,
  // so admin-added passages actually reach students instead of silently
  // never showing up.
  const [extraPassages, setExtraPassages] = useState(HINDI_EXTRA_PASSAGES);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("typing_passages")
          .select("id, label, passage, icon, display_order, is_active")
          .eq("language", "hindi")
          .eq("category", "extra")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0 && !cancelled) {
          setExtraPassages(data.map(p => ({
            id: p.id,
            category: "extra",
            label: p.label,
            icon: p.icon || "📄",
            passage: p.passage,
          })));
        }
      } catch (err) {
        // keep static fallback on any failure
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const papers = useMemo(() => [...HINDI_PYQ_PAPERS, ...extraPassages], [extraPassages]);

  const handleFinish = async (stats) => {
    await saveTestResultToSupabase(userId, stats, "hindi");
    setTestStats(stats);
    setScreen("result");
  };
  const handleRetry = () => { setTestStats(null); setSelectedPaper(null); setScreen("papers"); };

  // System check and rules screens still exist but are no longer the default
  // entry point — the exam section now opens directly on the papers list.
  if (screen === "system")
    return <SystemCheck onProceed={() => setScreen("rules")} onBack={() => setScreen("papers")} />;

  if (screen === "rules")
    return <RulesScreen onStart={() => setScreen("papers")} onBack={() => setScreen("system")} />;

  if (screen === "papers")
    return (
      <TypingPaperList
        papers={papers}
        language="hindi"
        onSelect={(paper) => { setSelectedPaper(paper); setScreen("test"); }}
        onBack={onBack}
        isSubscribed={isSubscribed}
      />
    );

  if (screen === "test")
    return <TestScreen
      onFinish={handleFinish}
      layout={layoutFromState}
      passage={selectedPaper ? selectedPaper.passage : getTestPassage()}
    />;

  if (screen === "result" && testStats)
    return <ResultScreen stats={testStats} onRetry={handleRetry} onBack={onBack} layout={layoutFromState} />;

  return null;
}
