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
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#e91e8c"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.35"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="40" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">📊</text>
        <text x="200" y="176" font-size="28" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Smart Dashboard</text>
        <rect x="130" y="240" width="420" height="270" rx="24" fill="url(#g)" opacity="0.22"/>
        <rect x="160" y="270" width="190" height="16" rx="8" fill="rgba(255,255,255,0.42)"/>
        <rect x="160" y="304" width="320" height="14" rx="7" fill="rgba(255,255,255,0.18)"/>
        <rect x="160" y="334" width="260" height="14" rx="7" fill="rgba(255,255,255,0.12)"/>
        <text x="130" y="588" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Live progress</text>
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
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.35"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="40" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">📉</text>
        <text x="200" y="176" font-size="28" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Analytics</text>
        <rect x="130" y="240" width="420" height="270" rx="24" fill="url(#g)" opacity="0.22"/>
        <rect x="160" y="270" width="200" height="16" rx="8" fill="rgba(255,255,255,0.42)"/>
        <rect x="160" y="304" width="300" height="14" rx="7" fill="rgba(255,255,255,0.18)"/>
        <rect x="160" y="334" width="230" height="14" rx="7" fill="rgba(255,255,255,0.12)"/>
        <text x="130" y="588" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Sharp insights</text>
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
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.35"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="40" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">🎯</text>
        <text x="200" y="176" font-size="28" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Subject Breakdown</text>
        <rect x="130" y="240" width="420" height="270" rx="24" fill="url(#g)" opacity="0.22"/>
        <rect x="160" y="270" width="220" height="16" rx="8" fill="rgba(255,255,255,0.42)"/>
        <rect x="160" y="304" width="260" height="14" rx="7" fill="rgba(255,255,255,0.18)"/>
        <rect x="160" y="334" width="210" height="14" rx="7" fill="rgba(255,255,255,0.12)"/>
        <text x="130" y="588" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Target focus</text>
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
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#151a2d"/></linearGradient>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.35"/></linearGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#bg)"/>
        <rect x="90" y="90" width="1020" height="580" rx="36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)"/>
        <rect x="130" y="130" width="220" height="70" rx="18" fill="rgba(255,255,255,0.06)"/>
        <text x="160" y="176" font-size="40" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">📝</text>
        <text x="200" y="176" font-size="28" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Mock Test Series</text>
        <rect x="130" y="240" width="420" height="270" rx="24" fill="url(#g)" opacity="0.22"/>
        <rect x="160" y="270" width="200" height="16" rx="8" fill="rgba(255,255,255,0.42)"/>
        <rect x="160" y="304" width="300" height="14" rx="7" fill="rgba(255,255,255,0.18)"/>
        <rect x="160" y="334" width="220" height="14" rx="7" fill="rgba(255,255,255,0.12)"/>
        <text x="130" y="588" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">Exam-ready</text>
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
        {/* Prev */}
        <div className="fc-side" onClick={()=>{goTo(active-1);resetTimer();}} style={{ flexShrink:0, width:"20%", maxWidth:240, opacity:.4, filter:"blur(1.5px) brightness(.6)", transform:`translateX(${offset*0.12}px) scale(0.86)`, borderRadius:14, overflow:"hidden", border:pal.sideBorder, cursor:"pointer", boxShadow:pal.sideShadow }}>
          <img src={prev.img} alt={prev.label} style={{ width:"100%", display:"block", pointerEvents:"none" }}/>
        </div>

        {/* Main */}
        <div style={{ flexShrink:0, width:"56%", maxWidth:680 }}>
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
