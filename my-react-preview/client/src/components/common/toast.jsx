/**
 * Toast.jsx
 * ─────────────────────────────────────────────────────────────────
 * Global toast notification system for SpeedMock.
 *
 * Setup — wrap your app ONCE in App.jsx:
 *   import { ToastProvider } from "../common/Toast";
 *   <ToastProvider><App /></ToastProvider>
 *
 * Use anywhere in any component:
 *   import { useToast } from "../common/Toast";
 *   const toast = useToast();
 *
 *   toast.success("Question bookmarked!")
 *   toast.error("Payment failed. Try again.")
 *   toast.warning("Subscription expires in 3 days")
 *   toast.info("OTP sent to your number")
 *
 * Options:
 *   toast.success("Message", { duration: 5000, position: "top" })
 *
 * Used in:
 *   - Bookmark added/removed
 *   - OTP sent confirmation
 *   - Test submitted
 *   - Payment success/fail
 *   - Goal updated
 *   - Subscription expiry warning
 *   - Copy to clipboard
 *   - Network errors
 * ─────────────────────────────────────────────────────────────────
 */

import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef,
} from "react";
import { createPortal } from "react-dom";

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
.tst-container {
  position: fixed; z-index: 1100;
  display: flex; flex-direction: column; gap: 10px;
  pointer-events: none;
  padding: 16px;
}
.tst-container.pos-bottom-right {
  bottom: 0; right: 0; align-items: flex-end;
}
.tst-container.pos-bottom-left  {
  bottom: 0; left: 0; align-items: flex-start;
}
.tst-container.pos-top-right    {
  top: 0; right: 0; align-items: flex-end;
}
.tst-container.pos-top-center   {
  top: 0; left: 50%; transform: translateX(-50%);
  align-items: center;
}

/* ── TOAST CARD ── */
.tst-card {
  pointer-events: all;
  display: flex; align-items: flex-start; gap: 11px;
  padding: 13px 14px 10px;
  border-radius: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6),
              0 0 0 1px rgba(255,255,255,0.03);
  min-width: 280px; max-width: 380px;
  position: relative; overflow: hidden;
  animation: tst-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
  font-family: 'DM Sans', sans-serif;
}
.tst-card.exiting {
  animation: tst-out 0.25s ease both;
}
@keyframes tst-in {
  from { opacity:0; transform: translateX(24px) scale(0.94); }
  to   { opacity:1; transform: translateX(0)     scale(1);   }
}
@keyframes tst-out {
  from { opacity:1; transform: translateX(0) scale(1);    max-height:200px; margin-bottom:0; }
  to   { opacity:0; transform: translateX(24px) scale(0.94); max-height:0; margin-bottom:-10px; }
}

/* left accent bar */
.tst-card::before {
  content: '';
  position: absolute; top:0; left:0; bottom:0;
  width: 3px; border-radius: 12px 0 0 12px;
}
.tst-success::before { background: #22c55e; }
.tst-error::before   { background: #ef4444; }
.tst-warning::before { background: #f59e0b; }
.tst-info::before    { background: #d946ef; }

/* icon */
.tst-icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0; margin-top: 1px;
}
.tst-success .tst-icon { background: rgba(34,197,94,0.12);  }
.tst-error   .tst-icon { background: rgba(239,68,68,0.12);  }
.tst-warning .tst-icon { background: rgba(245,158,11,0.12); }
.tst-info    .tst-icon { background: rgba(217,70,239,0.12); }

/* text */
.tst-body { flex: 1; min-width: 0; }
.tst-title {
  font-size: 13px; font-weight: 700; color: #f0f0f0;
  line-height: 1.3; margin-bottom: 2px;
}
.tst-msg {
  font-size: 12px; color: #888; line-height: 1.5;
}

/* close button */
.tst-close {
  background: none; border: none; color: #444;
  font-size: 14px; cursor: pointer; padding: 2px;
  transition: color 0.2s; flex-shrink: 0; margin-top: 1px;
  line-height: 1;
}
.tst-close:hover { color: #f0f0f0; }

/* progress bar */
.tst-progress {
  position: absolute; bottom: 0; left: 0;
  height: 2px; border-radius: 0 0 12px 12px;
  animation: tst-progress var(--dur) linear forwards;
  transform-origin: left;
}
.tst-success .tst-progress { background: #22c55e; }
.tst-error   .tst-progress { background: #ef4444; }
.tst-warning .tst-progress { background: #f59e0b; }
.tst-info    .tst-progress { background: #d946ef; }
@keyframes tst-progress {
  from { width: 100%; }
  to   { width: 0%;   }
}
`;

// ─── TOAST CONFIG ─────────────────────────────────────────────────
const CONFIG = {
  success: { icon: "✅", title: "Success"  },
  error:   { icon: "❌", title: "Error"    },
  warning: { icon: "⚠️", title: "Warning"  },
  info:    { icon: "💬", title: "Info"     },
};

let _id = 0;
const genId = () => `tst-${++_id}`;

// ─── CONTEXT ──────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── SINGLE TOAST ─────────────────────────────────────────────────
function ToastCard({ id, type, title, message, duration, onRemove }) {
  const [exiting, setExiting] = useState(false);

  const close = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 260);
  }, [id, onRemove]);

  useEffect(() => {
    const t = setTimeout(close, duration);
    return () => clearTimeout(t);
  }, [close, duration]);

  const cfg = CONFIG[type] || CONFIG.info;

  return (
    <div
      className={`tst-card tst-${type}${exiting ? " exiting" : ""}`}
      style={{ "--dur": `${duration}ms` }}
      role="alert"
    >
      <div className="tst-icon">{cfg.icon}</div>
      <div className="tst-body">
        <div className="tst-title">{title || cfg.title}</div>
        {message && <div className="tst-msg">{message}</div>}
      </div>
      <button className="tst-close" onClick={close} aria-label="Dismiss">✕</button>
      <div className="tst-progress" />
    </div>
  );
}

// ─── PROVIDER ─────────────────────────────────────────────────────
export function ToastProvider({ children, position = "bottom-right", maxToasts = 5 }) {
  const [toasts, setToasts] = useState([]);
  const styleRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("tst-css")) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "tst-css";
      styleRef.current.textContent = CSS;
      document.head.appendChild(styleRef.current);
    }
    return () => styleRef.current?.remove();
  }, []);

  const add = useCallback((type, titleOrMsg, options = {}) => {
    const isObj  = typeof titleOrMsg === "object";
    const title  = isObj ? titleOrMsg.title   : titleOrMsg;
    const message= isObj ? titleOrMsg.message : options.message;
    const duration = options.duration || 3800;
    const id = genId();

    setToasts(prev => {
      const next = [...prev, { id, type, title, message, duration }];
      return next.slice(-maxToasts);
    });
    return id;
  }, [maxToasts]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const api = {
    success: (t, o) => add("success", t, o),
    error:   (t, o) => add("error",   t, o),
    warning: (t, o) => add("warning", t, o),
    info:    (t, o) => add("info",    t, o),
    dismiss: remove,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className={`tst-container pos-${position}`} aria-live="polite">
          {toasts.map(t => (
            <ToastCard key={t.id} {...t} onRemove={remove} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── DEFAULT EXPORT (the provider) ───────────────────────────────
export default ToastProvider;
