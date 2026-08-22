import { useState } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import EnglishExercises from "./englishexercise";
import { useNavigate } from "react-router-dom";

/* ─── DATA ───────────────────────────────────────────────────────── */
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

const fingerData = [
  {
    id: 0, name: "Left Pinky",   hand: "Left",  color: "var(--f)",
    keys: ["Q","A","Z"],
    homeKey: "A",
    tip: "Lightest finger — keep it relaxed. Anchor on A at all times.",
    strength: 40,
  },
  {
    id: 1, name: "Left Ring",    hand: "Left",  color: "#c2185b",
    keys: ["W","S","X"],
    homeKey: "S",
    tip: "Second weakest. Keep it close to home row. Don't overextend.",
    strength: 55,
  },
  {
    id: 2, name: "Left Middle",  hand: "Left",  color: "#9c27b0",
    keys: ["E","D","C"],
    homeKey: "D",
    tip: "Strongest left finger. E is the most used letter in English.",
    strength: 75,
  },
  {
    id: 3, name: "Left Index",   hand: "Left",  color: "#7b1fa2",
    keys: ["R","F","V","T","G"],
    homeKey: "F",
    tip: "Most versatile — covers 5 keys. F has the bump for home row reference.",
    strength: 85,
  },
  {
    id: 4, name: "Right Index",  hand: "Right", color: "#0288d1",
    keys: ["Y","H","B","U","J","N","M"],
    homeKey: "J",
    tip: "Mirror of left index. J has the bump. Covers the widest range.",
    strength: 85,
  },
  {
    id: 5, name: "Right Middle", hand: "Right", color: "#0277bd",
    keys: ["I","K",","],
    homeKey: "K",
    tip: "I is one of the top 10 most used letters. Keep this finger ready.",
    strength: 75,
  },
  {
    id: 6, name: "Right Ring",   hand: "Right", color: "#01579b",
    keys: ["O","L","."],
    homeKey: "L",
    tip: "O is very common. Ring finger needs regular strength training.",
    strength: 55,
  },
  {
    id: 7, name: "Right Pinky",  hand: "Right", color: "#003c6e",
    keys: ["P",";","/"],
    homeKey: ";",
    tip: "Weakest right finger. ; and / are rare — don't stress about these.",
    strength: 40,
  },
];

const commonWords = [
  { word:"the",  finger:"Right Index · H key area",  freq:"Most common" },
  { word:"and",  finger:"Left Index · Left Ring · Left Middle", freq:"Top 3" },
  { word:"that", finger:"Left Ring · Left Index · Left Index · Left Ring", freq:"Top 10" },
  { word:"have", finger:"Left Index · Left Index · Left Index · Left Middle", freq:"Top 15" },
  { word:"for",  finger:"Left Index · Left Middle · Left Ring", freq:"Top 5" },
  { word:"not",  finger:"Right Index · Left Middle · Right Ring", freq:"Top 20" },
];

