
import { useNavigate, useLocation } from "react-router-dom"; 
import DashboardNavbar from "../../components/common/dashboardNavbar";
import Footer from "../../components/common/footer";
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../components/subscription/usesubscription';
import { useExam } from '../../context/ExamContext';
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../services/supabaseClient";
import { resolveExamId } from "../../components/home/test/UseTestList";
import { useAnalytics } from "../../services/useanalytics";

  
      


/* ════════════════════════════════════════════════════════════════
   CSS
════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--bg4:#21212e;--b:#1e1e2c;
--f:#e91e8c;--fl:#ff3aaa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--purple:#a855f7;
--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}

@keyframes do-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes do-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes do-shine{0%{left:-100%}100%{left:160%}}
@keyframes do-glow-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes do-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes do-tick{0%{transform:scale(1)}30%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes do-ring-pop{from{stroke-dasharray:0 999}to{stroke-dasharray:var(--ring-dash) 999}}
@keyframes do-shimmer-bg{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes do-confetti{0%{opacity:0;transform:translateY(0) rotate(0deg)}10%{opacity:1}100%{opacity:0;transform:translateY(40px) rotate(180deg)}}

.do-page{min-height:100vh;background:var(--bg);padding-top:62px;padding-bottom:60px}

/* ── HEADER ── */
.do-header{padding:20px 40px 8px;animation:do-rise .4s ease both}
.do-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;gap:7px;margin-bottom:6px}
.do-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:do-pulse 2s infinite}
.do-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);letter-spacing:3px;color:var(--t);line-height:1}
.do-sub{font-size:13px;color:var(--m);margin-top:6px}

.do-exam-pill{
  display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;
  background:rgba(233,30,140,.09);border:1px solid rgba(233,30,140,.25);
  font-size:12px;font-weight:600;color:var(--f);margin-top:14px;
}

/* ════════════════════════════════════════════════════════════════
   SUBSCRIPTION BANNER — premium glassy card with animated glow
════════════════════════════════════════════════════════════════ */
.do-sub-banner{
  position:relative;margin-bottom:28px;padding:22px 26px;border-radius:18px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:18px;
  animation:do-rise .5s ease both;border:1px solid;overflow:hidden;
  backdrop-filter:blur(10px);
}

/* animated background glow orb */
.do-sub-banner::before{
  content:'';position:absolute;width:280px;height:280px;border-radius:50%;
  top:50%;left:-40px;transform:translateY(-50%);pointer-events:none;filter:blur(40px);opacity:.5;
}

/* subtle moving shine sweep */
.do-sub-banner::after{
  content:'';position:absolute;top:0;left:-100%;width:45%;height:100%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.06),transparent);
  animation:do-shine 5s ease-in-out infinite;pointer-events:none;
}

.do-sub-banner.trial{
  background:linear-gradient(135deg,rgba(233,30,140,.1),rgba(168,85,247,.04) 60%,var(--bg2));
  border-color:rgba(233,30,140,.28);
}
.do-sub-banner.trial::before{background:radial-gradient(circle,var(--f),transparent 70%)}

.do-sub-banner.active{
  background:linear-gradient(135deg,rgba(34,197,94,.1),rgba(14,165,233,.04) 60%,var(--bg2));
  border-color:rgba(34,197,94,.3);
}
.do-sub-banner.active::before{background:radial-gradient(circle,var(--green),transparent 70%)}

.do-sub-banner.expired{
  background:linear-gradient(135deg,rgba(239,68,68,.1),rgba(245,158,11,.04) 60%,var(--bg2));
  border-color:rgba(239,68,68,.32);
}
.do-sub-banner.expired::before{background:radial-gradient(circle,var(--red),transparent 70%)}

.do-sub-left{display:flex;align-items:center;gap:16px;position:relative;z-index:1}

.do-sub-icon{
  width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;
  font-size:24px;flex-shrink:0;position:relative;animation:do-float 3.5s ease-in-out infinite;
  box-shadow:0 4px 18px rgba(0,0,0,.25);
}
.do-sub-banner.trial .do-sub-icon{background:linear-gradient(135deg,rgba(233,30,140,.25),rgba(233,30,140,.08));border:1px solid rgba(233,30,140,.35)}
.do-sub-banner.active .do-sub-icon{background:linear-gradient(135deg,rgba(34,197,94,.25),rgba(34,197,94,.08));border:1px solid rgba(34,197,94,.35)}
.do-sub-banner.expired .do-sub-icon{background:linear-gradient(135deg,rgba(239,68,68,.25),rgba(239,68,68,.08));border:1px solid rgba(239,68,68,.35)}

.do-sub-title{font-size:15px;font-weight:800;color:var(--t);display:flex;align-items:center;gap:9px;letter-spacing:.3px}
.do-sub-sub{font-size:12.5px;color:var(--m);margin-top:3px;line-height:1.5}
.do-sub-sub strong{color:var(--t);font-weight:700}

.do-sub-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;animation:do-pulse 2s infinite}
.do-sub-banner.trial .do-sub-dot{background:var(--f);box-shadow:0 0 8px var(--f)}
.do-sub-banner.active .do-sub-dot{background:var(--green);box-shadow:0 0 8px var(--green)}
.do-sub-banner.expired .do-sub-dot{background:var(--red);box-shadow:0 0 8px var(--red)}

.do-sub-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap;position:relative;z-index:1}

/* ── LIVE COUNTDOWN TIMER ── */
.do-countdown{display:flex;gap:6px;align-items:center}
.do-countdown-unit{
  display:flex;flex-direction:column;align-items:center;gap:2px;
  background:rgba(255,255,255,.04);border:1px solid var(--b);border-radius:10px;
  padding:8px 11px;min-width:50px;backdrop-filter:blur(4px);
}
.do-countdown-val{
  font-family:'DM Mono',monospace;font-size:1.25rem;font-weight:700;color:var(--t);
  line-height:1;animation:do-tick .5s ease;
}
.do-countdown-lbl{font-size:8.5px;color:var(--m);letter-spacing:1.5px;text-transform:uppercase;margin-top:1px}
.do-countdown-sep{color:var(--m2);font-family:'DM Mono',monospace;font-weight:700;font-size:1.1rem;margin-top:-8px}

/* ── TESTS-USED PROGRESS RING ── */
.do-test-ring-wrap{position:relative;width:54px;height:54px;flex-shrink:0}
.do-test-ring-wrap svg{transform:rotate(-90deg)}
.do-test-ring-track{stroke:rgba(255,255,255,.06)}
.do-test-ring-fill{stroke:var(--f);stroke-linecap:round;transition:stroke-dasharray .8s cubic-bezier(.34,1.56,.64,1)}
.do-test-ring-center{
  position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
}
.do-test-ring-val{font-family:'Bebas Neue',sans-serif;font-size:1rem;color:var(--t);line-height:1}
.do-test-ring-lbl{font-size:7px;color:var(--m);letter-spacing:1px;text-transform:uppercase;margin-top:1px}

