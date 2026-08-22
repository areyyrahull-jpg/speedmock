import React, { useState, useEffect } from "react";
import { RotateCcw, Clock, Calendar, Layers, BookOpen, FileStack, History, Loader2, AlertTriangle, LogIn } from "lucide-react";
import { fetchTestHistory, fetchAttemptDetail, reattemptTest, submitAttempt, pauseAttempt } from "../../../services/testApi";
import { useAuth } from "../../../context/AuthContext";
import TestScreen from "./TestScreen";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

/* ── theme-aware tokens ──────────────────────────────────────────── */
function getTokens(isDark) {
  return isDark ? {
    bg:"#16171C", bgElevated:"#1C1E25", surface:"#202229", surfaceAlt:"#272A33",
    border:"#34363F", borderSoft:"#2A2C34",
    ink:"#F2F2F5", inkSoft:"#9A9CAA", inkFaint:"#6B6D79",
    fuchsia:"#d946ef", fuchsiaBright:"#f472eb", fuchsiaDim:"#6E2155",
    fuchsiaSoft:"rgba(217,70,239,0.14)", fuchsiaBorder:"rgba(217,70,239,0.40)",
    correct:"#3ED9A0", correctSoft:"rgba(62,217,160,0.12)", correctBorder:"rgba(62,217,160,0.35)",
    wrong:"#FF5E72", wrongSoft:"rgba(255,94,114,0.12)", wrongBorder:"rgba(255,94,114,0.35)",
    skippedSolid:"#84869C", skippedSoft:"rgba(132,134,147,0.14)",
    shadow:"rgba(0,0,0,0.5)",
  } : {
    bg:"#F4F5F7", bgElevated:"#FFFFFF", surface:"#FFFFFF", surfaceAlt:"#F0F1F4",
    border:"#E2E4EA", borderSoft:"#EAECF0",
    ink:"#0F1117", inkSoft:"#5A5D6E", inkFaint:"#9395A3",
    fuchsia:"#d946ef", fuchsiaBright:"#c026d3", fuchsiaDim:"#f5d0fe",
    fuchsiaSoft:"rgba(217,70,239,0.08)", fuchsiaBorder:"rgba(217,70,239,0.30)",
    correct:"#059669", correctSoft:"rgba(5,150,105,0.08)", correctBorder:"rgba(5,150,105,0.30)",
    wrong:"#DC2626", wrongSoft:"rgba(220,38,38,0.08)", wrongBorder:"rgba(220,38,38,0.30)",
    skippedSolid:"#6B7280", skippedSoft:"rgba(107,114,128,0.10)",
    shadow:"rgba(0,0,0,0.08)",
  };
}

/* ── static fuchsia tokens (don't change with theme) ── */
const F = {
  fuchsia:"#d946ef", fuchsiaBright:"#f472eb", fuchsiaBorder:"rgba(217,70,239,0.40)",
  fuchsiaSoft:"rgba(217,70,239,0.14)",
};

