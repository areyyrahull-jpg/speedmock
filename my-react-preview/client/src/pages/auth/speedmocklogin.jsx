import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SpeedMockLogin() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ← use the context's login, not authService directly

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const exams = [
    { group: "SSC", icon: "🏛️", items: ["CGL", "CPO", "CHSL", "GD", "MTS"] },
    { group: "Railway", icon: "🚂", items: ["NTPC","Group D"] },
    { group: "Typing", icon: "⌨️", items: ["English", "Hindi", "Speed Test"] },
  ];

  const perks = [
    { icon: "📄", title: "2 Free PYQ Mocks", desc: "On signup — no card needed" },
    { icon: "⏱️", title: "3-Day Free Trial", desc: "Chapter-wise question practice" },
    { icon: "📊", title: "Deep Analytics", desc: "Track your performance & rank" },
    { icon: "💸", title: "Starting ₹30 only", desc: "Affordable plans for every aspirant" },
  ];

  const handleLogin = async () => {
    if (phone.length < 10) { setErr("Enter a valid 10-digit phone number"); return; }
    if (!pass) { setErr("Password is required"); return; }
    
    setErr(""); 
    setLoading(true);
    
    try {
      // ← was: const result = await authService.login(phone, pass);
      // This bypassed AuthContext entirely — localStorage got the token,
      // but `isAuthenticated`/`user` in the context never updated, so
      // Dashboard's auth guard saw stale state and bounced you back.
      const result = await login(phone, pass);
      
      if (remember) {
        localStorage.setItem("speedmock_remember_phone", phone);
      } else {
        localStorage.removeItem("speedmock_remember_phone");
      }
      
      // Admins go directly to the admin panel, regular users to dashboard
      navigate(result?.user?.is_admin ? "/admin" : "/dashboard");
    } catch (error) {
      setErr(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --f: #e91e8c; --fb: #ff3aaa; --fd: #b5005f;
          --glow: rgba(233,30,140,0.3);
          --g9: #0e0e12; --g8: #18181f; --g75: #1e1e28;
          --g7: #252532; --g6: #32323f; --g4: #7a7a90;
          --g3: #9a9ab0; --g2: #c8c8d8; --w: #ffffff;
        }
        body { background: var(--g9); font-family: 'Outfit', sans-serif; min-height: 100vh; }

        .page {
          min-height: 100vh; display: flex; align-items: stretch;
          background: var(--g9);
        }

        /* ══ LEFT SIDE CARD ══════════════════════════════════════ */
        .side-card {
          width: 420px; flex-shrink: 0;
          background: linear-gradient(160deg, #140a10 0%, #1c0c18 40%, #120810 100%);
          border-right: 1px solid rgba(233,30,140,0.18);
          display: flex; flex-direction: column;
          padding: 48px 36px; position: relative; overflow: hidden;
        }
        /* grid overlay */
        .side-card::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(233,30,140,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,30,140,0.055) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        /* glow blob */
        .side-card::after {
          content: ''; position: absolute; pointer-events: none;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(233,30,140,0.18) 0%, transparent 68%);
          top: -100px; left: -80px;
        }

        /* Logo */
        .sc-logo {
          position: relative; z-index: 1;
          font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 6px;
          background: linear-gradient(135deg, var(--fb) 0%, #ffaadd 45%, var(--fd) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(233,30,140,0.55));
          line-height: 1;
        }
        .sc-tagline {
          position: relative; z-index: 1;
          font-size: 0.66rem; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: var(--g4); margin-top: 5px; margin-bottom: 32px;
        }

        /* Divider */
        .sc-divider {
          position: relative; z-index: 1;
          height: 1px; background: linear-gradient(90deg, var(--f), rgba(233,30,140,0.1));
          margin-bottom: 26px;
        }

        /* Exams section */
        .sc-section-title {
          position: relative; z-index: 1;
          font-size: 0.62rem; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--f); margin-bottom: 14px;
        }
        .sc-exam-groups {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;
        }
        .sc-exam-group {
          background: rgba(233,30,140,0.05);
          border: 1px solid rgba(233,30,140,0.14);
          border-radius: 11px; padding: 11px 14px;
          display: flex; align-items: center; gap: 12px;
          transition: background 0.2s, border-color 0.2s;
        }
        .sc-exam-group:hover { background: rgba(233,30,140,0.1); border-color: rgba(233,30,140,0.3); }
        .sc-exam-icon { font-size: 1.3rem; flex-shrink: 0; }
        .sc-exam-group-name {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--fb); margin-bottom: 4px;
        }
        .sc-exam-chips { display: flex; gap: 5px; flex-wrap: wrap; }
        .sc-chip {
          background: rgba(233,30,140,0.08); border: 1px solid rgba(233,30,140,0.2);
          border-radius: 5px; padding: 2px 8px;
          font-size: 0.68rem; font-weight: 600; color: var(--g2); letter-spacing: 0.3px;
        }

        /* Perks */
        .sc-perks {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px;
        }
        .sc-perk {
          display: flex; align-items: center; gap: 12px;
        }
        .sc-perk-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: rgba(233,30,140,0.12); border: 1px solid rgba(233,30,140,0.25);
          display: flex; align-items: center; justify-content: center; font-size: 1rem;
          transition: background 0.2s;
        }
        .sc-perk:hover .sc-perk-icon { background: rgba(233,30,140,0.22); }
        .sc-perk-title { font-size: 0.83rem; font-weight: 700; color: var(--w); }
        .sc-perk-desc  { font-size: 0.72rem; color: var(--g4); margin-top: 1px; }

        /* Bottom badge */
        .sc-badge {
          position: relative; z-index: 1; margin-top: auto;
          background: rgba(233,30,140,0.08); border: 1px solid rgba(233,30,140,0.2);
          border-radius: 12px; padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .sc-badge-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: var(--fb); box-shadow: 0 0 8px var(--fb);
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 5px var(--fb);transform:scale(1);}50%{box-shadow:0 0 14px var(--fb);transform:scale(1.35);} }
        .sc-badge-text { font-size: 0.78rem; color: var(--g2); line-height: 1.45; }
        .sc-badge-text strong { color: var(--fb); }

        /* ══ RIGHT FORM AREA ══════════════════════════════════════ */
        .form-area {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 48px 40px;
          background: radial-gradient(ellipse 70% 60% at 60% 20%, rgba(233,30,140,0.07) 0%, transparent 65%),
                      var(--g9);
          position: relative;
        }
        .form-area::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(233,30,140,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,30,140,0.022) 1px, transparent 1px);
          background-size: 54px 54px;
        }

        .form-box {
          width: 100%; max-width: 400px; position: relative; z-index: 1;
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }

        .form-greeting {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--f); margin-bottom: 8px;
        }
        .form-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; letter-spacing: 2px;
          color: var(--w); line-height: 1; margin-bottom: 8px;
        }
        .form-sub { font-size: 0.84rem; color: var(--g4); margin-bottom: 30px; line-height: 1.6; }

        /* Fields */
        .field { margin-bottom: 16px; }
        .field-label {
          display: block; font-size: 0.68rem; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--g4); margin-bottom: 7px;
        }
        .field-inner {
          display: flex; align-items: center;
          background: var(--g8); border: 1.5px solid var(--g6);
          border-radius: 12px; overflow: hidden; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .field-inner:focus-within {
          border-color: var(--f); box-shadow: 0 0 0 3px rgba(233,30,140,0.1);
        }
        .field-prefix {
          padding: 0 11px 0 14px; font-size: 0.88rem; font-weight: 600;
          color: var(--g3); border-right: 1px solid var(--g6); white-space: nowrap; line-height: 50px;
        }
        .field-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--w); font-family: 'Outfit', sans-serif;
          font-size: 0.94rem; font-weight: 500; padding: 0 14px; height: 50px;
        }
        .field-input::placeholder { color: var(--g6); }

        /* Pass toggle */
        .pass-wrap { position: relative; }
        .pass-eye {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--g4);
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; transition: color 0.18s;
        }
        .pass-eye:hover { color: var(--fb); }

        /* Row: forgot */
        .row-forgot {
          display: flex; justify-content: flex-end; margin: -4px 0 16px;
        }
        .forgot-btn {
          background: none; border: none; cursor: pointer; color: var(--g4);
          font-family: 'Outfit', sans-serif; font-size: 0.77rem; font-weight: 500;
          transition: color 0.18s; padding: 0;
        }
        .forgot-btn:hover { color: var(--fb); }

        /* Remember me */
        .remember {
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 22px; cursor: pointer; user-select: none;
        }
        .rbox {
          width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0; margin-top: 2px;
          background: var(--g75); border: 1.5px solid var(--g6);
          display: flex; align-items: center; justify-content: center; transition: all 0.18s;
        }
        .rbox.on { background: var(--f); border-color: var(--f); box-shadow: 0 0 8px var(--glow); }
        .rmark { color: #fff; font-size: 0.62rem; font-weight: 800; }
        .rlabel { font-size: 0.82rem; color: var(--g3); font-weight: 500; }
        .rhint  { font-size: 0.71rem; color: var(--g6); margin-top: 2px; line-height: 1.4; }

        /* Error */
        .err {
          background: rgba(255,55,55,0.08); border: 1px solid rgba(255,55,55,0.2);
          border-radius: 10px; padding: 9px 13px; font-size: 0.78rem; color: #ff7575;
          margin-bottom: 14px; display: flex; align-items: center; gap: 7px;
        }

        /* Submit */
        .sub-btn {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, var(--fb), var(--fd));
          color: #fff; border: none; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.22s;
          box-shadow: 0 4px 24px rgba(233,30,140,0.36);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .sub-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(233,30,140,0.52); }
        .sub-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spin { display:inline-block; width:19px; height:19px; border-radius:50%;
          border:2.5px solid rgba(255,255,255,0.25); border-top-color:#fff;
          animation:rot 0.7s linear infinite; }
        @keyframes rot { to{transform:rotate(360deg);} }

        /* Switch */
        .switch-row {
          text-align: center; margin-top: 22px; font-size: 0.84rem; color: var(--g4);
        }
        .switch-btn {
          background: none; border: none; cursor: pointer; color: var(--fb);
          font-weight: 700; font-family: 'Outfit', sans-serif; font-size: 0.84rem;
          margin-left: 4px; transition: color 0.18s;
        }
        .switch-btn:hover { text-decoration: underline; }

        /* Divider line */
        .form-divider {
          display: flex; align-items: center; gap: 12px; margin: 22px 0;
        }
        .fdline { flex: 1; height: 1px; background: var(--g6); }
        .fdtext { font-size: 0.68rem; color: var(--g6); font-weight: 600; letter-spacing: 1px; }

        @media (max-width: 820px) {
          .side-card { display: none; }
          .form-area { padding: 40px 24px; }
        }

        @media (max-width: 560px) {
          .form-area { padding: 28px 16px 40px; }
          .form-box { max-width: 100%; }
          .form-title { font-size: 2.2rem; }
          .form-sub { font-size: 0.8rem; }
          .field-input { font-size: 0.88rem; }
          .field-prefix { font-size: 0.8rem; }
        }

        @media (max-width: 360px) {
          .form-title { font-size: 2rem; }
          .form-greeting { letter-spacing: 1.4px; }
          .field-prefix { padding: 0 8px 0 10px; }
          .switch-row { font-size: 0.76rem; }
          .sub-btn { font-size: 0.9rem; }
        }
      `}</style>

      <div className="page">
        {/* ── LEFT SIDE CARD ── */}
        <div className="side-card">
          <div className="sc-logo">SpeedMock</div>
          <div className="sc-tagline">Your Sarkari Exam Partner</div>

          <div className="sc-divider" />

          {/* Exams covered */}
          <div className="sc-section-title">Exams We Cover</div>
          <div className="sc-exam-groups">
            {exams.map(g => (
              <div className="sc-exam-group" key={g.group}>
                <span className="sc-exam-icon">{g.icon}</span>
                <div>
                  <div className="sc-exam-group-name">{g.group}</div>
                  <div className="sc-exam-chips">
                    {g.items.map(item => <span className="sc-chip" key={item}>{item}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sc-divider" />

          {/* Perks */}
          <div className="sc-section-title" style={{marginTop:"18px"}}>Why SpeedMock?</div>
          <div className="sc-perks">
            {perks.map(p => (
              <div className="sc-perk" key={p.title}>
                <div className="sc-perk-icon">{p.icon}</div>
                <div>
                  <div className="sc-perk-title">{p.title}</div>
                  <div className="sc-perk-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live badge */}
          <div className="sc-badge">
            <span className="sc-badge-dot" />
            <div className="sc-badge-text">
              <strong>50,000+ students</strong> are already cracking SSC & Railway exams with SpeedMock
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="form-area">
          <div className="form-box">
            <div className="form-greeting">Welcome Back 👋</div>
            <h1 className="form-title">Login to<br />SpeedMock</h1>
            <p className="form-sub">Continue your exam prep journey right where you left off.</p>

            {err && <div className="err">⚠ {err}</div>}

            <div className="field">
              <label className="field-label">Phone Number</label>
              <div className="field-inner">
                <span className="field-prefix">+91</span>
                <input className="field-input" type="tel" placeholder="10-digit mobile number"
                  value={phone} maxLength={10}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g,"")); setErr(""); }} />
              </div>
            </div>

            <div className="field pass-wrap">
              <label className="field-label">Password</label>
              <div className="field-inner">
                <input className="field-input" type={showPass ? "text" : "password"}
                  placeholder="Enter your password" value={pass} style={{paddingRight:"52px"}}
                  onChange={e => { setPass(e.target.value); setErr(""); }} />
                <button className="pass-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="row-forgot">
              <button className="forgot-btn" onClick={() => navigate("/forgotpassword")}>Forgot password?</button>
            </div>

            <div className="remember" onClick={() => setRemember(!remember)}>
              <div className={`rbox${remember ? " on" : ""}`}>
                {remember && <span className="rmark">✓</span>}
              </div>
              <div>
                <div className="rlabel">Remember me on this device</div>
                <div className="rhint">Stay logged in — skip login on your next visit</div>
              </div>
            </div>

            <button className="sub-btn" onClick={handleLogin} disabled={loading}>
              {loading ? <span className="spin" /> : "Login to SpeedMock →"}
            </button>

            <div className="switch-row">
              Don't have an account?
              <button className="switch-btn" onClick={() => navigate("/signup")}>
                Sign up free
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