.do-sub-chip{
  background:rgba(255,255,255,.04);border:1px solid var(--b);border-radius:10px;
  padding:8px 14px;text-align:center;min-width:64px;backdrop-filter:blur(4px);
}
.do-sub-chip-val{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--t);line-height:1}
.do-sub-chip-lbl{font-size:9px;color:var(--m);letter-spacing:1px;margin-top:2px;text-transform:uppercase}

.do-sub-btn{
  position:relative;padding:11px 24px;border-radius:10px;border:none;font-size:13px;font-weight:800;
  cursor:pointer;font-family:'Outfit',sans-serif;transition:all .25s;white-space:nowrap;
  background:linear-gradient(135deg,var(--f),var(--fl));color:#fff;letter-spacing:.3px;
  box-shadow:0 4px 18px rgba(233,30,140,.3);overflow:hidden;
}
.do-sub-btn::before{
  content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
  transform:skewX(-20deg);transition:left .5s;
}
.do-sub-btn:hover{box-shadow:0 8px 28px rgba(233,30,140,.45);transform:translateY(-2px) scale(1.02)}
.do-sub-btn:hover::before{left:160%}
.do-sub-banner.expired .do-sub-btn{
  background:linear-gradient(135deg,var(--red),#ff6b6b);box-shadow:0 4px 18px rgba(239,68,68,.3);
}
.do-sub-banner.expired .do-sub-btn:hover{box-shadow:0 8px 28px rgba(239,68,68,.45)}

/* urgency badge for last day */
.do-urgent-badge{
  display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;letter-spacing:1px;
  text-transform:uppercase;padding:4px 10px;border-radius:100px;
  background:rgba(245,158,11,.15);color:var(--amber);border:1px solid rgba(245,158,11,.3);
  animation:do-pulse 1.5s infinite;margin-left:8px;
}

/* ════════════════════════════════════════════════════════════════
   LOCK OVERLAY — glassmorphism with animated glow ring
════════════════════════════════════════════════════════════════ */
.do-locked{position:relative;border-radius:18px;min-height:280px}
.do-locked-content{filter:blur(6px) saturate(.6);opacity:.35;pointer-events:none;user-select:none;transform:scale(.99)}
.do-lock-overlay{
  position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;z-index:5;border-radius:18px;text-align:center;padding:20px;
  background:rgba(11,11,16,.55);backdrop-filter:blur(2px);
  animation:do-rise .4s ease both;
}
.do-lock-icon-wrap{position:relative;width:64px;height:64px;display:flex;align-items:center;justify-content:center}
.do-lock-icon-glow{
  position:absolute;inset:-8px;border-radius:50%;
  background:conic-gradient(from 0deg,var(--f),var(--purple),var(--f));
  animation:do-glow-rotate 3s linear infinite;opacity:.35;filter:blur(6px);
}
.do-lock-icon{
  position:relative;width:60px;height:60px;border-radius:16px;
  background:linear-gradient(135deg,rgba(233,30,140,.18),rgba(168,85,247,.12));
  border:1px solid rgba(233,30,140,.35);display:flex;align-items:center;justify-content:center;
  font-size:26px;animation:do-float 3s ease-in-out infinite;
  box-shadow:0 8px 24px rgba(233,30,140,.2);
}
.do-lock-title{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:2.5px;color:var(--t)}
.do-lock-sub{font-size:12.5px;color:var(--m);text-align:center;max-width:340px;line-height:1.7}

/* ── BODY ── */
.do-body{padding:24px 40px}
.do-section{margin-bottom:32px;animation:do-rise .5s ease both}
.do-section-label{
  font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--m);
  margin-bottom:16px;display:flex;align-items:center;gap:10px;
}
.do-section-label::after{content:'';flex:1;height:1px;background:var(--b)}
.do-section-link{font-size:11px;color:var(--f);cursor:pointer;text-decoration:none;letter-spacing:0;
font-weight:600;text-transform:none;white-space:nowrap}
.do-section-link:hover{color:var(--fl)}

/* ── QUICK LINKS — Syllabus & Exam Pattern (full pages) ── */
.do-quick-links{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.do-quick-link{
  display:flex;align-items:center;gap:14px;background:var(--bg2);border:1px solid var(--b);
  border-radius:14px;padding:16px 18px;cursor:pointer;transition:all .2s;
}
.do-quick-link:hover{border-color:rgba(233,30,140,.3);transform:translateY(-2px)}
.do-quick-icon{
  width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;
  font-size:19px;flex-shrink:0;
}
.do-quick-text{flex:1}
.do-quick-title{font-size:13.5px;font-weight:700;color:var(--t)}
.do-quick-sub{font-size:11px;color:var(--m);margin-top:2px}
.do-quick-arrow{font-size:18px;color:var(--m);transition:all .2s}
.do-quick-link:hover .do-quick-arrow{color:var(--f);transform:translateX(3px)}

/* ── SECTION 2: ANALYTICS CARD ── */
.do-analytics-card{
  background:linear-gradient(135deg,rgba(233,30,140,.08),var(--bg2) 60%);
  border:1px solid rgba(233,30,140,.25);border-radius:18px;padding:28px;
  display:flex;align-items:center;gap:24px;cursor:pointer;position:relative;overflow:hidden;
  transition:transform .2s,border-color .2s;
}
.do-analytics-card:hover{transform:translateY(-3px);border-color:rgba(233,30,140,.4)}
.do-analytics-card::after{
  content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);
  animation:do-shine 3s infinite;
}
.do-analytics-icon{
  width:72px;height:72px;border-radius:18px;background:rgba(233,30,140,.12);
  display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;
  border:1px solid rgba(233,30,140,.25);
}
.do-analytics-info{flex:1}
.do-analytics-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:2px;color:var(--t);margin-bottom:4px}
.do-analytics-sub{font-size:12.5px;color:var(--m);line-height:1.6;max-width:480px}
.do-analytics-stats{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap}
.do-analytics-stat{display:flex;flex-direction:column}
.do-analytics-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--f);letter-spacing:1px}
.do-analytics-stat-lbl{font-size:9px;color:var(--m);text-transform:uppercase;letter-spacing:1px}
.do-analytics-arrow{font-size:24px;color:var(--f);flex-shrink:0}

