import { useState, useEffect, useRef, useCallback } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";

const exercises = [
  {
    id:"home-row", title:"Home Row Drill", subtitle:"ASDF · JKL;", icon:"🏠",
    difficulty:"Beginner", duration:2, color:"#22c55e",
    desc:"Type only home row keys in random patterns. Foundation of all typing.",
    instruction:"Type the passage below. Only home row keys — no peeking!",
    passages:[
      "add all fall sad lads flask shall flag fall lads jack ask shall fall lads flag jack shall add ask fall sad lads flask shall add flag",
      "glass flask falls salads jacks lands shall falls flask flags salads flags shall jacks lands falls flask glass salads",
      "fall ask glad lads flask shall flag fall lads jack ask shall fall lads flag jack shall add ask fall sad glass flask",
    ],
  },
  {
    id:"top-row", title:"Top Row Extension", subtitle:"QWER · UIOP", icon:"⬆️",
    difficulty:"Beginner", duration:2, color:"#4db6f7",
    desc:"Reach to top row and snap back to home. Focus on returning to home keys every time.",
    instruction:"Reach up and return. Keep snapping back to home row after each key.",
    passages:[
      "we row tip pro wire poor riot type upper tower write quite prior power quirk tower wire quite power tower",
      "power tower write quite prior upper tower rope wire quite tower write proper quite power upper tower write quite",
      "tower write quite prior power upper wire tower write quite power tower write prior quite upper power tower quite",
    ],
  },
  {
    id:"bottom-row", title:"Bottom Row Stretch", subtitle:"ZXCV · NM,.", icon:"⬇️",
    difficulty:"Beginner", duration:2, color:"#9c27b0",
    desc:"Most typists struggle here. Slow and deliberate — accuracy over speed.",
    instruction:"Type slowly and carefully. Bottom row needs the most focused practice.",
    passages:[
      "van can man zinc next calm zinc name vain calm zinc next man calm vain zinc name next calm man vain zinc next",
      "come zinc name vain calm next zinc man come calm vain name zinc next calm man come vain name zinc next calm",
      "vacuum cancel naming zinc vain calm next come name vacuum cancel calm zinc naming vain next vacuum cancel",
    ],
  },
  {
    id:"digraphs", title:"Common Digraphs", subtitle:"TH HE IN ER AN", icon:"🔤",
    difficulty:"Intermediate", duration:3, color:"var(--hinb)",
    desc:"These 5 pairs make up 30% of English text. Drill until they feel automatic.",
    instruction:"Focus on smooth transitions between letter pairs — no pause between them.",
    passages:[
      "the then there other their gather weather whether father rather together another mother neither there then the",
      "here where there these other either gather weather whether together another mother neither here either there other",
      "in into inside within begin origin within inside begin into origin begin inside within origin into begin within",
    ],
  },
  {
    id:"common-words", title:"Common Word Practice", subtitle:"Top 100 Words", icon:"📝",
    difficulty:"Intermediate", duration:5, color:"var(--f)",
    desc:"Type the 100 most common English words repeatedly. Pure muscle memory building.",
    instruction:"These words make up 50% of all English text. Type them fluently and smoothly.",
    passages:[
      "the and for are but not you all can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use",
      "about after again all along also another any around away back been before being below between both came come could each even every few find first from give good great",
      "time year people way day man woman child hand part place case week system program question government number night point home water room mother area money story fact",
    ],
  },
  {
    id:"ssc-speed", title:"SSC Speed Drill", subtitle:"Full Paragraphs", icon:"🏆",
    difficulty:"Advanced", duration:5, color:"var(--fb)",
    desc:"Real SSC-style passage at maximum comfortable speed. Aim for zero errors.",
    instruction:"SSC exam format. Type accurately at your fastest comfortable pace.",
    passages:[
      "The development of infrastructure is essential for the growth of any nation. Roads bridges and railways connect people and goods across the country. Modern transportation systems help in reducing the cost of moving goods and improve the efficiency of trade and commerce across different regions.",
      "Education is the most powerful weapon which you can use to change the world. A well educated population leads to economic development and social progress. The government has been working to provide quality education to every child in the country through various schemes and programmes.",
      "Technology has transformed the way we live and work in the modern world. Computers smartphones and the internet have made communication faster and more efficient than ever before. The digital revolution has created new opportunities for business education and entertainment.",
    ],
  },
];

const diffColor = { Beginner:"#22c55e", Intermediate:"var(--hinb)", Advanced:"#ef4444" };

