import { useState, useEffect, useRef, useCallback } from "react";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";
import { useNavigate } from "react-router-dom";

const exercises = [
  {
    id:"home-row", title:"Home Row Drill", subtitle:"ो े ् ि ु | प र क त", icon:"🏠",
    difficulty:"Beginner", duration:2, color:"#22c55e",
    desc:"केवल home row keys को type करें। हिंदी typing की नींव यहीं से शुरू होती है।",
    instruction:"सिर्फ home row keys — नीचे मत देखें! F और J पर उभरी पट्टी है।",
    passages:[
      "पर कर तर रक पक तक रप कत पर तक रक कप तर पर कर तप रक पत कर तर रप कत पर कर",
      "रहा पहल तरह कहर पकड़ रहत पहर कहल तरप रकत पहड़ कहर रहत पहल तरह कहर रहा पहल",
      "पकड़ रहना कहना तरना पकड़ रहना कहना तरना पकड़ रहना कहना तरना पकड़ रहना कहना",
    ],
  },
  {
    id:"matra-drill", title:"मात्रा Drill", subtitle:"ा ि ी ु ू े ै ो ौ", icon:"ा",
    difficulty:"Beginner", duration:3, color:"var(--hinb)",
    desc:"नौ मात्राओं को बार-बार type करें। हिंदी text का 40% इन्हीं से बनता है।",
    instruction:"हर मात्रा को ध्यान से type करें। ये सबसे ज़रूरी keys हैं।",
    passages:[
      "राम की माता काम पर जाती है। नीति बड़ी सुंदर लड़की है। मीरा दूध पीती है। काली गाय घास खाती है।",
      "सीता की माँ खाना बनाती है। पानी पीना ज़रूरी है। रानी बाज़ार जाती है। दादी की कहानी सुनाई देती है।",
      "भारत की राजधानी नई दिल्ली है। यहाँ की जनता मेहनती है। देश की तरक्की हमारी ज़िम्मेदारी है।",
    ],
  },
  {
    id:"halant", title:"Halant Practice", subtitle:"क् त् स् न् ल् र्", icon:"्",
    difficulty:"Intermediate", duration:3, color:"#9c27b0",
    desc:"D key (हलन्त) के साथ consonant combinations — हिंदी typing की सबसे बड़ी challenge।",
    instruction:"हलन्त (्) धीरे-धीरे type करें। D key याद रखें। accuracy पर focus।",
    passages:[
      "स्कूल में पढ़ाई होती है। राष्ट्र की सेवा करना हमारा कर्तव्य है। संस्कृति हमारी पहचान है।",
      "विद्यार्थी को परिश्रम करना चाहिए। स्वास्थ्य ही सबसे बड़ा धन है। शिक्षा से सफलता मिलती है।",
      "कार्यालय में काम करना अच्छा लगता है। सरकारी नौकरी पाना हमारा लक्ष्य है। परीक्षा में सफल होना ज़रूरी है।",
    ],
  },
  {
    id:"common-words", title:"Common Words", subtitle:"और में है का की", icon:"📝",
    difficulty:"Intermediate", duration:4, color:"var(--f)",
    desc:"हिंदी के 100 सबसे common words को repeat करें। Pure muscle memory building।",
    instruction:"ये words हिंदी text का 50% हैं। इन्हें fluently type करना सीखें।",
    passages:[
      "और में है का की को से एक इस पर भी कि हम तो यह था हो जो अब वह कर रहा था जा रही है",
      "आज कल यहाँ वहाँ कैसे क्यों कब कहाँ कोई सब कुछ बहुत अच्छा बुरा नया पुराना बड़ा छोटा",
      "भारत देश लोग काम समय साल घर परिवार स्कूल पानी खाना जीवन शिक्षा सरकार नौकरी परीक्षा",
    ],
  },
  {
    id:"full-sentence", title:"Full Sentences", subtitle:"Complete sentences", icon:"📖",
    difficulty:"Intermediate", duration:5, color:"#0288d1",
    desc:"पूरे वाक्य type करें — मात्राएं, हलन्त, पूर्ण विराम सब साथ।",
    instruction:"पूरा वाक्य ध्यान से पढ़ें पहले, फिर type करें। Accuracy first।",
    passages:[
      "भारत एक महान देश है। यहाँ की संस्कृति और सभ्यता बहुत पुरानी है। हमारे देश में अनेक भाषाएँ बोली जाती हैं।",
      "शिक्षा का महत्व बहुत अधिक है। एक शिक्षित व्यक्ति अपने और समाज के विकास में योगदान देता है।",
      "सरकारी नौकरी पाने के लिए कठिन परिश्रम करना पड़ता है। SSC और Railway की परीक्षाओं में लाखों विद्यार्थी भाग लेते हैं।",
    ],
  },
  {
    id:"ssc-speed", title:"SSC Speed Drill", subtitle:"Full Hindi paragraphs", icon:"🏆",
    difficulty:"Advanced", duration:5, color:"var(--fb)",
    desc:"Real SSC Hindi passage को maximum comfortable speed पर copy करें। कोई गलती नहीं।",
    instruction:"SSC exam format। अपनी सबसे comfortable speed पर accurate type करें।",
    passages:[
      "भारत सरकार ने देश के विकास के लिए अनेक महत्वपूर्ण कदम उठाए हैं। सड़कों रेलवे और हवाई मार्गों का विकास किया गया है ताकि दूरदराज के क्षेत्रों को प्रमुख शहरों से जोड़ा जा सके।",
      "शिक्षा किसी भी राष्ट्र के विकास में महत्वपूर्ण भूमिका निभाती है। सरकार ने साक्षरता को बढ़ावा देने के लिए अनेक योजनाएं शुरू की हैं जिनसे ग्रामीण क्षेत्रों के बच्चों को लाभ मिला है।",
      "कृषि भारतीय अर्थव्यवस्था की रीढ़ है। जनसंख्या का एक बड़ा हिस्सा अपनी आजीविका के लिए खेती पर निर्भर है। सरकार किसानों को आधुनिक तकनीकों से जोड़ने का प्रयास कर रही है।",
    ],
  },
];

