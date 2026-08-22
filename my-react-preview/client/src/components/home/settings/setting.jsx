import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {useTheme} from "../../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ─── SECTION HEADER ─────────────────────────────────────────────── */
function SectionHeader({ icon, title, desc }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:"rgba(233,30,140,0.1)", border:"1px solid rgba(233,30,140,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>
          {icon}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.15rem", letterSpacing:"2px", color:"#fff" }}>{title}</div>
      </div>
      {desc && <div style={{ fontSize:"0.78rem", color:"#7a7a90", lineHeight:1.55, paddingLeft:44 }}>{desc}</div>}
    </div>
  );
}

/* ─── TOGGLE ─────────────────────────────────────────────────────── */
function Toggle({ value, onChange, color = "#e91e8c" }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width:46, height:26, borderRadius:50, background: value ? color : "#32323f",
        border: `1.5px solid ${value ? color : "#32323f"}`,
        cursor:"pointer", position:"relative", transition:"all 0.22s",
        boxShadow: value ? `0 0 10px ${color}55` : "none", flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff",
        position:"absolute", top:"50%", transform:"translateY(-50%)",
        left: value ? "calc(100% - 22px)" : "3px", transition:"left 0.22s",
        boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
    </div>
  );
}

/* ─── INPUT FIELD ────────────────────────────────────────────────── */
function SettingInput({ label, type="text", value, onChange, placeholder, disabled, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:"0.68rem", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#7a7a90", marginBottom:7 }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", background:disabled?"#1a1a22":"#1e1e28",
        border:`1.5px solid ${focused?"#e91e8c":"#32323f"}`, borderRadius:11,
        overflow:"hidden", transition:"border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(233,30,140,0.1)" : "none" }}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          style={{ flex:1, background:"transparent", border:"none", outline:"none", color: disabled?"#7a7a90":"#fff", fontFamily:"'Outfit',sans-serif", fontSize:"0.9rem", fontWeight:500, padding:"11px 14px", height:46 }}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/>
        {suffix && <span style={{ padding:"0 14px", fontSize:"0.75rem", color:"#7a7a90", fontWeight:600 }}>{suffix}</span>}
      </div>
    </div>
  );
}