/* ── SECTION 3: TEST SERIES CARDS ── */
.do-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.do-test-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:16px;padding:22px;
  cursor:pointer;transition:transform .2s,border-color .2s;display:flex;flex-direction:column;gap:14px;
}
.do-test-card:hover{transform:translateY(-3px);border-color:rgba(233,30,140,.3)}
.do-test-icon{width:48px;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px}
.do-test-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:1.5px;color:var(--t)}
.do-test-desc{font-size:12px;color:var(--m);line-height:1.6;flex:1}
.do-test-footer{display:flex;align-items:center;justify-content:space-between;font-size:11px}
.do-test-count{font-family:'DM Mono',monospace;color:var(--f);font-weight:600}
.do-test-cta{color:var(--m);font-weight:600;display:flex;align-items:center;gap:4px;transition:color .2s}
.do-test-card:hover .do-test-cta{color:var(--f)}

/* ── SECTION 4: SUBJECT QUESTION BANK ── */
.do-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.do-subject-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:14px;padding:20px;
  cursor:pointer;transition:transform .2s,border-color .2s;position:relative;overflow:hidden;
}
.do-subject-card:hover{transform:translateY(-3px);border-color:rgba(233,30,140,.3)}
.do-subject-icon{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;
font-size:20px;margin-bottom:14px}
.do-subject-name{font-size:13.5px;font-weight:700;color:var(--t);margin-bottom:4px}
.do-subject-count{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:1px;margin-bottom:2px}
.do-subject-sub{font-size:10.5px;color:var(--m)}
.do-subject-badge{
  position:absolute;top:14px;right:14px;font-size:9px;font-weight:800;letter-spacing:1px;
  text-transform:uppercase;padding:3px 8px;border-radius:100px;
  background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.2);
}

@keyframes do-skeleton-pulse{0%,100%{opacity:.5}50%{opacity:.9}}
.do-sub-banner-skeleton{
  height:84px;border-radius:18px;margin-bottom:28px;background:var(--bg2);
  border:1px solid var(--b);animation:do-skeleton-pulse 1.4s ease-in-out infinite;
}

