/**
 * ProgressTracker.jsx
 * Global question bank progress — counts ALL questions answered
 * regardless of exam. XP → Rank system with cool names.
 * Drop anywhere in dashboard.
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const CSS = `
@keyframes pt-rise   {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pt-pulse  {0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.82)}}
@keyframes pt-shine  {0%{left:-100%}100%{left:160%}}
@keyframes pt-pop    {0%{transform:scale(1)}40%{transform:scale(1.22)}70%{transform:scale(.92)}100%{transform:scale(1)}}
@keyframes pt-fill   {from{width:0%}to{width:var(--pt-w)}}
@keyframes pt-glow-r {0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes pt-float  {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes pt-confetti{0%{opacity:0;transform:translateY(0) rotate(0deg) scale(1)}10%{opacity:1}100%{opacity:0;transform:translateY(-70px) rotate(400deg) scale(.3)}}
@keyframes pt-levelup{0%{opacity:0;transform:scale(.5) translateY(20px)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pt-rank-glow{0%,100%{box-shadow:0 0 18px var(--lv-color),0 0 40px var(--lv-color2)}50%{box-shadow:0 0 32px var(--lv-color),0 0 70px var(--lv-color2)}}

.pt-wrap{background:var(--bg2);border:1px solid var(--b);border-radius:22px;overflow:hidden;animation:pt-rise .5s ease both;position:relative}
.pt-wrap::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--f),#a855f7,#0ea5e9,var(--f));background-size:200%;animation:pt-shine 4s linear infinite}

/* header */
.pt-header{padding:26px 30px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;border-bottom:1px solid var(--b)}
.pt-title-row{display:flex;align-items:center;gap:14px}
.pt-icon{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,rgba(233,30,140,.2),rgba(168,85,247,.12));border:1px solid rgba(233,30,140,.35);display:flex;align-items:center;justify-content:center;font-size:24px;animation:pt-float 3s ease-in-out infinite}
.pt-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:2.5px;color:var(--t)}
.pt-title-sub{font-size:11px;color:var(--m);margin-top:3px;letter-spacing:.5px}

/* ── DASHBOARD BUTTON ── */
.sub-dashboard-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 16px;border-radius:10px;border:none;
  background:linear-gradient(135deg,var(--f),var(--fl));
  color:#fff;font-size:11px;font-weight:700;
  cursor:pointer;font-family:'Outfit',sans-serif;
  transition:transform .2s ease, box-shadow .2s ease;
  box-shadow:0 4px 16px rgba(233,30,140,.3);
  letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;
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



/* stat pills */
.pt-stats{display:flex;gap:10px;flex-wrap:wrap}
.pt-stat{display:flex;flex-direction:column;align-items:center;padding:11px 20px;border-radius:13px;border:1px solid var(--b);background:var(--bg3);min-width:88px;transition:transform .2s,border-color .2s;cursor:default}
.pt-stat:hover{transform:translateY(-2px)}
.pt-stat.correct{border-color:rgba(34,197,94,.28)}.pt-stat.wrong{border-color:rgba(239,68,68,.28)}.pt-stat.total{border-color:rgba(233,30,140,.28)}.pt-stat.acc{border-color:rgba(14,165,233,.28)}
.pt-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:1px;line-height:1}
.pt-stat.correct .pt-stat-val{color:#22c55e}.pt-stat.wrong .pt-stat-val{color:#ef4444}.pt-stat.total .pt-stat-val{color:var(--f)}.pt-stat.acc .pt-stat-val{color:#0ea5e9}
.pt-stat-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--m);margin-top:3px}

