import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
/* ─── OTP STEP ───────────────────────────────────────────────────── */
function OtpStep({
  name,
  phone,
  email,
  password,
  referralCode,
  onBack,
  onSuccess,
  registerUser,
}){
  const [otp, setOtp] = useState(["","","","","",""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const change = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n); setErr("");
    if (val && i < 5) refs.current[i+1]?.focus();
  };

  const keydown = (i, e) => { if (e.key==="Backspace" && !otp[i] && i>0) refs.current[i-1]?.focus(); };

  const paste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    const n = [...otp]; p.split("").forEach((c,i)=>{ n[i]=c; }); setOtp(n);
    refs.current[Math.min(p.length,5)]?.focus();
  };

  const verify = async () => {

  const otpCode = otp.join("");

  if (otpCode.length < 6) {
    setErr("Enter the complete 6-digit OTP");
    return;
  }

  try {
    setLoading(true);

    // Goes through AuthContext -> authService.register(), which both
    // calls POST /api/auth/register AND stores the token/user under the
    // correct localStorage keys AND updates context state (user/isAuthenticated).
    await registerUser(name, phone, password, email, otpCode, referralCode);

    onSuccess();
  } catch (err) {
    
    setErr(err.message);
  } finally {
    setLoading(false);
  }
};

  const resend = async () => {
  try {
    

    const data = await authService.sendRegistrationOTP(phone);

    

    setTimer(30);
    setCanResend(false);
    setOtp(["","","","","",""]);
    setErr("");
    refs.current[0]?.focus();

  } catch (err) {
    
    setErr(err.message);
  }
};

  return (
    <div className="form-box" style={{animation:"fadeUp 0.45s ease both"}}>
      <button className="back-link" onClick={onBack}>← Back to Sign Up</button>
      <div className="form-greeting">Almost There! 🔐</div>
      <h1 className="form-title">Verify Your<br />Number</h1>
      <p className="form-sub">
        We sent a 6-digit OTP to <strong style={{color:"var(--fb)"}}>+91 {phone}</strong>
      </p>

      {err && <div className="err">⚠ {err}</div>}

      <div className="otp-boxes" onPaste={paste}>
        {otp.map((d, i) => (
          <input key={i} ref={el => refs.current[i]=el}
            className={`otp-box${d ? " otp-on" : ""}`}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => change(i, e.target.value)}
            onKeyDown={e => keydown(i, e)}
          />
        ))}
      </div>

      <div className="otp-dots">
        {otp.map((d,i) => <span key={i} className={`odot${d?" odot-on":""}`} />)}
      </div>

      <button className="sub-btn" onClick={verify} disabled={loading} style={{marginTop:"22px"}}>
        {loading ? <span className="spin" /> : "Verify & Create Account →"}
      </button>

      <div className="resend-row">
        {canResend
          ? <button className="resend-link" onClick={resend}  disabled={!canResend}>Resend OTP</button>
          : <span>Resend in <b>{timer}s</b></span>
        }
      </div>
      <p className="otp-note">Didn't receive it? Check SMS or try resending.</p>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function SpeedMockSignup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Don't auto-redirect — user may have deliberately navigated to signup
  // to create a new account. Show a banner instead so they can choose.
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  useEffect(() => {
    const token = authService.getAuthToken();
    if (token) setAlreadyLoggedIn(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      setReferralCode(refParam.trim());
    }
  }, []);

  const [step, setStep] = useState("signup"); // "signup" | "otp"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const exams = [
    { group: "SSC", icon: "🏛️", items: ["CGL", "CPO", "CHSL", "GD", "MTS"] },
    { group: "Railway", icon: "🚂", items: ["NTPC","Group D"] },
    { group: "Typing", icon: "⌨️", items: ["English", "Hindi", "Speed Test"] },
  ];

  const perks = [
    { icon: "📄", title: "2 Free PYQ Mocks", desc: "Real papers, timed & graded" },
    { icon: "⏱️", title: "3-Day Free Trial", desc: "Chapter practice, zero cost" },
    { icon: "📊", title: "Performance Analytics", desc: "Know your weak areas instantly" },
    { icon: "💸", title: "Plans from ₹30 only", desc: "Affordable for every aspirant" },
  ];

  const plans = [
    { label: "Sprint", duration: "1 Month", price: "₹30", devices: "1 Device" },
    { label: "Surge",  duration: "3 Months", price: "₹70", devices: "2 Devices" },
    { label: "Storm",  duration: "6 Months", price: "₹130", devices: "3 Devices" },
  ];

