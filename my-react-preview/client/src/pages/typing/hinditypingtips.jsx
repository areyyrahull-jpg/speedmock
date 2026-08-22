import { useState } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import HindiExercises from "./hindiexercise";
import { useNavigate } from "react-router-dom";

/* ─── KEYBOARD LAYOUT DATA ───────────────────────────────────────── */
const fingerRows = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L",";"],
  ["Z","X","C","V","B","N","M",",",".","/"],
];

const fingerMap = {
  Q:0,A:0,Z:0,
  W:1,S:1,X:1,
  E:2,D:2,C:2,
  R:3,F:3,V:3,T:3,G:3,
  Y:4,H:4,B:4,U:4,J:4,N:4,M:4,
  I:5,K:5,",":5,
  O:6,L:6,".":6,
  P:7,";":7,"/":7,
};

/* Kruti Dev key → Hindi character mapping */
const krutiMap = {
  Q:"ौ", W:"ै", E:"ा", R:"ी", T:"ू", Y:"ब", U:"ह", I:"ग", O:"द", P:"ज",
  A:"ो", S:"े", D:"्", F:"ि", G:"ु", H:"प", J:"र", K:"क", L:"त", ";":"च",
  Z:".", X:"थ", C:"म", V:"न", B:"व", N:"ल", M:"स", ",":","
};

/* Mangal / Inscript key → Hindi character mapping */
const mangalMap = {
  Q:"औ", W:"ऐ", E:"आ", R:"ई", T:"ऊ", Y:"भ", U:"ङ", I:"घ", O:"ध", P:"झ",
  A:"ओ", S:"ए", D:"अ", F:"इ", G:"उ", H:"फ", J:"ड", K:"ख", L:"थ", ";":"छ",
  Z:"'", X:"ठ", C:"ण", V:"ञ", B:"ब", N:"ळ", M:"श", ",":":",
};

const fingerData = [
  { id:0, name:"Left Pinky",   hand:"Left",  color:"var(--f)", keys:["Q","A","Z"], homeKey:"A", tip:"सबसे कमज़ोर उंगली — हल्के स्पर्श से टाइप करें। A पर हमेशा टिकी रहे।", strength:40 },
  { id:1, name:"Left Ring",    hand:"Left",  color:"#c2185b", keys:["W","S","X"], homeKey:"S", tip:"दूसरी कमज़ोर उंगली। Home row के पास रखें, ज़्यादा मत खींचें।", strength:55 },
  { id:2, name:"Left Middle",  hand:"Left",  color:"#9c27b0", keys:["E","D","C"], homeKey:"D", tip:"सबसे मज़बूत बाईं उंगली। D (्) हलन्त के लिए — हिंदी में बहुत ज़रूरी।", strength:75 },
  { id:3, name:"Left Index",   hand:"Left",  color:"#7b1fa2", keys:["R","F","V","T","G"], homeKey:"F", tip:"सबसे versatile — 5 keys। F पर उभरी हुई पट्टी है — बिना देखे पहचानें।", strength:85 },
  { id:4, name:"Right Index",  hand:"Right", color:"#0288d1", keys:["Y","H","B","U","J","N","M"], homeKey:"J", tip:"दाईं तरफ की सबसे काम की उंगली। J पर उभरी पट्टी है। सबसे ज़्यादा keys cover करती है।", strength:85 },
  { id:5, name:"Right Middle", hand:"Right", color:"#0277bd", keys:["I","K",","], homeKey:"K", tip:"I (ग/घ) और K (क/ख) बहुत use होते हैं। K पर हमेशा ready रखें।", strength:75 },
  { id:6, name:"Right Ring",   hand:"Right", color:"#01579b", keys:["O","L","."], homeKey:"L", tip:"O (द/ध) और L (त/थ) हिंदी में बहुत common। Ring finger को train करें।", strength:55 },
  { id:7, name:"Right Pinky",  hand:"Right", color:"#003c6e", keys:["P",";","/"], homeKey:";", tip:"सबसे कमज़ोर दाईं उंगली। P (ज) और ; (च) कम use होते हैं।", strength:40 },
];

