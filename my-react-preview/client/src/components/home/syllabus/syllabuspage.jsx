import { useState, useEffect } from "react";

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

@keyframes sy-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes sy-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes sy-expand{from{opacity:0;max-height:0}to{opacity:1;max-height:2000px}}

.sy-page{min-height:100vh;background:var(--bg);padding-bottom:60px}

/* ── HEADER ── */
.sy-header{padding:32px 40px 24px;animation:sy-rise .4s ease both}
.sy-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--m);cursor:pointer;
margin-bottom:14px;transition:color .2s}
.sy-back:hover{color:var(--f)}
.sy-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;gap:7px;margin-bottom:6px}
.sy-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:sy-pulse 2s infinite}
.sy-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);letter-spacing:3px;color:var(--t);line-height:1}
.sy-sub{font-size:13px;color:var(--m);margin-top:6px}

/* exam summary chips */
.sy-meta-row{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.sy-meta-chip{
  background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:9px 16px;
  display:flex;align-items:center;gap:8px;font-size:12px;color:var(--m);
}
.sy-meta-chip strong{color:var(--t);font-weight:700}

/* ── BODY ── */
.sy-body{padding:0 40px 24px}

/* ── STAGE TABS (Tier I / Tier II etc.) ── */
.sy-stage-tabs{display:flex;gap:6px;margin-bottom:24px;border-bottom:1px solid var(--b);overflow-x:auto}
.sy-stage-tab{
  padding:11px 18px;border:none;background:transparent;color:var(--m);font-size:13px;font-weight:600;
  cursor:pointer;white-space:nowrap;font-family:'Outfit',sans-serif;position:relative;flex-shrink:0;
}
.sy-stage-tab:hover{color:var(--t)}
.sy-stage-tab.active{color:var(--t)}
.sy-stage-tab.active::after{content:'';position:absolute;bottom:-1px;left:8px;right:8px;height:2px;
background:linear-gradient(90deg,var(--f),var(--fl));border-radius:2px}

/* ── SUBJECT ACCORDION ── */
.sy-subject{
  background:var(--bg2);border:1px solid var(--b);border-radius:14px;margin-bottom:14px;
  overflow:hidden;transition:border-color .2s;animation:sy-rise .4s ease both;
}
.sy-subject:hover{border-color:rgba(233,30,140,.25)}
.sy-subject-head{
  display:flex;align-items:center;gap:14px;padding:18px 20px;cursor:pointer;user-select:none;
}
.sy-subject-icon{
  width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-size:20px;flex-shrink:0;
}
.sy-subject-info{flex:1}
.sy-subject-name{font-size:14.5px;font-weight:700;color:var(--t)}
.sy-subject-meta{font-size:11px;color:var(--m);margin-top:2px}
.sy-subject-chevron{font-size:16px;color:var(--m);transition:transform .25s;flex-shrink:0}
.sy-subject.open .sy-subject-chevron{transform:rotate(180deg);color:var(--f)}

.sy-subject-body{
  padding:0 20px 20px;animation:sy-expand .3s ease both;
}

/* topic groups (units within a subject) */
.sy-unit{margin-bottom:16px}
.sy-unit:last-child{margin-bottom:0}
.sy-unit-title{
  font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--f);
  margin-bottom:10px;display:flex;align-items:center;gap:8px;
}
.sy-unit-title::after{content:'';flex:1;height:1px;background:var(--b)}

.sy-topics{display:flex;flex-wrap:wrap;gap:8px}
.sy-topic-chip{
  display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;
  background:var(--bg3);border:1px solid var(--b);font-size:12px;color:var(--t);
  transition:all .2s;
}
.sy-topic-chip:hover{border-color:rgba(233,30,140,.3);background:var(--bg4)}
.sy-topic-chip .sy-topic-num{
  font-family:'DM Mono',monospace;font-size:10px;color:var(--m2);flex-shrink:0;
}

/* high-weightage badge */
.sy-topic-chip.high{border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.05)}
.sy-topic-chip.high .sy-topic-num{color:var(--amber)}

/* exam tips box */
.sy-tip-box{
  margin-top:16px;display:flex;gap:10px;padding:12px 14px;border-radius:10px;
  background:rgba(14,165,233,.05);border:1px solid rgba(14,165,233,.18);
  font-size:12px;color:var(--m);line-height:1.6;
}
.sy-tip-box strong{color:var(--blue)}

/* legend */
.sy-legend{display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap;font-size:11px;color:var(--m)}
.sy-legend-item{display:flex;align-items:center;gap:6px}
.sy-legend-swatch{width:10px;height:10px;border-radius:3px}

