/**
 * ReferralCard.jsx
 * In-app referral section — shown after login in dashboard or settings.
 * 
 * Features:
 *  - Shows user's unique referral code + copy/share button
 *  - Progress toward next free month (X/2 friends subscribed)
 *  - List of referred friends with status (pending/converted)
 *  - Reward history
 *  - How it works steps
 *
 * Usage:
 *   import ReferralCard from "./ReferralCard";
 *   <ReferralCard />
 */
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("speedmock_auth_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/* ── CSS ──────────────────────────────────────────────────────────── */
const CSS = `
@keyframes rf-rise    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes rf-pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes rf-shine   { 0%{left:-100%} 100%{left:160%} }
@keyframes rf-pop     { 0%{transform:scale(1)} 40%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes rf-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes rf-copied  { 0%{opacity:0;transform:translateY(4px)} 20%{opacity:1;transform:none} 80%{opacity:1} 100%{opacity:0} }

/* wrap */
.rf-wrap {
  background: var(--bg2); border: 1px solid var(--b); border-radius: 22px;
  overflow: hidden; animation: rf-rise .5s ease both; position: relative;
}
.rf-wrap::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #e91e8c, #a855f7, #f59e0b, #e91e8c);
  background-size: 300%; animation: rf-shimmer 4s linear infinite;
}

/* header */
.rf-header {
  padding: 26px 30px 22px;
  background: linear-gradient(135deg, rgba(233,30,140,.06), transparent 70%);
  border-bottom: 1px solid var(--b);
  display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px;
}
.rf-title-row { display: flex; align-items: center; gap: 14px; }
.rf-icon {
  width: 52px; height: 52px; border-radius: 15px; font-size: 26px;
  background: linear-gradient(135deg, rgba(233,30,140,.18), rgba(168,85,247,.1));
  border: 1px solid rgba(233,30,140,.3); display: flex; align-items: center; justify-content: center;
}
.rf-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; letter-spacing: 2.5px; color: var(--t); }
.rf-sub   { font-size: 12px; color: var(--m); margin-top: 4px; line-height: 1.6; max-width: 440px; }
.rf-badge {
  padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700;
  background: rgba(34,197,94,.12); color: #22c55e; border: 1px solid rgba(34,197,94,.25);
  white-space: nowrap; margin-top: 4px; display: inline-block;
}

/* ── DASHBOARD BUTTON ── */
.sub-dashboard-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 16px;border-radius:10px;border:none;
  background:linear-gradient(135deg,var(--f),var(--fl));
  color:#fff;font-size:11px;font-weight:700;
  cursor:pointer;font-family:'Outfit',sans-serif;
  transition:all .3s ease;margin:0;
  box-shadow:0 4px 16px rgba(233,30,140,.3);
  letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;
}
.sub-dashboard-btn:hover{
  transform:translateY(-3px);
  box-shadow:0 8px 24px rgba(233,30,140,.5);
}
.sub-dashboard-btn:active{
  transform:translateY(-1px);
}
.sub-dashboard-btn-icon{
  font-size:12px;display:flex;align-items:center;
}



/* code box */
.rf-code-section { padding: 24px 30px; border-bottom: 1px solid var(--b); }
.rf-code-label {
  font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  color: var(--m); margin-bottom: 12px;
}
.rf-code-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rf-code-box {
  display: flex; align-items: center; gap: 0; flex: 1; min-width: 200px; max-width: 340px;
  background: var(--bg3); border: 1px solid rgba(233,30,140,.3); border-radius: 14px;
  overflow: hidden; position: relative;
}
.rf-code-box::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(233,30,140,.06), transparent);
  animation: rf-shine 3s ease-in-out infinite;
}
.rf-code-text {
  font-family: 'DM Mono', monospace; font-size: 1.4rem; font-weight: 700;
  letter-spacing: 4px; color: var(--f); padding: 14px 20px; flex: 1;
}
.rf-copy-btn {
  padding: 0 20px; height: 100%; background: rgba(233,30,140,.1);
  border: none; border-left: 1px solid rgba(233,30,140,.2);
  color: var(--f); cursor: pointer; font-size: 18px;
  transition: background .2s; display: flex; align-items: center; justify-content: center;
  min-height: 56px;
}
.rf-copy-btn:hover { background: rgba(233,30,140,.2); }
.rf-copied-toast {
  position: absolute; top: -34px; left: 50%; transform: translateX(-50%);
  background: #22c55e; color: #fff; font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 8px; white-space: nowrap;
  animation: rf-copied 1.8s ease forwards;
}
.rf-share-btn {
  padding: 14px 20px; border-radius: 12px; border: 1px solid var(--b);
  background: var(--bg3); color: var(--t); font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center;
  gap: 8px; transition: all .2s;
}
.rf-share-btn:hover { border-color: var(--f); color: var(--f); }
.rf-link-row {
  margin-top: 12px; display: flex; align-items: center; gap: 10px;
  background: var(--bg3); border: 1px solid var(--b); border-radius: 10px; padding: 10px 14px;
}
.rf-link-text { font-size: 11px; color: var(--m); font-family: 'DM Mono', monospace; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rf-link-copy { font-size: 11px; color: var(--f); cursor: pointer; font-weight: 700; flex-shrink: 0; }
.rf-link-copy:hover { color: var(--fl); }

/* progress */
.rf-progress-section { padding: 24px 30px; border-bottom: 1px solid var(--b); }
.rf-progress-title {
  font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  color: var(--m); margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
}
.rf-progress-title::after { content: ''; flex: 1; height: 1px; background: var(--b); }

.rf-progress-card {
  background: linear-gradient(135deg, rgba(233,30,140,.06), var(--bg3) 70%);
  border: 1px solid rgba(233,30,140,.2); border-radius: 16px; padding: 20px 22px;
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
}
.rf-progress-ring-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.rf-progress-ring { transform: rotate(-90deg); }
.rf-progress-ring-bg  { stroke: var(--bg4, #21212e); fill: none; }
.rf-progress-ring-fill { fill: none; stroke: url(#rfGrad); stroke-linecap: round; transition: stroke-dasharray .8s cubic-bezier(.4,0,.2,1); }
.rf-progress-ring-text {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.rf-progress-ring-val  { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--f); line-height: 1; }
.rf-progress-ring-unit { font-size: 9px; color: var(--m); font-weight: 700; letter-spacing: 1px; }

.rf-progress-info { flex: 1; }
.rf-progress-head { font-size: 15px; font-weight: 800; color: var(--t); }
.rf-progress-desc { font-size: 12px; color: var(--m); margin-top: 4px; line-height: 1.6; }
.rf-progress-bar-wrap { margin-top: 12px; height: 8px; background: var(--bg4, #21212e); border-radius: 100px; overflow: hidden; }
.rf-progress-bar {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, #e91e8c, #a855f7);
  transition: width .8s cubic-bezier(.4,0,.2,1); position: relative; overflow: hidden;
}
.rf-progress-bar::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  animation: rf-shine 2s ease-in-out infinite;
}
.rf-progress-meta { display: flex; justify-content: space-between; font-size: 10px; color: var(--m); margin-top:5px; }

/* stat row */
.rf-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
.rf-stat {
  flex: 1; min-width: 100px; padding: 14px 16px; border-radius: 13px;
  background: var(--bg3); border: 1px solid var(--b); text-align: center;
  transition: transform .2s;
}
.rf-stat:hover { transform: translateY(-2px); }
.rf-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 1px; color: var(--f); }
.rf-stat-lbl { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--m); margin-top: 2px; }

/* referral list */
.rf-list-section { padding: 24px 30px; border-bottom: 1px solid var(--b); }
.rf-list { display: flex; flex-direction: column; gap: 8px; }
.rf-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; border-radius: 12px;
  background: var(--bg3); border: 1px solid transparent;
  transition: border-color .2s;
}
.rf-item:hover { border-color: var(--b); }
.rf-item-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(233,30,140,.2), rgba(168,85,247,.15));
  border: 1px solid rgba(233,30,140,.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; color: var(--f); flex-shrink: 0;
  font-family: 'Outfit', sans-serif;
}
.rf-item-info { flex: 1; }
.rf-item-name { font-size: 13px; font-weight: 700; color: var(--t); }
.rf-item-date { font-size: 11px; color: var(--m); margin-top: 2px; }
.rf-item-status {
  font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 100px;
}
.rf-item-status.pending   { background: rgba(245,158,11,.12); color: #f59e0b; border: 1px solid rgba(245,158,11,.2); }
.rf-item-status.converted { background: rgba(34,197,94,.12);  color: #22c55e; border: 1px solid rgba(34,197,94,.2); }

.rf-empty {
  text-align: center; padding: 28px 20px; color: var(--m); font-size: 13px;
}
.rf-empty-icon { font-size: 36px; margin-bottom: 10px; }

/* how it works */
.rf-how { padding: 24px 30px; }
.rf-how-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-top: 4px; }
.rf-step {
  background: var(--bg3); border: 1px solid var(--b); border-radius: 14px;
  padding: 18px 16px; text-align: center; position: relative; overflow: hidden;
  transition: transform .2s, border-color .2s;
}
.rf-step:hover { transform: translateY(-3px); border-color: rgba(233,30,140,.25); }
.rf-step-num {
  position: absolute; top: 10px; right: 12px;
  font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: rgba(233,30,140,.1); letter-spacing: 1px;
}
.rf-step-icon { font-size: 28px; margin-bottom: 10px; }
.rf-step-title { font-size: 13px; font-weight: 800; color: var(--t); margin-bottom: 5px; }
.rf-step-desc  { font-size: 11px; color: var(--m); line-height: 1.6; }

/* reward banner */
.rf-reward-banner {
  margin: 20px 30px 0;
  padding: 16px 20px; border-radius: 14px;
  background: linear-gradient(135deg, rgba(34,197,94,.1), rgba(34,197,94,.04));
  border: 1px solid rgba(34,197,94,.3);
  display: flex; align-items: center; gap: 14px;
}
.rf-reward-icon { font-size: 28px; animation: rf-pop .6s ease; }
.rf-reward-text { flex: 1; }
.rf-reward-head { font-size: 14px; font-weight: 800; color: #22c55e; }
.rf-reward-sub  { font-size: 12px; color: var(--m); margin-top: 3px; }

@media(max-width:680px){
  .rf-header,.rf-code-section,.rf-progress-section,.rf-list-section,.rf-how{padding:18px}
  .rf-how-steps{grid-template-columns:1fr}
  .rf-stats{gap:8px}
  .rf-reward-banner{margin:14px 18px 0}
}
`;

/* ── HELPERS ─────────────────────────────────────────────────────── */
function maskMobile(mobile) {
  if (!mobile) return "••••••••••";
  return mobile.toString().substring(0,2) + "••••••" + mobile.toString().slice(-2);
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff/86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30)  return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {day:"numeric",month:"short"});
}

