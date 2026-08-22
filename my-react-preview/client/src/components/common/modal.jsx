/**
 * Modal.jsx
 * ─────────────────────────────────────────────────────────────────
 * Reusable popup dialog for SpeedMock.
 *
 * Usage:
 *   import Modal from "../common/Modal";
 *
 *   <Modal
 *     isOpen  = {true}
 *     onClose = {() => setOpen(false)}
 *     title   = "Submit Test?"
 *     size    = "md"          // "sm" | "md" | "lg" | "full"
 *     variant = "default"     // "default" | "danger" | "success"
 *   >
 *     <p>Your modal content here</p>
 *   </Modal>
 *
 * Used in:
 *   - Confirm test submit
 *   - Quit test warning
 *   - Upgrade plan
 *   - Exam picker
 *   - Daily goal setter
 *   - Payment success / failure
 *   - Session expired
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
/* ── OVERLAY ── */
.mdl-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: mdl-overlay-in 0.2s ease both;
}
.mdl-overlay.closing {
  animation: mdl-overlay-out 0.2s ease both;
}
@keyframes mdl-overlay-in  {
  from { opacity:0 }
  to   { opacity:1 }
}
@keyframes mdl-overlay-out {
  from { opacity:1 }
  to   { opacity:0 }
}

/* ── PANEL ── */
.mdl-panel {
  position: relative;
  background: #161616;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 40px);
  width: 100%;
  box-shadow: 0 32px 80px rgba(0,0,0,0.8),
              0 0 0 1px rgba(217,70,239,0.06);
  animation: mdl-panel-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
}
.mdl-panel.closing {
  animation: mdl-panel-out 0.18s ease both;
}
@keyframes mdl-panel-in {
  from { opacity:0; transform: scale(0.92) translateY(16px); }
  to   { opacity:1; transform: scale(1)    translateY(0);    }
}
@keyframes mdl-panel-out {
  from { opacity:1; transform: scale(1)    translateY(0);    }
  to   { opacity:0; transform: scale(0.94) translateY(8px);  }
}

/* sizes */
.mdl-sm   { max-width: 380px; }
.mdl-md   { max-width: 520px; }
.mdl-lg   { max-width: 720px; }
.mdl-full { max-width: 100%; height: calc(100vh - 40px); }

