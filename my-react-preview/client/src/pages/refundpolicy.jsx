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

export default function RefunPolicy() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const scenarios = [
    {
      status: "eligible",
      title: "Payment Deducted, No Access Granted",
      desc: "If your payment was successfully deducted but you did not receive access to the platform within 24 hours, you are fully eligible for a refund.",
      resolution: "Full refund within 5–7 business days",
    },
    {
      status: "eligible",
      title: "Duplicate Payment / Double Charge",
      desc: "If you were charged twice for the same subscription due to a technical error, the duplicate amount will be refunded.",
      resolution: "Full refund of duplicate amount within 5–7 business days",
    },
    {
      status: "eligible",
      title: "Technical Error During Payment",
      desc: "If a technical failure on our payment gateway caused an incorrect charge, you are eligible for a full refund.",
      resolution: "Full refund after verification within 7 business days",
    },
    {
      status: "partial",
      title: "Platform Downtime Exceeding 72 Hours",
      desc: "If SpeedMock experiences unplanned downtime exceeding 72 continuous hours during your active subscription, you may be eligible for a proportional extension or partial refund.",
      resolution: "Subscription extension or partial refund at our discretion",
    },
    {
      status: "ineligible",
      title: "Change of Mind After Purchase",
      desc: "Refunds are not provided if you simply change your mind after purchasing a subscription and have accessed the platform.",
      resolution: "Not eligible for refund",
    },
    {
      status: "ineligible",
      title: "Account Suspended for Policy Violation",
      desc: "Accounts suspended due to sharing credentials, fraudulent activity, or violation of our Terms of Service are not eligible for any refund.",
      resolution: "Not eligible for refund",
    },
    {
      status: "ineligible",
      title: "Partial Use of Subscription",
      desc: "Refunds are not provided for unused days of a subscription if the platform was accessible and you chose not to use it.",
      resolution: "Not eligible for refund",
    },
    {
      status: "ineligible",
      title: "Exam Not Taken or Not Cleared",
      desc: "SpeedMock is a preparation platform. We cannot guarantee exam results. Not clearing an examination is not grounds for a refund.",
      resolution: "Not eligible for refund",
    },
  ];

  const steps = [
    { n:"01", icon:"📧", title:"Contact Support",   desc:"Email us at support@speedmock.in with your registered phone number, transaction ID, and a brief description of the issue." },
    { n:"02", icon:"🔍", title:"Verification",      desc:"Our team will verify your claim within 2 business days. We may ask for screenshots or additional information to process your request." },
    { n:"03", icon:"✅", title:"Approval",           desc:"If your refund request meets our eligibility criteria, it will be approved and you will receive a confirmation." },
    { n:"04", icon:"💰", title:"Refund Processed",  desc:"The refund will be credited to your original payment method within 5–7 business days after approval. UPI and wallet refunds may be faster." },
  ];

  const statusStyle = {
    eligible:   { bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.25)",  color:"#22c55e",  label:"✓ Eligible",     dot:"#22c55e" },
    partial:    { bg:"rgba(255,167,38,0.08)", border:"rgba(255,167,38,0.25)", color:"#ffa726",  label:"⚠ Case by Case", dot:"#ffa726" },
    ineligible: { bg:"rgba(239,68,68,0.08)",  border:"rgba(239,68,68,0.25)",  color:"#ef4444",  label:"✗ Not Eligible", dot:"#ef4444" },
  };

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
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
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
          .container {
  display: flex;
  justify-content: flex-start; /* Aligns the button to the left side */
}

        .hero-sub { font-size: 0.86rem; color: var(--g4); line-height: 1.7; max-width: 500px; margin: 0 auto 20px; }
        .hero-meta {
          display: inline-flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: center;
          font-size: 0.72rem; color: var(--g4); font-weight: 500;
        }
        .hero-meta span { display: flex; align-items: center; gap: 5px; }

        /* WRAP */
        .wrap { max-width: 820px; margin: 0 auto; padding: 44px 5% 60px; }

        /* SECTION TITLE */
        .sec-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem;
          letter-spacing: 2.5px; color: var(--w); margin-bottom: 6px;
        }
        .sec-sub { font-size: 0.8rem; color: var(--g4); margin-bottom: 20px; line-height: 1.6; }
        .sec-divider { height: 2px; border-radius: 2px; width: 60px;
          background: linear-gradient(90deg,var(--fb),var(--fd)); margin-bottom: 24px; }

        /* SUMMARY CARDS */
        .summary-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 40px; }
        @media(max-width:600px){ .summary-cards { grid-template-columns: 1fr; } }
        .sum-card {
          border-radius: 14px; padding: 18px 16px; text-align: center;
          animation: fadeUp 0.4s ease both;
        }
        .sum-icon { font-size: 1.8rem; margin-bottom: 10px; }
        .sum-label { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 1.5px; color: var(--w); margin-bottom: 5px; }
        .sum-desc { font-size: 0.73rem; color: var(--g4); line-height: 1.5; }

        /* SCENARIO CARDS */
        .scenarios { display: flex; flex-direction: column; gap: 12px; margin-bottom: 44px; }
        .scenario {
          border-radius: 14px; padding: 18px 20px;
          display: flex; align-items: flex-start; gap: 16px;
          animation: fadeUp 0.4s ease both;
          transition: transform 0.2s;
        }
        .scenario:hover { transform: translateX(4px); }
        .scenario-badge {
          border-radius: 50px; padding: 3px 11px; font-size: 0.6rem;
          font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
          white-space: nowrap; flex-shrink: 0; margin-top: 3px;
        }
        .scenario-title { font-size: 0.9rem; font-weight: 700; color: var(--w); margin-bottom: 5px; }
        .scenario-desc { font-size: 0.78rem; color: var(--g3); line-height: 1.6; margin-bottom: 8px; }
        .scenario-resolution {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 700; color: var(--g4);
          background: rgba(255,255,255,0.04); border-radius: 6px; padding: 4px 10px;
        }

        /* PROCESS */
        .steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 44px; position: relative; }
        .steps::before {
          content: ''; position: absolute; left: 24px; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg,var(--f),transparent);
        }
        .step {
          display: flex; align-items: flex-start; gap: 18px; padding: 0 0 24px 0;
          animation: fadeUp 0.4s ease both;
        }
        .step:last-child { padding-bottom: 0; }
        .step-circle {
          width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
          background: rgba(233,30,140,0.1); border: 2px solid rgba(233,30,140,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; position: relative; z-index: 1;
        }
        .step-num {
          font-family: 'Bebas Neue', sans-serif; font-size: 0.65rem;
          letter-spacing: 1px; color: var(--f); margin-bottom: 4px;
        }
        .step-title { font-size: 0.92rem; font-weight: 700; color: var(--w); margin-bottom: 5px; }
        .step-desc { font-size: 0.8rem; color: var(--g3); line-height: 1.65; }

        /* IMPORTANT BOX */
        .important-box {
          background: rgba(255,167,38,0.07); border: 1px solid rgba(255,167,38,0.25);
          border-radius: 14px; padding: 20px 20px; margin-bottom: 44px;
        }
        .ib-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 2px;
          color: #ffa726; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
        }
        .ib-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .ib-item { display: flex; align-items: flex-start; gap: 9px; font-size: 0.8rem; color: var(--g2); line-height: 1.6; }
        .ib-dot { width: 5px; height: 5px; border-radius: 50%; background: #ffa726; flex-shrink: 0; margin-top: 6px; }

        /* CONTACT */
        .contact-box {
          background: var(--g8); border: 1px solid rgba(233,30,140,0.2);
          border-radius: 16px; padding: 24px 22px; text-align: center;
          position: relative; overflow: hidden;
        }
        .contact-box::before {
          content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 2px;
          background: linear-gradient(90deg,transparent,var(--fb),var(--fd),transparent);
        }
        .contact-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 2px; color: var(--w); margin-bottom: 8px; }
        .contact-sub { font-size: 0.82rem; color: var(--g4); margin-bottom: 18px; line-height: 1.6; }
        .contact-email {
          display: inline-block; background: rgba(233,30,140,0.1);
          border: 1px solid rgba(233,30,140,0.3); border-radius: 10px;
          padding: 10px 22px; font-size: 0.88rem; font-weight: 700; color: var(--fb);
          text-decoration: none; margin-bottom: 10px;
        }
        .contact-note { font-size: 0.72rem; color: var(--g6); }

        /* PAGE FOOTER */
        .page-footer {
          text-align: center; padding: 24px 5%;
          border-top: 1px solid var(--g6);
          font-size: 0.78rem; color: var(--g4); line-height: 1.7;
        }
        .page-footer strong { color: var(--fb); }
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
          <div className="hero-badge">💰 Refund Policy</div>
          <h1 className="hero-title">Refund Policy</h1>
          <p className="hero-sub">
            We want every student to have a fair experience on SpeedMock. Here is everything you need to know about our refund policy.
          </p>
          <div className="hero-meta">
            <span>📅 Effective: June 2026</span>
            <span>🔄 Last Updated: June 2026</span>
            <span>⏱ Response: 2 Business Days</span>
          </div>
        </div>

        <div className="wrap">

          {/* SUMMARY */}
          <div className="sec-title">Quick Summary</div>
          <div className="sec-sub">Here is a quick overview of our refund approach before reading the detailed policy below.</div>
          <div className="sec-divider" />
          <div className="summary-cards">
            {[
              { icon:"✅", label:"Full Refund",    desc:"Available for payment errors, no access granted, or duplicate charges", color:"rgba(34,197,94,0.08)", border:"rgba(34,197,94,0.2)" },
              { icon:"⚠️", label:"Case by Case",   desc:"Platform downtime exceeding 72 hours may qualify for partial refund", color:"rgba(255,167,38,0.08)", border:"rgba(255,167,38,0.2)" },
              { icon:"🚫", label:"No Refund",      desc:"Change of mind, partial use, or policy violations are not eligible", color:"rgba(239,68,68,0.08)", border:"rgba(239,68,68,0.2)" },
            ].map((c,i)=>(
              <div key={i} className="sum-card" style={{background:c.color, border:`1px solid ${c.border}`, animationDelay:`${i*0.1}s`}}>
                <div className="sum-icon">{c.icon}</div>
                <div className="sum-label">{c.label}</div>
                <div className="sum-desc">{c.desc}</div>
              </div>
            ))}
          </div>

          {/* SCENARIOS */}
          <div className="sec-title">Refund Scenarios</div>
          <div className="sec-sub">Review each scenario to understand whether your situation qualifies for a refund.</div>
          <div className="sec-divider" />
          <div className="scenarios">
            {scenarios.map((s, i) => {
              const st = statusStyle[s.status];
              return (
                <div key={i} className="scenario"
                  style={{ background: st.bg, border: `1px solid ${st.border}`, animationDelay:`${i*0.05}s` }}>
                  <div className="scenario-badge"
                    style={{ background: st.color+"22", color: st.color, border: `1px solid ${st.color}44` }}>
                    {st.label}
                  </div>
                  <div>
                    <div className="scenario-title">{s.title}</div>
                    <div className="scenario-desc">{s.desc}</div>
                    <div className="scenario-resolution">
                      <span style={{width:6,height:6,borderRadius:"50%",background:st.color,flexShrink:0}}/>
                      {s.resolution}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PROCESS */}
          <div className="sec-title">Refund Process</div>
          <div className="sec-sub">Follow these steps to raise a refund request. We aim to resolve all requests within 7 business days.</div>
          <div className="sec-divider" />
          <div className="steps">
            {steps.map((s,i)=>(
              <div key={i} className="step" style={{animationDelay:`${i*0.1}s`}}>
                <div className="step-circle">{s.icon}</div>
                <div>
                  <div className="step-num">STEP {s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* IMPORTANT */}
          <div className="important-box">
            <div className="ib-title">⚠ Important Points</div>
            <ul className="ib-list">
              {[
                "Refund requests must be raised within 7 days of the issue occurring. Requests raised after this window may not be considered.",
                "All refunds are processed to the original payment method only. We do not issue refunds in the form of cash or alternate payment methods.",
                "SpeedMock does not guarantee exam selection or results. The platform is a preparation tool and refunds are not issued on the basis of examination outcomes.",
                "In case of a dispute, SpeedMock's decision after investigation shall be considered final.",
                "Free trial users are not eligible for any monetary refund as no payment is involved.",
                "Subscription plans are personal and non-transferable. Refunds are not issued if you want to transfer your subscription to another person.",
              ].map((p,i)=>(
                <li key={i} className="ib-item">
                  <span className="ib-dot"/>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="contact-box">
            <div className="contact-title">Need Help with a Refund?</div>
            <p className="contact-sub">
              Our support team is here to help. Reach out with your registered phone number and transaction ID and we will get back to you within 2 business days.
            </p>
            <a className="contact-email" href="mailto:support@speedmock.in">
              📧 support@speedmock.in
            </a>
            <div className="contact-note">
              Please include: Registered Phone Number · Transaction ID · Issue Description
            </div>
          </div>
        </div>

        {/* PAGE FOOTER */}
        <div className="page-footer">
          <strong>SpeedMock</strong> — Your Sarkari Exam Partner<br/>
          This Refund Policy was last updated in June 2026. Subject to change with prior notice.
        </div>
      </div>
    </>
  );
}