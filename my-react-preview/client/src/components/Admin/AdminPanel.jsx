import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "../../services/apiFetch"; // ← adjust path to match your project structure
import AdminOverview from "./AdminOverview";
import AdminTests from "./AdminTest";
import AdminQuestions from "./AdminQuestion";
import AdminBulkUpload from "./AdminBulkupload";
import AdminPracticeBank from "./AdminPracticeBank";
import AdminTypingPassages from "./AdminTypingPassages";

/* ════════════════════════════════════════════════════════════════
   CSS — shared by every admin sub-page (tabs, tables, modals, forms)
════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.adm-root{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0;min-height:100vh}
:root{--bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--bg4:#21212e;--b:#1e1e2c;
--f:#e91e8c;--fl:#ff3aaa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--blue:#0ea5e9;--purple:#a855f7;
--t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50}

@keyframes adm-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes adm-spin{to{transform:rotate(360deg)}}
@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:.5}}

.adm-page{padding-bottom:60px}

/* ── HEADER ── */
.adm-header{padding:28px 36px 0;animation:adm-rise .3s ease both}
.adm-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--f);
display:flex;align-items:center;gap:7px;margin-bottom:6px}
.adm-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:adm-pulse 2s infinite}
.adm-h1{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:3px;color:var(--t);line-height:1}
.adm-sub{font-size:12.5px;color:var(--m);margin-top:6px}

/* ── TABS ── */
.adm-tabs{display:flex;gap:4px;margin-top:22px;border-bottom:1px solid var(--b);padding:0 36px}
.adm-tab{
  padding:11px 18px;border:none;background:transparent;color:var(--m);font-size:13px;font-weight:600;
  cursor:pointer;font-family:'Outfit',sans-serif;position:relative;display:flex;align-items:center;gap:7px;
}
.adm-tab:hover{color:var(--t)}
.adm-tab.active{color:var(--t)}
.adm-tab.active::after{content:'';position:absolute;bottom:-1px;left:6px;right:6px;height:2px;
background:linear-gradient(90deg,var(--f),var(--fl));border-radius:2px}

.adm-body{padding:26px 36px}
.adm-section{animation:adm-rise .35s ease both}

/* ── STAT CARDS ── */
.adm-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
.adm-stat-card{background:var(--bg2);border:1px solid var(--b);border-radius:14px;padding:20px;
transition:transform .2s,border-color .2s}
.adm-stat-card:hover{transform:translateY(-2px);border-color:rgba(233,30,140,.25)}
.adm-stat-icon{font-size:20px;margin-bottom:8px}
.adm-stat-val{font-family:'Bebas Neue',sans-serif;font-size:2.1rem;color:var(--f);line-height:1}
.adm-stat-lbl{font-size:10px;color:var(--m);text-transform:uppercase;letter-spacing:1px;margin-top:5px}

/* ── TOOLBAR ── */
.adm-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap}
.adm-search{
  flex:1;min-width:200px;background:var(--bg2);border:1px solid var(--b);border-radius:10px;
  padding:9px 14px;color:var(--t);font-size:13px;font-family:'Outfit',sans-serif;
}
.adm-search:focus{outline:none;border-color:rgba(233,30,140,.4)}
.adm-select{
  background:var(--bg2);border:1px solid var(--b);border-radius:10px;padding:9px 12px;
  color:var(--t);font-size:12.5px;font-family:'Outfit',sans-serif;cursor:pointer;
}
.adm-select:focus{outline:none;border-color:rgba(233,30,140,.4)}
.adm-btn{
  padding:9px 18px;border-radius:10px;border:none;font-size:12.5px;font-weight:700;
  cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;white-space:nowrap;
  display:inline-flex;align-items:center;gap:7px;
}
.adm-btn-primary{background:linear-gradient(135deg,var(--f),var(--fl));color:#fff;box-shadow:0 4px 14px rgba(233,30,140,.25)}
.adm-btn-primary:hover{box-shadow:0 6px 20px rgba(233,30,140,.4);transform:translateY(-1px)}
.adm-btn-primary:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;transform:none}
.adm-btn-ghost{background:var(--bg3);color:var(--t);border:1px solid var(--b)}
.adm-btn-ghost:hover{border-color:rgba(233,30,140,.3)}
.adm-btn-danger{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.adm-btn-danger:hover{background:rgba(239,68,68,.18)}
.adm-btn-sm{padding:6px 12px;font-size:11.5px}

/* ── TABLE ── */
.adm-table-wrap{background:var(--bg2);border:1px solid var(--b);border-radius:14px;overflow:hidden}
.adm-table{width:100%;border-collapse:collapse}
.adm-table th{
  text-align:left;font-size:9.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;
  color:var(--m);padding:12px 16px;background:var(--bg3);border-bottom:1px solid var(--b);
}
.adm-table td{padding:12px 16px;font-size:12.5px;color:var(--t);border-bottom:1px solid var(--b)}
.adm-table tr:last-child td{border-bottom:none}
.adm-table tr.clickable{cursor:pointer;transition:background .15s}
.adm-table tr.clickable:hover{background:var(--bg3)}
.adm-mono{font-family:'DM Mono',monospace;color:var(--m)}
.adm-badge{
  display:inline-flex;align-items:center;gap:4px;font-size:9.5px;font-weight:700;letter-spacing:.5px;
  text-transform:uppercase;padding:3px 9px;border-radius:100px;
}
.adm-badge.green{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.2)}
.adm-badge.amber{background:rgba(245,158,11,.1);color:var(--amber);border:1px solid rgba(245,158,11,.2)}
.adm-badge.purple{background:rgba(168,85,247,.1);color:var(--purple);border:1px solid rgba(168,85,247,.2)}
.adm-badge.grey{background:rgba(255,255,255,.05);color:var(--m);border:1px solid var(--b)}
.adm-row-actions{display:flex;gap:6px;justify-content:flex-end}