/* ─── CARD WRAPPER ───────────────────────────────────────────────── */
function SettingCard({ children, style }) {
  return (
    <div style={{ background:"#18181f", border:"1px solid #32323f", borderRadius:18,
      padding:"24px 22px", marginBottom:14, transition:"border-color 0.2s", ...style }}>
      {children}
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function Settings({ onBack }) {
  const [activeTab, setActiveTab] = useState("account");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();

  /* ── user profile ── */
  const [user, setUser]                     = useState(null);
  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved]     = useState(false);
  const [profileError, setProfileError]     = useState("");

  /* ── password ── */
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPasses, setShowPasses]   = useState(false);
  const [passError, setPassError]     = useState("");
  const [passSaved, setPassSaved]     = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  /* ── devices ── */
  const [devices, setDevices]               = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm]   = useState(null);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  /* ── Populate from AuthContext on mount (no extra fetch needed) ── */
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setName(authUser.name  || "");
      setEmail(authUser.email || "");
    }
    const stored = localStorage.getItem("speedmock_device_id");
    setCurrentDeviceId(stored);
    loadDevices();
  }, [authUser]);

  async function loadDevices() {
    setDevicesLoading(true);
    try {
      const token = localStorage.getItem("speedmock_auth_token");
      if (!token) return;
      const res  = await fetch(`${API}/auth/sessions`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const stored = localStorage.getItem("speedmock_device_id");
        setCurrentDeviceId(stored);
        setDevices(Object.entries(data.sessions || {}).map(([id, info]) => ({
          id,
          name:            info.deviceName || "Unknown Device",
          icon:            info.deviceType === "mobile" ? "📱" : "🖥️",
          location:        info.location   || "India",
          lastActive:      id === stored ? "Active now" : formatTime(info.lastActive),
          isCurrentDevice: id === stored,
          loginTime:       formatTime(info.createdAt),
        })));
      }
    } catch (err) {  }
    finally { setDevicesLoading(false); }
  }

  function formatTime(ts) {
    if (!ts) return "Unknown";
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1)    return "Just now";
    if (diff < 60)   return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff/60)} hrs ago`;
    return new Date(ts).toLocaleDateString("en-IN");
  }

  async function saveProfile() {
    if (!name.trim()) { setProfileError("Name cannot be empty"); return; }
    setProfileLoading(true); setProfileError("");
    try {
      const token = localStorage.getItem("speedmock_auth_token");
      const res   = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:   JSON.stringify({ name: name.trim(), email: email.trim() || null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) { setProfileError(err.message); }
    finally { setProfileLoading(false); }
  }

  async function changePassword() {
    if (!currentPass)            { setPassError("Enter your current password"); return; }
    if (newPass.length < 8)      { setPassError("New password must be at least 8 characters"); return; }
    if (newPass !== confirmPass)  { setPassError("Passwords do not match"); return; }
    setPassLoading(true); setPassError("");
    try {
      const token = localStorage.getItem("speedmock_auth_token");
      const res   = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:   JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPassSaved(true);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setTimeout(() => setPassSaved(false), 2500);
    } catch (err) { setPassError(err.message); }
    finally { setPassLoading(false); }
  }

  async function logoutDevice(deviceId) {
    try {
      const token = localStorage.getItem("speedmock_auth_token");
      await fetch(`${API}/auth/logout-device`, {
        method: "POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:   JSON.stringify({ deviceId }),
      });
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      setLogoutConfirm(null);
    } catch (err) {  }
  }

  async function logoutAllOthers() {
    try {
      const token = localStorage.getItem("speedmock_auth_token");
      await fetch(`${API}/auth/logout-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentDeviceId: localStorage.getItem("speedmock_device_id") }),
      });
      setDevices(prev => prev.filter(d => d.isCurrentDevice));
    } catch (err) {  }
  }

  const tabs = [
    { id:"account",  label:"Account",  icon:"👤" },
    { id:"security", label:"Security", icon:"🔒" },
    { id:"devices",  label:"Devices",  icon:"📱" },
  ];

  // (duplicate stubs removed — real async implementations above are used)

  /* ── RENDER ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --f:#e91e8c;--fb:#ff3aaa;--fd:#b5005f;
          --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;
          --g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
        }
        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        @keyframes successPop{0%{transform:scale(0.9);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#18181f}::-webkit-scrollbar-thumb{background:#e91e8c44;border-radius:3px}

        .page{min-height:100vh;background:var(--g9);padding-bottom:60px;
          background-image:radial-gradient(ellipse 60% 30% at 50% 0%,rgba(233,30,140,0.07) 0%,transparent 55%),
            linear-gradient(rgba(233,30,140,0.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(233,30,140,0.018) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;}

        .hdr{
  padding:36px 5% 28px;
  animation:fadeUp 0.5s ease both;
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:12px;
}
        .back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;margin-bottom:16px;transition:color 0.18s;}
        .back-btn:hover{color:var(--fb);}
        .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,5vw,3.2rem);letter-spacing:3px;color:var(--w);line-height:1;margin-bottom:6px;}
        .hdr-sub{font-size:0.84rem;color:var(--g4);}

        /* LAYOUT */
        .layout{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:0 5%;align-items:start;}
        @media(max-width:760px){.layout{grid-template-columns:1fr;}}

        /* SIDEBAR */
        .sidebar{position:sticky;top:20px;background:var(--g8);border:1px solid var(--g6);border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:3px;}
        .sidebar-tab{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:0.84rem;font-weight:600;color:var(--g4);background:none;border:none;text-align:left;transition:all 0.18s;}
        .sidebar-tab:hover{background:rgba(233,30,140,0.06);color:var(--g2);}
        .sidebar-tab.active{background:rgba(233,30,140,0.1);color:var(--fb);border:1px solid rgba(233,30,140,0.2);}
        .tab-icon{font-size:1rem;}

        /* USER CARD TOP */
        .user-mini{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--g6);margin:-12px -12px 12px;}
        .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--fb),var(--fd));display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:1px;color:#fff;flex-shrink:0;}
        .user-name{font-size:0.84rem;font-weight:700;color:var(--w);}
        .user-plan{font-size:0.64rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--fb);}


