/**
 * ForgotPassword.jsx  —  Account Recovery Page
 * ─────────────────────────────────────────────
 * Recovery via mobile OTP only.
 *
 * Flow:
 *   Step 1   → Enter mobile number
 *              → API checks if number is registered
 *              → If NO  : show "not registered" error
 *              → If YES : send OTP, move to step 2
 *   Step 2   → Enter 6-digit OTP
 *              → Verify OTP with API
 *              → If wrong   : show error, allow resend
 *              → If correct : move to the "set new password" view
 *   Step 2.5 → Enter + confirm new password
 *              → Calls /reset-password with the resetToken from step 2
 *              → Stores the returned session token (via AuthContext)
 *   Step 3   → Success screen → redirect to dashboard (now actually authenticated)
 *
 * Props:
 *   onBack      fn()     — go back to login page
 *   onRecovered fn()     — called after successful recovery
 *
 * API endpoints needed (server):
 *   POST /api/auth/check-mobile        { mobile } → { exists: bool }
 *   POST /api/auth/send-recovery-otp   { mobile } → { sent: bool }
 *   POST /api/auth/verify-recovery-otp { mobile, otp } → { valid: bool, resetToken: string }
 *   POST /api/auth/reset-password      { mobile, newPassword, resetToken } → { token, user }
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: #080810; color: #f0f0f0; }
button, input { font-family: 'DM Sans', sans-serif; }

:root {
  --f:     #d946ef;
  --fl:    #e879f9;
  --fd:    #a21caf;
  --t:     #f0f0f0;
  --m:     #888;
  --m2:    #3a3a3a;
  --bg:    #080810;
  --bg2:   #111118;
  --bg3:   #18181f;
  --b:     rgba(217,70,239,0.18);
  --b2:    rgba(255,255,255,0.07);
  --green: #22c55e;
  --red:   #ef4444;
}

@keyframes fp-spin  { to { transform: rotate(360deg); } }
@keyframes fp-in    { from { opacity:0; transform:translateX(20px) scale(.97); } to { opacity:1; transform:translateX(0) scale(1); } }
@keyframes fp-pop   { from { transform:scale(.5); opacity:0; } to { transform:scale(1); opacity:1; } }
@keyframes fp-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
@keyframes fp-train { 0%,100%{transform:translateY(0) rotate(90deg)} 50%{transform:translateY(-1.5px) rotate(90deg)} }
@keyframes fp-breathe { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
@keyframes fp-success-ring { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

/* ── LAYOUT ── */
.fp-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 400px 1fr;
}

/* ══ LEFT PANEL ══ */
.fp-left {
  background: var(--bg2);
  border-right: 1px solid var(--b);
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 40px 40px;
  position: relative; overflow: hidden;
}
.fp-left-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 70% 60% at 50% 45%,
    rgba(217,70,239,.1) 0%, transparent 65%);
  animation: fp-breathe 4s ease-in-out infinite;
}
.fp-left-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(217,70,239,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(217,70,239,.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* logo */
.fp-logo {
  display: flex; align-items: center; gap: 9px;
  cursor: pointer; position: relative; z-index: 1;
}
.fp-logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px; letter-spacing: 2.5px; color: var(--f);
}

/* journey section */
.fp-journey { position: relative; z-index: 1; }
.fp-journey-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 38px; letter-spacing: 3px;
  color: var(--t); line-height: 1.1; margin-bottom: 10px;
}
.fp-journey-title em { color: var(--f); font-style: italic; }
.fp-journey-sub {
  font-size: 13px; color: var(--m);
  line-height: 1.75; max-width: 290px; margin-bottom: 44px;
}

/* step track */
.fp-track { position: relative; display: flex; flex-direction: column; }
.fp-track-step {
  display: flex; align-items: flex-start;
  gap: 16px; padding-bottom: 36px; position: relative;
}
.fp-track-step:last-child { padding-bottom: 0; }

