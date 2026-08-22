import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoComponent from "../components/common/logo";
import { useTheme } from "../context/ThemeContext";
function GoBackButton() {
  const navigate = useNavigate();


  return (
    <button onClick={() => navigate(-1)} // ⚡ 3. Update state when the mouse enters or leaves

      >
      ← Go Back
    </button>
  );
}



export default function LegalTerms() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using SpeedMock ("Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including students, subscribers, and visitors.`,
    },
    {
      title: "2. Description of Service",
      content: `SpeedMock is an online exam preparation platform designed for students preparing for SSC (CGL, CPO, CHSL, GD, MTS) and Railway (NTPC, ALP, Group D, JE) examinations. The platform provides access to Previous Year Question (PYQ) papers, chapter-wise practice sets, mock tests, and typing test modules for English and Hindi typing examinations.`,
    },
    {
      title: "3. User Eligibility",
      content: `You must be at least 13 years of age to use SpeedMock. By registering on the platform, you confirm that all information provided during registration is accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
    },
    {
      title: "4. Subscription Plans & Payments",
      content: `SpeedMock offers three subscription plans:\n\n• Sprint — ₹30 for 30 days (1 device)\n• Surge — ₹70 for 90 days (1 devices)\n• Storm — ₹130 for 180 days (2 devices)\n\nAll payments are processed securely. Subscription fees are non-transferable and are specific to the registered account. Access is granted only after successful payment confirmation. SpeedMock reserves the right to modify pricing with prior notice of at least 7 days.`,
    },
    {
      title: "5. Device Usage Policy",
      content: `Each subscription plan permits usage on a fixed number of devices simultaneously. Sprint allows 1 device, Surge allows 1 devices, and Storm allows 2 devices. Sharing of account credentials with other individuals is strictly prohibited and may result in immediate account suspension without refund. SpeedMock tracks device usage to enforce this policy.`,
    },
    {
      title: "6. Free Trial",
      content: `New users are eligible for a one-time free trial which includes access to 2 full PYQ mock test papers and 3 days of chapter-wise question practice. The free trial is available only once per phone number and cannot be redeemed multiple times using different accounts on the same device.`,
    },
    {
      title: "7. Intellectual Property",
      content: `All content on SpeedMock including question banks, mock tests, study material, typing passages, interface design, logos, and branding are the intellectual property of SpeedMock. You may not copy, reproduce, distribute, publish, or create derivative works from any content on this platform without prior written permission. PYQ papers are curated from publicly available government examination records and are used strictly for educational purposes.`,
    },
    {
      title: "8. Prohibited Conduct",
      content: `You agree not to:\n\n• Share, sell, or redistribute your account credentials\n• Attempt to reverse engineer, hack, or exploit any part of the platform\n• Use automated tools or bots to access content\n• Upload or distribute harmful, abusive, or illegal content\n• Misrepresent your identity during registration\n• Use the platform for any purpose other than personal exam preparation\n\nViolation of these terms may result in immediate account termination.`,
    },
    {
      title: "9. Accuracy of Content",
      content: `SpeedMock makes every effort to ensure that all questions, answers, and explanations are accurate and up to date. However, we do not guarantee that the content is completely error-free or that it covers the entire syllabus of any specific examination. Users are advised to cross-check important information with official government sources. SpeedMock shall not be held liable for any discrepancy between our content and the actual examination.`,
    },
    {
      title: "10. Platform Availability",
      content: `SpeedMock aims to provide uninterrupted access to the platform. However, we do not guarantee 100% uptime and shall not be liable for any loss or inconvenience caused by scheduled maintenance, server downtime, or technical issues beyond our control. We will make reasonable efforts to notify users in advance of planned maintenance.`,
    },
    {
      title: "11. Account Termination",
      content: `SpeedMock reserves the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or uses the platform in a manner harmful to other users. In cases of legitimate termination by the user, refund eligibility will be governed by our Refund Policy. Terminated accounts due to policy violations will not be eligible for any refund.`,
    },
    {
      title: "12. Privacy & Data",
      content: `By using SpeedMock, you consent to the collection and use of your personal information as described in our Privacy Policy. We collect your name, phone number, email (optional), and usage data to provide and improve our services. We do not sell your personal data to third parties. Your data is stored securely and used only for platform operations and communication purposes.`,
    },
    {
      title: "13. Limitation of Liability",
      content: `SpeedMock shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the platform. Our total liability to any user shall not exceed the amount paid by that user in the last 30 days. SpeedMock is not responsible for examination results, selection outcomes, or any decisions made based on performance on our platform.`,
    },
    {
      title: "14. Governing Law",
      content: `These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or the use of the platform shall be subject to the exclusive jurisdiction of the courts located in India. Users agree to attempt resolution through mutual discussion before initiating legal proceedings.`,
    },
    {
      title: "15. Changes to Terms",
      content: `SpeedMock reserves the right to update or modify these terms at any time. Users will be notified of significant changes via registered phone number or email. Continued use of the platform after changes are posted constitutes acceptance of the revised terms. We recommend reviewing these terms periodically.`,
    },
    {
      title: "16. Contact Us",
      content: `For any questions or concerns regarding these Terms of Service, please contact us at:\n\nSpeedMock Support\nEmail: support@speedmock.in\nPhone: Available on the platform\nResponse Time: Within 2 business days`,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --f: #e91e8c; --fb: #ff3aaa; --fd: #b5005f;
          --g9: #0e0e12; --g8: #18181f; --g75: #1e1e28;
          --g6: #32323f; --g4: #7a7a90; --g3: #9a9ab0; --g2: #c8c8d8; --w: #ffffff;
        }
        body { background: var(--g9); font-family: 'Outfit', sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #18181f; }
        ::-webkit-scrollbar-thumb { background: #e91e8c44; border-radius: 3px; }

        .page {
          min-height: 100vh; background: var(--g9);
          background-image: linear-gradient(rgba(233,30,140,0.02) 1px,transparent 1px),
            linear-gradient(90deg,rgba(233,30,140,0.02) 1px,transparent 1px);
          background-size: 52px 52px;
        }

        /* HERO */
        .hero {
          background: linear-gradient(180deg,rgba(233,30,140,0.1) 0%,transparent 100%);
          border-bottom: 1px solid rgba(233,30,140,0.12);
          padding: 52px 5% 40px; text-align: center;
        }
          .container {
  display: flex;
  justify-content: flex-start; /* Aligns the button to the left side */
}
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(233,30,140,0.08); border: 1px solid rgba(233,30,140,0.22);
          border-radius: 50px; padding: 5px 16px; margin-bottom: 18px;
          font-size: 0.68rem; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: var(--fb);
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.4rem,5vw,4rem);
          letter-spacing: 3px; color: var(--w); line-height: 1; margin-bottom: 12px;
        }
        .hero-sub { font-size: 0.86rem; color: var(--g4); line-height: 1.7; max-width: 520px; margin: 0 auto 20px; }
        .hero-meta {
          display: inline-flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: center;
          font-size: 0.72rem; color: var(--g4); font-weight: 500;
        }
        .hero-meta span { display: flex; align-items: center; gap: 5px; }

        /* LAYOUT */
        .layout { display: flex; gap: 32px; padding: 40px 5% 60px; max-width: 1100px; margin: 0 auto; }

        /* SIDEBAR */
        .sidebar {
          width: 240px; flex-shrink: 0; position: sticky; top: 24px;
          height: fit-content; display: flex; flex-direction: column; gap: 4px;
        }
        .sidebar-title {
          font-size: 0.62rem; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--f); margin-bottom: 10px; padding: 0 8px;
        }
        .sidebar-link {
          display: block; padding: 8px 12px; border-radius: 9px;
          font-size: 0.78rem; font-weight: 500; color: var(--g4);
          text-decoration: none; cursor: pointer; transition: all 0.18s;
          background: none; border: none; text-align: left; font-family: 'Outfit', sans-serif;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-link:hover { background: rgba(233,30,140,0.08); color: var(--g2); }
        .sidebar-link.active { background: rgba(233,30,140,0.1); color: var(--fb); font-weight: 600; }

        /* CONTENT */
        .content { flex: 1; min-width: 0; }
        .section {
          background: var(--g8); border: 1px solid var(--g6);
          border-radius: 16px; padding: 24px 26px; margin-bottom: 14px;
          animation: fadeUp 0.4s ease both; scroll-margin-top: 24px;
          transition: border-color 0.2s;
        }
        .section:hover { border-color: rgba(233,30,140,0.25); }
        .section-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 0.75rem;
          letter-spacing: 2px; color: var(--f); margin-bottom: 6px;
          text-transform: uppercase;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem;
          letter-spacing: 1.5px; color: var(--w); margin-bottom: 12px;
        }
        .section-body {
          font-size: 0.84rem; color: var(--g3); line-height: 1.85;
          white-space: pre-line;
        }
        .section-body strong { color: var(--g2); font-weight: 600; }

        /* PLAN TABLE */
        .plan-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .plan-table th {
          font-size: 0.65rem; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: var(--f); padding: 8px 12px;
          border-bottom: 1px solid var(--g6); text-align: left;
        }
        .plan-table td {
          font-size: 0.82rem; color: var(--g3); padding: 10px 12px;
          border-bottom: 1px solid #252530;
        }
        .plan-table tr:last-child td { border-bottom: none; }
        .plan-table tr:hover td { background: rgba(233,30,140,0.03); }

        /* FOOTER */
        .page-footer {
          text-align: center; padding: 28px 5%;
          border-top: 1px solid var(--g6);
          font-size: 0.78rem; color: var(--g4); line-height: 1.7;
        }
        .page-footer strong { color: var(--fb); }

        @media (max-width: 760px) {
          .sidebar { display: none; }
          .layout { padding: 28px 5% 48px; }
        }
      `}</style>

      <div className="page">

        {/* HERO */}
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
          <div className="hero-badge">📄 Legal Document</div>
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-sub">
            Please read these terms carefully before using SpeedMock. By accessing our platform you agree to be bound by these terms.
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
                onClick={() => document.getElementById(`section-${i}`)?.scrollIntoView({ behavior:"smooth", block:"start" })}>
                {s.title}
              </button>
            ))}
          </nav>

          {/* CONTENT */}
          <div className="content">
            {sections.map((s, i) => (
              <div key={i} id={`section-${i}`} className="section" style={{ animationDelay:`${i*0.04}s` }}>
                <div className="section-num">{s.title.split(".")[0]}</div>
                <div className="section-title">{s.title.replace(/^\d+\.\s/, "")}</div>

                {/* Special table for pricing section */}
                {i === 3 ? (
                  <>
                    <p className="section-body">SpeedMock offers three subscription plans designed to be affordable for every aspirant:</p>
                    <table className="plan-table">
                      <thead>
                        <tr>
                          <th>Plan</th>
                          <th>Duration</th>
                          <th>Price</th>
                          <th>Devices</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Sprint", "30 Days (1 Month)", "₹30", "1 Device"],
                          ["Surge",  "90 Days (3 Months)", "₹70", "1 Devices"],
                          ["Storm",  "180 Days (6 Months)", "₹130", "2 Devices"],
                        ].map(r => (
                          <tr key={r[0]}>
                            {r.map((c, ci) => <td key={ci} style={ci===0?{fontWeight:700,color:"#fff"}:{}}>{c}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="section-body" style={{marginTop:12}}>
                      All payments are processed securely. Subscription fees are non-transferable and specific to the registered account. SpeedMock reserves the right to modify pricing with prior notice of at least 7 days.
                    </p>
                  </>
                ) : (
                  <div className="section-body">{s.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="page-footer">
          <strong>SpeedMock</strong> — Your Sarkari Exam Partner<br/>
          These terms were last updated in June 2026. For questions, contact <strong>support@speedmock.in</strong>
        </div>
      </div>
    </>
  );
}