/* ── DASHBOARD BUTTON ── */
.sub-dashboard-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:7px 14px;border-radius:10px;border:none;
  background:linear-gradient(135deg,var(--f),var(--fl));
  color:#fff;font-size:11px;font-weight:700;
  cursor:pointer;font-family:'Outfit',sans-serif;
  transition:transform .2s ease, box-shadow .2s ease;
  box-shadow:0 4px 16px rgba(233,30,140,.3);
  letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;
  /* removed: position:absolute;left:10%;top:40%;transform:translateY(-50%); */
}
.sub-dashboard-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 24px rgba(233,30,140,.5);
}
.sub-dashboard-btn:active{
  transform:translateY(-1px);
}
.sub-dashboard-btn-icon{
  font-size:12px;display:flex;align-items:center;
}



        /* CONTENT */
        .content{animation:slideIn 0.35s ease both;}

        /* SAVE TOAST */
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#22c55e;color:#fff;border-radius:50px;padding:10px 24px;font-family:'Outfit',sans-serif;font-size:0.86rem;font-weight:700;z-index:100;animation:successPop 0.4s ease both;box-shadow:0 4px 20px rgba(34,197,94,0.4);white-space:nowrap;}

        /* BUTTONS */
        .btn-primary{background:linear-gradient(135deg,var(--fb),var(--fd));color:#fff;border:none;border-radius:50px;padding:10px 24px;font-family:'Outfit',sans-serif;font-size:0.86rem;font-weight:700;cursor:pointer;transition:all 0.22s;box-shadow:0 3px 16px rgba(233,30,140,0.32);}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(233,30,140,0.48);}
        .btn-secondary{background:rgba(255,255,255,0.05);color:var(--g2);border:1px solid var(--g6);border-radius:50px;padding:10px 20px;font-family:'Outfit',sans-serif;font-size:0.86rem;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .btn-secondary:hover{border-color:var(--f);color:var(--fb);}
        .btn-danger{background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:50px;padding:8px 18px;font-family:'Outfit',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
        .btn-danger:hover{background:rgba(239,68,68,0.18);border-color:rgba(239,68,68,0.6);}

        /* DEVICE CARD */
        .device-card{display:flex;align-items:center;gap:14px;padding:16px 18px;background:#1e1e28;border:1px solid var(--g6);border-radius:14px;margin-bottom:10px;transition:all 0.2s;}
        .device-card.current{border-color:rgba(233,30,140,0.3);background:rgba(233,30,140,0.04);}
        .device-icon{width:44px;height:44px;border-radius:12px;background:rgba(233,30,140,0.1);border:1px solid rgba(233,30,140,0.22);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
        .device-name{font-size:0.88rem;font-weight:700;color:var(--w);margin-bottom:3px;}
        .device-meta{font-size:0.72rem;color:var(--g4);}
        .device-active{font-size:0.65rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;}

        /* SETTING ROW */
        .setting-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid #1e1e28;gap:16px;}
        .setting-row:last-child{border-bottom:none;padding-bottom:0;}
        .setting-label{font-size:0.86rem;font-weight:600;color:var(--g2);margin-bottom:2px;}
        .setting-desc{font-size:0.72rem;color:var(--g4);line-height:1.5;}

        /* SELECT */
        select.slt{background:#1e1e28;border:1.5px solid var(--g6);border-radius:9px;padding:8px 12px;color:var(--g2);font-family:'Outfit',sans-serif;font-size:0.84rem;font-weight:500;outline:none;cursor:pointer;}
        select.slt:focus{border-color:var(--f);}

        /* CONFIRM MODAL */
        .modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(8,8,12,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal-box{background:var(--g8);border:1px solid rgba(239,68,68,0.25);border-radius:18px;padding:28px 24px;width:100%;max-width:380px;animation:popIn 0.35s ease both;text-align:center;}

        /* ERROR */
        .err-msg{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);border-radius:9px;padding:9px 13px;font-size:0.78rem;color:#fc8181;margin-bottom:14px;display:flex;align-items:center;gap:7px;}

        /* PLAN CARD */
        .plan-card{background:rgba(233,30,140,0.06);border:1px solid rgba(233,30,140,0.2);border-radius:14px;padding:16px 18px;position:relative;overflow:hidden;}
        .plan-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--fd),var(--fb));}
      `}</style>

      <div className="page">
        <div className="hdr">
          <div>
            <h1 className="hdr-title">Settings</h1>
            <p className="hdr-sub">Manage your account, security, devices and app preferences</p>
          </div>
          <button className="sub-dashboard-btn" onClick={() => navigate("/dashboard")}>
            <span className="sub-dashboard-btn-icon">📊</span>
            Go to Dashboard
          </button>
        </div>

        <div className="layout">

          {/* ── SIDEBAR ── */}
          <div className="sidebar">
            {/* user mini */}
            <div className="user-mini">
              <div className="user-avatar">{user?.name?.charAt(0) ?? "?"}</div>
              <div>
                <div className="user-name">{user?.name ?? "Loading..."}</div>
                <div className="user-plan">⚡ {user?.plan ?? "—"} Plan</div>
              </div>
            </div>

            {tabs.map(t => (
              <button key={t.id} className={`sidebar-tab${activeTab===t.id?" active":""}`}
                onClick={() => setActiveTab(t.id)}>
                <span className="tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}

          </div>

          {/* ── CONTENT ── */}
          <div className="content" key={activeTab}>

            {/* ════ ACCOUNT TAB ════ */}
            {activeTab === "account" && (
              <>
                {/* Profile */}
                <SettingCard>
                  <SectionHeader icon="👤" title="Profile Information" desc="Your basic account details visible only to you." />
                  <SettingInput label="Full Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" disabled={!editingProfile}/>
                  <SettingInput label="Phone Number" value={user?.phone} placeholder="" disabled suffix="Verified ✓"/>
                  <SettingInput label="Email Address" value={email} onChange={e=>setEmail(e.target.value)} placeholder="optional" type="email" disabled={!editingProfile}/>
                  <div style={{display:"flex",gap:10,marginTop:6}}>
                    {!editingProfile
                      ? <button className="btn-primary" onClick={()=>setEditingProfile(true)}>Edit Profile</button>
                      : <>
                          <button className="btn-primary" onClick={saveProfile}>Save Changes</button>
                          <button className="btn-secondary" onClick={()=>setEditingProfile(false)}>Cancel</button>
                        </>
                    }
                  </div>
                </SettingCard>

                {/* Profile only — subscription and danger zone removed */}
              </>
            )}

            {/* ════ SECURITY TAB ════ */}
            {activeTab === "security" && (
              <>
                <SettingCard>
                  <SectionHeader icon="🔒" title="Change Password" desc="Use a strong password with at least 8 characters, numbers and symbols."/>

                  {passError && <div className="err-msg">⚠ {passError}</div>}
                  {passSaved && <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:9,padding:"9px 13px",fontSize:"0.8rem",color:"#22c55e",marginBottom:14}}>✓ Password changed successfully!</div>}

                  <SettingInput
                    label="Current Password"
                    type={showPasses?"text":"password"}
                    value={currentPass}
                    onChange={e=>{setCurrentPass(e.target.value);setPassError("");}}
                    placeholder="Enter current password"
                  />
                  <SettingInput
                    label="New Password"
                    type={showPasses?"text":"password"}
                    value={newPass}
                    onChange={e=>{setNewPass(e.target.value);setPassError("");}}
                    placeholder="Min 8 characters"
                  />
                  <SettingInput
                    label="Confirm New Password"
                    type={showPasses?"text":"password"}
                    value={confirmPass}
                    onChange={e=>{setConfirmPass(e.target.value);setPassError("");}}
                    placeholder="Re-enter new password"
                  />

                  {/* password strength */}
                  {newPass.length > 0 && (
                    <div style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:"0.64rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"#7a7a90"}}>Password Strength</span>
                        <span style={{fontSize:"0.68rem",fontWeight:700,color: newPass.length<6?"#ef4444":newPass.length<10?"#ffa726":"#22c55e"}}>
                          {newPass.length<6?"Weak":newPass.length<10?"Medium":"Strong"}
                        </span>
                      </div>
                      <div style={{height:4,background:"#252530",borderRadius:50,overflow:"hidden"}}>
                        <div style={{height:"100%",width: newPass.length<6?"33%":newPass.length<10?"66%":"100%",
                          background: newPass.length<6?"#ef4444":newPass.length<10?"#ffa726":"#22c55e",
                          borderRadius:50,transition:"all 0.3s"}}/>
                      </div>
                    </div>
                  )}

                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setShowPasses(!showPasses)}>
                      <div style={{width:18,height:18,borderRadius:5,background:showPasses?"var(--f)":"#252530",border:`1.5px solid ${showPasses?"var(--f)":"#32323f"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"}}>
                        {showPasses&&<span style={{color:"#fff",fontSize:"0.6rem",fontWeight:800}}>✓</span>}
                      </div>
                      <span style={{fontSize:"0.8rem",color:"var(--g3)"}}>Show passwords</span>
                    </div>
                  </div>

                  <button className="btn-primary" onClick={changePassword}>Change Password</button>
                </SettingCard>

              </>
            )}

            {/* ════ DEVICES TAB ════ */}
            {activeTab === "devices" && (
              <>
                <SettingCard>
                  <SectionHeader icon="📱" title="Logged-in Devices" desc={`Your ${user?.plan} plan allows ${user?.devicesAllowed} device${user?.devicesAllowed>1?"s":""} simultaneously.`}/>

                  {/* slot indicators */}
                  <div style={{display:"flex",gap:8,marginBottom:20}}>
                    {Array.from({length:user?.devicesAllowed}).map((_,i)=>(
                      <div key={i} style={{flex:1,height:6,borderRadius:50,background:i<devices.length?"var(--fb)":"#32323f",boxShadow:i<devices.length?"0 0 8px rgba(233,30,140,0.4)":"none",transition:"all 0.3s"}}/>
                    ))}
                  </div>
                  <div style={{fontSize:"0.72rem",color:"var(--g4)",marginBottom:20}}>
                    <strong style={{color:"var(--fb)"}}>{devices.length}</strong> of <strong style={{color:"var(--g2)"}}>{user?.devicesAllowed}</strong> device slots used
                  </div>

                  {devices.map(d=>(
                    <div key={d.id} className={`device-card${d.isCurrentDevice?" current":""}`}>
                      <div className="device-icon">{d.icon}</div>
                      <div style={{flex:1}}>
                        <div className="device-name">
                          {d.name}
                          {d.isCurrentDevice && <span style={{marginLeft:8,fontSize:"0.6rem",fontWeight:800,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--fb)",background:"rgba(233,30,140,0.1)",border:"1px solid rgba(233,30,140,0.25)",borderRadius:50,padding:"2px 8px"}}>This device</span>}
                        </div>
                        <div className="device-meta">📍 {d.location} · 🕐 {d.loginTime}</div>
                        <div className="device-active" style={{color:d.lastActive==="Active now"?"#22c55e":"var(--g4)",marginTop:3}}>
                          {d.lastActive==="Active now"?"🟢":"⚪"} {d.lastActive}
                        </div>
                      </div>
                      {!d.isCurrentDevice && (
                        <button className="btn-danger" onClick={()=>setLogoutConfirm(d)}>
                          Log Out
                        </button>
                      )}
                    </div>
                  ))}

                  {devices.length === 0 && (
                    <div style={{textAlign:"center",padding:"24px 0",color:"var(--g4)",fontSize:"0.84rem"}}>No other devices logged in.</div>
                  )}

                  <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #252530"}}>
                    <button className="btn-danger" style={{width:"100%",padding:"11px 0"}} onClick={logoutAllOthers}>
                      🚪 Log Out of All Other Devices
                    </button>
                  </div>
                </SettingCard>

                {/* login history info */}
                <SettingCard>
                  <SectionHeader icon="🕐" title="Session Info" desc="Devices are automatically logged out after 30 days of inactivity."/>
                  <div style={{fontSize:"0.8rem",color:"var(--g4)",lineHeight:1.7}}>
                    If you notice any unfamiliar device, log it out immediately and change your password. Contact support if you suspect unauthorised access.
                  </div>
                </SettingCard>
              </>
            )}
          </div>
        </div>

        {/* ── LOGOUT DEVICE CONFIRM MODAL ── */}
        {logoutConfirm && (
          <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setLogoutConfirm(null)}>
            <div className="modal-box">
              <div style={{fontSize:"2.5rem",marginBottom:12}}>📱</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.5rem",letterSpacing:2,color:"#fff",marginBottom:8}}>Log Out Device?</div>
              <p style={{fontSize:"0.82rem",color:"#7a7a90",lineHeight:1.6,marginBottom:20}}>
                This will sign out <strong style={{color:"#fff"}}>{logoutConfirm.name}</strong> from your SpeedMock account. They will need to log in again.
              </p>
              <div style={{display:"flex",gap:10}}>
                <button className="btn-secondary" style={{flex:1}} onClick={()=>setLogoutConfirm(null)}>Cancel</button>
                <button className="btn-danger" style={{flex:1,borderRadius:50,padding:"10px 0"}} onClick={()=>logoutDevice(logoutConfirm.id)}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUCCESS TOASTS ── */}
        {profileSaved && <div className="toast">✓ Profile saved successfully!</div>}
      </div>
    </>
  );
}