/* variants — top accent line */
.mdl-panel::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px; border-radius: 18px 18px 0 0;
}
.mdl-default::before { background: linear-gradient(90deg,#d946ef,#a21caf); }
.mdl-danger::before  { background: linear-gradient(90deg,#ef4444,#b91c1c); }
.mdl-success::before { background: linear-gradient(90deg,#22c55e,#15803d); }

/* ── HEADER ── */
.mdl-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; padding: 22px 24px 16px; flex-shrink: 0;
}
.mdl-header-left { display: flex; align-items: center; gap: 12px; }
.mdl-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.mdl-icon-default { background: rgba(217,70,239,0.12); }
.mdl-icon-danger  { background: rgba(239,68,68,0.12);  }
.mdl-icon-success { background: rgba(34,197,94,0.12);  }
.mdl-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 17px; font-weight: 700;
  color: #f0f0f0; line-height: 1.3;
}
.mdl-subtitle {
  font-size: 12px; color: #666;
  margin-top: 3px; line-height: 1.5;
  font-family: 'DM Sans', sans-serif;
}
.mdl-close {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: #666; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.mdl-close:hover { background: rgba(255,255,255,0.08); color: #f0f0f0; }

/* ── DIVIDER ── */
.mdl-divider { height: 1px; background: rgba(255,255,255,0.06); flex-shrink: 0; }

/* ── BODY ── */
.mdl-body {
  padding: 20px 24px;
  overflow-y: auto; flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: #aaa; line-height: 1.7;
}
.mdl-body::-webkit-scrollbar { width: 4px; }
.mdl-body::-webkit-scrollbar-thumb { background: rgba(217,70,239,0.3); border-radius: 4px; }

/* ── FOOTER ── */
.mdl-footer {
  padding: 16px 24px 22px;
  display: flex; justify-content: flex-end; gap: 10px;
  flex-shrink: 0; flex-wrap: wrap;
}

/* ── PRESET BUTTONS ── */
.mdl-btn {
  padding: 10px 22px; border-radius: 9px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
.mdl-btn-cancel {
  background: transparent; color: #888;
  border: 1px solid rgba(255,255,255,0.08);
}
.mdl-btn-cancel:hover { border-color: rgba(255,255,255,0.18); color: #f0f0f0; }
.mdl-btn-confirm-default {
  background: linear-gradient(135deg,#d946ef,#a21caf);
  color: #fff; border: none;
  box-shadow: 0 4px 14px rgba(217,70,239,0.3);
}
.mdl-btn-confirm-default:hover { opacity:0.9; transform:translateY(-1px); }
.mdl-btn-confirm-danger {
  background: linear-gradient(135deg,#ef4444,#b91c1c);
  color: #fff; border: none;
  box-shadow: 0 4px 14px rgba(239,68,68,0.3);
}
.mdl-btn-confirm-danger:hover { opacity:0.9; transform:translateY(-1px); }
.mdl-btn-confirm-success {
  background: linear-gradient(135deg,#22c55e,#15803d);
  color: #fff; border: none;
  box-shadow: 0 4px 14px rgba(34,197,94,0.3);
}
.mdl-btn-confirm-success:hover { opacity:0.9; transform:translateY(-1px); }
`;

const injectCSS = () => {
  if (document.getElementById("mdl-css")) return;
  const s = document.createElement("style");
  s.id = "mdl-css";
  s.textContent = CSS;
  document.head.appendChild(s);
};

// icon per variant
const ICONS = {
  default: "⚡",
  danger:  "⚠️",
  success: "✅",
};

// ─── COMPONENT ────────────────────────────────────────────────────
/**
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {string}   title
 * @param {string}   subtitle     — small grey text under title
 * @param {string}   icon         — emoji override for header icon
 * @param {"sm"|"md"|"lg"|"full"} size
 * @param {"default"|"danger"|"success"} variant
 * @param {string}   confirmLabel — text for confirm button (null = hide)
 * @param {string}   cancelLabel  — text for cancel button  (null = hide)
 * @param {function} onConfirm    — called on confirm click
 * @param {boolean}  closeOnBackdrop — close when backdrop clicked (default true)
 * @param {node}     children
 */
export default function Modal({
  isOpen          = false,
  onClose,
  title           = "",
  subtitle        = "",
  icon,
  size            = "md",
  variant         = "default",
  confirmLabel    = "Confirm",
  cancelLabel     = "Cancel",
  onConfirm,
  closeOnBackdrop = true,
  children,
}) {
  const panelRef = useRef(null);

  injectCSS();

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
  };

  const displayIcon = icon || ICONS[variant] || "⚡";

  return createPortal(
    <div className="mdl-overlay" onClick={handleBackdrop} role="dialog"
      aria-modal="true" aria-label={title}>
      <div
        ref={panelRef}
        className={`mdl-panel mdl-${size} mdl-${variant}`}
      >
        {/* HEADER */}
        <div className="mdl-header">
          <div className="mdl-header-left">
            <div className={`mdl-icon mdl-icon-${variant}`}>{displayIcon}</div>
            <div>
              <div className="mdl-title">{title}</div>
              {subtitle && <div className="mdl-subtitle">{subtitle}</div>}
            </div>
          </div>
          <button className="mdl-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="mdl-divider" />

        {/* BODY */}
        <div className="mdl-body">{children}</div>

        {/* FOOTER — only if buttons defined */}
        {(cancelLabel || confirmLabel) && (
          <>
            <div className="mdl-divider" />
            <div className="mdl-footer">
              {cancelLabel && (
                <button className="mdl-btn mdl-btn-cancel" onClick={onClose}>
                  {cancelLabel}
                </button>
              )}
              {confirmLabel && (
                <button
                  className={`mdl-btn mdl-btn-confirm-${variant}`}
                  onClick={() => { onConfirm?.(); }}
                >
                  {confirmLabel}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
