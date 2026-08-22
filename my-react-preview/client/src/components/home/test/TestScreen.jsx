import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useBookmark } from "../../../services/usePractice";
import { useTheme } from "../../../context/ThemeContext";

/* ════════════════════════════════════════════════════════════════
   CSS
════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--bg4:#21212e;--b:#1e1e2c;
--f:#d946ef;--fl:#f472eb;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--purple:#a855f7;
--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}

[data-theme="light"]{--bg:#f5f5f8;--bg2:#ffffff;--bg3:#f0f0f4;--bg4:#e8e8ee;--b:#e2e2ec;
--t:#16161e;--m:#7a7a90;--m2:#c4c4d4}
[data-theme="light"] .ts-q-text{color:#16161e}
[data-theme="light"] .ts-option-text{color:#16161e}
[data-theme="light"] .ts-option{box-shadow:0 1px 3px rgba(0,0,0,.04)}
[data-theme="light"] .ts-palette-btn.st-not-visited{color:#7a7a90}

@keyframes ts-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ts-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes ts-pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes ts-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes ts-blink{0%,100%{background:rgba(239,68,68,.15)}50%{background:rgba(239,68,68,.35)}}

.ts-page{height:100vh;height:100dvh;background:var(--bg);display:flex;flex-direction:column;user-select:none;overflow:hidden}

/* ── TOP BAR ── */
.ts-topbar{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:10px 20px;background:var(--bg2);border-bottom:1px solid var(--b);
  flex-wrap:wrap;position:sticky;top:0;z-index:50;
}
.ts-brand{display:flex;align-items:center;gap:10px}
.ts-brand-icon{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:var(--f)}
.ts-exam-name{font-size:11px;color:var(--m)}

.ts-timer{
  display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:10px;
  background:var(--bg3);border:1px solid var(--b);font-family:'DM Mono',monospace;
}
.ts-timer.warn{border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.06)}
.ts-timer.danger{border-color:rgba(239,68,68,.5);animation:ts-blink 1s infinite}
.ts-timer-icon{font-size:14px}
.ts-timer-val{font-size:18px;font-weight:700;color:var(--t);letter-spacing:1px}
.ts-timer.warn .ts-timer-val{color:var(--amber)}
.ts-timer.danger .ts-timer-val{color:var(--red)}
.ts-timer-lbl{font-size:9px;color:var(--m);text-transform:uppercase;letter-spacing:1px}

.ts-top-actions{display:flex;align-items:center;gap:8px}
.ts-icon-btn{
  width:34px;height:34px;border-radius:8px;background:var(--bg3);border:1px solid var(--b);
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;
  color:var(--m);transition:all .2s;
}
.ts-icon-btn:hover{border-color:var(--f);color:var(--f)}
.ts-lang-pill{display:flex;background:var(--bg3);border:1px solid var(--b);border-radius:8px;padding:3px}
.ts-lang-btn{padding:6px 12px;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;
background:transparent;color:var(--m);font-family:'Outfit',sans-serif;transition:all .15s}
.ts-lang-btn.active{background:var(--f);color:#fff}

/* ── SECTION TABS ── */
.ts-section-tabs{display:flex;gap:6px;padding:10px 20px;background:var(--bg);border-bottom:1px solid var(--b);
overflow-x:auto;scrollbar-width:none}
.ts-section-tabs::-webkit-scrollbar{display:none}
.ts-section-tab{
  display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:10px;
  background:var(--bg2);border:1px solid var(--b);cursor:pointer;white-space:nowrap;
  font-size:12px;font-weight:600;color:var(--m);transition:all .2s;flex-shrink:0;
}
.ts-section-tab.active{background:var(--bg3);border-color:rgba(217,70,239,.35);color:var(--t)}
.ts-section-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ts-section-count{font-family:'DM Mono',monospace;font-size:10px;color:var(--m2);
padding:1px 7px;border-radius:100px;background:var(--bg4)}
.ts-section-tab.active .ts-section-count{color:var(--t)}

/* ── MAIN LAYOUT ── */
.ts-body{display:flex;flex:1;overflow:hidden}
.ts-main{flex:1;display:flex;flex-direction:column;overflow-y:auto;padding:24px 28px}
.ts-sidebar{
  width:clamp(220px, 26vw, 320px);flex-shrink:0;background:var(--bg2);border-left:1px solid var(--b);
  display:flex;flex-direction:column;overflow-y:auto;
}

/* ── QUESTION CARD ── */
.ts-q-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;
animation:ts-rise .3s ease both;flex-wrap:wrap;gap:10px}
.ts-q-number{
  font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--t);letter-spacing:1px;
  display:flex;align-items:center;gap:10px;
}
.ts-q-of{font-size:13px;color:var(--m);font-weight:400}
.ts-q-marks{
  font-size:11px;color:var(--m);font-family:'DM Mono',monospace;
  display:flex;gap:14px;
}
.ts-q-marks .pos{color:var(--green)}
.ts-q-marks .neg{color:var(--red)}

/* bookmark button */
.ts-bookmark-btn{
  width:36px;height:36px;border-radius:9px;background:var(--bg3);border:1px solid var(--b);
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;
  color:var(--m);transition:all .2s;flex-shrink:0;
}
.ts-bookmark-btn:hover{border-color:rgba(245,158,11,.4);color:var(--amber)}
.ts-bookmark-btn.active{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.4);color:var(--amber)}
.ts-bookmark-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  background:var(--bg3);border:1px solid rgba(245,158,11,.35);border-radius:10px;
  padding:10px 18px;font-size:12px;color:var(--amber);z-index:1300;
  display:flex;align-items:center;gap:8px;animation:ts-rise .25s ease both;
  box-shadow:0 8px 24px rgba(0,0,0,.4);
}

.ts-q-card{
  position:relative;flex-shrink:0;
  background:var(--bg2);border:1px solid var(--b);border-radius:16px;padding:24px;
  margin-bottom:18px;animation:ts-rise .35s ease both;
}
.ts-q-card::before{
  content:"";position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0;
  background:linear-gradient(90deg,var(--f),transparent);
}
.ts-q-text{font-size:15px;line-height:1.8;color:var(--t);margin-bottom:24px}

/* ── IMAGE CONTENT (questions & options from Cloudflare CDN) ── */
.ts-img-wrap{
  position:relative;border-radius:10px;overflow:hidden;background:var(--bg3);
  border:1px solid var(--b);display:inline-block;max-width:100%;
}
.ts-img-wrap img{
  display:block;max-width:100%;height:auto;cursor:zoom-in;
  transition:opacity .25s; background:#fff;
}
.ts-img-wrap img.loading{opacity:0}
.ts-img-skeleton{
  position:absolute;inset:0;background:linear-gradient(90deg,
    rgba(255,255,255,.03) 25%,rgba(217,70,239,.08) 50%,rgba(255,255,255,.03) 75%);
  background-size:200% 100%;animation:ts-shimmer 1.6s infinite;
  min-height:120px;
}
@keyframes ts-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
.ts-img-error{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  min-height:120px;padding:24px;color:var(--m);font-size:12px;background:var(--bg3);
  border-radius:10px;border:1px dashed var(--b);
}
.ts-img-zoom-hint{
  position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.6);color:#fff;
  font-size:10px;padding:4px 8px;border-radius:100px;display:flex;align-items:center;gap:4px;
  pointer-events:none;opacity:0;transition:opacity .2s;
}
.ts-img-wrap:hover .ts-img-zoom-hint{opacity:1}