const FONTS = (isDark) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
    * { box-sizing: border-box; }
    .th-display { font-family:'Sora','Inter',sans-serif; }
    .th-body    { font-family:'Inter',sans-serif; }
    .th-mono    { font-family:'JetBrains Mono',monospace; }
    .th-card { transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease; }
    .th-card:hover { transform:translateY(-2px); border-color:${F.fuchsiaBorder}!important; box-shadow:0 12px 28px -16px ${isDark ? "rgba(0,0,0,.6)" : "rgba(0,0,0,.12)"}; }
    .th-btn-primary { background:${F.fuchsia}!important; color:#fff!important; transition:background .15s,box-shadow .15s; }
    .th-btn-primary:hover { background:${F.fuchsiaBright}!important; box-shadow:0 0 0 1px ${F.fuchsiaBorder},0 8px 20px -6px rgba(217,70,239,.5); }
    .th-btn-outline:hover { background:${F.fuchsiaSoft}!important; border-color:${F.fuchsiaBorder}!important; color:${F.fuchsiaBright}!important; }
    .th-chip-active { background:${F.fuchsia}!important; border-color:${F.fuchsia}!important; color:#fff!important; }
    @keyframes th-rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    .th-rise { animation:th-rise .3s ease both; }
    .sub-dashboard-btn {
      display:inline-flex;align-items:center;gap:8px;
      padding:8px 16px;border-radius:10px;border:none;
      background:linear-gradient(135deg,#d946ef,#a21caf);
      color:#fff;font-size:11px;font-weight:700;
      cursor:pointer;font-family:'Inter',sans-serif;
      transition:transform .2s ease, box-shadow .2s ease;
      box-shadow:0 4px 16px rgba(217,70,239,.3);
      letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;
    }
    .sub-dashboard-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(217,70,239,.5); }
    .sub-dashboard-btn:active { transform:translateY(-1px); }
    .sub-dashboard-btn-icon { font-size:12px;display:flex;align-items:center; }
  `}</style>
);

const SECTION_COLORS = ["#0ea5e9","#f59e0b","#3ED9A0","#d946ef","#a855f7","#ef4444"];

/* ── demo data ───────────────────────────────────────────────────── */
const QA = [
  { text:"Solve for x: 2x + 5 = 17",options:["5","6","7","8"],correct:1,explanation:"2x=12, x=6." },
  { text:"sin(90°) = ?",options:["0","0.5","1","−1"],correct:2,explanation:"sin(90°)=1." },
  { text:"Interior angles of a triangle sum to:",options:["90°","180°","270°","360°"],correct:1,explanation:"Always 180°." },
  { text:"Probability of even on a die:",options:["1/6","1/3","1/2","2/3"],correct:2,explanation:"3/6=1/2." },
  { text:"log₁₀(100)=?",options:["1","2","10","100"],correct:1,explanation:"10²=100." },
];
const GI = [
  { text:"Next: 2,6,12,20,30,?",options:["36","40","42","44"],correct:2,explanation:"Differences:4,6,8,10,12 → 42." },
  { text:"CAT=24-1-20, DOG=?",options:["4-15-7","4-14-7","5-15-7","4-15-8"],correct:0,explanation:"D=4,O=15,G=7." },
  { text:"Odd one out: Apple,Mango,Carrot,Banana",options:["Apple","Mango","Carrot","Banana"],correct:2,explanation:"Carrot is a vegetable." },
  { text:"Find the missing number: 8,27,64,?",options:["100","121","125","216"],correct:2,explanation:"Cubes: 2³,3³,4³,5³=125." },
  { text:"Mirror image of 'b' is:",options:["d","p","q","b"],correct:1,explanation:"Mirror of b is p." },
];

function buildSec(name,bank,pattern) {
  const questions=bank.map((item,i)=>{
    const status=pattern[i]||"skipped";
    const userAnswer=status==="correct"?item.correct:status==="wrong"?(item.correct+1)%item.options.length:null;
    return { number:i+1,text:item.text,options:item.options,correct:item.correct,explanation:item.explanation,status,userAnswer };
  });
  return { name,questions,total:questions.length,
    correct:questions.filter(q=>q.status==="correct").length,
    wrong:questions.filter(q=>q.status==="wrong").length,
    skipped:questions.filter(q=>q.status==="skipped").length };
}
function summarize(sections) {
  const correct=sections.reduce((s,sec)=>s+sec.correct,0);
  const wrong=sections.reduce((s,sec)=>s+sec.wrong,0);
  const skipped=sections.reduce((s,sec)=>s+sec.skipped,0);
  const total=sections.reduce((s,sec)=>s+sec.total,0);
  const attempted=correct+wrong;
  return { correct,wrong,skipped,total,score:correct*4-wrong,maxScore:total*4,
    accuracy:attempted?Math.round(correct/attempted*1000)/10:0 };
}

const DEMO_TESTS=[
  { attemptId:"d1",testId:"d1",testType:"FULL",type:"full",label:"Full Paper",title:"SSC CGL Full Mock #12",date:"Jun 15, 2026",duration:"2h 0m",
    sections:[buildSec("Quantitative Aptitude",QA,["correct","wrong","correct","skipped","correct"]),buildSec("General Intelligence",GI,["wrong","correct","correct","skipped","wrong"])] },
  { attemptId:"d2",testId:"d2",testType:"PYQ",type:"pyq",label:"Previous Year · 2023",title:"SSC CGL Tier 1 2023",date:"Jun 10, 2026",duration:"1h 0m",
    sections:[buildSec("Quantitative Aptitude",QA,["correct","wrong","correct","correct","skipped"]),buildSec("General Intelligence",GI,["correct","correct","wrong","correct","wrong"])] },
  { attemptId:"d3",testId:"d3",testType:"SUBJECT_WISE",type:"subject",label:"General Intelligence",title:"GI Practice Test",date:"Jun 8, 2026",duration:"30m",
    sections:[buildSec("General Intelligence",GI,["correct","wrong","correct","correct","skipped"])] },
].map(t=>({...t,summary:summarize(t.sections)}));

/* ── score ring ─────────────────────────────────────────────────── */
function ScoreRing({ score, maxScore, size=64, C }) {
  const pct = Math.max(0,Math.min(100,Math.round(score/maxScore*100)));
  const tier = pct>=60?C.correct:pct>=35?C.fuchsia:C.wrong;
  const stroke=Math.max(4,size*0.09), r=(size-stroke)/2;
  const circ=2*Math.PI*r, offset=circ*(1-pct/100);
  return (
    <div style={{ position:"relative",width:size,height:size,flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={C.border} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={tier} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 5px ${tier}88)` }}/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }} className="th-mono">
        <span style={{ fontWeight:600,lineHeight:1,fontSize:size*0.24,color:C.ink }}>{score}</span>
        <span style={{ fontSize:size*0.13,color:C.inkFaint }}>/ {maxScore}</span>
      </div>
    </div>
  );
}