/* rank / level */
.pt-rank-section{padding:26px 30px;border-bottom:1px solid var(--b);position:relative;overflow:hidden}
.pt-rank-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 10% 50%,var(--lv-color,rgba(233,30,140,.06)) 0%,transparent 65%);pointer-events:none}
.pt-rank-row{display:flex;align-items:center;gap:20px;margin-bottom:18px;position:relative;z-index:1}
.pt-rank-badge-wrap{position:relative;width:80px;height:80px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.pt-rank-glow-ring{position:absolute;inset:-5px;border-radius:50%;background:conic-gradient(from 0deg,var(--lv-color,#e91e8c),var(--lv-color2,#a855f7),transparent 60%,var(--lv-color,#e91e8c));animation:pt-glow-r 3s linear infinite;filter:blur(5px);opacity:.6}
.pt-rank-circle{position:relative;width:76px;height:76px;border-radius:50%;background:var(--bg3);border:2px solid var(--lv-color,#e91e8c);display:flex;flex-direction:column;align-items:center;justify-content:center;animation:pt-rank-glow 3s ease-in-out infinite}
.pt-rank-emoji{font-size:26px;line-height:1}
.pt-rank-num{font-family:'Bebas Neue',sans-serif;font-size:1rem;color:var(--lv-color,#e91e8c);letter-spacing:1px;line-height:1}
.pt-rank-info{flex:1}
.pt-rank-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--m);margin-bottom:4px}
.pt-rank-name{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:3px;line-height:1;background:linear-gradient(135deg,var(--lv-color,#e91e8c),var(--lv-color2,#a855f7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pt-rank-aura{font-size:12px;color:var(--m);margin-top:5px;font-style:italic}
.pt-rank-xp{font-size:12px;color:var(--m);margin-top:3px}
.pt-rank-next{font-size:11px;color:var(--f);margin-top:2px;font-weight:600}

/* xp bar */
.pt-xp-wrap{position:relative;z-index:1}
.pt-xp-track{width:100%;height:12px;background:var(--bg3);border-radius:100px;overflow:hidden;border:1px solid var(--b)}
.pt-xp-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,var(--lv-color,#e91e8c),var(--lv-color2,#a855f7));width:var(--pt-w,0%);transition:width 1s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
.pt-xp-fill::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);animation:pt-shine 2s ease-in-out infinite}
.pt-xp-meta{display:flex;justify-content:space-between;font-size:10px;color:var(--m);margin-top:7px}

/* level up overlay */
.pt-lvup-overlay{position:absolute;inset:0;z-index:20;background:rgba(11,11,16,.85);backdrop-filter:blur(6px);border-radius:22px;display:flex;align-items:center;justify-content:center}
.pt-lvup-box{background:linear-gradient(135deg,rgba(233,30,140,.96),rgba(168,85,247,.88));border-radius:22px;padding:32px 40px;text-align:center;box-shadow:0 24px 80px rgba(233,30,140,.55);border:1px solid rgba(255,255,255,.18);animation:pt-levelup .55s cubic-bezier(.34,1.56,.64,1) both}
.pt-lvup-emoji{font-size:56px;display:block;margin-bottom:10px;animation:pt-pop .7s ease}
.pt-lvup-head{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;letter-spacing:4px;color:#fff}
.pt-lvup-rank{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:3px;color:rgba(255,255,255,.9);margin-top:4px}
.pt-lvup-aura{font-size:13px;color:rgba(255,255,255,.7);margin-top:6px;font-style:italic}
.pt-lvup-btn{margin-top:18px;padding:10px 28px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.14);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:background .2s;letter-spacing:.5px}
.pt-lvup-btn:hover{background:rgba(255,255,255,.24)}
.pt-confetti-dot{position:absolute;width:9px;height:9px;border-radius:2px;animation:pt-confetti 1.4s ease forwards;pointer-events:none}

/* subjects */
.pt-subjects{padding:24px 30px;border-bottom:1px solid var(--b)}
.pt-sec-title{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--m);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.pt-sec-title::after{content:'';flex:1;height:1px;background:var(--b)}
.pt-subject-row{display:flex;align-items:center;gap:14px;margin-bottom:12px;padding:12px 14px;border-radius:13px;border:1px solid transparent;transition:background .2s,border-color .2s;cursor:default}
.pt-subject-row:hover{background:var(--bg3);border-color:var(--b)}
.pt-subject-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.pt-subject-name{font-size:13px;font-weight:700;color:var(--t);min-width:170px}
.pt-subject-bar-wrap{flex:1;height:8px;background:var(--bg3);border-radius:100px;overflow:hidden}
.pt-subject-bar{height:100%;border-radius:100px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.pt-subject-nums{font-size:11px;color:var(--m);min-width:80px;text-align:right;white-space:nowrap}
.pt-subject-acc{font-size:12px;font-weight:800;min-width:46px;text-align:right}

/* badges */
.pt-badges{padding:24px 30px}
.pt-badges-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:12px}
.pt-badge{display:flex;flex-direction:column;align-items:center;gap:7px;padding:16px 10px;border-radius:16px;border:1px solid var(--b);background:var(--bg3);cursor:pointer;position:relative;transition:transform .2s,border-color .2s,box-shadow .2s;text-align:center}
.pt-badge.unlocked{border-color:var(--badge-color,rgba(233,30,140,.3))}
.pt-badge.unlocked:hover{transform:translateY(-4px) scale(1.04);box-shadow:0 10px 32px rgba(0,0,0,.35)}
.pt-badge.locked{opacity:.38;filter:grayscale(.9);cursor:default}
.pt-badge-icon{font-size:34px;transition:transform .3s}
.pt-badge.unlocked:hover .pt-badge-icon{transform:scale(1.18) rotate(-6deg)}
.pt-badge-name{font-size:11px;font-weight:700;color:var(--t);line-height:1.3}
.pt-badge-desc{font-size:9px;color:var(--m);line-height:1.4}
.pt-badge-lock{position:absolute;top:8px;right:9px;font-size:11px}
.pt-badge-new{position:absolute;top:-7px;left:50%;transform:translateX(-50%);font-size:7.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:100px;background:var(--f);color:#fff;white-space:nowrap;animation:pt-pulse 2s infinite}
.pt-badge-tip{display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(19,19,26,.97);border:1px solid var(--b);border-radius:10px;padding:8px 12px;font-size:11px;color:var(--t);white-space:nowrap;z-index:30;pointer-events:none}
.pt-badge:hover .pt-badge-tip{display:block}

@media(max-width:680px){
  .pt-header,.pt-rank-section,.pt-subjects,.pt-badges{padding:18px}
  .pt-badges-grid{grid-template-columns:repeat(3,1fr)}
  .pt-subject-name{min-width:110px;font-size:12px}
  .pt-stats{gap:6px}.pt-stat{min-width:72px;padding:9px 12px}
  .pt-rank-name{font-size:1.5rem}
}
`;

/* ── RANK SYSTEM ─────────────────────────────── */
const RANKS = [
  { rank:1,  name:"Ghost",        aura:"Lurking in the shadows",          xp:0,     color:"#555568",  color2:"#888",    emoji:"👻" },
  { rank:2,  name:"Rookie",       aura:"Just getting started",            xp:50,    color:"#7a7a90",  color2:"#9a9ab0", emoji:"🌱" },
  { rank:3,  name:"Grinder",      aura:"Consistent & relentless",         xp:150,   color:"#22c55e",  color2:"#4ade80", emoji:"⚙️" },
  { rank:4,  name:"Hustler",      aura:"No days off",                     xp:350,   color:"#0ea5e9",  color2:"#38bdf8", emoji:"🔥" },
  { rank:5,  name:"Warlord",      aura:"Dominates the question bank",     xp:700,   color:"#f59e0b",  color2:"#fcd34d", emoji:"⚔️" },
  { rank:6,  name:"Legend",       aura:"Few reach this level",            xp:1200,  color:"#e91e8c",  color2:"#ff3aaa", emoji:"🏆" },
  { rank:7,  name:"Pro",          aura:"A cut above the rest",            xp:2000,  color:"#a855f7",  color2:"#c084fc", emoji:"💜" },
  { rank:8,  name:"Aura",         aura:"Radiates mastery",                xp:3500,  color:"#06b6d4",  color2:"#67e8f9", emoji:"✨" },
  { rank:9,  name:"Sigma",        aura:"Operates on a different plane",   xp:5500,  color:"#f59e0b",  color2:"#fde68a", emoji:"🌀" },
  { rank:10, name:"Mythic",       aura:"Beyond ordinary competition",     xp:8000,  color:"#e91e8c",  color2:"#a855f7", emoji:"🔮" },
  { rank:11, name:"Zenz",         aura:"Mind of absolute clarity",        xp:11000, color:"#0ea5e9",  color2:"#a855f7", emoji:"🧘" },
  { rank:12, name:"Phantom",      aura:"Unseen — untouchable",            xp:15000, color:"#888",     color2:"#ccc",    emoji:"🌫️" },
  { rank:13, name:"Infinite",     aura:"The grind never ends",            xp:20000, color:"#ff3aaa",  color2:"#a855f7", emoji:"♾️" },
  { rank:14, name:"Transcendent", aura:"Evolved beyond the system",       xp:28000, color:"#ffd700",  color2:"#fbbf24", emoji:"🌟" },
  { rank:15, name:"GOAT",         aura:"Greatest Of All Time. Period.",   xp:40000, color:"#ffd700",  color2:"#fff",    emoji:"🐐" },
];

function getRank(xp) {
  let cur = RANKS[0], nxt = RANKS[1];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp) { cur = RANKS[i]; nxt = RANKS[i+1]||null; break; }
  }
  const xpIn   = xp - cur.xp;
  const xpNeed = nxt ? nxt.xp - cur.xp : 1;
  const pct    = nxt ? Math.min(100, Math.round((xpIn/xpNeed)*100)) : 100;
  return { cur, nxt, pct, xpIn, xpNeed };
}

function normalizeSubjectName(name) {
  const normalized = (name || "").toLowerCase();
  if (["quantitative aptitude", "quant", "maths", "math", "maths", "quantitative"].includes(normalized)) return "Quantitative Aptitude";
  if (["reasoning", "reasoning ability", "gi"].includes(normalized)) return "Reasoning";
  if (["english language", "english", "eng"].includes(normalized)) return "English Language";
  if (["general awareness", "gk", "ga"].includes(normalized)) return "General Awareness";
  if (["general science", "science", "gen sci", "gs"].includes(normalized)) return "General Science";
  return name || "Uncategorized";
}

/* ── SUBJECTS (universal — not tied to exam) ── */
const SUBJECTS = [
  { id:"qa", name:"Quantitative Aptitude", icon:"🔢", color:"#22c55e" },
  { id:"re", name:"Reasoning",             icon:"🧠", color:"#a855f7" },
  { id:"en", name:"English Language",      icon:"📖", color:"#0ea5e9" },
  { id:"ga", name:"General Awareness",     icon:"🌍", color:"#f59e0b" },
  { id:"sc", name:"General Science",       icon:"🔬", color:"#e91e8c" },
];

/* ── BADGES (universal — count total questions) ── */
function getBadges(total, correct) {
  const acc = total > 0 ? Math.round((correct/total)*100) : 0;
  return [
    { id:"q1",    icon:"🚀", name:"First Blood",    desc:"Solve your first question",     unlocked:total>=1,    color:"rgba(34,197,94,.3)",   tip:"Complete 1 question" },
    { id:"q25",   icon:"🌱", name:"Seedling",        desc:"25 questions done",             unlocked:total>=25,   color:"rgba(14,165,233,.3)",  tip:`${Math.max(0,25-total)} more needed` },
    { id:"q100",  icon:"💪", name:"Centurion",       desc:"100 questions done",            unlocked:total>=100,  color:"rgba(168,85,247,.3)",  tip:`${Math.max(0,100-total)} more needed` },
    { id:"q250",  icon:"⚡", name:"Charged Up",      desc:"250 questions done",            unlocked:total>=250,  color:"rgba(245,158,11,.3)",  tip:`${Math.max(0,250-total)} more needed` },
    { id:"q500",  icon:"🔥", name:"On Fire",         desc:"500 questions done",            unlocked:total>=500,  color:"rgba(233,30,140,.3)",  tip:`${Math.max(0,500-total)} more needed` },
    { id:"q1000", icon:"🏆", name:"Grand Slammer",   desc:"1000 questions done",           unlocked:total>=1000, color:"rgba(168,85,247,.3)",  tip:`${Math.max(0,1000-total)} more needed` },
    { id:"q2500", icon:"🌀", name:"Sigma Grinder",   desc:"2500 questions done",           unlocked:total>=2500, color:"rgba(6,182,212,.3)",   tip:`${Math.max(0,2500-total)} more needed` },
    { id:"q5000", icon:"♾️", name:"Infinite",        desc:"5000 questions done",           unlocked:total>=5000, color:"rgba(255,215,0,.3)",   tip:`${Math.max(0,5000-total)} more needed` },
    { id:"acc60", icon:"🎯", name:"Sharpshooter",    desc:"Reach 60% accuracy",            unlocked:acc>=60,     color:"rgba(34,197,94,.3)",   tip:`Current accuracy: ${acc}%` },
    { id:"acc75", icon:"🦅", name:"Eagle Eye",       desc:"Reach 75% accuracy",            unlocked:acc>=75,     color:"rgba(14,165,233,.3)",  tip:`Current accuracy: ${acc}%` },
    { id:"acc90", icon:"💎", name:"Diamond Mind",    desc:"Reach 90% accuracy",            unlocked:acc>=90,     color:"rgba(255,215,0,.3)",   tip:`Current accuracy: ${acc}%` },
    { id:"acc95", icon:"👑", name:"Flawless",        desc:"Reach 95% accuracy",            unlocked:acc>=95,     color:"rgba(255,215,0,.4)",   tip:`Current accuracy: ${acc}%` },
    { id:"streak7",icon:"🗓️",name:"7-Day Warrior",  desc:"Practice 7 days in a row",      unlocked:false,       color:"rgba(233,30,140,.3)",  tip:"Keep a 7-day streak" },
    { id:"night",  icon:"🌙",name:"Night Owl",       desc:"Solve 50 questions after 10 PM",unlocked:false,       color:"rgba(168,85,247,.3)",  tip:"Practice late night" },
    { id:"speed",  icon:"⚡",name:"Speed Demon",     desc:"Finish a 50Q test under 20 min",unlocked:false,       color:"rgba(245,158,11,.3)",  tip:"Complete a timed test fast" },
    { id:"zenz",   icon:"🧘",name:"Zenz State",      desc:"Reach Zenz rank",               unlocked:total>=5500, color:"rgba(14,165,233,.35)", tip:"Reach Zenz rank (11000 XP)" },
  ];
}

/* ── CONFETTI ── */
function Confetti() {
  const colors = ["#e91e8c","#a855f7","#22c55e","#f59e0b","#0ea5e9","#ffd700","#fff"];
  return <>{Array.from({length:22}).map((_,i) => (
    <div key={i} className="pt-confetti-dot" style={{
      left:`${5+Math.random()*90}%`, top:`${15+Math.random()*50}%`,
      background:colors[i%colors.length],
      animationDelay:`${Math.random()*.5}s`,
      animationDuration:`${.9+Math.random()*.8}s`,
      borderRadius: i%3===0?"50%":"2px",
    }}/>
  ))}</>;
}

/* ── COMPONENT ── */
export default function ProgressTracker({ userId }) {
  const [stats,        setStats]        = useState({ total:0, correct:0, wrong:0, bySubject:{} });
  const [loading,      setLoading]      = useState(true);
  const [showLevelUp,  setShowLevelUp]  = useState(false);
  const [newRank,      setNewRank]      = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevRankRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const resolveUserId = () => {
    if (userId) return userId;
    if (user && user.id) return user.id;
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("speedmock_user");
      if (!raw) return null;
      return JSON.parse(raw)?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!document.getElementById("pt-css")) {
      const s = document.createElement("style");
      s.id = "pt-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const activeUserId = resolveUserId();
    if (!activeUserId) { setLoading(false); return; }
    fetchStats(activeUserId);
  }, [userId, user && user.id]);

  async function fetchStats(activeUserId) {
    setLoading(true);
    try {
      const { data: attempts, error: attemptsError } = await supabase
        .from("practice_attempts")
        .select("question_id, topic_id, is_correct")
        .eq("user_id", activeUserId)
        .order("attempted_at", { ascending: false });

      if (attemptsError) throw attemptsError;

      const total = attempts?.length || 0;
      const correct = (attempts || []).filter((a) => a.is_correct).length;
      const wrong = total - correct;

      const bySubject = {};
      const topicIds = [...new Set((attempts || []).map((a) => a.topic_id).filter(Boolean))];

      if (topicIds.length) {
        const { data: topicRows, error: topicError } = await supabase
          .from("topics")
          .select("id, subject_id, subjects:subject_id(subject_name)")
          .in("id", topicIds);

        if (!topicError && topicRows) {
          const subjectNameByTopicId = {};
          topicRows.forEach((row) => {
            const subjectName = normalizeSubjectName(row.subjects?.subject_name);
            subjectNameByTopicId[row.id] = subjectName;
          });

          (attempts || []).forEach((attempt) => {
            const subjectName = subjectNameByTopicId[attempt.topic_id] || "Uncategorized";
            if (!bySubject[subjectName]) bySubject[subjectName] = [];
            bySubject[subjectName].push(attempt.is_correct ? 100 : 0);
          });
        }
      }

      setStats({ total, correct, wrong, bySubject, attempts: total });
    } catch(err) {
      
    } finally {
      setLoading(false);
    }
  }

  // If there's no logged-in user, prompt to sign in rather than showing empty zeros
  const activeUserId = resolveUserId();
  if (!activeUserId) return (
    <div className="pt-wrap" style={{padding:28, textAlign:"center"}}>
      <div style={{marginBottom:12,color:"var(--m)"}}>Sign in to view your Question Bank Progress and personal stats.</div>
      <div>
        <button className="sub-dashboard-btn" onClick={()=>navigate("/login")}>Sign In</button>
      </div>
    </div>
  );

  const xp       = stats.correct * 2 + (stats.attempts||0) * 5;
  const rankData = getRank(xp);
  const accuracy = stats.total>0 ? Math.round((stats.correct/stats.total)*100) : 0;
  const badges   = getBadges(stats.total, stats.correct);

  useEffect(() => {
    if (prevRankRef.current===null) { prevRankRef.current=rankData.cur.rank; return; }
    if (rankData.cur.rank > prevRankRef.current) {
      setNewRank(rankData.cur);
      setShowLevelUp(true);
      setShowConfetti(true);
      setTimeout(()=>setShowConfetti(false), 1800);
    }
    prevRankRef.current = rankData.cur.rank;
  }, [rankData.cur.rank]);

  const accColor = a => a>=75?"#22c55e":a>=50?"#f59e0b":"#ef4444";

  if (loading) return (
    <div className="pt-wrap" style={{padding:28}}>
      {[80,60,100,70].map((w,i)=>(
        <div key={i} style={{height:16,width:`${w}%`,background:"var(--bg3)",borderRadius:8,marginBottom:14,
          animation:"pt-shine 1.5s infinite linear",backgroundSize:"200% 100%"}}/>
      ))}
    </div>
  );

  return (
    <div className="pt-wrap" data-theme={theme}>

      {/* LEVEL UP */}
      {showLevelUp && newRank && (
        <div className="pt-lvup-overlay">
          {showConfetti && <Confetti/>}
          <div className="pt-lvup-box">
            <span className="pt-lvup-emoji">{newRank.emoji}</span>
            <div className="pt-lvup-head">RANK UP!</div>
            <div className="pt-lvup-rank">{newRank.name}</div>
            <div className="pt-lvup-aura">"{newRank.aura}"</div>
            <button className="pt-lvup-btn" onClick={()=>setShowLevelUp(false)}>
              Let's Keep Going →
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="pt-header">
        <button className="sub-dashboard-btn" onClick={() => navigate("/dashboard")}>
            <span className="sub-dashboard-btn-icon">📊</span>
            Go to Dashboard
          </button>
        <div className="pt-title-row">
          <div className="pt-icon">📊</div>
          <div>
            <div className="pt-title">Question Bank Progress</div>
            <div className="pt-title-sub">Total questions solved across all exams</div>
          </div>
        </div>
        <div className="pt-stats">
          <div className="pt-stat total">
            <div className="pt-stat-val">{stats.total.toLocaleString()}</div>
            <div className="pt-stat-lbl">Attempted</div>
          </div>
          <div className="pt-stat correct">
            <div className="pt-stat-val">{stats.correct.toLocaleString()}</div>
            <div className="pt-stat-lbl">Correct ✓</div>
          </div>
          <div className="pt-stat wrong">
            <div className="pt-stat-val">{stats.wrong.toLocaleString()}</div>
            <div className="pt-stat-lbl">Wrong ✗</div>
          </div>
          <div className="pt-stat acc">
            <div className="pt-stat-val">{accuracy}%</div>
            <div className="pt-stat-lbl">Accuracy</div>
          </div>
        </div>
      </div>

      {/* RANK */}
      <div className="pt-rank-section">
        <div className="pt-rank-bg" style={{"--lv-color":`${rankData.cur.color}15`}}/>
        <div className="pt-rank-row">
          <div className="pt-rank-badge-wrap">
            <div className="pt-rank-glow-ring" style={{"--lv-color":rankData.cur.color,"--lv-color2":rankData.cur.color2}}/>
            <div className="pt-rank-circle" style={{"--lv-color":rankData.cur.color}}>
              <span className="pt-rank-emoji">{rankData.cur.emoji}</span>
              <div className="pt-rank-num">Lv {rankData.cur.rank}</div>
            </div>
          </div>
          <div className="pt-rank-info">
            <div className="pt-rank-label">Current Rank</div>
            <div className="pt-rank-name" style={{"--lv-color":rankData.cur.color,"--lv-color2":rankData.cur.color2}}>
              {rankData.cur.name}
            </div>
            <div className="pt-rank-aura">"{rankData.cur.aura}"</div>
            <div className="pt-rank-xp">{xp.toLocaleString()} XP</div>
            {rankData.nxt
              ? <div className="pt-rank-next">{(rankData.xpNeed-rankData.xpIn).toLocaleString()} XP to {rankData.nxt.emoji} {rankData.nxt.name}</div>
              : <div className="pt-rank-next" style={{color:"#ffd700"}}>🐐 Maximum Rank — You Are The GOAT</div>
            }
          </div>
        </div>
        <div className="pt-xp-wrap">
          <div className="pt-xp-track">
            <div className="pt-xp-fill" style={{
              "--pt-w":`${rankData.pct}%`, width:`${rankData.pct}%`,
              background:`linear-gradient(90deg,${rankData.cur.color},${rankData.cur.color2})`,
            }}/>
          </div>
          <div className="pt-xp-meta">
            <span>{rankData.cur.emoji} {rankData.cur.name} — Rank {rankData.cur.rank}</span>
            <span>{rankData.pct}%{rankData.nxt?` → ${rankData.nxt.name}`:""}</span>
          </div>
        </div>
      </div>

      {/* SUBJECTS */}
      <div className="pt-subjects">
        <div className="pt-sec-title">Subject Breakdown</div>
        {SUBJECTS.map(sub => {
          const vals   = stats.bySubject[sub.name]||[];
          const subAcc = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
          return (
            <div key={sub.id} className="pt-subject-row">
              <div className="pt-subject-icon" style={{background:`${sub.color}20`}}>{sub.icon}</div>
              <div className="pt-subject-name">{sub.name}</div>
              <div className="pt-subject-bar-wrap">
                <div className="pt-subject-bar" style={{width:`${subAcc}%`,background:`linear-gradient(90deg,${sub.color},${sub.color}88)`}}/>
              </div>
              <div className="pt-subject-nums">{vals.length} attempts</div>
              <div className="pt-subject-acc" style={{color:accColor(subAcc)}}>{subAcc}%</div>
            </div>
          );
        })}
      </div>

      {/* BADGES */}
      <div className="pt-badges">
        <div className="pt-sec-title">
          Achievements
          <span style={{color:"var(--f)",fontWeight:700,letterSpacing:0,textTransform:"none",fontSize:12}}>
            {badges.filter(b=>b.unlocked).length}/{badges.length} unlocked
          </span>
        </div>
        <div className="pt-badges-grid">
          {badges.map(b=>(
            <div key={b.id} className={`pt-badge ${b.unlocked?"unlocked":"locked"}`} style={{"--badge-color":b.color}}>
              {b.unlocked && b.isNew && <div className="pt-badge-new">NEW</div>}
              <span className="pt-badge-icon">{b.icon}</span>
              <div className="pt-badge-name">{b.name}</div>
              <div className="pt-badge-desc">{b.desc}</div>
              {!b.unlocked && <span className="pt-badge-lock">🔒</span>}
              <div className="pt-badge-tip">{b.tip}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