const diffColor = { Beginner:"#22c55e", Intermediate:"var(--hinb)", Advanced:"#ef4444" };

function calcWPM(correct, secs) { return secs<1?0:Math.round((correct/4.5)/(secs/60)); }
function calcAcc(correct, total) { return total===0?100:Math.round((correct/total)*100); }

/* ─── TYPING ENGINE ─────────────────────────────────────────────── */
function TypingEngine({ exercise, layout, onDone }) {
  const totalSecs = exercise.duration * 60;
  const [passage]             = useState(()=>exercise.passages[Math.floor(Math.random()*exercise.passages.length)]);
  const [input, setInput]     = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [done, setDone]       = useState(false);
  const [result, setResult]   = useState(null);
  const [liveWPM, setLiveWPM] = useState(0);
  const [liveAcc, setLiveAcc] = useState(100);
  const [liveErr, setLiveErr] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const t0       = useRef(null);

  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(),80); },[]);

  useEffect(()=>{ if(timeLeft===0&&started&&!done) finish(); },[timeLeft]);

  useEffect(()=>{
    if(!started||done) return;
    const elapsed=(Date.now()-t0.current)/1000;
    let ok=0,err=0;
    for(let i=0;i<input.length;i++) input[i]===passage[i]?ok++:err++;
    setLiveWPM(calcWPM(ok,Math.max(elapsed,1)));
    setLiveAcc(calcAcc(ok,input.length));
    setLiveErr(err);
  },[input]);

  const finish = useCallback(()=>{
    clearInterval(timerRef.current);
    const elapsed=t0.current?(Date.now()-t0.current)/1000:1;
    const inp=inputRef.current?.value||"";
    let ok=0,err=0;
    for(let i=0;i<inp.length;i++) inp[i]===passage[i]?ok++:err++;
    const r={wpm:calcWPM(ok,elapsed),acc:calcAcc(ok,inp.length),err,ok};
    setResult(r); setDone(true);
    onDone&&onDone(r);
  },[passage,onDone]);

  const handleInput=(e)=>{
    if(done) return;
    const val=e.target.value;
    if(val.length>passage.length) return;
    if(!started&&val.length>0){
      setStarted(true);
      t0.current=Date.now();
      timerRef.current=setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(timerRef.current);return 0;}return p-1;}),1000);
    }
    setInput(val);
    if(val.length===passage.length) finish();
  };

  const retry=()=>{
    clearInterval(timerRef.current);
    setInput("");setStarted(false);setTimeLeft(totalSecs);setDone(false);setResult(null);
    setLiveWPM(0);setLiveAcc(100);setLiveErr(0);t0.current=null;
    setTimeout(()=>inputRef.current?.focus(),80);
  };

  const mm=String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss=String(timeLeft%60).padStart(2,"0");
  const timerColor=!started?"var(--g4)":timeLeft>totalSecs*0.5?"#22c55e":timeLeft>totalSecs*0.25?"var(--hinb)":"#ef4444";
  const pct=(timeLeft/totalSecs)*100;
  const progress=passage.length?Math.round((input.length/passage.length)*100):0;

  const renderPassage=()=>passage.split("").map((char,i)=>{
    let color="var(--g4)",bg="transparent",ul=false;
    if(i<input.length){if(input[i]===char)color="#22c55e";else{color="#fff";bg="rgba(239,68,68,0.3)";}}
    else if(i===input.length){ul=true;color="#fff";}
    return <span key={i} style={{color,background:bg,borderBottom:ul?`2px solid ${exercise.color}`:"none",borderRadius:2,fontSize:"1.05rem",lineHeight:2,transition:"color 0.05s"}}>{char}</span>;
  });

  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>

      {/* live stats */}
      <div style={{display:"flex",gap:0,border:"1px solid var(--g6)",borderRadius:12,overflow:"hidden"}}>
        {[
          {val:started?liveWPM:0,   unit:"WPM",lbl:"गति",      color:exercise.color},
          {val:started?liveAcc:100, unit:"%",  lbl:"सटीकता",  color:"#22c55e"},
          {val:started?liveErr:0,   unit:"",   lbl:"गलतियाँ", color:liveErr>5?"#ef4444":"var(--hinb)"},
          {val:`${progress}%`,      unit:"",   lbl:"पूरा",    color:"#4db6f7"},
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
            {!started?"⌨ टाइप करें — timer शुरू होगा":done?"✓ Exercise पूरी!":"Timer चल रहा है..."}
          </div>
          <div style={{fontSize:"0.64rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)",marginTop:2}}>
            {exercise.duration} Min · {exercise.difficulty} · {layout==="kruti"?"Kruti Dev":"Mangal"}
          </div>
        </div>
        {started&&!done&&(
          <button onClick={finish} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",borderRadius:50,padding:"6px 14px",fontFamily:"'Outfit',sans-serif",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            समाप्त करें
          </button>
        )}
      </div>

      {/* layout reminder */}
      <div style={{background:"rgba(255,111,0,0.07)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:9,padding:"8px 12px",fontSize:"0.72rem",color:"var(--hinb)",display:"flex",alignItems:"center",gap:7}}>
        ⌨ सुनिश्चित करें: System <strong style={{marginLeft:3}}>{layout==="kruti"?"Kruti Dev":"Mangal / Inscript"}</strong> पर set है
      </div>

      {/* passage */}
      <div style={{background:"var(--g8)",border:`1.5px solid ${started&&!done?exercise.color+"44":"var(--g6)"}`,borderRadius:13,padding:"16px 16px",transition:"border-color 0.3s"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.6rem",letterSpacing:"2px",color:exercise.color+"77",marginBottom:7,textTransform:"uppercase"}}>यह type करें ↓</div>
        <div style={{lineHeight:2,wordBreak:"break-all",userSelect:"none"}}>{renderPassage()}</div>
      </div>

      {/* progress */}
      {started&&!done&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)"}}>प्रगति</span>
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
          placeholder="यहाँ type करें — पहले keystroke पर timer शुरू होगा..."
          style={{width:"100%",background:"var(--g75)",border:`1.5px solid ${started?"var(--g6)":"rgba(255,167,38,0.22)"}`,borderRadius:11,padding:"13px 15px",fontSize:"1.05rem",color:"#fff",outline:"none",resize:"none",lineHeight:1.8,transition:"border-color 0.2s",fontFamily:"inherit"}}
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
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:2,color:result.acc>=95?"#22c55e":"var(--hinb)"}}>{result.acc>=95?"शानदार!":"कोशिश जारी रखें!"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[{val:result.wpm,unit:"WPM",lbl:"गति",color:exercise.color},{val:`${result.acc}%`,unit:"",lbl:"सटीकता",color:result.acc>=95?"#22c55e":"var(--hinb)"},{val:result.err,unit:"",lbl:"गलतियाँ",color:result.err===0?"#22c55e":result.err<5?"var(--hinb)":"#ef4444"}].map((s,i)=>(
              <div key={i} style={{background:"var(--g7)",borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.8rem",letterSpacing:1.5,color:s.color,lineHeight:1}}>{s.val}<span style={{fontSize:"0.8rem",opacity:0.7}}>{s.unit}</span></div>
                <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"var(--g4)",marginTop:3}}>{s.lbl}</div>
              </div>
            ))}
          </div>
          {/* SSC cutoff */}
          <div style={{background:"rgba(255,111,0,0.07)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:9,padding:"8px 12px",marginBottom:12,fontSize:"0.74rem",color:"var(--hinb)",lineHeight:1.5}}>
            SSC Hindi cut-off: 30 WPM · {result.wpm>=30?"✓ Cut-off पार!":"अभी "+( 30-result.wpm)+" WPM और चाहिए"}
          </div>
          <div style={{fontSize:"0.73rem",color:result.acc>=95?"#22c55e":"var(--hinb)",background:result.acc>=95?"rgba(34,197,94,0.08)":"rgba(255,167,38,0.08)",border:`1px solid ${result.acc>=95?"rgba(34,197,94,0.2)":"rgba(255,167,38,0.2)"}`,borderRadius:9,padding:"9px 13px",marginBottom:14,lineHeight:1.5}}>
            {result.acc>=95?"✓ बहुत अच्छे! अगली exercise के लिए ready हैं।":"⚠ 95%+ accuracy के लिए practice करें। धीरे और सटीक type करें।"}
          </div>
          <button onClick={retry} style={{width:"100%",height:40,background:"rgba(255,255,255,0.05)",color:"var(--g2)",border:"1px solid var(--g6)",borderRadius:9,fontFamily:"'Outfit',sans-serif",fontSize:"0.86rem",fontWeight:600,cursor:"pointer"}}>
            🔄 फिर से करें
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function HindiExercises({ onBack }) {
  const [active, setActive]       = useState(null);
  const [theme, setTheme] = usePqTheme();
  const [completed, setCompleted] = useState([]);
  const [layout, setLayout]       = useState("kruti");

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

        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:var(--hin)44;border-radius:3px}
        .page{min-height:100vh;background:var(--g9);padding-bottom:60px;
          background-image:radial-gradient(ellipse 60% 35% at 50% 0%,rgba(255,111,0,0.07) 0%,transparent 55%),
            linear-gradient(rgba(255,111,0,0.015) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,111,0,0.015) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 5%;align-items:start;}
        @media(max-width:800px){.grid{grid-template-columns:1fr!important;}}
        .ls-btn{padding:8px 20px;background:var(--g8);border:none;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.2s;border-right:1px solid var(--g6);}
        .ls-btn:last-child{border-right:none;}
        .ls-btn.on{background:rgba(255,111,0,0.12);color:var(--hinb);}
      `}</style>

      <div className="page" data-pqtheme={theme}>

        {/* HEADER */}
        <div style={{padding:"40px 5% 24px",animation:"fadeUp 0.5s ease both"}}>
          <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"var(--g4)",fontFamily:"'Outfit',sans-serif",fontSize:"0.8rem",fontWeight:600,padding:0,marginBottom:18,transition:"color 0.18s"}}
            onMouseEnter={e=>e.target.style.color="var(--hinb)"} onMouseLeave={e=>e.target.style.color="var(--g4)"}>
            ← वापस जाएं
          </button>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,111,0,0.1)",border:"1px solid rgba(255,111,0,0.25)",borderRadius:50,padding:"5px 16px",marginBottom:14,fontSize:"0.68rem",fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",color:"var(--hinb)"}}>
            💪 हिंदी Exercises
          </div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.2rem,5vw,3.8rem)",letterSpacing:3,color:"#fff",lineHeight:1,marginBottom:8}}>
            Typing Exercises
          </h1>
          <p style={{fontSize:"0.84rem",color:"var(--g4)",lineHeight:1.7,maxWidth:480,marginBottom:18}}>
            <strong style={{color:"#fff"}}>No countdown</strong> — exercise click करें, type करना शुरू करें, timer automatically शुरू हो जाएगा।
          </p>

          {/* layout switcher */}
          <div style={{display:"flex",gap:0,border:"1px solid var(--g6)",borderRadius:11,overflow:"hidden",width:"fit-content"}}>
            <button className={`ls-btn${layout==="kruti"?" on":""}`} onClick={()=>setLayout("kruti")}>🔤 Kruti Dev</button>
            <button className={`ls-btn${layout==="mangal"?" on":""}`} onClick={()=>setLayout("mangal")}>🔠 Mangal</button>
          </div>
        </div>

        {/* PROGRESS */}
        <div style={{padding:"0 5%",marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:"0.64rem",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--g4)"}}>Overall Progress</span>
            <span style={{fontSize:"0.7rem",fontWeight:700,color:"var(--hinb)"}}>{completed.length}/{exercises.length}</span>
          </div>
          <div style={{height:5,background:"var(--g7)",borderRadius:50,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(completed.length/exercises.length)*100}%`,background:"linear-gradient(90deg,var(--hind),var(--hinb))",borderRadius:50,transition:"width 0.4s"}}/>
          </div>
        </div>

        {/* HINT */}
        <div style={{margin:"0 5% 18px",background:"rgba(255,111,0,0.05)",border:"1px solid rgba(255,111,0,0.14)",borderRadius:11,padding:"11px 15px",fontSize:"0.76rem",color:"var(--g3)",lineHeight:1.6}}>
          ⌨ कोई भी exercise click करें → type करें → timer first keystroke पर शुरू होगा। <strong style={{color:"var(--hinb)"}}>95%+ accuracy</strong> हो तो आगे बढ़ें।
        </div>

        {/* GRID */}
        <div className="grid">

          {/* exercise list */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {exercises.map((ex,i)=>{
              const isActive=active?.id===ex.id;
              const isDone=completed.includes(ex.id);
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
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"3px 0 0 3px",background:isActive?ex.color:isDone?"#22c55e":"var(--g6)"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:11,background:ex.color+"18",border:`1px solid ${ex.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>
                      {isDone?"✓":ex.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:1.5,color:isActive?ex.color:"#fff"}}>{ex.title}</span>
                        {isDone&&<span style={{fontSize:"0.55rem",fontWeight:800,letterSpacing:"1.5px",textTransform:"uppercase",color:"#22c55e",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:50,padding:"2px 7px"}}>पूरा</span>}
                      </div>
                      <div style={{fontSize:"0.7rem",color:"var(--g4)",marginTop:2}}>{ex.subtitle}</div>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.88rem",letterSpacing:1,color:isActive?ex.color:"var(--g4)",flexShrink:0}}>{ex.duration}m</div>
                  </div>
                  <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}}>
                    <span style={{background:diffColor[ex.difficulty]+"18",color:diffColor[ex.difficulty],border:`1px solid ${diffColor[ex.difficulty]}33`,borderRadius:50,padding:"2px 9px",fontSize:"0.58rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>{ex.difficulty}</span>
                    <span style={{background:"rgba(255,255,255,0.04)",color:"var(--g3)",border:"1px solid var(--g6)",borderRadius:50,padding:"2px 9px",fontSize:"0.58rem",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>⏱ {ex.duration} min</span>
                  </div>
                  {isActive&&<p style={{fontSize:"0.74rem",color:"var(--g3)",marginTop:10,lineHeight:1.6,paddingTop:10,borderTop:"1px solid var(--g7)"}}>{ex.desc}</p>}
                </div>
              );
            })}
          </div>

          {/* typing panel */}
          {active?(
            <div style={{background:"var(--g8)",border:`1.5px solid ${active.color}33`,borderRadius:18,padding:"20px 18px",position:"sticky",top:16}}>
              <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--g7)"}}>
                <div style={{width:38,height:38,borderRadius:10,background:active.color+"18",border:`1px solid ${active.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>{active.icon}</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.1rem",letterSpacing:2,color:"#fff",lineHeight:1}}>{active.title}</div>
                  <div style={{fontSize:"0.68rem",color:"var(--g4)",marginTop:3}}>{active.instruction}</div>
                </div>
              </div>
              <TypingEngine
                key={`${active.id}-${layout}`}
                exercise={active}
                layout={layout}
                onDone={(r)=>{ if(r.acc>=95) setCompleted(p=>p.includes(active.id)?p:[...p,active.id]); }}
              />
            </div>
          ):(
            <div style={{textAlign:"center",padding:"48px 20px",color:"var(--g4)",fontSize:"0.82rem",lineHeight:1.7,background:"var(--g8)",border:"1px solid var(--g7)",borderRadius:18}}>
              <div style={{fontSize:"2.5rem",marginBottom:12}}>👆</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.3rem",letterSpacing:2,color:"#fff",marginBottom:8}}>Exercise चुनें</div>
              बाईं तरफ कोई exercise click करें।<br/>
              <span style={{fontSize:"0.7rem",color:"var(--g6)"}}>Timer पहले keystroke पर शुरू होगा — कोई countdown नहीं।</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}