import { useState, useEffect, useRef, useCallback, } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoComponent from "./logo";

import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useExam } from "../../context/ExamContext";
import { useGoal } from "../../context/GoalContext";
import Settings from "../home/settings/setting";

// ── Rank system (mirrors ProgressTracker) ──────────────%────────────
const RANKS = [
  { rank:1,  name:"Ghost",        emoji:"👻", xp:0     },
  { rank:2,  name:"Rookie",       emoji:"🌱", xp:50    },
  { rank:3,  name:"Grinder",      emoji:"⚙️", xp:150   },
  { rank:4,  name:"Hustler",      emoji:"🔥", xp:350   },
  { rank:5,  name:"Warlord",      emoji:"⚔️", xp:700   },
  { rank:6,  name:"Legend",       emoji:"🏆", xp:1200  },
  { rank:7,  name:"Pro",          emoji:"💜", xp:2000  },
  { rank:8,  name:"Aura",         emoji:"✨", xp:3500  },
  { rank:9,  name:"Sigma",        emoji:"🌀", xp:5500  },
  { rank:10, name:"Mythic",       emoji:"🔮", xp:8000  },
  { rank:11, name:"Zenz",         emoji:"🧘", xp:11000 },
  { rank:12, name:"Phantom",      emoji:"🌫️",xp:15000 },
  { rank:13, name:"Infinite",     emoji:"♾️", xp:20000 },
  { rank:14, name:"Transcendent", emoji:"🌟", xp:28000 },
  { rank:15, name:"GOAT",         emoji:"🐐", xp:40000 },
];
function getRankFromXP(xp) {
  let cur = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp) { cur = RANKS[i]; break; }
  }
  return cur;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
:root {
  --f:#d946ef; --fl:#e879f9; --fd:#a21caf;
  --nb-h: 62px;

  /* DARK theme */
  --bg:#0e0e0e; --bg2:#141414; --bg3:#1c1c1c; --bg4:#242424;
  --t:#f0f0f0; --t2:#c0c0c0; --m:#888; --m2:#444;
  --b:rgba(217,70,239,0.16); --b2:rgba(255,255,255,0.07);
  --card:rgba(255,255,255,0.03);
  --shadow: 0 20px 60px rgba(0,0,0,0.7);
  --overlay: rgba(0,0,0,0.6);
}
[data-theme="light"] {
  --bg:#f4f4f6; --bg2:#ffffff; --bg3:#eeeeee; --bg4:#e4e4e4;
  --t:#111111; --t2:#333333; --m:#666; --m2:#bbb;
  --b:rgba(217,70,239,0.2); --b2:rgba(0,0,0,0.08);
  --card:rgba(0,0,0,0.03);
  --shadow: 0 20px 60px rgba(0,0,0,0.15);
  --overlay: rgba(0,0,0,0.35);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--t); transition: background .3s, color .3s; }
button, input { font-family: 'DM Sans', sans-serif; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: var(--f); border-radius: 4px; }

/* ═══════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
.nb {
  position: fixed; top: 0; left: 0; right: 0; z-index: 970;
  height: var(--nb-h);
  display: flex; align-items: center;
  padding: 0 20px 0 16px;
  background: var(--bg2); border-bottom: 1px solid var(--b2);
  transition: background .3s, border-color .3s, box-shadow .3s;
}
.nb.scrolled { box-shadow: 0 4px 32px rgba(0,0,0,0.35); }
[data-theme="light"] .nb { background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); }

/* left cluster */
.nb-left { display: flex; align-items: center; gap: 0; flex-shrink: 0; }

/* hamburger */
.nb-menu-btn {
  width: 38px; height: 38px; border-radius: 9px;
  background: transparent; border: 1px solid transparent;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
  cursor: pointer; transition: all .2s; flex-shrink: 0; margin-right: 12px;
}
.nb-menu-btn:hover { background: rgba(217,70,239,0.08); border-color: var(--b); }
.nb-menu-btn.open { background: rgba(217,70,239,0.1); border-color: var(--b); }
.nb-bar { width: 18px; height: 2px; border-radius: 2px; background: var(--t); transition: all .3s cubic-bezier(.4,0,.2,1); }
.nb-menu-btn.open .nb-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nb-menu-btn.open .nb-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
.nb-menu-btn.open .nb-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.pnb-logo-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 15px;
  letter-spacing: 3px;
  color: var(--f);
  line-height: 1;
  white-space: nowrap;
  transition: color 0.2s;
  margin-bottom: 0px;
  margin-right: 5px;
  margin-top: 10px;
}
  .pnb-logo{
  margin-top: 15px;
  margin-right: 2px;
  
  }

/* center nav */
.nb-center {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 2px;
}
.nb-link {
  position: relative; padding: 7px 13px; border-radius: 7px;
  font-size: 13px; font-weight: 500; color: var(--m);
  background: none; border: none; cursor: pointer;
  transition: color .2s, background .2s; white-space: nowrap;
}
.nb-link:hover { color: var(--t); background: var(--card); }
.nb-link.active { color: var(--f); }
.nb-link.active::after {
  content: ''; position: absolute; bottom: 3px; left: 50%;
  transform: translateX(-50%); width: 18px; height: 2px;
  border-radius: 2px; background: var(--f);
}