/* ── section chips ───────────────────────────────────────────────── */
function tierColor(c,t,C) { if(!t)return C.skippedSolid; const p=c/t*100; return p>=60?C.correct:p>=35?C.fuchsia:C.wrong; }

function SectionChips({ sections, C }) {
  if(!sections||sections.length<=1) return null;
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginTop:10 }}>
      {sections.map(s=>{
        const color=tierColor(s.correct,s.correct+s.wrong,C);
        return (
          <span key={s.name} className="th-mono"
            style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,
              background:`${color}1A`,color,border:`1px solid ${color}55` }}>
            {s.name} · {s.correct}/{s.total}
          </span>
        );
      })}
    </div>
  );
}

/* ── test card ───────────────────────────────────────────────────── */
function TestCard({ test, onReview, onReattempt, C, isDark }) {
  const TYPE_STYLE = {
    full:    { bg:C.fuchsia,    color:"#fff",         border:"transparent",    icon:FileStack },
    pyq:     { bg:C.fuchsiaSoft,color:C.fuchsiaBright,border:C.fuchsiaBorder,  icon:History  },
    subject: { bg:C.surfaceAlt, color:C.inkSoft,       border:C.border,         icon:BookOpen  },
    topic:   { bg:C.surfaceAlt, color:C.inkSoft,       border:C.border,         icon:Layers    },
  };
  const ts=TYPE_STYLE[test.type]||TYPE_STYLE.full;
  const TypeIcon=ts.icon;
  const { correct,wrong,skipped,score,maxScore,accuracy }=test.summary;
  const bd=(test.type==="full"||test.type==="pyq")?(test.sectionBreakdown||test.sections?.map(({name,correct,wrong,skipped,total})=>({name,correct,wrong,skipped,total}))):null;
  return (
    <div className="th-card th-rise"
      style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 22px",
        display:"flex",flexDirection:"column",gap:14,
        boxShadow:isDark?"none":`0 1px 4px ${C.shadow}` }}>
      <div style={{ display:"flex",alignItems:"flex-start",gap:16 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6 }}>
            <span className="th-body"
              style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,
                textTransform:"uppercase",letterSpacing:"0.8px",padding:"2px 8px",borderRadius:20,
                background:ts.bg,color:ts.color,border:`1px solid ${ts.border}` }}>
              <TypeIcon size={11}/> {test.label}
            </span>
          </div>
          <div className="th-display"
            style={{ fontSize:17,fontWeight:700,color:C.ink,marginBottom:6,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {test.title}
          </div>
          <div className="th-body" style={{ display:"flex",alignItems:"center",gap:16,fontSize:12,color:C.inkFaint,flexWrap:"wrap" }}>
            <span style={{ display:"flex",alignItems:"center",gap:4 }}><Calendar size={12}/> {test.date}</span>
            <span style={{ display:"flex",alignItems:"center",gap:4 }}><Clock size={12}/> {test.duration}</span>
          </div>
          <div className="th-mono" style={{ display:"flex",alignItems:"center",gap:14,marginTop:8,fontSize:12,flexWrap:"wrap" }}>
            <span style={{ color:C.correct }}>{correct} correct</span>
            <span style={{ color:C.wrong }}>{wrong} wrong</span>
            <span style={{ color:C.skippedSolid }}>{skipped} skipped</span>
            <span style={{ color:C.fuchsiaBright }}>{accuracy}% accuracy</span>
          </div>
          <SectionChips sections={bd} C={C}/>
        </div>
        <ScoreRing score={score} maxScore={maxScore} size={60} C={C}/>
      </div>
      <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
        <button onClick={()=>onReview(test)} className="th-btn-outline th-body"
          style={{ padding:"8px 16px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",
            color:C.ink,fontWeight:600,fontSize:12,cursor:"pointer" }}>
          Review paper
        </button>
        <button onClick={()=>onReattempt(test)} className="th-btn-primary th-body"
          style={{ padding:"8px 16px",borderRadius:10,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",
            display:"flex",alignItems:"center",gap:6 }}>
          <RotateCcw size={13}/> Re-attempt
        </button>
      </div>
    </div>
  );
}