function calcWPM(correct, secs) { return secs < 1 ? 0 : Math.round((correct/5)/(secs/60)); }
function calcAcc(correct, total) { return total === 0 ? 100 : Math.round((correct/total)*100); }

/* ─── TYPING ENGINE ─────────────────────────────────────────────── */
function TypingEngine({ exercise, onDone }) {
  const totalSecs = exercise.duration * 60;
  const [passage]             = useState(() => exercise.passages[Math.floor(Math.random()*exercise.passages.length)]);
  const [input, setInput]     = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [done, setDone]       = useState(false);
  const [result, setResult]   = useState(null);
  const [liveWPM, setLiveWPM] = useState(0);
  const [liveAcc, setLiveAcc] = useState(100);
  const [liveErr, setLiveErr] = useState(0);

  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const t0        = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  useEffect(() => {
    if (timeLeft === 0 && started && !done) finish();
  }, [timeLeft]);

  useEffect(() => {
    if (!started || done) return;
    const elapsed = (Date.now() - t0.current) / 1000;
    let ok = 0, err = 0;
    for (let i = 0; i < input.length; i++) {
      input[i] === passage[i] ? ok++ : err++;
    }
    setLiveWPM(calcWPM(ok, Math.max(elapsed,1)));
    setLiveAcc(calcAcc(ok, input.length));
    setLiveErr(err);
  }, [input]);

  const finish = useCallback(() => {
    clearInterval(timerRef.current);
    const elapsed = t0.current ? (Date.now()-t0.current)/1000 : 1;
    const inp = inputRef.current?.value || "";
    let ok = 0, err = 0;
    for (let i = 0; i < inp.length; i++) inp[i]===passage[i] ? ok++ : err++;
    const r = { wpm:calcWPM(ok,elapsed), acc:calcAcc(ok,inp.length), err, ok };
    setResult(r); setDone(true);
    onDone && onDone(r);
  }, [passage, onDone]);

  const handleInput = (e) => {
    if (done) return;
    const val = e.target.value;
    if (val.length > passage.length) return;
    if (!started && val.length > 0) {
      setStarted(true);
      t0.current = Date.now();
      timerRef.current = setInterval(() => setTimeLeft(p => { if(p<=1){clearInterval(timerRef.current);return 0;} return p-1; }), 1000);
    }
    setInput(val);
    if (val.length === passage.length) finish();
  };

  const retry = () => {
    clearInterval(timerRef.current);
    setInput(""); setStarted(false); setTimeLeft(totalSecs); setDone(false); setResult(null);
    setLiveWPM(0); setLiveAcc(100); setLiveErr(0); t0.current=null;
    setTimeout(()=>inputRef.current?.focus(),80);
  };

  const mm = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss = String(timeLeft%60).padStart(2,"0");
  const timerColor = !started?"var(--g4)":timeLeft>totalSecs*0.5?"#22c55e":timeLeft>totalSecs*0.25?"var(--hinb)":"#ef4444";
  const pct = (timeLeft/totalSecs)*100;
  const progress = passage.length ? Math.round((input.length/passage.length)*100) : 0;

  const renderPassage = () => passage.split("").map((char,i)=>{
    let color="var(--g4)",bg="transparent",ul=false;
    if(i<input.length){ if(input[i]===char) color="#22c55e"; else{color="#fff";bg="rgba(239,68,68,0.3)";} }
    else if(i===input.length){ul=true;color="#fff";}
    return <span key={i} style={{color,background:bg,borderBottom:ul?`2px solid ${exercise.color}`:"none",borderRadius:2,fontFamily:"'Courier Prime',monospace",fontSize:"0.98rem",lineHeight:1.9,transition:"color 0.05s"}}>{char}</span>;
  });

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* live stats */}
      <div style={{display:"flex",gap:0,border:"1px solid var(--g6)",borderRadius:12,overflow:"hidden"}}>
        {[
          {val:started?liveWPM:0,   unit:"WPM",lbl:"Speed",   color:exercise.color},
          {val:started?liveAcc:100, unit:"%",  lbl:"Accuracy",color:"#22c55e"},
          {val:started?liveErr:0,   unit:"",   lbl:"Errors",  color:liveErr>5?"#ef4444":"var(--hinb)"},
          {val:`${progress}%`,      unit:"",   lbl:"Done",    color:"#4db6f7"},
        ].map((s,i)=>(
          <div key={i} style={{flex:1,padding:"10px 6px",textAlign:"center",borderRight:i<3?"1px solid var(--g6)":"none",background:"var(--g8)"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:1.5,color:s.color,lineHeight:1}}>
              {s.val}<span style={{fontSize:"0.78rem",opacity:0.7}}>{s.unit}</span>
            </div>
            <div style={{fontSize:"0.55rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"var(--g4)",marginTop:3}}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* timer row */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
          <svg style={{transform:"rotate(-90deg)"}} width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="var(--g7)" strokeWidth="4.5"/>
            <circle cx="30" cy="30" r="24" fill="none" stroke={timerColor} strokeWidth="4.5"
              strokeDasharray={`${2*Math.PI*24}`}
              strokeDashoffset={`${2*Math.PI*24*(1-pct/100)}`}
              strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.88rem",letterSpacing:1,color:timerColor}}>{mm}:{ss}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:2,color:!started?"var(--hinb)":done?"#22c55e":"#fff"}}>
            {!started?"⌨ Start typing to begin timer":done?"✓ Complete!":"Timer Running..."}
          </div>
          <div style={{fontSize:"0.64rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)",marginTop:2}}>{exercise.duration} Min · {exercise.difficulty}</div>
        </div>
        {started&&!done&&(
          <button onClick={finish} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",borderRadius:50,padding:"6px 14px",fontFamily:"'Outfit',sans-serif",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            End Early
          </button>
        )}
      </div>

      {/* passage */}
      <div style={{background:"var(--g8)",border:`1.5px solid ${started&&!done?exercise.color+"44":"var(--g6)"}`,borderRadius:13,padding:"16px 16px",transition:"border-color 0.3s"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.6rem",letterSpacing:"2px",color:exercise.color+"77",marginBottom:7,textTransform:"uppercase"}}>Type this ↓</div>
        <div style={{lineHeight:1.9,wordBreak:"break-word",userSelect:"none"}}>{renderPassage()}</div>
      </div>

      {/* progress */}
      {started&&!done&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)"}}>Progress</span>
            <span style={{fontSize:"0.68rem",fontWeight:700,color:exercise.color}}>{progress}%</span>
          </div>
          <div style={{height:4,background:"var(--g7)",borderRadius:50,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${exercise.color}88,${exercise.color})`,borderRadius:50,transition:"width 0.15s"}}/>
          </div>
        </div>
      )}

      {/* textarea */}
      {!done&&(
        <textarea ref={inputRef} rows={3} value={input} onChange={handleInput}
          spellCheck={false} autoCorrect="off" autoCapitalize="off"
          placeholder="Start typing here — timer begins on your first keystroke..."
          style={{width:"100%",background:"var(--g75)",border:`1.5px solid ${started?"var(--g6)":"rgba(255,167,38,0.22)"}`,borderRadius:11,padding:"13px 15px",fontFamily:"'Courier Prime',monospace",fontSize:"0.96rem",color:"#fff",outline:"none",resize:"none",lineHeight:1.7,transition:"border-color 0.2s"}}
          onFocus={e=>e.target.style.borderColor=exercise.color}
          onBlur={e=>e.target.style.borderColor=started?"var(--g6)":"rgba(255,167,38,0.22)"}
        />
      )}

      {/* result */}
      {done&&result&&(
        <div style={{background:"var(--g8)",border:`1px solid ${result.acc>=95?"rgba(34,197,94,0.3)":"rgba(255,167,38,0.3)"}`,borderRadius:16,padding:"20px 18px",position:"relative",overflow:"hidden",animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${exercise.color}88,${exercise.color})`}}/>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:"2rem",marginBottom:6}}>{result.acc>=95?"🏆":"💪"}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:2,color:result.acc>=95?"#22c55e":"var(--hinb)"}}>{result.acc>=95?"Great Work!":"Keep Practicing!"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[{val:result.wpm,unit:"WPM",lbl:"Speed",color:exercise.color},{val:`${result.acc}%`,unit:"",lbl:"Accuracy",color:result.acc>=95?"#22c55e":"var(--hinb)"},{val:result.err,unit:"",lbl:"Errors",color:result.err===0?"#22c55e":result.err<5?"var(--hinb)":"#ef4444"}].map((s,i)=>(
              <div key={i} style={{background:"var(--g7)",borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.8rem",letterSpacing:1.5,color:s.color,lineHeight:1}}>{s.val}<span style={{fontSize:"0.8rem",opacity:0.7}}>{s.unit}</span></div>
                <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"var(--g4)",marginTop:3}}>{s.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:"0.75rem",color:result.acc>=95?"#22c55e":"var(--hinb)",background:result.acc>=95?"rgba(34,197,94,0.08)":"rgba(255,167,38,0.08)",border:`1px solid ${result.acc>=95?"rgba(34,197,94,0.2)":"rgba(255,167,38,0.2)"}`,borderRadius:9,padding:"9px 13px",marginBottom:14,lineHeight:1.5}}>
            {result.acc>=95?"✓ Excellent! Ready to move to the next exercise.":"⚠ Aim for 95%+ accuracy before moving on. Slow down and focus."}
          </div>
          <button onClick={retry} style={{width:"100%",height:40,background:"rgba(255,255,255,0.05)",color:"var(--g2)",border:"1px solid var(--g6)",borderRadius:9,fontFamily:"'Outfit',sans-serif",fontSize:"0.86rem",fontWeight:600,cursor:"pointer"}}>
            🔄 Retry Exercise
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function EnglishExercises({ onBack }) {
  const [active, setActive]       = useState(null);
  const [theme, setTheme] = usePqTheme();
  const [completed, setCompleted] = useState([]);

  return (
    <>
      <style>{`
:root{
          --f:#e91e8c;--fb:#ff3aaa;--fd:#b5005f;
          --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;--g7:#252532;
          --g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
          --hin:#ff6f00;--hinb:#ffa726;--hind:#e65100;
        }


        [data-pqtheme="light"]{
          --g9:#f5f5f8;--g8:#ffffff;--g75:#eeeef4;--g7:#e4e4ec;
          --g6:#d4d4df;--g4:#6b6b80;--g3:#5a5a70;--g2:#1a1a2e;--w:#ffffff;
          --f:#c026d3;--fb:#d946ef;--fd:#9c1abf;
          --hin:#b45309;--hinb:#d97706;--hind:#92400e;
        }
        [data-pqtheme="yellow"]{
          --g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;--g7:#ddd0a8;
          --g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#2e1f0a;--w:#f4ecd8;
          --f:#b45309;--fb:#d97706;--fd:#92400e;
          --hin:#b45309;--hinb:#d97706;--hind:#92400e;
        }
        [data-pqtheme] .page,[data-pqtheme] .practice-page,[data-pqtheme]{background:var(--g9)!important;color:var(--g2)!important}
        [data-pqtheme] *{transition:background .2s ease,color .15s ease,border-color .15s ease}
        .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px;flex-shrink:0}
        .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
        .pq-theme-btn:hover{opacity:.85}
        .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.08);box-shadow:0 0 0 1px var(--g6)}

        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=Courier+Prime&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--f)44;border-radius:3px}
        .page{min-height:100vh;background:var(--g9);padding-bottom:60px;
          background-image:radial-gradient(ellipse 60% 35% at 50% 0%,rgba(233,30,140,0.07) 0%,transparent 55%),
            linear-gradient(rgba(233,30,140,0.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(233,30,140,0.018) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 5%;align-items:start;}
        @media(max-width:800px){.grid{grid-template-columns:1fr!important;}}
      `}</style>

      <div className="page" data-pqtheme={theme}>

        {/* HEADER */}
        <div style={{padding:"40px 5% 28px",animation:"fadeUp 0.5s ease both"}}>
          <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"var(--g4)",fontFamily:"'Outfit',sans-serif",fontSize:"0.8rem",fontWeight:600,padding:0,marginBottom:18,transition:"color 0.18s"}}
            onMouseEnter={e=>e.target.style.color="var(--fb)"} onMouseLeave={e=>e.target.style.color="var(--g4)"}>
            ← Back to English Typing
          </button>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(233,30,140,0.08)",border:"1px solid rgba(233,30,140,0.22)",borderRadius:50,padding:"5px 16px",marginBottom:14,fontSize:"0.68rem",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",color:"var(--fb)"}}>
            💪 English Exercises
          </div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.2rem,5vw,3.8rem)",letterSpacing:3,color:"#fff",lineHeight:1,marginBottom:8}}>
            Typing Exercises
          </h1>
          <p style={{fontSize:"0.84rem",color:"var(--g4)",lineHeight:1.7,maxWidth:480}}>
            <strong style={{color:"#fff"}}>No countdown</strong> — click an exercise, start typing, and the timer begins automatically on your first keystroke.
          </p>
        </div>

        {/* PROGRESS */}
        <div style={{padding:"0 5%",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:"0.64rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)"}}>Overall Progress</span>
            <span style={{fontSize:"0.7rem",fontWeight:700,color:"var(--fb)"}}>{completed.length}/{exercises.length}</span>
          </div>
          <div style={{height:5,background:"var(--g7)",borderRadius:50,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(completed.length/exercises.length)*100}%`,background:"linear-gradient(90deg,var(--fd),var(--fb))",borderRadius:50,transition:"width 0.4s"}}/>
          </div>
        </div>

        {/* HINT */}
        <div style={{margin:"0 5% 20px",background:"rgba(233,30,140,0.05)",border:"1px solid rgba(233,30,140,0.14)",borderRadius:11,padding:"11px 15px",fontSize:"0.76rem",color:"var(--g3)",lineHeight:1.6}}>
          ⌨ Click any exercise → type in the panel → timer starts on first keystroke. Aim for <strong style={{color:"var(--fb)"}}>95%+ accuracy</strong> before moving up.
        </div>

        {/* GRID */}
        <div className="grid">

          {/* exercise list */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {exercises.map((ex,i)=>{
              const isActive = active?.id === ex.id;
              const isDone   = completed.includes(ex.id);
              return (
                <div key={ex.id}
                  style={{background:isActive?ex.color+"0e":isDone?"rgba(34,197,94,0.04)":"var(--g8)",
                    border:`1.5px solid ${isActive?ex.color+"66":isDone?"#22c55e33":"var(--g6)"}`,
                    borderRadius:16,padding:"16px 18px",cursor:"pointer",transition:"all 0.22s",
                    position:"relative",overflow:"hidden",
                    boxShadow:isActive?`0 0 0 2px ${ex.color}18,0 6px 20px ${ex.color}12`:"none",
                    animationDelay:`${i*0.06}s`,animation:"fadeUp 0.4s ease both",
                    transform:isActive?"translateX(4px)":"none"}}
                  onClick={()=>setActive(isActive?null:ex)}
                >
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"3px 0 0 3px",
                    background:isActive?ex.color:isDone?"#22c55e":"var(--g6)"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:11,background:ex.color+"18",border:`1px solid ${ex.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>
                      {isDone?"✓":ex.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:1.5,color:isActive?ex.color:"#fff"}}>{ex.title}</span>
                        {isDone&&<span style={{fontSize:"0.55rem",fontWeight:800,letterSpacing:"1.5px",textTransform:"uppercase",color:"#22c55e",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:50,padding:"2px 7px"}}>DONE</span>}
                      </div>
                      <div style={{fontSize:"0.7rem",color:"var(--g4)",marginTop:2}}>{ex.subtitle}</div>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.88rem",letterSpacing:1,color:isActive?ex.color:"var(--g4)",flexShrink:0}}>{ex.duration}m</div>
                  </div>
                  <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}}>
                    <span style={{background:diffColor[ex.difficulty]+"18",color:diffColor[ex.difficulty],border:`1px solid ${diffColor[ex.difficulty]}33`,borderRadius:50,padding:"2px 9px",fontSize:"0.58rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>
                      {ex.difficulty}
                    </span>
                    <span style={{background:"rgba(255,255,255,0.04)",color:"var(--g3)",border:"1px solid var(--g6)",borderRadius:50,padding:"2px 9px",fontSize:"0.58rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>
                      ⏱ {ex.duration} min
                    </span>
                  </div>
                  {isActive&&<p style={{fontSize:"0.74rem",color:"var(--g3)",marginTop:10,lineHeight:1.6,paddingTop:10,borderTop:"1px solid var(--g7)"}}>{ex.desc}</p>}
                </div>
              );
            })}
          </div>

          {/* typing panel */}
          {active ? (
            <div style={{background:"var(--g8)",border:`1.5px solid ${active.color}33`,borderRadius:18,padding:"20px 18px",position:"sticky",top:16}}>
              <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--g7)"}}>
                <div style={{width:38,height:38,borderRadius:10,background:active.color+"18",border:`1px solid ${active.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>{active.icon}</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:2,color:"#fff",lineHeight:1}}>{active.title}</div>
                  <div style={{fontSize:"0.68rem",color:"var(--g4)",marginTop:3}}>{active.instruction}</div>
                </div>
              </div>
              <TypingEngine
                key={active.id}
                exercise={active}
                onDone={(r)=>{ if(r.acc>=95) setCompleted(p=>p.includes(active.id)?p:[...p,active.id]); }}
              />
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"48px 20px",color:"var(--g4)",fontSize:"0.82rem",lineHeight:1.7,background:"var(--g8)",border:"1px solid var(--g7)",borderRadius:18}}>
              <div style={{fontSize:"2.5rem",marginBottom:12}}>👆</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",letterSpacing:2,color:"#fff",marginBottom:8}}>Select an Exercise</div>
              Click any exercise on the left to open it here.<br/>
              <span style={{fontSize:"0.7rem",color:"var(--g6)"}}>Timer starts on your first keystroke — no countdown.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}