/* right cluster */
.nb-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; position: relative; z-index: 100; }

/* ── THEME TOGGLE ── */
.theme-toggle {
  position: relative; width: 54px; height: 28px;
  background: var(--bg3); border: 1px solid var(--b2);
  border-radius: 100px; cursor: pointer; transition: all .3s;
  flex-shrink: 0; overflow: hidden;
}
.theme-toggle:hover { border-color: var(--b); }
.tt-track {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 5px;
}
.tt-sun { font-size: 12px; transition: opacity .3s; }
.tt-moon { font-size: 12px; transition: opacity .3s; }
.tt-thumb {
  position: absolute; top: 3px; width: 22px; height: 22px;
  background: linear-gradient(135deg, var(--f), var(--fd));
  border-radius: 50%; transition: left .3s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 2px 8px rgba(217,70,239,.4);
}
[data-theme="light"] .tt-thumb { left: 29px; }
[data-theme="dark"]  .tt-thumb { left: 3px;  }


/* ── PROFILE ── */
.nb-profile-wrap { position: relative; }
.nb-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--f), var(--fd));
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff; cursor: pointer;
  border: 2px solid transparent; transition: all .2s; flex-shrink: 0;
}
.nb-avatar:hover { border-color: var(--f); box-shadow: 0 0 0 3px rgba(217,70,239,.2); }
.nb-avatar.guest {
  background: var(--bg3); color: var(--m);
  border: 1.5px solid var(--b2); font-size: 16px;
}

/* ── EXAM CHIP (current exam indicator, left of the Change button) ── */
.nb-exam-chip {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 12px; border: 1px solid var(--b2); border-radius: 10px;
  transition: all .2s; cursor: default;
}
.nb-exam-chip:hover { border-color: var(--b); background: rgba(217,70,239,0.05); }
.nb-exam-chip-icon { font-size: 1.2rem; flex-shrink: 0; }
.nb-exam-chip-label { font-size: 12px; color: var(--m); font-weight: 500; white-space: nowrap; }
.nb-exam-chip-name { font-size: 14px; font-weight: 600; color: var(--t); white-space: nowrap; }

/* ── RESPONSIVE TOP NAVBAR ──
   Previously only .nb-center was hidden below 700px — everything else
   (60px logo, full wordmark, exam chip with 2 lines of text, a separate
   text "Change" button, theme toggle, avatar) stayed full-size and just
   got crammed into whatever width was left, which is the actual cause
   of "whole navbar feels congested" on phones. */
@media (max-width: 700px) {
  .nb { padding: 0 10px 0 8px; }
  .nb-left { gap: 10px !important; }
  .nb-right { gap: 4px; }
  .nb-exam-chip { padding: 6px 8px; gap: 6px; }
  .nb-exam-chip-label { display: none; } /* keep just the exam name, drop the "Current Exam" caption line */
  .nb-exam-chip-name { font-size: 12.5px; }
  .pnb-logo { transform: scale(0.55); transform-origin: center; margin: 0 -8px 0 -4px !important; }
}
@media (max-width: 480px) {
  .pnb-logo-name { display: none; } /* wordmark drops first — icon + exam chip + controls still fit */
  .nb-exam-chip-text { display: none; } /* icon-only exam chip on the narrowest phones */
  .nb-exam-chip { padding: 6px; }
  .nb-left .nb-link { padding: 6px 9px; font-size: 11px !important; }
}

.nb-profile-dropdown {
  position: fixed; top: var(--nb-h); right: 16px;
  z-index: 1100;
  width: 240px; background: var(--bg2);
  border: 1px solid var(--b); border-radius: 14px; padding: 8px;
  box-shadow: var(--shadow);
  opacity: 0; pointer-events: none; transform: translateY(-8px);
  transition: opacity .2s, transform .2s; z-index: 200; min-height: 60px;
  visibility: hidden;
}
.nb-profile-dropdown.open { opacity: 1; pointer-events: all; transform: translateY(0); visibility: visible; }

.pd-header {
  padding: 10px 12px 12px; border-bottom: 1px solid var(--b2); margin-bottom: 6px;
}
.pd-name { font-size: 14px; font-weight: 700; color: var(--t); }
.pd-mobile { font-size: 11px; color: var(--m); margin-top: 2px; }
.pd-plan {
  display: inline-block; margin-top: 7px;
  font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 100px;
  letter-spacing: .5px; text-transform: uppercase;
}
.pd-plan.free   { background: rgba(255,255,255,.06); color: var(--m); border: 1px solid var(--b2); }
.pd-plan.active { background: rgba(217,70,239,.12); color: var(--f); border: 1px solid var(--b); }
.pd-plan.expired{ background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }

.pd-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 9px; cursor: pointer;
  font-size: 13px; color: var(--m); transition: all .15s;
}
.pd-item:hover { background: var(--card); color: var(--t); }
.pd-item.danger:hover { background: rgba(239,68,68,.08); color: #ef4444; }
.pd-item .pi { font-size: 15px; width: 20px; text-align: center; }

.pd-divider { height: 1px; background: var(--b2); margin: 4px 0; }

/* guest profile dropdown */
.pd-guest { padding: 8px 4px; text-align: center; }
.pd-guest p { font-size: 13px; color: var(--m); margin-bottom: 14px; line-height: 1.6; }
.btn-pd-login {
  width: 100%; padding: 9px; border-radius: 8px; cursor: pointer;
  font-size: 13px; font-weight: 600; margin-bottom: 8px;
  background: transparent; border: 1px solid var(--b2); color: var(--t);
  transition: all .2s;
}
.btn-pd-login:hover { border-color: var(--f); color: var(--f); }
.btn-pd-reg {
  width: 100%; padding: 9px; border-radius: 8px; cursor: pointer;
  font-size: 13px; font-weight: 700; border: none; color: #fff;
  background: linear-gradient(135deg, var(--f), var(--fd));
  transition: opacity .2s;
}
.btn-pd-reg:hover { opacity: .9; }

/* ═══════════════════════════════════════════
   LEFT SIDEBAR OVERLAY
═══════════════════════════════════════════ */
.sb-overlay {
  position: fixed; top: var(--nb-h); left: 0; right: 0; bottom: 0; z-index: 950;
  background: var(--overlay); backdrop-filter: blur(3px);
  opacity: 0; pointer-events: none; transition: opacity .3s;
}
.sb-overlay.open { opacity: 1; pointer-events: all; }

/* ── LEFT SIDEBAR ── */
.lsb {
  position: fixed; top: var(--nb-h); left: 0; bottom: 0; z-index: 960;
  width: 300px; background: var(--bg2);
  border-right: 1px solid var(--b);
  display: flex; flex-direction: column;
  transform: translateX(-100%);
  transition: transform .35s cubic-bezier(.4,0,.2,1);
  box-shadow: var(--shadow);
}
.lsb.open { transform: translateX(0); }

/* scroll container inside sidebar */
.lsb-scroll {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 0 0 20px;
}
.lsb-scroll::-webkit-scrollbar { width: 3px; }

/* ── CURRENT EXAM CARD ── */
.lsb-exam-card {
  margin: 14px 14px 6px;
  background: linear-gradient(135deg, rgba(217,70,239,.1), rgba(217,70,239,.03));
  border: 1px solid var(--b); border-radius: 14px; padding: 14px;
  position: relative; overflow: hidden;
}
.lsb-exam-card::before {
  content: ''; position: absolute; top: -20px; right: -20px;
  width: 80px; height: 80px; border-radius: 50%;
  background: radial-gradient(circle, rgba(217,70,239,.15), transparent 70%);
}
.lsb-exam-label {
  font-size: 9px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--f); margin-bottom: 8px;
}
.lsb-exam-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.lsb-exam-icon {
  width: 38px; height: 38px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.lsb-exam-name { font-size: 15px; font-weight: 700; color: var(--t); }
.lsb-exam-sub  { font-size: 11px; color: var(--m); margin-top: 2px; }
.btn-change-exam {
  width: 100%; padding: 8px; border-radius: 9px; cursor: pointer;
  font-size: 12px; font-weight: 600; color: var(--f);
  background: rgba(217,70,239,.08); border: 1px solid rgba(217,70,239,.2);
  transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-change-exam:hover { background: rgba(217,70,239,.16); }

/* ── EXAM PICKER ── */
.lsb-exam-picker {
  margin: 0 14px 6px;
  background: var(--bg3); border: 1px solid var(--b2);
  border-radius: 14px; overflow: hidden;
  max-height: 0; transition: max-height .35s ease;
}
.lsb-exam-picker.open { max-height: 600px; }
.ep-section-title {
  font-size: 9px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--m2);
  padding: 10px 14px 4px;
}
.ep-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; cursor: pointer; transition: background .15s;
}
.ep-item:hover { background: rgba(217,70,239,.06); }
.ep-item.selected { background: rgba(217,70,239,.1); }
.ep-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
}
.ep-info h5 { font-size: 12px; font-weight: 600; color: var(--t); }
.ep-info p  { font-size: 10px; color: var(--m); margin-top: 1px; }
.ep-check   { margin-left: auto; color: var(--f); font-size: 14px; }
.ep-divider { height: 1px; background: var(--b2); margin: 4px 0; }

