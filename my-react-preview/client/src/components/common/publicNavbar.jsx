import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoComponent from "./logo";
import { usePublicTheme, PublicThemeToggle } from "./usePublicTheme";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; }
button { font-family: 'DM Sans', sans-serif; cursor: pointer; }

:root {
  --f: #d946ef;
  --fl: #e879f9;
  --fd: #a21caf;
  --green: #22c55e;
}

/* Light theme (default) — white blended with soft blue */
[data-theme="light"] {
  --t: #0f172a;
  --m: #64748b;
  --b: rgba(217,70,239,0.14);
  --b2: rgba(15,23,42,0.08);
  --nav-bg: rgba(255,255,255,0.85);
  --nav-bg-scrolled: rgba(255,255,255,0.96);
  --nav-border: rgba(148,163,184,0.25);
  --page-bg: linear-gradient(180deg, #ffffff 0%, #eef4ff 45%, #e6f0ff 100%);
}

/* Dark theme (alternate) */
[data-theme="dark"] {
  --t: #f0f0f0;
  --m: #999;
  --b: rgba(217,70,239,0.18);
  --b2: rgba(255,255,255,0.08);
  --nav-bg: transparent;
  --nav-bg-scrolled: rgba(14, 14, 14, 0.96);
  --nav-border: transparent;
  --page-bg: #0a0a0f;
}

/* ═══════════════════════════════════
   OUTER WRAPPER — fixed at top
═══════════════════════════════════ */
.pnb {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 900;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  transition: background 0.4s, border-color 0.4s,
              backdrop-filter 0.4s, box-shadow 0.4s;
}
.pnb.scrolled {
  background: var(--nav-bg-scrolled);
  border-color: var(--b2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.12);
}
[data-theme="dark"] .pnb.scrolled {
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.55);
}

/* ═══════════════════════════════════
   TOP ROW
═══════════════════════════════════ */
.pnb-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* equal side widths so center nav truly centres */
  padding: 0 40px;
  height: 62px;
  gap: 16px;
}

/* ── LOGO (left, fixed width) ── */
.pnb-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 0 0 auto;          /* never shrink, never grow */
  text-decoration: none;
  user-select: none;
}
.pnb-logo svg {
  border-radius: 50%;
  padding: 8px;
  background: rgba(217,70,239,0.08);
  transition: all 0.3s;
}
.pnb-logo:hover svg {
  background: rgba(217,70,239,0.15);
}

.pnb-logo-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px;
  letter-spacing: 3px;
  color: var(--f);
  line-height: 1;
  white-space: nowrap;
  transition: color 0.2s;
}
.pnb-logo:hover .pnb-logo-name { color: var(--fl); }

/* ── CENTER NAV (fills remaining space, centres itself) ── */
.pnb-nav {
  flex: 1;                  /* take all remaining space */
  display: flex;
  align-items: center;
  justify-content: center;  /* truly centred between logo & buttons */
  gap: 4px;
}
.pnb-link {
  position: relative;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--m);
  background: none;
  border: none;
  white-space: nowrap;
  transition: color 0.2s, background 0.2s;
  letter-spacing: 0.15px;
}
.pnb-link:hover {
  color: var(--t);
  background: rgba(255,255,255,0.05);
}
.pnb-link.active { color: var(--t); }
.pnb-link.active::after {
  content: '';
  position: absolute;
  bottom: 4px; left: 50%;
  transform: translateX(-50%);
  width: 20px; height: 2.5px;
  border-radius: 2px;
  background: var(--f);
}

/* ── RIGHT BUTTONS (fixed width, right-aligned) ── */
.pnb-right {
  flex: 0 0 auto;           /* never shrink, never grow */
  display: flex;
  align-items: center;
  gap: 10px;
}

.pnb-login {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  color: var(--t);
  padding: 8px 22px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  letter-spacing: 0.2px;
}
.pnb-login:hover {
  border-color: var(--f);
  color: var(--f);
  background: rgba(217,70,239,0.05);
}

.pnb-signup {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--f), var(--fd));
  color: #fff;
  border: none;
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.3px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(217,70,239,0.3);
}
/* shimmer sweep */
.pnb-signup::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 55%; height: 100%;
  background: linear-gradient(
    90deg, transparent,
    rgba(255,255,255,0.2),
    transparent
  );
  transform: skewX(-20deg);
  transition: left 0.55s ease;
}
.pnb-signup:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 26px rgba(217,70,239,0.48);
}
.pnb-signup:hover::before { left: 160%; }
.pnb-signup:active { transform: translateY(0); }

/* ═══════════════════════════════════
   BADGES ROW (below top row)
═══════════════════════════════════ */
.pnb-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4px 16px 8px;
}
.pnb-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
  line-height: 1.6;
}
.pnb-badge-green {
  background: rgba(34,197,94,0.1);
  color: var(--green);
  border: 1px solid rgba(34,197,94,0.22);
}
.pnb-badge-fuchsia {
  background: rgba(217,70,239,0.1);
  color: var(--fl);
  border: 1px solid rgba(217,70,239,0.22);
}
.pnb-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pnb-sep {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  flex-shrink: 0;
}