@media(max-width:1000px){
  .do-grid-3{grid-template-columns:1fr 1fr}
  .do-grid-4{grid-template-columns:1fr 1fr}

  /* Subscription banner: the timer + ring + chip + button row was only
     relying on plain flex-wrap with no dedicated breakpoint, so on
     tablets/small laptops it wrapped messily mid-row instead of
     cleanly stacking. This forces a clean two-row layout instead. */
  .do-sub-banner{flex-direction:column;align-items:flex-start}
  .do-sub-right{width:100%;justify-content:space-between}

  /* Lock overlay's subscribe button and message text had no scaling
     for medium widths — keeps them readable without overflowing. */
  .do-lock-sub{max-width:90%}
}
@media(max-width:680px){
  .do-header,.do-body{padding-left:20px;padding-right:20px}
  .do-grid-3{grid-template-columns:1fr}
  .do-grid-4{grid-template-columns:1fr 1fr}
  .do-quick-links{grid-template-columns:1fr}
  .do-analytics-card{flex-direction:column;text-align:center}
  .do-analytics-stats{justify-content:center}
  .do-sub-right{justify-content:center;text-align:center}
}
`;

const inject = () => {
  if (document.getElementById("do-css")) return;
  const s = document.createElement("style");
  s.id = "do-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ════════════════════════════════════════════════════════════════
   EXAM DATA — syllabus + pattern per exam
   Replace with Supabase query: exams table → syllabus_topics, pattern_sections
════════════════════════════════════════════════════════════════ */
const EXAM_INFO = {
  cgl: {
    name: "SSC CGL",
    fullName: "Combined Graduate Level Examination",
    syllabus: [
      { name: "General Intelligence & Reasoning", color: "#0ea5e9", tag: "Tier I" },
      { name: "General Awareness",                color: "#f59e0b", tag: "Tier I" },
      { name: "Quantitative Aptitude",            color: "#22c55e", tag: "Tier I" },
      { name: "English Comprehension",            color: "#e91e8c", tag: "Tier I" },
      { name: "Statistics & Economics",           color: "#a855f7", tag: "Tier II", updated: true },
    ],
    pattern: {
      sections: [
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 25, marks: 50, time: 15 },
        { name: "General Awareness",                color: "#f59e0b", questions: 25, marks: 50, time: 15 },
        { name: "Quantitative Aptitude",            color: "#22c55e", questions: 25, marks: 50, time: 15 },
        { name: "English Comprehension",            color: "#e91e8c", questions: 25, marks: 50, time: 15 },
      ],
      totalQuestions: 100, totalMarks: 200, totalTime: 60,
      footnote: "Negative marking of 0.5 marks per wrong answer. Tier-I is qualifying + merit. Last updated for 2026 pattern.",
    },
    subjects: [
      { id: "qa", name: "Quantitative Aptitude", icon: "🔢", color: "rgba(34,197,94,.1)", count: "1,200+" },
      { id: "re", name: "Reasoning",             icon: "🧠", color: "rgba(168,85,247,.1)", count: "1,000+" },
      { id: "en", name: "English",               icon: "📖", color: "rgba(14,165,233,.1)", count: "1,500+" },
      { id: "ga", name: "General Awareness",     icon: "🌍", color: "rgba(245,158,11,.1)", count: "2,000+" },
    ],
  },

  cpo: {
    name: "SSC CPO",
    fullName: "Central Police Organisation — SI/ASI",
    syllabus: [
      { name: "General Intelligence & Reasoning", color: "#0ea5e9", tag: "Paper I" },
      { name: "General Knowledge & Awareness",    color: "#f59e0b", tag: "Paper I" },
      { name: "Quantitative Aptitude",            color: "#22c55e", tag: "Paper I" },
      { name: "English Comprehension",            color: "#e91e8c", tag: "Paper I" },
      { name: "English Language & Comprehension", color: "#a855f7", tag: "Paper II", updated: true },
    ],
    pattern: {
      sections: [
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 50, marks: 50, time: 30 },
        { name: "General Knowledge & Awareness",    color: "#f59e0b", questions: 50, marks: 50, time: 30 },
        { name: "Quantitative Aptitude",            color: "#22c55e", questions: 50, marks: 50, time: 30 },
        { name: "English Comprehension",            color: "#e91e8c", questions: 50, marks: 50, time: 30 },
      ],
      totalQuestions: 200, totalMarks: 200, totalTime: 120,
      footnote: "Negative marking of 0.25 marks per wrong answer in Paper I. PET/PST conducted after Paper I.",
    },
    subjects: [
      { id: "qa", name: "Quantitative Aptitude", icon: "🔢", color: "rgba(34,197,94,.1)", count: "900+" },
      { id: "re", name: "Reasoning",             icon: "🧠", color: "rgba(168,85,247,.1)", count: "850+" },
      { id: "en", name: "English",               icon: "📖", color: "rgba(14,165,233,.1)", count: "1,100+" },
      { id: "ga", name: "General Awareness",     icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,400+" },
    ],
  },

  mts: {
    name: "SSC MTS",
    fullName: "Multi-Tasking Staff & Havaldar",
    syllabus: [
      { name: "General Intelligence & Reasoning", color: "#0ea5e9", tag: "Paper I" },
      { name: "Numerical & Mathematical Ability", color: "#22c55e", tag: "Paper I" },
      { name: "General Awareness",                color: "#f59e0b", tag: "Paper I" },
      { name: "English Language",                 color: "#e91e8c", tag: "Paper I", updated: true },
    ],
    pattern: {
      sections: [
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 20, marks: 20, time: 22.5 },
        { name: "Numerical & Mathematical Ability",  color: "#22c55e", questions: 20, marks: 20, time: 22.5 },
        { name: "General Awareness",                 color: "#f59e0b", questions: 20, marks: 20, time: 22.5 },
        { name: "English Language",                  color: "#e91e8c", questions: 20, marks: 20, time: 22.5 },
      ],
      totalQuestions: 80, totalMarks: 80, totalTime: 90,
      footnote: "Negative marking of 0.25 marks per wrong answer. PET/PST required for Havaldar posts.",
    },
    subjects: [
      { id: "qa", name: "Numerical Ability", icon: "🔢", color: "rgba(34,197,94,.1)", count: "700+" },
      { id: "re", name: "Reasoning",         icon: "🧠", color: "rgba(168,85,247,.1)", count: "650+" },
      { id: "en", name: "English",           icon: "📖", color: "rgba(14,165,233,.1)", count: "800+" },
      { id: "ga", name: "General Awareness", icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,200+" },
    ],
  },

  chsl: {
    name: "SSC CHSL",
    fullName: "Combined Higher Secondary Level",
    syllabus: [
      { name: "General Intelligence",  color: "#0ea5e9", tag: "Tier I" },
      { name: "General Awareness",     color: "#f59e0b", tag: "Tier I" },
      { name: "Quantitative Aptitude", color: "#22c55e", tag: "Tier I" },
      { name: "English Language",      color: "#e91e8c", tag: "Tier I" },
      { name: "Typing / Skill Test",   color: "#a855f7", tag: "Tier II", updated: true },
    ],
    pattern: {
      sections: [
        { name: "General Intelligence",  color: "#0ea5e9", questions: 25, marks: 50, time: 15 },
        { name: "General Awareness",     color: "#f59e0b", questions: 25, marks: 50, time: 15 },
        { name: "Quantitative Aptitude", color: "#22c55e", questions: 25, marks: 50, time: 15 },
        { name: "English Language",      color: "#e91e8c", questions: 25, marks: 50, time: 15 },
      ],
      totalQuestions: 100, totalMarks: 200, totalTime: 60,
      footnote: "Negative marking of 0.5 marks per wrong answer. Tier-II includes typing/skill test for DEO & LDC/JSA posts.",
    },
    subjects: [
      { id: "qa", name: "Quantitative Aptitude", icon: "🔢", color: "rgba(34,197,94,.1)", count: "1,100+" },
      { id: "re", name: "Reasoning",             icon: "🧠", color: "rgba(168,85,247,.1)", count: "950+" },
      { id: "en", name: "English",               icon: "📖", color: "rgba(14,165,233,.1)", count: "1,300+" },
      { id: "ga", name: "General Awareness",     icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,700+" },
    ],
  },

  gd: {
    name: "SSC GD",
    fullName: "General Duty Constable",
    syllabus: [
      { name: "General Intelligence & Reasoning", color: "#0ea5e9", tag: "CBT" },
      { name: "General Knowledge & Awareness",    color: "#f59e0b", tag: "CBT" },
      { name: "Elementary Mathematics",           color: "#22c55e", tag: "CBT" },
      { name: "English / Hindi",                  color: "#e91e8c", tag: "CBT", updated: true },
    ],
    pattern: {
      sections: [
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 20, marks: 20, time: 15 },
        { name: "General Knowledge & Awareness",    color: "#f59e0b", questions: 20, marks: 20, time: 15 },
        { name: "Elementary Mathematics",           color: "#22c55e", questions: 20, marks: 20, time: 15 },
        { name: "English / Hindi",                  color: "#e91e8c", questions: 20, marks: 20, time: 15 },
      ],
      totalQuestions: 80, totalMarks: 80, totalTime: 60,
      footnote: "Negative marking of 0.25 marks per wrong answer. PET/PST and Medical exam follow CBT.",
    },
    subjects: [
      { id: "qa", name: "Elementary Maths", icon: "🔢", color: "rgba(34,197,94,.1)", count: "650+" },
      { id: "re", name: "Reasoning",        icon: "🧠", color: "rgba(168,85,247,.1)", count: "600+" },
      { id: "en", name: "English/Hindi",    icon: "📖", color: "rgba(14,165,233,.1)", count: "700+" },
      { id: "ga", name: "General Awareness",icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,300+" },
    ],
  },

  ntpc: {
    name: "Railway NTPC",
    fullName: "Non-Technical Popular Categories",
    syllabus: [
      { name: "General Awareness", color: "#f59e0b", tag: "CBT 1" },
      { name: "Mathematics",       color: "#22c55e", tag: "CBT 1" },
      { name: "General Intelligence & Reasoning", color: "#0ea5e9", tag: "CBT 1" },
      { name: "General Science",   color: "#a855f7", tag: "CBT 2", updated: true },
    ],
    pattern: {
      sections: [
        { name: "Mathematics",      color: "#22c55e", questions: 30, marks: 30, time: 30 },
        { name: "Reasoning",        color: "#0ea5e9", questions: 30, marks: 30, time: 30 },
        { name: "General Awareness",color: "#f59e0b", questions: 40, marks: 40, time: 30 },
      ],
      totalQuestions: 100, totalMarks: 100, totalTime: 90,
      footnote: "1/3 negative marking for CBT 1. CBT 2 has additional 20 questions on General Science.",
    },
    subjects: [
      { id: "qa", name: "Mathematics",     icon: "🔢", color: "rgba(34,197,94,.1)", count: "900+" },
      { id: "re", name: "Reasoning",       icon: "🧠", color: "rgba(168,85,247,.1)", count: "850+" },
      { id: "ga", name: "Gen. Awareness",  icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,800+" },
      { id: "sc", name: "General Science", icon: "🔬", color: "rgba(14,165,233,.1)", count: "700+" },
    ],
  },

  alp: {
    name: "Railway ALP",
    fullName: "Assistant Loco Pilot",
    syllabus: [
      { name: "Mathematics",                       color: "#22c55e", tag: "CBT 1" },
      { name: "General Intelligence & Reasoning",  color: "#0ea5e9", tag: "CBT 1" },
      { name: "General Science",                   color: "#a855f7", tag: "CBT 1" },
      { name: "General Awareness & Current Affairs", color: "#f59e0b", tag: "CBT 1" },
      { name: "Basic Science & Engineering",       color: "#e91e8c", tag: "CBT 2", updated: true },
    ],
    pattern: {
      sections: [
        { name: "Mathematics",                      color: "#22c55e", questions: 20, marks: 20, time: 15 },
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 25, marks: 25, time: 15 },
        { name: "General Science",                  color: "#a855f7", questions: 20, marks: 20, time: 15 },
        { name: "General Awareness",                color: "#f59e0b", questions: 10, marks: 10, time: 15 },
      ],
      totalQuestions: 75, totalMarks: 75, totalTime: 60,
      footnote: "1/3 negative marking for CBT 1 & 2. CBT 2 Part B (Basic Science & Engineering) is qualifying only.",
    },
    subjects: [
      { id: "qa", name: "Mathematics",       icon: "🔢", color: "rgba(34,197,94,.1)", count: "750+" },
      { id: "re", name: "Reasoning",         icon: "🧠", color: "rgba(168,85,247,.1)", count: "700+" },
      { id: "sc", name: "General Science",   icon: "🔬", color: "rgba(14,165,233,.1)", count: "850+" },
      { id: "ga", name: "General Awareness", icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,000+" },
    ],
  },

  je: {
    name: "Railway JE",
    fullName: "Junior Engineer",
    syllabus: [
      { name: "Mathematics",                      color: "#22c55e", tag: "CBT 1" },
      { name: "General Intelligence & Reasoning", color: "#0ea5e9", tag: "CBT 1" },
      { name: "General Awareness",                color: "#f59e0b", tag: "CBT 1" },
      { name: "General Science",                  color: "#a855f7", tag: "CBT 1" },
      { name: "Technical / Engineering Subjects",  color: "#e91e8c", tag: "CBT 2", updated: true },
    ],
    pattern: {
      sections: [
        { name: "Mathematics",                      color: "#22c55e", questions: 25, marks: 25, time: 22.5 },
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 25, marks: 25, time: 22.5 },
        { name: "General Awareness",                color: "#f59e0b", questions: 10, marks: 10, time: 22.5 },
        { name: "General Science",                  color: "#a855f7", questions: 15, marks: 15, time: 22.5 },
      ],
      totalQuestions: 75, totalMarks: 75, totalTime: 90,
      footnote: "1/3 negative marking. CBT 2 focuses on technical/engineering subject of chosen discipline.",
    },
    subjects: [
      { id: "qa", name: "Mathematics",     icon: "🔢", color: "rgba(34,197,94,.1)", count: "800+" },
      { id: "re", name: "Reasoning",       icon: "🧠", color: "rgba(168,85,247,.1)", count: "700+" },
      { id: "sc", name: "General Science", icon: "🔬", color: "rgba(14,165,233,.1)", count: "900+" },
      { id: "ga", name: "Gen. Awareness",  icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,000+" },
    ],
  },

  groupd: {
    name: "Railway Group D",
    fullName: "Level 1 Posts — Track Maintainer, Helper & more",
    syllabus: [
      { name: "Mathematics",                       color: "#22c55e", tag: "CBT" },
      { name: "General Intelligence & Reasoning",  color: "#0ea5e9", tag: "CBT" },
      { name: "General Science",                    color: "#a855f7", tag: "CBT" },
      { name: "General Awareness & Current Affairs", color: "#f59e0b", tag: "CBT", updated: true },
    ],
    pattern: {
      sections: [
        { name: "Mathematics",                      color: "#22c55e", questions: 25, marks: 25, time: 22.5 },
        { name: "General Intelligence & Reasoning", color: "#0ea5e9", questions: 30, marks: 30, time: 22.5 },
        { name: "General Science",                  color: "#a855f7", questions: 25, marks: 25, time: 22.5 },
        { name: "General Awareness",                color: "#f59e0b", questions: 20, marks: 20, time: 22.5 },
      ],
      totalQuestions: 100, totalMarks: 100, totalTime: 90,
      footnote: "1/3 negative marking. PET and Document Verification follow the CBT.",
    },
    subjects: [
      { id: "qa", name: "Mathematics",     icon: "🔢", color: "rgba(34,197,94,.1)", count: "700+" },
      { id: "re", name: "Reasoning",       icon: "🧠", color: "rgba(168,85,247,.1)", count: "650+" },
      { id: "sc", name: "General Science", icon: "🔬", color: "rgba(14,165,233,.1)", count: "850+" },
      { id: "ga", name: "Gen. Awareness",  icon: "🌍", color: "rgba(245,158,11,.1)", count: "1,100+" },
    ],
  },
};

/* ════════════════════════════════════════════════════════════════
   LIVE COUNTDOWN HOOK
   ────────────────────────────────────────────────────────────────
   Ticks down to a target Date every second.
   Returns { days, hours, mins, secs, expired }
════════════════════════════════════════════════════════════════ */
function useCountdownTo(targetDate) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };

  const diff = new Date(targetDate).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };

  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000) / 60000),
    secs:  Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

/* ════════════════════════════════════════════════════════════════
   COUNTDOWN DISPLAY — Days : Hours : Mins : Secs chips
════════════════════════════════════════════════════════════════ */
function CountdownDisplay({ time }) {
  return (
    <div className="do-countdown">
      <div className="do-countdown-unit">
        <span className="do-countdown-val" key={`d-${time.days}`}>{String(time.days).padStart(2,"0")}</span>
        <span className="do-countdown-lbl">Days</span>
      </div>
      <span className="do-countdown-sep">:</span>
      <div className="do-countdown-unit">
        <span className="do-countdown-val" key={`h-${time.hours}`}>{String(time.hours).padStart(2,"0")}</span>
        <span className="do-countdown-lbl">Hrs</span>
      </div>
      <span className="do-countdown-sep">:</span>
      <div className="do-countdown-unit">
        <span className="do-countdown-val" key={`m-${time.mins}`}>{String(time.mins).padStart(2,"0")}</span>
        <span className="do-countdown-lbl">Min</span>
      </div>
      <span className="do-countdown-sep">:</span>
      <div className="do-countdown-unit">
        <span className="do-countdown-val" key={`s-${time.secs}`}>{String(time.secs).padStart(2,"0")}</span>
        <span className="do-countdown-lbl">Sec</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TESTS-USED PROGRESS RING
════════════════════════════════════════════════════════════════ */
function TestsUsedRing({ used, limit }) {
  const r = 22, circ = 2 * Math.PI * r;
  const pct = Math.min(1, used / limit);
  const dash = circ * pct;

  return (
    <div className="do-test-ring-wrap">
      <svg width="54" height="54" viewBox="0 0 54 54">
        <circle className="do-test-ring-track" cx="27" cy="27" r={r} fill="none" strokeWidth="5"/>
        <circle
          className="do-test-ring-fill" cx="27" cy="27" r={r} fill="none" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="do-test-ring-center">
        <span className="do-test-ring-val">{used}/{limit}</span>
        <span className="do-test-ring-lbl">Tests</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SUBSCRIPTION BANNER
   ────────────────────────────────────────────────────────────────
   Props (via `subscription` object on DashboardOverview):
     status: "trial" | "active" | "expired"
     trialEndsAt: ISO string       — exact timestamp the 3-day trial ends (drives live timer)
     trialDaysLeft: number          — fallback if trialEndsAt not provided
     freeTestsUsed: number          — tests used out of freeTestsLimit
     freeTestsLimit: number          — default 2
     planName: string                — e.g. "3 Months Plan" (when active)
     expiresAt: ISO string           — paid subscription expiry (drives live timer)
     daysLeft: number                 — fallback if expiresAt not provided
════════════════════════════════════════════════════════════════ */
function SubscriptionBanner({ subscription, onSubscribe }) {
  const {
    status = "trial",
    trialEndsAt,
    trialDaysLeft = 3,
    freeTestsUsed = 0,
    freeTestsLimit = 2,
    planName,
    expiresAt,
    daysLeft,
  } = subscription || {};
const navigate = useNavigate(); 
   onSubscribe = () => navigate("/subscription");

  // derive a target timestamp for the live countdown, falling back
  // to "now + N days" if an exact ISO timestamp wasn't provided
  const trialTarget = trialEndsAt || (trialDaysLeft != null
    ? new Date(Date.now() + trialDaysLeft * 86400000).toISOString()
    : null);
  const subTarget = expiresAt || (daysLeft != null
    ? new Date(Date.now() + daysLeft * 86400000).toISOString()
    : null);

  const trialTime = useCountdownTo(status === "trial" ? trialTarget : null);
  const subTime   = useCountdownTo(status === "active" ? subTarget : null);

  /* ── ACTIVE SUBSCRIPTION ── */
  if (status === "active") {
    const isEndingSoon = !subTime.expired && subTime.days <= 3;
    return (
      <div className="do-sub-banner active">
        <div className="do-sub-left">
          <div className="do-sub-icon">✅</div>
          <div>
            <div className="do-sub-title">
              <span className="do-sub-dot"/>
              {planName || "Subscription"} Active
              {isEndingSoon && <span className="do-urgent-badge">⏳ Renewing Soon</span>}
            </div>
            <div className="do-sub-sub">All features unlocked — unlimited tests, PYQs &amp; analytics</div>
          </div>
        </div>
        {subTarget && (
          <div className="do-sub-right">
            <CountdownDisplay time={subTime} />
            {isEndingSoon && (
              <button className="do-sub-btn" onClick={onSubscribe}>🔄 Renew</button>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── EXPIRED ── */
  if (status === "expired") {
    return (
      <div className="do-sub-banner expired">
        <div className="do-sub-left">
          <div className="do-sub-icon">🔒</div>
          <div>
            <div className="do-sub-title">
              <span className="do-sub-dot"/>
              {trialDaysLeft <= 0
                ? "Free Trial Ended"
                : "Subscription Expired"}
            </div>
            <div className="do-sub-sub">
              Subscribe now to unlock unlimited mock tests, PYQs, topic practice &amp; analytics
            </div>
          </div>
        </div>
        <div className="do-sub-right">
          <button className="do-sub-btn" onClick={onSubscribe}>🔓 Subscribe Now</button>
        </div>
      </div>
    );
  }

  /* ── TRIAL (default) ── */
  const testsLeft = freeTestsLimit - freeTestsUsed;
  const lastDay = !trialTime.expired && trialTime.days === 0;

  return (
    <div className="do-sub-banner trial">
      <div className="do-sub-left">
        <div className="do-sub-icon">🎁</div>
        <div>
          <div className="do-sub-title">
            <span className="do-sub-dot"/>
            Free Trial Active
            {lastDay && <span className="do-urgent-badge">⏳ Last Day</span>}
          </div>
          <div className="do-sub-sub">
            <strong>{testsLeft}</strong> free test{testsLeft === 1 ? "" : "s"} remaining ·
            full access ends in the countdown below
          </div>
        </div>
      </div>
      <div className="do-sub-right">
        <TestsUsedRing used={freeTestsUsed} limit={freeTestsLimit} />
        {trialTarget && <CountdownDisplay time={trialTime} />}
        <button className="do-sub-btn" onClick={onSubscribe}>⚡ Upgrade</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LOCK WRAPPER — wraps a section and blurs it when access is locked
════════════════════════════════════════════════════════════════ */
function LockWrapper({ locked, title, sub, onSubscribe, children }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="do-locked">
      <div className="do-locked-content">{children}</div>
      <div className="do-lock-overlay">
        <div className="do-lock-icon-wrap">
          <div className="do-lock-icon-glow" />
          <div className="do-lock-icon">🔒</div>
        </div>
        <div className="do-lock-title">{title}</div>
        <div className="do-lock-sub">{sub}</div>
        <button className="do-sub-btn" onClick={onSubscribe}>🔓 Subscribe Now</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
/**
 * Props:
 *  selectedExam: string  — exam id, e.g. "ssc-cgl" (from DashboardNavbar)
 *  examMeta: object       — { icon, bg } for header pill, from navbar's exam list
 *  pyqCount, subjectCount, topicCount: numbers — for Test Series cards
 *  analyticsPreview: { accuracy, testsThisWeek, streak } — small stats on Analytics card
 *  subscription: {
 *    status: "trial" | "active" | "expired",
 *    trialDaysLeft, freeTestsUsed, freeTestsLimit, planName, daysLeft
 *  }
 *  onNavigate: fn(page, params?) — page: "analytics" | "pyq" | "subject" | "topic" | "practice" | "subscription"
 */
// Mirrors the icon/bg used in DashboardNavbar's exam list, so the
// header pill icon matches whatever exam is actually selected
// instead of always showing the static default.
const EXAM_META_BY_ID = {
  cgl:  { icon: "📋", bg: "rgba(217,70,239,.15)" },
  cpo:  { icon: "🛡️", bg: "rgba(99,102,241,.15)" },
  mts:  { icon: "📝", bg: "rgba(245,158,11,.15)" },
  chsl: { icon: "📄", bg: "rgba(34,197,94,.15)" },
  gd:   { icon: "⭐", bg: "rgba(239,68,68,.15)" },
  ntpc:   { icon: "🚂", bg: "rgba(217,70,239,.15)" },
  alp:    { icon: "⚙️", bg: "rgba(99,102,241,.15)" },
  je:     { icon: "🔧", bg: "rgba(245,158,11,.15)" },
  groupd: { icon: "📦", bg: "rgba(34,197,94,.15)" },
};

export default function DashboardOverview({
  examMeta: examMetaProp,
  pyqCount = 42,
  subjectCount: subjectCountProp,
  topicCount: topicCountProp,
  analyticsPreview: analyticsPreviewProp,
  subscription: subscriptionProp,
  onNavigate,
}) {
  useEffect(() => { inject(); }, []);

  const { t } = useLanguage();

  // Always read from ExamContext — this is updated by DashboardNavbar
  // when user picks an exam. A selectedExam prop was previously shadowing
  // this, so navbar changes never reflected in the practice subjects.
  const { selectedExam: selectedExamState } = useExam();
  const selectedExamCode = selectedExamState || "cgl";
  const [successNotice, setSuccessNotice] = useState("");
  const location = useLocation();

  const [activePage] = useState("overview");
  const navigate = useNavigate();

  // Moved up so `user.id` is available for useSubscription below —
  // this was previously declared further down in the component.
  const {
    user,
    logout,
    isAuthenticated,
    loading: authLoading,
    deviceLoggedOutMessage,
    clearDeviceLoggedOutMessage,
  } = useAuth();

  // Real per-user trial/subscription state from the DB.
  // IMPORTANT: while this is loading, we render a skeleton instead of a
  // guessed default — previously this fell back to a hardcoded "trial"
  // object, so the banner would show the WRONG status first (e.g. "Free
  // Trial") then visibly snap to the real one (e.g. "Active") once the
  // fetch resolved. That flash-then-correct is what reads as "lag" when
  // returning to the dashboard. Showing a stable skeleton until the real
  // value is known gives one clean transition instead of a wrong pop.
  const { dashboardStatus: liveSubscription, loading: subLoading } = useSubscription(user?.id);
  const subscription = liveSubscription || subscriptionProp || null;
  const subscriptionReady = !subLoading && subscription !== null;

  const exam = EXAM_INFO[selectedExamCode] || EXAM_INFO["cgl"];
  const examMeta = examMetaProp
    || EXAM_META_BY_ID[selectedExamCode]
    || { icon: "📋", bg: "rgba(217,70,239,.15)" };

  const { data: analyticsData } = useAnalytics(user?.id, "7d", selectedExamCode);

  const liveAnalyticsPreview = analyticsPreviewProp || {
    accuracy: analyticsData?.examAccuracy?.current ?? 0,
    testsThisWeek: analyticsData?.last7Tests?.length ?? 0,
    streak: analyticsData?.goal?.streak ?? 0,
  };

  const analyticsPreview = analyticsPreviewProp || liveAnalyticsPreview;

  const subjectCount = Number(subjectCountProp ?? 9);
  const topicCount = Number(topicCountProp ?? 24);

  // The hook now exposes independent lock flags instead of one combined
  // "expired" status: Practice Question Bank stays open for the full
  // 3-day trial regardless of test count, Test Series locks the moment
  // the 2 free tests are used even if trial days remain. Both fall back
  // to the old combined behavior (status === "expired") if the hook
  // hasn't been updated yet / during the loading skeleton.
  const testsLocked    = subscription?.testsLocked    ?? (subscription?.status === "expired");
  const practiceLocked = subscription?.practiceLocked ?? (subscription?.status === "expired");
  // Analytics isn't part of the free-test/trial-day split — it stays
  // tied to the overall trial window the same way it always was, just
  // now that window only ends when the 3-day trial itself is over
  // rather than also tripping when the 2 free tests run out.
  const isLocked = subscription?.status === "expired";

  const goToSubscription = () => navigate("/subscription");

  // Live PYQ paper count for the selected exam (replaces the hardcoded
  // default on the "PYQ PAPERS" card). Falls back to the prop on error.
  const [livePyqCount, setLivePyqCount] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const examUuid = await resolveExamId(selectedExamCode);
        if (!examUuid) return;
        const { count, error } = await supabase
          .from("pyq_tests")
          .select("id", { count: "exact", head: true })
          .eq("exam_id", examUuid)
          .eq("is_active", true);
        if (!error && !cancelled) setLivePyqCount(count ?? 0);
      } catch (err) {
        
      }
    })();
    return () => { cancelled = true; };
  }, [selectedExamCode]);

  // Redirect to login if not authenticated — but hold off while the
  // "logged out because another device signed in" message is showing,
  // so it doesn't vanish before the user reads it.
  useEffect(() => {
    if (authLoading) return;
    if (deviceLoggedOutMessage) return;

    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate, deviceLoggedOutMessage]);

  // ← was missing entirely — onLogout={handleLogout} below referenced
  // an undefined function, which throws a ReferenceError on render
  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

 const handleNavigate = useCallback((page, payload) => {
  switch(page){
    case "analytics":
      navigate("/analytics");
      break;

    case "subscription":
      navigate("/subscription");
      break;

    case "bookmarks":
      navigate("/bookmarks");
      break;

    case "pyqpapers":
      navigate("/pyqpapers");
      break;

    case "subject":
      navigate("/subject");
      break;

    case "topic":
      navigate("/topic");
      break;

    case "practice":
    case "practicesubject":
      // "View All" calls handleNavigate("practice") with no payload →
      // goes to the subjects list for the current exam. A subject
      // card click sends { subjectId } → goes straight into that
      // subject's topics. Both page strings are handled here since
      // different call sites in this file use either one.
      if (payload?.subjectId) {
        navigate(`/practice/${selectedExamState}/${payload.subjectId}`);
      } else {
        navigate(`/practice/${selectedExamState}`);
      }
      break;

    default:
      
  }
}, [navigate, selectedExamState]);

  const handleGoalChange = useCallback((n) => {
    
  }, []);

  useEffect(() => {
    if (location?.state?.referralApplied) {
      setSuccessNotice("Referral applied successfully! Welcome to SpeedMock.");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Give the user a few seconds to read the eviction message, then let the
  // redirect-to-login effect above proceed.
  useEffect(() => {
    if (!deviceLoggedOutMessage) return;
    const timer = setTimeout(() => clearDeviceLoggedOutMessage(), 5000);
    return () => clearTimeout(timer);
  }, [deviceLoggedOutMessage, clearDeviceLoggedOutMessage]);

  return (
    <div className="do-page">
      <DashboardNavbar
        user={user}
        activePage="overview"
        goalTarget={30}
        goalDone={0}
        onNavigate={handleNavigate}
        onGoalChange={handleGoalChange}
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/signup")}
        onLogout={handleLogout}
      />

      {deviceLoggedOutMessage && (
        <div
          onClick={clearDeviceLoggedOutMessage}
          style={{
            margin: "18px 40px 0",
            padding: "14px 18px",
            borderRadius: "14px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fecaca",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 16 }}>⚠</span>
          {deviceLoggedOutMessage}
        </div>
      )}

      {successNotice && (
        <div style={{
          margin: "18px 40px 0",
          padding: "14px 18px",
          borderRadius: "14px",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.26)",
          color: "#d9f99d",
          fontWeight: 600,
        }}>
          {successNotice}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="do-header">
        <div className="do-eyebrow"><span className="do-dot"/>Dashboard</div>
        <h1 className="do-h1">Overview</h1>
        <div className="do-sub">Everything you need for {exam.name}, in one place</div>
        <div className="do-exam-pill">
          <span style={{ fontSize: 14 }}>{examMeta.icon}</span>
          {exam.name} — {exam.fullName}
        </div>
      </div>

      <div className="do-body">

        {/* ── SUBSCRIPTION STATUS BANNER ── */}
        {subscriptionReady
          ? <SubscriptionBanner subscription={subscription} onSubscribe={goToSubscription} />
          : <div className="do-sub-banner-skeleton" />}

        {/* ══ QUICK LINKS — Syllabus & Exam Pattern (full pages) ══ */}
        <div className="do-section">
          <div className="do-quick-links">
            <div className="do-quick-link" onClick={() => navigate("/syllabuspage")}>
              <div className="do-quick-icon" style={{ background: "rgba(233,30,140,.1)" }}>📚</div>
              <div className="do-quick-text">
                <div className="do-quick-title">Detailed Syllabus</div>
                <div className="do-quick-sub">Topic-wise breakdown for {exam.name}</div>
              </div>
              <div className="do-quick-arrow">→</div>
            </div>

            <div className="do-quick-link" onClick={() => navigate("/exampatternpage")}>
              <div className="do-quick-icon" style={{ background: "rgba(14,165,233,.1)" }}>📐</div>
              <div className="do-quick-text">
                <div className="do-quick-title">Exam Pattern</div>
                <div className="do-quick-sub">Section-wise marks &amp; time distribution</div>
              </div>
              <div className="do-quick-arrow">→</div>
            </div>
          </div>
        </div>

        {/* ══ SECTION 2: ANALYTICS ══ */}
        <div className="do-section">
          <div className="do-section-label">Performance</div>
          <LockWrapper
            locked={isLocked}
            title="Analytics Locked"
            sub="Subscribe to track your daily goal, accuracy trends, subject-wise performance and typing speed."
            onSubscribe={goToSubscription}
          >
           <div
  className="do-analytics-card"
  onClick={() => !isLocked && navigate("/analytics")}
>
              <div className="do-analytics-icon">📊</div>
              <div className="do-analytics-info">
                <div className="do-analytics-title">YOUR ANALYTICS</div>
                <div className="do-analytics-sub">
                  Track your daily goal consistency, subject-wise accuracy, test progress
                  and typing performance — all in one dashboard.
                </div>
                <div className="do-analytics-stats">
                  <div className="do-analytics-stat">
                    <span className="do-analytics-stat-val">{analyticsPreview.accuracy}%</span>
                    <span className="do-analytics-stat-lbl">Accuracy</span>
                  </div>
                  <div className="do-analytics-stat">
                    <span className="do-analytics-stat-val">{analyticsPreview.testsThisWeek}</span>
                    <span className="do-analytics-stat-lbl">Tests This Week</span>
                  </div>
                  <div className="do-analytics-stat">
                    <span className="do-analytics-stat-val">{analyticsPreview.streak}🔥</span>
                    <span className="do-analytics-stat-lbl">Day Streak</span>
                  </div>
                </div>
              </div>
              <div className="do-analytics-arrow">→</div>
            </div>
          </LockWrapper>
        </div>

        {/* ══ SECTION 3: TEST SERIES ══ */}
        <div className="do-section">
          <div className="do-section-label">
            Test Series
            <span className="do-section-link" onClick={() => handleNavigate("pyqpapers")}>View All →</span>
          </div>
          <LockWrapper
            locked={testsLocked}
            title="Test Series Locked"
            sub="You've used both free tests. Subscribe to unlock unlimited PYQ papers, subject-wise and topic-wise tests."
            onSubscribe={goToSubscription}
          >
            <div className="do-grid-3">

              <div className="do-test-card" onClick={() => !testsLocked && handleNavigate("pyqpapers")}>
                <div className="do-test-icon" style={{ background: "rgba(233,30,140,.1)" }}>📜</div>
                <div className="do-test-title">PYQ PAPERS</div>
                <div className="do-test-desc">
                  Authentic previous year question papers from past shifts, organized year-wise.
                </div>
                <div className="do-test-footer">
                  <span className="do-test-count">{livePyqCount ?? pyqCount} papers</span>
                  <span className="do-test-cta">Start →</span>
                </div>
              </div>

              <div className="do-test-card" onClick={() => !testsLocked && handleNavigate("subject")}>
                <div className="do-test-icon" style={{ background: "rgba(34,197,94,.1)" }}>🎯</div>
                <div className="do-test-title">SUBJECT-WISE</div>
                <div className="do-test-desc">
                  Focused 20-question practice sets covering each subject of the syllabus.
                </div>
                <div className="do-test-footer">
                  <span className="do-test-count">{subjectCount} tests</span>
                  <span className="do-test-cta">Start →</span>
                </div>
              </div>

              <div className="do-test-card" onClick={() => !testsLocked && handleNavigate("topic")}>
                <div className="do-test-icon" style={{ background: "rgba(168,85,247,.1)" }}>🔬</div>
                <div className="do-test-title">TOPIC-WISE</div>
                <div className="do-test-desc">
                  Drill down into specific topics — 15-question micro tests for targeted practice.
                </div>
                <div className="do-test-footer">
                  <span className="do-test-count">{topicCount} topics</span>
                  <span className="do-test-cta">Start →</span>
                </div>
              </div>
            </div>
          </LockWrapper>
        </div>

        {/* ══ SECTION 4: PRACTICE QUESTION BANK ══ */}
        <div className="do-section">
          <div className="do-section-label">
            Practice Question Bank
            <span className="do-section-link" onClick={() => handleNavigate("practice")}>View All →</span>
          </div>
          <LockWrapper
            locked={practiceLocked}
            title="Question Bank Locked"
            sub="Your 3-day free trial has ended. Subscribe to access 1000s of quality practice questions beyond PYQs, organized by subject."
            onSubscribe={goToSubscription}
          >
            <div className="do-grid-4">
              {exam.subjects.map(sub => (
                <div className="do-subject-card" key={sub.id}
                  onClick={() => !practiceLocked && handleNavigate("practicesubject", { subjectId: sub.id })}>
                  <div className="do-subject-badge">Beyond PYQ</div>
                  <div className="do-subject-icon" style={{ background: sub.color }}>{sub.icon}</div>
                  <div className="do-subject-name">{sub.name}</div>
                  <div className="do-subject-count" style={{ color: "var(--f)" }}>{sub.count}</div>
                  <div className="do-subject-sub">quality questions</div>
                </div>
              ))}
            </div>
          </LockWrapper>
        </div>

      </div>
    </div>
  );


}    
