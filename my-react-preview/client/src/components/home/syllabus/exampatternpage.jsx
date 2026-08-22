import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";

/* ════════════════════════════════════════════════════════════════
   CSS
════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--bg4:#21212e;--b:#1e1e2c;
--f:#e91e8c;--fl:#ff3aaa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--purple:#a855f7;
--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}

@keyframes ep-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ep-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes ep-count{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}

.ep-page{min-height:100vh;background:var(--bg);padding-bottom:60px}

/* ── HEADER ── */
.ep-header{padding:32px 40px 24px;animation:ep-rise .4s ease both}
.ep-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--m);cursor:pointer;
margin-bottom:14px;transition:color .2s}
.ep-back:hover{color:var(--f)}
.ep-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;gap:7px;margin-bottom:6px}
.ep-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:ep-pulse 2s infinite}
.ep-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);letter-spacing:3px;color:var(--t);line-height:1}
.ep-sub{font-size:13px;color:var(--m);margin-top:6px}

/* ── STAGE TABS ── */
.ep-stage-tabs{display:flex;gap:6px;margin-top:22px;margin-bottom:-1px;border-bottom:1px solid var(--b);overflow-x:auto}
.ep-stage-tab{
  padding:11px 18px;border:none;background:transparent;color:var(--m);font-size:13px;font-weight:600;
  cursor:pointer;white-space:nowrap;font-family:'Outfit',sans-serif;position:relative;flex-shrink:0;
}
.ep-stage-tab:hover{color:var(--t)}
.ep-stage-tab.active{color:var(--t)}
.ep-stage-tab.active::after{content:'';position:absolute;bottom:-1px;left:8px;right:8px;height:2px;
background:linear-gradient(90deg,var(--f),var(--fl));border-radius:2px}

/* ── BODY ── */
.ep-body{padding:24px 40px}
.ep-section-label{
  font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--m);
  margin-bottom:16px;display:flex;align-items:center;gap:10px;
}
.ep-section-label::after{content:'';flex:1;height:1px;background:var(--b)}
.ep-section{margin-bottom:32px;animation:ep-rise .5s ease both}

/* ── QUICK STATS ── */
.ep-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.ep-stat-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:14px;padding:18px;
  transition:transform .2s,border-color .2s;
}
.ep-stat-card:hover{transform:translateY(-2px);border-color:rgba(233,30,140,.25)}
.ep-stat-icon{font-size:20px;margin-bottom:8px}
.ep-stat-val{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:1px;line-height:1;animation:ep-count .4s ease both}
.ep-stat-lbl{font-size:10px;color:var(--m);text-transform:uppercase;letter-spacing:1px;margin-top:5px}

/* ── GRID 2 (table + chart) ── */
.ep-grid-2{display:grid;grid-template-columns:1.3fr 1fr;gap:16px}
.ep-card{background:var(--bg2);border:1px solid var(--b);border-radius:16px;padding:24px}
.ep-card-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:2px;color:var(--t);margin-bottom:4px}
.ep-card-sub{font-size:11px;color:var(--m);margin-bottom:18px;line-height:1.5}

/* ── SECTION TABLE ── */
.ep-table{border:1px solid var(--b);border-radius:10px;overflow:hidden}
.ep-row{
  display:grid;grid-template-columns:1.8fr 0.7fr 0.7fr 0.8fr;gap:8px;
  padding:12px 16px;align-items:center;border-bottom:1px solid var(--b);font-size:12.5px;
}
.ep-row:last-child{border-bottom:none}
.ep-row.head{font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;
color:var(--m);background:var(--bg3)}
.ep-row.total{font-weight:700;background:rgba(233,30,140,.04)}
.ep-cell{font-family:'DM Mono',monospace;text-align:center;color:var(--m)}
.ep-row.total .ep-cell{color:var(--t)}
.ep-section-name{display:flex;align-items:center;gap:9px;color:var(--t);font-weight:600;font-family:'Outfit',sans-serif}
.ep-section-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}

/* ── DONUT CENTER LABEL ── */
.ep-donut-wrap{position:relative}
.ep-donut-center{
  position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  pointer-events:none;
}
.ep-donut-val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--t);line-height:1}
.ep-donut-lbl{font-size:9px;color:var(--m);letter-spacing:1px;margin-top:2px;text-transform:uppercase}

/* ── LEGEND ── */
.ep-legend{display:flex;flex-direction:column;gap:9px;margin-top:14px}
.ep-legend-item{display:flex;align-items:center;justify-content:space-between;font-size:12px}
.ep-legend-left{display:flex;align-items:center;gap:8px;color:var(--m)}
.ep-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.ep-legend-val{font-family:'DM Mono',monospace;font-weight:700;color:var(--t)}