const proTips = [
  { icon:"🏠", title:"Home Row पहले सीखें",    body:"ASDF (बाईं) और JKL; (दाईं) आपकी home keys हैं। हर keystroke के बाद उंगलियाँ यहीं वापस आनी चाहिए। F और J पर उभरी पट्टी महसूस करें।", level:"ज़रूरी", levelColor:"#ef4444" },
  { icon:"👁️", title:"Screen देखते रहें",      body:"Keyboard की तरफ देखना सबसे बड़ी गलती है। Muscle memory बनने में 2-3 हफ्ते लगते हैं — लेकिन एक बार बन गई तो speed खुद बढ़ेगी।", level:"ज़रूरी", levelColor:"#ef4444" },
  { icon:"्",  title:"Halant (्) Master करें", body:"D key पर हलन्त (्) है — हिंदी typing की सबसे बड़ी challenge। 'क्त', 'स्त', 'न्त' जैसे combinations daily practice करें।", level:"हिंदी खास", levelColor:"var(--hinb)" },
  { icon:"ा",  title:"मात्राएं पहले याद करें", body:"ा (E), ि (F), ी (R), ु (G), ू (T), े (S), ै (W), ो (A), ौ (Q) — ये 9 मात्राएं हिंदी text का 40% हैं। इन्हें blindly type करना सीखें।", level:"हिंदी खास", levelColor:"var(--hinb)" },
  { icon:"🎯", title:"Accuracy पहले, Speed बाद", body:"गलत type करने से अच्छा है धीरे-धीरे सही करें। हर error mentally register होता है और rhythm तोड़ता है। 95%+ accuracy target रखें।", level:"ज़रूरी", levelColor:"#ef4444" },
  { icon:"⚡", title:"Steady Rhythm बनाएं",     body:"एक consistent tempo से type करें। रुक-रुककर type करने से WPM कम होता है। Metronome की तरह एक regular beat maintain करें।", level:"महत्वपूर्ण", levelColor:"var(--hinb)" },
  { icon:"🧘", title:"Hands Relax रखें",       body:"कलाई और बाँहों में tension होने से speed कम होती है। Wrists level रखें, desk पर टिकाएं नहीं। हर 30 मिनट में हाथ हिलाएं।", level:"स्वास्थ्य", levelColor:"#22c55e" },
  { icon:"🖥️", title:"सही Posture रखें",       body:"सीधे बैठें, screen आँखों के level पर हो, कोहनी 90° पर। Typing करते वक्त wrists desk को न छुएं — RSI से बचें।", level:"स्वास्थ्य", levelColor:"#22c55e" },
  { icon:"📈", title:"रोज़ 15 मिनट Practice",  body:"Short daily sessions सबसे effective हैं। नींद में brain motor memory consolidate करता है। 30 दिन रोज़ 15 मिनट — WPM double हो जाएगा।", level:"Routine", levelColor:"#4db6f7" },
  { icon:"🏆", title:"Weekly Progress Track करें", body:"हर हफ्ते 1 मिनट का test लें और WPM record करें। 1-2 WPM की भी improvement motivate करती है। Improvement देखना ही सबसे बड़ा boost है।", level:"Advanced", levelColor:"#ce93d8" },
];

const exercises = [
  { title:"Home Row Drill",   keys:"ो े ् ि ु | प र क त",  desc:"केवल home row keys को random order में type करें। हिंदी typing की नींव यहीं से शुरू होती है।", duration:"2 min", difficulty:"Beginner" },
  { title:"मात्रा Drill",    keys:"ा ि ी ु ू े ै ो ौ",   desc:"नौ मात्राओं को बार-बार type करें। ये हिंदी text का 40% हैं — इन्हें blindly type करना ज़रूरी है।", duration:"3 min", difficulty:"Beginner" },
  { title:"Halant Practice",  keys:"क् त् स् न् ल् र्",   desc:"D key (हलन्त) के साथ consonant combinations। यही हिंदी typing की सबसे बड़ी challenge है।", duration:"3 min", difficulty:"Intermediate" },
  { title:"Common Words",     keys:"और में है का की",       desc:"हिंदी के 100 सबसे common words को repeat करें। Pure muscle memory building।", duration:"4 min", difficulty:"Intermediate" },
  { title:"Full Sentence",    keys:"Complete sentences",    desc:"पूरे वाक्य type करें — मात्राएं, हलन्त, पूर्ण विराम सब साथ। Accuracy पर focus।", duration:"5 min", difficulty:"Intermediate" },
  { title:"SSC Speed Drill",  keys:"Full Hindi paragraphs", desc:"Real SSC Hindi passage को maximum comfortable speed पर copy करें। कोई गलती नहीं।", duration:"5 min", difficulty:"Advanced" },
];

