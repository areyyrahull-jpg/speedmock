import { useState } from "react";
import {useNavigate}from "react-router-dom";
import { usePqTheme, PqThemeToggle } from "../../services/usePqTheme";

/* ─── MAIN ───────────────────────────────────────────────────────── */
export  function EnglishTyping() {
  const navigate = useNavigate();
  const [theme, setTheme] = usePqTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --f:#e91e8c;--fb:#ff3aaa;--fd:#b5005f;--fmid:#ff88cc;--stat-grad-mid:#ffaadd;
          --g9:#0e0e12;--g8:#18181f;--g75:#1e1e28;
          --g7:#252532;--g6:#32323f;--g4:#7a7a90;--g3:#9a9ab0;--g2:#c8c8d8;--w:#ffffff;
          --cb-p1:#180c14;--cb-p2:#1e0e1a;--cb-p3:#140a10;--cb-p-border:rgba(233,30,140,0.2);--cb-p-shadow:rgba(233,30,140,0.08);--cb-p-shadow-hover:rgba(233,30,140,0.24);--cb-p-border-hover:rgba(233,30,140,0.5);--cb-p-glow:rgba(233,30,140,0.14);--cb-p-icon-bg:rgba(233,30,140,0.12);--cb-p-icon-border:rgba(233,30,140,0.28);--cb-p-badge-bg:rgba(233,30,140,0.12);--cb-p-badge-border:rgba(233,30,140,0.28);
          --cb-t1:#0a1420;--cb-t2:#0d1828;--cb-t3:#080f1a;--cb-t-border:rgba(2,136,209,0.2);--cb-t-shadow:rgba(2,136,209,0.08);--cb-t-shadow-hover:rgba(2,136,209,0.24);--cb-t-border-hover:rgba(2,136,209,0.5);--cb-t-glow:rgba(2,136,209,0.14);--ct-1:#003c6e;--ct-2:#0288d1;--cb-t-icon-bg:rgba(2,136,209,0.12);--cb-t-icon-border:rgba(2,136,209,0.28);--cb-t-badge-bg:rgba(2,136,209,0.12);--cb-t-badge-color:#4db6f7;--cb-t-badge-border:rgba(2,136,209,0.28);--cb-t-dot-color:#0288d1;
          --cb-tp1:#0e0d1a;--cb-tp2:#121020;--cb-tp3:#0a0c18;--cb-tp-border:rgba(123,31,162,0.2);--cb-tp-shadow:rgba(123,31,162,0.08);--cb-tp-shadow-hover:rgba(123,31,162,0.24);--cb-tp-border-hover:rgba(123,31,162,0.5);--cb-tp-glow:rgba(123,31,162,0.14);--ctp-1:#4a148c;--ctp-2:#7b1fa2;--ctp-3:#ce93d8;--cb-tp-icon-bg:rgba(123,31,162,0.12);--cb-tp-icon-border:rgba(123,31,162,0.28);--cb-tp-badge-bg:rgba(123,31,162,0.12);--cb-tp-badge-color:#ce93d8;--cb-tp-badge-border:rgba(123,31,162,0.28);--cb-tp-dot-color:#9c27b0;
          --hdr-pill-bg:rgba(233,30,140,0.08);--hdr-pill-border:rgba(233,30,140,0.25);--stat-hover-bg:rgba(233,30,140,0.05);
          --cta-p-shadow:rgba(233,30,140,0.35);--cta-p-shadow-hover:rgba(233,30,140,0.52);--cta-t1:#29b6f6;--cta-t2:#0277bd;--cta-t-shadow:rgba(2,136,209,0.35);--cta-t-shadow-hover:rgba(2,136,209,0.52);--cta-tp1:#9c27b0;--cta-tp2:#4a148c;--cta-tp-shadow:rgba(123,31,162,0.35);--cta-tp-shadow-hover:rgba(123,31,162,0.52);
          --dur-active-bg:rgba(233,30,140,0.12);--dur-active-shadow:0 0 12px rgba(233,30,140,0.2);
        }
        /* ── Theme palette overrides (scoped to data-pqtheme) ── */
        [data-pqtheme="light"]{
          --g9:#f4f4f7;--g8:#ffffff;--g75:#eeeef3;
          --g7:#e8e8ef;--g6:#d8d8e4;--g4:#6b6b80;--g3:#5a5a70;--g2:#2a2a3a;--w:#1a1a2e;
          --f:#c026d3;--fb:#d946ef;--fd:#9c1abf;--fmid:#e879f3;--stat-grad-mid:#f0b3e1;
          --cb-p1:#f3e5f0;--cb-p2:#f8f0f8;--cb-p3:#ede5f0;--cb-p-border:rgba(192,38,211,0.25);--cb-p-shadow:rgba(192,38,211,0.12);--cb-p-shadow-hover:rgba(192,38,211,0.28);--cb-p-border-hover:rgba(192,38,211,0.55);--cb-p-glow:rgba(192,38,211,0.16);--cb-p-icon-bg:rgba(192,38,211,0.15);--cb-p-icon-border:rgba(192,38,211,0.35);--cb-p-badge-bg:rgba(192,38,211,0.12);--cb-p-badge-border:rgba(192,38,211,0.3);
          --cb-t1:#e3f2fd;--cb-t2:#f1f8ff;--cb-t3:#ecf5ff;--cb-t-border:rgba(3,155,229,0.25);--cb-t-shadow:rgba(3,155,229,0.12);--cb-t-shadow-hover:rgba(3,155,229,0.28);--cb-t-border-hover:rgba(3,155,229,0.55);--cb-t-glow:rgba(3,155,229,0.16);--ct-1:#1a5490;--ct-2:#039be5;--cb-t-icon-bg:rgba(3,155,229,0.15);--cb-t-icon-border:rgba(3,155,229,0.35);--cb-t-badge-bg:rgba(3,155,229,0.12);--cb-t-badge-color:#0277bd;--cb-t-badge-border:rgba(3,155,229,0.3);--cb-t-dot-color:#039be5;
          --cb-tp1:#f3e5f8;--cb-tp2:#fdf5ff;--cb-tp3:#f5edfa;--cb-tp-border:rgba(156,39,176,0.25);--cb-tp-shadow:rgba(156,39,176,0.12);--cb-tp-shadow-hover:rgba(156,39,176,0.28);--cb-tp-border-hover:rgba(156,39,176,0.55);--cb-tp-glow:rgba(156,39,176,0.16);--ctp-1:#6a1b9a;--ctp-2:#8e24aa;--ctp-3:#ba68c8;--cb-tp-icon-bg:rgba(156,39,176,0.15);--cb-tp-icon-border:rgba(156,39,176,0.35);--cb-tp-badge-bg:rgba(156,39,176,0.12);--cb-tp-badge-color:#8e24aa;--cb-tp-badge-border:rgba(156,39,176,0.3);--cb-tp-dot-color:#7b1fa2;
          --hdr-pill-bg:rgba(192,38,211,0.08);--hdr-pill-border:rgba(192,38,211,0.25);--stat-hover-bg:rgba(192,38,211,0.08);
          --cta-p-shadow:rgba(192,38,211,0.35);--cta-p-shadow-hover:rgba(192,38,211,0.52);--cta-t1:#4db6f7;--cta-t2:#0277bd;--cta-t-shadow:rgba(3,155,229,0.35);--cta-t-shadow-hover:rgba(3,155,229,0.52);--cta-tp1:#ba68c8;--cta-tp2:#8e24aa;--cta-tp-shadow:rgba(156,39,176,0.35);--cta-tp-shadow-hover:rgba(156,39,176,0.52);
          --dur-active-bg:rgba(192,38,211,0.12);--dur-active-shadow:0 0 12px rgba(192,38,211,0.2);
        }
        [data-pqtheme="yellow"]{
          --g9:#f4ecd8;--g8:#ede0c4;--g75:#e8dab8;
          --g7:#ddd0a8;--g6:#d0c090;--g4:#7a6a50;--g3:#5a4a34;--g2:#3a2e1f;--w:#3a2e1f;
          --f:#b45309;--fb:#d97706;--fd:#92400e;--fmid:#dc9d3f;--stat-grad-mid:#e8b14d;
          --cb-p1:#fce8d8;--cb-p2:#fcf0e8;--cb-p3:#fae8d8;--cb-p-border:rgba(180,83,9,0.25);--cb-p-shadow:rgba(180,83,9,0.1);--cb-p-shadow-hover:rgba(180,83,9,0.22);--cb-p-border-hover:rgba(180,83,9,0.5);--cb-p-glow:rgba(180,83,9,0.12);--cb-p-icon-bg:rgba(180,83,9,0.15);--cb-p-icon-border:rgba(180,83,9,0.3);--cb-p-badge-bg:rgba(180,83,9,0.12);--cb-p-badge-border:rgba(180,83,9,0.28);
          --cb-t1:#fef3c7;--cb-t2:#fffbf0;--cb-t3:#fef9f0;--cb-t-border:rgba(180,83,9,0.25);--cb-t-shadow:rgba(180,83,9,0.1);--cb-t-shadow-hover:rgba(180,83,9,0.22);--cb-t-border-hover:rgba(180,83,9,0.5);--cb-t-glow:rgba(180,83,9,0.12);--ct-1:#92400e;--ct-2:#d97706;--cb-t-icon-bg:rgba(180,83,9,0.15);--cb-t-icon-border:rgba(180,83,9,0.3);--cb-t-badge-bg:rgba(180,83,9,0.12);--cb-t-badge-color:#b45309;--cb-t-badge-border:rgba(180,83,9,0.28);--cb-t-dot-color:#d97706;
          --cb-tp1:#fce8d8;--cb-tp2:#fcf0e8;--cb-tp3:#fae8d8;--cb-tp-border:rgba(180,83,9,0.25);--cb-tp-shadow:rgba(180,83,9,0.1);--cb-tp-shadow-hover:rgba(180,83,9,0.22);--cb-tp-border-hover:rgba(180,83,9,0.5);--cb-tp-glow:rgba(180,83,9,0.12);--ctp-1:#7c2d12;--ctp-2:#b45309;--ctp-3:#f59e0b;--cb-tp-icon-bg:rgba(180,83,9,0.15);--cb-tp-icon-border:rgba(180,83,9,0.3);--cb-tp-badge-bg:rgba(180,83,9,0.12);--cb-tp-badge-color:#b45309;--cb-tp-badge-border:rgba(180,83,9,0.28);--cb-tp-dot-color:#d97706;
          --hdr-pill-bg:rgba(180,83,9,0.1);--hdr-pill-border:rgba(180,83,9,0.25);--stat-hover-bg:rgba(180,83,9,0.08);
          --cta-p-shadow:rgba(180,83,9,0.3);--cta-p-shadow-hover:rgba(180,83,9,0.45);--cta-t1:#f59e0b;--cta-t2:#d97706;--cta-t-shadow:rgba(180,83,9,0.3);--cta-t-shadow-hover:rgba(180,83,9,0.45);--cta-tp1:#d97706;--cta-tp2:#b45309;--cta-tp-shadow:rgba(180,83,9,0.3);--cta-tp-shadow-hover:rgba(180,83,9,0.45);
          --dur-active-bg:rgba(180,83,9,0.12);--dur-active-shadow:0 0 12px rgba(180,83,9,0.18);
        }
        .page[data-pqtheme]{background:var(--g9)!important;color:var(--g2)!important}
        .pq-theme-toggle{display:flex;align-items:center;gap:3px;background:var(--g8);border:1px solid var(--g6);border-radius:999px;padding:3px}
        .pq-theme-btn{width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;font-family:sans-serif}
        .pq-theme-btn:hover{opacity:.85}
        .pq-theme-btn.active{opacity:1;background:rgba(255,255,255,.1);box-shadow:0 0 0 1px var(--g6)}

        body{background:var(--g9);color:var(--g2);font-family:'Outfit',sans-serif;}
        @keyframes popIn{from{opacity:0;transform:scale(0.9) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--g8)}::-webkit-scrollbar-thumb{background:rgba(233,30,140,0.27);border-radius:3px}

        .page{min-height:100vh;background:var(--g9);position:relative;overflow-x:hidden;padding-bottom:60px;
          background-image:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(233,30,140,0.09) 0%,transparent 60%),
            linear-gradient(rgba(233,30,140,0.022) 1px,transparent 1px),
            linear-gradient(90deg,rgba(233,30,140,0.022) 1px,transparent 1px);
          background-size:auto,52px 52px,52px 52px;
        }

        /* HEADER */
        .hdr{padding:44px 5% 0;position:relative;z-index:1;animation:fadeUp 0.5s ease both;}
        .hdr-back{display:inline-flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;color:var(--g4);font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:600;padding:0;margin-bottom:20px;transition:color 0.18s;}
        .hdr-back:hover{color:var(--fb);}
        .hdr-lang-pill{display:inline-flex;align-items:center;gap:8px;background:var(--hdr-pill-bg);border:1px solid var(--hdr-pill-border);border-radius:50px;padding:5px 16px;margin-bottom:16px;}
        .hdr-lang-dot{width:6px;height:6px;border-radius:50%;background:var(--fb);box-shadow:0 0 7px var(--fb);animation:float 2s ease-in-out infinite;}
        .hdr-lang-text{font-size:0.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--fb);}
        .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,6vw,4.5rem);letter-spacing:3px;color:var(--w);line-height:1;margin-bottom:10px;}
        .hdr-title em{font-style:normal;background:linear-gradient(270deg,var(--fb),var(--fmid),var(--fd),var(--fb));background-size:400%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite;}
        .hdr-sub{font-size:0.88rem;color:var(--g4);line-height:1.7;max-width:500px;margin-bottom:32px;}
        .hdr-sub strong{color:var(--g2);}

        /* STATS STRIP */
        .stats{display:flex;gap:0;border:1px solid var(--g6);border-radius:13px;overflow:hidden;margin-bottom:44px;}
        .stat-item{flex:1;padding:14px 10px;text-align:center;border-right:1px solid var(--g6);background:var(--g8);transition:background 0.2s;}
        .stat-item:last-child{border-right:none;}
        .stat-item:hover{background:var(--stat-hover-bg);}
        .stat-v{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:1.5px;background:linear-gradient(135deg,var(--fb),var(--stat-grad-mid));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .stat-l{font-size:0.6rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g4);margin-top:2px;}

        /* CARDS GRID */
        .cards-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 5%;margin-bottom:20px;}
        @media(max-width:680px){.cards-grid{grid-template-columns:1fr;}}
        .tips-wrap{padding:0 5%;}

        /* BASE CARD */
        .card{position:relative;border-radius:22px;overflow:hidden;padding:28px 26px 24px;cursor:pointer;transition:transform 0.28s ease,box-shadow 0.28s ease,border-color 0.28s ease;}
        .card:hover{transform:translateY(-6px);}
        .card-topbar{position:absolute;top:0;left:0;right:0;height:3px;opacity:0;transition:opacity 0.25s;}
        .card:hover .card-topbar,.card--active .card-topbar{opacity:1;}
        .card-glow{position:absolute;width:300px;height:300px;border-radius:50%;pointer-events:none;top:-80px;right:-80px;}

        /* PRACTICE CARD */
        .card--practice{background:linear-gradient(145deg,var(--cb-p1),var(--cb-p2),var(--cb-p3));border:1.5px solid var(--cb-p-border);box-shadow:0 6px 28px var(--cb-p-shadow);}
        .card--practice:hover{box-shadow:0 16px 48px var(--cb-p-shadow-hover);border-color:var(--cb-p-border-hover);}
        .topbar--practice{background:linear-gradient(90deg,var(--fd),var(--fb));}
        .glow--practice{background:radial-gradient(circle,var(--cb-p-glow) 0%,transparent 68%);}

        /* TEST CARD */
        .card--test{background:linear-gradient(145deg,var(--cb-t1),var(--cb-t2),var(--cb-t3));border:1.5px solid var(--cb-t-border);box-shadow:0 6px 28px var(--cb-t-shadow);}
        .card--test:hover{box-shadow:0 16px 48px var(--cb-t-shadow-hover);border-color:var(--cb-t-border-hover);}
        .topbar--test{background:linear-gradient(90deg,var(--ct-1),var(--ct-2));}
        .glow--test{background:radial-gradient(circle,var(--cb-t-glow) 0%,transparent 68%);}

        /* TIPS CARD */
        .card--tips{background:linear-gradient(145deg,var(--cb-tp1),var(--cb-tp2),var(--cb-tp3));border:1.5px solid var(--cb-tp-border);box-shadow:0 6px 28px var(--cb-tp-shadow);}
        .card--tips:hover{box-shadow:0 16px 48px var(--cb-tp-shadow-hover);border-color:var(--cb-tp-border-hover);}
        .topbar--tips{background:linear-gradient(90deg,var(--ctp-1),var(--ctp-2),var(--ctp-3));}
        .glow--tips{background:radial-gradient(circle,var(--cb-tp-glow) 0%,transparent 68%);}

        /* CARD INTERNALS */
        .card-icon-wrap{margin-bottom:18px;position:relative;z-index:1;}
        .card-icon-box{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.9rem;animation:float 4s ease-in-out infinite;}
        .icon-box--practice{background:var(--cb-p-icon-bg);border:1px solid var(--cb-p-icon-border);}
        .icon-box--test{background:var(--cb-t-icon-bg);border:1px solid var(--cb-t-icon-border);}
        .icon-box--tips{background:var(--cb-tp-icon-bg);border:1px solid var(--cb-tp-icon-border);}

        .card-badge{display:inline-block;border-radius:50px;padding:3px 12px;font-size:0.6rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;position:relative;z-index:1;}
        .badge--practice{background:var(--cb-p-badge-bg);color:var(--fb);border:1px solid var(--cb-p-badge-border);}
        .badge--test{background:var(--cb-t-badge-bg);color:var(--cb-t-badge-color);border:1px solid var(--cb-t-badge-border);}
        .badge--tips{background:var(--cb-tp-badge-bg);color:var(--cb-tp-badge-color);border:1px solid var(--cb-tp-badge-border);}

        .card-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:2px;color:var(--w);line-height:1;position:relative;z-index:1;margin-bottom:8px;}
        .card-desc{font-size:0.82rem;color:var(--g4);line-height:1.7;position:relative;z-index:1;margin-bottom:18px;}
        .card-desc strong{color:var(--g2);}

        /* FEATURES */
        .features{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:20px;position:relative;z-index:1;}
        .feature{display:flex;align-items:flex-start;gap:9px;font-size:0.79rem;color:var(--g2);}
        .feat-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:5px;}
        .feat-dot--practice{background:var(--fb);box-shadow:0 0 4px var(--fb);}
        .feat-dot--test{background:var(--cb-t-dot-color);box-shadow:0 0 4px var(--cb-t-dot-color);}
        .feat-dot--tips{background:var(--cb-tp-dot-color);box-shadow:0 0 4px var(--cb-tp-dot-color);}

        /* DURATION SELECTOR */
        .dur-label{font-size:0.62rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--g4);margin-bottom:8px;position:relative;z-index:1;}
        .dur-btns{display:flex;gap:8px;margin-bottom:20px;position:relative;z-index:1;}
        .dur-btn{flex:1;padding:9px 0;border-radius:10px;border:1.5px solid var(--g6);background:var(--g75);color:var(--g3);font-family:'Outfit',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.2s;text-align:center;}
        .dur-btn:hover{border-color:var(--f);color:var(--fb);}
        .dur-btn--active{background:var(--dur-active-bg);border-color:var(--f);color:var(--fb);box-shadow:var(--dur-active-shadow);}

        /* CTA */
        .card-cta{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:50px;padding:11px 26px;font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.22s;position:relative;z-index:1;letter-spacing:0.4px;}
        .cta--practice{background:linear-gradient(135deg,var(--fb),var(--fd));color:#fff;box-shadow:0 4px 18px var(--cta-p-shadow);}
        .cta--practice:hover{transform:translateY(-2px);box-shadow:0 8px 28px var(--cta-p-shadow-hover);}
        .cta--test{background:linear-gradient(135deg,var(--cta-t1),var(--cta-t2));color:#fff;box-shadow:0 4px 18px var(--cta-t-shadow);}
        .cta--test:hover{transform:translateY(-2px);box-shadow:0 8px 28px var(--cta-t-shadow-hover);}
        .cta--tips{background:linear-gradient(135deg,var(--cta-tp1),var(--cta-tp2));color:#fff;box-shadow:0 4px 18px var(--cta-tp-shadow);}
        .cta--tips:hover{transform:translateY(-2px);box-shadow:0 8px 28px var(--cta-tp-shadow-hover);}

        /* RULES MODAL */
        .rules-modal{position:fixed;inset:0;z-index:200;background:rgba(6,6,10,0.94);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;}
        .rules-box{position:relative;background:var(--g8);border:1px solid var(--g6);border-radius:22px;width:100%;max-width:520px;padding:32px 28px;animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;}
        .rules-topbar{position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,#29b6f6,#0277bd,transparent);border-radius:2px;}
        .close-btn{position:absolute;top:14px;right:16px;background:rgba(255,255,255,0.08);border:1px solid var(--g6);color:var(--g4);border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:1rem;font-weight:700;}
        .rule-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #32323f;}
        .rule-item:last-child{border-bottom:none;}
        .rule-num{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:1px;color:#29b6f6;flex-shrink:0;line-height:1;margin-top:1px;}
        .rule-text{font-size:0.82rem;color:var(--g2);line-height:1.6;}
        .rule-text strong{color:var(--w);}

        /* TIPS MINI KEY ROW */
        .mini-keys{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;position:relative;z-index:1;}
        .mini-key{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:800;font-family:'Bebas Neue',sans-serif;letter-spacing:0.5px;}

        /* CURSOR BLINK */
        .cursor{display:inline-block;width:2px;height:18px;background:var(--fb);animation:blink 1s ease-in-out infinite;vertical-align:middle;border-radius:1px;margin-left:3px;}
      `}</style>

      <div className="page" data-pqtheme={theme}>

        {/* ── HEADER ── */}
        <div className="hdr">
          <button className="hdr-back" onClick={() => navigate("/dashboard")}>
            ← Back to dashboard
          </button>

          <div className="hdr-lang-pill">
            <span className="hdr-lang-dot" />
            <span className="hdr-lang-text">🇬🇧 English Typing</span>
          </div>

                    <PqThemeToggle theme={theme} setTheme={setTheme} />
<h1 className="hdr-title">
            English <em>Typing</em>
          </h1>
          <p className="hdr-sub">
            Practice daily, test under <strong>real exam conditions</strong>, and master finger placement — everything you need to hit 35+ WPM for SSC & Railway exams.
          </p>

          {/* stats */}
          <div className="stats">
            {[
              {v:"35+ WPM",l:"SSC Cut-off"},
              {v:"200+",l:"Practice Sets"},
              {v:"15 Min",l:"Exam Duration"},
              {v:"QWERTY",l:"Layout"},
            ].map(s=>(
              <div className="stat-item" key={s.l}>
                <div className="stat-v">{s.v}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CARDS ── */}
        <div className="cards-grid">

          {/* PRACTICE CARD */}
          <div className="card card--practice">
            <div className="card-topbar topbar--practice" />
            <div className="card-glow glow--practice" />

            <div className="card-icon-wrap">
              <div className="card-icon-box icon-box--practice">⌨️</div>
            </div>

            <div className="card-badge badge--practice">Build Your Foundation</div>
            <div className="card-title">Practice</div>
            <p className="card-desc">
              A <strong>lesson-by-lesson course</strong> that teaches proper finger placement key by key, plus free timed sessions and a finger-placement guide — all in one place.
            </p>

            <ul className="features">
              {[
                "Lesson course — one key at a time, finger-by-finger",
                "Colour-coded on-screen keyboard guide",
                "Finger placement & speed tips built in",
                "Free timed practice sessions, any length",
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
              onClick={() => navigate("/englishpractice", { state: { tab: "lessons" } })}
            > Start Lesson Course → </button>
          </div>

          {/* TEST CARD */}
          <div className="card card--test">
            <div className="card-topbar topbar--test" />
            <div className="card-glow glow--test" />

            <div className="card-icon-wrap">
              <div className="card-icon-box icon-box--test">⏱️</div>
            </div>

            <div className="card-badge badge--test">Exam Simulation</div>
            <div className="card-title">Exam <span className="cursor"/></div>
            <p className="card-desc">
              Full <strong>15-minute timed test</strong> in exact SSC CHSL / CPO exam format. No shortcuts — this is the real deal. Get a score report after.
            </p>

            <ul className="features">
              {[
                "Strict 15-minute countdown timer",
                "No-backspace mode (SSC exam rule)",
                "Passage from actual SSC PYQ papers",
                "Final WPM · Accuracy · Error report",
                "Score vs SSC cut-off comparison",
              ].map(f=>(
                <li className="feature" key={f}>
                  <span className="feat-dot feat-dot--test"/>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="card-cta cta--test"
              onClick={() => navigate("/englishtest")}
            >Enter Exam Section →</button>
          </div>
        </div>

      </div>
    </>
  );
}