/* ── MARKING SCHEME ── */
.ep-mark-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ep-mark-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:14px;padding:20px;text-align:center;
  transition:transform .2s,border-color .2s;
}
.ep-mark-card:hover{transform:translateY(-2px);border-color:rgba(233,30,140,.25)}
.ep-mark-icon{font-size:26px;margin-bottom:10px}
.ep-mark-val{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:1px;line-height:1}
.ep-mark-lbl{font-size:11px;color:var(--m);margin-top:6px;text-transform:uppercase;letter-spacing:1px}
.ep-mark-desc{font-size:11px;color:var(--m2);margin-top:4px}

/* ── TIP BOX ── */
.ep-tip-box{
  display:flex;gap:10px;padding:14px 16px;border-radius:10px;
  background:rgba(14,165,233,.05);border:1px solid rgba(14,165,233,.18);
  font-size:12.5px;color:var(--m);line-height:1.7;
}
.ep-tip-box strong{color:var(--blue)}

/* timeline */
.ep-timeline{display:flex;flex-direction:column;gap:10px}
.ep-timeline-item{
  display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--bg3);
  border:1px solid var(--b);border-radius:10px;
}
.ep-timeline-num{
  width:28px;height:28px;border-radius:50%;background:rgba(233,30,140,.1);color:var(--f);
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;
}
.ep-timeline-text{flex:1;font-size:12.5px;color:var(--t)}
.ep-timeline-text strong{color:var(--f)}