const proTips = [
  {
    icon:"🏠",
    title:"Master the Home Row",
    body:"ASDF (left) and JKL; (right) are your home keys. Your fingers must return here after every keystroke. The F and J keys have raised bumps — feel them without looking.",
    level:"Essential",
    levelColor:"#ef4444",
  },
  {
    icon:"👁️",
    title:"Eyes on Screen Always",
    body:"Looking at the keyboard is the single biggest barrier to speed improvement. Your eyes should always be on the text you're typing. Muscle memory takes 2–3 weeks to build.",
    level:"Essential",
    levelColor:"#ef4444",
  },
  {
    icon:"🎯",
    title:"Accuracy Before Speed",
    body:"Typing fast with errors is slower than typing slow with accuracy. Each error costs you time to mentally register it. Aim for 95%+ accuracy before worrying about WPM.",
    level:"Important",
    levelColor:"var(--hinb)",
  },
  {
    icon:"⚡",
    title:"Consistent Rhythm",
    body:"Type at a steady tempo — like a metronome. Experienced typists don't burst and pause. They maintain a consistent cadence that maximises both speed and accuracy.",
    level:"Important",
    levelColor:"var(--hinb)",
  },
  {
    icon:"🧘",
    title:"Relax Your Hands",
    body:"Tension in your wrists, arms, or shoulders dramatically reduces speed and causes strain. Keep wrists level and floating. Shake your hands loose before a long session.",
    level:"Health",
    levelColor:"#22c55e",
  },
  {
    icon:"🖥️",
    title:"Correct Posture",
    body:"Sit upright, screen at eye level, elbows at 90°. Your wrists should not rest on the desk while typing — only when pausing. Bad posture leads to RSI over time.",
    level:"Health",
    levelColor:"#22c55e",
  },
  {
    icon:"📈",
    title:"Practice 15–20 Min Daily",
    body:"Short daily sessions beat long irregular ones. Your brain consolidates motor memory during sleep. 15 minutes every day for 30 days will double your WPM.",
    level:"Routine",
    levelColor:"#4db6f7",
  },
  {
    icon:"🔤",
    title:"Practice Weak Keys",
    body:"Identify which keys cause you to slow down or look at the keyboard. Drill those specific keys in isolation — single key rows, then combinations. Target your weakest links.",
    level:"Routine",
    levelColor:"#4db6f7",
  },
  {
    icon:"📏",
    title:"Use All 10 Fingers",
    body:"Even if you type fast with 6 or 8 fingers, you have a hard ceiling. Training all 10 fingers is the only way to reach 50+ WPM consistently for SSC exams.",
    level:"Advanced",
    levelColor:"#ce93d8",
  },
  {
    icon:"🏆",
    title:"Track Progress Weekly",
    body:"Take a 1-minute test every week and record your WPM and accuracy. Seeing improvement — even 1–2 WPM per week — is the biggest motivation boost to keep practicing.",
    level:"Advanced",
    levelColor:"#ce93d8",
  },
];

const exercises = [
  { title:"Home Row Drill",     keys:"ASDF JKL;", desc:"Type only home row keys in random patterns for 2 minutes. Foundation of all typing.", duration:"2 min", difficulty:"Beginner" },
  { title:"Top Row Extension",  keys:"QWER UIOP", desc:"Reach to top row and return to home. Focus on snapping back to home keys.", duration:"2 min", difficulty:"Beginner" },
  { title:"Bottom Row Stretch", keys:"ZXCV NM,.", desc:"Most typists struggle here. Slow and deliberate — accuracy first.", duration:"2 min", difficulty:"Beginner" },
  { title:"Common Digraphs",    keys:"TH HE IN ER AN", desc:"These 5 pairs make up 30% of English text. Drill until they feel automatic.", duration:"3 min", difficulty:"Intermediate" },
  { title:"Full Word Practice", keys:"the and that have for", desc:"Type the 100 most common English words repeatedly. Pure muscle memory building.", duration:"5 min", difficulty:"Intermediate" },
  { title:"SSC Speed Drill",    keys:"Full paragraphs", desc:"Copy real SSC passage text at maximum comfortable speed. No errors allowed.", duration:"5 min", difficulty:"Advanced" },
];