.adm-empty{padding:60px 20px;text-align:center;color:var(--m)}
.adm-empty-icon{font-size:32px;margin-bottom:12px;opacity:.5}
.adm-empty-title{font-size:14px;font-weight:700;color:var(--t);margin-bottom:4px}
.adm-empty-sub{font-size:12px;color:var(--m)}

.adm-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:60px;color:var(--m);font-size:13px}
.adm-spinner{width:18px;height:18px;border:2px solid var(--b);border-top-color:var(--f);border-radius:50%;animation:adm-spin .7s linear infinite}

.adm-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
border-top:1px solid var(--b);font-size:12px;color:var(--m)}

/* ── MODAL ── */
.adm-modal-overlay{
  position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.65);backdrop-filter:blur(3px);
  display:flex;align-items:center;justify-content:center;padding:20px;
  opacity:0;pointer-events:none;transition:opacity .2s;
}
.adm-modal-overlay.open{opacity:1;pointer-events:all}
.adm-modal{
  background:var(--bg2);border:1px solid var(--b);border-radius:18px;
  width:100%;max-width:560px;max-height:88vh;display:flex;flex-direction:column;
  transform:scale(.97);transition:transform .2s;box-shadow:0 24px 70px rgba(0,0,0,.5);
}
.adm-modal-overlay.open .adm-modal{transform:scale(1)}
.adm-modal.wide{max-width:760px}
.adm-modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;
border-bottom:1px solid var(--b);flex-shrink:0}
.adm-modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:1.5px;color:var(--t)}
.adm-modal-close{width:30px;height:30px;border-radius:8px;background:var(--bg3);border:1px solid var(--b);
color:var(--m);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px}
.adm-modal-close:hover{color:var(--t);border-color:rgba(233,30,140,.3)}
.adm-modal-body{flex:1;overflow-y:auto;padding:20px 22px}
.adm-modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--b);flex-shrink:0}

/* ── FORM ── */
.adm-field{margin-bottom:16px}
.adm-label{font-size:11px;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.8px;
margin-bottom:7px;display:block}
.adm-input,.adm-textarea{
  width:100%;background:var(--bg3);border:1px solid var(--b);border-radius:9px;padding:10px 13px;
  color:var(--t);font-size:13px;font-family:'Outfit',sans-serif;
}
.adm-input:focus,.adm-textarea:focus{outline:none;border-color:rgba(233,30,140,.4)}
.adm-textarea{resize:vertical;min-height:70px;font-family:'DM Mono',monospace;font-size:12.5px;line-height:1.6}
.adm-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.adm-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.adm-hint{font-size:10.5px;color:var(--m2);margin-top:5px;line-height:1.5}
.adm-error-text{font-size:11px;color:var(--red);margin-top:5px}

/* ── OPTIONS EDITOR (question form) ── */
.adm-option-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.adm-option-radio{
  width:22px;height:22px;border-radius:50%;border:2px solid var(--b);flex-shrink:0;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .15s;
}
.adm-option-radio.selected{border-color:var(--green);background:rgba(34,197,94,.12)}
.adm-option-radio.selected::after{content:'';width:9px;height:9px;border-radius:50%;background:var(--green)}
.adm-option-input{flex:1}
.adm-option-remove{
  width:26px;height:26px;border-radius:7px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
  color:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;flex-shrink:0;
}

/* ── CONFIRM DIALOG ── */
.adm-confirm-icon{font-size:30px;text-align:center;margin-bottom:10px}
.adm-confirm-text{font-size:13px;color:var(--m);text-align:center;line-height:1.6}
.adm-confirm-text strong{color:var(--t)}

/* ── TOAST ── */
.adm-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2100;
  background:var(--bg3);border:1px solid var(--b);border-radius:11px;padding:12px 20px;
  font-size:12.5px;color:var(--t);display:flex;align-items:center;gap:9px;
  box-shadow:0 10px 32px rgba(0,0,0,.4);animation:adm-rise .25s ease both;
}
.adm-toast.success{border-color:rgba(34,197,94,.3)}
.adm-toast.error{border-color:rgba(239,68,68,.3)}

