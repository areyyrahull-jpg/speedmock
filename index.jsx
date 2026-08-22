import { useState } from "react";

const GoogleFonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #0b1527;
      --navy-2: #112040;
      --navy-3: #1a2f55;
      --gold: #d4a843;
      --gold-light: #f0cc72;
      --cream: #fdf8ef;
      --text: #e8e4dc;
      --muted: #8a96a8;
      --border: rgba(212,168,67,0.2);
      --card: rgba(255,255,255,0.04);
      --card-hover: rgba(255,255,255,0.07);
    }

    body { font-family: 'DM Sans', sans-serif; background: var(--navy); color: var(--text); }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--navy-2); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }


/* Push all page content below the fixed navbar */
.page-content,
.dashboard-content,
main {
  padding-top: var(--nb-h, 62px);
}


    /* NAVBAR */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 60px;
      background: rgba(11,21,39,0.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 24px; font-weight: 700;
      color: var(--gold);
      letter-spacing: 0.5px;
      cursor: pointer;
    }
    .logo span { color: var(--text); }
    .nav-links { display: flex; gap: 36px; align-items: center; }
    .nav-links a {
      color: var(--muted); font-size: 14px; font-weight: 500;
      text-decoration: none; letter-spacing: 0.3px;
      transition: color 0.2s;
      cursor: pointer;
    }
    .nav-links a:hover { color: var(--text); }
    .btn-nav {
      background: var(--gold); color: var(--navy);
      padding: 9px 22px; border-radius: 6px;
      font-weight: 600; font-size: 14px; cursor: pointer;
      border: none; transition: background 0.2s, transform 0.15s;
      font-family: 'DM Sans', sans-serif;
    }
    .btn-nav:hover { background: var(--gold-light); transform: translateY(-1px); }

    /* HERO */
    .hero {
      min-height: 100vh;
      display: flex; align-items: center;
      padding: 120px 60px 80px;
      position: relative; overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse 80% 60% at 70% 40%, rgba(212,168,67,0.08) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 80% at 10% 80%, rgba(26,47,85,0.6) 0%, transparent 60%);
    }
    .hero-grid {
      position: absolute; inset: 0; z-index: 0;
      background-image:
        linear-gradient(rgba(212,168,67,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(212,168,67,0.05) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-content { position: relative; z-index: 1; max-width: 680px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid var(--border); border-radius: 100px;
      padding: 6px 16px; font-size: 12px; font-weight: 600;
      color: var(--gold); letter-spacing: 1px; text-transform: uppercase;
      margin-bottom: 28px;
    }
    .hero-badge span { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; }
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: 66px; line-height: 1.08; font-weight: 900;
      color: var(--cream);
      margin-bottom: 24px;
    }
    .hero h1 em { color: var(--gold); font-style: italic; }
    .hero p {
      font-size: 17px; line-height: 1.7; color: var(--muted);
      max-width: 520px; margin-bottom: 40px; font-weight: 400;
    }
    .hero-cta { display: flex; gap: 16px; align-items: center; }
    .btn-primary {
      background: var(--gold); color: var(--navy);
      padding: 14px 32px; border-radius: 8px;
      font-weight: 700; font-size: 15px; cursor: pointer;
      border: none; font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,168,67,0.3); }
    .btn-secondary {
      background: transparent; color: var(--text);
      padding: 14px 28px; border-radius: 8px;
      font-weight: 500; font-size: 15px; cursor: pointer;
      border: 1px solid rgba(255,255,255,0.15); font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }
    .hero-stats {
      display: flex; gap: 48px; margin-top: 60px;
      padding-top: 40px; border-top: 1px solid var(--border);
    }
    .stat h3 {
      font-family: 'Playfair Display', serif;
      font-size: 32px; font-weight: 700; color: var(--gold);
    }
    .stat p { font-size: 13px; color: var(--muted); margin-top: 4px; letter-spacing: 0.3px; }

    /* SECTION */
    .section { padding: 100px 60px; }
    .section-label {
      font-size: 11px; font-weight: 700; letter-spacing: 3px;
      text-transform: uppercase; color: var(--gold);
      margin-bottom: 14px;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 44px; font-weight: 700; color: var(--cream);
      line-height: 1.15; margin-bottom: 16px;
    }
    .section-sub { font-size: 16px; color: var(--muted); max-width: 520px; line-height: 1.7; }

    /* EXAMS GRID */
    .exams-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 52px; }
    .exams-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
    }
    .exam-card {
      background: var(--card);
      border: 1px solid var(--border); border-radius: 16px;
      padding: 28px 24px; cursor: pointer;
      transition: all 0.25s; position: relative; overflow: hidden;
    }
    .exam-card::before {
      content: ''; position: absolute; inset: 0; border-radius: 16px;
      background: linear-gradient(135deg, rgba(212,168,67,0.06), transparent);
      opacity: 0; transition: opacity 0.25s;
    }
    .exam-card:hover { border-color: rgba(212,168,67,0.4); transform: translateY(-4px); background: var(--card-hover); }
    .exam-card:hover::before { opacity: 1; }
    .exam-icon {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 18px;
    }
    .exam-card h3 { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: var(--cream); margin-bottom: 6px; }
    .exam-card p { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
    .exam-meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .tag {
      font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
      padding: 4px 10px; border-radius: 100px;
      background: rgba(212,168,67,0.1); color: var(--gold); border: 1px solid rgba(212,168,67,0.2);
    }

    /* PRICING */
    .pricing-section { background: var(--navy-2); }
    .pricing-toggle {
      display: inline-flex; align-items: center; gap: 0;
      background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px;
      margin-bottom: 52px; border: 1px solid var(--border);
    }
    .toggle-btn {
      padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; border: none; font-family: 'DM Sans', sans-serif;
      background: transparent; color: var(--muted);
    }
    .toggle-btn.active { background: var(--gold); color: var(--navy); }
    .save-badge {
      background: #22c55e; color: #fff;
      font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
      padding: 2px 8px; border-radius: 100px; margin-left: 8px;
    }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; }
    .plan-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 20px; padding: 36px 32px; position: relative; overflow: hidden;
      transition: transform 0.2s;
    }
    .plan-card.featured {
      background: linear-gradient(145deg, var(--navy-3), #0f1e3d);
      border-color: var(--gold);
    }
    .plan-card:hover { transform: translateY(-4px); }
    .popular-badge {
      position: absolute; top: 20px; right: 20px;
      background: var(--gold); color: var(--navy);
      font-size: 10px; font-weight: 800; letter-spacing: 1px;
      padding: 4px 12px; border-radius: 100px; text-transform: uppercase;
    }
    .plan-name { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
    .plan-price {
      font-family: 'Playfair Display', serif;
      font-size: 52px; font-weight: 900; color: var(--cream);
      line-height: 1; margin-bottom: 4px;
    }
    .plan-price sup { font-size: 22px; vertical-align: top; margin-top: 8px; display: inline-block; }
    .plan-period { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
    .plan-divider { height: 1px; background: var(--border); margin: 24px 0; }
    .plan-features { list-style: none; margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
    .plan-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text); }
    .check { color: var(--gold); font-size: 14px; flex-shrink: 0; }
    .cross { color: var(--muted); font-size: 12px; flex-shrink: 0; }
    .plan-features li.disabled { color: var(--muted); }
    .btn-plan {
      width: 100%; padding: 14px; border-radius: 10px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      border: 1px solid var(--border); background: transparent; color: var(--text);
      font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    }
    .btn-plan:hover { border-color: var(--gold); color: var(--gold); }
    .btn-plan.featured-btn { background: var(--gold); color: var(--navy); border-color: var(--gold); }
    .btn-plan.featured-btn:hover { background: var(--gold-light); }

    /* LOGIN PAGE */
    .login-page {
      min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    }
    .login-left {
      background: var(--navy-2);
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 48px; position: relative; overflow: hidden;
    }
    .login-left-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(212,168,67,0.08) 0%, transparent 70%);
    }
    .login-left-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(212,168,67,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(212,168,67,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .login-left-content { position: relative; z-index: 1; margin-top: 80px; }
    .login-left h2 {
      font-family: 'Playfair Display', serif;
      font-size: 48px; font-weight: 900; color: var(--cream);
      line-height: 1.1; margin-bottom: 20px;
    }
    .login-left h2 em { color: var(--gold); font-style: italic; }
    .login-left p { font-size: 16px; color: var(--muted); line-height: 1.7; max-width: 380px; }
    .login-features { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 16px; }
    .login-feature { display: flex; align-items: center; gap: 14px; }
    .lf-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(212,168,67,0.1); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center; font-size: 16px;
    }
    .lf-text h4 { font-size: 14px; font-weight: 600; color: var(--cream); margin-bottom: 2px; }
    .lf-text p { font-size: 12px; color: var(--muted); }
    .login-right {
      background: var(--navy); display: flex;
      align-items: center; justify-content: center; padding: 60px 48px;
    }
    .login-form-wrap { width: 100%; max-width: 420px; }
    .login-form-wrap h3 {
      font-family: 'Playfair Display', serif;
      font-size: 32px; font-weight: 700; color: var(--cream); margin-bottom: 8px;
    }
    .login-form-wrap > p { font-size: 14px; color: var(--muted); margin-bottom: 36px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; }
    .form-group input {
      width: 100%; padding: 13px 16px;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 10px; color: var(--cream); font-size: 15px;
      font-family: 'DM Sans', sans-serif; outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .form-group input:focus { border-color: var(--gold); background: rgba(212,168,67,0.05); }
    .form-group input::placeholder { color: var(--muted); }
    .form-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .remember { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); cursor: pointer; }
    .remember input[type=checkbox] { accent-color: var(--gold); }
    .forgot { font-size: 13px; color: var(--gold); cursor: pointer; text-decoration: none; background: none; border: none; font-family: 'DM Sans', sans-serif; }
    .btn-login {
      width: 100%; padding: 15px; background: var(--gold);
      color: var(--navy); border: none; border-radius: 10px;
      font-size: 16px; font-weight: 700; cursor: pointer;
      font-family: 'DM Sans', sans-serif; transition: all 0.2s;
      margin-bottom: 24px;
    }
    .btn-login:hover { background: var(--gold-light); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212,168,67,0.3); }
    .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .divider span { flex: 1; height: 1px; background: var(--border); }
    .divider p { font-size: 12px; color: var(--muted); font-weight: 500; }
    .social-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
    .btn-social {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 11px; border-radius: 10px; border: 1px solid var(--border);
      background: transparent; color: var(--text); font-size: 14px; font-weight: 500;
      cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    }
    .btn-social:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); }
    .signup-link { text-align: center; font-size: 14px; color: var(--muted); }
    .signup-link button { background: none; border: none; color: var(--gold); font-weight: 600; cursor: pointer; font-size: 14px; font-family: 'DM Sans', sans-serif; }

    /* FOOTER */
    .footer {
      border-top: 1px solid var(--border); padding: 48px 60px 32px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer p { font-size: 13px; color: var(--muted); }
    .footer-links { display: flex; gap: 28px; }
    .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; cursor: pointer; }
    .footer-links a:hover { color: var(--gold); }

    @media (max-width: 900px) {
      .navbar { padding: 16px 24px; }
      .nav-links { display: none; }
      .hero { padding: 100px 24px 60px; }
      .hero h1 { font-size: 42px; }
      .section { padding: 70px 24px; }
      .exams-grid { grid-template-columns: repeat(2, 1fr); }
      .plans-grid { grid-template-columns: 1fr; }
      .login-page { grid-template-columns: 1fr; }
      .login-left { display: none; }
      .footer { flex-direction: column; gap: 20px; text-align: center; }
    }
  `}</style>
);

const exams = [
  { icon: "🏛️", color: "#1a3a2a", name: "UPSC Civil Services", desc: "IAS, IPS, IFS and all Group A services preparation", tags: ["Prelims", "Mains", "Interview"] },
  { icon: "⚗️", color: "#1a1a3a", name: "JEE Advanced & Main", desc: "Engineering entrance for IITs, NITs and top colleges", tags: ["Physics", "Chemistry", "Maths"] },
  { icon: "🩺", color: "#3a1a1a", name: "NEET-UG & PG", desc: "Medical and postgraduate medical entrance exams", tags: ["Biology", "Chemistry", "Physics"] },
  { icon: "🏦", color: "#1a2a3a", name: "Banking & SSC", desc: "IBPS, SBI, SSC CGL, CHSL and government sector", tags: ["Quant", "Reasoning", "English"] },
  { icon: "⚖️", color: "#2a1a3a", name: "Judiciary & Law", desc: "CLAT, AILET and state judicial service exams", tags: ["Legal", "GK", "Reasoning"] },
  { icon: "💻", color: "#1a3a3a", name: "GATE & PSUs", desc: "Graduate Aptitude Test for engineering and PSU jobs", tags: ["Core Branch", "Aptitude"] },
  { icon: "🎓", color: "#3a2a1a", name: "CAT & MBA Entrance", desc: "IIM and top B-school admissions preparation", tags: ["Quant", "VARC", "DILR"] },
  { icon: "🌍", color: "#2a3a1a", name: "State PSC Exams", desc: "MPSC, BPSC, APPSC and all state-level services", tags: ["State GK", "Current Affairs"] },
];

const plans = [
  {
    name: "Starter",
    monthlyPrice: 299,
    yearlyPrice: 199,
    period: "per month",
    features: [
      { text: "3 Exam Categories", ok: true },
      { text: "500 Practice Questions", ok: true },
      { text: "Basic Performance Analytics", ok: true },
      { text: "PDF Downloads", ok: false },
      { text: "Mock Full-Length Tests", ok: false },
      { text: "Expert Doubt Resolution", ok: false },
    ],
    featured: false,
  },
  {
    name: "Scholar",
    monthlyPrice: 699,
    yearlyPrice: 499,
    period: "per month",
    features: [
      { text: "All Exam Categories", ok: true },
      { text: "Unlimited Practice Questions", ok: true },
      { text: "Advanced Analytics & Insights", ok: true },
      { text: "PDF Downloads", ok: true },
      { text: "20 Mock Full-Length Tests/month", ok: true },
      { text: "Expert Doubt Resolution", ok: false },
    ],
    featured: true,
  },
  {
    name: "Elite",
    monthlyPrice: 1299,
    yearlyPrice: 899,
    period: "per month",
    features: [
      { text: "All Exam Categories", ok: true },
      { text: "Unlimited Everything", ok: true },
      { text: "AI-Powered Study Plan", ok: true },
      { text: "PDF Downloads & Offline", ok: true },
      { text: "Unlimited Mock Tests", ok: true },
      { text: "1-on-1 Expert Doubt Resolution", ok: true },
    ],
    featured: false,
  },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [billing, setBilling] = useState("yearly");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <GoogleFonts />
      {page === "home" ? (
        <div>
          {/* NAVBAR */}
          <nav className="navbar">
            <div className="logo" onClick={() => setPage("home")}>
              Exam<span>Vault</span>
            </div>
            <div className="nav-links">
              <a>Exams</a>
              <a>Mock Tests</a>
              <a>Pricing</a>
              <a>Results</a>
              <button className="btn-nav" onClick={() => setPage("login")}>Sign In</button>
            </div>
          </nav>

          {/* HERO */}
          <section className="hero">
            <div className="hero-bg" />
            <div className="hero-grid" />
            <div className="hero-content">
              <div className="hero-badge"><span />India's Most Trusted Exam Platform</div>
              <h1>Crack Every <em>Competitive</em> Exam You Aim For</h1>
              <p>Access 50,000+ curated questions, full-length mock tests, and AI-driven analysis for UPSC, JEE, NEET, Banking, and 40+ more exams — all in one place.</p>
              <div className="hero-cta">
                <button className="btn-primary" onClick={() => setPage("login")}>Start Free Trial</button>
                <button className="btn-secondary">Browse Exams</button>
              </div>
              <div className="hero-stats">
                <div className="stat"><h3>2.4M+</h3><p>Active Students</p></div>
                <div className="stat"><h3>50K+</h3><p>Practice Questions</p></div>
                <div className="stat"><h3>40+</h3><p>Exam Categories</p></div>
                <div className="stat"><h3>94%</h3><p>Selection Rate</p></div>
              </div>
            </div>
          </section>

          {/* EXAMS */}
          <section className="section">
            <div className="exams-header">
              <div>
                <div className="section-label">Exam Categories</div>
                <div className="section-title">Choose Your<br/>Battleground</div>
              </div>
              <div className="section-sub" style={{textAlign:'right', maxWidth: 320}}>Comprehensive question banks and mock tests for every major competitive exam in India.</div>
            </div>
            <div className="exams-grid">
              {exams.map((e, i) => (
                <div className="exam-card" key={i} onClick={() => setPage("login")}> 
                  <div className="exam-icon" style={{background: e.color}}>{e.icon}</div>
                  <h3>{e.name}</h3>
                  <p>{e.desc}</p>
                  <div className="exam-meta">
                    {e.tags.map((t, j) => <span className="tag" key={j}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING */}
          <section className="section pricing-section">
            <div style={{marginBottom: 8}}>
              <div className="section-label">Pricing Plans</div>
              <div className="section-title">Invest in Your<br/>Success</div>
            </div>
            <p className="section-sub" style={{marginBottom: 40}}>Flexible plans for every stage of your preparation journey.</p>

            <div className="pricing-toggle">
              <button className={`toggle-btn ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>Monthly</button>
              <button className={`toggle-btn ${billing === "yearly" ? "active" : ""}`} onClick={() => setBilling("yearly")}>
                Yearly <span className="save-badge">SAVE 30%</span>
              </button>
            </div>

            <div className="plans-grid">
              {plans.map((p, i) => (
                <div className={`plan-card ${p.featured ? "featured" : ""}`} key={i} onClick={() => setPage("login")}>
                  {p.featured && <div className="popular-badge">Most Popular</div>}
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-price">
                    <sup>₹</sup>{billing === "monthly" ? p.monthlyPrice : p.yearlyPrice}
                  </div>
                  <div className="plan-period">{p.period} {billing === "yearly" && <span style={{color:'#22c55e', fontWeight:600}}>· billed yearly</span>}</div>
                  <div className="plan-divider" />
                  <ul className="plan-features">
                    {p.features.map((f, j) => (
                      <li key={j} className={f.ok ? "" : "disabled"}>
                        {f.ok ? <span className="check">✓</span> : <span className="cross">✕</span>}
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  <button className={`btn-plan ${p.featured ? "featured-btn" : ""}`} onClick={() => setPage("login")}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="footer">
            <p>© 2026 ExamVault. All rights reserved.</p>
            <div className="footer-links">
              <a>Privacy Policy</a>
              <a>Terms of Service</a>
              <a>Contact</a>
              <a>About</a>
            </div>
          </footer>
        </div>
      ) : (
        /* LOGIN PAGE */
        <div className="login-page">
          <div className="login-left">
            <div className="login-left-bg" />
            <div className="login-left-grid" />
            <div className="logo" style={{position:'relative',zIndex:1}} onClick={() => setPage("home")}>Exam<span>Vault</span></div>
            <div className="login-left-content">
              <h2>Your Path to <em>Success</em> Starts Here</h2>
              <p>Join 2.4 million students who cracked their dream exams with ExamVault's proven preparation system.</p>
            </div>
            <div className="login-features">
              {[
                { icon: "📊", title: "AI-Powered Analytics", desc: "Personalized weakspot identification" },
                { icon: "📝", title: "50,000+ Questions", desc: "Curated by top educators" },
                { icon: "🏆", title: "94% Selection Rate", desc: "Among our Premium users" },
              ].map((f, i) => (
                <div className="login-feature" key={i}>
                  <div className="lf-icon">{f.icon}</div>
                  <div className="lf-text"><h4>{f.title}</h4><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="login-right">
            <div className="login-form-wrap">
              <h3>Welcome back</h3>
              <p>Sign in to continue your preparation</p>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="form-row">
                <label className="remember">
                  <input type="checkbox" /> Remember me
                </label>
                <button className="forgot">Forgot password?</button>
              </div>
              <button className="btn-login">Sign In</button>

              <div className="divider">
                <span /><p>or continue with</p><span />
              </div>
              <div className="social-btns">
                <button className="btn-social">🔵 Google</button>
                <button className="btn-social">🔷 Apple</button>
              </div>
              <div className="signup-link">
                Don't have an account? <button onClick={() => setPage("home")}>Create one free →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}