/* question image — slightly larger */
.ts-q-image-wrap img{max-height:380px;width:auto;margin:0 auto;display:block}
.ts-q-image-wrap{width:100%;text-align:center;margin-bottom:8px}

/* option image */
.ts-option-img-wrap img{max-height:120px}

/* ── LIGHTBOX (zoom modal) ── */
.ts-lightbox-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1400;
  display:flex;align-items:center;justify-content:center;padding:20px;
  animation:ts-rise .2s ease both;cursor:zoom-out;
}
.ts-lightbox-img{
  max-width:95vw;max-height:90vh;border-radius:8px;background:#fff;
  cursor:default;touch-action:pinch-zoom;
}
.ts-lightbox-close{
  position:absolute;top:20px;right:20px;width:40px;height:40px;border-radius:10px;
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;
}
.ts-lightbox-hint{
  position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  font-size:11px;color:rgba(255,255,255,.5);background:rgba(255,255,255,.05);
  padding:6px 14px;border-radius:100px;
}

/* options */
.ts-options{display:flex;flex-direction:column;gap:12px}
.ts-option{
  display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:12px;
  background:var(--bg3);border:1.5px solid var(--b);cursor:pointer;transition:all .15s;
}
.ts-option:hover{border-color:rgba(217,70,239,.3);background:var(--bg4)}
.ts-option.selected{border-color:var(--f);background:rgba(217,70,239,.07)}
.ts-option-radio{
  width:22px;height:22px;border-radius:50%;border:2px solid var(--m2);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;transition:all .15s;margin-top:1px;
}
.ts-option.selected .ts-option-radio{border-color:var(--f)}
.ts-option-radio-fill{width:11px;height:11px;border-radius:50%;background:var(--f);
transform:scale(0);transition:transform .15s}
.ts-option.selected .ts-option-radio-fill{transform:scale(1)}
.ts-option-label{font-size:11px;font-weight:700;color:var(--m2);flex-shrink:0;margin-top:2px;
font-family:'DM Mono',monospace}
.ts-option.selected .ts-option-label{color:var(--f)}
.ts-option-text{font-size:14px;color:var(--t);line-height:1.6}

/* ── BOTTOM ACTION BAR ── */
.ts-actions{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:16px 0 4px;flex-wrap:wrap;
}
.ts-actions-left,.ts-actions-right{display:flex;gap:10px;flex-wrap:wrap}
.ts-btn{
  padding:11px 20px;border-radius:10px;border:none;font-size:12.5px;font-weight:700;
  cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:6px;
}
.ts-btn-clear{background:var(--bg3);color:var(--m);border:1px solid var(--b)}
.ts-btn-clear:hover{border-color:var(--red);color:var(--red)}
.ts-btn-mark{background:rgba(168,85,247,.1);color:var(--purple);border:1px solid rgba(168,85,247,.3)}
.ts-btn-mark:hover{background:rgba(168,85,247,.18)}
.ts-btn-save{background:linear-gradient(135deg,var(--f),var(--fl));color:#fff}
.ts-btn-save:hover{box-shadow:0 6px 18px rgba(217,70,239,.35);transform:translateY(-1px)}
.ts-btn-nav{background:var(--bg3);color:var(--t);border:1px solid var(--b)}
.ts-btn-nav:hover{border-color:rgba(217,70,239,.3)}
.ts-btn-nav:disabled{opacity:.35;cursor:not-allowed}

/* ── SIDEBAR ── */
.ts-side-section{padding:18px 18px;border-bottom:1px solid var(--b)}
.ts-side-title{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--m);margin-bottom:12px}

.ts-candidate{display:flex;align-items:center;gap:12px}
.ts-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--f),var(--fl));
display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;flex-shrink:0}
.ts-candidate-name{font-size:13px;font-weight:700;color:var(--t)}
.ts-candidate-id{font-size:11px;color:var(--m);font-family:'DM Mono',monospace}

/* status summary */
.ts-status-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ts-status-item{
  display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:9px;background:var(--bg3);
  border:1px solid var(--b);font-size:11px;color:var(--m);
}
.ts-status-box{width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;
justify-content:center;font-size:9px;font-weight:700;color:#fff;border:1px solid}
.ts-status-num{font-family:'DM Mono',monospace;font-weight:700;color:var(--t);margin-left:auto}

/* palette */
.ts-palette-section-label{
  display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:var(--t);
  margin-bottom:10px;margin-top:14px;
}
.ts-palette-section-label:first-child{margin-top:0}
.ts-palette-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}
.ts-palette-btn{
  aspect-ratio:1;border-radius:50%;border:1.5px solid;font-size:12px;font-weight:700;
  font-family:'DM Mono',monospace;cursor:pointer;display:flex;align-items:center;justify-content:center;
  position:relative;transition:all .15s;color:#fff;
}
.ts-palette-btn:hover{transform:scale(1.08)}
.ts-palette-btn.current{box-shadow:0 0 0 2px var(--bg2),0 0 0 4px var(--f)}
.ts-palette-dot{position:absolute;bottom:-3px;right:-3px;width:9px;height:9px;border-radius:50%;
background:var(--green);border:1.5px solid var(--bg2)}

/* status colors */
.st-not-visited{background:var(--bg3);border-color:var(--m2);color:var(--m)}
.st-not-answered{background:var(--red);border-color:var(--red)}
.st-answered{background:var(--green);border-color:var(--green)}
.st-marked{background:var(--purple);border-color:var(--purple)}

/* review-mode palette colors */
.st-review-correct{background:var(--green);border-color:var(--green)}
.st-review-wrong{background:var(--red);border-color:var(--red)}
.st-review-skipped{background:var(--bg3);border-color:var(--m2);color:var(--m)}

/* review-mode option highlighting */
.ts-option.review-correct{
  border-color:var(--green)!important;background:rgba(34,197,94,.10)!important;cursor:default;
}
.ts-option.review-wrong{
  border-color:var(--red)!important;background:rgba(239,68,68,.10)!important;cursor:default;
}
.ts-option.review-neutral{cursor:default}
.ts-option.review-neutral:hover{border-color:var(--b);background:var(--bg3)}
.ts-option-result{font-size:12px;margin-left:auto;padding-left:10px;flex-shrink:0;font-weight:700}