@media(max-width:1000px){
  .ep-grid-2{grid-template-columns:1fr}
  .ep-stats-grid{grid-template-columns:repeat(2,1fr)}
  .ep-mark-grid{grid-template-columns:1fr}
}
@media(max-width:680px){
  .ep-header,.ep-body{padding-left:20px;padding-right:20px}
  .ep-row{grid-template-columns:1.4fr 1fr 1fr;font-size:11px}
  .ep-row > :nth-child(4){display:none}
}
`;

const inject = () => {
  if (document.getElementById("ep-css")) return;
  const s = document.createElement("style");
  s.id = "ep-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ════════════════════════════════════════════════════════════════
   EXAM PATTERN DATA
   ────────────────────────────────────────────────────────────────
   Structure per exam:
     {
       name, fullName,
       stages: [{ id, label }],
       patterns: {
         [stageId]: {
           sections: [{ name, color, questions, marks, time }],
           totalQuestions, totalMarks, totalTime,
           negMark, negDesc,
           mode, duration, applicableTo,
           tip,
           timeline: ["step1", "step2", ...]   // optional selection process
         }
       }
     }
════════════════════════════════════════════════════════════════ */
const PATTERN_DATA = {

  cgl: {
    name: "SSC CGL", fullName: "Combined Graduate Level Examination",
    stages: [
      { id:"tier1", label:"Tier I (Qualifying + Merit)" },
      { id:"tier2", label:"Tier II (Merit)" },
    ],
    patterns: {
      tier1: {
        sections: [
          { name:"General Intelligence & Reasoning", color:"#a855f7", questions:25, marks:50, time:15 },
          { name:"General Awareness",                color:"#f59e0b", questions:25, marks:50, time:15 },
          { name:"Quantitative Aptitude",            color:"#22c55e", questions:25, marks:50, time:15 },
          { name:"English Comprehension",            color:"#0ea5e9", questions:25, marks:50, time:15 },
        ],
        totalQuestions:100, totalMarks:200, totalTime:60,
        negMark:"0.5", negDesc:"per wrong answer",
        mode:"Online (CBT)", duration:"60 minutes",
        applicableTo:"All posts — Tier I is qualifying + merit",
        tip:"Tier I (100 Qs, 200 marks, 60 min): All 4 subjects have equal weightage (25 Qs, 50 marks each). No sectional time limit. GK/GA is fastest to score — aim to finish it in 10 min.",
      },
      tier2: {
        sections: [
          { name:"Quantitative Abilities (Maths)", color:"#22c55e", questions:30, marks:90,  time:60  },
          { name:"English Lang & Comprehension",   color:"#0ea5e9", questions:40, marks:120, time:60  },
          { name:"GK / GS (Session 2)",            color:"#f59e0b", questions:20, marks:60,  time:null},
          { name:"Computer Knowledge (Qualifying)",color:"#a855f7", questions:20, marks:60,  time:15  },
          { name:"Statistics (Paper II — JSO)",    color:"#e91e8c", questions:100,marks:200, time:120 },
          { name:"Finance & Economics (Paper III — AAO)", color:"#ef4444", questions:100, marks:200, time:120 },
        ],
        totalQuestions:210, totalMarks:530, totalTime:315,
        negMark:"1", negDesc:"per wrong answer (Tier II)",
        mode:"Online (CBT)", duration:"Varies by paper",
        applicableTo:"Tier II: Session 1 (Objective) + Session 2 (Skill Test / Typing)",
        tip:"Tier II (150 Qs total for most posts): Maths 30Q + English 40Q + GK 20Q are merit-deciding. Computer Knowledge (20Q) is qualifying only. Paper II (Statistics) & Paper III (Finance) only for specific posts.",
        timeline:[
          "Tier I CBT — 100 Qs · 200 Marks · 60 min · -0.5",
          "Tier II Session 1 — Objective: Maths+Reasoning (1hr) + English+GK (1hr) + Computer (15 min)",
          "Tier II Session 2 — Skill Test / Typing Test (qualifying)",
          "Document Verification & Final Merit List",
        ],
      },
    },
  },

  chsl: {
    name: "SSC CHSL", fullName: "Combined Higher Secondary (10+2) Level Examination",
    stages: [
      { id:"tier1", label:"Tier I" },
      { id:"tier2", label:"Tier II (Merit)" },
    ],
    patterns: {
      tier1: {
        sections: [
          { name:"English Language",                color:"#0ea5e9", questions:25, marks:50, time:15 },
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:25, marks:50, time:15 },
          { name:"Quantitative Aptitude (Basic)",   color:"#22c55e", questions:25, marks:50, time:15 },
          { name:"General Awareness",               color:"#f59e0b", questions:25, marks:50, time:15 },
        ],
        totalQuestions:100, totalMarks:200, totalTime:60,
        negMark:"0.5", negDesc:"per wrong answer",
        mode:"Online (CBT)", duration:"60 minutes",
        applicableTo:"All posts",
        tip:"CHSL Tier I is same structure as CGL Tier I. 100 Qs · 200 Marks · 60 min. -0.5 negative marking per wrong answer.",
      },
      tier2: {
        sections: [
          { name:"Maths — Module 1, Section 1 (Merit)", color:"#22c55e", questions:30, marks:180, time:60  },
          { name:"Reasoning — Module 2, Section 1",     color:"#a855f7", questions:30, marks:180, time:60  },
          { name:"English — Module 1, Section 2",       color:"#0ea5e9", questions:40, marks:180, time:60  },
          { name:"GK/GS — Module 2, Section 2",         color:"#f59e0b", questions:20, marks:60,  time:60  },
          { name:"Computer Knowledge — Section 3 (Qualifying 20%)", color:"#e91e8c", questions:15, marks:45, time:15 },
        ],
        totalQuestions:135, totalMarks:645, totalTime:195,
        negMark:"1", negDesc:"per wrong answer",
        mode:"Online (CBT) + Skill/Typing Test",
        applicableTo:"Session 1: Objective | Session 2: Skill/Typing Test",
        tip:"Tier II total = 70 Qs · 9 hrs (including all modules). Each correct answer = 3 marks in Section 1 & 2. Computer Knowledge is qualifying (20% cutoff). Session 2 = Typing Test (35 WPM English / 30 WPM Hindi) or DEO Data Entry (8000 key depressions/hr).",
        timeline:[
          "Tier I — 100 Qs · 200 Marks · 60 min · -0.5",
          "Tier II Session 1 — Section 1: Maths+Reasoning (1 hr) | Section 2: English+GK (1 hr) | Section 3: Computer (15 min) | -1 -ve",
          "Tier II Session 2 — Skill Test / Typing Test (qualifying)",
          "Document Verification & Final Merit",
        ],
      },
    },
  },

  cpo: {
    name: "SSC CPO", fullName: "Central Police Organisations (SI/ASI) Examination",
    stages: [
      { id:"paper1", label:"Paper I (CBT)" },
      { id:"pet", label:"PET/PST" },
      { id:"paper2", label:"Paper II (CBT)" },
    ],
    patterns: {
      paper1: {
        sections: [
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:50, marks:50, time:30 },
          { name:"General Knowledge & Awareness",   color:"#f59e0b", questions:50, marks:50, time:30 },
          { name:"Quantitative Aptitude",           color:"#22c55e", questions:50, marks:50, time:30 },
          { name:"English Comprehension",           color:"#0ea5e9", questions:50, marks:50, time:30 },
        ],
        totalQuestions:200, totalMarks:200, totalTime:120,
        negMark:"0.25", negDesc:"per wrong answer",
        mode:"Online (CBT)", duration:"2 hours",
        applicableTo:"All posts — Sectional timing: 30 minutes each subject",
        tip:"CPO Paper I has SECTIONAL TIMING — 30 min per subject. You CANNOT go back to a previous section. Score at least 40-45% in each section. Focus on GK and English for maximum marks.",
      },
      pet: {
        sections: [
          { name:"Physical Standards Test (PST)", color:"#ef4444", questions:0, marks:0, time:null },
          { name:"Physical Efficiency Test (PET)",color:"#e91e8c", questions:0, marks:0, time:null },
        ],
        totalQuestions:0, totalMarks:0, totalTime:null,
        negMark:"N/A", negDesc:"Qualifying only",
        mode:"Physical", duration:"1 day",
        applicableTo:"Mandatory — must clear to appear Paper II",
        tip:"PET/PST is qualifying. Must clear to appear for Paper II. Train physically alongside CBT preparation.",
      },
      paper2: {
        sections: [
          { name:"English Language & Comprehension", color:"#0ea5e9", questions:200, marks:200, time:120 },
        ],
        totalQuestions:200, totalMarks:200, totalTime:120,
        negMark:"0.25", negDesc:"per wrong answer",
        mode:"Online (CBT)", duration:"2 hours",
        applicableTo:"All posts — English only, merit-deciding",
        tip:"Paper II is English only (200 Qs · 200 Marks · 2 hrs). This is the real differentiator — practice RC, Cloze Test and Para Jumbles daily. Then DME (Detailed Medical Examination) follows.",
        timeline:[
          "Paper I CBT — 200 Qs · 200 Marks · 2 hrs · Sectional timing 30 min each · -0.25",
          "Physical Standards Test (PST) — Height, Chest",
          "Physical Efficiency Test (PET) — Race, Long Jump, High Jump",
          "Paper II CBT — 200 Qs · 200 Marks · 2 hrs · -0.25",
          "Detailed Medical Examination (DME)",
          "Final Merit List",
        ],
      },
    },
  },

  mts: {
    name: "SSC MTS", fullName: "Multi-Tasking (Non-Technical) Staff Examination",
    stages: [
      { id:"session1", label:"Session I (Qualifying)" },
      { id:"session2", label:"Session II (Merit)" },
    ],
    patterns: {
      session1: {
        sections: [
          { name:"Numerical & Mathematical Ability",color:"#22c55e", questions:20, marks:60, time:45 },
          { name:"Reasoning Ability & Problem Solving",color:"#a855f7", questions:20, marks:60, time:45 },
        ],
        totalQuestions:40, totalMarks:120, totalTime:45,
        negMark:"0", negDesc:"No negative marking in Session I",
        mode:"Online (CBT)", duration:"45 minutes",
        applicableTo:"Qualifying — no negative marking",
        tip:"Session I is QUALIFYING ONLY with NO negative marking. Just clear the cutoff. Save your energy for Session II which is merit-deciding.",
      },
      session2: {
        sections: [
          { name:"General Awareness",              color:"#f59e0b", questions:25, marks:75, time:45 },
          { name:"English Language & Comprehension",color:"#0ea5e9", questions:25, marks:75, time:45 },
        ],
        totalQuestions:50, totalMarks:150, totalTime:45,
        negMark:"1", negDesc:"per wrong answer (Session II)",
        mode:"Online (CBT)", duration:"45 minutes",
        applicableTo:"Merit-deciding — -1 negative marking",
        tip:"Session II is MERIT-DECIDING with -1 negative marking per wrong answer. Be careful! GK and English carry 75 marks each. Avoid random guessing.",
        timeline:[
          "Session I — 40 Qs · 120 Marks · 45 min · No negative marking (Qualifying)",
          "Session II — 50 Qs · 150 Marks · 45 min · -1 negative marking (Merit)",
          "Document Verification & Final Merit List",
        ],
      },
    },
  },

  gd: {
    name: "SSC GD", fullName: "General Duty Constable Examination",
    stages: [
      { id:"cbt", label:"CBT" },
      { id:"pet", label:"PET/PST" },
      { id:"medical", label:"Medical" },
    ],
    patterns: {
      cbt: {
        sections: [
          { name:"General Knowledge & Awareness",  color:"#f59e0b", questions:20, marks:40, time:15 },
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:20, marks:40, time:15 },
          { name:"Elementary Mathematics",         color:"#22c55e", questions:20, marks:40, time:15 },
          { name:"English / Hindi Language",       color:"#0ea5e9", questions:20, marks:40, time:15 },
        ],
        totalQuestions:80, totalMarks:160, totalTime:60,
        negMark:"0.25", negDesc:"per wrong answer",
        mode:"Online (CBT)", duration:"1 hour",
        applicableTo:"All posts",
        tip:"GD CBT is Class 10 level — easiest among all SSC exams. 80 Qs · 160 Marks · 1 hr. Focus on Reasoning (20 Qs) and GK (20 Qs) for quick marks.",
      },
      pet: {
        sections: [
          { name:"Physical Efficiency Test (PET)", color:"#ef4444", questions:0, marks:0, time:null },
          { name:"Physical Standards Test (PST)",  color:"#e91e8c", questions:0, marks:0, time:null },
        ],
        totalQuestions:0, totalMarks:0, totalTime:null,
        negMark:"N/A", negDesc:"Qualifying",
        mode:"Physical", duration:"1 day",
        applicableTo:"Qualifying only",
        tip:"PET: Race 1.6 km (male) / 800m (female), Long Jump, High Jump. PST: Height and Chest measurements. Qualifying only — does not add to merit.",
      },
      medical: {
        sections: [
          { name:"Detailed Medical Examination",   color:"#22c55e", questions:0, marks:0, time:null },
        ],
        totalQuestions:0, totalMarks:0, totalTime:null,
        negMark:"N/A", negDesc:"Qualifying",
        mode:"Medical", duration:"1 day",
        applicableTo:"Final stage",
        tip:"Medical examination tests vision, physical fitness and health standards. Qualifying — does not add to marks.",
        timeline:[
          "CBT — 80 Qs · 160 Marks · 60 min · -0.25",
          "Physical Standards Test (PST) — Height, Chest",
          "Physical Efficiency Test (PET) — Race, Long Jump, High Jump",
          "Detailed Medical Examination (DME)",
          "Final Merit List",
        ],
      },
    },
  },

  ntpc: {
    name: "RRB NTPC", fullName: "Non-Technical Popular Categories Recruitment",
    stages: [
      { id:"cbt1", label:"CBT 1 (Qualifying)" },
      { id:"cbt2", label:"CBT 2 (Merit)" },
    ],
    patterns: {
      cbt1: {
        sections: [
          { name:"General Awareness",              color:"#f59e0b", questions:40, marks:40, time:36 },
          { name:"Mathematics",                    color:"#22c55e", questions:30, marks:30, time:27 },
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:30, marks:30, time:27 },
        ],
        totalQuestions:100, totalMarks:100, totalTime:90,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"90 minutes",
        applicableTo:"Qualifying — shortlists for CBT 2",
        tip:"NTPC CBT 1 is qualifying only. GA carries 40 Qs — highest. -1/3 negative marking. Focus on GA and Reasoning for fast scoring. Indian Railways current affairs is a must.",
      },
      cbt2: {
        sections: [
          { name:"General Awareness",              color:"#f59e0b", questions:50, marks:50, time:45 },
          { name:"Mathematics",                    color:"#22c55e", questions:35, marks:35, time:31 },
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:35, marks:35, time:31 },
        ],
        totalQuestions:120, totalMarks:120, totalTime:90,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"90 minutes",
        applicableTo:"Merit-deciding — final CBT stage",
        tip:"NTPC CBT 2 is merit-deciding (120 Qs · 90 min). GA jumps to 50 Qs. Indian Railways awareness is tested more deeply here. Cutoff in CBT 2 is higher than CBT 1.",
        timeline:[
          "CBT 1 — 100 Qs · 100 Marks · 90 min · -1/3 (Qualifying)",
          "CBT 2 — 120 Qs · 90 min · -1/3 (Merit-deciding)",
          "Typing Skill Test (for eligible posts)",
          "Document Verification",
          "Final Merit List",
        ],
      },
    },
  },

  alp: {
    name: "RRB ALP", fullName: "Assistant Loco Pilot Recruitment",
    stages: [
      { id:"cbt1", label:"CBT 1 (Qualifying)" },
      { id:"cbt2a", label:"CBT 2 Part A (Merit 50%)" },
      { id:"cbt2b", label:"CBT 2 Part B (Qualifying)" },
      { id:"cbat", label:"CBAT (Merit 50%)" },
    ],
    patterns: {
      cbt1: {
        sections: [
          { name:"Mathematics",                    color:"#22c55e", questions:20, marks:20, time:16 },
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:25, marks:25, time:20 },
          { name:"General Science (Class 10)",     color:"#0ea5e9", questions:20, marks:20, time:16 },
          { name:"General Awareness & Current Affairs",color:"#f59e0b", questions:10, marks:10, time:8 },
        ],
        totalQuestions:75, totalMarks:75, totalTime:60,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"60 minutes",
        applicableTo:"Qualifying only — no merit weightage",
        tip:"CBT 1 (75 Qs · 60 min) is qualifying only. Just clear the cutoff. General Science (Class 10 NCERT) and Reasoning carry most Qs. Don't over-invest time here.",
      },
      cbt2a: {
        sections: [
          { name:"Advanced Maths & GA",            color:"#22c55e", questions:100, marks:100, time:90 },
          { name:"Basic Sciences & Engineering",   color:"#0ea5e9", questions:0,   marks:0,   time:null },
        ],
        totalQuestions:100, totalMarks:100, totalTime:90,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"90 minutes (2.5 hrs total for CBT 2)",
        applicableTo:"Merit-deciding — 50% of final merit",
        tip:"CBT 2 Part A (100 Qs · 90 min) is MERIT-DECIDING and carries 50% of final merit. Includes Advanced Maths, GA and Basic Sciences/Engineering topics (Engineering Drawing, IT Literacy).",
      },
      cbt2b: {
        sections: [
          { name:"Trade-Specific Questions",       color:"#ef4444", questions:75, marks:75, time:60 },
        ],
        totalQuestions:75, totalMarks:75, totalTime:60,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"60 minutes",
        applicableTo:"Qualifying — 35% cutoff",
        tip:"CBT 2 Part B (75 Qs · 60 min) is QUALIFYING ONLY — must score 35%. Based on your trade/discipline (Mechanical, Electrical, Electronics etc). Does not add to merit.",
      },
      cbat: {
        sections: [
          { name:"Memory Test",                    color:"#f59e0b", questions:0, marks:0, time:null },
          { name:"Concentration Test",             color:"#e91e8c", questions:0, marks:0, time:null },
          { name:"Perceptual Speed Test",          color:"#a855f7", questions:0, marks:0, time:null },
          { name:"Spatial Visualisation",          color:"#0ea5e9", questions:0, marks:0, time:null },
        ],
        totalQuestions:0, totalMarks:0, totalTime:null,
        negMark:"N/A", negDesc:"Score-based aptitude test",
        mode:"Computer-Based Aptitude Test", duration:"Varies by section",
        applicableTo:"Merit-deciding — 50% of final merit",
        tip:"CBAT (Psychometric/Aptitude Test) carries 50% of final merit. Equally important as CBT 2 Part A. Tests memory, concentration, perceptual speed and spatial ability. Practice aptitude tests regularly.",
        timeline:[
          "CBT 1 — 75 Qs · 75 Marks · 60 min · -1/3 (Qualifying only)",
          "CBT 2 Part A — 100 Qs · 90 min · Merit-deciding (50% weightage)",
          "CBT 2 Part B — 75 Qs · 60 min · Trade-specific · Qualifying (35%)",
          "CBAT — Computer Based Aptitude Test (50% weightage for merit)",
          "Document Verification & Medical",
          "Final Merit List",
        ],
      },
    },
  },

  je: {
    name: "RRB JE", fullName: "Junior Engineer Recruitment",
    stages: [
      { id:"cbt1", label:"CBT 1 (Screening)" },
      { id:"cbt2", label:"CBT 2 (Merit)" },
    ],
    patterns: {
      cbt1: {
        sections: [
          { name:"Mathematics",                    color:"#22c55e", questions:30, marks:30, time:27 },
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:25, marks:25, time:22 },
          { name:"General Awareness",              color:"#f59e0b", questions:15, marks:15, time:13 },
          { name:"General Science",                color:"#0ea5e9", questions:30, marks:30, time:27 },
        ],
        totalQuestions:100, totalMarks:100, totalTime:90,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"90 minutes",
        applicableTo:"Screening — shortlists for CBT 2",
        tip:"JE CBT 1 (100 Qs · 90 min) is only screening. Maths (30) + General Science (30) = 60% weightage here. -1/3 negative marking.",
      },
      cbt2: {
        sections: [
          { name:"General Awareness",              color:"#f59e0b", questions:15,  marks:15,  time:12 },
          { name:"Physics & Chemistry",            color:"#0ea5e9", questions:15,  marks:15,  time:12 },
          { name:"Basics of Computers",            color:"#a855f7", questions:10,  marks:10,  time:8  },
          { name:"Environment & Pollution Control",color:"#22c55e", questions:10,  marks:10,  time:8  },
          { name:"Technical Abilities (Branch-specific)", color:"#ef4444", questions:100, marks:100, time:80 },
        ],
        totalQuestions:150, totalMarks:150, totalTime:120,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"2 hours",
        applicableTo:"Merit-deciding — Technical carries 67%",
        tip:"JE CBT 2 (150 Qs · 120 min): Technical Abilities (100 Qs) = 67% of CBT 2. This is where the exam is won or lost — master your engineering branch (Civil / Mechanical / Electrical / Electronics).",
        timeline:[
          "CBT 1 — 100 Qs · 100 Marks · 90 min · -1/3 (Screening)",
          "CBT 2 — 150 Qs · 150 Marks · 120 min · -1/3 (Merit)",
          "Document Verification",
          "Medical Examination",
          "Final Merit List",
        ],
      },
    },
  },

  groupd: {
    name: "RRB Group D", fullName: "Level 1 Posts — Track Maintainer, Helper & more",
    stages: [
      { id:"cbt", label:"CBT" },
      { id:"pet", label:"PET" },
      { id:"dv", label:"Document Verification" },
    ],
    patterns: {
      cbt: {
        sections: [
          { name:"General Intelligence & Reasoning",color:"#a855f7", questions:30, marks:30, time:27 },
          { name:"Mathematics",                    color:"#22c55e", questions:25, marks:25, time:22 },
          { name:"General Science",                color:"#0ea5e9", questions:25, marks:25, time:22 },
          { name:"General Awareness & Current Affairs",color:"#f59e0b", questions:20, marks:20, time:18 },
        ],
        totalQuestions:100, totalMarks:100, totalTime:90,
        negMark:"0.33", negDesc:"(1/3) per wrong answer",
        mode:"Online (CBT)", duration:"90 minutes",
        applicableTo:"All posts",
        tip:"Group D CBT (100 Qs · 90 min): Reasoning carries most (30 Qs). -1/3 negative marking. Class 10 level. Prepare NCERT Science and focus on Indian Railways current affairs for GK section.",
      },
      pet: {
        sections: [
          { name:"Weight Lifting",                 color:"#ef4444", questions:0, marks:0, time:null },
          { name:"Running",                        color:"#e91e8c", questions:0, marks:0, time:null },
        ],
        totalQuestions:0, totalMarks:0, totalTime:null,
        negMark:"N/A", negDesc:"Qualifying only",
        mode:"Physical", duration:"1 day",
        applicableTo:"Qualifying only — no merit marks",
        tip:"PET: Male — weight lift 35 kg for 2 min & run 1000m in 4 min 15 sec. Female — lift 20 kg for 2 min & run 1000m in 5 min 40 sec. Train physically in parallel with CBT prep.",
      },
      dv: {
        sections: [
          { name:"Document Verification & Medical", color:"#22c55e", questions:0, marks:0, time:null },
        ],
        totalQuestions:0, totalMarks:0, totalTime:null,
        negMark:"N/A", negDesc:"Final stage",
        mode:"Offline", duration:"1 day",
        applicableTo:"Final stage",
        tip:"Bring all original documents — educational certificates, caste certificate (if applicable), ID proof, and photographs.",
        timeline:[
          "CBT — 100 Qs · 100 Marks · 90 min · -1/3",
          "Physical Efficiency Test (PET) — Weight Lifting + Running",
          "Document Verification",
          "Medical Examination",
          "Final Merit List",
        ],
      },
    },
  },
};

const FALLBACK_PATTERN = {
  name: "Exam",
  fullName: "Exam pattern coming soon",
  stages: [{ id: "main", label: "Pattern" }],
  patterns: { main: null },
};

/* ════════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP for charts
════════════════════════════════════════════════════════════════ */
function EpTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "rgba(19,19,26,.96)", border: "1px solid rgba(233,30,140,.3)", borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: 11, color: "#7a7a90" }}>
        {d.questions} Qs · {d.marks} Marks · {d.time} min
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
/**
 * Props:
 *  examId: string   — e.g. "cgl", "ntpc" (from DashboardNavbar selected exam)
 *  onBack: fn()
 */
export default function ExamPatternPage({ examId = "cgl", onBack }) {
  useEffect(() => { inject(); }, []);

  const data = PATTERN_DATA[examId] || FALLBACK_PATTERN;
  const [activeStage, setActiveStage] = useState(data.stages[0]?.id);
  const pattern = data.patterns[activeStage];

  if (!pattern) {
    return (
      <div className="ep-page">
        <div className="ep-header">
          <div className="ep-back" onClick={onBack}>← Back to Dashboard</div>
          <div className="ep-eyebrow"><span className="ep-dot"/>Exam Pattern</div>
          <h1 className="ep-h1">{data.name}</h1>
          <div className="ep-sub">{data.fullName}</div>
        </div>
        <div className="ep-body">
          <div className="ep-tip-box">
            <span>ℹ️</span><span>Detailed exam pattern for this exam is being added. Check back soon!</span>
          </div>
        </div>
      </div>
    );
  }

  const pieData = pattern.sections.map(s => ({ ...s, value: s.marks }));

  return (
    <div className="ep-page">

      {/* HEADER */}
      <div className="ep-header">
        <div className="ep-back" onClick={onBack}>← Back to Dashboard</div>
        <div className="ep-eyebrow"><span className="ep-dot"/>Exam Pattern</div>
        <h1 className="ep-h1">{data.name}</h1>
        <div className="ep-sub">{data.fullName}</div>

        {data.stages.length > 1 && (
          <div className="ep-stage-tabs">
            {data.stages.map(stage => (
              <button key={stage.id}
                className={`ep-stage-tab${activeStage===stage.id?" active":""}`}
                onClick={() => setActiveStage(stage.id)}>
                {stage.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ep-body">

        {/* QUICK STATS */}
        <div className="ep-section">
          <div className="ep-stats-grid">
            <div className="ep-stat-card">
              <div className="ep-stat-icon">📝</div>
              <div className="ep-stat-val" style={{ color: "var(--f)" }}>{pattern.totalQuestions}</div>
              <div className="ep-stat-lbl">Total Questions</div>
            </div>
            <div className="ep-stat-card">
              <div className="ep-stat-icon">🎯</div>
              <div className="ep-stat-val" style={{ color: "var(--amber)" }}>{pattern.totalMarks}</div>
              <div className="ep-stat-lbl">Total Marks</div>
            </div>
            <div className="ep-stat-card">
              <div className="ep-stat-icon">⏱️</div>
              <div className="ep-stat-val" style={{ color: "var(--blue)" }}>{pattern.totalTime}<span style={{fontSize:"1.2rem",color:"var(--m)"}}>m</span></div>
              <div className="ep-stat-lbl">Duration</div>
            </div>
            <div className="ep-stat-card">
              <div className="ep-stat-icon">⚖️</div>
              <div className="ep-stat-val" style={{ color: "var(--red)" }}>-{pattern.negMark}</div>
              <div className="ep-stat-lbl">{pattern.negDesc}</div>
            </div>
          </div>
        </div>

        {/* SECTION TABLE + MARKS DISTRIBUTION */}
        <div className="ep-section">
          <div className="ep-section-label">Section-wise Breakdown</div>
          <div className="ep-grid-2">

            {/* table */}
            <div className="ep-card">
              <div className="ep-card-title">QUESTION DISTRIBUTION</div>
              <div className="ep-card-sub">Questions, marks &amp; time allotted per section</div>
              <div className="ep-table">
                <div className="ep-row head">
                  <div>Section</div><div className="ep-cell">Qs</div>
                  <div className="ep-cell">Marks</div><div className="ep-cell">Time</div>
                </div>
                {pattern.sections.map((s, i) => (
                  <div className="ep-row" key={i}>
                    <div className="ep-section-name">
                      <span className="ep-section-dot" style={{ background: s.color }}/>
                      {s.name}
                    </div>
                    <div className="ep-cell">{s.questions || "—"}</div>
                    <div className="ep-cell">{s.marks || "—"}</div>
                    <div className="ep-cell">{s.time}m</div>
                  </div>
                ))}
                <div className="ep-row total">
                  <div>TOTAL</div>
                  <div className="ep-cell">{pattern.totalQuestions}</div>
                  <div className="ep-cell">{pattern.totalMarks}</div>
                  <div className="ep-cell">{pattern.totalTime}m</div>
                </div>
              </div>
            </div>

            {/* donut chart */}
            <div className="ep-card">
              <div className="ep-card-title">MARKS DISTRIBUTION</div>
              <div className="ep-card-sub">Share of total marks by section</div>
              <div className="ep-donut-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value" nameKey="name"
                      innerRadius="62%" outerRadius="95%" paddingAngle={2}
                      strokeWidth={0}
                    >
                      {pieData.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip content={<EpTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ep-donut-center">
                  <div className="ep-donut-val">{pattern.totalMarks}</div>
                  <div className="ep-donut-lbl">Total Marks</div>
                </div>
              </div>
              <div className="ep-legend">
                {pattern.sections.map((s, i) => (
                  <div className="ep-legend-item" key={i}>
                    <div className="ep-legend-left">
                      <span className="ep-legend-dot" style={{ background: s.color }}/>
                      {s.name}
                    </div>
                    <span className="ep-legend-val">{s.marks > 0 ? `${Math.round(s.marks/pattern.totalMarks*100)}%` : "Qual."}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TIME ALLOCATION BAR CHART */}
        <div className="ep-section">
          <div className="ep-section-label">Time Allocation</div>
          <div className="ep-card">
            <div className="ep-card-title">RECOMMENDED TIME PER SECTION</div>
            <div className="ep-card-sub">Suggested pacing — total exam duration: {pattern.totalTime} minutes</div>
            <ResponsiveContainer width="100%" height={Math.max(180, pattern.sections.length * 50)}>
              <BarChart data={pattern.sections} layout="vertical" margin={{ top:0, right:40, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fill:"#7a7a90", fontSize:10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}m`}/>
                <YAxis type="category" dataKey="name" width={200} tick={{ fill:"#7a7a90", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<EpTooltip />} />
                <Bar dataKey="time" radius={[0,6,6,0]} barSize={18}>
                  {pattern.sections.map((s, i) => <Cell key={i} fill={s.color} />)}
                  <LabelList dataKey="time" position="right" formatter={(v)=>`${v}m`}
                    style={{ fill:"#7a7a90", fontSize:10, fontFamily:"DM Mono, monospace" }}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MARKING SCHEME */}
        <div className="ep-section">
          <div className="ep-section-label">Marking Scheme &amp; Exam Mode</div>
          <div className="ep-mark-grid">
            <div className="ep-mark-card">
              <div className="ep-mark-icon">✅</div>
              <div className="ep-mark-val" style={{ color: "var(--green)" }}>
                +{pattern.totalMarks / pattern.totalQuestions === 1 ? "1" : (pattern.totalMarks / pattern.totalQuestions).toFixed(1)}
              </div>
              <div className="ep-mark-lbl">Per Correct Answer</div>
            </div>
            <div className="ep-mark-card">
              <div className="ep-mark-icon">❌</div>
              <div className="ep-mark-val" style={{ color: "var(--red)" }}>-{pattern.negMark}</div>
              <div className="ep-mark-lbl">{pattern.negDesc}</div>
            </div>
            <div className="ep-mark-card">
              <div className="ep-mark-icon">💻</div>
              <div className="ep-mark-val" style={{ color: "var(--blue)", fontSize: "1.3rem" }}>{pattern.mode}</div>
              <div className="ep-mark-lbl">Exam Mode</div>
              <div className="ep-mark-desc">{pattern.applicableTo}</div>
            </div>
          </div>
        </div>

        {/* SELECTION TIMELINE (if available) */}
        {pattern.timeline && (
          <div className="ep-section">
            <div className="ep-section-label">Selection Process</div>
            <div className="ep-card">
              <div className="ep-timeline">
                {pattern.timeline.map((step, i) => (
                  <div className="ep-timeline-item" key={i}>
                    <div className="ep-timeline-num">{i+1}</div>
                    <div className="ep-timeline-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIP */}
        <div className="ep-tip-box">
          <span>💡</span>
          <span><strong>Strategy Tip:</strong> {pattern.tip}</span>
        </div>

      </div>
    </div>
  );
}
