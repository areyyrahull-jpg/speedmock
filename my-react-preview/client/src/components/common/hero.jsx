import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicTheme } from "./usePublicTheme";
/* ─── DATA ──────────────────────────────────────────────────────── */

const plans = [
  {
    id: "starter",
    label: "Sprint",
    days: 30,
    duration: "1 Month",
    price: 30,
    devices: 1,
    badgeText: "TRY IT OUT",
    badgeColor: "#7a7a90",
    hint: "Perfect to kick-start your prep before the exam rush.",
    tagline: "Test series at a cost less than a Chai ☕",
    taglineSub: "Just ₹1/day — cheaper than your morning cup!",
    glow: "rgba(122,122,144,0.3)",
  },
  {
    id: "pro",
    label: "Surge",
    days: 90,
    duration: "3 Months",
    price: 70,
    devices: 2,
    badgeText: "🔥 MOST POPULAR",
    badgeColor: "#e91e8c",
    hint: "Chosen by 7 out of 10 serious aspirants. Best bang for buck.",
    tagline: "3 months of grind, one rank to climb 🚀",
    taglineSub: "Less than ₹25/month — less than a movie ticket!",
    glow: "rgba(233,30,140,0.4)",
  },
  {
    id: "elite",
    label: "Storm",
    days: 180,
    duration: "6 Months",
    price: 100,
    devices: 3,
    badgeText: "⭐ BEST VALUE",
    badgeColor: "#ffaa00",
    hint: "For the relentless. 6 months of full access, 3 devices, zero excuses.",
    tagline: "Half a year. Full throttle. Government job. 💼",
    taglineSub: "Only ₹16/month — a government job for ₹100!",
    glow: "rgba(255,170,0,0.3)",
  },
];

const examCards = [
  {
    id: "cgl",
    title: "SSC CGL",
    icon: "🏛️",
    group: "SSC",
    badge: "Most Attempted",
    badgeColor: "#e91e8c",
    tagline: "The gateway to Group B & C posts",
    details: ["Tier I & II Full Mocks", "PYQ 2017–2024", "Chapter-wise GK, Maths, English, Reasoning", "500+ Practice Sets"],
    color: "#e91e8c",
  },
  {
    id: "cpo",
    title: "SSC CPO",
    icon: "🚔",
    group: "SSC",
    badge: "High Demand",
    badgeColor: "#c2185b",
    tagline: "Sub-Inspector in Central Forces",
    details: ["Paper I & II Mocks", "PYQ Bank 2018–2024", "Physical Awareness Section", "400+ Practice Sets"],
    color: "#c2185b",
  },
  {
    id: "chsl",
    title: "SSC CHSL",
    icon: "📋",
    group: "SSC",
    badge: "Entry Level",
    badgeColor: "#ad1457",
    tagline: "LDC, DEO & PA/SA posts unlocked",
    details: ["Tier I Full Tests", "PYQ 2016–2024", "Typing + Skill Test Prep", "350+ Practice Sets"],
    color: "#ad1457",
  },
  {
    id: "gd",
    title: "SSC GD",
    icon: "🪖",
    group: "SSC",
    badge: "Lakhs Apply",
    badgeColor: "#880e4f",
    tagline: "Constable in BSF, CISF, CRPF & more",
    details: ["Full Mock Tests", "PYQ 2018–2024", "GK + Current Affairs Focus", "300+ Practice Sets"],
    color: "#880e4f",
  },
  {
    id: "mts",
    title: "SSC MTS",
    icon: "📬",
    group: "SSC",
    badge: "10th Pass",
    badgeColor: "#6a0032",
    tagline: "Multi-Tasking Staff — easiest SSC entry",
    details: ["Paper I Mock Tests", "PYQ 2019–2024", "Havaldar + MTS Combined", "250+ Practice Sets"],
    color: "#6a0032",
  },
  {
    id: "ntpc",
    title: "RRB NTPC",
    icon: "🚂",
    group: "Railway",
    badge: "Trending",
    badgeColor: "#0288d1",
    tagline: "Non-Technical posts in Indian Railways",
    details: ["CBT 1 & CBT 2 Mocks", "PYQ 2016–2024", "Station Master, Clerk, Guard", "450+ Practice Sets"],
    color: "#0288d1",
  },
  
  {
    id: "grpd",
    title: "RRB Group D",
    icon: "🔧",
    group: "Railway",
    badge: "10th Pass",
    badgeColor: "#01579b",
    tagline: "Biggest Railway recruitment ever",
    details: ["CBT Full Mocks", "PYQ 2018–2024", "Physics & Chemistry Boost", "300+ Practice Sets"],
    color: "#01579b",
  },
 
  {
    id: "typing",
    title: "Typing Test",
    icon: "⌨️",
    group: "Typing",
    badge: "SSC + Railway",
    badgeColor: "#6a0080",
    tagline: "Speed + Accuracy = Sarkari Job",
    details: ["English & Hindi Typing", "SSC CHSL / CPO / MTS format", "WPM + Accuracy tracking", "Timed Mock Sessions"],
    color: "#7b1fa2",
  },
];

