import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoComponent from "../components/common/logo";

function GoBackButton() {
  const navigate = useNavigate();


  return (
    <button onClick={() => navigate(-1)} // ⚡ 3. Update state when the mouse enters or leaves

      >
      ← Go Back
    </button>
  );
}



export default function AboutUs() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
  const stats = [
    { val:"50K+",  lbl:"Students",       icon:"👨‍🎓" },
    { val:"2M+",   lbl:"Questions",       icon:"📝" },
    { val:"10+",   lbl:"Exams Covered",   icon:"🏛️" },
    { val:"98%",   lbl:"Satisfaction",    icon:"⭐" },
  ];

  const exams = [
    { group:"SSC",     color:"#e91e8c", items:["CGL","CPO","CHSL","GD","MTS"] },
    { group:"Railway", color:"#0288d1", items:["NTPC","Group D"] },
    { group:"Typing",  color:"#7b1fa2", items:["English Typing","Hindi Typing"] },
  ];

  const values = [
    { icon:"💸", title:"Affordable for Every Aspirant",
      body:"We priced SpeedMock starting at just ₹30 — less than a cup of chai. No aspirant should be stopped from quality preparation because of money." },
    { icon:"🎯", title:"Built for Real Exams",
      body:"Every question, passage, and mock test on SpeedMock is built around actual SSC and Railway exam patterns. We don't guess — we study the exams so you can ace them." },
    { icon:"📱", title:"Practice Anywhere",
      body:"Whether you're on a phone during your commute or on a laptop at home, SpeedMock works everywhere. Your progress is saved across all your sessions." },
    { icon:"📊", title:"Data-Driven Improvement",
      body:"We track every session — your WPM, accuracy, weak areas, and improvement trend — so you can see exactly how far you've come and what to work on next." },
    { icon:"🤝", title:"Student First",
      body:"Every decision at SpeedMock starts with one question: does this help students? If the answer isn't yes, we don't build it." },
    { icon:"🔒", title:"Your Privacy Matters",
      body:"We collect only what we need to run the platform. We never sell your data. Your progress is yours alone." },
  ];

  const plans = [
    { name:"Sprint", price:"₹30", duration:"30 Days", devices:"1 Device", badge:"Try It Out", badgeColor:"#7a7a90" },
    { name:"Surge",  price:"₹70", duration:"90 Days", devices:"2 Devices", badge:"🔥 Popular", badgeColor:"#e91e8c" },
    { name:"Storm",  price:"₹130",duration:"180 Days",devices:"3 Devices", badge:"⭐ Best Value",badgeColor:"#ffaa00" },
  ];

  const features = [
    { icon:"📄", title:"PYQ Mock Tests",         desc:"Full previous year question papers in real exam format with timer." },
    { icon:"📚", title:"Chapter-wise Practice",  desc:"Practice individual topics and chapters from the complete SSC and Railway syllabus." },
    { icon:"⌨️", title:"Typing Tests",           desc:"English and Hindi typing practice and tests in SSC CHSL and CPO format." },
    { icon:"📊", title:"Performance Analytics",  desc:"Track WPM, accuracy, session history, streaks, and improvement graphs." },
    { icon:"📱", title:"Multi-device Access",    desc:"Use SpeedMock on your phone and laptop simultaneously based on your plan." },
    { icon:"🆓", title:"Free Trial",             desc:"Every new student gets 2 free PYQ mock tests and 3 days of practice — no card needed." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --f:#e91e8c; --fb:#ff3aaa; --fd:#b5005f;
          --g9:#0e0e12; --g8:#18181f; --g75:#1e1e28;
          --g6:#32323f; --g4:#7a7a90; --g3:#9a9ab0; --g2:#c8c8d8; --w:#ffffff;
        }
        body { background:var(--g9); font-family:'Outfit',sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 5px var(--fb)} 50%{box-shadow:0 0 16px var(--fb)} }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#18181f}::-webkit-scrollbar-thumb{background:#e91e8c44;border-radius:3px}

        .page {
          min-height:100vh; background:var(--g9);
          background-image:linear-gradient(rgba(233,30,140,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(233,30,140,0.018) 1px,transparent 1px);
          background-size:52px 52px;
        }

        /* ── HERO ── */
        .hero {
          position:relative; overflow:hidden; text-align:center;
          padding:80px 5% 72px;
          background:radial-gradient(ellipse 80% 55% at 50% 0%,rgba(233,30,140,0.12) 0%,transparent 65%);
          border-bottom:1px solid rgba(233,30,140,0.12);
        }
        .hero::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image:linear-gradient(rgba(233,30,140,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(233,30,140,0.035) 1px,transparent 1px);
          background-size:52px 52px;
        }
          .container {
  display: flex;
  justify-content: flex-start; /* Aligns the button to the left side */
}
        .hero-logo {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(4rem,12vw,9rem);
          letter-spacing:6px; line-height:1; margin-bottom:16px;
          background:linear-gradient(270deg,var(--fb),#ff99dd,var(--fd),var(--fb));
          background-size:400%; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:shimmer 6s linear infinite;
          filter:drop-shadow(0 0 28px rgba(233,30,140,0.4));
          position:relative; z-index:1;
        }
        .hero-tagline {
          font-size:0.8rem; font-weight:700; letter-spacing:4px; text-transform:uppercase;
          color:var(--g4); margin-bottom:24px; position:relative; z-index:1;
        }
        .hero-desc {
          font-size:1.05rem; color:var(--g4); line-height:1.8; max-width:580px;
          margin:0 auto 36px; position:relative; z-index:1;
        }
        .hero-desc strong { color:var(--g2); font-weight:600; }

        /* pulse badge */
        .live-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(233,30,140,0.08); border:1px solid rgba(233,30,140,0.25);
          border-radius:50px; padding:7px 20px; position:relative; z-index:1;
          font-size:0.8rem; font-weight:600; color:var(--g2);
        }
        .live-dot {
          width:7px; height:7px; border-radius:50%; background:var(--fb);
          box-shadow:0 0 7px var(--fb); animation:pulse 1.6s ease-in-out infinite;
        }

        /* ── STATS BAND ── */
        .stats-band {
          display:grid; grid-template-columns:repeat(4,1fr); gap:0;
          border-bottom:1px solid var(--g6);
        }
        @media(max-width:600px){ .stats-band{grid-template-columns:1fr 1fr;} }
        .stat-cell {
          padding:28px 20px; text-align:center; border-right:1px solid var(--g6);
          transition:background 0.2s;
        }
        .stat-cell:last-child { border-right:none; }
        .stat-cell:hover { background:rgba(233,30,140,0.04); }
        .stat-icon { font-size:1.6rem; margin-bottom:8px; }
        .stat-val {
          font-family:'Bebas Neue',sans-serif; font-size:2.4rem; letter-spacing:2px; line-height:1;
          background:linear-gradient(135deg,var(--fb),#ffaadd);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .stat-lbl { font-size:0.68rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--g4); margin-top:5px; }

        /* ── WRAP ── */
        .wrap { max-width:960px; margin:0 auto; padding:56px 5% 60px; }

        /* section header */
        .sh { margin-bottom:6px; }
        .sh-label { font-size:0.65rem; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:var(--f); margin-bottom:6px; }
        .sh-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(1.8rem,3.5vw,2.8rem); letter-spacing:2.5px; color:var(--w); margin-bottom:8px; }
        .sh-body { font-size:0.88rem; color:var(--g4); line-height:1.7; max-width:560px; margin-bottom:32px; }
        .sh-divider { width:60px; height:3px; border-radius:2px; background:linear-gradient(90deg,var(--fb),var(--fd)); margin-bottom:32px; }

        /* ── MISSION SECTION ── */
        .mission {
          background:var(--g8); border:1px solid rgba(233,30,140,0.18);
          border-radius:22px; padding:36px 32px; margin-bottom:48px;
          position:relative; overflow:hidden;
          animation:fadeUp 0.5s ease both;
        }
        .mission::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,var(--fd),var(--fb));
        }
        .mission::after {
          content:''; position:absolute; pointer-events:none;
          width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle,rgba(233,30,140,0.1) 0%,transparent 68%);
          right:-100px; top:-100px;
        }
        .mission-quote {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(1.6rem,3vw,2.4rem); letter-spacing:2px;
          color:var(--w); line-height:1.2; margin-bottom:16px; position:relative; z-index:1;
        }
        .mission-quote em {
          font-style:normal;
          background:linear-gradient(135deg,var(--fb),#ff88cc,var(--fd));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .mission-body { font-size:0.9rem; color:var(--g3); line-height:1.85; position:relative; z-index:1; max-width:680px; }
        .mission-body strong { color:var(--g2); font-weight:600; }

        /* ── STORY SECTION ── */
        .story { margin-bottom:56px; animation:fadeUp 0.5s 0.1s ease both; }
        .story-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media(max-width:640px){ .story-grid{grid-template-columns:1fr;} }
        .story-card {
          background:var(--g8); border:1px solid var(--g6); border-radius:16px;
          padding:22px 22px; transition:all 0.22s;
        }
        .story-card:hover { border-color:rgba(233,30,140,0.28); transform:translateY(-3px); }
        .story-card-icon { font-size:1.8rem; margin-bottom:12px; }
        .story-card-title { font-family:'Bebas Neue',sans-serif; font-size:1.2rem; letter-spacing:1.5px; color:var(--fb); margin-bottom:8px; }
        .story-card-body { font-size:0.82rem; color:var(--g3); line-height:1.75; }
        .story-card-body strong { color:var(--g2); font-weight:600; }

        /* ── VALUES ── */
        .values-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px;
          margin-bottom:56px; animation:fadeUp 0.5s 0.15s ease both;
        }
        .value-card {
          background:var(--g8); border:1px solid var(--g6); border-radius:16px; padding:20px 20px;
          transition:all 0.22s;
        }
        .value-card:hover { border-color:rgba(233,30,140,0.28); transform:translateY(-3px); box-shadow:0 8px 24px rgba(233,30,140,0.1); }
        .value-icon { font-size:1.8rem; margin-bottom:12px; }
        .value-title { font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:1.5px; color:var(--w); margin-bottom:8px; }
        .value-body { font-size:0.8rem; color:var(--g3); line-height:1.7; }

        /* ── EXAMS ── */
        .exams-section { margin-bottom:56px; animation:fadeUp 0.5s 0.2s ease both; }
        .exam-groups { display:flex; gap:14px; flex-wrap:wrap; }
        .exam-group {
          background:var(--g8); border:1px solid var(--g6); border-radius:14px;
          padding:18px 20px; flex:1; min-width:200px; transition:all 0.22s;
        }
        .exam-group:hover { transform:translateY(-3px); }
        .eg-label { font-size:0.62rem; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px; }
        .eg-chips { display:flex; gap:6px; flex-wrap:wrap; }
        .eg-chip { border-radius:6px; padding:4px 10px; font-size:0.74rem; font-weight:600; }

        /* ── FEATURES ── */
        .features-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px;
          margin-bottom:56px; animation:fadeUp 0.5s 0.25s ease both;
        }
        .feature-card {
          background:var(--g8); border:1px solid var(--g6); border-radius:14px;
          padding:18px 18px; display:flex; align-items:flex-start; gap:14px; transition:all 0.2s;
        }
        .feature-card:hover { border-color:rgba(233,30,140,0.25); }
        .feat-icon { width:38px; height:38px; border-radius:10px; flex-shrink:0;
          background:rgba(233,30,140,0.1); border:1px solid rgba(233,30,140,0.22);
          display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
        .feat-title { font-size:0.86rem; font-weight:700; color:var(--w); margin-bottom:4px; }
        .feat-desc { font-size:0.76rem; color:var(--g4); line-height:1.55; }

        /* ── PLANS ── */
        .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:56px; animation:fadeUp 0.5s 0.3s ease both; }
        @media(max-width:600px){ .plans-grid{grid-template-columns:1fr;} }
        .plan-card {
          background:var(--g8); border:1.5px solid var(--g6); border-radius:18px;
          padding:24px 20px; text-align:center; transition:all 0.25s; position:relative; overflow:hidden;
        }
        .plan-card:hover { border-color:var(--f); transform:translateY(-5px); box-shadow:0 10px 30px rgba(233,30,140,0.18); }
        .plan-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,var(--fd),var(--fb)); opacity:0; transition:opacity 0.25s; }
        .plan-card:hover::before { opacity:1; }
        .plan-badge { display:inline-block; border-radius:50px; padding:3px 12px; font-size:0.6rem; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; }
        .plan-name { font-family:'Bebas Neue',sans-serif; font-size:1.8rem; letter-spacing:2px; color:var(--w); margin-bottom:4px; }
        .plan-price { font-family:'Bebas Neue',sans-serif; font-size:3rem; letter-spacing:1px; color:var(--fb); line-height:1; margin-bottom:6px; }
        .plan-detail { font-size:0.76rem; color:var(--g4); }

        /* ── CTA SECTION ── */
        .cta-section {
          background:rgba(233,30,140,0.06); border:1px solid rgba(233,30,140,0.2);
          border-radius:22px; padding:40px 32px; text-align:center;
          animation:fadeUp 0.5s 0.35s ease both; position:relative; overflow:hidden;
        }
        .cta-section::before { content:''; position:absolute; top:0; left:10%; right:10%; height:2px;
          background:linear-gradient(90deg,transparent,var(--fb),var(--fd),transparent); }
        .cta-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(2rem,4vw,3rem); letter-spacing:3px; color:var(--w); margin-bottom:10px; }
        .cta-sub { font-size:0.88rem; color:var(--g4); line-height:1.7; max-width:480px; margin:0 auto 24px; }
        .cta-buttons { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .btn-primary { background:linear-gradient(135deg,var(--fb),var(--fd)); color:#fff; border:none; border-radius:50px; padding:13px 36px; font-family:'Outfit',sans-serif; font-size:0.95rem; font-weight:700; cursor:pointer; transition:all 0.22s; box-shadow:0 4px 22px rgba(233,30,140,0.38); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(233,30,140,0.52); }
        .btn-outline { background:transparent; color:var(--g2); border:1.5px solid rgba(200,200,216,0.22); border-radius:50px; padding:13px 36px; font-family:'Outfit',sans-serif; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.22s; }
        .btn-outline:hover { border-color:var(--f); color:var(--fb); }

        /* FOOTER */
        .page-footer { text-align:center; padding:24px 5%; border-top:1px solid var(--g6); font-size:0.78rem; color:var(--g4); line-height:1.7; }
        .page-footer strong { color:var(--fb); }
      `}</style>

      <div className="page">

        {/* ── HERO ── */}
        <div className="hero">
            <div className="pnb-logo" onClick={() => go("home")} role="button">
                                  <LogoComponent size={150} glow animate />
                                
                                </div>
             <div class="container">
            
          <button 
        onClick={() => navigate(-1)} 
  // ⚡ 3. Update state when the mouse enters or leaves
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        
        style={{
          padding: "10px 20px",
          color: "#ff3aaa",
          border: "1px solid rgba(233,30,140,0.3)",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "30px",
          
          // ⚡ 4. Change styles dynamically based on the state!
          background: isHovered ? "rgba(233,30,140,0.2)" : "rgba(233,30,140,0.1)",
          transform: isHovered ? "translateY(-2px)" : "none",
          boxShadow: isHovered ? "0 4px 12px rgba(233,30,140,0.2)" : "none",
          
          // Add a smooth transition so it doesn't snap instantly
          transition: "all 0.2s ease" 
        }}
    
      >
        ← Go Back
      </button>
      </div>
          <div className="hero-logo">SpeedMock</div>
          <div className="hero-tagline">Your Sarkari Exam Partner</div>
          <p className="hero-desc">
            SpeedMock is India's most affordable exam preparation platform for <strong>SSC</strong> and <strong>Railway</strong> aspirants — built by people who understand the grind.
          </p>
          <div className="live-badge">
            <span className="live-dot" />
            50,000+ students are preparing on SpeedMock right now
          </div>
        </div>

        {/* ── STATS BAND ── */}
        <div className="stats-band">
          {stats.map(s => (
            <div key={s.lbl} className="stat-cell">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="wrap">

          {/* ── MISSION ── */}
          <div className="mission">
            <div className="mission-quote">
              Every aspirant deserves a<br /><em>fair shot at a government job.</em>
            </div>
            <p className="mission-body">
              Cracking SSC CGL, Railway NTPC, or any government exam is hard — but it should not be made harder by <strong>expensive coaching</strong> or <strong>inaccessible study material</strong>. SpeedMock was built with a simple belief: if you're willing to put in the work, we'll give you the tools to do it — at a price that never gets in the way.
              <br /><br />
              We started SpeedMock to solve one problem: <strong>there was no affordable, focused, digital platform</strong> that gave SSC and Railway students the right practice environment without unnecessary extras. No live classes. No videos. Just what actually matters — practice, tests, and performance tracking.
            </p>
          </div>

          {/* ── STORY ── */}
          <div className="story">
            <div className="sh">
              <div className="sh-label">Our Story</div>
              <h2 className="sh-title">Why SpeedMock Exists</h2>
            </div>
            <div className="sh-divider" />
            <div className="story-grid">
              {[
                { icon:"😤", title:"The Problem We Saw",
                  body:"Lakhs of students were spending thousands on coaching institutes that recycled the same material year after year. The ones who couldn't afford coaching had almost no good digital alternative — just scattered YouTube videos and expensive app subscriptions." },
                { icon:"💡", title:"The Solution We Built",
                  body:"SpeedMock gives every student access to <strong>PYQ-based mock tests</strong>, chapter-wise practice, and real-exam-format typing tests — all in one place, at prices starting from <strong>₹30 for a full month</strong>." },
                { icon:"🎯", title:"Our Focus",
                  body:"We don't try to do everything. We focus entirely on <strong>SSC and Railway exams</strong> — the two largest government exam categories in India. This focus means better quality, more relevant content, and a sharper preparation experience." },
                { icon:"📈", title:"Where We're Going",
                  body:"We're continuously expanding our question bank, adding new exam categories, improving our analytics, and building tools that help students understand <strong>exactly where they stand</strong> and what to fix." },
              ].map((c,i)=>(
                <div key={i} className="story-card">
                  <div className="story-card-icon">{c.icon}</div>
                  <div className="story-card-title">{c.title}</div>
                  <div className="story-card-body" dangerouslySetInnerHTML={{__html:c.body}} />
                </div>
              ))}
            </div>
          </div>

          {/* ── EXAMS COVERED ── */}
          <div className="exams-section">
            <div className="sh">
              <div className="sh-label">Coverage</div>
              <h2 className="sh-title">Exams We Cover</h2>
              <p className="sh-body">We cover the most attempted government exams in India across SSC, Railway, and Typing categories.</p>
            </div>
            <div className="sh-divider" />
            <div className="exam-groups">
              {exams.map(g=>(
                <div key={g.group} className="exam-group" style={{borderColor:g.color+"33"}}>
                  <div className="eg-label" style={{color:g.color}}>{g.group}</div>
                  <div className="eg-chips">
                    {g.items.map(item=>(
                      <span key={item} className="eg-chip" style={{background:g.color+"18",color:g.color,border:`1px solid ${g.color}33`}}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── VALUES ── */}
          <div>
            <div className="sh">
              <div className="sh-label">Our Values</div>
              <h2 className="sh-title">What We Stand For</h2>
            </div>
            <div className="sh-divider" />
            <div className="values-grid">
              {values.map((v,i)=>(
                <div key={i} className="value-card" style={{animationDelay:`${i*0.06}s`,animation:"fadeUp 0.4s ease both"}}>
                  <div className="value-icon">{v.icon}</div>
                  <div className="value-title">{v.title}</div>
                  <div className="value-body">{v.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FEATURES ── */}
          <div>
            <div className="sh">
              <div className="sh-label">Platform</div>
              <h2 className="sh-title">What You Get</h2>
            </div>
            <div className="sh-divider" />
            <div className="features-grid">
              {features.map((f,i)=>(
                <div key={i} className="feature-card" style={{animationDelay:`${i*0.06}s`,animation:"fadeUp 0.4s ease both"}}>
                  <div className="feat-icon">{f.icon}</div>
                  <div>
                    <div className="feat-title">{f.title}</div>
                    <div className="feat-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PLANS ── */}
          <div>
            <div className="sh">
              <div className="sh-label">Pricing</div>
              <h2 className="sh-title">Plans That Won't Break the Bank</h2>
              <p className="sh-body">Every plan includes all features. Only the duration and number of devices differ.</p>
            </div>
            <div className="sh-divider" />
            <div className="plans-grid">
              {plans.map(p=>(
                <div key={p.name} className="plan-card">
                  <div className="plan-badge" style={{background:p.badgeColor+"22",color:p.badgeColor,border:`1px solid ${p.badgeColor}44`}}>{p.badge}</div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-price">{p.price}</div>
                  <div className="plan-detail">{p.duration} · {p.devices}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
         
        

        </div>

        <div className="page-footer">
          <strong>SpeedMock</strong> — Your Sarkari Exam Partner<br />
          Questions? Contact us at <strong>support@speedmock.in</strong>
        </div>
      </div>
    </>
  );
}