const submit = async () => {
  
  if (!name.trim()) {
    setErr("Full name is required");
    return;
  }

  if (!phone || phone.length !== 10) {
    setErr("Enter a valid 10-digit phone number");
    return;
  }

  if (!password || password.length < 6) {
    setErr("Password must be at least 6 characters");
    return;
  }

  setErr("");
  setLoading(true);

  try {
    await authService.sendRegistrationOTP(phone);

    // This was missing — without it, the UI never moves past the
    // signup form even though the OTP was sent successfully.
    setStep("otp");

  } catch (err) {
    setErr(err.message || "Something went wrong. Please try again.");
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

        /* ══ SIDE CARD ═══════════════════════════════════════════ */
        .side-card {
          width: 400px; flex-shrink: 0; overflow-y: auto;
          background: linear-gradient(160deg, #140a10 0%, #1c0c18 40%, #120810 100%);
          border-right: 1px solid rgba(233,30,140,0.18);
          display: flex; flex-direction: column;
          padding: 40px 32px; position: relative; overflow: hidden;
        }
        .side-card::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(233,30,140,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,30,140,0.055) 1px, transparent 1px);
          background-size: 38px 38px;
        }
        .side-card::after {
          content: ''; position: absolute; pointer-events: none;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(233,30,140,0.16) 0%, transparent 68%);
          top: -90px; left: -70px;
        }

        .sc-logo {
          position: relative; z-index: 1;
          font-family: 'Bebas Neue', sans-serif; font-size: 2.7rem; letter-spacing: 6px;
          background: linear-gradient(135deg, var(--fb) 0%, #ffaadd 45%, var(--fd) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 18px rgba(233,30,140,0.5));
          line-height: 1;
        }
        .sc-tagline {
          position: relative; z-index: 1;
          font-size: 0.64rem; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: var(--g4); margin-top: 4px; margin-bottom: 26px;
        }
        .sc-divider {
          position: relative; z-index: 1;
          height: 1px; background: linear-gradient(90deg, var(--f), rgba(233,30,140,0.08));
          margin-bottom: 22px;
        }
        .sc-section-title {
          position: relative; z-index: 1;
          font-size: 0.6rem; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--f); margin-bottom: 12px;
        }

        /* Exam groups */
        .sc-exam-groups { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
        .sc-exam-group {
          background: rgba(233,30,140,0.05); border: 1px solid rgba(233,30,140,0.13);
          border-radius: 10px; padding: 10px 12px;
          display: flex; align-items: center; gap: 10px;
          transition: background 0.2s, border-color 0.2s;
        }
        .sc-exam-group:hover { background: rgba(233,30,140,0.1); border-color: rgba(233,30,140,0.28); }
        .sc-exam-icon { font-size: 1.2rem; flex-shrink: 0; }
        .sc-exam-group-name { font-size: 0.65rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--fb); margin-bottom: 4px; }
        .sc-exam-chips { display: flex; gap: 4px; flex-wrap: wrap; }
        .sc-chip { background: rgba(233,30,140,0.08); border: 1px solid rgba(233,30,140,0.18); border-radius: 4px; padding: 2px 7px; font-size: 0.65rem; font-weight: 600; color: var(--g2); }

        /* Perks */
        .sc-perks { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 9px; margin-bottom: 22px; }
        .sc-perk { display: flex; align-items: center; gap: 11px; }
        .sc-perk-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(233,30,140,0.1); border: 1px solid rgba(233,30,140,0.22);
          display: flex; align-items: center; justify-content: center; font-size: 0.95rem;
        }
        .sc-perk-title { font-size: 0.8rem; font-weight: 700; color: var(--w); }
        .sc-perk-desc  { font-size: 0.69rem; color: var(--g4); margin-top: 1px; }

        /* Plans strip */
        .sc-plans { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 6px; margin-bottom: 22px; }
        .sc-plan {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(233,30,140,0.05); border: 1px solid rgba(233,30,140,0.13);
          border-radius: 9px; padding: 9px 12px;
        }
        .sc-plan-name { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 1.5px; color: var(--w); }
        .sc-plan-detail { font-size: 0.67rem; color: var(--g4); margin-top: 1px; }
        .sc-plan-price { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 1px; color: var(--fb); }

        /* Badge */
        .sc-badge {
          position: relative; z-index: 1; margin-top: auto;
          background: rgba(233,30,140,0.08); border: 1px solid rgba(233,30,140,0.2);
          border-radius: 11px; padding: 12px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .sc-badge-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
          background: var(--fb); box-shadow: 0 0 7px var(--fb);
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 5px var(--fb);transform:scale(1);}50%{box-shadow:0 0 13px var(--fb);transform:scale(1.35);} }
        .sc-badge-text { font-size: 0.75rem; color: var(--g2); line-height: 1.45; }
        .sc-badge-text strong { color: var(--fb); }

        /* ══ RIGHT FORM ══════════════════════════════════════════ */
        .form-area {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 48px 40px;
          background: radial-gradient(ellipse 70% 60% at 60% 20%, rgba(233,30,140,0.07) 0%, transparent 65%), var(--g9);
          position: relative;
        }
        .form-area::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(233,30,140,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,30,140,0.022) 1px, transparent 1px);
          background-size: 54px 54px;
        }

        .form-box { width: 100%; max-width: 400px; position: relative; z-index: 1; animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }

        .form-greeting { font-size: 0.72rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--f); margin-bottom: 8px; }
        .form-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; letter-spacing: 2px; color: var(--w); line-height: 1; margin-bottom: 8px; }
        .form-sub { font-size: 0.84rem; color: var(--g4); margin-bottom: 24px; line-height: 1.6; }

        /* Free trial banner */
        .trial-banner {
          background: rgba(233,30,140,0.07); border: 1px solid rgba(233,30,140,0.18);
          border-radius: 11px; padding: 11px 14px; margin-bottom: 20px; position: relative; overflow: hidden;
        }
        .trial-banner::before { content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, var(--fd), var(--fb)); }
        .trial-title { font-size: 0.62rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--fb); margin-bottom: 8px; }
        .trial-item { display: flex; align-items: center; gap: 7px; font-size: 0.76rem; color: var(--g2); margin-bottom: 4px; }
        .trial-item:last-child { margin-bottom: 0; }
        .tdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: var(--fb); box-shadow: 0 0 4px var(--fb); }

        /* Fields */
        .field { margin-bottom: 14px; }
        .field-label { display:block; font-size:0.68rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--g4); margin-bottom:6px; }
        .opt { color:var(--g6); font-weight:500; text-transform:none; letter-spacing:0; font-size:0.63rem; }
        .field-inner {
          display:flex; align-items:center;
          background:var(--g8); border:1.5px solid var(--g6);
          border-radius:12px; overflow:hidden; transition:border-color 0.18s, box-shadow 0.18s;
        }
        .field-inner:focus-within { border-color:var(--f); box-shadow:0 0 0 3px rgba(233,30,140,0.1); }
        .field-prefix { padding:0 11px 0 14px; font-size:0.88rem; font-weight:600; color:var(--g3); border-right:1px solid var(--g6); white-space:nowrap; line-height:50px; }
        .field-input {
          flex:1; background:transparent; border:none; outline:none;
          color:var(--w); font-family:'Outfit',sans-serif;
          font-size:0.92rem; font-weight:500; padding:0 14px; height:50px;
        }
        .field-input::placeholder { color:var(--g6); }

        /* Error */
        .err { background:rgba(255,55,55,0.08); border:1px solid rgba(255,55,55,0.2); border-radius:10px; padding:9px 13px; font-size:0.78rem; color:#ff7575; margin-bottom:12px; display:flex; align-items:center; gap:7px; }

        /* Submit */
        .sub-btn {
          width:100%; height:52px;
          background:linear-gradient(135deg, var(--fb), var(--fd));
          color:#fff; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-size:1rem; font-weight:700;
          cursor:pointer; transition:all 0.22s;
          box-shadow:0 4px 24px rgba(233,30,140,0.36);
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .sub-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 32px rgba(233,30,140,0.52); }
        .sub-btn:disabled { opacity:0.7; cursor:not-allowed; }

        .spin { display:inline-block; width:19px; height:19px; border-radius:50%;
          border:2.5px solid rgba(255,255,255,0.25); border-top-color:#fff;
          animation:rot 0.7s linear infinite; }
        @keyframes rot { to{transform:rotate(360deg);} }

        /* Switch */
        .switch-row { text-align:center; margin-top:20px; font-size:0.84rem; color:var(--g4); }
        .switch-btn { background:none; border:none; cursor:pointer; color:var(--fb); font-weight:700; font-family:'Outfit',sans-serif; font-size:0.84rem; margin-left:4px; transition:color 0.18s; }
        .switch-btn:hover { text-decoration:underline; }

        /* OTP */
        .back-link { background:none; border:none; cursor:pointer; color:var(--g4); font-family:'Outfit',sans-serif; font-size:0.78rem; font-weight:600; padding:0; margin-bottom:16px; display:block; transition:color 0.18s; }
        .back-link:hover { color:var(--fb); }
        .otp-boxes { display:flex; gap:9px; justify-content:center; margin-bottom:10px; }
        .otp-box { width:48px; height:56px; border-radius:12px; text-align:center; background:var(--g75); border:1.5px solid var(--g6); color:var(--w); font-family:'Bebas Neue',sans-serif; font-size:1.8rem; outline:none; transition:all 0.18s; caret-color:var(--fb); }
        .otp-box:focus { border-color:var(--fb); box-shadow:0 0 0 3px rgba(233,30,140,0.13); background:rgba(233,30,140,0.05); }
        .otp-on { border-color:var(--f); background:rgba(233,30,140,0.1); color:var(--fb); }
        .otp-dots { display:flex; gap:6px; justify-content:center; margin-bottom:4px; }
        .odot { width:6px; height:6px; border-radius:50%; background:var(--g6); transition:all 0.2s; }
        .odot-on { background:var(--fb); box-shadow:0 0 5px var(--fb); }
        .resend-row { text-align:center; margin-top:14px; font-size:0.8rem; color:var(--g4); }
        .resend-link { background:none; border:none; cursor:pointer; color:var(--fb); font-weight:700; font-family:'Outfit',sans-serif; font-size:0.8rem; transition:color 0.18s; }
        .resend-link:hover { text-decoration:underline; }
        .otp-note { text-align:center; font-size:0.71rem; color:var(--g6); margin-top:8px; }

        @media (max-width: 820px) {
          .side-card { display:none; }
          .form-area { padding:40px 24px; }
        }

        @media (max-width: 560px) {
          .form-area { padding: 28px 16px 40px; }
          .form-box { max-width: 100%; }
          .form-title { font-size: 2.2rem; }
          .form-sub { font-size: 0.8rem; }
          .field-input { font-size: 0.88rem; }
          .field-prefix { font-size: 0.8rem; }
          .otp-box { width: 42px; height: 50px; }
        }

        @media (max-width: 360px) {
          .form-title { font-size: 2rem; }
          .field-prefix { padding: 0 8px 0 10px; }
          .switch-row { font-size: 0.76rem; }
          .sub-btn { font-size: 0.9rem; }
          .otp-box { width: 34px; height: 46px; font-size: 1.5rem; }
        }
      `}</style>

      <div className="page">
        {/* ── SIDE CARD ── */}
        <div className="side-card">
          <div className="sc-logo">SpeedMock</div>
          <div className="sc-tagline">Your Sarkari Exam Partner</div>
          <div className="sc-divider" />

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

          <div className="sc-section-title" style={{marginTop:"4px"}}>Why SpeedMock?</div>
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

          <div className="sc-divider" />

          <div className="sc-section-title" style={{marginTop:"4px"}}>Our Plans</div>
          <div className="sc-plans">
            {plans.map(p => (
              <div className="sc-plan" key={p.label}>
                <div>
                  <div className="sc-plan-name">{p.label}</div>
                  <div className="sc-plan-detail">{p.duration} · {p.devices}</div>
                </div>
                <div className="sc-plan-price">{p.price}</div>
              </div>
            ))}
          </div>

          <div className="sc-badge">
            <span className="sc-badge-dot" />
            <div className="sc-badge-text">
              <strong>50,000+ aspirants</strong> are cracking SSC & Railway with SpeedMock
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="form-area">
          {alreadyLoggedIn && (
            <div style={{
              width:"100%", maxWidth:400,
              background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.25)",
              borderRadius:12, padding:"12px 16px", marginBottom:16,
              display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:12, flexWrap:"wrap",
            }}>
              <span style={{fontSize:13,color:"#f59e0b"}}>
                ⚠️ You're already logged in with another account.
              </span>
              <div style={{display:"flex",gap:8}}>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{padding:"6px 14px",borderRadius:8,border:"1px solid rgba(245,158,11,.3)",background:"rgba(245,158,11,.1)",color:"#f59e0b",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    authService.logout();
                    setAlreadyLoggedIn(false);
                  }}
                  style={{padding:"6px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.1)",color:"#ef4444",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}
                >
                  Sign Out & Continue
                </button>
              </div>
            </div>
          )}
          {step === "signup" ? (
            <div className="form-box">
              <div className="form-greeting">New Here? 🚀</div>
              <h1 className="form-title">Create Your<br />Free Account</h1>
              <p className="form-sub">Join thousands of aspirants already ahead in their prep.</p>

              <div className="trial-banner">
                <div className="trial-title">Start with 3-Day Free Trial</div>
                <div className="trial-item"><span className="tdot" /> Access 100+ PYQ Mocks</div>
                <div className="trial-item"><span className="tdot" /> Experience Full Platform</div>
                <div className="trial-item"><span className="tdot" /> No Credit Card Required</div>
              </div>

              {err && <div className="err">⚠ {err}</div>}

              <div className="field">
                <label className="field-label">Full Name</label>
                <div className="field-inner">
                  <input type="text" className="field-input" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Phone Number <span className="opt">(We'll send an OTP)</span></label>
                <div className="field-inner">
                  <div className="field-prefix">+91</div>
                  <input type="text" className="field-input" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-inner">
                  <input type="password" className="field-input" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Referral Code <span className="opt">(Optional)</span></label>
                <div className="field-inner">
                  <input type="text" className="field-input" placeholder="Enter referral code if you have one" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Email Address <span className="opt">(Optional)</span></label>
                <div className="field-inner">
                  <input type="email" className="field-input" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

             <button
  type="button"
  className="sub-btn"
  onClick={submit}
  disabled={loading}
>
  {loading ? <span className="spin" /> : "Create Account →"}
</button>
              <div className="switch-row">
                Already have an account?
                <button className="switch-btn" onClick={() => navigate("/login")}>Login here</button>
              </div>
            </div>
          ) : (
<OtpStep
  name={name}
  phone={phone}
  email={email}
  password={password}
  referralCode={referralCode}
  onBack={() => setStep("signup")}
  onSuccess={() => navigate("/dashboard", { state: { referralApplied: true } })}
  registerUser={register}
/>
          )}
        </div>
      </div>
    </>
  );}