/* vertical connector line */
.fp-track-step:not(:last-child)::after {
  content: ''; position: absolute;
  left: 15px; top: 33px; bottom: 0; width: 2px;
  background: var(--m2);
  transition: background 0.5s;
}
.fp-track-step.done:not(:last-child)::after {
  background: linear-gradient(to bottom, var(--f), rgba(217,70,239,.25));
}

/* circle */
.fp-circle {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  border: 2px solid var(--m2); background: var(--bg3);
  color: var(--m2); transition: all 0.4s; position: relative; z-index: 1;
}
.fp-track-step.active .fp-circle {
  border-color: var(--f); background: rgba(217,70,239,.15);
  color: var(--f); box-shadow: 0 0 0 4px rgba(217,70,239,.1);
}
.fp-track-step.done .fp-circle {
  border-color: var(--green); background: rgba(34,197,94,.15); color: var(--green);
}

/* train */
.fp-train-icon {
  position: absolute; left: 6px; font-size: 16px;
  filter: drop-shadow(0 0 6px rgba(217,70,239,.9));
  animation: fp-train .15s linear infinite;
  transition: top .55s cubic-bezier(0.34,1.56,0.64,1);
  z-index: 2;
}

.fp-step-label { font-size: 13px; font-weight: 600; color: var(--m2); transition: color .3s; padding-top: 4px; }
.fp-step-desc  { font-size: 11px; color: var(--m2); margin-top: 2px; line-height: 1.5; transition: color .3s; }
.fp-track-step.active .fp-step-label { color: var(--t); }
.fp-track-step.active .fp-step-desc  { color: var(--m); }
.fp-track-step.done   .fp-step-label { color: var(--green); }

/* bottom badges */
.fp-left-bottom { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 10px; }
.fp-badge {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 14px; border-radius: 11px;
  background: rgba(34,197,94,.07); border: 1px solid rgba(34,197,94,.18);
}
.fp-badge p { font-size: 11px; color: var(--m); line-height: 1.55; }
.fp-badge strong { color: var(--green); font-weight: 600; }

/* ══ RIGHT PANEL ══ */
.fp-right {
  display: flex; align-items: center; justify-content: center;
  padding: 48px 32px; background: var(--bg);
}
.fp-form { width: 100%; max-width: 400px; }

/* step panels */
.fp-panel { animation: fp-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both; }
.fp-panel.shake { animation: fp-shake 0.4s ease both; }

.fp-icon { font-size: 44px; display: block; margin-bottom: 18px; animation: fp-pop .5s cubic-bezier(0.34,1.56,0.64,1) both; }
.fp-h1 { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 2px; color: var(--t); margin-bottom: 7px; }
.fp-p  { font-size: 13px; color: var(--m); line-height: 1.75; margin-bottom: 28px; }
.fp-p strong { color: var(--t); }

/* form group */
.fp-fg       { margin-bottom: 6px; }
.fp-fg label { display: block; font-size: 11px; font-weight: 700; letter-spacing: .8px; color: var(--m); margin-bottom: 7px; text-transform: uppercase; }
.fp-row      { display: flex; gap: 8px; }
.fp-prefix   { padding: 12px 14px; background: rgba(255,255,255,.05); border: 1px solid var(--b2); border-radius: 9px; color: var(--m); font-size: 13px; white-space: nowrap; flex-shrink: 0; display: flex; align-items: center; }
.fp-input    { width: 100%; padding: 12px 15px; background: rgba(255,255,255,.05); border: 1px solid var(--b2); border-radius: 9px; color: var(--t); font-size: 15px; outline: none; transition: all .2s; }
.fp-input:focus { border-color: var(--f); background: rgba(217,70,239,.05); box-shadow: 0 0 0 3px rgba(217,70,239,.1); }
.fp-input::placeholder { color: var(--m2); }
.fp-input.err { border-color: var(--red); background: rgba(239,68,68,.05); box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.fp-hint { font-size: 11px; color: var(--m2); margin-top: 6px; line-height: 1.5; }

/* error box */
.fp-error {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 11px 13px; border-radius: 9px; margin-bottom: 16px;
  background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.22);
  font-size: 12px; color: #f87171; line-height: 1.6;
  animation: fp-in .25s ease both;
}