/* ── history view ────────────────────────────────────────────────── */
const FILTERS=[
  {key:"all",label:"All tests"},{key:"full",label:"Full paper"},
  {key:"pyq",label:"Previous year"},{key:"subject",label:"Subject wise"},{key:"topic",label:"Topic wise"},
];

function HistoryView({ tests, loading, usingDemo, error, onReview, onReattempt, C, isDark }) {
  const [filter,setFilter]=useState("all");
  const filtered=filter==="all"?tests:tests.filter(t=>t.type===filter);
  const navigate=useNavigate();
  return (
    <div style={{ maxWidth:740,margin:"0 auto",padding:"40px 20px 60px" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:4 }}>
        <div className="th-body" style={{ fontSize:11,fontWeight:700,letterSpacing:"1.8px",textTransform:"uppercase",color:C.fuchsia }}>
          Your practice record
        </div>
        <button className="sub-dashboard-btn" onClick={() => navigate("/dashboard")}>
          <span className="sub-dashboard-btn-icon">📊</span>
          Go to Dashboard
        </button>
      </div>
      <h1 className="th-display" style={{ fontSize:36,fontWeight:800,color:C.ink,marginBottom:8 }}>Test history</h1>
      <p className="th-body" style={{ color:C.inkSoft,fontSize:14,lineHeight:1.7,marginBottom:24,maxWidth:480 }}>
        Every attempt below is one of four formats —{" "}
        <span style={{ color:C.fuchsiaBright,fontWeight:700 }}>previous year papers</span>,{" "}
        <span style={{ fontWeight:600,color:C.ink }}>subject wise</span> drills,{" "}
        <span style={{ fontWeight:600,color:C.ink }}>topic wise</span> practice, and{" "}
        <span style={{ color:C.fuchsia,fontWeight:700 }}>full paper</span> mocks.
      </p>

      {usingDemo && (
        <div className="th-body"
          style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderRadius:12,
            background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.inkSoft,fontSize:12,marginBottom:20 }}>
          <AlertTriangle size={14} color={C.fuchsiaBright} style={{ flexShrink:0,marginTop:1 }}/>
          Showing sample data — couldn't reach the API{error?` (${error})`:""}.
        </div>
      )}

      <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:24 }}>
        {FILTERS.map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)} className={`th-chip ${filter===f.key?"th-chip-active":""} th-body`}
            style={{ padding:"7px 14px",borderRadius:20,border:`1px solid ${filter===f.key?C.fuchsia:C.border}`,
              background:filter===f.key?C.fuchsia:C.surface,color:filter===f.key?"#fff":C.inkSoft,
              fontWeight:600,fontSize:12,cursor:"pointer" }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",padding:"60px 0" }}>
          <Loader2 size={22} color={C.fuchsia} className="animate-spin"/>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {filtered.map(t=>(
            <TestCard key={t.attemptId} test={t} onReview={onReview} onReattempt={onReattempt} C={C} isDark={isDark}/>
          ))}
          {filtered.length===0&&(
            <p className="th-body" style={{ textAlign:"center",padding:"48px 0",color:C.inkFaint,fontSize:14 }}>
              No tests in this category yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── transform for review screen ─────────────────────────────────── */
function transformAttemptForReview(detail) {
  const sections=detail.sections.map((sec,sIdx)=>({
    id:`sec-${sIdx}`,name:sec.name,color:SECTION_COLORS[sIdx%SECTION_COLORS.length],count:sec.total,
  }));
  const questions=detail.sections.flatMap((sec,sIdx)=>
    sec.questions.map(q=>({
      id:`${sIdx}-${q.number}`,number:q.number,sectionId:`sec-${sIdx}`,
      text:q.text,options:q.options,explanation:q.explanation,correctIndex:q.correct,
    }))
  );
  const answers={}, correctAnswers={};
  detail.sections.forEach((sec,sIdx)=>{
    sec.questions.forEach(q=>{
      const qId=`${sIdx}-${q.number}`;
      answers[qId]=q.userAnswer;
      correctAnswers[qId]=q.correct;
    });
  });
  return {
    test:{ testName:detail.title,durationMins:0,sections,questions },
    reviewData:{ answers,correctAnswers,timePerQ:detail.timePerQ||{} },
  };
}

/* ── toast ───────────────────────────────────────────────────────── */
function Toast({ message, onDone, C }) {
  useEffect(()=>{ const t=setTimeout(onDone,2400); return()=>clearTimeout(t); },[onDone]);
  return (
    <div className="th-body"
      style={{ position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",
        background:C.bgElevated,color:C.ink,border:`1px solid ${C.fuchsiaBorder}`,
        padding:"10px 18px",borderRadius:12,fontSize:13,fontWeight:500,
        boxShadow:"0 8px 24px rgba(0,0,0,.4)",zIndex:999,whiteSpace:"nowrap" }}>
      {message}
    </div>
  );
}

/* ── centering helper ────────────────────────────────────────────── */
function Centered({ icon:Icon, children, C }) {
  return (
    <div className="th-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",gap:12,padding:"80px 20px",color:C.inkSoft,fontSize:14 }}>
      <Icon size={22} color={C.fuchsiaBright}/>
      {children}
    </div>
  );
}

/* ── page root ───────────────────────────────────────────────────── */
export default function TestHistoryPage() {
  const { isAuthenticated, loading:authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const C = getTokens(isDark);

  // ── Sync theme to <html data-theme="..."> so the full CSS variable
  //    cascade triggers (backgrounds, borders, palette colours etc.)
  //    Without this, only inline-styled elements respond to theme changes
  //    since the CSS rule `[data-theme="light"] { --bg: ... }` never fires.
  //    TestScreen already does this — mirroring the same pattern here.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // No cleanup that forces a hardcoded theme here — that was stamping
    // data-theme="dark" onto <html> every time this page unmounted or
    // `theme` changed, even if the user's real preference (in
    // ThemeContext) was "light". Just keep the attribute in sync with
    // the current theme; whoever navigates to next will set their own.
  }, [theme]);

  const [view,setView]=useState("history");
  const [tests,setTests]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [usingDemo,setUsingDemo]=useState(false);

  const [reviewProps,setReviewProps]=useState(null);
  const [reviewLoading,setReviewLoading]=useState(false);
  const [reviewError,setReviewError]=useState(null);
  const [activeTest,setActiveTest]=useState(null);

  const [reattemptData,setReattemptData]=useState(null);
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    if(authLoading) return;
    if(!isAuthenticated){ setLoading(false); return; }
    setLoading(true);
    fetchTestHistory()
      .then(d=>setTests(d))
      .catch(e=>{ setError(e.message); setUsingDemo(true); setTests(DEMO_TESTS); })
      .finally(()=>setLoading(false));
  },[authLoading,isAuthenticated]);

  const handleReview=async(test)=>{
    setActiveTest(test); setReviewLoading(true); setReviewError(null); setView("review");
    try {
      const detail=test.sections?test:await fetchAttemptDetail(test.attemptId);
      setReviewProps(transformAttemptForReview(detail));
    } catch(e){ setReviewError(e.message); }
    finally{ setReviewLoading(false); }
  };

  const handleReattempt=async(test)=>{
    try {
      const { attemptId }=await reattemptTest(test.testId,test.testType);
      setReattemptData({ ...test,newAttemptId:attemptId });
    } catch {
      setToast(`Demo — connect the API to re-attempt "${test.title}".`);
      setReattemptData({ ...test,newAttemptId:null });
    }
    setView("reattempt");
  };

  const handleBack=()=>{ setView("history"); setReviewProps(null); setReattemptData(null); };

  const shell=(children)=>(
    <div className="th-body" style={{ minHeight:"100vh",width:"100%",background:C.bg,position:"relative",overflow:"hidden" }}>
      {FONTS(isDark)}
      <div style={{ pointerEvents:"none",position:"absolute",inset:0,top:0,height:320,
        background:`radial-gradient(ellipse 700px 280px at 50% -10%,${isDark?"#6E215538":"#f5d0fe28"},transparent 70%)` }}/>
      <div style={{ position:"relative" }}>{children}</div>
      {toast&&<Toast message={toast} onDone={()=>setToast(null)} C={C}/>}
    </div>
  );

  if(authLoading) return shell(<Centered icon={Loader2} C={C}>Checking your session…</Centered>);
  if(!isAuthenticated) return shell(<Centered icon={LogIn} C={C}>Log in to see your test history.</Centered>);

  if(view==="review") {
    if(reviewLoading) return shell(<Centered icon={Loader2} C={C}>Loading question paper…</Centered>);
    if(reviewError||!reviewProps) return shell(
      <Centered icon={AlertTriangle} C={C}>
        Couldn't load this attempt{reviewError?`: ${reviewError}`:""}
        <button onClick={handleBack} style={{ marginTop:8,padding:"8px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.inkSoft,cursor:"pointer",fontSize:12 }}>
          ← Back to history
        </button>
      </Centered>
    );
    return shell(
      <TestScreen
        test={reviewProps.test}
        reviewData={reviewProps.reviewData}
        mode="review"
        onBack={handleBack}
        candidate={{ name:"",id:activeTest?.title||"" }}
      />
    );
  }

  if(view==="reattempt"&&reattemptData) {
    const sections=(reattemptData.sections||[]).map((sec,i)=>({
      id:`sec-${i}`,name:sec.name,color:SECTION_COLORS[i%SECTION_COLORS.length],count:sec.total,
    }));
    const questions=(reattemptData.sections||[]).flatMap((sec,sIdx)=>
      sec.questions.map(q=>({ id:`${sIdx}-${q.number}`,number:q.number,sectionId:`sec-${sIdx}`,text:q.text,options:q.options }))
    );
    return shell(
      <TestScreen
        test={{ testName:reattemptData.title,durationMins:60,sections,questions }}
        mode="live"
        onBack={handleBack}
        onSubmit={async(payload)=>{
          if(reattemptData.newAttemptId) {
            await submitAttempt(reattemptData.newAttemptId,payload).catch(()=>{});
          }
          setToast("Attempt submitted! Returning to history…");
          setTimeout(handleBack,1800);
        }}
        onPause={async(payload)=>{
          if(reattemptData.newAttemptId) await pauseAttempt(reattemptData.newAttemptId,payload).catch(()=>{});
        }}
      />
    );
  }

  return shell(
    <HistoryView
      tests={tests} loading={loading} usingDemo={usingDemo} error={error}
      onReview={handleReview} onReattempt={handleReattempt} C={C} isDark={isDark}
    />
  );
}