/* ─── HAND DIAGRAM ───────────────────────────────────────────────── */
function HandDiagram({ hand, hoveredFinger, onFingerHover, selectedFinger, onFingerClick }) {
  // finger positions for left and right hand SVG
  // each finger: id, name, cx, cy, rx, ry (ellipse), label position
  const leftFingers = [
    { id:0, name:"Pinky",  cx:38,  cy:80, rx:11, ry:36, labelX:38,  labelY:128, tip:"Q A Z" },
    { id:1, name:"Ring",   cx:68,  cy:68, rx:12, ry:42, labelX:68,  labelY:122, tip:"W S X" },
    { id:2, name:"Middle", cx:100, cy:62, rx:12, ry:46, labelX:100, labelY:120, tip:"E D C" },
    { id:3, name:"Index",  cx:132, cy:68, rx:13, ry:42, labelX:132, labelY:122, tip:"R F V T G" },
  ];
  const rightFingers = [
    { id:4, name:"Index",  cx:48,  cy:68, rx:13, ry:42, labelX:48,  labelY:122, tip:"Y H B U J N M" },
    { id:5, name:"Middle", cx:80,  cy:62, rx:12, ry:46, labelX:80,  labelY:120, tip:"I K ," },
    { id:6, name:"Ring",   cx:112, cy:68, rx:12, ry:42, labelX:112, labelY:122, tip:"O L ." },
    { id:7, name:"Pinky",  cx:142, cy:80, rx:11, ry:36, labelX:142, labelY:128, tip:"P ; /" },
  ];

  const fingers = hand === "left" ? leftFingers : rightFingers;
  const thumbColor = hand === "left" ? "var(--f)" : "#0288d1";
  const thumbX = hand === "left" ? 158 : 22;
  const palmColor = hand === "left" ? "rgba(233,30,140,0.06)" : "rgba(2,136,209,0.06)";
  const palmBorder = hand === "left" ? "rgba(233,30,140,0.2)" : "rgba(2,136,209,0.2)";

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:"0.65rem", fontWeight:800, letterSpacing:"2.5px", textTransform:"uppercase",
        color: hand==="left" ? "var(--f)" : "#0288d1", marginBottom:8 }}>
        {hand === "left" ? "👈 Left Hand" : "Right Hand 👉"}
      </div>
      <svg width="200" height="210" viewBox="0 0 200 210" style={{ overflow:"visible" }}>

        {/* Palm */}
        <rect x="28" y="120" width="144" height="70" rx="18" ry="18"
          fill={palmColor} stroke={palmBorder} strokeWidth="1.5" />

        {/* Thumb */}
        <ellipse
          cx={thumbX} cy={145} rx={14} ry={24}
          fill={thumbColor+"22"} stroke={thumbColor+"55"} strokeWidth="1.5"
          style={{ cursor:"pointer", transition:"all 0.18s" }}
        />
        <text x={thumbX} y={149} textAnchor="middle" style={{ fontSize:"8px", fill:thumbColor, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
          Thumb
        </text>
        <text x={thumbX} y={160} textAnchor="middle" style={{ fontSize:"7px", fill:thumbColor+"88", fontFamily:"'Outfit',sans-serif" }}>
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
              style={{ cursor:"pointer" }}
            >
              {/* finger body */}
              <ellipse
                cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry}
                fill={active ? fd.color+"44" : fd.color+"18"}
                stroke={active ? fd.color : fd.color+"55"}
                strokeWidth={active ? "2" : "1.5"}
                style={{ transition:"all 0.18s", filter: active ? `drop-shadow(0 0 6px ${fd.color}88)` : "none",
                  transform: active ? "translateY(-4px)" : "none", transformOrigin:`${f.cx}px ${f.cy}px` }}
              />

              {/* finger name */}
              <text x={f.cx} y={f.cy - 8} textAnchor="middle"
                style={{ fontSize:"7.5px", fill: active ? "#fff" : fd.color, fontWeight:700, fontFamily:"'Outfit',sans-serif", transition:"fill 0.18s" }}>
                {f.name}
              </text>

              {/* finger keys */}
              <text x={f.cx} y={f.cy + 6} textAnchor="middle"
                style={{ fontSize:"6.5px", fill: active ? fd.color : fd.color+"77", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"1px" }}>
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
            </g>
          );
        })}

        {/* Home key labels on palm */}
        {fingers.map((f) => {
          const fd = fingerData[f.id];
          const isSel = selectedFinger === f.id || hoveredFinger === f.id;
          return (
            <g key={`home-${f.id}`}>
              <rect x={f.cx - 12} y={128} width={24} height={16} rx={4}
                fill={isSel ? fd.color+"33" : fd.color+"11"}
                stroke={isSel ? fd.color+"88" : fd.color+"33"} strokeWidth="1"
                style={{ transition:"all 0.18s" }}
              />
              <text x={f.cx} y={140} textAnchor="middle"
                style={{ fontSize:"7px", fill: isSel ? fd.color : fd.color+"88", fontWeight:800,
                  fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.5px" }}>
                {fingerData[f.id].homeKey}
              </text>
            </g>
          );
        })}

        {/* HOME ROW label */}
        <text x="100" y="162" textAnchor="middle"
          style={{ fontSize:"6px", fill:"var(--g4)", fontWeight:700, fontFamily:"'Outfit',sans-serif", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          HOME ROW
        </text>

        {/* Wrist */}
        <rect x="55" y="184" width="90" height="22" rx="11"
          fill={palmColor} stroke={palmBorder} strokeWidth="1" />
        <text x="100" y="199" textAnchor="middle"
          style={{ fontSize:"7px", fill:"var(--g4)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>
          {hand === "left" ? "Left Hand" : "Right Hand"}
        </text>
      </svg>
    </div>
  );
}

/* ─── INTERACTIVE KEYBOARD ───────────────────────────────────────── */
function InteractiveKeyboard({ activeFingers, hoveredFinger, onKeyHover }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"clamp(3px,1vw,6px)", alignItems:"center", width:"100%" }}>
      {fingerRows.map((row, ri) => (
        <div key={ri} style={{ display:"flex", gap:"clamp(2px,0.8vw,5px)", marginLeft: ri===1?"clamp(6px,3vw,14px)": ri===2?"clamp(10px,5vw,28px)":"0" }}>
          {row.map(key => {
            const fi = fingerMap[key] ?? 0;
            const fd = fingerData[fi];
            const isActive = activeFingers.length === 0 || activeFingers.includes(fi);
            const isHovered = hoveredFinger === fi;
            return (
              <div
                key={key}
                onMouseEnter={() => onKeyHover(fi)}
                onMouseLeave={() => onKeyHover(null)}
                style={{
                  width:"clamp(22px,7vw,48px)", height:"clamp(26px,8vw,52px)", borderRadius:"clamp(6px,1.5vw,10px)",
                  background: isActive ? (isHovered ? fd.color : fd.color+"28") : "var(--g75)",
                  border: `1.5px solid ${isActive ? (isHovered ? fd.color : fd.color+"66") : "var(--g7)"}`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  gap:2, cursor:"pointer", flexShrink:0,
                  boxShadow: isHovered ? `0 0 16px ${fd.color}88, 0 4px 12px rgba(0,0,0,0.4)` : "0 2px 6px rgba(0,0,0,0.3)",
                  transform: isHovered ? "translateY(-4px) scale(1.08)" : "none",
                  transition:"all 0.18s ease",
                  position:"relative",
                }}
              >
                {/* home key bump indicator */}
                {fd.homeKey === key && (
                  <div style={{ position:"absolute", bottom:4, width:6, height:2, borderRadius:1, background: isActive ? fd.color : "var(--g6)" }} />
                )}
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(0.65rem,2.2vw,1rem)", letterSpacing:1, color: isActive ? (isHovered?"#fff":fd.color) : "var(--g6)", lineHeight:1 }}>{key}</span>
                <span style={{ fontSize:"clamp(0.32rem,1vw,0.46rem)", fontWeight:700, color: isActive ? (isHovered?"rgba(255,255,255,0.7)":fd.color+"99") : "var(--g7)", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>
                  {fi < 4 ? "L·" : "R·"}{fi%4===0?"Pinky":fi%4===1?"Ring":fi%4===2?"Mid":"Idx"}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {/* Spacebar */}
      <div style={{ width:"min(280px,90%)", height:"clamp(30px,9vw,38px)", borderRadius:10, marginTop:2,
        background:"rgba(233,30,140,0.06)", border:"1.5px solid rgba(233,30,140,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(6px,2vw,12px)" }}>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--f)" }}>👍</span>
        <span style={{ fontSize:"clamp(0.5rem,1.6vw,0.62rem)", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"var(--g4)", whiteSpace:"nowrap" }}>SPACE — Both Thumbs</span>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#0288d1" }}>👍</span>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function EnglishTypingTips({ onBack }) {
  const navigate = useNavigate();
  const [theme, setTheme] = usePqTheme();
  const [activeTab, setActiveTab]           = useState("placement");
  const [hoveredFinger, setHoveredFinger]   = useState(null);
  const [selectedFinger, setSelectedFinger] = useState(null);
  const [showExercises, setShowExercises]   = useState(false);
  const [sliding, setSliding]               = useState(false);

  const activeFingers = selectedFinger !== null ? [selectedFinger] : [];

  const tabs = [
    { id:"placement", label:"Finger Placement", icon:"🖐️" },
    { id:"tips",      label:"Pro Tips",          icon:"💡" },
    { id:"exercises", label:"Exercises",         icon:"💪" },
  ];

  const goToExercises = () => {
    setSliding(true);
    setTimeout(() => { setShowExercises(true); setSliding(false); }, 320);
  };

  const backFromExercises = () => {
    setSliding(true);
    setTimeout(() => { setShowExercises(false); setSliding(false); }, 320);
  };

  // Show exercises page with slide
  if (showExercises) {
    return (
      <div style={{ animation:"slideInRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
        <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}`}</style>
        <EnglishExercises onBack={backFromExercises} />
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes slideOutLeft{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-48px)}}`}</style>
      <div style={{ animation: sliding ? "slideOutLeft 0.32s ease both" : "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --f:var(--f);--fb:var(--fb);--fd:var(--fd);
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
        @keyframes pulse{0%,100%{box-shadow:0 0 5px var(--fb)}50%{box-shadow:0 0 16px var(--fb)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--f)44;border-radius:3px}

        .page{min-height:100vh;background:var(--g9);padding-bottom:60px;
          background-image:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(233,30,140,0.08) 0%,transparent 60%),
          linear-gradient(rgba(233,30,140,0.02) 1px,transparent 1px),
          linear-gradient(90deg,rgba(233,30,140,0.02) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;}

        /* HEADER */
        .hdr{padding:44px 5% 0;position:relative;z-index:1;animation:fadeUp 0.5s ease both;}
        .back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;margin-bottom:20px;transition:color 0.18s;}
        .back-btn:hover{color:var(--fb);}
        .hdr-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(233,30,140,0.08);border:1px solid rgba(233,30,140,0.25);border-radius:50px;padding:5px 16px;margin-bottom:14px;font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--fb);}
        .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,6vw,4.5rem);letter-spacing:3px;color:var(--w);line-height:1;margin-bottom:10px;}
        .hdr-title em{font-style:normal;background:linear-gradient(135deg,var(--fb),#ff88cc,var(--fd));-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 16px rgba(233,30,140,0.4));}
        .hdr-sub{font-size:0.88rem;color:var(--g4);line-height:1.7;max-width:540px;margin-bottom:32px;}
        .hdr-sub strong{color:var(--g2);}

        /* TABS */
        .tabs{display:flex;gap:0;border-bottom:1px solid var(--g6);padding:0 5%;margin-bottom:0;}
        .tab{display:flex;align-items:center;gap:8px;padding:13px 24px;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:0.86rem;font-weight:600;color:var(--g4);transition:all 0.2s;letter-spacing:0.3px;}
        .tab:hover{color:var(--g2);}
        .tab.active{color:var(--fb);border-bottom-color:var(--f);}
        .tab-icon{font-size:1rem;}

        /* CONTENT WRAP */
        .content{padding:36px 5%;}

        /* ── PLACEMENT TAB ── */
        .placement-layout{display:grid;grid-template-columns:1fr 380px;gap:32px;align-items:start;}
        @media(max-width:900px){.placement-layout{grid-template-columns:1fr;}}

        /* keyboard wrap */
        .keyboard-wrap{background:var(--g8);border:1px solid var(--g6);border-radius:20px;padding:28px 24px;position:sticky;top:20px;}
        @media(max-width:480px){.keyboard-wrap{padding:18px 10px;position:static;}}
        /* Landscape phones: often 700-900px WIDE (past the query above) but
           short on height — the sticky panel and generous padding both eat
           into limited vertical space here. */
        @media(max-height:480px) and (orientation:landscape){
          .keyboard-wrap{padding:14px 12px;position:static;}
          .placement-layout{grid-template-columns:1fr 340px;gap:16px;}
        }
        .kb-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:2px;color:var(--w);margin-bottom:4px;}
        .kb-sub{font-size:0.72rem;color:var(--g4);margin-bottom:20px;}
        .kb-legend{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px;}
        .kb-leg-item{display:flex;align-items:center;gap:5px;font-size:0.64rem;font-weight:600;color:var(--g4);}
        .kb-leg-dot{width:8px;height:8px;border-radius:50%;}

        /* finger cards */
        .finger-cards{display:flex;flex-direction:column;gap:10px;}
        .finger-card{border-radius:14px;padding:16px 18px;cursor:pointer;transition:all 0.22s;border:1.5px solid transparent;position:relative;overflow:hidden;}
        .finger-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px;transition:opacity 0.2s;}
        .finger-card:hover{transform:translateX(4px);}
        .finger-card.selected{transform:translateX(6px);}
        .fc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
        .fc-name{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:1.5px;color:var(--w);}
        .fc-hand{font-size:0.62rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;}
        .fc-keys{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;}
        .fc-key{border-radius:6px;padding:"3px 9px";font-family:'Bebas Neue',sans-serif;font-size:0.85rem;letter-spacing:1px;font-weight:700;}
        .fc-home{font-size:0.62rem;font-weight:600;color:var(--g4);margin-bottom:5px;}
        .fc-tip{font-size:0.74rem;color:var(--g3);line-height:1.5;}
        .fc-strength{margin-top:8px;}
        .fc-str-bar{height:4px;background:var(--g7);border-radius:50;overflow:hidden;}
        .fc-str-fill{height:100%;border-radius:50;transition:width 0.4s ease;}

        /* ── TIPS TAB ── */
        .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
        .tip-card{background:var(--g8);border:1px solid var(--g6);border-radius:16px;padding:22px 20px;transition:all 0.22s;animation:fadeUp 0.4s ease both;}
        .tip-card:hover{border-color:rgba(233,30,140,0.3);transform:translateY(-4px);box-shadow:0 10px 30px rgba(233,30,140,0.1);}
        .tip-icon{font-size:2rem;margin-bottom:12px;}
        .tip-level{display:inline-block;border-radius:50px;padding:2px 10px;font-size:0.58rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;}
        .tip-title{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:1.5px;color:var(--w);margin-bottom:8px;}
        .tip-body{font-size:0.8rem;color:var(--g3);line-height:1.7;}

        /* ── EXERCISES TAB ── */
        .ex-grid{display:flex;flex-direction:column;gap:12px;}
        .ex-card{background:var(--g8);border:1px solid var(--g6);border-radius:14px;padding:20px 22px;display:flex;align-items:center;gap:20px;transition:all 0.22s;animation:slideIn 0.4s ease both;flex-wrap:wrap;}
        .ex-card:hover{border-color:rgba(233,30,140,0.3);transform:translateX(5px);}
        .ex-keys{background:var(--g7);border:1px solid var(--g6);border-radius:10px;padding:8px 14px;font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:2px;color:var(--fb);white-space:nowrap;flex-shrink:0;min-width:140px;text-align:center;}
        .ex-info{flex:1;min-width:180px;}
        .ex-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:1.5px;color:var(--w);margin-bottom:4px;}
        .ex-desc{font-size:0.78rem;color:var(--g3);line-height:1.6;margin-bottom:8px;}
        .ex-meta{display:flex;gap:10px;flex-wrap:wrap;}
        .ex-badge{border-radius:50px;padding:3px 10px;font-size:0.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
        .ex-cta{background:linear-gradient(135deg,var(--fb),var(--fd));color:#fff;border:none;border-radius:50px;padding:9px 20px;font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
        .ex-cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(233,30,140,0.4);}

        /* SSC target banner */
        .target-banner{background:rgba(233,30,140,0.06);border:1px solid rgba(233,30,140,0.2);border-radius:14px;padding:18px 20px;margin-bottom:28px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
        .tb-icon{font-size:2rem;flex-shrink:0;}
        .tb-title{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;color:var(--fb);margin-bottom:3px;}
        .tb-sub{font-size:0.78rem;color:var(--g4);line-height:1.5;}
        .tb-stats{display:flex;gap:16px;flex-wrap:wrap;margin-left:auto;}
        .tb-stat{text-align:center;}
        .tb-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:1.5px;color:var(--fb);}
        .tb-stat-lbl{font-size:0.58rem;font-weight:700;letter-spacing:"1px";text-transform:uppercase;color:var(--g4);}
      `}</style>

      <div className="page" data-pqtheme={theme}>

        {/* HEADER */}
        <div className="hdr">
          <button className="back-btn" onClick={ () => navigate("/englishhome")}>
            ← Back
          </button>
          <div className="hdr-badge">⌨ English Typing Guide</div>
          <h1 className="hdr-title">Finger Placement<br/><em>& Speed Tips</em></h1>
          <p className="hdr-sub">
            Master the <strong>correct finger for every key</strong>, learn pro techniques used by fast typists, and follow structured exercises to hit <strong>35+ WPM</strong> for SSC exams.
          </p>
        </div>

        {/* SSC TARGET BANNER */}
        <div style={{padding:"0 5%",marginBottom:0}}>
          <div className="target-banner">
            <span className="tb-icon">🎯</span>
            <div>
              <div className="tb-title">SSC Typing Target</div>
              <div className="tb-sub">SSC CHSL requires 35 WPM at 80%+ accuracy. SSC CPO requires 35 WPM. Reach 40+ WPM to stay safe.</div>
            </div>
            <div className="tb-stats">
              {[{v:"35",l:"Min WPM"},{v:"80%",l:"Min Accuracy"},{v:"15 Min",l:"Test Duration"}].map(s=>(
                <div className="tb-stat" key={s.l}>
                  <div className="tb-stat-val">{s.v}</div>
                  <div className="tb-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {tabs.map(t=>(
            <button key={t.id} className={`tab${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="content">

          {/* ── FINGER PLACEMENT TAB ── */}
          {activeTab === "placement" && (
            <div className="placement-layout">

              {/* Left — finger cards */}
              <div className="finger-cards">
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:2,color:"var(--w)",marginBottom:4}}>
                  8 Finger Zones
                </div>
                <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:16,lineHeight:1.6}}>
                  Click any finger to highlight its keys on the keyboard →
                </p>

                {fingerData.map(f=>(
                  <div
                    key={f.id}
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
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"3px 0 0 3px",background:f.color,opacity: selectedFinger===f.id||hoveredFinger===f.id?1:0.3,transition:"opacity 0.2s"}}/>

                    <div className="fc-header">
                      <div className="fc-name">{f.name}</div>
                      <span style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:f.color,background:f.color+"18",border:`1px solid ${f.color}33`,borderRadius:50,padding:"2px 9px"}}>
                        {f.hand}
                      </span>
                    </div>

                    <div className="fc-home" style={{color:f.color+"88"}}>
                      Home key: <strong style={{color:f.color}}>{f.homeKey}</strong>
                    </div>

                    <div className="fc-keys">
                      {f.keys.map(k=>(
                        <span key={k} style={{background:f.color+"22",border:`1px solid ${f.color}44`,borderRadius:6,padding:"3px 10px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.9rem",letterSpacing:"1px",color:f.color}}>
                          {k}
                        </span>
                      ))}
                    </div>

                    <div className="fc-tip">{f.tip}</div>

                    <div className="fc-strength">
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

                {/* Clear selection */}
                {selectedFinger !== null && (
                  <button onClick={()=>setSelectedFinger(null)} style={{background:"none",border:"1px solid var(--g6)",borderRadius:10,padding:"8px 16px",color:"var(--g4)",fontFamily:"'Outfit',sans-serif",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",marginTop:4,transition:"all 0.2s"}}
                    onMouseEnter={e=>e.target.style.borderColor="var(--f)"}
                    onMouseLeave={e=>e.target.style.borderColor="var(--g6)"}>
                    ✕ Clear Selection — Show All Keys
                  </button>
                )}
              </div>

              {/* Right — keyboard */}
              <div>
                <div className="keyboard-wrap">
                  <div className="kb-title">Interactive Keyboard</div>
                  <div className="kb-sub">Hover keys or click a finger card to highlight zones</div>
                  <InteractiveKeyboard
                    activeFingers={activeFingers}
                    hoveredFinger={hoveredFinger}
                    onKeyHover={setHoveredFinger}
                  />

                  {/* HAND DIAGRAMS */}
                  <div style={{ marginTop:20, borderTop:"1px solid var(--g7)", paddingTop:18 }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.85rem", letterSpacing:"2px", color:"var(--g4)", textTransform:"uppercase", textAlign:"center", marginBottom:14 }}>
                      Hand Position Guide
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-around", gap:8, flexWrap:"wrap" }}>
                      <HandDiagram
                        hand="left"
                        hoveredFinger={hoveredFinger}
                        selectedFinger={selectedFinger}
                        onFingerHover={setHoveredFinger}
                        onFingerClick={(id) => setSelectedFinger(selectedFinger===id?null:id)}
                      />
                      <HandDiagram
                        hand="right"
                        hoveredFinger={hoveredFinger}
                        selectedFinger={selectedFinger}
                        onFingerHover={setHoveredFinger}
                        onFingerClick={(id) => setSelectedFinger(selectedFinger===id?null:id)}
                      />
                    </div>
                    <div style={{ fontSize:"0.68rem", color:"var(--g4)", textAlign:"center", marginTop:10, lineHeight:1.5 }}>
                      Click any finger on the diagram to highlight its keys above
                    </div>
                  </div>

                  {/* legend */}
                  <div className="kb-legend">
                    {fingerData.map(f=>(
                      <div key={f.id} className="kb-leg-item">
                        <span className="kb-leg-dot" style={{background:f.color}}/>
                        {f.name.replace("Left ","L. ").replace("Right ","R. ")}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home row callout */}
                <div style={{background:"rgba(233,30,140,0.06)",border:"1px solid rgba(233,30,140,0.2)",borderRadius:14,padding:"16px 18px",marginTop:16}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"2px",color:"var(--fb)",marginBottom:8}}>🏠 Home Row — Your Anchor</div>
                  <div style={{display:"flex",gap:6,marginBottom:10,justifyContent:"center"}}>
                    {["A","S","D","F","·","J","K","L",";"].map((k,i)=>(
                      <div key={i} style={{
                        width:k==="·"?20:38, height:38, borderRadius:8,
                        background: k==="·"?"transparent": k==="F"||k==="J" ? "rgba(233,30,140,0.3)":"rgba(233,30,140,0.1)",
                        border: k==="·"?"none": k==="F"||k==="J"?"1.5px solid rgba(233,30,140,0.6)":"1px solid rgba(233,30,140,0.2)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:1,
                        color: k==="·"?"var(--g6)": k==="F"||k==="J"?"var(--fb)":"rgba(233,30,140,0.6)",
                      }}>{k}</div>
                    ))}
                  </div>
                  <div style={{fontSize:"0.72rem",color:"var(--g4)",textAlign:"center",lineHeight:1.5}}>
                    F and J have <strong style={{color:"var(--fb)"}}>raised bumps</strong> — feel them without looking. Always return here.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TIPS TAB ── */}
          {activeTab === "tips" && (
            <>
              {/* level legend */}
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
                {[
                  {label:"Essential", color:"#ef4444"},
                  {label:"Important", color:"var(--hinb)"},
                  {label:"Health",    color:"#22c55e"},
                  {label:"Routine",   color:"#4db6f7"},
                  {label:"Advanced",  color:"#ce93d8"},
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
              <div style={{background:"rgba(2,136,209,0.07)",border:"1px solid rgba(2,136,209,0.2)",borderRadius:14,padding:"14px 18px",marginBottom:24,fontSize:"0.8rem",color:"var(--g3)",lineHeight:1.6}}>
                💡 <strong style={{color:"#fff"}}>How to use these exercises:</strong> Start from Beginner and only move up when you can complete the drill at 95%+ accuracy. Do each exercise for its full duration without stopping.
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
                      <button className="ex-cta" onClick={goToExercises}>Start →</button>
                    </div>
                  );
                })}
              </div>

              {/* Big CTA to go to full exercises page */}
              <div style={{marginTop:28,textAlign:"center"}}>
                <button onClick={goToExercises}
                  style={{background:"linear-gradient(135deg,var(--fb),var(--fd))",color:"#fff",border:"none",borderRadius:50,padding:"14px 40px",fontFamily:"'Outfit',sans-serif",fontSize:"1rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(233,30,140,0.38)",transition:"all 0.22s",letterSpacing:"0.4px"}}
                  onMouseEnter={e=>{e.target.style.transform="translateY(-3px)";e.target.style.boxShadow="0 8px 32px rgba(233,30,140,0.54)";}}
                  onMouseLeave={e=>{e.target.style.transform="none";e.target.style.boxShadow="0 4px 24px rgba(233,30,140,0.38)";}}>
                  💪 Open Full Exercise Page →
                </button>
                <p style={{fontSize:"0.72rem",color:"var(--g4)",marginTop:10}}>Timer starts on your first keystroke — no countdown</p>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}