/* OTP boxes */
.fp-otp-row { display: flex; gap: 10px; justify-content: center; margin: 24px 0; }
.fp-otp-box {
  width: 52px; height: 60px; text-align: center;
  font-size: 22px; font-weight: 700; color: var(--t);
  background: rgba(255,255,255,.05); border: 2px solid var(--b2);
  border-radius: 10px; outline: none; transition: all .2s;
  font-family: 'DM Mono', monospace;
}
.fp-otp-box:focus { border-color: var(--f); background: rgba(217,70,239,.08); box-shadow: 0 0 0 3px rgba(217,70,239,.12); }
.fp-otp-box.filled { border-color: rgba(217,70,239,.4); }
.fp-otp-box.err    { border-color: var(--red); }

/* resend */
.fp-resend { text-align: center; font-size: 12px; color: var(--m); margin-bottom: 20px; }
.fp-resend button { background: none; border: none; color: var(--f); font-weight: 600; font-size: 12px; cursor: pointer; }

/* buttons */
.fp-btn {
  width: 100%; padding: 13px; border: none; border-radius: 9px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  background: linear-gradient(135deg, var(--f), var(--fd));
  color: #fff; margin-bottom: 12px;
  box-shadow: 0 4px 18px rgba(217,70,239,.3);
  transition: all .2s; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center; gap: 9px;
}
.fp-btn::before {
  content: ''; position: absolute; top:0; left:-100%;
  width: 55%; height: 100%;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
  transform: skewX(-20deg); transition: left .55s;
}
.fp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(217,70,239,.45); }
.fp-btn:hover::before { left: 160%; }
.fp-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.fp-btn-ring { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: fp-spin .65s linear infinite; flex-shrink: 0; }

.fp-btn-ghost { width: 100%; padding: 12px; background: transparent; color: var(--m); border: 1px solid var(--b2); border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .2s; margin-bottom: 12px; }
.fp-btn-ghost:hover { border-color: rgba(255,255,255,.18); color: var(--t); }

.fp-back { text-align: center; font-size: 12px; color: var(--m); margin-top: 8px; }
.fp-back button { background: none; border: none; color: var(--f); font-weight: 600; font-size: 12px; cursor: pointer; }

/* success */
.fp-success { text-align: center; animation: fp-in .5s cubic-bezier(0.34,1.56,0.64,1) both; }
.fp-success-ring { width: 92px; height: 92px; border-radius: 50%; margin: 0 auto 24px; background: rgba(34,197,94,.1); border: 2px solid rgba(34,197,94,.3); display: flex; align-items: center; justify-content: center; font-size: 40px; animation: fp-success-ring .6s cubic-bezier(0.34,1.56,0.64,1) both; box-shadow: 0 0 48px rgba(34,197,94,.2); }
.fp-success h2 { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 2px; color: var(--t); margin-bottom: 8px; }
.fp-success p  { font-size: 13px; color: var(--m); line-height: 1.7; margin-bottom: 28px; }
.fp-summary { background: rgba(255,255,255,.03); border: 1px solid var(--b2); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; }
.fp-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
.fp-summary-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,.05); }
.fp-summary-key { font-size: 11px; color: var(--m); }
.fp-summary-val { font-size: 12px; font-weight: 600; color: var(--t); font-family: 'DM Mono', monospace; }

