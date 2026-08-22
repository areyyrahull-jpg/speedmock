import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 1. Import useNavigate hook

const examGroups = [
  {
    id: "ssc", label: "SSC", icon: "🏛️", color: "#e91e8c", glow: "rgba(233,30,140,0.35)",
    exams: [
      { id: "cgl",  title: "SSC CGL",  subtitle: "Combined Graduate Level",       icon: "🏛️", badge: "Most Attempted", badgeColor: "#e91e8c", difficulty: "Hard",   papers: "500+", questions: "40K+",      tag: "Group B & C Posts",      highlights: ["Tier I & II Full Mocks", "PYQ 2017–2024", "GK · Maths · English · Reasoning", "Chapter-wise Practice"] },
      { id: "cpo",  title: "SSC CPO",  subtitle: "Central Police Organisation",   icon: "🚓", badge: "High Demand",   badgeColor: "#c2185b", difficulty: "Hard",   papers: "400+", questions: "32K+",      tag: "Sub-Inspector Posts",    highlights: ["Paper I & II Mocks", "PYQ 2018–2024", "Physical Awareness Section", "Full Syllabus Coverage"] },
      { id: "chsl", title: "SSC CHSL", subtitle: "Combined Higher Secondary",     icon: "📋", badge: "Entry Level",   badgeColor: "#ad1457", difficulty: "Medium", papers: "350+", questions: "28K+",      tag: "LDC · DEO · PA/SA",      highlights: ["Tier I Full Tests", "PYQ 2016–2024", "Typing + Skill Test Prep", "Speed-focused Sets"] },
      { id: "gd",   title: "SSC GD",   subtitle: "General Duty Constable",        icon: "🪖", badge: "Lakhs Apply",  badgeColor: "#880e4f", difficulty: "Medium", papers: "300+", questions: "24K+",      tag: "BSF · CISF · CRPF · SSF", highlights: ["Full Mock Tests", "PYQ 2018–2024", "GK + Current Affairs Focus", "Physical Prep Tips"] },
      { id: "mts",  title: "SSC MTS",  subtitle: "Multi Tasking Staff",           icon: "📭", badge: "10th Pass",    badgeColor: "#6a0032", difficulty: "Easy",   papers: "250+", questions: "20K+",      tag: "MTS · Havaldar",         highlights: ["Paper I Mock Tests", "PYQ 2019–2024", "Havaldar + MTS Combined", "Beginner Friendly"] },
    ],
  },
  {
    id: "railway", label: "Railway", icon: "🚂", color: "#0288d1", glow: "rgba(2,136,209,0.35)",
    exams: [
      { id: "ntpc", title: "RRB NTPC",    subtitle: "Non-Technical Popular Categories", icon: "🚂", badge: "Trending",      badgeColor: "#0288d1", difficulty: "Hard",   papers: "450+", questions: "36K+",      tag: "Station Master · Clerk · Guard",  highlights: ["CBT 1 & CBT 2 Mocks", "PYQ 2016–2024", "Maths · GK · Reasoning", "Previous Cut-offs"] },
      { id: "grpd", title: "RRB Group D", subtitle: "Level 1 Posts",                   icon: "🔧", badge: "10th Pass",     badgeColor: "#01579b", difficulty: "Medium", papers: "300+", questions: "24K+",      tag: "Track Maintainer · Helper",       highlights: ["CBT Full Mocks", "PYQ 2018–2024", "Physics & Chemistry Boost", "Largest Railway Exam"] },
    ],
  },
];

const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)].join(",");
}