/* ─── HAND DIAGRAM ───────────────────────────────────────────────── */
function HandDiagram({ hand, hoveredFinger, onFingerHover, selectedFinger, onFingerClick }) {
  const leftFingers = [
    { id:0, name:"कनिष्ठा", cx:38,  cy:80, rx:11, ry:36, tip:"Q A Z" },
    { id:1, name:"अनामिका", cx:68,  cy:68, rx:12, ry:42, tip:"W S X" },
    { id:2, name:"मध्यमा",  cx:100, cy:62, rx:12, ry:46, tip:"E D C" },
    { id:3, name:"तर्जनी",  cx:132, cy:68, rx:13, ry:42, tip:"R F V T G" },
  ];
  const rightFingers = [
    { id:4, name:"तर्जनी",  cx:48,  cy:68, rx:13, ry:42, tip:"Y H B U J N M" },
    { id:5, name:"मध्यमा",  cx:80,  cy:62, rx:12, ry:46, tip:"I K ," },
    { id:6, name:"अनामिका", cx:112, cy:68, rx:12, ry:42, tip:"O L ." },
    { id:7, name:"कनिष्ठा", cx:142, cy:80, rx:11, ry:36, tip:"P ; /" },
  ];

  const fingers = hand === "left" ? leftFingers : rightFingers;
  const accentColor = hand === "left" ? "var(--f)" : "#0288d1";
  const palmColor   = hand === "left" ? "rgba(233,30,140,0.06)" : "rgba(2,136,209,0.06)";
  const palmBorder  = hand === "left" ? "rgba(233,30,140,0.2)"  : "rgba(2,136,209,0.2)";
  const thumbX      = hand === "left" ? 158 : 22;

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:"0.65rem", fontWeight:800, letterSpacing:"2px", textTransform:"uppercase",
        color:accentColor, marginBottom:8 }}>
        {hand === "left" ? "👈 बाईं हाथ" : "दाईं हाथ 👉"}
      </div>
      <svg width="200" height="215" viewBox="0 0 200 215" style={{ overflow:"visible" }}>

        {/* Palm */}
        <rect x="28" y="120" width="144" height="72" rx="18" ry="18"
          fill={palmColor} stroke={palmBorder} strokeWidth="1.5" />

        {/* Thumb */}
        <ellipse cx={thumbX} cy={145} rx={14} ry={24}
          fill={accentColor+"22"} stroke={accentColor+"55"} strokeWidth="1.5" />
        <text x={thumbX} y={143} textAnchor="middle" style={{ fontSize:"7px", fill:accentColor, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
          अंगूठा
        </text>
        <text x={thumbX} y={155} textAnchor="middle" style={{ fontSize:"6.5px", fill:accentColor+"88", fontFamily:"'Outfit',sans-serif" }}>
          SPACE
        </text>

        {/* Fingers */}
        {fingers.map((f) => {
          const fd = fingerData[f.id];
          const isHov = hoveredFinger === f.id;
          const isSel = selectedFinger === f.id;
          const active = isHov || isSel;
          return (
            <g key={f.id}
              onMouseEnter={() => onFingerHover(f.id)}
              onMouseLeave={() => onFingerHover(null)}
              onClick={() => onFingerClick(f.id)}
              style={{ cursor:"pointer" }}>
              {/* finger body */}
              <ellipse cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry}
                fill={active ? fd.color+"44" : fd.color+"18"}
                stroke={active ? fd.color : fd.color+"55"}
                strokeWidth={active ? "2" : "1.5"}
                style={{ transition:"all 0.18s", filter:active?`drop-shadow(0 0 6px ${fd.color}88)`:"none",
                  transform:active?"translateY(-4px)":"none", transformOrigin:`${f.cx}px ${f.cy}px` }}
              />
              {/* Hindi finger name */}
              <text x={f.cx} y={f.cy - 6} textAnchor="middle"
                style={{ fontSize:"7px", fill:active?"#fff":fd.color, fontWeight:700, fontFamily:"'Outfit',sans-serif", transition:"fill 0.18s" }}>
                {f.name}
              </text>
              {/* key hint */}
              <text x={f.cx} y={f.cy + 7} textAnchor="middle"
                style={{ fontSize:"6px", fill:active?fd.color:fd.color+"77", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.5px" }}>
                {f.tip.split(" ").slice(0,3).join(" ")}
              </text>
              {/* knuckle dots */}
              {[0.65, 0.82].map((frac, ki) => (
                <circle key={ki} cx={f.cx} cy={f.cy + f.ry * frac - 4} r={2.5}
                  fill={active ? fd.color+"66" : fd.color+"22"}
                  stroke={active ? fd.color+"88" : fd.color+"33"} strokeWidth="1"
                  style={{ transition:"all 0.18s" }}
                />
              ))}
              {/* home key on palm */}
              <rect x={f.cx - 12} y={128} width={24} height={16} rx={4}
                fill={active ? fd.color+"33" : fd.color+"11"}
                stroke={active ? fd.color+"88" : fd.color+"33"} strokeWidth="1"
                style={{ transition:"all 0.18s" }}
              />
              <text x={f.cx} y={140} textAnchor="middle"
                style={{ fontSize:"7px", fill:active?fd.color:fd.color+"88", fontWeight:800,
                  fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.5px" }}>
                {fingerData[f.id].homeKey}
              </text>
            </g>
          );
        })}

        {/* HOME ROW label */}
        <text x="100" y="165" textAnchor="middle"
          style={{ fontSize:"6px", fill:"var(--g4)", fontWeight:700, fontFamily:"'Outfit',sans-serif", letterSpacing:"1.5px" }}>
          HOME ROW
        </text>
        {/* Wrist */}
        <rect x="55" y="186" width="90" height="22" rx="11"
          fill={palmColor} stroke={palmBorder} strokeWidth="1" />
        <text x="100" y="201" textAnchor="middle"
          style={{ fontSize:"7px", fill:"var(--g4)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>
          {hand === "left" ? "बाईं हाथ" : "दाईं हाथ"}
        </text>
      </svg>
    </div>
  );
}

/* ─── INTERACTIVE KEYBOARD ───────────────────────────────────────── */
function InteractiveKeyboard({ activeFingers, hoveredFinger, onKeyHover, layout }) {
  const charMap = layout === "kruti" ? krutiMap : mangalMap;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"clamp(3px,1vw,5px)", alignItems:"center", width:"100%" }}>
      {fingerRows.map((row, ri) => (
        <div key={ri} style={{ display:"flex", gap:"clamp(2px,0.7vw,4px)", marginLeft: ri===1?"clamp(6px,3vw,14px)": ri===2?"clamp(10px,5vw,28px)":"0" }}>
          {row.map(key => {
            const fi = fingerMap[key] ?? 0;
            const fd = fingerData[fi];
            const isActive = activeFingers.length === 0 || activeFingers.includes(fi);
            const isHov = hoveredFinger === fi;
            const hindiChar = charMap[key] || "";
            return (
              <div key={key}
                onMouseEnter={() => onKeyHover(fi)}
                onMouseLeave={() => onKeyHover(null)}
                style={{
                  width:"clamp(21px,6.8vw,46px)", height:"clamp(30px,9vw,54px)", borderRadius:"clamp(6px,1.5vw,10px)",
                  background: isActive ? (isHov ? fd.color : fd.color+"28") : "var(--g75)",
                  border: `1.5px solid ${isActive ? (isHov ? fd.color : fd.color+"66") : "var(--g7)"}`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  gap:1, cursor:"pointer", flexShrink:0,
                  boxShadow: isHov ? `0 0 16px ${fd.color}88, 0 4px 12px rgba(0,0,0,0.4)` : "0 2px 6px rgba(0,0,0,0.3)",
                  transform: isHov ? "translateY(-4px) scale(1.08)" : "none",
                  transition:"all 0.18s ease", position:"relative",
                }}
              >
                {/* home key bump */}
                {fd.homeKey === key && (
                  <div style={{ position:"absolute", bottom:4, width:6, height:2, borderRadius:1, background: isActive ? fd.color : "var(--g6)" }} />
                )}
                {/* English key */}
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.5rem,1.8vw,0.72rem)", letterSpacing:"0.5px",
                  color: isActive ? (isHov?"rgba(255,255,255,0.6)":fd.color+"99") : "var(--g6)", lineHeight:1 }}>
                  {key}
                </span>
                {/* Hindi character */}
                <span style={{ fontSize:"clamp(0.62rem,2.2vw,0.9rem)", color: isActive ? (isHov?"#fff":fd.color) : "var(--g6)", lineHeight:1.1,
                  fontWeight:700 }}>
                  {hindiChar || key}
                </span>
                {/* hand indicator */}
                <span style={{ fontSize:"clamp(0.28rem,0.9vw,0.38rem)", fontWeight:700, letterSpacing:"0.3px", whiteSpace:"nowrap",
                  color: isActive ? (isHov?"rgba(255,255,255,0.6)":fd.color+"77") : "var(--g7)" }}>
                  {fi < 4 ? "L·" : "R·"}{fi%4===0?"Pin":fi%4===1?"Rng":fi%4===2?"Mid":"Idx"}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      {/* Spacebar */}
      <div style={{ width:"min(280px,90%)", height:"clamp(30px,9vw,38px)", borderRadius:10, marginTop:2,
        background:"rgba(255,111,0,0.06)", border:"1.5px solid rgba(255,111,0,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(6px,2vw,12px)" }}>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--f)" }}>👍</span>
        <span style={{ fontSize:"clamp(0.5rem,1.6vw,0.62rem)", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--g4)", whiteSpace:"nowrap" }}>SPACE — दोनों अंगूठे</span>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#0288d1" }}>👍</span>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function HindiTypingTips({ onBack }) {
  const navigate = useNavigate();
  const [theme, setTheme] = usePqTheme();
  const [activeTab, setActiveTab]           = useState("placement");
  const [layout, setLayout]                 = useState("kruti");
  const [hoveredFinger, setHoveredFinger]   = useState(null);
  const [selectedFinger, setSelectedFinger] = useState(null);
  const [showExercises, setShowExercises]   = useState(false);
  const [sliding, setSliding]               = useState(false);

  

  const goToExercises = () => {
    setSliding(true);
    setTimeout(() => { setShowExercises(true); setSliding(false); }, 320);
  };

  const backFromExercises = () => {
    setSliding(true);
    setTimeout(() => { setShowExercises(false); setSliding(false); }, 320);
  };

  if (showExercises) {
    return (
      <div style={{ animation:"slideInRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
        <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}`}</style>
        <HindiExercises onBack={backFromExercises} />
      </div>
    );
  }

  const activeFingers = selectedFinger !== null ? [selectedFinger] : [];
  const charMap = layout === "kruti" ? krutiMap : mangalMap;

  const tabs = [
    { id:"placement", label:"Finger Placement", icon:"🖐️" },
    { id:"tips",      label:"Pro Tips",          icon:"💡" },
    { id:"exercises", label:"Exercises",         icon:"💪" },
  ];

  return (
    <>
      <style>{`@keyframes slideOutLeft{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-48px)}}`}</style>
      <div style={{ animation: sliding ? "slideOutLeft 0.32s ease both" : "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --hin:var(--hin);--hinb:var(--hinb);--hind:var(--hind);
          --g9:var(--g9);--g8:var(--g8);--g75:var(--g75);--g7:var(--g7);
          --g6:var(--g6);--g4:var(--g4);--g3:var(--g3);--g2:var(--g2);--w:var(--w);
        }

        /* ── 3-way theme (uses pq_theme localStorage key via data-pqtheme) ── */
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
        .page,[data-pqtheme] .page,.practice-page,[data-pqtheme] .practice-page{background:var(--g9)!important}
        body{background:var(--g9)!important}
        .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px;flex-shrink:0}
        .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
        .pq-theme-btn:hover{opacity:.85}
        .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.08);box-shadow:0 0 0 1px var(--g6)}

        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 5px var(--hinb)}50%{box-shadow:0 0 16px var(--hinb)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--hin)44;border-radius:3px}

        .page{min-height:100vh;background:var(--g9);padding-bottom:60px;
          background-image:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(255,111,0,0.08) 0%,transparent 60%),
          linear-gradient(rgba(255,111,0,0.018) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,111,0,0.018) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;}

        .hdr{padding:44px 5% 0;position:relative;z-index:1;animation:fadeUp 0.5s ease both;}
        .back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;margin-bottom:20px;transition:color 0.18s;}
        .back-btn:hover{color:var(--hinb);}
        .hdr-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,111,0,0.1);border:1px solid rgba(255,111,0,0.28);border-radius:50px;padding:5px 16px;margin-bottom:14px;font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--hinb);}
        .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,6vw,4.5rem);letter-spacing:3px;color:var(--w);line-height:1;margin-bottom:10px;}
        .hdr-title em{font-style:normal;background:linear-gradient(135deg,var(--hinb),#ffcc80,var(--hind));-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 16px rgba(255,111,0,0.4));}
        .hdr-sub{font-size:0.88rem;color:var(--g4);line-height:1.7;max-width:540px;margin-bottom:24px;}
        .hdr-sub strong{color:var(--g2);}

        /* layout switcher */
        .layout-switch{display:flex;gap:0;border:1px solid var(--g6);border-radius:12px;overflow:hidden;width:fit-content;margin-bottom:28px;}
        .ls-btn{padding:9px 22px;background:var(--g8);border:none;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.84rem;font-weight:700;cursor:pointer;transition:all 0.2s;border-right:1px solid var(--g6);}
        .ls-btn:last-child{border-right:none;}
        .ls-btn--active{background:rgba(255,111,0,0.12);color:var(--hinb);}
        .ls-btn:hover:not(.ls-btn--active){color:var(--g2);}

        /* tabs */
        .tabs{display:flex;gap:0;border-bottom:1px solid var(--g6);padding:0 5%;margin-bottom:0;}
        .tab{display:flex;align-items:center;gap:8px;padding:13px 24px;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:0.86rem;font-weight:600;color:var(--g4);transition:all 0.2s;}
        .tab:hover{color:var(--g2);}
        .tab.active{color:var(--hinb);border-bottom-color:var(--hin);}
        .tab-icon{font-size:1rem;}

        .content{padding:36px 5%;}

        /* placement layout */
        .placement-layout{display:grid;grid-template-columns:1fr 380px;gap:32px;align-items:start;}
        @media(max-width:900px){.placement-layout{grid-template-columns:1fr;}}

        /* keyboard wrap */
        .keyboard-wrap{background:var(--g8);border:1px solid var(--g6);border-radius:20px;padding:28px 24px;position:sticky;top:20px;}
        @media(max-width:480px){.keyboard-wrap{padding:18px 10px;position:static;}}
        @media(max-height:480px) and (orientation:landscape){
          .keyboard-wrap{padding:14px 12px;position:static;}
          .placement-layout{grid-template-columns:1fr 340px;gap:16px;}
        }
        .kb-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:2px;color:var(--w);margin-bottom:4px;}
        .kb-sub{font-size:0.72rem;color:var(--g4);margin-bottom:18px;}
        .kb-legend{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px;}
        .kb-leg-item{display:flex;align-items:center;gap:5px;font-size:0.64rem;font-weight:600;color:var(--g4);}
        .kb-leg-dot{width:8px;height:8px;border-radius:50%;}

        /* finger cards */
        .finger-cards{display:flex;flex-direction:column;gap:10px;}
        .finger-card{border-radius:14px;padding:16px 18px;cursor:pointer;transition:all 0.22s;position:relative;overflow:hidden;}
        .finger-card:hover{transform:translateX(4px);}
        .finger-card.selected{transform:translateX(6px);}
        .fc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
        .fc-name{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:1.5px;color:var(--w);}
        .fc-tip{font-size:0.74rem;color:var(--g3);line-height:1.5;margin-top:5px;}
        .fc-str-bar{height:4px;background:var(--g7);border-radius:50;overflow:hidden;margin-top:8px;}
        .fc-str-fill{height:100%;border-radius:50;transition:width 0.4s ease;}

        /* tips */
        .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
        .tip-card{background:var(--g8);border:1px solid var(--g6);border-radius:16px;padding:22px 20px;transition:all 0.22s;animation:fadeUp 0.4s ease both;}
        .tip-card:hover{border-color:rgba(255,111,0,0.3);transform:translateY(-4px);box-shadow:0 10px 30px rgba(255,111,0,0.1);}
        .tip-icon{font-size:2rem;margin-bottom:12px;}
        .tip-level{display:inline-block;border-radius:50px;padding:2px 10px;font-size:0.58rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;}
        .tip-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:1.5px;color:var(--w);margin-bottom:8px;}
        .tip-body{font-size:0.8rem;color:var(--g3);line-height:1.7;}

        /* exercises */
        .ex-grid{display:flex;flex-direction:column;gap:12px;}
        .ex-card{background:var(--g8);border:1px solid var(--g6);border-radius:14px;padding:20px 22px;display:flex;align-items:center;gap:20px;transition:all 0.22s;animation:slideIn 0.4s ease both;flex-wrap:wrap;}
        .ex-card:hover{border-color:rgba(255,111,0,0.3);transform:translateX(5px);}
        .ex-keys{background:var(--g7);border:1px solid var(--g6);border-radius:10px;padding:8px 14px;font-size:1.1rem;color:var(--hinb);white-space:nowrap;flex-shrink:0;min-width:140px;text-align:center;font-weight:700;line-height:1.4;}
        .ex-info{flex:1;min-width:180px;}
        .ex-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:1.5px;color:var(--w);margin-bottom:4px;}
        .ex-desc{font-size:0.78rem;color:var(--g3);line-height:1.6;margin-bottom:8px;}
        .ex-meta{display:flex;gap:10px;flex-wrap:wrap;}
        .ex-badge{border-radius:50px;padding:3px 10px;font-size:0.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
        .ex-cta{background:linear-gradient(135deg,var(--hinb),var(--hind));color:#fff;border:none;border-radius:50px;padding:9px 20px;font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
        .ex-cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,111,0,0.4);}

        /* target banner */
        .target-banner{background:rgba(255,111,0,0.06);border:1px solid rgba(255,111,0,0.2);border-radius:14px;padding:18px 20px;margin:0 5% 0;display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
        .tb-icon{font-size:2rem;flex-shrink:0;}
        .tb-title{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;color:var(--hinb);margin-bottom:3px;}
        .tb-sub{font-size:0.78rem;color:var(--g4);line-height:1.5;}
        .tb-stats{display:flex;gap:16px;flex-wrap:wrap;margin-left:auto;}
        .tb-stat{text-align:center;}
        .tb-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:1.5px;color:var(--hinb);}
        .tb-stat-lbl{font-size:0.58rem;font-weight:700;text-transform:uppercase;color:var(--g4);}
      `}</style>

      <div className="page" data-pqtheme={theme}>

        {/* HEADER */}
        <div className="hdr">
          <button className="back-btn" onClick={history.back(-1)}>← वापस जाएं</button>
          <div className="hdr-badge">🇮🇳 Hindi Typing Guide</div>
          <h1 className="hdr-title">Finger Placement<br/><em>& Hindi Tips</em></h1>
          <p className="hdr-sub">
            सही उंगली से सही key दबाना सीखें, <strong>Kruti Dev और Mangal</strong> दोनों layout के लिए। <strong>30+ WPM</strong> SSC और Railway exams के लिए ज़रूरी है।
          </p>

          {/* Layout switcher */}
          <div className="layout-switch">
            <button className={`ls-btn${layout==="kruti"?" ls-btn--active":""}`} onClick={()=>setLayout("kruti")}>
              🔤 Kruti Dev
            </button>
            <button className={`ls-btn${layout==="mangal"?" ls-btn--active":""}`} onClick={()=>setLayout("mangal")}>
              🔠 Mangal / Inscript
            </button>
          </div>
        </div>

        {/* SSC TARGET BANNER */}
        <div className="target-banner" style={{marginBottom:0}}>
          <span className="tb-icon">🎯</span>
          <div>
            <div className="tb-title">SSC Hindi Typing Target</div>
            <div className="tb-sub">SSC CHSL / MTS के लिए 30 WPM minimum। 75%+ accuracy ज़रूरी। 35+ WPM safe रहने के लिए target करें।</div>
          </div>
          <div className="tb-stats">
            {[{v:"30",l:"Min WPM"},{v:"75%",l:"Min Accuracy"},{v:"15 Min",l:"Test Duration"}].map(s=>(
              <div className="tb-stat" key={s.l}>
                <div className="tb-stat-val">{s.v}</div>
                <div className="tb-stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="tabs" style={{marginTop:28}}>
          {tabs.map(t=>(
            <button key={t.id} className={`tab${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="content">

          {/* ── FINGER PLACEMENT TAB ── */}
          {activeTab === "placement" && (
            <div className="placement-layout">

              {/* Left — finger cards */}
              <div className="finger-cards">
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:2,color:"var(--w)",marginBottom:4}}>
                  8 Finger Zones — {layout === "kruti" ? "Kruti Dev" : "Mangal"}
                </div>
                <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:16,lineHeight:1.6}}>
                  किसी finger पर click करें — keyboard पर उसकी keys highlight होंगी →
                </p>

                {fingerData.map(f=>(
                  <div key={f.id}
                    className={`finger-card${selectedFinger===f.id?" selected":""}`}
                    style={{
                      background: selectedFinger===f.id ? f.color+"14" : hoveredFinger===f.id ? f.color+"0a" : "var(--g8)",
                      border: `1.5px solid ${selectedFinger===f.id ? f.color+"66" : hoveredFinger===f.id ? f.color+"33" : "var(--g6)"}`,
                      boxShadow: selectedFinger===f.id ? `0 0 0 2px ${f.color}22, 0 8px 24px ${f.color}18` : "none",
                    }}
                    onClick={()=>setSelectedFinger(selectedFinger===f.id?null:f.id)}
                    onMouseEnter={()=>setHoveredFinger(f.id)}
                    onMouseLeave={()=>setHoveredFinger(null)}
                  >
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"3px 0 0 3px",
                      background:f.color,opacity:selectedFinger===f.id||hoveredFinger===f.id?1:0.3,transition:"opacity 0.2s"}}/>

                    <div className="fc-header">
                      <div className="fc-name">{f.name}</div>
                      <span style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",
                        color:f.color,background:f.color+"18",border:`1px solid ${f.color}33`,borderRadius:50,padding:"2px 9px"}}>
                        {f.hand === "Left" ? "बाईं" : "दाईं"}
                      </span>
                    </div>

                    <div style={{color:f.color+"88",fontSize:"0.62rem",fontWeight:600,marginBottom:6}}>
                      Home key: <strong style={{color:f.color}}>{f.homeKey}</strong>
                      {" — "}
                      <span style={{color:f.color}}>{charMap[f.homeKey] || f.homeKey}</span>
                    </div>

                    {/* key chips with Hindi characters */}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                      {f.keys.map(k=>(
                        <span key={k} style={{background:f.color+"22",border:`1px solid ${f.color}44`,borderRadius:6,
                          padding:"3px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.75rem",letterSpacing:"1px",color:f.color+"88"}}>{k}</span>
                          <span style={{fontSize:"0.9rem",color:f.color,fontWeight:700,lineHeight:1}}>{charMap[k]||k}</span>
                        </span>
                      ))}
                    </div>

                    <div className="fc-tip">{f.tip}</div>

                    <div style={{marginTop:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:"0.58rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"var(--g4)"}}>Finger Strength</span>
                        <span style={{fontSize:"0.62rem",fontWeight:700,color:f.color}}>{f.strength}%</span>
                      </div>
                      <div className="fc-str-bar">
                        <div className="fc-str-fill" style={{width:`${f.strength}%`,background:`linear-gradient(90deg,${f.color}88,${f.color})`}}/>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedFinger !== null && (
                  <button onClick={()=>setSelectedFinger(null)}
                    style={{background:"none",border:"1px solid var(--g6)",borderRadius:10,padding:"8px 16px",color:"var(--g4)",
                      fontFamily:"'Outfit',sans-serif",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",marginTop:4,transition:"all 0.2s"}}
                    onMouseEnter={e=>e.target.style.borderColor="var(--hin)"}
                    onMouseLeave={e=>e.target.style.borderColor="var(--g6)"}>
                    ✕ सभी Keys दिखाएं
                  </button>
                )}
              </div>

              {/* Right — keyboard + hand diagrams */}
              <div>
                <div className="keyboard-wrap">
                  <div className="kb-title">
                    {layout === "kruti" ? "Kruti Dev" : "Mangal"} Keyboard
                  </div>
                  <div className="kb-sub">Key पर hover करें या finger card click करें</div>

                  <InteractiveKeyboard
                    activeFingers={activeFingers}
                    hoveredFinger={hoveredFinger}
                    onKeyHover={setHoveredFinger}
                    layout={layout}
                  />

                  {/* HAND DIAGRAMS */}
                  <div style={{marginTop:20,borderTop:"1px solid var(--g7)",paddingTop:18}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.85rem",letterSpacing:"2px",color:"var(--g4)",textTransform:"uppercase",textAlign:"center",marginBottom:14}}>
                      हाथ की स्थिति (Hand Position)
                    </div>
                    <div style={{display:"flex",justifyContent:"space-around",gap:8,flexWrap:"wrap"}}>
                      <HandDiagram
                        hand="left"
                        hoveredFinger={hoveredFinger}
                        selectedFinger={selectedFinger}
                        onFingerHover={setHoveredFinger}
                        onFingerClick={(id)=>setSelectedFinger(selectedFinger===id?null:id)}
                      />
                      <HandDiagram
                        hand="right"
                        hoveredFinger={hoveredFinger}
                        selectedFinger={selectedFinger}
                        onFingerHover={setHoveredFinger}
                        onFingerClick={(id)=>setSelectedFinger(selectedFinger===id?null:id)}
                      />
                    </div>
                    <div style={{fontSize:"0.68rem",color:"var(--g4)",textAlign:"center",marginTop:10,lineHeight:1.5}}>
                      किसी उंगली पर click करें → ऊपर keyboard पर उसकी keys highlight होंगी
                    </div>
                  </div>

                  {/* legend */}
                  <div className="kb-legend">
                    {fingerData.map(f=>(
                      <div key={f.id} className="kb-leg-item">
                        <span className="kb-leg-dot" style={{background:f.color}}/>
                        {f.name.replace("Left ","बाईं ").replace("Right ","दाईं ")}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home row callout */}
                <div style={{background:"rgba(255,111,0,0.06)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:14,padding:"16px 18px",marginTop:16}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"2px",color:"var(--hinb)",marginBottom:8}}>🏠 Home Row — आपका Anchor</div>
                  <div style={{display:"flex",gap:5,marginBottom:10,justifyContent:"center",flexWrap:"wrap"}}>
                    {["A","S","D","F","·","J","K","L",";"].map((k,i)=>(
                      <div key={i} style={{
                        width:k==="·"?16:40,height:40,borderRadius:8,
                        background:k==="·"?"transparent":k==="F"||k==="J"?"rgba(255,111,0,0.3)":"rgba(255,111,0,0.1)",
                        border:k==="·"?"none":k==="F"||k==="J"?"1.5px solid rgba(255,111,0,0.6)":"1px solid rgba(255,111,0,0.2)",
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                      }}>
                        {k !== "·" && <>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.62rem",color:k==="F"||k==="J"?"rgba(255,167,38,0.7)":"rgba(255,167,38,0.4)",lineHeight:1}}>{k}</span>
                          <span style={{fontSize:"0.8rem",color:k==="F"||k==="J"?"var(--hinb)":"rgba(255,167,38,0.5)",fontWeight:700,lineHeight:1}}>{charMap[k]||k}</span>
                        </>}
                        {k === "·" && <span style={{color:"var(--g6)",fontSize:"1rem"}}>·</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:"0.72rem",color:"var(--g4)",textAlign:"center",lineHeight:1.5}}>
                    F और J पर <strong style={{color:"var(--hinb)"}}>उभरी पट्टी</strong> है — बिना देखे पहचानें। हर keystroke के बाद यहीं वापस आएं।
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TIPS TAB ── */}
          {activeTab === "tips" && (
            <>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
                {[
                  {label:"ज़रूरी",       color:"#ef4444"},
                  {label:"हिंदी खास",   color:"var(--hinb)"},
                  {label:"महत्वपूर्ण",  color:"var(--hinb)"},
                  {label:"स्वास्थ्य",  color:"#22c55e"},
                  {label:"Routine",     color:"#4db6f7"},
                  {label:"Advanced",    color:"#ce93d8"},
                ].map(l=>(
                  <div key={l.label} style={{display:"flex",alignItems:"center",gap:6,background:"var(--g8)",border:"1px solid var(--g6)",borderRadius:50,padding:"5px 12px"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:l.color,flexShrink:0}}/>
                    <span style={{fontSize:"0.7rem",fontWeight:600,color:"var(--g3)"}}>{l.label}</span>
                  </div>
                ))}
              </div>
              <div className="tips-grid">
                {proTips.map((t,i)=>(
                  <div key={i} className="tip-card" style={{animationDelay:`${i*0.05}s`}}>
                    <div className="tip-icon">{t.icon}</div>
                    <div className="tip-level" style={{background:t.levelColor+"18",color:t.levelColor,border:`1px solid ${t.levelColor}33`}}>{t.level}</div>
                    <div className="tip-title">{t.title}</div>
                    <div className="tip-body">{t.body}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── EXERCISES TAB ── */}
          {activeTab === "exercises" && (
            <>
              <div style={{background:"rgba(255,111,0,0.07)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:14,padding:"14px 18px",marginBottom:24,fontSize:"0.8rem",color:"var(--g3)",lineHeight:1.6}}>
                💡 <strong style={{color:"#fff"}}>कैसे करें:</strong> Beginner से शुरू करें और तभी आगे बढ़ें जब 95%+ accuracy आ जाए। हर exercise को बिना रुके पूरा करें।
              </div>
              <div className="ex-grid">
                {exercises.map((e,i)=>{
                  const diffColor = e.difficulty==="Beginner"?"#22c55e":e.difficulty==="Intermediate"?"var(--hinb)":"#ef4444";
                  return (
                    <div key={i} className="ex-card" style={{animationDelay:`${i*0.07}s`}}>
                      <div className="ex-keys">{e.keys}</div>
                      <div className="ex-info">
                        <div className="ex-title">{e.title}</div>
                        <div className="ex-desc">{e.desc}</div>
                        <div className="ex-meta">
                          <span className="ex-badge" style={{background:diffColor+"18",color:diffColor,border:`1px solid ${diffColor}33`}}>{e.difficulty}</span>
                          <span className="ex-badge" style={{background:"rgba(255,255,255,0.05)",color:"var(--g3)",border:"1px solid var(--g6)"}}>⏱ {e.duration}</span>
                        </div>
                      </div>
                      <button className="ex-cta" onClick={goToExercises}>शुरू करें →</button>
                    </div>
                  );
                })}
              </div>

              {/* Big CTA */}
              <div style={{marginTop:28,textAlign:"center"}}>
                <button onClick={goToExercises}
                  style={{background:"linear-gradient(135deg,var(--hinb),var(--hind))",color:"#fff",border:"none",borderRadius:50,padding:"14px 40px",fontFamily:"'Outfit',sans-serif",fontSize:"1rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(255,111,0,0.38)",transition:"all 0.22s",letterSpacing:"0.4px"}}
                  onMouseEnter={e=>{e.target.style.transform="translateY(-3px)";e.target.style.boxShadow="0 8px 32px rgba(255,111,0,0.54)";}}
                  onMouseLeave={e=>{e.target.style.transform="none";e.target.style.boxShadow="0 4px 24px rgba(255,111,0,0.38)";}}>
                  💪 Full Exercise Page खोलें →
                </button>
                <p style={{fontSize:"0.72rem",color:"var(--g4)",marginTop:10}}>पहले keystroke पर timer शुरू होगा — कोई countdown नहीं</p>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}