@media(max-width:680px){
  .sy-header,.sy-body{padding-left:20px;padding-right:20px}
  .sy-subject-head{padding:14px 16px}
  .sy-subject-body{padding:0 16px 16px}
}
`;

const inject = () => {
  if (document.getElementById("sy-css")) return;
  const s = document.createElement("style");
  s.id = "sy-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ════════════════════════════════════════════════════════════════
   DETAILED SYLLABUS DATA
   ────────────────────────────────────────────────────────────────
   Structure per exam:
     {
       name, fullName, stages: [{ id, label }],
       subjects: {
         [stageId]: [
           {
             id, name, icon, color, totalTopics, weightage,
             units: [
               { title, topics: [{ name, high? }] }
             ]
           }
         ]
       },
       tip: "..."
     }
════════════════════════════════════════════════════════════════ */
const SYLLABUS_DATA = {

  cgl: {
    name: "SSC CGL", fullName: "Combined Graduate Level Examination",
    stages: [{ id: "tier1", label: "Tier I" }, { id: "tier2", label: "Tier II" }],
    subjects: {
      tier1: [
        { id:"qa", name:"Quantitative Aptitude", icon:"🔢", color:"#22c55e", weightage:"25 Qs · 50 Marks",
          units: [
            { title:"Arithmetic (40–45%)", topics:[
              {name:"Number System",high:true},{name:"LCM & HCF"},{name:"Simplification",high:true},
              {name:"Powers, Indices & Surds"},{name:"Average",high:true},{name:"Ratio & Proportion",high:true},
              {name:"Mixture & Alligation"},{name:"Percentage",high:true},{name:"Profit & Loss",high:true},
              {name:"Discount",high:true},{name:"Simple Interest"},{name:"Compound Interest"},
              {name:"Time & Work",high:true},{name:"Pipe & Cistern"},{name:"Boat & Stream"},
              {name:"Time, Speed & Distance"},{name:"Sequence & Series"},
            ]},
            { title:"Algebra (~15–20%)", topics:[
              {name:"Basic Algebraic Identities",high:true},{name:"Linear Equations"},{name:"Quadratic Equations"},
            ]},
            { title:"Trigonometry (~10–12%)", topics:[
              {name:"Trigonometric Ratios & Identities",high:true},{name:"Heights & Distances"},
            ]},
            { title:"Geometry (~10–12%)", topics:[
              {name:"Lines & Angles"},{name:"Triangles & Congruence",high:true},
              {name:"Circles",high:true},{name:"Quadrilaterals & Polygons"},
            ]},
            { title:"Mensuration (~10–15%)", topics:[
              {name:"Area & Perimeter (2D)",high:true},{name:"Volume & Surface Area (3D)",high:true},
            ]},
            { title:"Statistics & Data Interpretation (~9%)", topics:[
              {name:"Bar Graph, Pie Chart, Table",high:true},{name:"Mean, Median, Mode"},
              {name:"Statistics & Probability",high:true},
            ]},
          ],
        },
        { id:"re", name:"Reasoning & General Intelligence", icon:"🧠", color:"#a855f7", weightage:"25 Qs · 50 Marks",
          units: [
            { title:"Verbal Reasoning (~10–12 Qs, Very High)", topics:[
              {name:"Analogy",high:true},{name:"Classification",high:true},{name:"Series",high:true},
              {name:"Coding–Decoding",high:true},{name:"Blood Relations"},{name:"Direction Sense Test"},
              {name:"Logical Venn Diagram"},{name:"Alphabet Test"},{name:"Sitting Arrangement"},
              {name:"Mathematical Operations"},{name:"Arithmetical Reasoning"},
              {name:"Assenting Missing Characters"},{name:"Number, Ranking & Time Sequence Test"},
              {name:"Syllogism"},{name:"Logical Sequence of Words"},
              {name:"Alpha-Numeric Sequence Test"},{name:"Puzzle Test"},
            ]},
            { title:"Non-Verbal Reasoning (~4–5 Qs, High)", topics:[
              {name:"Mirror & Water Image",high:true},{name:"Figure Counting",high:true},
              {name:"Dice & Cube"},{name:"Dictionary Order"},
            ]},
          ],
        },
        { id:"en", name:"English Language & Comprehension", icon:"📖", color:"#0ea5e9", weightage:"25 Qs · 50 Marks",
          units: [
            { title:"Vocabulary (~25–30%)", topics:[
              {name:"Synonyms & Antonyms",high:true},{name:"Idioms & Phrases",high:true},
              {name:"One Word Substitution",high:true},{name:"Spelling Correction"},
            ]},
            { title:"Grammar (~30–35%)", topics:[
              {name:"Spot the Error",high:true},{name:"Sentence Improvement & Fill in Blanks",high:true},
              {name:"Active & Passive Voice"},{name:"Direct & Indirect Speech"},
            ]},
            { title:"Comprehension & Passage (~35–40%)", topics:[
              {name:"Reading Comprehension (RC)",high:true},{name:"Cloze Test",high:true},
              {name:"Para Jumbles / Sentence Rearrangement",high:true},
            ]},
          ],
        },
        { id:"ga", name:"General Awareness / GK / GS", icon:"🌍", color:"#f59e0b", weightage:"25 Qs · 50 Marks",
          units: [
            { title:"History (~14%)", topics:[
              {name:"Ancient History"},{name:"Medieval History"},{name:"Modern History",high:true},
              {name:"World History"},
            ]},
            { title:"Geography (~10%)", topics:[{name:"Indian Geography",high:true},{name:"World Geography"}]},
            { title:"Indian Polity & Constitution (~10%)", topics:[
              {name:"Indian Constitution",high:true},{name:"Parliament & Governance"},{name:"Rights & Duties"},
            ]},
            { title:"Indian Economy (~8%)", topics:[{name:"Budget & Plans"},{name:"Banking & Finance"}]},
            { title:"General Science", topics:[
              {name:"Physics",high:true},{name:"Chemistry",high:true},{name:"Biology",high:true},
            ]},
            { title:"Art & Culture", topics:[{name:"Indian Art & Culture",high:true}]},
            { title:"Current Affairs (~20%)", topics:[
              {name:"National & International Events",high:true},
              {name:"Dates, Festivals, Awards, Sports",high:true},{name:"Computers"},
            ]},
            { title:"Static GK (~20%)", topics:[
              {name:"Books & Authors"},{name:"Important Dates"},{name:"Sports Personalities"},
            ]},
          ],
        },
      ],
      tier2: [
        { id:"math2", name:"Quantitative Abilities (Advanced)", icon:"🔢", color:"#22c55e",
          weightage:"Tier II: 150 Qs total | 30Q Maths section",
          units: [{ title:"All Tier I topics + Advanced", topics:[
            {name:"All Arithmetic (deeper)",high:true},{name:"Algebra (advanced)",high:true},
            {name:"Trigonometry (advanced)",high:true},{name:"Geometry & Mensuration (advanced)",high:true},
            {name:"Data Interpretation (advanced)",high:true},
          ]}],
        },
        { id:"en2", name:"English Language (Advanced)", icon:"📖", color:"#0ea5e9",
          weightage:"200 Qs · 200 Marks (Tier II)",
          units: [{ title:"All Tier I topics + Advanced RC", topics:[
            {name:"Reading Comprehension (longer passages)",high:true},
            {name:"Cloze Test (longer)",high:true},{name:"Para Jumbles",high:true},
            {name:"Vocabulary & Grammar (deeper)",high:true},
          ]}],
        },
        { id:"stats2", name:"Statistics (JSO / Statistical Investigator only)", icon:"📊", color:"#a855f7",
          weightage:"100 Qs · 200 Marks · 2 hrs (Paper II — specific posts)",
          units: [{ title:"Statistics", topics:[
            {name:"Collection & Classification of Data",high:true},{name:"Measures of Central Tendency",high:true},
            {name:"Measures of Dispersion"},{name:"Correlation & Regression",high:true},
            {name:"Probability Theory",high:true},{name:"Sampling Theory",high:true},
            {name:"Time Series Analysis",high:true},{name:"Index Numbers"},
          ]}],
        },
        { id:"fin2", name:"General Studies Finance & Economics (AAO only)", icon:"💹", color:"#f59e0b",
          weightage:"100 Qs · 200 Marks · 2 hrs (Paper III — specific posts)",
          units: [
            { title:"Finance & Accounts", topics:[
              {name:"Financial Accounting",high:true},{name:"Basic Concepts of Accounting"},{name:"Self-Balancing Ledger"},
            ]},
            { title:"Economics & Governance", topics:[
              {name:"Finance Commission",high:true},{name:"Basic Economic Concepts",high:true},
              {name:"Demand & Supply Theory"},{name:"Indian Economy",high:true},
            ]},
          ],
        },
      ],
    },
    tip: "In Tier I, GK/GA is the fastest scoring section — Current Affairs 20% + Static GK 20%. In Maths, Arithmetic (40–45%) dominates. Tier II English (200 Qs) is the real differentiator — practice RC daily.",
  },

  chsl: {
    name: "SSC CHSL", fullName: "Combined Higher Secondary (10+2) Level Examination",
    stages: [{ id: "tier1", label: "Tier I" }, { id: "tier2", label: "Tier II" }],
    subjects: {
      tier1: [
        { id:"en", name:"English Language", icon:"📖", color:"#0ea5e9", weightage:"25 Qs · 50 Marks | -0.5 -ve",
          units: [{ title:"Vocabulary & Grammar", topics:[
            {name:"Synonyms & Antonyms",high:true},{name:"Spot the Error",high:true},
            {name:"Fill in the Blanks",high:true},{name:"Spelling Correction"},
            {name:"Idioms & Phrases",high:true},{name:"One Word Substitution",high:true},
            {name:"Reading Comprehension",high:true},
          ]}],
        },
        { id:"re", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7", weightage:"25 Qs · 50 Marks",
          units: [{ title:"Same as SSC CGL Reasoning", topics:[
            {name:"Analogy",high:true},{name:"Series",high:true},{name:"Coding-Decoding",high:true},
            {name:"Blood Relations"},{name:"Direction Sense"},{name:"Non-Verbal Reasoning",high:true},
          ]}],
        },
        { id:"qa", name:"Quantitative Aptitude", icon:"🔢", color:"#22c55e", weightage:"25 Qs · 50 Marks",
          units: [{ title:"Arithmetic & Basic Maths", topics:[
            {name:"Number System",high:true},{name:"Percentage & Ratio",high:true},
            {name:"Profit & Loss",high:true},{name:"Time & Work",high:true},
            {name:"Simple & Compound Interest"},{name:"Mensuration",high:true},
            {name:"Trigonometry"},{name:"Data Interpretation",high:true},
          ]}],
        },
        { id:"ga", name:"General Awareness", icon:"🌍", color:"#f59e0b", weightage:"25 Qs · 50 Marks",
          units: [{ title:"GK Topics (same as CGL)", topics:[
            {name:"History, Geography, Polity",high:true},{name:"Current Affairs",high:true},
            {name:"Science",high:true},{name:"Economics & Art/Culture"},
          ]}],
        },
      ],
      tier2: [
        { id:"obj", name:"Session 1 — Objective Test (Merit Deciding)", icon:"📝", color:"#22c55e",
          weightage:"Section 1: 30Q Maths + 30Q Reasoning (1hr) | Section 2: 40Q English + 20Q GK (1hr) | Section 3: 15Q Computer (15 min) | -1 -ve",
          units: [
            { title:"Section 1 — Module 1: Maths (30 Qs · Total 60×3=180 marks)", topics:[{name:"All QA topics",high:true}]},
            { title:"Section 1 — Module 2: Reasoning (30 Qs)", topics:[{name:"All Reasoning topics",high:true}]},
            { title:"Section 2 — Module 1: English Language (40 Qs · Total 60×3=180 marks)", topics:[{name:"Vocabulary, Grammar, RC",high:true}]},
            { title:"Section 2 — Module 2: GK/GS (20 Qs)", topics:[{name:"Current Affairs, History, Science",high:true}]},
            { title:"Section 3 — Computer Knowledge (15 Qs · Qualifying 20%)", topics:[{name:"Basic Computers",high:true}]},
          ],
        },
        { id:"skill", name:"Session 2 — Skill/Typing Test", icon:"⌨️", color:"#0ea5e9",
          weightage:"LDC/JSA: Typing | DEO: Data Entry Speed Test 15 min",
          units: [{ title:"Typing / Data Entry", topics:[
            {name:"English Typing: 35 WPM",high:true},
            {name:"Hindi Typing: 30 WPM (Hindi medium)",high:true},
            {name:"Data Entry: 8000 key depressions/hr",high:true},
          ]}],
        },
      ],
    },
    tip: "CHSL Tier II Session 1 is merit-deciding. Computer Knowledge (Section 3) is only qualifying. Maths + English carry 60% of Tier II — focus here most.",
  },

  cpo: {
    name: "SSC CPO", fullName: "Central Police Organisations (SI/ASI) Examination",
    stages: [{ id:"paper1", label:"Paper I (CBT)" }, { id:"pet", label:"PET/PST" }, { id:"paper2", label:"Paper II (CBT)" }, { id:"dme", label:"DME" }],
    subjects: {
      paper1: [
        { id:"gk", name:"General Knowledge & Awareness", icon:"🌍", color:"#f59e0b",
          weightage:"50 Qs · 50 Marks | 200 Qs · 200 Marks · 2 hr | Sectional timing 30 min each | -0.25",
          units: [{ title:"GK Topics", topics:[
            {name:"History, Geography, Polity",high:true},{name:"Indian Economy"},
            {name:"Science & Technology",high:true},{name:"Current Affairs",high:true},{name:"Art & Culture"},
          ]}],
        },
        { id:"re", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7", weightage:"50 Qs · 50 Marks",
          units: [{ title:"Reasoning", topics:[
            {name:"Analogy, Classification, Series",high:true},{name:"Coding-Decoding, Blood Relations",high:true},
            {name:"Non-Verbal Reasoning",high:true},
          ]}],
        },
        { id:"qa", name:"Quantitative Aptitude", icon:"🔢", color:"#22c55e", weightage:"50 Qs · 50 Marks",
          units: [{ title:"All SSC CGL Maths topics", topics:[{name:"Same as CGL Tier I Maths",high:true}]}],
        },
        { id:"en", name:"English Comprehension", icon:"📖", color:"#0ea5e9", weightage:"50 Qs · 50 Marks",
          units: [{ title:"English", topics:[
            {name:"Reading Comprehension",high:true},{name:"Vocabulary, Grammar",high:true},
            {name:"Idioms, One Word Substitution",high:true},
          ]}],
        },
      ],
      pet: [{ id:"pet", name:"Physical Efficiency & Standards Test", icon:"🏃", color:"#ef4444",
        weightage:"Qualifying — must clear to appear Paper II",
        units: [{ title:"Physical Standards", topics:[
          {name:"Height & Chest standards"},{name:"Race (1.6 km run)",high:true},
          {name:"Long Jump",high:true},{name:"High Jump"},{name:"Shot Put (male)"},
        ]}],
      }],
      paper2: [{ id:"en2", name:"English Language & Comprehension", icon:"📖", color:"#0ea5e9",
        weightage:"200 Qs · 200 Marks · 2 hrs",
        units: [{ title:"Advanced English", topics:[
          {name:"Spot the Errors",high:true},{name:"Fill in the Blanks",high:true},
          {name:"Synonyms & Antonyms",high:true},{name:"Idioms & Phrases",high:true},
          {name:"Reading Comprehension (longer)",high:true},{name:"Para Jumbles / Cloze Test",high:true},
          {name:"Active/Passive, Direct/Indirect Speech"},
        ]}],
      }],
      dme: [{ id:"dme", name:"Detailed Medical Examination", icon:"🏥", color:"#22c55e",
        weightage:"Final stage — qualifying",
        units: [{ title:"Medical Standards", topics:[{name:"Vision Standards",high:true},{name:"General Physical Fitness",high:true}]}],
      }],
    },
    tip: "CPO Paper I has sectional timing of 30 min per subject — cannot revisit. Paper II (English, 200 Qs) is the real differentiator. PET/PST is qualifying — prepare physically in parallel.",
  },

  mts: {
    name: "SSC MTS", fullName: "Multi-Tasking (Non-Technical) Staff Examination",
    stages: [{ id:"session1", label:"Session I (Qualifying)" }, { id:"session2", label:"Session II (Merit)" }],
    subjects: {
      session1: [
        { id:"math", name:"Numerical & Mathematical Ability", icon:"🔢", color:"#22c55e",
          weightage:"20 Qs · 60 Marks | Non-Negative | 45 min | Total: 40 Qs · 120 Marks",
          units: [{ title:"Basic Mathematics", topics:[
            {name:"Number System",high:true},{name:"Percentage & Ratio",high:true},{name:"Profit & Loss"},
            {name:"Simple & Compound Interest"},{name:"Time & Work"},{name:"Mensuration Basics"},{name:"Basic Algebra"},
          ]}],
        },
        { id:"re", name:"Reasoning Ability & Problem Solving", icon:"🧠", color:"#a855f7",
          weightage:"20 Qs · 60 Marks",
          units: [{ title:"Basic Reasoning", topics:[
            {name:"Analogy & Series",high:true},{name:"Coding-Decoding",high:true},
            {name:"Blood Relations"},{name:"Venn Diagrams"},{name:"Non-Verbal Reasoning"},{name:"Mathematical Operations"},
          ]}],
        },
      ],
      session2: [
        { id:"ga", name:"General Awareness", icon:"🌍", color:"#f59e0b",
          weightage:"25 Qs · 75 Marks | Merit-Deciding | -1 -ve | 45 min",
          units: [{ title:"GK & Current Affairs", topics:[
            {name:"History & Geography",high:true},{name:"Indian Polity & Constitution",high:true},
            {name:"Current Affairs",high:true},{name:"General Science",high:true},{name:"Art & Culture, Economics"},
          ]}],
        },
        { id:"en", name:"English Language & Comprehension", icon:"📖", color:"#0ea5e9",
          weightage:"25 Qs · 75 Marks | Total Session II: 50 Qs · 150 Marks",
          units: [{ title:"Basic English", topics:[
            {name:"Vocabulary & Synonyms/Antonyms",high:true},{name:"Fill in the Blanks",high:true},
            {name:"Reading Comprehension",high:true},{name:"Spot the Error"},{name:"Sentence Improvement"},
          ]}],
        },
      ],
    },
    tip: "Session I is only qualifying — no negative marking, just clear the cutoff. Session II is merit-deciding with -1 negative marking. Prioritize GA and English in Session II.",
  },

  gd: {
    name: "SSC GD", fullName: "General Duty Constable Examination",
    stages: [{ id:"cbt", label:"CBT" }, { id:"pet", label:"PET/PST" }, { id:"medical", label:"Medical" }],
    subjects: {
      cbt: [
        { id:"gk", name:"General Knowledge & General Awareness", icon:"🌍", color:"#f59e0b",
          weightage:"20 Qs · 40 Marks | 1 hr | -0.25 | 80 Qs · 160 Marks",
          units: [{ title:"GK Topics", topics:[
            {name:"History & Geography",high:true},{name:"Indian Polity",high:true},
            {name:"Science & Technology"},{name:"Current Affairs",high:true},
          ]}],
        },
        { id:"re", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7", weightage:"20 Qs · 40 Marks",
          units: [{ title:"Basic Reasoning", topics:[
            {name:"Analogy, Series, Coding",high:true},{name:"Non-Verbal Reasoning",high:true},{name:"Mathematical Operations"},
          ]}],
        },
        { id:"math", name:"Elementary Mathematics", icon:"🔢", color:"#22c55e", weightage:"20 Qs · 40 Marks",
          units: [{ title:"Basic Maths (Class 10)", topics:[
            {name:"Number System & Arithmetic",high:true},{name:"Percentage, Profit & Loss",high:true},
            {name:"Simple & Compound Interest"},{name:"Time & Work, Speed & Distance"},{name:"Basic Mensuration"},
          ]}],
        },
        { id:"en", name:"English / Hindi Language", icon:"📖", color:"#0ea5e9", weightage:"20 Qs · 40 Marks",
          units: [{ title:"Language Basics", topics:[
            {name:"Fill in the Blanks",high:true},{name:"Error Spotting"},
            {name:"Synonyms & Antonyms",high:true},{name:"Reading Comprehension"},
          ]}],
        },
      ],
      pet: [{ id:"pet", name:"Physical Efficiency & Standards Test", icon:"🏃", color:"#ef4444",
        weightage:"Qualifying only",
        units: [{ title:"Physical Tests", topics:[
          {name:"Race (1.6 km / 800m)",high:true},{name:"Long Jump",high:true},{name:"High Jump"},
        ]}],
      }],
      medical: [{ id:"med", name:"Medical Examination", icon:"🏥", color:"#22c55e",
        weightage:"Qualifying",
        units: [{ title:"Medical Standards", topics:[{name:"Vision & Physical Fitness Standards",high:true}]}],
      }],
    },
    tip: "GD CBT is Class 10 level — easiest among SSC exams. Focus on GK and Reasoning. PET is qualifying so train physically in parallel with CBT prep.",
  },

  ntpc: {
    name: "RRB NTPC", fullName: "Non-Technical Popular Categories Recruitment",
    stages: [{ id:"cbt1", label:"CBT 1" }, { id:"cbt2", label:"CBT 2" }],
    subjects: {
      cbt1: [
        { id:"ga", name:"General Awareness", icon:"🌍", color:"#f59e0b",
          weightage:"40 Qs · 40 Marks | 100 Qs · 100 Marks · 90 min | -1/3 -ve",
          units: [{ title:"GK & Current Affairs", topics:[
            {name:"History, Geography, Polity",high:true},{name:"Current Affairs",high:true},
            {name:"General Science",high:true},{name:"Indian Railways Awareness",high:true},
            {name:"Sports, Dates, Awards"},
          ]}],
        },
        { id:"math", name:"Mathematics", icon:"🔢", color:"#22c55e", weightage:"30 Qs · 30 Marks",
          units: [{ title:"Arithmetic & Basic Maths", topics:[
            {name:"Number System",high:true},{name:"Percentage & Ratio",high:true},
            {name:"Profit & Loss",high:true},{name:"Time & Work",high:true},
            {name:"Simple & Compound Interest"},{name:"Algebra & Equations"},
            {name:"Geometry & Mensuration",high:true},{name:"Statistics & DI",high:true},
          ]}],
        },
        { id:"re", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7", weightage:"30 Qs · 30 Marks",
          units: [{ title:"Reasoning Topics", topics:[
            {name:"Analogy, Classification, Series",high:true},{name:"Coding-Decoding",high:true},
            {name:"Blood Relations"},{name:"Syllogism",high:true},
            {name:"Non-Verbal Reasoning",high:true},{name:"Mathematical Operations",high:true},
          ]}],
        },
      ],
      cbt2: [
        { id:"ga2", name:"General Awareness", icon:"🌍", color:"#f59e0b",
          weightage:"50 Qs | 120 Qs · 90 min",
          units: [{ title:"Deeper GK", topics:[
            {name:"All CBT 1 topics (deeper)",high:true},{name:"Indian Railways (detailed)",high:true},
          ]}],
        },
        { id:"math2", name:"Mathematics", icon:"🔢", color:"#22c55e", weightage:"35 Qs",
          units: [{ title:"Advanced Maths", topics:[{name:"All CBT 1 Maths (deeper)",high:true}]}],
        },
        { id:"re2", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7", weightage:"35 Qs",
          units: [{ title:"Advanced Reasoning", topics:[{name:"All CBT 1 Reasoning (deeper)",high:true}]}],
        },
      ],
    },
    tip: "NTPC CBT 1 is qualifying — only shortlisted appear for CBT 2. GA carries most Qs (40 in CBT 1). Indian Railways current affairs is unique to NTPC — prepare separately.",
  },

  alp: {
    name: "RRB ALP", fullName: "Assistant Loco Pilot Recruitment",
    stages: [{ id:"cbt1", label:"CBT 1" }, { id:"cbt2a", label:"CBT 2 Part A" }, { id:"cbt2b", label:"CBT 2 Part B" }, { id:"cbat", label:"CBAT" }],
    subjects: {
      cbt1: [
        { id:"all", name:"CBT 1 — Qualifying Only (75 Qs · 60 min)", icon:"📋", color:"#0ea5e9",
          weightage:"Qualifying only — no merit weightage",
          units: [
            { title:"Mathematics (~20 Qs)", topics:[
              {name:"Number System, Arithmetic",high:true},{name:"Algebra, Geometry"},{name:"Mensuration",high:true},{name:"Trigonometry"},
            ]},
            { title:"General Intelligence & Reasoning (~25 Qs)", topics:[
              {name:"Analogy, Series, Coding",high:true},{name:"Non-Verbal Reasoning",high:true},
            ]},
            { title:"General Science (~20 Qs, Class 10)", topics:[
              {name:"Physics, Chemistry, Biology",high:true},
            ]},
            { title:"General Awareness & Current Affairs (~10 Qs)", topics:[
              {name:"National Events, Science & Tech, Sports"},
            ]},
          ],
        },
      ],
      cbt2a: [
        { id:"adv", name:"Part A — Merit-Deciding (100 Qs · 90 min · 50% weightage)", icon:"⚙️", color:"#e91e8c",
          weightage:"Advanced Maths + GA + Basic Sciences & Engineering",
          units: [
            { title:"Advanced Maths & GA", topics:[
              {name:"Advanced Maths",high:true},{name:"General Awareness (deeper)",high:true},
            ]},
            { title:"Basic Sciences & Engineering", topics:[
              {name:"Engineering Drawing",high:true},{name:"IT Literacy"},
              {name:"Basic Physics & Chemistry (advanced)"},{name:"Engineering topics"},
            ]},
          ],
        },
      ],
      cbt2b: [
        { id:"trade", name:"Part B — Trade Specific (75 Qs · 60 min · Qualifying 35%)", icon:"🔧", color:"#ef4444",
          weightage:"Qualifying only — must score 35%",
          units: [{ title:"Trade Knowledge", topics:[
            {name:"Mechanical Engineering basics",high:true},{name:"Electrical Engineering basics",high:true},{name:"Electronics basics"},
          ]}],
        },
      ],
      cbat: [
        { id:"cbat", name:"CBAT — Psychometric / Aptitude Test (50% weightage for merit)", icon:"🖥️", color:"#f59e0b",
          weightage:"Varies by section · Crucial for merit — 50% weightage",
          units: [{ title:"Aptitude Tests", topics:[
            {name:"Memory Test",high:true},{name:"Concentration Test",high:true},
            {name:"Perceptual Speed Test",high:true},{name:"Spatial Visualisation"},
          ]}],
        },
      ],
    },
    tip: "ALP CBT 1 is qualifying only. CBT 2 Part A (100 Qs) and CBAT each carry 50% of final merit. Part B (Trade) is qualifying at 35% only. Focus maximum time on CBT 2 Part A engineering topics.",
  },

  je: {
    name: "RRB JE", fullName: "Junior Engineer Recruitment",
    stages: [{ id:"cbt1", label:"CBT 1 (Screening)" }, { id:"cbt2", label:"CBT 2 (Merit)" }],
    subjects: {
      cbt1: [
        { id:"math", name:"Mathematics", icon:"🔢", color:"#22c55e",
          weightage:"30 Qs | 100 Qs · 90 min | -1/3 -ve",
          units: [{ title:"Engineering Level Maths", topics:[
            {name:"Number System & Algebra",high:true},{name:"Mensuration & Geometry",high:true},
            {name:"Trigonometry"},{name:"Statistics & DI"},
          ]}],
        },
        { id:"re", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7", weightage:"25 Qs",
          units: [{ title:"Reasoning", topics:[
            {name:"Analogy, Series, Coding",high:true},{name:"Non-Verbal Reasoning"},
          ]}],
        },
        { id:"gs", name:"General Awareness", icon:"🌍", color:"#f59e0b", weightage:"15 Qs",
          units: [{ title:"GK", topics:[{name:"Current Affairs",high:true},{name:"History, Geography, Polity"}]}],
        },
        { id:"sci", name:"General Science", icon:"🔬", color:"#0ea5e9", weightage:"30 Qs",
          units: [{ title:"Class 10+2 Science", topics:[
            {name:"Physics",high:true},{name:"Chemistry",high:true},{name:"Biology basics"},
          ]}],
        },
      ],
      cbt2: [
        { id:"ga2", name:"General Awareness", icon:"🌍", color:"#f59e0b",
          weightage:"15 Qs | 150 Qs · 120 min | -1/3 -ve",
          units: [{ title:"GK + Railways", topics:[{name:"Current Affairs & Indian Railways",high:true}]}],
        },
        { id:"phy", name:"Physics & Chemistry", icon:"🔬", color:"#0ea5e9", weightage:"15 Qs",
          units: [{ title:"Advanced Science", topics:[{name:"Physics (advanced)",high:true},{name:"Chemistry (advanced)",high:true}]}],
        },
        { id:"comp", name:"Basics of Computers & Applications", icon:"💻", color:"#a855f7", weightage:"10 Qs",
          units: [{ title:"Computer Basics", topics:[{name:"OS, MS Office, Networks",high:true}]}],
        },
        { id:"env", name:"Environment & Pollution Control", icon:"🌿", color:"#22c55e", weightage:"10 Qs",
          units: [{ title:"Environment", topics:[{name:"Pollution Types & Control",high:true},{name:"Environment Acts"}]}],
        },
        { id:"tech", name:"Technical Abilities (100 Qs · ~67% of CBT 2)", icon:"⚙️", color:"#ef4444",
          weightage:"100 Qs | Engineering branch-specific based on Diploma/Degree",
          units: [{ title:"Civil / Mechanical / Electrical / Electronics", topics:[
            {name:"Branch-specific engineering topics",high:true},{name:"Based on Diploma/Engineering curriculum",high:true},
          ]}],
        },
      ],
    },
    tip: "JE CBT 1 is only screening. CBT 2 Technical Abilities (100/150 Qs = 67%) is the real exam — master your engineering branch topics thoroughly.",
  },

  groupd: {
    name: "RRB Group D", fullName: "Level 1 Posts — Track Maintainer, Helper & more",
    stages: [{ id:"cbt", label:"CBT" }, { id:"pet", label:"PET" }, { id:"dv", label:"Document Verification" }],
    subjects: {
      cbt: [
        { id:"re", name:"General Intelligence & Reasoning", icon:"🧠", color:"#a855f7",
          weightage:"30 Qs · 30 Marks | 100 Qs · 90 min | -1/3 -ve",
          units: [{ title:"Reasoning Topics (Highest weightage)", topics:[
            {name:"Analogy & Classification",high:true},{name:"Series",high:true},{name:"Coding-Decoding",high:true},
            {name:"Blood Relations"},{name:"Non-Verbal Reasoning",high:true},
            {name:"Mathematical Operations"},{name:"Venn Diagrams, Syllogism"},
          ]}],
        },
        { id:"math", name:"Mathematics", icon:"🔢", color:"#22c55e", weightage:"25 Qs · 25 Marks",
          units: [{ title:"Basic Maths (Class 10)", topics:[
            {name:"Number System, LCM/HCF",high:true},{name:"Percentage & Ratio",high:true},
            {name:"Profit & Loss",high:true},{name:"Time & Work, Speed & Distance"},
            {name:"Simple & Compound Interest"},{name:"Mensuration & Geometry"},{name:"Basic Algebra"},
          ]}],
        },
        { id:"sci", name:"General Science", icon:"🔬", color:"#0ea5e9", weightage:"25 Qs · 25 Marks",
          units: [{ title:"Class 10 Science", topics:[
            {name:"Physics",high:true},{name:"Chemistry",high:true},
            {name:"Biology / Life Science",high:true},{name:"Environment & Ecology"},
          ]}],
        },
        { id:"ga", name:"General Awareness & Current Affairs", icon:"🌍", color:"#f59e0b", weightage:"20 Qs · 20 Marks",
          units: [{ title:"GK & Current Affairs", topics:[
            {name:"National & International Events",high:true},{name:"Indian Railways Awareness",high:true},
            {name:"Sports, Science & Tech",high:true},
          ]}],
        },
      ],
      pet: [{ id:"pet", name:"Physical Efficiency Test", icon:"🏃", color:"#ef4444",
        weightage:"Qualifying only",
        units: [{ title:"Physical Tests", topics:[
          {name:"Weight-lifting (Male: 35 kg, Female: 20 kg)",high:true},
          {name:"Running (1000m male / 1000m female)"},
        ]}],
      }],
      dv: [{ id:"dv", name:"Document Verification & Medical", icon:"📄", color:"#22c55e",
        weightage:"Final Stage",
        units: [{ title:"Verification", topics:[{name:"Document Verification",high:true},{name:"Medical Standards"}]}],
      }],
    },
    tip: "Group D is highly competitive. Reasoning (30 Qs) has highest weightage — focus here first. General Science is Class 10 level — revise NCERT books thoroughly.",
  },
};
// Fallback for exams without detailed data yet
const FALLBACK_SYLLABUS = {
  name: "Exam",
  fullName: "Detailed syllabus coming soon",
  stages: [{ id: "main", label: "Syllabus" }],
  subjects: { main: [] },
  tip: "Detailed topic-wise syllabus for this exam is being added. Check back soon!",
};

/* ════════════════════════════════════════════════════════════════
   SUBJECT ACCORDION
════════════════════════════════════════════════════════════════ */
function SubjectAccordion({ subject, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const totalTopics = subject.units.reduce((sum, u) => sum + u.topics.length, 0);
  const highCount = subject.units.reduce((sum, u) => sum + u.topics.filter(t => t.high).length, 0);

  return (
    <div className={`sy-subject${open ? " open" : ""}`}>
      <div className="sy-subject-head" onClick={() => setOpen(o => !o)}>
        <div className="sy-subject-icon" style={{ background: subject.color + "1a" }}>{subject.icon}</div>
        <div className="sy-subject-info">
          <div className="sy-subject-name">{subject.name}</div>
          <div className="sy-subject-meta">
            {subject.weightage} · {totalTopics} topics · {highCount} high-weightage
          </div>
        </div>
        <div className="sy-subject-chevron">⌄</div>
      </div>

      {open && (
        <div className="sy-subject-body">
          {subject.units.map((unit, i) => (
            <div className="sy-unit" key={i}>
              <div className="sy-unit-title">{unit.title}</div>
              <div className="sy-topics">
                {unit.topics.map((topic, j) => (
                  <div className={`sy-topic-chip${topic.high ? " high" : ""}`} key={j}>
                    <span className="sy-topic-num">{topic.high ? "★" : `${i+1}.${j+1}`}</span>
                    {topic.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
export default function SyllabusPage({ examId = "cgl", onBack }) {
  useEffect(() => { inject(); }, []);

  const data = SYLLABUS_DATA[examId] || FALLBACK_SYLLABUS;
  const [activeStage, setActiveStage] = useState(data.stages[0]?.id);

  const subjects = data.subjects[activeStage] || [];

  return (
    <div className="sy-page">
      <div className="sy-header">
        <div className="sy-back" onClick={onBack}>← Back to Dashboard</div>
        <div className="sy-eyebrow"><span className="sy-dot"/>Detailed Syllabus</div>
        <h1 className="sy-h1">{data.name}</h1>
        <div className="sy-sub">{data.fullName}</div>

        <div className="sy-meta-row">
          <div className="sy-meta-chip">📚 <strong>{Object.values(data.subjects).flat().length}</strong> subjects</div>
          <div className="sy-meta-chip">
            📝 <strong>{Object.values(data.subjects).flat().reduce((s, sub) => s + sub.units.reduce((u, un) => u + un.topics.length, 0), 0)}</strong> topics
          </div>
          <div className="sy-meta-chip">★ High-weightage topics marked</div>
        </div>

        {/* STAGE TABS */}
        {data.stages.length > 1 && (
          <div className="sy-stage-tabs" style={{ marginTop: 22, marginBottom: -1 }}>
            {data.stages.map(stage => (
              <button key={stage.id}
                className={`sy-stage-tab${activeStage===stage.id?" active":""}`}
                onClick={() => setActiveStage(stage.id)}>
                {stage.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sy-body">
        {subjects.length === 0 ? (
          <div className="sy-tip-box">
            <span>ℹ️</span><span>{data.tip}</span>
          </div>
        ) : (
          <>
            {subjects.map((subject, i) => (
              <SubjectAccordion key={subject.id} subject={subject} defaultOpen={i === 0} />
            ))}

            <div className="sy-tip-box">
              <span>💡</span>
              <span><strong>Exam Tip:</strong> {data.tip}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