@media (max-width: 780px) {
  .fp-page { grid-template-columns: 1fr; }
  .fp-left { display: none; }
  .fp-right { padding: 40px 20px; }
}
`;

// ─── LOGO ─────────────────────────────────────────────────────────
const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 3L58 17v25c0 12-12 20-26 22C8 62 6 54 6 42V17z" fill="#080810" stroke="#d946ef" strokeWidth="2"/>
    <rect x="13" y="30" width="38" height="12" rx="4" fill="#d946ef" opacity=".88"/>
    <path d="M38 30h10l2 6H38z" fill="#e879f9"/>
    <rect x="17" y="33" width="5" height="4" rx="1.5" fill="rgba(255,255,255,.88)"/>
    <rect x="25" y="33" width="5" height="4" rx="1.5" fill="rgba(255,255,255,.88)"/>
    <circle cx="20" cy="44" r="4" fill="#080810" stroke="#d946ef" strokeWidth="1.8"/><circle cx="20" cy="44" r="1.5" fill="#d946ef"/>
    <circle cx="36" cy="44" r="4" fill="#080810" stroke="#d946ef" strokeWidth="1.8"/><circle cx="36" cy="44" r="1.5" fill="#d946ef"/>
    <circle cx="46" cy="44" r="4" fill="#080810" stroke="#d946ef" strokeWidth="1.8"/><circle cx="46" cy="44" r="1.5" fill="#d946ef"/>
    <line x1="8" y1="33" x2="14" y2="33" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
    <line x1="8" y1="37" x2="12" y2="37" stroke="#d946ef" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
    <text x="32" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="800" fontFamily="Arial" letterSpacing="1">SSC</text>
    <text x="32" y="13" textAnchor="middle" fill="#d946ef" fontSize="7">★</text>
  </svg>
);

// ─── OTP INPUT ────────────────────────────────────────────────────
function OTPInput({ value, onChange, hasError }) {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const refs   = useRef([]);

  const handleChange = (i, v) => {
    const d = v.replace(/\D/, "").slice(-1);
    const next = [...digits]; next[i] = d;
    onChange(next.join(""));
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...digits]; next[i - 1] = "";
      onChange(next.join(""));
    }
  };

  return (
    <div className="fp-otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          className={`fp-otp-box${d ? " filled" : ""}${hasError ? " err" : ""}`}
          type="text" inputMode="numeric"
          maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────
function useCountdown(initial = 30) {
  const [t, setT] = useState(initial);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(v => v - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);
  return [t, () => setT(initial)];
}

// ─── STEPS CONFIG ─────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Enter Mobile",     desc: "Your registered number"   },
  { n: 2, label: "Verify OTP",       desc: "6-digit code via SMS"     },
  { n: 3, label: "Access Restored",  desc: "Back on track!"           },
];
// train top position per step
const TRAIN_TOP = { 1: 7, 2: 106, 3: 205 };

// ─── COMPONENT ────────────────────────────────────────────────────
export default function ForgotPassword({ onBack, onRecovered }) {
  const { resetPassword } = useAuth();
  const [step,       setStep]      = useState(1);
  const [mobile,     setMobile]    = useState("");
  const [otp,        setOtp]       = useState("");
  const [error,      setError]     = useState("");
  const [checking,   setChecking]  = useState(false);
  const [verifying,  setVerifying] = useState(false);
  const [shake,      setShake]     = useState(false);
  const [timer, resetTimer]        = useCountdown(30);
  const styleRef = useRef(null);

  // Set once OTP is verified — holds the short-lived token the backend
  // requires to actually change the password (from /verify-recovery-otp)
  const [resetToken,   setResetToken]   = useState("");
  const [otpVerified,  setOtpVerified]  = useState(false);
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [settingPass,  setSettingPass]  = useState(false);

  // inject CSS once
  useEffect(() => {
    if (!document.getElementById("fp-css")) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "fp-css";
      styleRef.current.textContent = CSS;
      document.head.appendChild(styleRef.current);
    }
    return () => styleRef.current?.remove();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const masked = mobile.length === 10
    ? `+91 ${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`
    : "+91 XXXXXXXXXX";

  const stepClass = (n) =>
    step > n ? "fp-track-step done"
    : step === n ? "fp-track-step active"
    : "fp-track-step";

  // ── STEP 1: Check number then send OTP ──────────────────────────
  const handleSendOTP = async () => {
    setError("");
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      triggerShake();
      return;
    }

    setChecking(true);
    try {
      // 1. Check if mobile is registered
      const checkRes  = await fetch("http://localhost:5000/api/auth/check-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const checkData = await checkRes.json();

      if (!checkData.exists) {
        setError(
          "This mobile number is not registered with SpeedMock. " +
          "Please check the number or sign up for a new account."
        );
        triggerShake();
        setChecking(false);
        return;
      }

      // 2. Number found — send OTP
      await fetch("http://localhost:5000/api/auth/send-recovery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      setStep(2);
      resetTimer();

    } catch {
      setError("Network error. Please check your connection and try again.");
      triggerShake();
    } finally {
      setChecking(false);
    }
  };

  // ── STEP 2: Verify OTP ──────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      triggerShake();
      return;
    }

    setVerifying(true);
    try {
      const res  = await fetch("http://localhost:5000/api/auth/verify-recovery-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();

      if (!data.valid) {
        setError("Incorrect OTP. Please check and try again.");
        setOtp("");
        triggerShake();
        return;
      }

      // Previously this jumped straight to step 3 ("Access Restored")
      // without ever letting the user set a new password or getting
      // them a session token — they'd land on /dashboard unauthenticated.
      setResetToken(data.resetToken);
      setOtpVerified(true);

    } catch {
      setError("Network error. Please try again.");
      triggerShake();
    } finally {
      setVerifying(false);
    }
  };

  // ── STEP 2.5: Set new password ───────────────────────────────────
  const handleResetPassword = async () => {
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      triggerShake();
      return;
    }
    if (newPassword !== confirmPass) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }

    setSettingPass(true);
    try {
      // Goes through AuthContext -> authService.resetPassword(), which
      // calls POST /api/auth/reset-password AND stores the returned
      // token/user so the user actually has a valid session afterward.
      await resetPassword(mobile, newPassword, resetToken);
      setStep(3);
    } catch (err) {
      setError(err.message || "Could not reset password. Please try again.");
      triggerShake();
    } finally {
      setSettingPass(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────
  const handleResend = async () => {
    setOtp(""); setError("");
    resetTimer();
    await fetch("http://localhost:5000/api/auth/send-recovery-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
  };

  return (
    <div className="fp-page">

      {/* ══ LEFT PANEL ══ */}
      <div className="fp-left">
        <div className="fp-left-glow" />
        <div className="fp-left-grid" />

        <div className="fp-logo" onClick={onBack}>
          <Logo size={28} />
          <span className="fp-logo-text">SPEEDMOCK</span>
        </div>

        <div className="fp-journey">
          <div className="fp-journey-title">
            Get Back<br />on <em>Track</em>
          </div>
          <p className="fp-journey-sub">
            Locked out? No stress. Enter your registered mobile number,
            verify the OTP and you're back to your preparation
            in under 2 minutes.
          </p>

          {/* step tracker */}
          <div className="fp-track">
            <div className="fp-train-icon" style={{ top: TRAIN_TOP[step] }}>
              🚂
            </div>
            {STEPS.map(s => (
              <div key={s.n} className={stepClass(s.n)}>
                <div className="fp-circle">
                  {step > s.n ? "✓" : s.n}
                </div>
                <div>
                  <div className="fp-step-label">{s.label}</div>
                  <div className="fp-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fp-left-bottom">
          <div className="fp-badge">
            <span style={{ fontSize: 18 }}>🔐</span>
            <p>
              <strong>Secure & Private</strong> — OTP expires in 2 min.
              We never store OTPs on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="fp-right">
        <div className="fp-form">

          {/* ── STEP 1: Enter mobile ── */}
          {step === 1 && (
            <div className={`fp-panel${shake ? " shake" : ""}`} key="s1">
              <span className="fp-icon">📱</span>
              <h1 className="fp-h1">RECOVER ACCOUNT</h1>
              <p className="fp-p">
                Enter the mobile number you registered with.
                We'll verify it's you before sending an OTP.
              </p>

              <div className="fp-fg">
                <label>
                  Registered Mobile Number
                  <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>
                </label>
                <div className="fp-row">
                  <div className="fp-prefix">🇮🇳 +91</div>
                  <input
                    className={`fp-input${error ? " err" : ""}`}
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={mobile}
                    onChange={e => {
                      setError("");
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                    }}
                    onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                  />
                </div>
                <p className="fp-hint">
                  The number you used when you signed up on SpeedMock
                </p>
              </div>

              {error && (
                <div className="fp-error">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="fp-btn"
                onClick={handleSendOTP}
                disabled={checking}
              >
                {checking ? (
                  <><div className="fp-btn-ring" />Checking number...</>
                ) : (
                  "Send OTP →"
                )}
              </button>

              <div className="fp-back">
                Remembered your login?{" "}
                <button onClick={onBack}>← Back to Login</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Enter OTP, then set new password ── */}
          {step === 2 && !otpVerified && (
            <div className={`fp-panel${shake ? " shake" : ""}`} key="s2">
              <span className="fp-icon">📲</span>
              <h1 className="fp-h1">ENTER OTP</h1>
              <p className="fp-p">
                We sent a 6-digit code to{" "}
                <strong>{masked}</strong>.
                Enter it below to verify your identity.
              </p>

              <OTPInput
                value={otp}
                onChange={v => { setOtp(v); setError(""); }}
                hasError={!!error}
              />

              <div className="fp-resend">
                {timer > 0 ? (
                  <span>
                    Resend OTP in{" "}
                    <span style={{ color: "var(--f)", fontWeight: 600 }}>
                      {timer}s
                    </span>
                  </span>
                ) : (
                  <button onClick={handleResend}>Resend OTP →</button>
                )}
              </div>

              {error && (
                <div className="fp-error">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="fp-btn"
                onClick={handleVerifyOTP}
                disabled={verifying}
              >
                {verifying ? (
                  <><div className="fp-btn-ring" />Verifying...</>
                ) : (
                  "Verify OTP →"
                )}
              </button>

              <button
                className="fp-btn-ghost"
                onClick={() => { setStep(1); setOtp(""); setError(""); setOtpVerified(false); setNewPassword(""); setConfirmPass(""); }}
              >
                ← Change Number
              </button>
            </div>
          )}

          {/* ── STEP 2.5: Set new password (after OTP verified) ── */}
          {step === 2 && otpVerified && (
            <div className={`fp-panel${shake ? " shake" : ""}`} key="s2-pass">
              <span className="fp-icon">🔑</span>
              <h1 className="fp-h1">SET NEW PASSWORD</h1>
              <p className="fp-p">
                Identity verified for <strong>{masked}</strong>.
                Choose a new password for your account.
              </p>

              <div className="fp-fg">
                <label>New Password</label>
                <input
                  className={`fp-input${error ? " err" : ""}`}
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => { setError(""); setNewPassword(e.target.value); }}
                />
              </div>

              <div className="fp-fg" style={{ marginTop: 14 }}>
                <label>Confirm Password</label>
                <input
                  className={`fp-input${error ? " err" : ""}`}
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPass}
                  onChange={e => { setError(""); setConfirmPass(e.target.value); }}
                  onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                />
              </div>

              {error && (
                <div className="fp-error" style={{ marginTop: 16 }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="fp-btn"
                style={{ marginTop: 20 }}
                onClick={handleResetPassword}
                disabled={settingPass}
              >
                {settingPass ? (
                  <><div className="fp-btn-ring" />Saving...</>
                ) : (
                  "Reset Password →"
                )}
              </button>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="fp-success" key="s3">
              <div className="fp-success-ring">✓</div>
              <h2>YOU'RE BACK!</h2>
              <p>
                Identity verified successfully. Your account access has
                been restored. Ready to continue your preparation?
              </p>

              <div className="fp-summary">
                {[
                  ["Verified Number", masked],
                  ["Method",          "Mobile OTP"],
                  ["Status",          "✓ Access Restored"],
                  ["Session",         "Active"],
                ].map(([k, v]) => (
                  <div className="fp-summary-row" key={k}>
                    <span className="fp-summary-key">{k}</span>
                    <span
                      className="fp-summary-val"
                      style={k === "Status" ? { color: "var(--green)" } : {}}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <button className="fp-btn" onClick={() => onRecovered?.()}>
                Go to Dashboard →
              </button>

              <button className="fp-btn-ghost" onClick={onBack}>
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}