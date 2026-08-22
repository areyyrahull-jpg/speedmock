import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";

/* ─── HINDI KEYBOARD DATA ────────────────────────────────────────── */
const krutiMap = [
  { key:"Q", hindi:"ौ" }, { key:"W", hindi:"ै" }, { key:"E", hindi:"ा" }, { key:"R", hindi:"ी" },
  { key:"T", hindi:"ू" }, { key:"Y", hindi:"ब" }, { key:"U", hindi:"ह" }, { key:"I", hindi:"ग" },
  { key:"O", hindi:"द" }, { key:"P", hindi:"ज" }, { key:"A", hindi:"ो" }, { key:"S", hindi:"े" },
  { key:"D", hindi:"्" }, { key:"F", hindi:"ि" }, { key:"G", hindi:"ु" }, { key:"H", hindi:"प" },
  { key:"J", hindi:"र" }, { key:"K", hindi:"क" }, { key:"L", hindi:"त" }, { key:";", hindi:"च" },
  { key:"Z", hindi:"." }, { key:"X", hindi:"थ" }, { key:"C", hindi:"म" }, { key:"V", hindi:"न" },
  { key:"B", hindi:"व" }, { key:"N", hindi:"ल" }, { key:"M", hindi:"स" }, { key:",", hindi:"," },
];

const rows = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L",";"],
  ["Z","X","C","V","B","N","M",",",".","/"],
];

const fingerMap = {
  Q:0,A:0,Z:0, W:1,S:1,X:1, E:2,D:2,C:2,
  R:3,F:3,V:3,T:3,G:3, Y:4,H:4,B:4,U:4,J:4,N:4,M:4,
  I:5,K:5,",":5, O:6,L:6,".":6, P:7,";":7,"/":7,
};
const fingerColors = ["#e91e8c","#c2185b","#9c27b0","#7b1fa2","#0288d1","#0277bd","#01579b","#003c6e"];

const krutiHindiMap = Object.fromEntries(krutiMap.map(({key,hindi})=>[key,hindi]));

const proTips = [
  { icon:"🏠", title:"मात्रा पहले सीखें",   body:"स्वर मात्राओं (ा, ि, ी, ु, ू, े, ै) को पहले याद करें। ये सबसे ज़्यादा use होते हैं।" },
  { icon:"👁️", title:"Screen देखें",         body:"Keyboard की तरफ मत देखें। हिंदी में भी muscle memory बनती है — बस practice चाहिए।" },
  { icon:"🎯", title:"Accuracy पहले",        body:"गलत type करने से अच्छा है धीरे-धीरे सही type करें। Speed बाद में आती है।" },
  { icon:"⚡", title:"Rhythm बनाएं",         body:"एक steady pace से type करें। रुक-रुककर type करने से WPM कम होता है।" },
  { icon:"🔤", title:"Halant सीखें",         body:"'्' (Halant/D key in Kruti Dev) का सही use हिंदी typing की सबसे बड़ी challenge है।" },
  { icon:"📈", title:"रोज़ 15 मिनट",        body:"Daily 15 min की practice किसी भी long session से ज़्यादा effective है।" },
];