/* ── SECTION BLOCK ── */
.lsb-section { padding: 16px 14px 4px; }
.lsb-section-title {
  font-size: 9px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--m2); margin-bottom: 4px;
  padding: 0 2px;
}
.lsb-item {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 10px; border-radius: 10px; cursor: pointer;
  transition: all .15s; color: var(--m); font-size: 13px; font-weight: 500;
  border: 1px solid transparent;
}
.lsb-item:hover    { background: var(--card); color: var(--t); }
.lsb-item.active   { background: rgba(217,70,239,.1); color: var(--f); border-color: rgba(217,70,239,.2); }
.lsb-item-icon     { font-size: 15px; width: 22px; text-align: center; flex-shrink: 0; }
.lsb-item-badge {
  margin-left: auto; font-size: 9px; font-weight: 700;
  padding: 2px 7px; border-radius: 100px;
  background: rgba(217,70,239,.12); color: var(--f); border: 1px solid rgba(217,70,239,.2);
}
.lsb-item-badge.green {
  background: rgba(34,197,94,.1); color: #22c55e; border-color: rgba(34,197,94,.2);
}

.lsb-divider { height: 1px; background: var(--b2); margin: 10px 14px; }

/* ── DAILY GOAL TOOL ── */
.lsb-goal-card {
  margin: 4px 0; padding: 12px 10px;
  border-radius: 10px; cursor: pointer;
  background: var(--card); border: 1px solid var(--b2);
  transition: all .2s;
}
.lsb-goal-card:hover { border-color: var(--b); background: rgba(217,70,239,.05); }
.lsb-goal-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.lsb-goal-icon { font-size: 15px; width: 22px; text-align: center; flex-shrink: 0; }
.lsb-goal-title { font-size: 13px; font-weight: 600; color: var(--t); }
.lsb-goal-sub   { font-size: 10px; color: var(--m); margin-top: 1px; }
.goal-track { height: 5px; background: var(--bg3); border-radius: 100px; overflow: hidden; }
.goal-fill  { height: 100%; background: linear-gradient(90deg, var(--f), var(--fl)); border-radius: 100px; transition: width .5s; }
.goal-meta  { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: var(--m); }
.goal-btns  { display: flex; gap: 6px; margin-top: 10px; }
.goal-btn {
  flex: 1; padding: 5px 0; border-radius: 7px; cursor: pointer;
  font-size: 11px; font-weight: 600; text-align: center;
  border: 1px solid var(--b2); background: transparent; color: var(--m);
  transition: all .2s;
}
.goal-btn:hover         { border-color: var(--b); color: var(--f); }
.goal-btn.selected-goal { background: rgba(217,70,239,.1); border-color: var(--b); color: var(--f); }

/* ─── EXAM OVERLAY ─── */
.exam-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: #0e0e12;
  transform: translateX(100%);
  transition: transform 0.38s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto; overflow-x: hidden;
}
.exam-overlay.open { transform: translateX(0); }
.exam-overlay-back {
  position: fixed; top: 16px; left: 16px; z-index: 1001;
  display: flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: 9px;
  background: rgba(14,14,18,0.92); backdrop-filter: blur(12px);
  border: 1px solid rgba(233,30,140,0.25);
  color: #f0f0f0; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family:'DM Sans',sans-serif;
}
.exam-overlay-back:hover {
  background: rgba(233,30,140,0.12);
  border-color: rgba(233,30,140,0.5); color: #ff3aaa;
}

/* ─── EXAM OVERLAY CONTENT (was inline styles, no responsive handling) ─── */
.exam-overlay-content { padding: 60px 20px 20px; max-width: 900px; margin: 0 auto; }
.exam-overlay-title { color: var(--t); margin-bottom: 30px; font-size: 1.8rem; font-weight: 700; }
.exam-group { margin-bottom: 40px; }
.exam-group-title {
  color: var(--m2); font-size: 0.85rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;
}
.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.exam-card {
  padding: 16px; border-radius: 12px;
  background: var(--bg3); border: 1.5px solid var(--b2);
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 12px;
}
.exam-card:hover { border-color: var(--b); background: rgba(217,70,239,0.08); }
.exam-card.selected { background: rgba(217,70,239,0.15); border-color: var(--f); }
.exam-card-icon { font-size: 1.8rem; width: 40px; text-align: center; flex-shrink: 0; }
.exam-card-info { flex: 1; min-width: 0; }
.exam-card-name {
  font-size: 0.95rem; font-weight: 600; color: var(--t); margin-bottom: 4px;
  overflow-wrap: break-word;
}
.exam-card-sub { font-size: 0.8rem; color: var(--m); margin-top: 2px; overflow-wrap: break-word; }
.exam-card-check { font-size: 1.2rem; flex-shrink: 0; }

@media (max-width: 480px) {
  .exam-overlay-back { padding: 7px 14px; font-size: 12px; top: 12px; left: 12px; }
  .exam-overlay-content { padding: 52px 14px 20px; }
  .exam-overlay-title { font-size: 1.4rem; margin-bottom: 22px; }
  .exam-group { margin-bottom: 28px; }
  .exam-group-title { font-size: 0.75rem; letter-spacing: 1.5px; margin-bottom: 12px; }
  /* Force a single column on narrow phones instead of letting auto-fill
     squeeze two cramped ~160px columns into e.g. a 360-400px viewport. */
  .exam-grid { grid-template-columns: 1fr; gap: 10px; }
  .exam-card { padding: 13px; gap: 10px; }
  .exam-card-icon { font-size: 1.5rem; width: 34px; }
  .exam-card-name { font-size: 0.9rem; }
  .exam-card-sub { font-size: 0.75rem; }
}