/* explanation panel (review mode) */
.ts-explanation{
  margin-top:20px;padding:14px 16px;border-radius:0 12px 12px 0;
  border-left:3px solid var(--f);background:rgba(217,70,239,.08);
  animation:ts-rise .25s ease both;
}
.ts-explanation-label{
  font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;
  color:var(--f);margin-bottom:6px;
}
.ts-explanation-text{font-size:13.5px;line-height:1.7;color:var(--t)}

/* review mode topbar badge (replaces timer) */
.ts-review-badge{
  display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:10px;
  background:rgba(217,70,239,.10);border:1px solid rgba(217,70,239,.35);
  font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--f);
}

/* review nav bar */
.ts-review-nav{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:16px 0 4px;
}
.ts-back-link{
  display:inline-flex;align-items:center;gap:6px;background:transparent;
  border:1px solid var(--b);border-radius:10px;padding:10px 16px;
  font-size:12.5px;font-weight:700;color:var(--m);cursor:pointer;
  font-family:'Outfit',sans-serif;transition:all .2s;
}
.ts-back-link:hover{border-color:var(--f);color:var(--f)}

/* submit button */
.ts-submit-btn{
  width:100%;padding:14px;border-radius:12px;border:none;
  background:linear-gradient(135deg,var(--f),var(--fl));color:#fff;
  font-size:14px;font-weight:800;letter-spacing:.5px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;
}
.ts-submit-btn:hover{box-shadow:0 8px 24px rgba(217,70,239,.4);transform:translateY(-1px)}

/* ── MODAL ── */
.ts-modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;z-index:1200;padding:20px;
  animation:ts-rise .2s ease both;
}
.ts-modal{
  background:var(--bg2);border:1px solid var(--b);border-radius:20px;padding:30px;
  max-width:480px;width:100%;animation:ts-pop .25s cubic-bezier(.34,1.56,.64,1) both;
}
.ts-modal-icon{font-size:42px;text-align:center;margin-bottom:12px}
.ts-modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:2px;color:var(--t);
text-align:center;margin-bottom:6px}
.ts-modal-sub{font-size:13px;color:var(--m);text-align:center;margin-bottom:20px;line-height:1.6}

.ts-summary-table{background:var(--bg3);border:1px solid var(--b);border-radius:12px;padding:14px;margin-bottom:20px}
.ts-summary-row{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;gap:8px;padding:8px 4px;
font-size:11px;align-items:center;border-bottom:1px solid var(--b)}
.ts-summary-row:last-child{border-bottom:none;font-weight:700;color:var(--t)}
.ts-summary-row.head{font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--m);font-size:9px}
.ts-summary-row .num{font-family:'DM Mono',monospace;text-align:center}

.ts-warning-box{
  display:flex;gap:10px;padding:12px 14px;background:rgba(245,158,11,.07);
  border:1px solid rgba(245,158,11,.25);border-radius:10px;margin-bottom:20px;font-size:12px;
  color:var(--amber);line-height:1.6;
}

.ts-modal-btns{display:flex;gap:10px}

/* ── PAUSE OVERLAY ── */
.ts-pause-overlay{
  position:fixed;inset:0;background:rgba(11,11,16,.97);backdrop-filter:blur(10px);
  display:flex;align-items:center;justify-content:center;z-index:1100;padding:20px;
  animation:ts-rise .25s ease both;
}
.ts-pause-card{text-align:center;max-width:380px;animation:ts-pop .3s cubic-bezier(.34,1.56,.64,1) both}
.ts-pause-icon{font-size:56px;margin-bottom:16px;animation:ts-pulse 2s infinite}
.ts-pause-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:3px;color:var(--t);margin-bottom:8px}
.ts-pause-sub{font-size:13px;color:var(--m);line-height:1.7;margin-bottom:8px}
.ts-pause-time{
  font-family:'DM Mono',monospace;font-size:1.4rem;color:var(--f);
  background:rgba(217,70,239,.08);border:1px solid rgba(217,70,239,.25);
  border-radius:10px;padding:10px 20px;display:inline-block;margin:14px 0 24px;
}
.ts-pause-btns{display:flex;flex-direction:column;gap:10px}

.ts-jump-topbar-btn{
  display:none; /* shown only below 640px, see media query */
  align-items:center; gap:6px; padding:8px 12px; border-radius:8px;
  background:linear-gradient(135deg,var(--f),var(--fl)); color:#fff;
  border:none; font-size:12px; font-weight:700; font-family:'Outfit',sans-serif;
  cursor:pointer;
}
.ts-jump-topbar-count{
  background:rgba(255,255,255,.25); border-radius:100px; padding:1px 7px;
  font-family:'DM Mono',monospace; font-size:10.5px;
}

@media(max-width:900px){
  .ts-main{padding:18px 20px}
}
@media(max-width:640px){
  .ts-sidebar{display:none}
  .ts-body{flex-direction:column}
  .ts-jump-topbar-btn{display:flex}
  .ts-topbar{gap:8px; padding:8px 12px}
  .ts-timer{padding:6px 12px; gap:6px}
  .ts-timer-lbl{display:none}
  .ts-exam-name{display:none}
  .ts-actions{
    position:sticky; bottom:0; z-index:60;
    background:var(--bg2); border-top:1px solid var(--b);
    padding-top:14px; padding-bottom:calc(4px + env(safe-area-inset-bottom));
  }
}