/* ─── HINDI KEYBOARD MODAL ───────────────────────────────────────── */
function HindiFingerModal({ layout, onClose }) {
  const [hovered, setHovered] = useState(null);
  const fingerLabels = [
    { name:"Left Pinky",  keys:"Q A Z", color:"#e91e8c" },
    { name:"Left Ring",   keys:"W S X", color:"#c2185b" },
    { name:"Left Middle", keys:"E D C", color:"#9c27b0" },
    { name:"Left Index",  keys:"R F V T G", color:"#7b1fa2" },
    { name:"Right Index", keys:"Y H B U J N M", color:"#0288d1" },
    { name:"Right Middle",keys:"I K ,", color:"#0277bd" },
    { name:"Right Ring",  keys:"O L .", color:"#01579b" },
    { name:"Right Pinky", keys:"P ; /", color:"#003c6e" },
  ];
  const activeKeys = hovered !== null ? fingerLabels[hovered].keys.split(" ") : [];

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(6,6,10,0.94)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{position:"relative",background:"#18181f",border:"1px solid rgba(233,30,140,0.2)",borderRadius:22,width:"100%",maxWidth:780,padding:"32px 28px",animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:2,background:"linear-gradient(90deg,transparent,#ff3aaa,#b5005f,transparent)",borderRadius:2}}/>
        <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"rgba(255,255,255,0.05)",border:"1px solid #32323f",color:"#9a9ab0",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:"1rem",fontWeight:700}}>✕</button>

        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.9rem",letterSpacing:3,color:"#fff",marginBottom:4}}>
          Hindi Finger Placement — {layout === "kruti" ? "Kruti Dev" : "Mangal"}
        </div>
        <p style={{fontSize:"0.8rem",color:"#7a7a90",marginBottom:20,lineHeight:1.6}}>
          Hover a finger zone to highlight its keys. Each key shows its Hindi character for <strong style={{color:"#ff3aaa"}}>{layout === "kruti" ? "Kruti Dev" : "Mangal / Inscript"}</strong> layout.
        </p>

        {/* keyboard showing hindi chars */}
        <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center",marginBottom:20}}>
          {rows.map((row,ri)=>(
            <div key={ri} style={{display:"flex",gap:4,marginLeft:ri===1?"10px":ri===2?"20px":"0"}}>
              {row.map(k=>{
                const fi = fingerMap[k]??0;
                const col = fingerColors[fi];
                const isActive = activeKeys.includes(k);
                const hindiChar = layout==="kruti" ? krutiHindiMap[k]||k : k;
                return (
                  <div key={k} style={{width:44,height:44,borderRadius:8,background:isActive?col:col+"22",border:`1.5px solid ${isActive?col:col+"55"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,boxShadow:isActive?`0 0 12px ${col}`:"none",transform:isActive?"translateY(-3px)":"none",transition:"all 0.15s",cursor:"default"}}>
                    <span style={{fontSize:"0.55rem",fontWeight:700,color:isActive?"rgba(255,255,255,0.6)":col+"99",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"0.5px"}}>{k}</span>
                    <span style={{fontSize:"0.72rem",color:isActive?"#fff":col,fontWeight:700}}>{hindiChar}</span>
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{width:210,height:28,borderRadius:7,background:"rgba(233,30,140,0.08)",border:"1px solid rgba(233,30,140,0.2)",marginTop:3,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"#7a7a90"}}>SPACE — Both Thumbs</span>
          </div>
        </div>

        {/* finger legend */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:8,marginBottom:24}}>
          {fingerLabels.map((f,i)=>(
            <div key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
              style={{background:hovered===i?f.color+"18":"rgba(255,255,255,0.03)",border:`1px solid ${hovered===i?f.color+"55":"#32323f"}`,borderRadius:10,padding:"10px 12px",cursor:"default",transition:"all 0.18s"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <span style={{width:9,height:9,borderRadius:"50%",background:f.color,boxShadow:`0 0 5px ${f.color}`,flexShrink:0}}/>
                <span style={{fontSize:"0.67rem",fontWeight:800,letterSpacing:"1px",textTransform:"uppercase",color:hovered===i?f.color:"#9a9ab0"}}>{f.name}</span>
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {f.keys.split(" ").map(k=>(
                  <span key={k} style={{background:f.color+"22",border:`1px solid ${f.color}44`,borderRadius:4,padding:"1px 6px",fontSize:"0.7rem",fontWeight:700,color:f.color,fontFamily:"'Bebas Neue',sans-serif"}}>
                    {k}{layout==="kruti"&&krutiHindiMap[k]?` ${krutiHindiMap[k]}`:""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* pro tips */}
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:2,color:"#fff",marginBottom:12}}>Hindi Typing Tips</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
          {proTips.map((t,i)=>(
            <div key={i} style={{background:"rgba(233,30,140,0.04)",border:"1px solid rgba(233,30,140,0.12)",borderRadius:12,padding:"13px 14px"}}>
              <div style={{fontSize:"1.3rem",marginBottom:7}}>{t.icon}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.95rem",letterSpacing:"1.5px",color:"#fff",marginBottom:5}}>{t.title}</div>
              <div style={{fontSize:"0.73rem",color:"#7a7a90",lineHeight:1.55}}>{t.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function HindiTyping({}) {
  const navigate = useNavigate();
  const [theme, setTheme] = usePqTheme();
  const [layout, setLayout] = useState("kruti"); // "kruti" | "mangal"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --f:#e91e8c;--fb:#ff3aaa;--fd:#b5005f;
          --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;
          --g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
          --hin:#ff6f00;--hinb:#ffa726;--hind:#e65100;
        }
        /* ── Theme palette overrides (scoped to data-pqtheme) ── */
        [data-pqtheme="light"]{
          --g9:#f4f4f7;--g8:#ffffff;--g75:#eeeef3;
          --g7:#e8e8ef;--g6:#d8d8e4;--g4:#6b6b80;--g3:#5a5a70;--g2:#2a2a3a;--w:#1a1a2e;
          --f:#c026d3;--fb:#d946ef;--fd:#9c1abf;--hin:#b45309;--hinb:#d97706;--hind:#92400e;
        }
        [data-pqtheme="yellow"]{
          --g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;
          --g7:#ddd0a8;--g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#3a2e1f;--w:#3a2e1f;
          --f:#b45309;--fb:#d97706;--fd:#92400e;--hin:#b45309;--hinb:#d97706;--hind:#92400e;
        }
        [data-pqtheme="light"] .page,[data-pqtheme="light"] body{background:var(--g9)!important}
        [data-pqtheme="yellow"] .page,[data-pqtheme="yellow"] body{background:var(--g9)!important}
        .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px}
        .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
        .pq-theme-btn:hover{opacity:.85}
        .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.1);box-shadow:0 0 0 1px var(--g6)}

        body{background:var(--g9);font-family:'Outfit',sans-serif;}
        @keyframes popIn{from{opacity:0;transform:scale(0.9) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#18181f}::-webkit-scrollbar-thumb{background:#ff6f0044;border-radius:3px}

        .page{min-height:100vh;background:var(--g9);position:relative;overflow-x:hidden;padding-bottom:60px;
          background-image:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(255,111,0,0.08) 0%,transparent 60%),
            linear-gradient(rgba(255,111,0,0.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,111,0,0.018) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;
        }

        /* HEADER */
        .hdr{padding:44px 5% 0;position:relative;z-index:1;animation:fadeUp 0.5s ease both;}
        .hdr-back{display:inline-flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;margin-bottom:20px;transition:color 0.18s;}
        .hdr-back:hover{color:var(--hinb);}
        .hdr-lang-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,111,0,0.1);border:1px solid rgba(255,111,0,0.3);border-radius:50px;padding:5px 16px;margin-bottom:16px;}
        .hdr-lang-dot{width:6px;height:6px;border-radius:50%;background:var(--hinb);box-shadow:0 0 7px var(--hinb);animation:float 2s ease-in-out infinite;}
        .hdr-lang-text{font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--hinb);}
        .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,6vw,4.5rem);letter-spacing:3px;color:var(--w);line-height:1;margin-bottom:10px;}
        .hdr-title em{font-style:normal;background:linear-gradient(270deg,var(--hinb),#ffcc80,var(--hind),var(--hinb));background-size:400%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite;}
        .hdr-sub{font-size:0.88rem;color:var(--g4);line-height:1.7;max-width:500px;margin-bottom:24px;}
        .hdr-sub strong{color:var(--g2);}

        /* LAYOUT SWITCHER */
        .layout-switch{display:flex;gap:0;border:1px solid var(--g6);border-radius:12px;overflow:hidden;margin-bottom:28px;width:fit-content;}
        .ls-btn{padding:10px 24px;background:var(--g8);border:none;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.84rem;font-weight:700;cursor:pointer;transition:all 0.2s;border-right:1px solid var(--g6);}
        .ls-btn:last-child{border-right:none;}
        .ls-btn--active{background:rgba(255,111,0,0.12);color:var(--hinb);}
        .ls-btn:hover:not(.ls-btn--active){color:var(--g2);}

        /* STATS */
        .stats{display:flex;gap:0;border:1px solid var(--g6);border-radius:13px;overflow:hidden;margin-bottom:44px;}
        .stat-item{flex:1;padding:14px 10px;text-align:center;border-right:1px solid var(--g6);background:var(--g8);transition:background 0.2s;}
        .stat-item:last-child{border-right:none;}
        .stat-item:hover{background:rgba(255,111,0,0.05);}
        .stat-v{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:1.5px;background:linear-gradient(135deg,var(--hinb),#ffe0b2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .stat-l{font-size:0.6rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g4);margin-top:2px;}

        /* CARDS */
        .cards-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 5%;margin-bottom:20px;}
        @media(max-width:680px){.cards-grid{grid-template-columns:1fr;}}
        .tips-wrap{padding:0 5%;}

        .card{position:relative;border-radius:22px;overflow:hidden;padding:28px 26px 24px;cursor:pointer;transition:transform 0.28s ease,box-shadow 0.28s ease,border-color 0.28s ease;}
        .card:hover{transform:translateY(-6px);}
        .card-topbar{position:absolute;top:0;left:0;right:0;height:3px;opacity:0;transition:opacity 0.25s;}
        .card:hover .card-topbar{opacity:1;}
        .card-glow{position:absolute;width:300px;height:300px;border-radius:50%;pointer-events:none;top:-80px;right:-80px;}

        /* Practice */
        .card--practice{background:linear-gradient(145deg,var(--g8),var(--g75),var(--g8));border:1.5px solid rgba(255,111,0,0.2);box-shadow:0 6px 28px rgba(255,111,0,0.08);}
        .card--practice:hover{box-shadow:0 16px 48px rgba(255,111,0,0.22);border-color:rgba(255,111,0,0.5);}
        .topbar--practice{background:linear-gradient(90deg,var(--hind),var(--hinb));}
        .glow--practice{background:radial-gradient(circle,rgba(255,111,0,0.14) 0%,transparent 68%);}

        /* Test */
        .card--test{background:linear-gradient(145deg,var(--g8),var(--g75),var(--g8));border:1.5px solid rgba(2,136,209,0.2);box-shadow:0 6px 28px rgba(2,136,209,0.08);}
        .card--test:hover{box-shadow:0 16px 48px rgba(2,136,209,0.22);border-color:rgba(2,136,209,0.5);}
        .topbar--test{background:linear-gradient(90deg,#003c6e,#0288d1);}
        .glow--test{background:radial-gradient(circle,rgba(2,136,209,0.14) 0%,transparent 68%);}

        /* Tips */
        .card--tips{background:linear-gradient(145deg,#0e0d1a,#121020,#0a0c18);border:1.5px solid rgba(123,31,162,0.2);box-shadow:0 6px 28px rgba(123,31,162,0.08);}
        .card--tips:hover{box-shadow:0 16px 48px rgba(123,31,162,0.22);border-color:rgba(123,31,162,0.5);}
        .topbar--tips{background:linear-gradient(90deg,#4a148c,#7b1fa2,#ce93d8);}
        .glow--tips{background:radial-gradient(circle,rgba(123,31,162,0.14) 0%,transparent 68%);}

        .card-icon-wrap{margin-bottom:18px;position:relative;z-index:1;}
        .card-icon-box{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.9rem;animation:float 4s ease-in-out infinite;}
        .icon-box--practice{background:rgba(255,111,0,0.12);border:1px solid rgba(255,111,0,0.28);}
        .icon-box--test{background:rgba(2,136,209,0.12);border:1px solid rgba(2,136,209,0.28);}
        .icon-box--tips{background:rgba(123,31,162,0.12);border:1px solid rgba(123,31,162,0.28);}

        .card-badge{display:inline-block;border-radius:50px;padding:3px 12px;font-size:0.6rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;position:relative;z-index:1;}
        .badge--practice{background:rgba(255,111,0,0.12);color:var(--hinb);border:1px solid rgba(255,111,0,0.28);}
        .badge--test{background:rgba(2,136,209,0.12);color:#4db6f7;border:1px solid rgba(2,136,209,0.28);}
        .badge--tips{background:rgba(123,31,162,0.12);color:#ce93d8;border:1px solid rgba(123,31,162,0.28);}

        .card-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:2px;color:var(--w);line-height:1;position:relative;z-index:1;margin-bottom:8px;}
        .card-desc{font-size:0.82rem;color:var(--g4);line-height:1.7;position:relative;z-index:1;margin-bottom:18px;}
        .card-desc strong{color:var(--g2);}

        .features{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:20px;position:relative;z-index:1;}
        .feature{display:flex;align-items:flex-start;gap:9px;font-size:0.79rem;color:var(--g2);}
        .feat-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:5px;}
        .feat-dot--practice{background:var(--hinb);box-shadow:0 0 4px var(--hinb);}
        .feat-dot--test{background:#0288d1;box-shadow:0 0 4px #0288d1;}
        .feat-dot--tips{background:#9c27b0;box-shadow:0 0 4px #9c27b0;}

        .dur-label{font-size:0.62rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--g4);margin-bottom:8px;position:relative;z-index:1;}
        .dur-btns{display:flex;gap:8px;margin-bottom:20px;position:relative;z-index:1;}
        .dur-btn{flex:1;padding:9px 0;border-radius:10px;border:1.5px solid var(--g6);background:var(--g75);color:var(--g3);font-family:'Outfit',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.2s;text-align:center;}
        .dur-btn:hover{border-color:var(--hin);color:var(--hinb);}
        .dur-btn--active{background:rgba(255,111,0,0.12);border-color:var(--hin);color:var(--hinb);box-shadow:0 0 12px rgba(255,111,0,0.18);}

        .card-cta{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:50px;padding:11px 26px;font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.22s;position:relative;z-index:1;letter-spacing:0.4px;}
        .cta--practice{background:linear-gradient(135deg,var(--hinb),var(--hind));color:#fff;box-shadow:0 4px 18px rgba(255,111,0,0.35);}
        .cta--practice:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,111,0,0.52);}
        .cta--test{background:linear-gradient(135deg,#29b6f6,#0277bd);color:#fff;box-shadow:0 4px 18px rgba(2,136,209,0.35);}
        .cta--test:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(2,136,209,0.52);}
        .cta--tips{background:linear-gradient(135deg,#9c27b0,#4a148c);color:#fff;box-shadow:0 4px 18px rgba(123,31,162,0.35);}
        .cta--tips:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(123,31,162,0.52);}

        .cursor{display:inline-block;width:2px;height:18px;background:var(--hinb);animation:blink 1s ease-in-out infinite;vertical-align:middle;border-radius:1px;margin-left:3px;}

        .rules-modal{position:fixed;inset:0;z-index:200;background:rgba(6,6,10,0.94);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;}
        .rules-box{position:relative;background:#18181f;border:1px solid rgba(2,136,209,0.22);border-radius:22px;width:100%;max-width:520px;padding:32px 28px;animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;max-height:85vh;overflow-y:auto;}
        .rules-topbar{position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,#ffa726,#e65100,transparent);border-radius:2px;}
        .close-btn{position:absolute;top:14px;right:16px;background:rgba(255,255,255,0.05);border:1px solid #32323f;color:#9a9ab0;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:1rem;font-weight:700;}
        .rule-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #32323f;}
        .rule-item:last-child{border-bottom:none;}
        .rule-num{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:1px;color:var(--hinb);flex-shrink:0;line-height:1;margin-top:1px;}
        .rule-text{font-size:0.82rem;color:var(--g2);line-height:1.6;}
        .rule-text strong{color:#fff;}
      `}</style>

      <div className="page" data-pqtheme={theme}>

        {/* HEADER */}
        <div className="hdr">
          <button className="hdr-back" onClick={() => navigate("/dashboard")}>
            ← Back to dashboard
          </button>
          <PqThemeToggle theme={theme} setTheme={setTheme} />

          <div className="hdr-lang-pill">
            <span className="hdr-lang-dot"/>
            <span className="hdr-lang-text">🇮🇳 Hindi Typing</span>
          </div>

          <h1 className="hdr-title">Hindi <em>Typing</em></h1>
          <p className="hdr-sub">
            Practice in <strong>Kruti Dev or Mangal</strong> layout, give a timed test in real SSC format, and master Hindi finger placement — built for government exam aspirants.
          </p>

          {/* Layout switcher */}
          <div className="layout-switch">
            <button className={`ls-btn${layout==="kruti"?" ls-btn--active":""}`} onClick={()=>setLayout("kruti")}>
              🔤 Kruti Dev
            </button>
            <button className={`ls-btn${layout==="mangal"?" ls-btn--active":""}`} onClick={()=>setLayout("mangal")}>
              🔠 Mangal / Inscript
            </button>
          </div>

          {/* Stats */}
          <div className="stats">
            {[
              {v:"30+ WPM",l:"SSC Cut-off"},
              {v:"150+",l:"Practice Sets"},
              {v:"15 Min",l:"Exam Duration"},
              {v:layout==="kruti"?"Kruti Dev":"Mangal",l:"Current Layout"},
            ].map(s=>(
              <div className="stat-item" key={s.l}>
                <div className="stat-v">{s.v}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CARDS */}
        <div className="cards-grid">

          {/* PRACTICE */}
          <div className="card card--practice">
            <div className="card-topbar topbar--practice"/>
            <div className="card-glow glow--practice"/>
            <div className="card-icon-wrap">
              <div className="card-icon-box icon-box--practice">🖊️</div>
            </div>
            <div className="card-badge badge--practice">Build Your Foundation</div>
            <div className="card-title">Practice</div>
            <p className="card-desc">
              A <strong>lesson-by-lesson course</strong> for {layout==="kruti"?"Kruti Dev":"Mangal / Inscript"} finger placement, plus free timed sessions and a Hindi typing guide — all in one place.
            </p>
            <ul className="features">
              {[
                "Lesson course — one key at a time, finger-by-finger",
                "Colour-coded on-screen keyboard guide",
                "Matra, Halant & finger placement tips built in",
                "Free timed practice, any length",
                "Progress saved after every lesson",
              ].map(f=>(
                <li className="feature" key={f}>
                  <span className="feat-dot feat-dot--practice"/>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="card-cta cta--practice"
              onClick={() => navigate("/hindipractice", { state: { tab: "lessons", layout: layout } })}
            > Start Lesson Course → </button>
          </div>

          {/* TEST */}
          <div className="card card--test">
            <div className="card-topbar topbar--test"/>
            <div className="card-glow glow--test"/>
            <div className="card-icon-wrap">
              <div className="card-icon-box icon-box--test">⏱️</div>
            </div>
            <div className="card-badge badge--test">Exam Simulation</div>
            <div className="card-title">Exam <span className="cursor"/></div>
            <p className="card-desc">
              Full <strong>15-minute timed test</strong> in SSC CHSL / MTS Hindi typing format using <strong>{layout==="kruti"?"Kruti Dev":"Mangal"}</strong>. Strict rules, real scoring.
            </p>
            <ul className="features">
              {[
                "Strict 15-minute countdown timer",
                "No-backspace mode (SSC exam rule)",
                "Hindi passage from actual SSC PYQs",
                "WPM · Accuracy · Error count report",
                "Score vs SSC Hindi typing cut-off",
              ].map(f=>(
                <li className="feature" key={f}>
                  <span className="feat-dot feat-dot--test"/>
                  {f}
                </li>
              ))}
            </ul>
            <button className="card-cta cta--test" onClick={() => navigate("/hinditest", { state: { layout: layout } })}>Enter Exam Section →</button>
          </div>
        </div>

      </div>

    </>
  );
}