function ExamCard({ exam, selected, onSelect, gc }) {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate(); // ⚡ 1. Initialize navigate inside the card

  return (
    <div
      onClick={() => 
        onSelect(exam)}// Keeps the nice visual highlight effect
        
      
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"relative", borderRadius:16, overflow:"hidden",
        background: selected ? `rgba(${hexToRgb(gc)},0.12)` : hov ? `rgba(${hexToRgb(gc)},0.07)` : "#18181f",
        border: `1.5px solid ${selected || hov ? gc : "#32323f"}`,
        padding:"20px 18px 16px", cursor:"pointer",
        transform: selected || hov ? "translateY(-5px)" : "none",
        boxShadow: selected ? `0 0 0 2px rgba(${hexToRgb(gc)},0.3), 0 16px 40px rgba(${hexToRgb(gc)},0.25)` : hov ? `0 10px 30px rgba(${hexToRgb(gc)},0.2)` : "none",
        transition:"all 0.25s ease",
      }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${gc},transparent)`, opacity: selected||hov ? 1:0, transition:"opacity 0.25s" }} />

      {selected && (
        <div style={{ position:"absolute", inset:-2, borderRadius:18, border:`2px solid ${gc}`, animation:"ringPulse 2s ease-in-out infinite", pointerEvents:"none" }} />
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:"1.7rem", lineHeight:1 }}>{exam.icon}</span>
        <span style={{ background:exam.badgeColor+"22", color:exam.badgeColor, border:`1px solid ${exam.badgeColor}44`, borderRadius:50, padding:"2px 9px", fontSize:"0.6rem", fontWeight:800, letterSpacing:"1px", textTransform:"uppercase" }}>{exam.badge}</span>
      </div>

      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", letterSpacing:"1.5px", color:"#fff", lineHeight:1 }}>{exam.title}</div>
      <div style={{ fontSize:"0.72rem", color:"#7a7a90", marginTop:3, marginBottom:7 }}>{exam.subtitle}</div>
      <div style={{ fontSize:"0.7rem", color:"#9a9ab0", fontWeight:500, marginBottom:12 }}>📌 {exam.tag}</div>

      <div style={{ display:"flex", alignItems:"center", background:"#1e1e28", borderRadius:9, padding:"9px 12px", marginBottom:12 }}>
        {[{v:exam.papers,l:"Papers"},{v:exam.questions,l:"Questions"},{v:exam.difficulty,l:"Level",c:diffColor[exam.difficulty]}].map((s,i)=>(
          <div key={i} style={{ flex:1, textAlign:"center", ...(i>0?{borderLeft:"1px solid #32323f"}:{}) }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"1px", color:s.c||"#fff" }}>{s.v}</div>
            <div style={{ fontSize:"0.58rem", fontWeight:600, letterSpacing:"1px", textTransform:"uppercase", color:"#7a7a90", marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
        {exam.highlights.map(h=>(
          <li key={h} style={{ display:"flex", alignItems:"center", gap:7, fontSize:"0.75rem", color:"#c8c8d8" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", flexShrink:0, background:gc, boxShadow:`0 0 4px ${gc}` }} />
            {h}
          </li>
        ))}
      </ul>

      <div style={{ fontSize:"0.75rem", fontWeight:700, color:selected?"#22c55e":gc, paddingTop:10, borderTop:"1px solid #32323f", transition:"letter-spacing 0.2s", letterSpacing: hov?"1.5px":"0.5px" }}>
        {selected ? "✓ Selected — Click to Enter →" : "Select & Start →"}
      </div>
    </div>
  );
}

export default function ExamCategory({ onConfirm, onClose }) {
  const [activeGroup, setActiveGroup] = useState("ssc");
  const [selectedExam, setSelectedExam] = useState(null);
  
  // ✅ 4. Initialize the navigate function here
  const navigate = useNavigate(); 
  
  const cg = examGroups.find(g => g.id === activeGroup);

  // ✅ 5. Create a function to handle routing based on the selected exam
  const handleExamConfirmation = () => {
    if (onConfirm) onConfirm(selectedExam.id); // Keeps your existing prop logic working
    
    if (selectedExam.id === "typing-eng") {
      navigate("/englishhome");
    } else if (selectedExam.id === "typing-hin")  {
      navigate("/hindihome");} else {
      // You can add paths for other exams here later
      // navigate(`/${selectedExam.id}`);
    }
  };

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#0e0e12", minHeight:"100vh", position:"relative", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0e0e12; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#18181f; } ::-webkit-scrollbar-thumb { background:#e91e8c44; border-radius:3px; }
        @keyframes ringPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 4px #ff3aaa;transform:scale(1)} 50%{box-shadow:0 0 12px #ff3aaa;transform:scale(1.3)} }
        .exam-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap:16px; animation: fadeUp 0.45s ease both; }
        .tab-btn { display:flex; align-items:center; gap:7px; padding:12px 20px; cursor:pointer; font-size:0.86rem; font-weight:700; letter-spacing:0.4px; background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all 0.2s; font-family:'Outfit',sans-serif; color:#7a7a90; white-space:nowrap; }
        .tab-btn:hover { color:#c8c8d8; }
        .ab-pri { background:linear-gradient(135deg,#ff3aaa,#b5005f); color:#fff; border:none; border-radius:50px; padding:9px 24px; font-family:'Outfit',sans-serif; font-size:0.84rem; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px rgba(233,30,140,0.35); white-space:nowrap; }
        .ab-pri:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(233,30,140,0.5); }
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(233,30,140,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(233,30,140,0.025) 1px,transparent 1px)", backgroundSize:"52px 52px" }} />

      <div className="header-section" style={{ position:"relative", zIndex:1, padding:"52px 5% 0", background:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(233,30,140,0.1) 0%,transparent 65%)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.7rem", fontWeight:600, letterSpacing:"1px", color:"#7a7a90", textTransform:"uppercase", marginBottom:16 }}>
          Dashboard <span style={{color:"#ff3aaa"}}>›</span> Select Exam
        </div>

        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.2rem,5vw,3.8rem)", letterSpacing:3, color:"#fff", lineHeight:1 }}>
          Choose Your{" "}
          <span style={{ background:"linear-gradient(135deg,#ff3aaa,#b5005f)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Exam</span>
        </h1>

        <p style={{ fontSize:"0.87rem", color:"#7a7a90", marginTop:10, lineHeight:1.65, maxWidth:500 }}>
          Select an exam below to set it as your active preparation target. Switch anytime from the navbar.
        </p>

        <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginTop:18, marginBottom:32, background:"rgba(233,30,140,0.08)", border:"1px solid rgba(233,30,140,0.25)", borderRadius:50, padding:"8px 18px" }}>
          <span style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#7a7a90" }}>Current Exam</span>
          {selectedExam ? (
            <>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#ff3aaa", boxShadow:"0 0 6px #ff3aaa", animation:"pulse 1.6s ease-in-out infinite" }} />
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"1.5px", color:"#ff3aaa" }}>{selectedExam.title}</span>
            </>
          ) : (
            <span style={{ color:"#32323f", fontSize:"0.8rem", fontStyle:"italic" }}>None selected yet</span>
          )}
        </div>
      </div>

      <div className="tabs-section" style={{ position:"relative", zIndex:1, display:"flex", gap:0, padding:"0 5%", borderBottom:"1px solid #32323f", overflowX:"auto" }}>
        {examGroups.map(g => (
          <button key={g.id} className="tab-btn"
            style={{ color: activeGroup===g.id ? g.color : "#7a7a90", borderBottomColor: activeGroup===g.id ? g.color : "transparent" }}
            onClick={() => { setActiveGroup(g.id); setSelectedExam(null); }}
          >
            <span style={{fontSize:"1rem"}}>{g.icon}</span>
            {g.label}
            <span style={{ background: activeGroup===g.id ? g.color+"22":"#252532", color:activeGroup===g.id?g.color:"#7a7a90", borderRadius:50, padding:"2px 8px", fontSize:"0.63rem", fontWeight:700, letterSpacing:"0.5px" }}>
              {g.exams.length}
            </span>
          </button>
        ))}
      </div>

      <div className="body-section" style={{ position:"relative", zIndex:1, padding:"36px 5% 100px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
          <div style={{ width:50, height:50, borderRadius:13, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", background:cg.color+"18", border:`1px solid ${cg.color}33` }}>
            {cg.icon}
          </div>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.7rem", letterSpacing:2, color:cg.color }}>{cg.label} Exams</div>
            <div style={{ fontSize:"0.78rem", color:"#7a7a90", marginTop:2 }}>{cg.exams.length} exams available — tap any card to select</div>
          </div>
        </div>

        <div className="exam-grid" key={activeGroup}>
  {cg.exams.map(exam => (
    <ExamCard 
      key={exam.id} 
      exam={exam} 
      selected={selectedExam?.id === exam.id} 
      gc={cg.color}
      
      // Typing exams no longer appear in this picker — they live in the
      // navbar's sidebar now. Simple select; "Go to {exam}" button below
      // handles routing via handleExamConfirmation.
    onSelect={(clickedExam) => setSelectedExam(clickedExam)}
    />
  ))}
</div>
      </div>

      {selectedExam && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"rgba(14,14,18,0.96)", backdropFilter:"blur(16px)", borderTop:"1px solid rgba(233,30,140,0.2)", padding:"14px 5%", animation:"slideUp 0.4s ease both" }}>
          <div className="action-bar-inner" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:13 }}>
              <span style={{ fontSize:"1.7rem" }}>{selectedExam.icon}</span>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:"1.5px", color:"#fff" }}>{selectedExam.title}</div>
                <div style={{ fontSize:"0.72rem", color:"#7a7a90", marginTop:1 }}>{selectedExam.subtitle} · {selectedExam.tag}</div>
              </div>
            </div>
            <div className="action-bar-btns" style={{ display:"flex", gap:10 }}>
              
              {/* ✅ 6. Connected the Action Bar button to the router function */}
              <button className="ab-pri" onClick={handleExamConfirmation}>
                Go to {selectedExam.title} →
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


