import { useState, useEffect, useRef, useCallback } from "react";
import { usePublicTheme } from "./usePublicTheme";

const SLIDES = [
  {
    label: "Smart Dashboard",
    icon: "📊",
    desc: "Track daily goals, streak, test scores & accuracy",
    accent: "#e91e8c",
    img: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
        <defs>
          <linearGradient id="bg1" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg1)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="36" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">📊</text>
        <text x="200" y="176" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Smart Dashboard</text>

        <!-- Goal progress ring -->
        <circle cx="255" cy="360" r="90" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="16"/>
        <circle cx="255" cy="360" r="90" fill="none" stroke="#e91e8c" stroke-width="16" stroke-linecap="round"
          stroke-dasharray="565.5" stroke-dashoffset="141" transform="rotate(-90 255 360)"/>
        <text x="255" y="352" font-size="36" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff" text-anchor="middle">75%</text>
        <text x="255" y="380" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)" text-anchor="middle">DAILY GOAL</text>

        <!-- Stat cards -->
        <rect x="410" y="270" width="240" height="90" rx="14" fill="rgba(233,30,140,0.1)" stroke="rgba(233,30,140,0.25)"/>
        <text x="434" y="308" font-size="26" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">18</text>
        <text x="434" y="332" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.55)">DAY STREAK 🔥</text>

        <rect x="670" y="270" width="240" height="90" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
        <text x="694" y="308" font-size="26" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">87.2%</text>
        <text x="694" y="332" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.55)">AVG ACCURACY</text>

        <rect x="410" y="380" width="240" height="90" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
        <text x="434" y="418" font-size="26" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">24</text>
        <text x="434" y="442" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.55)">TESTS TAKEN</text>

        <rect x="670" y="380" width="240" height="90" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
        <text x="694" y="418" font-size="26" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Rank 7</text>
        <text x="694" y="442" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.55)">💜 PRO</text>

        <text x="130" y="588" font-size="24" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Live progress, every day</text>
      </svg>
    `)
  },
  {
    label: "Analytics",
    icon: "📉",
    desc: "Subject accuracy, weak topics, 31-day streak & typing trends",
    accent: "#0ea5e9",
    img: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
        <defs>
          <linearGradient id="bg2" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.35"/><stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg2)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="36" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">📉</text>
        <text x="200" y="176" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Analytics</text>

        <!-- 7-day line chart -->
        <rect x="130" y="240" width="940" height="200" rx="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <polyline points="160,400 280,360 400,380 520,300 640,330 760,260 880,280 1000,220"
          fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <polygon points="160,400 280,360 400,380 520,300 640,330 760,260 880,280 1000,220 1000,440 160,440"
          fill="url(#area)"/>
        <circle cx="1000" cy="220" r="7" fill="#0ea5e9"/>
        <circle cx="1000" cy="220" r="12" fill="none" stroke="#0ea5e9" stroke-width="2" opacity="0.5"/>

        <!-- Subject accuracy bars -->
        <text x="130" y="490" font-size="13" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">SUBJECT ACCURACY</text>
        <text x="130" y="522" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Quant</text>
        <rect x="220" y="510" width="700" height="12" rx="6" fill="rgba(255,255,255,0.08)"/>
        <rect x="220" y="510" width="588" height="12" rx="6" fill="#22c55e"/>
        <text x="940" y="521" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.6)">84%</text>

        <text x="130" y="552" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Reasoning</text>
        <rect x="220" y="540" width="700" height="12" rx="6" fill="rgba(255,255,255,0.08)"/>
        <rect x="220" y="540" width="469" height="12" rx="6" fill="#f59e0b"/>
        <text x="940" y="551" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.6)">67%</text>

        <text x="130" y="582" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">English</text>
        <rect x="220" y="570" width="700" height="12" rx="6" fill="rgba(255,255,255,0.08)"/>
        <rect x="220" y="570" width="322" height="12" rx="6" fill="#ef4444"/>
        <text x="940" y="581" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.6)">46%</text>
      </svg>
    `)
  },
  {
    label: "Subject Breakdown",
    icon: "🎯",
    desc: "Know exactly which subjects and topics need your focus",
    accent: "#f59e0b",
    img: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
        <defs>
          <linearGradient id="bg3" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg3)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="36" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">🎯</text>
        <text x="200" y="176" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Subject Breakdown</text>

        <!-- Topic cards with strength ratings -->
        <rect x="130" y="250" width="460" height="110" rx="16" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)"/>
        <text x="158" y="292" font-size="18" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Mensuration</text>
        <text x="158" y="316" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">Quantitative Aptitude</text>
        <rect x="158" y="330" width="404" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
        <rect x="158" y="330" width="121" height="8" rx="4" fill="#ef4444"/>
        <text x="512" y="285" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ef4444">WEAK</text>

        <rect x="610" y="250" width="460" height="110" rx="16" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.3)"/>
        <text x="638" y="292" font-size="18" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Syllogism</text>
        <text x="638" y="316" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">Reasoning</text>
        <rect x="638" y="330" width="404" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
        <rect x="638" y="330" width="242" height="8" rx="4" fill="#f59e0b"/>
        <text x="990" y="285" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#f59e0b">AVERAGE</text>

        <rect x="130" y="380" width="460" height="110" rx="16" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)"/>
        <text x="158" y="422" font-size="18" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Idioms &amp; Phrases</text>
        <text x="158" y="446" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">English</text>
        <rect x="158" y="460" width="404" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
        <rect x="158" y="460" width="364" height="8" rx="4" fill="#22c55e"/>
        <text x="512" y="415" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#22c55e">STRONG</text>

        <rect x="610" y="380" width="460" height="110" rx="16" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)"/>
        <text x="638" y="422" font-size="18" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Static GK</text>
        <text x="638" y="446" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">General Awareness</text>
        <rect x="638" y="460" width="404" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
        <rect x="638" y="460" width="384" height="8" rx="4" fill="#22c55e"/>
        <text x="990" y="415" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#22c55e">STRONG</text>

        <text x="130" y="560" font-size="24" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Target focus, not guesswork</text>
      </svg>
    `)
  },
  {
    label: "Mock Test Series",
    icon: "📝",
    desc: "Real SSC & Railway papers — timed, marked, exam-format",
    accent: "#22c55e",
    img: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
        <defs>
          <linearGradient id="bg4" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg4)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="36" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">📝</text>
        <text x="200" y="176" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Mock Test Series</text>

        <!-- Test paper cards -->
        <rect x="130" y="250" width="300" height="230" rx="18" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)"/>
        <text x="158" y="288" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#22c55e">SSC CGL TIER 1</text>
        <text x="158" y="322" font-size="20" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">2024 Paper</text>
        <text x="158" y="346" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">100 Qs · 60 min</text>
        <rect x="158" y="400" width="244" height="40" rx="10" fill="#22c55e"/>
        <text x="280" y="425" font-size="14" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#0b1020" text-anchor="middle">Start Test</text>

        <rect x="450" y="250" width="300" height="230" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)"/>
        <text x="478" y="288" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.6)">SSC CHSL TIER 1</text>
        <text x="478" y="322" font-size="20" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">2023 Paper</text>
        <text x="478" y="346" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">100 Qs · 60 min</text>
        <text x="478" y="380" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="#f59e0b">Score: 78/100</text>
        <rect x="478" y="400" width="244" height="40" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
        <text x="600" y="425" font-size="14" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff" text-anchor="middle">Review</text>

        <rect x="770" y="250" width="300" height="230" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)"/>
        <text x="798" y="288" font-size="12" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.6)">RRB NTPC CBT 1</text>
        <text x="798" y="322" font-size="20" font-weight="800" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">2024 Paper</text>
        <text x="798" y="346" font-size="13" font-family="Segoe UI, Arial, sans-serif" fill="rgba(255,255,255,0.5)">100 Qs · 90 min</text>
        <rect x="798" y="400" width="244" height="40" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
        <text x="920" y="425" font-size="14" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff" text-anchor="middle">Start Test</text>

        <text x="130" y="560" font-size="24" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Exam-ready, paper after paper</text>
      </svg>
    `)
  }
];
export default function FeatureCarousel() {
  const [theme] = usePublicTheme();
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [offset, setOffset] = useState(0);
  const timer = useRef(null);
  const n = SLIDES.length;

  const goTo = useCallback((idx) => {
    setActive(((idx % n) + n) % n);
  }, [n]);

  const resetTimer = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setActive(a => (a + 1) % n), 4500);
  }, [n]);

  useEffect(() => { resetTimer(); return () => clearInterval(timer.current); }, [resetTimer]);

  const onDragStart = (x) => { setDragging(true); setDragStart(x); setOffset(0); clearInterval(timer.current); };
  const onDragMove  = (x) => { if (!dragging) return; setOffset(x - dragStart); };
  const onDragEnd   = () => {
    if (!dragging) return;
    setDragging(false);
    if (offset < -60) goTo(active + 1);
    else if (offset > 60) goTo(active - 1);
    setOffset(0);
    resetTimer();
  };

  const slide = SLIDES[active];
  const prev  = SLIDES[(active - 1 + n) % n];
  const next  = SLIDES[(active + 1) % n];

  const light = theme === "light";
  const pal = {
    bg:        light ? "linear-gradient(180deg, #eef4ff 0%, #ffffff 100%)" : "#0a0a0f",
    heading:   light ? "#0f172a" : "#f0f0f0",
    body:      light ? "#475569" : "#9ca3af",
    counter:   light ? "#94a3b8" : "#6b7280",
    sideBorder: light ? "1px solid rgba(15,23,42,.08)" : "1px solid rgba(255,255,255,.05)",
    sideShadow: light ? "0 8px 32px rgba(15,23,42,.12)" : "0 8px 32px rgba(0,0,0,.5)",
    dotInactive: light ? "rgba(15,23,42,.12)" : "rgba(255,255,255,.15)",
    arrBg:     light ? "rgba(15,23,42,.05)" : "rgba(255,255,255,.05)",
    arrBorder: light ? "1px solid rgba(15,23,42,.12)" : "1px solid rgba(255,255,255,.1)",
    arrColor:  light ? "#475569" : "#9ca3af",
  };

  return (
    <div style={{ width:"100%", padding:"64px 0 48px", background:pal.bg, userSelect:"none" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .fc-tag{animation:fadeUp .3s ease both}
        .fc-desc{animation:fadeUp .35s .05s ease both}
        .fc-side{transition:all .4s cubic-bezier(.2,.8,.2,1)}
        .fc-main{transition:box-shadow .3s ease}
        .fc-dot{transition:all .28s ease;cursor:pointer}
        .fc-arr{transition:all .15s ease}
       .fc-arr:hover{background:${light ? "rgba(15,23,42,.1)" : "rgba(255,255,255,.12)"}!important;color:${light ? "#0f172a" : "#fff"}!important}
        @media (max-width: 640px) {
          .fc-track { gap: 0px !important; padding: 0 14px !important; }
          .fc-side { display: none !important; }
          .fc-main-card { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* ── Heading ── */}
      <div style={{ textAlign:"center", marginBottom:44 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#e91e8c", marginBottom:10 }}>
          Inside SpeedMock
        </div>
        <h2 style={{ fontSize:"clamp(1.7rem,4vw,2.6rem)", fontWeight:800, color:pal.heading, margin:"0 0 10px", letterSpacing:-0.5, fontFamily:"system-ui,sans-serif" }}>
          Everything an aspirant needs
        </h2>
        <p style={{ fontSize:14, color:pal.body, maxWidth:460, margin:"0 auto", lineHeight:1.65 }}>
          Real screenshots from your account. Drag or swipe to explore.
        </p>
        <div style={{ width:56, height:3, background:"linear-gradient(90deg,#e91e8c,#9c27b0)", borderRadius:2, margin:"16px auto 0" }}/>
      </div>

      {/* ── Three-card track ── */}
       <div
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, padding:"0 20px", cursor:dragging?"grabbing":"grab" }}
        onMouseDown={e=>onDragStart(e.clientX)}
        onMouseMove={e=>onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={e=>onDragStart(e.touches[0].clientX)}
        onTouchMove={e=>onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
      >
        onMouseDown={e=>onDragStart(e.clientX)}
        onMouseMove={e=>onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={e=>onDragStart(e.touches[0].clientX)}
        onTouchMove={e=>onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
      >
        {/* Prev */}
        <div className="fc-side" onClick={()=>{goTo(active-1);resetTimer();}} style={{ flexShrink:0, width:"20%", maxWidth:240, opacity:.4, filter:"blur(1.5px) brightness(.6)", transform:`translateX(${offset*0.12}px) scale(0.86)`, borderRadius:14, overflow:"hidden", border:pal.sideBorder, cursor:"pointer", boxShadow:pal.sideShadow }}>
          <img src={prev.img} alt={prev.label} style={{ width:"100%", display:"block", pointerEvents:"none" }}/>
        </div>

        {/* Main */}
        <div className="fc-main-card" style={{ flexShrink:0, width:"56%", maxWidth:680 }}>
          {/* Tag + counter row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span className="fc-tag" key={slide.label} style={{ fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:999, color:slide.accent, background:slide.accent+"1a", border:`1px solid ${slide.accent}44` }}>
              {slide.icon} {slide.label}
            </span>
            <span style={{ fontSize:12, color:pal.counter }}>{active+1} / {n}</span>
          </div>

          {/* Screenshot */}
          <div className="fc-main" style={{ borderRadius:18, overflow:"hidden", border:`2px solid ${slide.accent}55`, boxShadow:`0 0 0 1px ${slide.accent}18, 0 28px 72px rgba(0,0,0,.6), 0 0 90px ${slide.accent}14`, transform:`translateX(${offset*0.35}px)` }}>
            <img src={slide.img} alt={slide.label} style={{ width:"100%", display:"block", pointerEvents:"none" }}/>
          </div>

          {/* Description */}
          <p className="fc-desc" key={slide.label+"d"} style={{ fontSize:14, color:pal.body, lineHeight:1.65, margin:"14px 0 0", textAlign:"center", maxWidth:500, marginInline:"auto" }}>
            {slide.desc}
          </p>
        </div>

        {/* Next */}
        <div className="fc-side" onClick={()=>{goTo(active+1);resetTimer();}} style={{ flexShrink:0, width:"20%", maxWidth:240, opacity:.4, filter:"blur(1.5px) brightness(.6)", transform:`translateX(${offset*0.12}px) scale(0.86)`, borderRadius:14, overflow:"hidden", border:pal.sideBorder, cursor:"pointer", boxShadow:pal.sideShadow }}>
          <img src={next.img} alt={next.label} style={{ width:"100%", display:"block", pointerEvents:"none" }}/>
        </div>
      </div>

      {/* ── Dots ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:24 }}>
        {SLIDES.map((s,i)=>(
          <div key={i} className="fc-dot" onClick={()=>{goTo(i);resetTimer();}} style={{ height:7, borderRadius:4, width:active===i?28:7, background:active===i?slide.accent:pal.dotInactive }}/>
        ))}
      </div>

      {/* ── Arrows ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:16 }}>
        {[["←", active-1],["→", active+1]].map(([label,idx])=>(
          <button key={label} className="fc-arr" onClick={()=>{goTo(idx);resetTimer();}} style={{ background:pal.arrBg, border:pal.arrBorder, color:pal.arrColor, width:38, height:38, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