/* ─── mobile ─── */
@media (max-width: 700px) {
  .nb-center { display: none; }
  .lsb { width: min(300px, 90vw); }
}
`;

// ─── SVG LOGO ────────────────────────────────────────────────────────────────
const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 3L58 17v25c0 12-12 20-26 22C8 62 6 54 6 42V17z" fill="#0e0e0e" stroke="#d946ef" strokeWidth="2"/>
    <rect x="13" y="30" width="38" height="12" rx="4" fill="#d946ef" opacity=".85"/>
    <path d="M38 30h10l2 6H38z" fill="#e879f9"/>
    <rect x="17" y="33" width="5" height="4" rx="1.5" fill="rgba(255,255,255,.85)"/>
    <rect x="25" y="33" width="5" height="4" rx="1.5" fill="rgba(255,255,255,.85)"/>
    <circle cx="20" cy="44" r="4" fill="#141414" stroke="#d946ef" strokeWidth="1.8"/>
    <circle cx="20" cy="44" r="1.5" fill="#d946ef"/>
    <circle cx="36" cy="44" r="4" fill="#141414" stroke="#d946ef" strokeWidth="1.8"/>
    <circle cx="36" cy="44" r="1.5" fill="#d946ef"/>
    <circle cx="46" cy="44" r="4" fill="#141414" stroke="#d946ef" strokeWidth="1.8"/>
    <circle cx="46" cy="44" r="1.5" fill="#d946ef"/>
    <line x1="8" y1="33" x2="14" y2="33" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
    <line x1="8" y1="37" x2="12" y2="37" stroke="#d946ef" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
    <line x1="8" y1="41" x2="13" y2="41" stroke="#d946ef" strokeWidth="1" strokeLinecap="round" opacity=".25"/>
    <text x="32" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="800" fontFamily="Arial" letterSpacing="1">SSC</text>
    <text x="32" y="13" textAnchor="middle" fill="#d946ef" fontSize="7">★</text>
  </svg>
);

// ─── EXAM DATA ────────────────────────────────────────────────────────────────
const ALL_EXAMS = {
  SSC: [
    { id:"cgl",  icon:"📋", bg:"rgba(217,70,239,.15)", name:"SSC CGL",  sub:"Tier I · II · III · DEO" },
    { id:"cpo",  icon:"🛡️", bg:"rgba(99,102,241,.15)", name:"SSC CPO",  sub:"Paper I · II · PET/PST" },
    { id:"mts",  icon:"📝", bg:"rgba(245,158,11,.15)", name:"SSC MTS",  sub:"Paper I · II · Havaldar" },
    { id:"chsl", icon:"📄", bg:"rgba(34,197,94,.15)",  name:"SSC CHSL", sub:"Tier I · II · Typing" },
    { id:"gd",   icon:"⭐", bg:"rgba(239,68,68,.15)",  name:"SSC GD",   sub:"CBT · PET/PST · Medical" },
  ],
  Railway: [
    { id:"ntpc",   icon:"🚂", bg:"rgba(217,70,239,.15)", name:"NTPC",      sub:"CBT 1 · CBT 2 · CBAT" },
    { id:"groupd", icon:"📦", bg:"rgba(34,197,94,.15)",  name:"Group D",   sub:"CBT · PET · Document" },
  ],
};

// find exam by id
const findExam = (id) => {
  for (const grp of Object.values(ALL_EXAMS)) {
    const e = grp.find(x => x.id === id);
    if (e) return e;
  }
  return ALL_EXAMS.SSC[0];
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
/**
 * Props:
 *  user         — null | { name, mobile, plan:"free"|"active", expiryDate }
 *  activePage   — string
 *  goalTarget   — number (daily goal)
 *  goalDone     — number (completed today)
 *  onNavigate   — fn(page)
 *  onGoalChange — fn(n)
 *  onLogin      — fn()
 *  onRegister   — fn()
 *  onLogout     — fn()
 *  onManageProfile — fn()
 */
export default function DashboardNavbar({
  user          = null,
  activePage    = "overview",
  onNavigate,
  onLogin,
  onRegister,
  onLogout,
  onManageProfile,
}) {
  const { selectedExam, changeExam: updateExam } = useExam();
  const { t } = useLanguage();
  const { goalTarget, goalDone, updateGoalTarget } = useGoal();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen,         setMenuOpen]         = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
const profileCloseTimer = useRef(null);

const openProfile = () => {
  if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
  setProfileOpen(true);
};
const closeProfileDelayed = () => {
  profileCloseTimer.current = setTimeout(() => setProfileOpen(false), 200);
};
  const [showExamOverlay,  setShowExamOverlay]  = useState(false);
  const [scrolled,         setScrolled]         = useState(false);
  const [customGoal,       setCustomGoal]       = useState("");
  const [showCustomInput,  setShowCustomInput]  = useState(false);
  const [userRank,         setUserRank]         = useState(RANKS[0]);
  const styleRef = useRef(null);

  // Fetch user's XP to compute rank for profile badge
  useEffect(() => {
    if (!user?.id) return;
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("speedmock_auth_token");
    if (!token) return;
    fetch(`${API}/progress/xp`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.xp != null) setUserRank(getRankFromXP(data.xp)); })
      .catch(() => {});
  }, [user?.id]);

  // inject CSS once
  useEffect(() => {
    if (!document.getElementById("nb-styles")) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "nb-styles";
      styleRef.current.textContent = CSS;
      document.head.appendChild(styleRef.current);
    }
    return () => styleRef.current?.remove();
  }, []);

  // scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // body scroll lock when sidebar open
  useEffect(() => {
  if (menuOpen) {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
  } else {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }
  return () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
  };
}, [menuOpen]);

  const go = useCallback((page) => {
    onNavigate?.(page);
    setMenuOpen(false);
  }, [onNavigate]);

  const changeExam = useCallback((id) => {
  // Typing modules navigate away — they must NOT overwrite selectedExam,
  // since dashboard/syllabus/pattern/analytics all key off it
  if (id === "typing-eng")   { navigate("/englishhome");   setShowExamOverlay(false); return; }
  if (id === "typing-hin")   { navigate("/hindihome");     setShowExamOverlay(false); return; }
  if (id === "typing-speed") { navigate("/typing/speed"); setShowExamOverlay(false); return; }

  // Only SSC/Railway exams update the global selectedExam
  updateExam(id);
  setShowExamOverlay(false);
}, [updateExam, navigate]);

  const exam   = findExam(selectedExam);
  const pct    = goalTarget > 0 ? Math.min(100, Math.round((goalDone / goalTarget) * 100)) : 0;
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return ( <>

      {/* ── TOPBAR ── */}
      <header className={`nb${scrolled ? " scrolled" : ""}`}>

        {/* LEFT — menu button + current exam */}
        <div className="nb-left" style={{ gap: "20px", flex: 1 }}>
          <button
            className={`nb-menu-btn${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            <span className="nb-bar" />
            <span className="nb-bar" />
            <span className="nb-bar" />
          </button>

          <div className="nb-exam-chip">
            <div className="nb-exam-chip-icon">{exam.icon}</div>
            <div className="nb-exam-chip-text">
              <div className="nb-exam-chip-label">{t('currentExam')}</div>
              <div className="nb-exam-chip-name">{exam.name}</div>
            </div>
          </div>
          
          <button
            className="nb-link"
            onClick={() => setShowExamOverlay(true)}
            style={{ fontSize: "12px" }}
          >
            ⇄ {t('change')}
          </button>
        </div>

        {/* CENTER — logo only (centered) */}
         <div className="pnb-logo" onClick={() => go("home")} role="button">
                  <LogoComponent size={60} glow animate />
                
                </div>
<span className="pnb-logo-name"> Speedmock </span>
        
          <div className="nb-right">
          {/* Theme toggle */}
          <div
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            role="switch"
            aria-checked={theme === "light"}
          >
            <div className="tt-track">
              <span className="tt-sun" style={{ opacity: theme === "light" ? 1 : 0.35 }}>☀️</span>
              <span className="tt-moon" style={{ opacity: theme === "dark" ? 1 : 0.35 }}>🌙</span>
            </div>
            <div className="tt-thumb" />
          </div>

       

          {/* Profile */}
          <div
  className="nb-profile-wrap"
  onMouseEnter={openProfile}
  onMouseLeave={closeProfileDelayed}
>
            <div
              className={`nb-avatar${!user ? " guest" : ""}`}
              title={user ? user.name : "Sign in"}
            >
              {user ? initials : "👤"}
            </div>

            <div className="nb-profile-dropdown">
              {user ? (
                <>
                  <div className="pd-header">
                    <div className="pd-name">{user.name}</div>
                    <div className="pd-mobile">
                      +91 {(user.mobile || "").replace(/(\d{2})\d{6}(\d{2})/, "$1XXXXXX$2")}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5, flexWrap:"wrap" }}>
                      <span className={`pd-plan ${user.plan || "free"}`}>
                        {user.plan === "active" ? "✓ " + t('activePlan') : t('freeTrialTests')}
                      </span>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100,
                        background:"linear-gradient(90deg,rgba(233,30,140,.15),rgba(168,85,247,.1))",
                        border:"1px solid rgba(233,30,140,.25)", color:"#e91e8c",
                        letterSpacing:".5px",
                      }}>
                        {userRank.emoji} {userRank.name}
                      </span>
                    </div>
                  </div>
                  {[
                    ["📊", t('dashboard'),    () => go("overview")],
                    ["🎯", "Refer & Earn",    () => { navigate("/referral"); setMenuOpen(false); }],
                    ["💳", t('subscription'), () => { navigate("/subscription"); setMenuOpen(false); }],
                    ["⚙️", t('settings'),     () => navigate("/setting")],
                  ].map(([ic, label, fn]) => (
                    <div key={label} className="pd-item" onMouseDown={fn}>
                      <span className="pi">{ic}</span>{label}
                    </div>
                  ))}
                  <div className="pd-divider" />
                 <div className="pd-item danger" onClick={onLogout}>
                    <span className="pi">🚪</span>{t('signOut')}