@media(max-width:900px){
  .adm-stats-grid{grid-template-columns:1fr 1fr}
  .adm-row-2,.adm-row-3{grid-template-columns:1fr}
}
@media(max-width:680px){
  .adm-header,.adm-tabs,.adm-body{padding-left:18px;padding-right:18px}
  .adm-stats-grid{grid-template-columns:1fr}
  .adm-table-wrap{overflow-x:auto}
}
`;

const inject = () => {
  if (document.getElementById("adm-css")) return;
  const s = document.createElement("style");
  s.id = "adm-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ════════════════════════════════════════════════════════════════
   SHARED PIECES — exported so the 4 sub-pages can reuse them
════════════════════════════════════════════════════════════════ */
export function AdminModal({ open, onClose, title, children, footer, wide = false }) {
  if (!open) return null;
  // Rendered via portal directly into document.body — NOT inside .adm-section.
  // .adm-section has `animation: adm-rise .35s ease both`, which animates
  // `transform`. Any ancestor with a transform-animation (even one that
  // ends at `transform:none` via fill-mode `both`) becomes the containing
  // block for `position:fixed` descendants — so without the portal, this
  // overlay was being sized/positioned relative to .adm-section's full
  // scrollable height instead of the real viewport, making it invisible
  // and unclickable in the right place.
  return createPortal(
    <div className={`adm-modal-overlay${open ? " open" : ""}`} onClick={onClose}>
      <div className={`adm-modal${wide ? " wide" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-head">
          <div className="adm-modal-title">{title}</div>
          <div className="adm-modal-close" onClick={onClose}>✕</div>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirming }) {
  return (
    <AdminModal
      open={open} onClose={onClose} title={title}
      footer={<>
        <button className="adm-btn adm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="adm-btn adm-btn-danger" onClick={onConfirm} disabled={confirming}>
          {confirming ? "Deleting..." : "🗑️ Delete"}
        </button>
      </>}
    >
      <div className="adm-confirm-icon">⚠️</div>
      <div className="adm-confirm-text">{message}</div>
    </AdminModal>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`adm-toast ${toast.type}`}>
      <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
      {toast.message}
    </div>
  );
}

/** Hook: a small toast helper shared across all admin tabs */
export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

const EXAM_OPTIONS = [
  { id: "cgl", label: "SSC CGL" }, { id: "cpo", label: "SSC CPO" },
  { id: "mts", label: "SSC MTS" }, { id: "chsl", label: "SSC CHSL" },
  { id: "gd", label: "SSC GD" }, { id: "ntpc", label: "Railway NTPC" },
  { id: "alp", label: "Railway ALP" }, { id: "je", label: "Railway JE" },
  { id: "groupd", label: "Railway Group D" },
];

const TEST_TYPE_OPTIONS = [
  { id: "pyq", label: "PYQ Paper" }, { id: "mock", label: "Mock Test" },
  { id: "subject", label: "Subject-wise" }, { id: "topic", label: "Topic-wise" },
  { id: "syllabus", label: "New Syllabus" },
];

export { EXAM_OPTIONS, TEST_TYPE_OPTIONS };

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "tests", label: "Tests", icon: "📝" },
  { id: "questions", label: "Test Questions", icon: "❓" },
  { id: "bulk", label: "Test Bulk Upload", icon: "📤" },
  { id: "practice", label: "Practice Bank", icon: "🗂️" },
  { id: "typing", label: "Typing Passages", icon: "⌨️" },
];

/**
 * AdminPanel — gate this route behind an admin check in your router,
 * e.g. only render it if user.isAdmin is true (mirror the backend's
 * profiles.is_admin check), and redirect everyone else.
 */
export default function AdminPanel() {
  useEffect(() => { inject(); }, []);

  const [tab, setTab] = useState("overview");
  const [focusTestId, setFocusTestId] = useState(null); // set when "View Questions" is clicked from Tests tab

  return (
    <div className="adm-root">
      <div className="adm-page">
        <div className="adm-header">
          <div className="adm-eyebrow"><span className="adm-dot"/>Admin Panel</div>
          <h1 className="adm-h1">Content Management</h1>
          <div className="adm-sub">Manage exams, tests &amp; the question bank</div>
        </div>

        <div className="adm-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`adm-tab${tab===t.id?" active":""}`}
              onClick={() => setTab(t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="adm-body">
          <div className="adm-section">
            {tab === "overview" && <AdminOverview onJumpToQuestions={(testId) => { setFocusTestId(testId); setTab("questions"); }} />}
            {tab === "tests" && <AdminTests onViewQuestions={(testId) => { setFocusTestId(testId); setTab("questions"); }} />}
            {tab === "questions" && <AdminQuestions initialTest={focusTestId} />}
            {tab === "bulk" && <AdminBulkUpload />}
            {tab === "practice" && <AdminPracticeBank />}
            {tab === "typing" && <AdminTypingPassages />}
          </div>
        </div>
      </div>
    </div>
  );
}