const stats = [
  { value: "2M+", label: "Questions" },
  { value: "50K+", label: "Students" },
  { value: "10+", label: "Exams" },
  { value: "98%", label: "Satisfaction" },
];

/* ─── COMPONENTS ────────────────────────────────────────────────── */

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

function ExamCard({ card, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`exam-card${hovered ? " exam-card--hovered" : ""}`}
      style={{ "--card-color": card.color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Front face */}
      <div className="exam-card-front">
        <div className="exam-card-icon">{card.icon}</div>
        <div className="exam-card-group">{card.group}</div>
        <div className="exam-card-title">{card.title}</div>
        <div
          className="exam-card-badge"
          style={{ background: card.badgeColor + "22", color: card.badgeColor, border: `1px solid ${card.badgeColor}55` }}
        >
          {card.badge}
        </div>
        <div className="exam-card-tagline">{card.tagline}</div>
        <div className="exam-card-hover-hint">Hover to explore →</div>
      </div>

      {/* Back / hover face */}
      <div className="exam-card-back">
        <div className="exam-card-back-title">
          {card.icon} {card.title}
        </div>
        <ul className="exam-card-details">
          {card.details.map((d) => (
            <li key={d}>
              <span className="detail-dot" />
              {d}
            </li>
          ))}
        </ul>
        <div className="exam-card-back-cta">Start Practice →</div>
      </div>
    </div>
  );
}