</div>
                </>
              ) : (
                <div className="pd-guest">
                  <p>{t('signInDescription')}</p>
                  <button className="btn-pd-login" onClick={onLogin}>{t('signIn')}</button>
                  <button className="btn-pd-reg"   onClick={onRegister}>{t('registerFree')}</button>
                </div>
              )}
            </div>
          </div>
          </div>
      </header>

      {/* ── OVERLAY ── */}
      <div
        className={`sb-overlay${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* ═══════════════════════════════════════
          LEFT SIDEBAR (fixed, doesn't scroll)
      ═══════════════════════════════════════ */}
      <aside className={`lsb${menuOpen ? " open" : ""}`}>
        <div className="lsb-scroll">

          {/* ── STUDENT ACTIVITY ── */}
          <div className="lsb-section">
            <div className="lsb-section-title">{t('studentActivity')}</div>
            {[
              { icon:"📜", label: t('previousYearPapers'), page:"pyqpapers", badge:"20K+ Qs" },
              { icon:"📊", label: t('myTestHistory'),      page:"history",   badge:null, onClick: () => { navigate("/testhistory"); setMenuOpen(false); } },
              { icon:"🔖", label: t('bookmarkedQuestions'), page:"bookmarks", badge:"0", badgeColor:"green" },
              { icon: "📚", label: t('practiceQuestionBank'), page:"practice", badge:"0", badgeColor:"green" },
            ].map(({ icon, label, page, badge, badgeColor, onClick }) => (
  <div
    key={page}
    className={`lsb-item${activePage === page ? " active" : ""}`}
    onClick={onClick || (() => go(page))}
  >
    <span className="lsb-item-icon">{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span
        className={`lsb-item-badge${badgeColor ? ` ${badgeColor}` : ""}`}
      >
        {badge}
      </span>
    )}
  </div>
))}
          </div>

          <div className="lsb-divider" />

          {/* ── TYPING PRACTICE ── */}
          <div className="lsb-section">
            <div className="lsb-section-title">{t('typingPractice') || "Typing Practice"}</div>
            {[
              { icon:"⌨️", label: t('englishTyping') || "English Typing", onClick: () => { navigate("/englishhome"); setMenuOpen(false); } },
              { icon:"🖋️", label: t('hindiTyping') || "Hindi Typing",     onClick: () => { navigate("/hindihome");   setMenuOpen(false); } },
            ].map(({ icon, label, onClick }) => (
              <div key={label} className="lsb-item" onClick={onClick}>
                <span className="lsb-item-icon">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="lsb-divider" />

          {/* ── ANALYTICS ── */}
          <div className="lsb-section">
            <div className="lsb-section-title">{t('analytics')}</div>
            {[
              { icon:"🏠", label: t('dashboard'),          page:"overview"  },
              { icon:"📊", label: t('analyticsDashboard'), page:"analytics", onClick: (() => navigate("/analytics"))},
              { icon:"🏅", label: "Progress & Ranks",      page:"progress",  onClick: (() => { navigate("/progress"); setMenuOpen(false); }), badge:"XP" },
            ].map(({ icon, label, page, onClick, badge }) => (
              <div
                key={page}
                className={`lsb-item${activePage === page ? " active" : ""}`}
                onClick={onClick || (() => go(page))}
              >
                <span className="lsb-item-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span className="lsb-item-badge" style={{
                    background: "linear-gradient(90deg,#e91e8c,#a855f7)",
                    color: "#fff", border: "none", fontSize: 9,
                  }}>{badge}</span>
                )}
              </div>
            ))}
          </div>

          <div className="lsb-divider" />

          {/* ── REFERRAL ── */}
          <div className="lsb-section">
            <div className="lsb-section-title">Refer & Earn</div>
            <div
              className={`lsb-item${activePage === "referral" ? " active" : ""}`}
              onClick={() => { navigate("/referral"); setMenuOpen(false); }}
              style={{ background: activePage === "referral" ? undefined : "linear-gradient(90deg,rgba(233,30,140,.07),transparent)" }}
            >
              <span className="lsb-item-icon">🎯</span>
              <span style={{ flex: 1 }}>Invite Friends</span>
              <span className="lsb-item-badge" style={{
                background: "linear-gradient(90deg,#e91e8c,#a855f7)",
                color: "#fff", border: "none", fontSize: 9, letterSpacing: "0.5px",
              }}>
                FREE MONTH
              </span>
            </div>
          </div>

          <div className="lsb-divider" />
          <div className="lsb-section">
            <div className="lsb-section-title">{t('company')}</div>
            {[
              { icon:"ℹ️",  label: t('aboutUs'),       page:"about", onclick: () => navigate("/about") },
              { icon:"🔒", label: t('privacyPolicy'),  page:"privacy", onclick: () => navigate("/privacy") },
              { icon:"💸", label: t('refundPolicy'),   page:"refund", onclick: () => navigate("/refund") },
              { icon:"📋", label: t('termsOfService'), page:"terms", onclick: () => navigate("/legal") },
            ].map(({ icon, label, page, onclick }) => (
              <div
                key={page}
                className={`lsb-item${activePage === page ? " active" : ""}`}
                onClick={onclick || (() => go(page))}
              >
                <span className="lsb-item-icon">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="lsb-divider" />

          {/* ── SYSTEM SETTINGS ── */}
          <div className="lsb-section">
            <div className="lsb-section-title">{t('systemSettings')}</div>
            {[
              { icon:"⚙️", label: t('accountSettings'),    page:"settings"       },
  
            ].map(({ icon, label, page, onclick }) => (
              <div
                key={page}
                className={`lsb-item${activePage === page ? " active" : ""}`}
                onClick={ () => navigate("/setting")}
              >
                <span className="lsb-item-icon">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <div className="lsb-divider" />

          {/* ── TOOLS — DAILY GOAL ── */}
          <div className="lsb-section">
            <div className="lsb-section-title">{t('tools')}</div>
            <div className="lsb-goal-card" onClick={() => go("goal")}>
              <div className="lsb-goal-header">
                <span className="lsb-goal-icon">🎯</span>
                <div>
                  <div className="lsb-goal-title">{t('dailyGoal')}</div>
                  <div className="lsb-goal-sub">
                    {goalDone} {t('questionsCompleted')} of {goalTarget}
                  </div>
                </div>
              </div>
              <div className="goal-track">
                <div className="goal-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="goal-meta">
                <span>{pct}{t('percentComplete')}</span>
                <span>{goalTarget - goalDone > 0 ? `${goalTarget - goalDone} ${t('questionsLeft')}` : "✓ " + t('done')}</span>
              </div>
              <div className="goal-btns" onClick={e => e.stopPropagation()}>
                {[10, 25, 50, 75, 100, 150, 200].map(n => (
                  <button
                    key={n}
                    className={`goal-btn${goalTarget === n ? " selected-goal" : ""}`}
                    onClick={() => { updateGoalTarget(n); setShowCustomInput(false); }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className={`goal-btn${showCustomInput ? " selected-goal" : ""}`}
                  onClick={() => setShowCustomInput(v => !v)}
                >
                  ✏️
                </button>
              </div>
              {showCustomInput && (
                <div
                  style={{ display:"flex", gap:6, marginTop:8, padding:"0 2px" }}
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={customGoal}
                    onChange={e => setCustomGoal(e.target.value)}
                    placeholder="Enter number…"
                    style={{
                      flex:1, padding:"6px 10px", borderRadius:8, border:"1px solid var(--b)",
                      background:"var(--bg3)", color:"var(--t)", fontSize:13,
                    }}
                  />
                  <button
                    className="goal-btn selected-goal"
                    style={{ padding:"6px 12px" }}
                    onClick={() => {
                      const val = parseInt(customGoal);
                      if (val > 0) { updateGoalTarget(val); setShowCustomInput(false); setCustomGoal(""); }
                    }}
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>{/* end lsb-scroll */}
      </aside>

      {/* ══ EXAM CATEGORY OVERLAY ══
          Slides in from the right over the entire dashboard.
          Displays exam selection UI inline.
      ══════════════════════════════ */}
      <div className={`exam-overlay${showExamOverlay ? " open" : ""}`}>

        {/* Back button — always visible at top-left */}
        <button
          className="exam-overlay-back"
          onClick={() => setShowExamOverlay(false)}
        >
          ← {t('backToDashboard')}
        </button>

        {/* Exam selection content */}
        {showExamOverlay && (
          <div className="exam-overlay-content">
            <h2 className="exam-overlay-title">
              {t('selectExam')}
            </h2>

            {Object.entries(ALL_EXAMS).map(([group, exams]) => (
              <div key={group} className="exam-group">
                <h3 className="exam-group-title">
                  {group}
                </h3>
                <div className="exam-grid">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className={`exam-card${selectedExam === exam.id ? " selected" : ""}`}
                      onClick={() => changeExam(exam.id)}
                    >
                      <div className="exam-card-icon">
                        {exam.icon}
                      </div>
                      <div className="exam-card-info">
                        <div className="exam-card-name">
                          {exam.name}
                        </div>
                        <div className="exam-card-sub">
                          {exam.sub}
                        </div>
                      </div>
                      {selectedExam === exam.id && (
                        <div className="exam-card-check">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}