/* ═══════════════════════════════════
   RESPONSIVE
═══════════════════════════════════ */

/* tablets: shrink padding & font a little */
@media (max-width: 900px) {
  .pnb-top   { padding: 0 24px; gap: 12px; }
  .pnb-link  { padding: 7px 10px; font-size: 13px; }
  .pnb-login { padding: 7px 16px; font-size: 13px; }
  .pnb-signup{ padding: 8px 16px; font-size: 13px; }
  .pnb-badge { font-size: 10.5px; padding: 3px 10px; }
}

/* small tablets: hide center nav, keep logo + buttons */
@media (max-width: 680px) {
  .pnb-nav { display: none; }
  .pnb-top { padding: 0 18px; }
  .pnb-login { display: none; }
  .pnb-badges { flex-wrap: wrap; }
  .pnb-sep { display: none; }
}

/* mobile: only logo + signup visible */
@media (max-width: 420px) {
  .pnb-top { padding: 0 12px; min-height: 54px; }
  .pnb-logo-name { font-size: 18px; letter-spacing: 2px; }
  .pnb-signup { padding: 8px 14px; font-size: 12.5px; }
  .pnb-badges { gap: 7px; padding: 4px 10px 8px; }
  .pnb-badge  { font-size: 9.5px; padding: 2px 9px; width: 100%; justify-content: center; }
}

.pub-theme-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--b2);
  border: 1px solid var(--nav-border);
  border-radius: 999px;
  padding: 3px;
  margin-right: 4px;
}
.pub-theme-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.45;
  transition: opacity 0.15s, background 0.15s;
}
.pub-theme-btn:hover { opacity: 0.8; }
.pub-theme-btn.active {
  opacity: 1;
  background: rgba(217,70,239,0.12);
  box-shadow: 0 0 0 1px var(--b);
}
@media (max-width: 420px) {
  .pub-theme-toggle { display: none; }
}
`;



// ─── COMPONENT ────────────────────────────────────────────────────────────────
/**
 * Props:
 *  activePage — "home" | "pricing" | "contact"
 *  onNavigate — fn(page)
 *  onLogin    — fn()
 *  onSignUp   — fn()
 */
export default function PublicNavbar({
  activePage = "home",
  onNavigate,
  onLogin,
  onSignUp,
}) {
  const [scrolled, setScrolled] = useState(false);
  const styleRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = usePublicTheme();

  useEffect(() => {
    if (!document.getElementById("pnb-css")) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "pnb-css";
      styleRef.current.textContent = CSS;
      document.head.appendChild(styleRef.current);
    }
    return () => { styleRef.current?.remove(); };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (page) => {
    // Handle Home navigation
    if (page === "home") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    // Handle Pricing navigation
    if (page === "pricing") {
      if (location.pathname === "/") {
        const element = document.getElementById("pricing");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/");
        // Use setTimeout to scroll after navigation completes
        setTimeout(() => {
          const element = document.getElementById("pricing");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
      return;
    }

    // Handle Contact navigation
    if (page === "contact") {
      navigate("/contact");
      return;
    }

    // Fallback to onNavigate if provided
    onNavigate?.(page);
  };

  const active = (page) => activePage === page ? " active" : "";

  return (
    <header className={`pnb${scrolled ? " scrolled" : ""}`} data-theme={theme}>

      {/* ── ROW 1 : Logo · Nav links · Auth buttons ── */}
      <div className="pnb-top">

        {/* Logo */}
        <div className="pnb-logo" onClick={() => go("home")} role="button">
          <LogoComponent size={80} glow animate />
          <span className="pnb-logo-name">SPEEDMOCK</span>
        </div>

        {/* Centre nav */}
        <nav className="pnb-nav" aria-label="Main navigation">
          <button className={`pnb-link${active("home")}`}    onClick={() => go("home")}>Home</button>
          <button className={`pnb-link${active("pricing")}`} onClick={() => go("pricing")}>Pricing</button>
          <button className={`pnb-link${active("contact")}`} onClick={() => go("contact")}>Contact Us</button>
        </nav>

        {/* Auth buttons */}
        <div className="pnb-right">
          <PublicThemeToggle theme={theme} setTheme={setTheme} />
          <button className="pnb-login" onClick={() => (onLogin ? onLogin() : go("/login"))}>Login</button>
          <button className="pnb-signup" onClick={() => (onSignUp ? onSignUp() : go("/signup"))}>Sign Up Free</button>
        </div>

      </div>

      {/* ── ROW 2 : Offer badges centred ── */}
      <div className="pnb-badges">
        <span className="pnb-badge pnb-badge-green">
          <span className="pnb-dot" style={{ background:"#22c55e" }} />
          🎁 2 Free Tests on Registration
        </span>

        <span className="pnb-sep" />

        <span className="pnb-badge pnb-badge-fuchsia">
          <span className="pnb-dot" style={{ background:"#e879f9" }} />
          ⚡ 3-Day Free Trial
        </span>
      </div>

    </header>
  );
}