/* ── RING SVG ─────────────────────────────────────────────────────── */
function ProgressRing({ converted, target = 2 }) {
  const r   = 32;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(1, converted / target);
  const dash = pct * circ;

  return (
    <div className="rf-progress-ring-wrap">
      <svg width="80" height="80" className="rf-progress-ring">
        <defs>
          <linearGradient id="rfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#e91e8c"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r={r} strokeWidth="7" className="rf-progress-ring-bg"/>
        <circle cx="40" cy="40" r={r} strokeWidth="7"
          className="rf-progress-ring-fill"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="rf-progress-ring-text">
        <div className="rf-progress-ring-val">{converted}</div>
        <div className="rf-progress-ring-unit">of {target}</div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────────────────────── */
export default function ReferralCard() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [copied,    setCopied]    = useState(false);
  const [copiedLink,setCopiedLink]= useState(false);
  const [error,     setError]     = useState("");
  const { theme } = useTheme();
const navigate = useNavigate();
  const BASE_URL = window.location.origin;

  useEffect(() => {
    if (!document.getElementById("rf-css")) {
      const s = document.createElement("style");
      s.id = "rf-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/referral/me`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setData(json);
      else setError("Failed to load referral data");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!data?.code) return;
    navigator.clipboard.writeText(data.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink() {
    const link = `${BASE_URL}/signup?ref=${data?.code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function share() {
    const link = `${BASE_URL}/signup?ref=${data?.code}`;
    const text = `Join SpeedMock — India's best SSC & Railway exam prep platform! Sign up with my referral code ${data?.code} and get started free.\n\n${link}`;
    if (navigator.share) {
      navigator.share({ title: "Join SpeedMock", text, url: link });
    } else {
      navigator.clipboard.writeText(text);
      alert("Share text copied! Paste it anywhere.");
    }
  }

  if (loading) return (
    <div className="rf-wrap" style={{padding:28}}>
      {[80,60,100,70,55].map((w,i) => (
        <div key={i} style={{height:14,width:`${w}%`,background:"var(--bg3)",borderRadius:8,marginBottom:14,
          animation:"rf-shimmer 1.5s infinite linear",backgroundSize:"200% 100%"}}/>
      ))}
    </div>
  );

  if (error) return (
    <div className="rf-wrap" style={{padding:28,textAlign:"center",color:"var(--m)"}}>
      {error}
    </div>
  );

  const { code, stats, referrals, pendingRewards } = data;
  const referralLink = `${BASE_URL}/signup?ref=${code}`;
  // Progress within current cycle of 2
  const cycle    = stats.converted % 2;
  const nextAt   = 2 - cycle;
  const barPct   = (cycle / 2) * 100;
  const totalFreeMonths = Math.floor(stats.converted / 2);

  return (
    <div className="rf-wrap">

      {/* PENDING REWARD BANNER */}
      {pendingRewards?.length > 0 && (
        <div className="rf-reward-banner">
          <span className="rf-reward-icon">🎁</span>
          <div className="rf-reward-text">
            <div className="rf-reward-head">You earned a free month!</div>
            <div className="rf-reward-sub">Your subscription has been extended by 1 month. Keep referring!</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="rf-header">
        <div>
          <div className="rf-title-row">
            <div className="rf-icon">🎯</div>
            <div>
              <div className="rf-title">Refer & Earn</div>
              <div className="rf-sub">
                Invite friends to SpeedMock. When <strong style={{color:"var(--t)"}}>2 of your friends buy a subscription</strong>, you get <strong style={{color:"var(--f)"}}>1 month free</strong> — automatically added to your account.
              </div>
            </div>
          </div>
          <div className="rf-badge">
            🎁 Every 2 paid friends = 1 free month for you
          </div>
        </div>
        {totalFreeMonths > 0 && (
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.5rem",color:"#22c55e",letterSpacing:2,lineHeight:1}}>{totalFreeMonths}</div>
            <div style={{fontSize:11,color:"var(--m)",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Free months earned</div>
          </div>
        )}
        <button className="sub-dashboard-btn" onClick={() => navigate("/dashboard")}>
          <span className="sub-dashboard-btn-icon">📊</span>
          Go to Dashboard
        </button>
      </div>

      {/* REFERRAL CODE */}
      <div className="rf-code-section">
        <div className="rf-code-label">Your Referral Code</div>
        <div className="rf-code-row">
          <div className="rf-code-box" style={{position:"relative"}}>
            <div className="rf-code-text">{code}</div>
            <button className="rf-copy-btn" onClick={copyCode}>
              {copied ? "✅" : "📋"}
            </button>
            {copied && <div className="rf-copied-toast">Copied!</div>}
          </div>
          <button className="rf-share-btn" onClick={share}>
            📤 Share
          </button>
        </div>

        <div className="rf-link-row">
          <span className="rf-link-text">{referralLink}</span>
          <span className="rf-link-copy" onClick={copyLink}>
            {copiedLink ? "✅ Copied" : "Copy link"}
          </span>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="rf-progress-section">
        <div className="rf-progress-title">Progress to Next Free Month</div>

        <div className="rf-progress-card">
          <ProgressRing converted={cycle} target={2}/>
          <div className="rf-progress-info">
            <div className="rf-progress-head">
              {cycle === 0
                ? "Invite 2 friends to subscribe"
                : cycle === 1
                  ? "1 more friend to subscribe — almost there!"
                  : "Reward unlocked! 🎉"
              }
            </div>
            <div className="rf-progress-desc">
              {nextAt > 0
                ? `${nextAt} more friend${nextAt > 1 ? "s" : ""} need${nextAt === 1 ? "s" : ""} to buy a subscription to unlock your next free month.`
                : "Your subscription has been extended by 1 month!"
              }
            </div>
            <div className="rf-progress-bar-wrap">
              <div className="rf-progress-bar" style={{width:`${barPct}%`}}/>
            </div>
            <div className="rf-progress-meta">
              <span>{cycle}/2 this cycle</span>
              <span>{stats.converted} total paid referrals</span>
            </div>
          </div>
        </div>

        {/* stats row */}
        <div className="rf-stats">
          <div className="rf-stat">
            <div className="rf-stat-val">{stats.total}</div>
            <div className="rf-stat-lbl">Friends Joined</div>
          </div>
          <div className="rf-stat" style={{borderColor:"rgba(34,197,94,.2)"}}>
            <div className="rf-stat-val" style={{color:"#22c55e"}}>{stats.converted}</div>
            <div className="rf-stat-lbl">Subscribed ✓</div>
          </div>
          <div className="rf-stat" style={{borderColor:"rgba(245,158,11,.2)"}}>
            <div className="rf-stat-val" style={{color:"#f59e0b"}}>{stats.pending}</div>
            <div className="rf-stat-lbl">Pending</div>
          </div>
          <div className="rf-stat" style={{borderColor:"rgba(168,85,247,.2)"}}>
            <div className="rf-stat-val" style={{color:"#a855f7"}}>{totalFreeMonths}</div>
            <div className="rf-stat-lbl">Free Months</div>
          </div>
        </div>
      </div>

      {/* REFERRAL LIST */}
      <div className="rf-list-section">
        <div className="rf-progress-title">
          Friends You Referred
          <span style={{color:"var(--f)",fontWeight:700,letterSpacing:0,textTransform:"none",fontSize:12}}>
            {referrals?.length || 0} total
          </span>
        </div>

        {!referrals?.length ? (
          <div className="rf-empty">
            <div className="rf-empty-icon">👥</div>
            <div>No referrals yet — share your code to get started!</div>
          </div>
        ) : (
          <div className="rf-list">
            {referrals.map((r, i) => (
              <div key={i} className="rf-item">
                <div className="rf-item-avatar">
                  {r.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="rf-item-info">
                  <div className="rf-item-name">{r.name}</div>
                  <div className="rf-item-date">
                    +91 {maskMobile(r.mobile)} · Joined {timeAgo(r.created_at)}
                    {r.converted_at && ` · Subscribed ${timeAgo(r.converted_at)}`}
                  </div>
                </div>
                <div className={`rf-item-status ${r.status}`}>
                  {r.status === "converted" ? "✓ Subscribed" : "Pending"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div className="rf-how">
        <div className="rf-progress-title">How It Works</div>
        <div className="rf-how-steps">
          {[
            { icon:"📋", n:"01", title:"Share Your Code",   desc:"Copy your unique referral code or link and share it with friends preparing for SSC or Railway exams." },
            { icon:"👥", n:"02", title:"Friends Sign Up",   desc:"Your friend registers on SpeedMock using your referral code or link." },
            { icon:"💳", n:"03", title:"They Subscribe",    desc:"When 2 of your referred friends buy any paid plan, you automatically get 1 month free — no claiming needed." },
          ].map(s => (
            <div key={s.n} className="rf-step">
              <div className="rf-step-num">{s.n}</div>
              <div className="rf-step-icon">{s.icon}</div>
              <div className="rf-step-title">{s.title}</div>
              <div className="rf-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:14,fontSize:11,color:"var(--m)",lineHeight:1.8,padding:"0 2px"}}>
          ℹ️ Rewards are applied automatically when the threshold is met. Each cycle of 2 paid referrals = 1 free month, repeating infinitely. Free months stack on top of your current subscription end date.
        </div>
      </div>

    </div>
  );
}