function PlanCard({ plan, active, onClick }) {
  return (
    <div
      className={`plan-card${active ? " plan-card--active" : ""}${plan.id === "pro" ? " plan-card--featured" : ""}`}
      style={{ "--plan-glow": plan.glow, "--badge-color": plan.badgeColor }}
      onClick={onClick}
    >
      {/* Top glow line */}
      <div className="plan-topbar" />

      {/* Badge */}
      <div
        className="plan-badge"
        style={{
          background: plan.badgeColor + "22",
          color: plan.badgeColor,
          border: `1px solid ${plan.badgeColor}55`,
        }}
      >
        {plan.badgeText}
      </div>

      {/* Name + duration */}
      <div className="plan-name">{plan.label}</div>
      <div className="plan-duration">{plan.duration} · {plan.days} Days</div>

      {/* Tagline */}
      <div className="plan-tagline">"{plan.tagline}"</div>
      <div className="plan-tagline-sub">{plan.taglineSub}</div>

      {/* Price */}
      <div className="plan-price-row">
        <span className="plan-currency">₹</span>
        <span className="plan-price">{plan.price}</span>
        <span className="plan-period">/{plan.days}d</span>
      </div>

      {/* Hint */}
      <div className="plan-hint">💡 {plan.hint}</div>

      {/* Divider */}
      <div className="plan-divider" />

      {/* Perks */}
      <ul className="plan-perks">
        {[
          "Full PYQ Paper Tests",
          "Chapter-wise Practice",
          "Typing Test Module",
          "Detailed Performance Analysis",
          `${plan.devices} Device Login${plan.devices > 1 ? "s" : ""}`,
          `${plan.days}-Day Full Access`,
        ].map((perk) => (
          <li className="plan-perk" key={perk}>
            <span className="perk-check">✓</span>
            {perk}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button className="plan-cta">Get {plan.label} →</button>
    </div>
  );
}

import FeatureCarousel from './FeatureCarousel';
/* ─── MAIN ──────────────────────────────────────────────────────── */

export default function SpeedMockHero({ onExamCardClick, onPlanCardClick }) {
  const navigate = useNavigate();
  const [theme] = usePublicTheme();
  const [activePlan, setActivePlan] = useState("pro");
  const heroRef = useRef(null);

  const handleLoginNavigation = () => navigate("/login");
  const handleSignUpNavigation = () => navigate("/signup");

  const particles = Array.from({ length: 20 }, (_, i) => ({
    key: i,
    style: {
      left: `${(i * 5.2 + 3) % 100}%`,
      top: `${(i * 7.3 + 10) % 100}%`,
      width: `${4 + (i % 3) * 3}px`,
      height: `${4 + (i % 3) * 3}px`,
      animationDelay: `${(i * 0.9) % 7}s`,
      animationDuration: `${5 + (i % 4)}s`,
      opacity: 0.1 + (i % 5) * 0.04,
    },
  }));

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --fuchsia: #e91e8c;
          --fuchsia-bright: #ff3aaa;
          --fuchsia-deep: #b5005f;
          --fuchsia-glow: rgba(233,30,140,0.35);
        }

        /* Light theme (default) — white blended with soft blue */
        [data-theme="light"] {
          --grey-900: #eef4ff;
          --grey-800: #ffffff;
          --grey-750: #f6f9ff;
          --grey-700: #eaf1ff;
          --grey-600: #d7e3f5;
          --grey-400: #64748b;
          --grey-200: #1e293b;
          --grey-100: #0f172a;
          --white: #0f172a;
          --page-gradient: linear-gradient(180deg, #ffffff 0%, #f3f8ff 35%, #eaf2ff 100%);
          --card-shadow: 0 8px 32px rgba(30,64,175,0.08);
        }

        /* Dark theme (alternate) */
        [data-theme="dark"] {
          --grey-900: #0e0e12;
          --grey-800: #18181f;
          --grey-750: #1f1f28;
          --grey-700: #252530;
          --grey-600: #32323f;
          --grey-400: #7a7a90;
          --grey-200: #c8c8d8;
          --grey-100: #ebebf2;
          --white: #ffffff;
          --page-gradient: var(--grey-900);
          --card-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }

        html { scroll-behavior: smooth; }
        body { background: var(--grey-900); font-family: 'Outfit', sans-serif; overflow-x: hidden; transition: background 0.4s; }

        /* ══ HERO LANDING BLOCK ═══════════════════════════════════ */
        .hero-landing {
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 2; width: 100%;
          animation: fadeUp 0.6s 0s ease both;
        }

        /* Big centred logo */
        .hero-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 13vw, 10rem);
          letter-spacing: 8px; line-height: 1;
          background: linear-gradient(135deg, var(--fuchsia-bright) 0%, #ff99dd 45%, var(--fuchsia-deep) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 36px rgba(233,30,140,0.55));
        }
        .hero-logo-sub {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 4px;
          text-transform: uppercase; color: var(--grey-400); margin-top: 4px;
        }

        /* Auth buttons row */
        .hero-auth-row {
          display: flex; gap: 14px; margin-top: 28px; align-items: center;
        }
        .hero-btn-login {
          background: transparent; color: var(--grey-100);
          border: 2px solid rgba(233,30,140,0.35); border-radius: 50px;
          padding: 13px 40px; font-family: 'Outfit', sans-serif;
          font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.22s;
          letter-spacing: 0.4px;
        }
        .hero-btn-login:hover {
          border-color: var(--fuchsia-bright); color: var(--fuchsia-bright);
          background: rgba(233,30,140,0.07); transform: translateY(-2px);
        }
        .hero-btn-signup {
          background: linear-gradient(135deg, var(--fuchsia-bright), var(--fuchsia-deep));
          color: #fff; border: none; border-radius: 50px;
          padding: 13px 40px; font-family: 'Outfit', sans-serif;
          font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.22s;
          letter-spacing: 0.4px;
          box-shadow: 0 4px 28px rgba(233,30,140,0.45);
        }
        .hero-btn-signup:hover { transform: translateY(-3px); box-shadow: 0 8px 38px rgba(233,30,140,0.62); }

        /* Free trial perks card */
        .free-trial-card {
          margin-top: 28px;
          background: rgba(233,30,140,0.06);
          border: 1px solid rgba(233,30,140,0.22);
          border-radius: 18px; padding: 18px 32px;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          max-width: 620px; width: 100%;
          position: relative; overflow: hidden;
        }
        .free-trial-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--fuchsia-deep), var(--fuchsia-bright), var(--fuchsia-deep));
        }
        .free-trial-heading {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.7rem; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--fuchsia-bright);
        }
        .free-trial-heading-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--fuchsia-bright);
          box-shadow: 0 0 8px var(--fuchsia-bright);
          animation: pulse 1.6s ease-in-out infinite;
        }
        .free-trial-perks {
          display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;
        }
        .free-perk {
          display: flex; align-items: center; gap: 9px;
          font-size: 0.84rem; font-weight: 500; color: var(--grey-200);
        }
        .free-perk-icon {
          width: 30px; height: 30px; border-radius: 10px; flex-shrink: 0;
          background: rgba(233,30,140,0.15);
          border: 1px solid rgba(233,30,140,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
        }
        .free-perk-text { display: flex; flex-direction: column; }
        .free-perk-title { font-weight: 700; color: var(--white); font-size: 0.84rem; }
        .free-perk-desc { font-size: 0.72rem; color: var(--grey-400); margin-top: 1px; }
        .free-trial-sep {
          width: 1px; height: 36px; background: var(--grey-600); flex-shrink: 0;
        }
        .free-trial-note {
          font-size: 0.72rem; color: var(--grey-400); text-align: center;
        }
        .free-trial-note strong { color: var(--fuchsia-bright); }

        /* ══ HERO WRAP ════════════════════════════════════════════ */
        .hero {
          position: relative; overflow: hidden;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          padding: 60px 5% 100px;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(233,30,140,0.1) 0%, transparent 65%),
            var(--page-gradient);
          transition: background 0.4s;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(233,30,140,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,30,140,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .hero::after {
          content: ''; position: absolute; pointer-events: none;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(233,30,140,0.14) 0%, transparent 70%);
          right: -220px; top: -120px;
        }

        /* ══ PARTICLES ════════════════════════════════════════════ */
        .particle {
          position: absolute; border-radius: 50%;
          background: var(--fuchsia-bright); pointer-events: none;
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.4; }
          100% { transform: translateY(-100px) scale(0.3); opacity: 0; }
        }

        /* ══ HERO BADGE ═══════════════════════════════════════════ */
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(233,30,140,0.1);
          border: 1px solid rgba(233,30,140,0.28);
          border-radius: 50px; padding: 6px 20px; margin-bottom: 28px;
          animation: fadeDown 0.6s ease both;
          position: relative; z-index: 1;
        }
        .badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--fuchsia-bright);
          box-shadow: 0 0 8px var(--fuchsia-bright);
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 5px var(--fuchsia-bright); transform: scale(1); }
          50% { box-shadow: 0 0 14px var(--fuchsia-bright); transform: scale(1.35); }
        }
        .hero-badge span { font-size: 0.76rem; font-weight: 700; letter-spacing: 1.6px; color: var(--fuchsia-bright); text-transform: uppercase; }

        /* ══ HEADLINE ═════════════════════════════════════════════ */
        .hero-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.4rem, 9vw, 8rem); line-height: 0.9;
          text-align: center; color: var(--white); letter-spacing: 2px;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero-headline em {
          font-style: normal;
          background: linear-gradient(135deg, var(--fuchsia-bright) 0%, #ff88cc 50%, var(--fuchsia-deep) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 22px rgba(233,30,140,0.5));
        }

        /* ══ SUBTEXT ══════════════════════════════════════════════ */
        .hero-sub {
          margin-top: 22px; max-width: 620px; text-align: center;
          font-size: 1.05rem; line-height: 1.75; color: var(--grey-400);
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.22s ease both;
        }
        .hero-sub strong { color: var(--grey-200); font-weight: 600; }

        /* ══ CTA ROW ══════════════════════════════════════════════ */
        .cta-row {
          display: flex; gap: 14px; margin-top: 36px; flex-wrap: wrap; justify-content: center;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.35s ease both;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--fuchsia-bright), var(--fuchsia-deep));
          color: #fff; border: none; border-radius: 50px;
          padding: 14px 36px; font-family: 'Outfit', sans-serif;
          font-size: 0.98rem; font-weight: 700; letter-spacing: 0.4px;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 30px rgba(233,30,140,0.42);
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 40px rgba(233,30,140,0.58); }
        .btn-outline {
          background: transparent; color: var(--grey-100);
          border: 1.5px solid rgba(200,200,216,0.22); border-radius: 50px;
          padding: 14px 36px; font-family: 'Outfit', sans-serif;
          font-size: 0.98rem; font-weight: 600; cursor: pointer; transition: all 0.25s;
        }
        .btn-outline:hover { border-color: var(--fuchsia); color: var(--fuchsia-bright); transform: translateY(-3px); }

        /* ══ STATS ════════════════════════════════════════════════ */
        .stats-row {
          display: flex; gap: 52px; margin-top: 56px; flex-wrap: wrap; justify-content: center;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.48s ease both;
        }
        .stat { text-align: center; }
        .stat-value {
          font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem;
          letter-spacing: 2px; line-height: 1;
          background: linear-gradient(135deg, var(--fuchsia-bright), #ffaadd);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .stat-label { font-size: 0.75rem; color: var(--grey-400); font-weight: 500; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 4px; }

        /* ══ SECTION WRAPPER ══════════════════════════════════════ */
        .section-wrap {
          width: 100%; max-width: 1080px; margin-top: 80px;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.6s ease both;
        }
        .section-heading {
          text-align: center; font-family: 'Bebas Neue', sans-serif;
          font-size: 2.6rem; letter-spacing: 2.5px; color: var(--white); margin-bottom: 6px;
        }
        .section-sub { text-align: center; font-size: 0.88rem; color: var(--grey-400); margin-bottom: 10px; }
        .section-divider {
          width: 72px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, var(--fuchsia-bright), var(--fuchsia-deep));
          margin: 0 auto 36px;
        }

        /* ══ WHAT YOU GET — PERKS SHOWCASE ═══════════════════════════ */
        .perks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 44px;
        }
        .perk-card {
          background: var(--grey-800);
          border: 1px solid var(--grey-600);
          border-radius: 18px;
          padding: 26px 22px;
          box-shadow: var(--card-shadow);
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .perk-card:hover {
          transform: translateY(-4px);
          border-color: rgba(233,30,140,0.4);
        }
        .perk-icon {
          width: 48px; height: 48px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; margin-bottom: 16px;
        }
        .perk-title {
          font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem;
          color: var(--white); margin-bottom: 6px;
        }
        .perk-desc {
          font-size: 0.84rem; color: var(--grey-400); line-height: 1.6;
        }

        /* Why not free — honest, prominent explainer */
        .why-not-free {
          max-width: 780px; margin: 0 auto;
          background: var(--grey-800);
          border: 1px solid rgba(233,30,140,0.25);
          border-radius: 20px;
          padding: 32px 34px;
          box-shadow: var(--card-shadow);
          position: relative;
          overflow: hidden;
        }
        .why-not-free::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--fuchsia-bright), var(--fuchsia-deep));
        }
        .why-not-free-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 1.5px;
          color: var(--white); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
        }
        .why-not-free-body {
          font-size: 0.92rem; color: var(--grey-400); line-height: 1.75;
        }
        .why-not-free-body strong { color: var(--white); }
        .why-not-free-price-note {
          margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--grey-600);
          font-size: 0.86rem; color: var(--fuchsia-bright); font-weight: 700;
        }

        @media (max-width: 820px) {
          .hero { padding: 52px 18px 72px; }
          .hero-auth-row {
            width: 100%;
            max-width: 320px;
            flex-direction: column;
          }
          .hero-btn-login,
          .hero-btn-signup {
            width: 100%;
          }
          .free-trial-card {
            padding: 16px 18px;
          }
          .free-trial-perks {
            flex-direction: column;
            gap: 12px;
          }
          .free-trial-sep {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .perks-grid { grid-template-columns: 1fr 1fr; }
          .why-not-free { padding: 24px 20px; }
          .hero-headline { font-size: clamp(2.8rem, 14vw, 5rem); }
          .hero-sub { font-size: 0.96rem; }
          .cta-row {
            width: 100%;
            max-width: 280px;
            margin-left: auto;
            margin-right: auto;
            flex-direction: column;
          }
          .btn-primary,
          .btn-outline {
            width: 100%;
          }
        }
        @media (max-width: 420px) {
          .perks-grid { grid-template-columns: 1fr; }
          .hero-logo { font-size: clamp(2.8rem, 20vw, 5rem); }
          .hero-logo-sub { letter-spacing: 2px; }
          .stats-row { gap: 24px; }
        }

        /* ══ EXAM CARDS ═══════════════════════════════════════════ */
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .exam-card {
          position: relative; border-radius: 18px; overflow: hidden;
          background: var(--grey-750);
          border: 1.5px solid var(--grey-600);
          min-height: 200px; cursor: pointer;
          transition: transform 0.32s ease, box-shadow 0.32s ease, border-color 0.32s ease;
        }
        .exam-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--card-color);
          box-shadow: 0 12px 36px color-mix(in srgb, var(--card-color) 30%, transparent);
        }

        /* Front */
        .exam-card-front {
          padding: 22px 18px 18px;
          display: flex; flex-direction: column; gap: 6px;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .exam-card--hovered .exam-card-front {
          opacity: 0; transform: translateY(-8px); pointer-events: none;
        }
        .exam-card-icon { font-size: 2rem; line-height: 1; }
        .exam-card-group {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: var(--card-color); margin-top: 2px;
        }
        .exam-card-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.55rem; letter-spacing: 1.5px; color: var(--white);
        }
        .exam-card-badge {
          display: inline-block; border-radius: 50px;
          padding: 2px 10px; font-size: 0.62rem; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; width: fit-content;
        }
        .exam-card-tagline { font-size: 0.75rem; color: var(--grey-400); line-height: 1.45; margin-top: 2px; }
        .exam-card-hover-hint {
          font-size: 0.65rem; color: var(--grey-600); letter-spacing: 0.5px;
          margin-top: auto; padding-top: 10px;
          transition: color 0.2s;
        }
        .exam-card:hover .exam-card-hover-hint { color: var(--card-color); }

        /* Back */
        .exam-card-back {
          position: absolute; inset: 0;
          padding: 20px 18px;
          background: linear-gradient(145deg, color-mix(in srgb, var(--card-color) 18%, var(--grey-800)), var(--grey-800));
          display: flex; flex-direction: column; gap: 10px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.28s ease, transform 0.28s ease;
          pointer-events: none;
        }
        .exam-card--hovered .exam-card-back {
          opacity: 1; transform: translateY(0); pointer-events: auto;
        }
        .exam-card-back-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem; letter-spacing: 1.5px;
          color: var(--white);
        }
        .exam-card-details { list-style: none; display: flex; flex-direction: column; gap: 6px; }
        .exam-card-details li {
          display: flex; align-items: flex-start; gap: 7px;
          font-size: 0.76rem; color: var(--grey-200); line-height: 1.4;
        }
        .detail-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
          background: var(--card-color);
          box-shadow: 0 0 5px var(--card-color);
        }
        .exam-card-back-cta {
          margin-top: auto;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.5px;
          color: var(--card-color); cursor: pointer;
          transition: letter-spacing 0.2s;
        }
        .exam-card-back-cta:hover { letter-spacing: 1.5px; }

        /* ══ PRICING SECTION ══════════════════════════════════════ */
        .pricing-wrap {
          width: 100%; max-width: 1000px; margin-top: 90px;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.72s ease both;
        }
        .pricing-cards {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 20px;
        }
        @media (max-width: 700px) { .pricing-cards { grid-template-columns: 1fr; } }

        .plan-card {
          position: relative; border-radius: 22px; padding: 28px 22px 24px;
          background: var(--grey-750);
          border: 1.5px solid var(--grey-600);
          cursor: pointer; transition: all 0.28s;
          overflow: hidden;
        }
        .plan-card:hover, .plan-card--active {
          border-color: var(--fuchsia);
          background: rgba(233,30,140,0.06);
          transform: translateY(-8px);
          box-shadow: 0 16px 48px var(--plan-glow, rgba(233,30,140,0.25));
        }
        .plan-card--featured {
          border-color: rgba(233,30,140,0.4);
          background: rgba(233,30,140,0.04);
        }

        .plan-topbar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--fuchsia-deep), var(--fuchsia-bright));
          opacity: 0; transition: opacity 0.28s;
        }
        .plan-card:hover .plan-topbar, .plan-card--active .plan-topbar { opacity: 1; }
        .plan-card--featured .plan-topbar { opacity: 1; }

        .plan-badge {
          display: inline-block; border-radius: 50px;
          padding: 4px 12px; font-size: 0.65rem; font-weight: 800;
          letter-spacing: 1.2px; text-transform: uppercase;
          margin-bottom: 14px;
        }
        .plan-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
          letter-spacing: 2px; color: var(--white); line-height: 1;
        }
        .plan-duration { font-size: 0.78rem; color: var(--grey-400); font-weight: 500; margin-top: 2px; margin-bottom: 14px; }

        .plan-tagline {
          font-size: 0.82rem; font-weight: 600; color: var(--fuchsia-bright);
          font-style: italic; line-height: 1.4;
        }
        .plan-tagline-sub {
          font-size: 0.72rem; color: var(--grey-400); margin-top: 3px; margin-bottom: 14px;
        }

        .plan-price-row { display: flex; align-items: flex-end; gap: 2px; }
        .plan-currency { font-size: 1.15rem; font-weight: 700; color: var(--fuchsia-bright); line-height: 2; }
        .plan-price {
          font-family: 'Bebas Neue', sans-serif; font-size: 3.4rem;
          letter-spacing: 1px; line-height: 1; color: var(--white);
        }
        .plan-period { font-size: 0.78rem; color: var(--grey-400); line-height: 1.8; margin-left: 3px; }

        .plan-hint {
          margin-top: 10px; padding: 9px 12px; border-radius: 10px;
          background: rgba(233,30,140,0.07);
          border: 1px solid rgba(233,30,140,0.15);
          font-size: 0.75rem; color: var(--grey-200); line-height: 1.5;
        }

        .plan-divider {
          height: 1px; background: var(--grey-600); margin: 16px 0;
        }

        .plan-perks { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .plan-perk { display: flex; align-items: center; gap: 9px; font-size: 0.82rem; color: var(--grey-200); }
        .perk-check {
          width: 17px; height: 17px; border-radius: 50%; flex-shrink: 0;
          background: rgba(233,30,140,0.18); color: var(--fuchsia-bright);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700;
        }

        .plan-cta {
          width: 100%; margin-top: 20px;
          background: linear-gradient(135deg, var(--fuchsia), var(--fuchsia-deep));
          color: #fff; border: none; border-radius: 50px;
          padding: 12px 0; font-family: 'Outfit', sans-serif;
          font-size: 0.88rem; font-weight: 700; letter-spacing: 0.4px;
          cursor: pointer; transition: all 0.22s;
          box-shadow: 0 3px 18px rgba(233,30,140,0.3);
          opacity: 0.7;
        }
        .plan-card:hover .plan-cta, .plan-card--active .plan-cta {
          opacity: 1; box-shadow: 0 6px 26px rgba(233,30,140,0.5);
        }
        .plan-cta:hover { transform: translateY(-2px); }

        /* ══ FOOTER NOTE ══════════════════════════════════════════ */
        .footer-note {
          margin-top: 60px; text-align: center;
          font-size: 0.8rem; color: var(--grey-400);
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.85s ease both;
        }
        .footer-note a { color: var(--fuchsia); text-decoration: none; }
        .footer-note a:hover { text-decoration: underline; }

        /* ══ ANIMATIONS ═══════════════════════════════════════════ */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="hero" ref={heroRef} data-theme={theme}>
        {particles.map((p) => <Particle key={p.key} style={p.style} />)}

        {/* ── HERO LANDING: Big Logo + Auth + Free Trial ── */}
        <div className="hero-landing">

          {/* Big centred logo */}
          <div className="hero-logo">SpeedMock</div>
          <div className="hero-logo-sub">Your Sarkari Exam Partner</div>

          {/* Login + Signup */}
          <div className="hero-auth-row">
            <button className="hero-btn-login" onClick={handleLoginNavigation}>Login</button>
            <button className="hero-btn-signup" onClick={handleSignUpNavigation}>Sign Up — It's Free</button>
          </div>

          {/* Free trial perks card */}
          <div className="free-trial-card">
            <div className="free-trial-heading">
              <span className="free-trial-heading-dot" />
              🎁 New Student Free Trial — No Card Needed
            </div>
            <div className="free-trial-perks">
              <div className="free-perk">
                <span className="free-perk-icon">📄</span>
                <span className="free-perk-text">
                  <span className="free-perk-title">2 Full PYQ Mock Tests</span>
                  <span className="free-perk-desc">Real exam papers, timed & graded</span>
                </span>
              </div>
              <div className="free-trial-sep" />
              <div className="free-perk">
                <span className="free-perk-icon">⏱️</span>
                <span className="free-perk-text">
                  <span className="free-perk-title">3-Day Practice Access</span>
                  <span className="free-perk-desc">Chapter-wise PYQ question bank</span>
                </span>
              </div>
            </div>
            <div className="free-trial-note">
              <div style={{marginBottom:6}}><strong>Features you get:</strong> Bilingual (Hindi / English) question support, Analytical dashboard, PYQ test series & question bank, Test history, and Bookmarks.</div>
              <div style={{fontSize:"0.9rem",color:"var(--grey-400)"}}>
                Why not free? As a student, I tried many free resources but rarely used them seriously because they felt low-value. A small, very affordable price helps increase commitment and makes the service more useful — so plans are priced intentionally low to keep it valuable for you.
              </div>
              <div style={{marginTop:8}}>Register today → get <strong>instant free access</strong> · No payment required for the trial</div>
            </div>
          </div>
        </div>

        {/* Hero badge */}
        <div className="hero-badge" style={{marginTop: "52px"}}>
          <span className="badge-dot" />
          <span>India's Fastest Exam Prep Platform</span>
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          Mock Smarter.<br />
          <em>Rank Higher.</em>
        </h1>

        {/* Sub */}
        <p className="hero-sub">
          Practice <strong>PYQ papers</strong> & chapter-wise questions for <strong>SSC, Railway</strong> and <strong>Typing Tests</strong> — all in one place. Real exam feel, real results.
        </p>

        {/* Stats */}
        <div className="stats-row">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── WHAT YOU GET ──────────────────────────────── */}
        <div className="section-wrap">
          <h2 className="section-heading">What You Actually Get</h2>
          <p className="section-sub">Not a demo. Not a teaser. The real tools that move your score.</p>
          <div className="section-divider" />

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon" style={{ background: "rgba(233,30,140,0.12)" }}>📊</div>
              <div className="perk-title">Analytical Dashboard</div>
              <div className="perk-desc">See exactly where you're losing marks — subject-wise accuracy, speed trends, and weak-topic breakdowns after every test.</div>
            </div>
            <div className="perk-card">
              <div className="perk-icon" style={{ background: "rgba(34,197,94,0.12)" }}>📜</div>
              <div className="perk-title">PYQ Test Series</div>
              <div className="perk-desc">Real previous-year papers from actual exam shifts — SSC, Railway and more — not recycled generic questions.</div>
            </div>
            <div className="perk-card">
              <div className="perk-icon" style={{ background: "rgba(168,85,247,0.12)" }}>📚</div>
              <div className="perk-title">Practice Question Bank</div>
              <div className="perk-desc">Thousands of quality questions organized by subject and topic, going well beyond what PYQ papers alone cover.</div>
            </div>
            <div className="perk-card">
              <div className="perk-icon" style={{ background: "rgba(6,182,212,0.12)" }}>⌨️</div>
              <div className="perk-title">Typing Practice</div>
              <div className="perk-desc">A full finger-placement course plus real exam-format typing tests, in both English and Hindi — no ads for subscribers.</div>
            </div>
            <div className="perk-card">
              <div className="perk-icon" style={{ background: "rgba(250,204,21,0.14)" }}>💡</div>
              <div className="perk-title">Detailed Explanations</div>
              <div className="perk-desc">Every answer comes with a clear explanation, not just a right/wrong mark — so you actually learn from mistakes.</div>
            </div>
            <div className="perk-card">
              <div className="perk-icon" style={{ background: "rgba(59,130,246,0.12)" }}>🌐</div>
              <div className="perk-title">Bilingual Support</div>
              <div className="perk-desc">Every test and question is available in both Hindi and English, so you can practice in whichever you're comfortable with.</div>
            </div>
          </div>

          <div className="why-not-free">
            <div className="why-not-free-title">🤔 Why isn't this free?</div>
            <div className="why-not-free-body">
              We could have made this another free resource nobody takes seriously. But as students ourselves, we noticed something: <strong>free tools rarely get used consistently</strong>, because there's nothing on the line. A small, genuinely affordable price changes that — it turns "maybe later" into actual daily practice, and it's what lets us keep building real papers, real explanations, and real analytics instead of ads and filler content.
            </div>
            <div className="why-not-free-price-note">
              That's why our plans start at ₹1/day — cheaper than your morning chai, and built to actually get used.
            </div>
          </div>
        </div>

        {/* ── FEATURE PREVIEW SLIDER ────────────────── */}
        <FeatureCarousel />

        {/* ── EXAMS ─────────────────────────────────── */}
        <div className="section-wrap">
          <h2 className="section-heading">Exams We Cover</h2>
          <p className="section-sub">Hover over any exam to see what's inside</p>
          <div className="section-divider" />
          <div className="exam-grid">
            {examCards.map((card) => (
              <ExamCard
                key={card.id}
                card={card}
                onClick={() => {
                  onExamCardClick?.(card.id);
                  handleLoginNavigation();
                }}
              />
            ))}
          </div>
        </div>

        {/* ── PRICING ───────────────────────────────── */}
        <div id="pricing" className="pricing-wrap">
          <h2 className="section-heading">Affordable Plans</h2>
          <p className="section-sub">All perks, every plan — just pick your duration</p>
          <div className="section-divider" />
          <div className="pricing-cards">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                active={activePlan === plan.id}
                onClick={() => {
                  setActivePlan(plan.id);
                  onPlanCardClick?.(plan.id);
                  handleSignUpNavigation();
                }}
              />
            ))}
          </div>
        </div>

      </section>
    </>
  );
}