/* ── MOBILE PALETTE DRAWER (bottom sheet) ── */
.ts-drawer-overlay{
  position:fixed; inset:0; z-index:1300; background:rgba(0,0,0,.6);
  opacity:0; pointer-events:none; transition:opacity .25s;
}
.ts-drawer-overlay.open{ opacity:1; pointer-events:all; }
.ts-drawer{
  position:fixed; left:0; right:0; bottom:0; z-index:1301;
  background:var(--bg2); border-top:1px solid var(--b);
  border-radius:18px 18px 0 0; max-height:80vh; display:flex; flex-direction:column;
  transform:translateY(100%); transition:transform .3s cubic-bezier(.4,0,.2,1);
  box-shadow:0 -10px 40px rgba(0,0,0,.4);
}
.ts-drawer.open{ transform:translateY(0); }
.ts-drawer-handle{
  width:36px; height:4px; border-radius:4px; background:var(--m2);
  margin:10px auto 4px; flex-shrink:0;
}
.ts-drawer-head{
  display:flex; align-items:center; justify-content:space-between;
  padding:6px 18px 12px; border-bottom:1px solid var(--b); flex-shrink:0;
}
.ts-drawer-title{ font-size:14px; font-weight:700; color:var(--t); }
.ts-drawer-close{
  width:30px; height:30px; border-radius:8px; background:var(--bg3); border:1px solid var(--b);
  color:var(--m); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px;
}
.ts-drawer-body{ flex:1; overflow-y:auto; padding:14px 18px 24px; }
@media(max-width:600px){
  .ts-topbar{padding:8px 12px}
  .ts-main{padding:16px}
  .ts-options{gap:8px}
  .ts-actions{flex-direction:column;align-items:stretch}
  .ts-actions-left,.ts-actions-right{justify-content:stretch}
  .ts-btn{flex:1;justify-content:center}
}
`;

const inject = () => {
  if (document.getElementById("ts-css")) return;
  const s = document.createElement("style");
  s.id = "ts-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ════════════════════════════════════════════════════════════════
   DEMO DATA — replace with API data via props
════════════════════════════════════════════════════════════════ */
const SECTION_DEFS = [
  { id: "gi", name: "General Intelligence & Reasoning", color: "#0ea5e9", count: 5 },
  { id: "ga", name: "General Awareness",                color: "#f59e0b", count: 5 },
  { id: "qa", name: "Quantitative Aptitude",            color: "#22c55e", count: 5 },
  { id: "en", name: "English Comprehension",            color: "#d946ef", count: 5 },
];

const SAMPLE_OPTIONS_BY_SECTION = {
  gi: () => ["Series follows +3 pattern", "Series follows alternating pattern", "Series follows ×2 pattern", "None of the above"],
  ga: () => ["Article 370", "Article 356", "Article 32", "Article 19"],
  qa: () => ["12", "15", "18", "21"],
  en: () => ["Synonym A", "Synonym B", "Antonym C", "None of these"],
};

function buildDemoQuestions() {
  const qs = [];
  let n = 1;
  SECTION_DEFS.forEach(sec => {
    for (let i = 1; i <= sec.count; i++) {
      qs.push({
        id: `${sec.id}-${i}`,
        number: n++,
        sectionId: sec.id,
        text: `[${sec.name}] Sample question ${i} — This is a placeholder question statement. Replace with real question content fetched from your database for ${sec.name}.`,
        options: SAMPLE_OPTIONS_BY_SECTION[sec.id](),
      });
    }
  });
  return qs;
}

/* ════════════════════════════════════════════════════════════════
   CLOUDFLARE IMAGE HELPER
   ────────────────────────────────────────────────────────────────
   Builds an optimized image URL via Cloudflare Image Resizing.
   If you're using Cloudflare Images (the dedicated product), swap
   this for their /cdn-cgl/imagedelivery.net/... variant URL format.

   Usage:
     cfImage(question.imageUrl, { width: 900 })
     cfImage(option.imageUrl, { width: 400 })
════════════════════════════════════════════════════════════════ */
const CF_IMAGE_BASE = ""; // e.g. "https://cdn.speedmock.in" — leave empty to use raw urls

export function cfImage(path, { width, quality = 80 } = {}) {
  if (!path) return "";
  // absolute URLs (e.g. already-hosted) pass through untouched
  if (/^https?:\/\//.test(path) && !CF_IMAGE_BASE) return path;

  const base = CF_IMAGE_BASE || "";
  const params = [];
  if (width) params.push(`width=${width}`);
  params.push(`quality=${quality}`, "format=auto");

  // Cloudflare Image Resizing URL pattern: /cdn-cgl/image/<options>/<path>
  return `${base}/cdn-cgl/image/${params.join(",")}/${path.replace(/^\//, "")}`;
}

/* ════════════════════════════════════════════════════════════════
   SMART IMAGE
   ────────────────────────────────────────────────────────────────
   Renders a question/option image with:
     - shimmer skeleton while loading
     - error fallback if the CDN image fails
     - click-to-zoom (opens Lightbox)
════════════════════════════════════════════════════════════════ */
function SmartImage({ src, alt, width, onZoom, className = "" }) {
  const [status, setStatus] = useState("loading"); // loading | loaded | error
  const url = cfImage(src, { width });

  if (!src) return null;

  return (
    <div className={`ts-img-wrap ${className}`}>
      {status === "loading" && <div className="ts-img-skeleton" />}
      {status === "error" ? (
        <div className="ts-img-error">
          ⚠️ Image failed to load
          <button
            className="ts-btn ts-btn-clear"
            style={{ padding: "5px 12px", fontSize: 11 }}
            onClick={() => setStatus("loading")}
          >
            ↻ Retry
          </button>
        </div>
      ) : (
        <>
          <img
            src={url}
            alt={alt || "Question content"}
            className={status === "loading" ? "loading" : ""}
            loading="lazy"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            onClick={(e) => { e.stopPropagation(); onZoom?.(url); }}
          />
          {status === "loaded" && (
            <span className="ts-img-zoom-hint">🔍 Tap to zoom</span>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LIGHTBOX — full-screen zoomable image viewer
════════════════════════════════════════════════════════════════ */
function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="ts-lightbox-overlay" onClick={onClose}>
      <button className="ts-lightbox-close" onClick={onClose}>✕</button>
      <img src={src} alt="" className="ts-lightbox-img" onClick={e => e.stopPropagation()} />
      <div className="ts-lightbox-hint">Pinch or scroll to zoom · Tap anywhere to close</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   QUESTION CONTENT — renders text and/or image
   ────────────────────────────────────────────────────────────────
   Question shape supports:
     { text: "..." }                          → plain text
     { imageUrl: "questions/q1.png" }         → image only
     { text: "...", imageUrl: "..." }         → both (caption + image)
════════════════════════════════════════════════════════════════ */
function QuestionContent({ question, onZoom }) {
  return (
    <>
      {question.text && <div className="ts-q-text">{question.text}</div>}
      {question.imageUrl && (
        <div className="ts-q-image-wrap">
          <SmartImage src={question.imageUrl} alt={`Question ${question.number}`} width={900} onZoom={onZoom} />
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPTION CONTENT — renders text and/or image for one option
   ────────────────────────────────────────────────────────────────
   Option shape can be:
     "Option text"                            → plain string (legacy)
     { text: "Option text" }                  → text object
     { imageUrl: "options/q1-a.png" }          → image only
     { text: "...", imageUrl: "..." }          → both
════════════════════════════════════════════════════════════════ */
function OptionContent({ option, onZoom }) {
  // legacy: option is a plain string
  if (typeof option === "string") {
    return <div className="ts-option-text">{option}</div>;
  }
  return (
    <>
      {option.text && <div className="ts-option-text">{option.text}</div>}
      {option.imageUrl && (
        <SmartImage
          src={option.imageUrl}
          alt="Option"
          width={400}
          onZoom={onZoom}
          className="ts-option-img-wrap"
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   TIMER HOOK
════════════════════════════════════════════════════════════════ */
function useExamTimer(initialSeconds, onExpire, isPaused) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (isPaused) return;          // ⏸ don't tick while paused
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onExpire, isPaused]);

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return {
    secondsLeft,
    display: h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`,
    isWarning: secondsLeft <= 300 && secondsLeft > 60,  // last 5 min
    isDanger: secondsLeft <= 60,                          // last 1 min
  };
}

/* ════════════════════════════════════════════════════════════════
   SUBMIT CONFIRMATION MODAL
════════════════════════════════════════════════════════════════ */
function SubmitModal({ stats, onCancel, onConfirm, autoSubmit }) {
  return (
    <div className="ts-modal-overlay">
      <div className="ts-modal">
        <div className="ts-modal-icon">{autoSubmit ? "⏰" : "📤"}</div>
        <div className="ts-modal-title">{autoSubmit ? "TIME'S UP!" : "SUBMIT TEST?"}</div>
        <div className="ts-modal-sub">
          {autoSubmit
            ? "Your time has expired. The test will be submitted automatically with your current responses."
            : "Please review your summary before submitting. You cannot make changes after submission."}
        </div>

        <div className="ts-summary-table">
          <div className="ts-summary-row head">
            <div>Section</div><div className="num">Answered</div><div className="num">Not Ans.</div>
            <div className="num">Marked</div><div className="num">Not Visit.</div>
          </div>
          {stats.bySection.map(s => (
            <div className="ts-summary-row" key={s.name}>
              <div style={{ color: "var(--t)" }}>{s.short}</div>
              <div className="num" style={{ color: "var(--green)" }}>{s.answered}</div>
              <div className="num" style={{ color: "var(--red)" }}>{s.notAnswered}</div>
              <div className="num" style={{ color: "var(--purple)" }}>{s.marked}</div>
              <div className="num" style={{ color: "var(--m)" }}>{s.notVisited}</div>
            </div>
          ))}
          <div className="ts-summary-row">
            <div>TOTAL</div>
            <div className="num" style={{ color: "var(--green)" }}>{stats.total.answered}</div>
            <div className="num" style={{ color: "var(--red)" }}>{stats.total.notAnswered}</div>
            <div className="num" style={{ color: "var(--purple)" }}>{stats.total.marked}</div>
            <div className="num" style={{ color: "var(--m)" }}>{stats.total.notVisited}</div>
          </div>
        </div>

        {!autoSubmit && stats.total.notAnswered + stats.total.notVisited > 0 && (
          <div className="ts-warning-box">
            ⚠️ You have <strong>{stats.total.notAnswered + stats.total.notVisited}</strong> unanswered
            questions. Unanswered questions get 0 marks but won't be penalized.
          </div>
        )}

        <div className="ts-modal-btns">
          {!autoSubmit && (
            <button className="ts-btn ts-btn-nav" style={{ flex: 1, justifyContent: "center" }} onClick={onCancel}>
              ← Continue Test
            </button>
          )}
          <button className="ts-btn ts-btn-save" style={{ flex: 1, justifyContent: "center" }} onClick={onConfirm}>
            {autoSubmit ? "View Result →" : "Yes, Submit →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
/**
 * Props:
 *  test: {
 *    examName, testName, durationMins, marksPerQ, negativeMarking,
 *    sections: [{id,name,color,count}],
 *    questions: [{id, number, sectionId, text, options}]
 *  }
 *  candidate: { name, id }
 *  language: "en" | "hi"
 *  onSubmit: fn(payload) — called with final answers when test is submitted
 */
export default function TestScreen({
  test,
  candidate = { name: "Rahul Sharma", id: "SM-2026-00481" },
  language: initialLanguage = "en",
  onLanguageChange,   // fn(lang) — called when user switches language in topbar; parent re-fetches questions
  resumeState = null, // { answers, marked, bookmarked, visited, currentQ, secondsLeft, timePerQ } — from a saved in-progress attempt
  onSubmit,
  onPause,    // fn(payload) — called when user pauses, save progress to backend
  onResume,   // fn() — called when resuming
  // ── Review / Re-attempt ─────────────────────────────────────
  // mode="review"  → read-only, shows correct/wrong, explanations, no timer
  // mode="live"    → normal exam (default)
  mode = "live",
  // reviewData is required when mode="review":
  //   { answers: {qId: selectedIndex|null}, correctAnswers: {qId: correctIndex} }
  // questions should carry an `explanation` field in review mode.
  reviewData = null,
  onBack,     // fn() — "← Back to History" button shown in review mode
}) {
  const isReview = mode === "review";
  useEffect(() => { inject(); }, []);

  const sections  = test?.sections  || SECTION_DEFS;
  const questions = useMemo(() => test?.questions || buildDemoQuestions(), [test]);

  const durationSecs = (test?.durationMins || 60) * 60;
  const marksPerQ    = test?.marksPerQ ?? 2;
  const negMark      = test?.negativeMarking ?? 0.5;

  const [language, setLanguage]   = useState(initialLanguage);

  // Keep local display in sync if parent updates language (e.g. after re-fetch completes)
  useEffect(() => { setLanguage(initialLanguage); }, [initialLanguage]);

  const handleLangSwitch = (lang) => {
    setLanguage(lang);         // instant local UI update
    onLanguageChange?.(lang);  // tells TestRunner to re-fetch questions in new language
  };
  const { theme, toggleTheme }    = useTheme(); // shared app-wide theme, not a private copy
  const [isPaused, setIsPaused]   = useState(false);
  const [currentSec, setCurrentSec] = useState(sections[0].id);
  const [currentQ, setCurrentQ]   = useState(resumeState?.currentQ ?? 0); // index into `questions`
  const [answers, setAnswers]     = useState(() =>
    isReview ? (reviewData?.answers || {}) : (resumeState?.answers || {})
  );      // {qId: optionIndex}
  const [marked, setMarked]       = useState(() => new Set(resumeState?.marked || [])); // qIds marked for review
  const [bookmarked, setBookmarked] = useState(() => new Set(resumeState?.bookmarked || [])); // qIds bookmarked for later
  const [bookmarkToast, setBookmarkToast] = useState(null); // "added" | "removed" | null
  const { bookmarked: persistedBookmarks, toggle: persistBookmark } = useBookmark();

  useEffect(() => {
    if (!persistedBookmarks || !persistedBookmarks.size) return;
    setBookmarked((prev) => new Set([...prev, ...persistedBookmarks]));
  }, [persistedBookmarks]);
  const [lightboxSrc, setLightboxSrc]     = useState(null); // image URL currently zoomed, or null
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false); // mobile bottom-sheet for question palette
  const [visited, setVisited]     = useState(() => new Set(resumeState?.visited || [questions[0]?.id]));
  const [showSubmit, setShowSubmit] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);

  /* ── SECTIONAL TIMING (SSC CGL only — test.sectional) ────────
     Total duration is split evenly across sections. Each section gets
     its own countdown; once it hits 0 that section locks (read-only,
     can't navigate back into it) and the user is auto-advanced to the
     next unlocked section. Unused time in a section is forfeited, not
     carried over — matches the real SSC CGL rule. */
  const sectional = !isReview && !!test?.sectional && sections.length > 0;
  const sectionSecs = sectional ? Math.floor(durationSecs / sections.length) : null;

  const [sectionTimeLeft, setSectionTimeLeft] = useState(() => {
    if (!sectional) return {};
    if (resumeState?.sectionTimeLeft) return { ...resumeState.sectionTimeLeft };
    const init = {};
    sections.forEach(s => { init[s.id] = sectionSecs; });
    return init;
  });
  const [lockedSections, setLockedSections] = useState(
    () => new Set(resumeState?.lockedSections || [])
  );

  // tick down the CURRENT section's own countdown
  useEffect(() => {
    if (!sectional || isPaused) return;
    if (lockedSections.has(currentSec)) return;
    const left = sectionTimeLeft[currentSec];
    if (left == null || left <= 0) return;
    const id = setInterval(() => {
      setSectionTimeLeft(prev => ({ ...prev, [currentSec]: (prev[currentSec] ?? 0) - 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [sectional, isPaused, currentSec, sectionTimeLeft, lockedSections]);

  // when the current section's time hits 0: lock it, jump to the next
  // unlocked section, or auto-submit the whole test if none are left
  useEffect(() => {
    if (!sectional) return;
    const left = sectionTimeLeft[currentSec];
    if (left == null || left > 0 || lockedSections.has(currentSec)) return;

    setLockedSections(prev => new Set(prev).add(currentSec));
    const idx = sections.findIndex(s => s.id === currentSec);
    const nextSec = sections.slice(idx + 1).find(s => s.id !== currentSec && !lockedSections.has(s.id));
    if (nextSec) {
      const firstQIdx = questions.findIndex(q => q.sectionId === nextSec.id);
      if (firstQIdx !== -1) setCurrentQ(firstQIdx);
    } else {
      setAutoSubmit(true);
      setShowSubmit(true);
    }
  }, [sectional, sectionTimeLeft, currentSec, lockedSections, sections, questions]);

  const question = questions[currentQ];

  /* ── PER-QUESTION TIME TRACKING ──────────────────────────────
     Tracks how long the user spends on each question (in seconds)
     so TestResult.jsx can show a per-section time breakdown.
     Paused time is excluded automatically. Resumes from saved totals. */
  const timePerQRef = useRef(resumeState?.timePerQ ? { ...resumeState.timePerQ } : {});
  const lastSwitchRef = useRef(Date.now());

  // every time the question changes (or pause state changes),
  // commit elapsed time to the PREVIOUS question
  useEffect(() => {
    const prevQId = questions[currentQ]?.id; // captured before change via cleanup
    lastSwitchRef.current = Date.now();

    return () => {
      if (isPaused) return; // don't count paused time
      const elapsed = Math.round((Date.now() - lastSwitchRef.current) / 1000);
      if (prevQId) {
        timePerQRef.current[prevQId] = (timePerQRef.current[prevQId] || 0) + elapsed;
      }
    };
  }, [currentQ, isPaused]); // eslint-disable-line

  // mark current question visited
  useEffect(() => {
    if (question) {
      setVisited(prev => new Set(prev).add(question.id));
    }
  }, [question]);

  // sync section tab with current question
  useEffect(() => {
    if (question) setCurrentSec(question.sectionId);
  }, [question]);

  // Theme is applied to <html> by ThemeProvider itself (context/ThemeContext.jsx) —
  // no local effect needed here, and having one caused it to fight with the
  // real theme state (this component used to keep its own separate copy).

  /* ── TIMER ── */
  const handleExpire = useCallback(() => {
    setAutoSubmit(true);
    setShowSubmit(true);
  }, []);
  const timer = useExamTimer(resumeState?.secondsLeft ?? durationSecs, handleExpire, isPaused);

  /* ── ANSWER HANDLERS ── */
  const selectOption = (qId, optIdx) => {
    if (isReview) return; // read-only in review mode
    if (sectional && lockedSections.has(question.sectionId)) return; // section time expired — read-only
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const clearResponse = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  };

  const toggleMark = () => {
    setMarked(prev => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  };

  /* ── BOOKMARK — save question for later review (separate from "mark for review") ── */
  const toggleBookmark = () => {
    const isAdding = !bookmarked.has(question.id);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (isAdding) next.add(question.id);
      else next.delete(question.id);
      return next;
    });

    setBookmarkToast(isAdding ? "added" : "removed");
    setTimeout(() => setBookmarkToast(null), 1800);

    persistBookmark(question.id, question.text);
  };

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    const target = questions[idx];
    if (sectional && target && lockedSections.has(target.sectionId)) return; // section locked — can't revisit
    setCurrentQ(idx);
  };

  const saveAndNext = () => {
    goToQuestion(currentQ + 1);
  };

  const markAndNext = () => {
    toggleMark();
    goToQuestion(currentQ + 1);
  };

  /* ── PALETTE STATUS ── */
  const getStatus = (q) => {
    if (isReview) {
      const userAns = answers[q.id];
      const correctAns = reviewData?.correctAnswers?.[q.id];
      if (userAns === undefined || userAns === null) return "review-skipped";
      return userAns === correctAns ? "review-correct" : "review-wrong";
    }
    const isAnswered = answers[q.id] !== undefined;
    const isMarked   = marked.has(q.id);
    const isVisited  = visited.has(q.id);
    if (isMarked) return "marked";
    if (isAnswered) return "answered";
    if (isVisited) return "not-answered";
    return "not-visited";
  };

  const STATUS_CLASS = {
    "not-visited":    "st-not-visited",
    "not-answered":   "st-not-answered",
    "answered":       "st-answered",
    "marked":         "st-marked",
    "review-correct": "st-review-correct",
    "review-wrong":   "st-review-wrong",
    "review-skipped": "st-review-skipped",
  };

  /* ── STATS for sidebar + submit modal ── */
  const stats = useMemo(() => {
    const bySection = sections.map(sec => {
      const secQs = questions.filter(q => q.sectionId === sec.id);
      let answered=0, notAnswered=0, markedC=0, notVisited=0;
      secQs.forEach(q => {
        const st = getStatus(q);
        if (st === "answered") answered++;
        else if (st === "not-answered") notAnswered++;
        else if (st === "not-visited") notVisited++;
        if (marked.has(q.id)) markedC++;
      });
      return {
        id: sec.id,
        name: sec.name,
        short: sec.name.split(" ").slice(0,2).join(" "),
        color: sec.color,
        total: secQs.length,
        answered, notAnswered, marked: markedC, notVisited,
      };
    });

    const total = bySection.reduce((acc, s) => ({
      answered:    acc.answered + s.answered,
      notAnswered: acc.notAnswered + s.notAnswered,
      marked:      acc.marked + s.marked,
      notVisited:  acc.notVisited + s.notVisited,
    }), { answered:0, notAnswered:0, marked:0, notVisited:0 });

    return { bySection, total };
  }, [answers, marked, visited, questions, sections]); // eslint-disable-line

  /* ── BUILD PROGRESS PAYLOAD (used by pause & submit) ── */
  const buildPayload = (extra = {}) => {
    // commit time for the currently-open question before snapshotting
    if (!isPaused && question) {
      const elapsed = Math.round((Date.now() - lastSwitchRef.current) / 1000);
      timePerQRef.current[question.id] = (timePerQRef.current[question.id] || 0) + elapsed;
      lastSwitchRef.current = Date.now();
    }

    return {
      answers,
      marked: Array.from(marked),
      bookmarked: Array.from(bookmarked),
      visited: Array.from(visited),
      currentQ,
      timePerQ: { ...timePerQRef.current },
      timeTakenSecs: durationSecs - timer.secondsLeft,
      secondsLeft: timer.secondsLeft,
      autoSubmitted: autoSubmit,
      ...(sectional ? { sectionTimeLeft, lockedSections: Array.from(lockedSections) } : {}),
      ...extra,
    };
  };

  /* ── PAUSE / RESUME ── */
  const handlePause = () => {
    setIsPaused(true);
    onPause?.(buildPayload()); // save progress to backend so user can resume on any device
  };
  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  /* ── FINAL SUBMIT ── */
  const handleFinalSubmit = () => {
    onSubmit?.(buildPayload());
  };

  if (!question) return null;

  const prevLocked = sectional && currentQ > 0 && lockedSections.has(questions[currentQ - 1]?.sectionId);
  const nextLocked = sectional && currentQ < questions.length - 1 && lockedSections.has(questions[currentQ + 1]?.sectionId);

  /* ── PALETTE BODY — shared between desktop sidebar and mobile drawer ── */
  const renderPaletteBody = (closeAfterJump = false) => (
    <>
      <div className="ts-status-grid">
        <div className="ts-status-item">
          <div className="ts-status-box st-not-visited">{stats.total.notVisited}</div>
          Not Visited<span className="ts-status-num">{stats.total.notVisited}</span>
        </div>
        <div className="ts-status-item">
          <div className="ts-status-box st-not-answered">{stats.total.notAnswered}</div>
          Not Ans.<span className="ts-status-num">{stats.total.notAnswered}</span>
        </div>
        <div className="ts-status-item">
          <div className="ts-status-box st-answered">{stats.total.answered}</div>
          Answered<span className="ts-status-num">{stats.total.answered}</span>
        </div>
        <div className="ts-status-item">
          <div className="ts-status-box st-marked">{stats.total.marked}</div>
          Marked<span className="ts-status-num">{stats.total.marked}</span>
        </div>
      </div>

      {sections.map(sec => (
        <div key={sec.id}>
          <div className="ts-palette-section-label">
            <span className="ts-section-dot" style={{ background: sec.color }}/>
            {sec.name}
          </div>
          <div className="ts-palette-grid">
            {questions.filter(q => q.sectionId === sec.id).map(q => {
              const status = getStatus(q);
              const isCurrent = q.id === question.id;
              const showDot = status === "marked" && answers[q.id] !== undefined;
              const isBookmarked = bookmarked.has(q.id);
              const isLocked = sectional && lockedSections.has(q.sectionId);
              return (
                <button
                  key={q.id}
                  className={`ts-palette-btn ${STATUS_CLASS[status]}${isCurrent?" current":""}`}
                  disabled={isLocked}
                  title={isLocked ? "Section time expired — locked" : undefined}
                  onClick={() => {
                    if (isLocked) return;
                    goToQuestion(questions.findIndex(x=>x.id===q.id));
                    if (closeAfterJump) setShowPaletteDrawer(false);
                  }}
                  style={{
                    ...(isBookmarked ? { boxShadow: `${isCurrent ? "0 0 0 2px var(--bg2), 0 0 0 4px var(--f), " : ""}inset 0 0 0 2px var(--amber)` } : {}),
                    ...(isLocked ? { opacity: .4, cursor: "not-allowed" } : {}),
                  }}
                >
                  {isLocked ? "🔒" : q.number}
                  {showDot && !isLocked && <span className="ts-palette-dot"/>}
                  {isBookmarked && !isLocked && <span style={{ position:"absolute", top:-4, left:-4, fontSize:9 }}>🔖</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="ts-page" data-theme={theme}>

      {/* ── TOP BAR ── */}
      <div className="ts-topbar">
        <div className="ts-brand">
          <span className="ts-brand-icon">SPEEDMOCK</span>
          <span className="ts-exam-name">{test?.testName || "Mock Test"}</span>
        </div>

        {isReview ? (
          <div className="ts-review-badge">📋 Review Mode</div>
        ) : (
          <>
            <div className={`ts-timer ${timer.isDanger ? "danger" : timer.isWarning ? "warn" : ""}`}>
              <span className="ts-timer-icon">⏱️</span>
              <span className="ts-timer-val">{timer.display}</span>
              <span className="ts-timer-lbl">left</span>
            </div>
            {sectional && (() => {
              const left = sectionTimeLeft[currentSec] ?? 0;
              const danger = left <= 60, warn = left <= 300 && left > 60;
              const m = Math.floor(left / 60), s = left % 60;
              return (
                <div className={`ts-timer ${danger ? "danger" : warn ? "warn" : ""}`} title="Time left in this section">
                  <span className="ts-timer-icon">📂</span>
                  <span className="ts-timer-val">{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
                  <span className="ts-timer-lbl">section</span>
                </div>
              );
            })()}
          </>
        )}

        <div className="ts-top-actions">
          {!isReview && (
            <button className="ts-jump-topbar-btn" onClick={() => setShowPaletteDrawer(true)}>
              🧭 <span className="ts-jump-topbar-count">{question.number}/{questions.length}</span>
            </button>
          )}
          <div className="ts-lang-pill">
            <button className={`ts-lang-btn${language==="en"?" active":""}`} onClick={()=>handleLangSwitch("en")}>EN</button>
            <button className={`ts-lang-btn${language==="hi"?" active":""}`} onClick={()=>handleLangSwitch("hi")}>हि</button>
          </div>
          <div className="ts-icon-btn" title={theme==="dark"?"Switch to light":"Switch to dark"}
            onClick={toggleTheme}>
            {theme === "dark" ? "🌙" : "☀️"}
          </div>
          <div className="ts-icon-btn" title="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}>⛶</div>
          {!isReview && (
            <button className="ts-btn ts-btn-clear" style={{ padding: "8px 16px" }} onClick={handlePause}>
              ⏸ Pause
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION TABS ── */}
      <div className="ts-section-tabs">
        {sections.map(sec => {
          const secStats = stats.bySection.find(s => s.id === sec.id);
          const isLocked = sectional && lockedSections.has(sec.id);
          return (
            <div
              key={sec.id}
              className={`ts-section-tab${currentSec===sec.id?" active":""}${isLocked?" locked":""}`}
              style={isLocked ? { opacity: .45, cursor: "not-allowed" } : undefined}
              title={isLocked ? "Section time expired — locked" : undefined}
              onClick={() => {
                if (isLocked) return;
                const firstQ = questions.findIndex(q => q.sectionId === sec.id);
                if (firstQ !== -1) goToQuestion(firstQ);
              }}
            >
              <span className="ts-section-dot" style={{ background: sec.color }}/>
              {sec.name}
              {isLocked && <span style={{ marginLeft: 4 }}>🔒</span>}
              <span className="ts-section-count">{secStats?.answered || 0}/{secStats?.total}</span>
            </div>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div className="ts-body">

        {/* ── MAIN ── */}
        <div className="ts-main">

          <div className="ts-q-header">
            <div className="ts-q-number">
              Q{question.number} <span className="ts-q-of">of {questions.length}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="ts-q-marks">
                <span className="pos">✓ +{marksPerQ}</span>
                <span className="neg">✕ -{negMark}</span>
              </div>
              <button
                className={`ts-bookmark-btn${bookmarked.has(question.id) ? " active" : ""}`}
                onClick={toggleBookmark}
                title={bookmarked.has(question.id) ? "Remove bookmark" : "Bookmark this question"}
              >
                {bookmarked.has(question.id) ? "🔖" : "🏷️"}
              </button>
            </div>
          </div>

          <div className="ts-q-card">
            <QuestionContent question={question} onZoom={setLightboxSrc} />

            <div className="ts-options">
              {question.options.map((opt, i) => {
                const userAns    = answers[question.id];
                const correctAns = reviewData?.correctAnswers?.[question.id];
                let reviewClass = "";
                if (isReview) {
                  if (i === correctAns) reviewClass = "review-correct";
                  else if (i === userAns && i !== correctAns) reviewClass = "review-wrong";
                  else reviewClass = "review-neutral";
                }
                return (
                  <div
                    key={i}
                    className={`ts-option${!isReview && answers[question.id]===i ? " selected":""} ${reviewClass}`}
                    onClick={() => selectOption(question.id, i)}
                  >
                    <div className="ts-option-radio"><div className="ts-option-radio-fill"/></div>
                    <div className="ts-option-label">({String.fromCharCode(65+i)})</div>
                    <OptionContent option={opt} onZoom={setLightboxSrc} />
                    {isReview && i === correctAns && (
                      <span className="ts-option-result" style={{ color: "var(--green)" }}>✓ Correct</span>
                    )}
                    {isReview && i === userAns && i !== correctAns && (
                      <span className="ts-option-result" style={{ color: "var(--red)" }}>✗ Your answer</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation — always visible in review mode */}
            {isReview && question.explanation && (
              <div className="ts-explanation">
                <div className="ts-explanation-label">Explanation</div>
                <div className="ts-explanation-text">{question.explanation}</div>
              </div>
            )}
          </div>

          {/* ── ACTION BAR ── */}
          {isReview ? (
            <div className="ts-review-nav">
              <button className="ts-back-link" onClick={onBack}>← Back to History</button>
              <div style={{ display:"flex", gap:10 }}>
                <button className="ts-btn ts-btn-nav" disabled={currentQ===0} onClick={()=>goToQuestion(currentQ-1)}>← Previous</button>
                <button className="ts-btn ts-btn-nav" disabled={currentQ===questions.length-1} onClick={()=>goToQuestion(currentQ+1)}>Next →</button>
              </div>
            </div>
          ) : (
            <div className="ts-actions">
              <div className="ts-actions-left">
                <button className="ts-btn ts-btn-clear" onClick={clearResponse}>✕ Clear Response</button>
                <button className="ts-btn ts-btn-mark" onClick={markAndNext}>
                  {marked.has(question.id) ? "🔖 Unmark" : "🔖 Mark for Review"} & Next
                </button>
              </div>
              <div className="ts-actions-right">
                <button className="ts-btn ts-btn-nav" disabled={currentQ===0 || prevLocked} onClick={()=>goToQuestion(currentQ-1)}>← Previous</button>
                {currentQ < questions.length - 1 ? (
                  <button className="ts-btn ts-btn-save" disabled={nextLocked} onClick={saveAndNext}>Save & Next →</button>
                ) : (
                  <button className="ts-btn ts-btn-save" onClick={() => setShowSubmit(true)}>Save & Finish 🏁</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="ts-sidebar">

          {/* candidate */}
          <div className="ts-side-section">
            <div className="ts-candidate">
              <div className="ts-avatar">{candidate.name?.[0] || "S"}</div>
              <div>
                <div className="ts-candidate-name">{candidate.name}</div>
                <div className="ts-candidate-id">{candidate.id}</div>
              </div>
            </div>
          </div>

          {/* status summary + palette */}
          <div className="ts-side-section" style={{ flex: 1 }}>
            <div className="ts-side-title">Question Palette</div>
            {renderPaletteBody(false)}
          </div>

          {/* submit / back */}
          <div className="ts-side-section">
            {isReview ? (
              <button className="ts-submit-btn" onClick={onBack}>
                ← Back to History
              </button>
            ) : (
              <button className="ts-submit-btn" onClick={() => setShowSubmit(true)}>
                📤 Submit Test
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE: question palette bottom-sheet drawer ── */}
      <div className={`ts-drawer-overlay${showPaletteDrawer ? " open" : ""}`} onClick={() => setShowPaletteDrawer(false)} />
      <div className={`ts-drawer${showPaletteDrawer ? " open" : ""}`}>
        <div className="ts-drawer-handle" />
        <div className="ts-drawer-head">
          <div className="ts-drawer-title">📋 Question Palette</div>
          <div className="ts-drawer-close" onClick={() => setShowPaletteDrawer(false)}>✕</div>
        </div>
        <div className="ts-drawer-body">
          {renderPaletteBody(true)}
        </div>
      </div>

      {/* ── LIGHTBOX (image zoom) ── */}
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {/* ── BOOKMARK TOAST ── */}
      {bookmarkToast && (
        <div className="ts-bookmark-toast">
          {bookmarkToast === "added" ? "🔖 Question bookmarked for review" : "Bookmark removed"}
        </div>
      )}

      {/* ── PAUSE OVERLAY ── */}
      {isPaused && (
        <div className="ts-pause-overlay">
          <div className="ts-pause-card">
            <div className="ts-pause-icon">⏸️</div>
            <div className="ts-pause-title">TEST PAUSED</div>
            <div className="ts-pause-sub">
              Your progress is saved. The timer has stopped —
              resume whenever you're ready to continue.
            </div>
            <div className="ts-pause-time">⏱️ {timer.display} remaining</div>
            <div className="ts-pause-btns">
              <button className="ts-btn ts-btn-save" onClick={handleResume}>
                ▶ Resume Test
              </button>
              <button className="ts-btn ts-btn-clear" onClick={() => setShowSubmit(true)}>
                📤 Submit Now Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT MODAL ── */}
      {showSubmit && (
        <SubmitModal
          stats={stats}
          autoSubmit={autoSubmit}
          onCancel={() => setShowSubmit(false)}
          onConfirm={handleFinalSubmit}
        />
      )}
    </div>
  );
}
