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
export default function PrivacyPolicy() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
  const sections = [
    {
      icon: "📋",
      title: "Information We Collect",
      content: [
        {
          subtitle: "Information You Provide",
          body: "When you register on SpeedMock, we collect your full name, mobile phone number, and optionally your email address. During payment, transaction details are processed by our payment gateway partner and we only store a transaction reference ID — never your card or UPI details.",
        },
        {
          subtitle: "Information We Collect Automatically",
          body: "When you use SpeedMock, we automatically collect usage data such as typing speed (WPM), accuracy scores, session duration, exam categories accessed, practice history, and device information such as browser type, operating system, and IP address.",
        },
        {
          subtitle: "OTP Verification",
          body: "Your phone number is verified via a one-time password (OTP) sent through SMS. We use Redis to temporarily store OTP tokens for verification purposes. These are deleted immediately after successful verification.",
        },
      ],
    },
    {
      icon: "🎯",
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "To Provide Our Service",
          body: "We use your information to create and manage your account, provide access to exam content and practice sets, track your typing progress and performance analytics, manage your subscription and device access, and send important account-related notifications.",
        },
        {
          subtitle: "To Improve SpeedMock",
          body: "Aggregated and anonymised usage data helps us understand which features are most used, improve our question bank and typing passages, fix bugs and improve platform performance, and develop new features based on user behaviour.",
        },
        {
          subtitle: "To Communicate With You",
          body: "We may send you OTP messages for verification, important account updates such as plan expiry reminders, and platform announcements. We do not send promotional spam.",
        },
      ],
    },
    {
      icon: "🔒",
      title: "Data Security",
      content: [
        {
          subtitle: "How We Protect Your Data",
          body: "All data transmitted between your device and our servers is encrypted using HTTPS/TLS. Passwords are never stored in plaintext — authentication is OTP-based. Our servers follow industry-standard security practices and are regularly updated.",
        },
        {
          subtitle: "Data Retention",
          body: "We retain your account and performance data for as long as your account is active. If you delete your account, your personal data is removed within 30 days. Typing session data may be retained in anonymised form for product improvement purposes.",
        },
      ],
    },
    {
      icon: "🤝",
      title: "Data Sharing",
      content: [
        {
          subtitle: "We Do Not Sell Your Data",
          body: "SpeedMock does not sell, rent, or trade your personal information to any third party for marketing purposes. Your data is yours.",
        },
        {
          subtitle: "Service Providers",
          body: "We may share limited data with trusted third-party service providers who help us operate our platform, including SMS gateway providers for OTP delivery, payment processors for subscription management, and cloud hosting providers. All partners are contractually bound to protect your data.",
        },
        {
          subtitle: "Legal Requirements",
          body: "We may disclose your information if required by law, court order, or government authority in India. We will notify you of such requests where legally permitted.",
        },
      ],
    },
    {
      icon: "📱",
      title: "Device & Session Management",
      content: [
        {
          subtitle: "Multi-Device Usage",
          body: "Your subscription plan limits simultaneous device logins. We track active sessions per account to enforce this policy. You can view and manage active sessions from your account settings. We may automatically log out older sessions when the device limit is exceeded.",
        },
        {
          subtitle: "Cookies & Local Storage",
          body: "SpeedMock uses browser local storage and session storage to maintain your login state, store preferences, and remember your selected exam and typing language. We do not use third-party tracking cookies or advertising cookies.",
        },
      ],
    },
    {
      icon: "👤",
      title: "Your Rights",
      content: [
        {
          subtitle: "Access & Correction",
          body: "You have the right to access the personal information we hold about you and to request corrections to any inaccurate data. You can update your name and email from your profile settings at any time.",
        },
        {
          subtitle: "Account Deletion",
          body: "You may request deletion of your account and all associated personal data by contacting our support team. Account deletion is permanent and cannot be reversed. Subscription fees are non-refundable upon account deletion.",
        },
        {
          subtitle: "Data Portability",
          body: "You may request an export of your typing performance data and session history in a readable format by contacting support at support@speedmock.in.",
        },
      ],
    },
    {
      icon: "👶",
      title: "Children's Privacy",
      content: [
        {
          subtitle: "Age Requirement",
          body: "SpeedMock is intended for users aged 13 and above. We do not knowingly collect personal information from children under the age of 13. If you believe a child under 13 has created an account, please contact us immediately and we will remove the account.",
        },
      ],
    },
    {
      icon: "🔄",
      title: "Changes to This Policy",
      content: [
        {
          subtitle: "Policy Updates",
          body: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes via SMS or in-app notification. Continued use of SpeedMock after changes are posted constitutes acceptance of the updated policy.",
        },
      ],
    },
    {
      icon: "📧",
      title: "Contact Us",
      content: [
        {
          subtitle: "Privacy Concerns",
          body: "If you have any questions, concerns, or requests regarding your privacy or this policy, please contact us at support@speedmock.in. We will respond within 2 business days.",
        },
      ],
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --f:#e91e8c; --fb:#ff3aaa; --fd:#b5005f;
          --g9:#0e0e12; --g8:#18181f; --g75:#1e1e28;
          --g6:#32323f; --g4:#7a7a90; --g3:#9a9ab0; --g2:#c8c8d8; --w:#ffffff;
        }
        body { background: var(--g9); font-family: 'Outfit', sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#18181f}::-webkit-scrollbar-thumb{background:#e91e8c44;border-radius:3px}

        .page {
          min-height:100vh; background:var(--g9);
          background-image:linear-gradient(rgba(233,30,140,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(233,30,140,0.018) 1px,transparent 1px);
          background-size:52px 52px;
        }
.container {
  display: flex;
  justify-content: flex-start; /* Aligns the button to the left side */
}
        /* HERO */
        .hero {
          background:linear-gradient(180deg,rgba(233,30,140,0.1) 0%,transparent 100%);
          border-bottom:1px solid rgba(233,30,140,0.12);
          padding:52px 5% 40px; text-align:center;
        }
        .hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(233,30,140,0.08); border:1px solid rgba(233,30,140,0.22);
          border-radius:50px; padding:5px 16px; margin-bottom:18px;
          font-size:0.68rem; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:var(--fb);
        }
        .hero-title {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(2.4rem,5vw,4rem);
          letter-spacing:3px; color:var(--w); line-height:1; margin-bottom:12px;
        }
        .hero-sub { font-size:0.86rem; color:var(--g4); line-height:1.7; max-width:500px; margin:0 auto 20px; }
        .hero-meta {
          display:inline-flex; align-items:center; gap:20px; flex-wrap:wrap; justify-content:center;
          font-size:0.72rem; color:var(--g4); font-weight:500;
        }

        /* LAYOUT */
        .layout { display:flex; gap:32px; padding:44px 5% 60px; max-width:1060px; margin:0 auto; }

        /* SIDEBAR */
        .sidebar {
          width:220px; flex-shrink:0; position:sticky; top:24px; height:fit-content;
          display:flex; flex-direction:column; gap:3px;
        }
        .sidebar-title {
          font-size:0.6rem; font-weight:800; letter-spacing:2.5px; text-transform:uppercase;
          color:var(--f); margin-bottom:10px; padding:0 8px;
        }
        .sidebar-link {
          display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:9px;
          font-size:0.76rem; font-weight:500; color:var(--g4);
          text-decoration:none; cursor:pointer; transition:all 0.18s;
          background:none; border:none; text-align:left; font-family:'Outfit',sans-serif;
        }
        .sidebar-link:hover { background:rgba(233,30,140,0.08); color:var(--g2); }
        .sidebar-link-icon { font-size:0.9rem; flex-shrink:0; }

        /* CONTENT */
        .content { flex:1; min-width:0; }
        .section {
          background:var(--g8); border:1px solid var(--g6); border-radius:18px;
          padding:26px 28px; margin-bottom:14px;
          animation:fadeUp 0.4s ease both; transition:border-color 0.2s;
        }
        .section:hover { border-color:rgba(233,30,140,0.22); }
        .section-header {
          display:flex; align-items:center; gap:12px; margin-bottom:18px;
          padding-bottom:14px; border-bottom:1px solid var(--g6);
        }
        .section-icon {
          width:40px; height:40px; border-radius:11px; flex-shrink:0;
          background:rgba(233,30,140,0.1); border:1px solid rgba(233,30,140,0.22);
          display:flex; align-items:center; justify-content:center; font-size:1.1rem;
        }
        .section-title {
          font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:1.5px; color:var(--w);
        }
        .subsection { margin-bottom:14px; }
        .subsection:last-child { margin-bottom:0; }
        .subtitle {
          font-size:0.78rem; font-weight:700; color:var(--fb);
          letter-spacing:0.5px; margin-bottom:6px;
        }
        .body-text { font-size:0.84rem; color:var(--g3); line-height:1.8; }

        /* FOOTER */
        .page-footer {
          text-align:center; padding:24px 5%; border-top:1px solid var(--g6);
          font-size:0.78rem; color:var(--g4); line-height:1.7;
        }
        .page-footer strong { color:var(--fb); }

        @media(max-width:720px) { .sidebar{display:none;} .layout{padding:28px 5% 48px;} }
      `}</style>

      <div className="page">
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
          <div className="hero-badge">🔒 Privacy Document</div>
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-sub">
            We respect your privacy. This policy explains what data SpeedMock collects, how we use it, and how we protect it.
          </p>
          <div className="hero-meta">
            <span>📅 Effective: June 2026</span>
            <span>🔄 Last Updated: June 2026</span>
            <span>🌐 Applicable: India</span>
          </div>
        </div>

        <div className="layout">

          {/* SIDEBAR */}
          <nav className="sidebar">
            <div className="sidebar-title">Sections</div>
            {sections.map((s, i) => (
              <button key={i} className="sidebar-link"
                onClick={() => document.getElementById(`pp-${i}`)?.scrollIntoView({ behavior:"smooth", block:"start" })}>
                <span className="sidebar-link-icon">{s.icon}</span>
                {s.title}
              </button>
            ))}
          </nav>

          {/* CONTENT */}
          <div className="content">
            {sections.map((s, i) => (
              <div key={i} id={`pp-${i}`} className="section" style={{ animationDelay:`${i*0.05}s` }}>
                <div className="section-header">
                  <div className="section-icon">{s.icon}</div>
                  <div className="section-title">{s.title}</div>
                </div>
                {s.content.map((c, j) => (
                  <div key={j} className="subsection">
                    <div className="subtitle">{c.subtitle}</div>
                    <div className="body-text">{c.body}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="page-footer">
          <strong>SpeedMock</strong> — Your Sarkari Exam Partner<br />
          Questions? Contact us at <strong>support@speedmock.in</strong>
        </div>
      </div>
    </>
  );
}