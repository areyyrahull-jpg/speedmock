/**
 * Logo.jsx
 * ─────────────────────────────────────────────────────────────────
 * Reusable SpeedMock logo component.
 *
 * HOW TO LINK YOUR LOGO.PNG:
 *   1. Place your file at:  client/src/assets/images/logo.png
 *   2. The import below pulls it in automatically at build time.
 *   3. That's it — every component that uses <Logo /> gets the image.
 *
 * Usage:
 *   import Logo from "../common/Logo";
 *
 *   <Logo />                         // default 32×32
 *   <Logo size={64} />               // larger
 *   <Logo size={24} glow={false} />  // no glow
 *   <Logo size={48} animate />       // hover pulse
 *
 * Used in:
 *   - PublicNavbar.jsx
 *   - DashboardNavbar.jsx
 *   - HeroSection.jsx
 *   - Footer.jsx
 *   - AuthPage.jsx
 *   - OTPScreen.jsx
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────
//  ▼▼▼  LINK YOUR LOGO.PNG HERE — change this one line  ▼▼▼
// ─────────────────────────────────────────────────────────────────
import logoSrc from "../../assets/images/logo.png";
// ─────────────────────────────────────────────────────────────────
//  That import works because Vite / Create-React-App automatically
//  bundles any file imported this way. The path is relative to
//  this file's location:
//
//  client/src/components/common/Logo.jsx   ← this file
//  client/src/assets/images/logo.png       ← your logo
//
//  So the relative path is: ../../assets/images/logo.png
// ─────────────────────────────────────────────────────────────────


// ─── KEYFRAME INJECTION ──────────────────────────────────────────
const injectKeyframes = () => {
  if (document.getElementById("logo-keyframes")) return;
  const s = document.createElement("style");
  s.id = "logo-keyframes";
  s.textContent = `
    @keyframes logo-pulse {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(217,70,239,.55)); }
      50%       { filter: drop-shadow(0 0 22px rgba(217,70,239,.95)); }
    }
    .logo-wrap-animate:hover .logo-img {
      animation: logo-pulse 1.4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(s);
};

// ─── COMPONENT ───────────────────────────────────────────────────
export default function Logo({
  size      = 10000,
  glow      = true,
  animate   = false,
  className = "",
  style     = {},
}) {
  const [hovered, setHovered] = useState(false);

  if (animate) injectKeyframes();

  const glowSmall = `drop-shadow(0 0 ${Math.round(size * 0.22)}px rgba(217,70,239,.50))`;
  const glowBig   = `drop-shadow(0 0 ${Math.round(size * 0.45)}px rgba(217,70,239,.90))`;

  const imgStyle = {
    width:    size,
    height:   size,
    objectFit: "contain",
    display:  "block",
    filter:   glow ? (hovered ? glowBig : glowSmall) : "none",
    transition: "filter 0.3s",
  };

  return (
  
    <div
      className={`logo-wrap${animate ? " logo-wrap-animate" : ""}${className ? ` ${className}` : ""}`}
      style={{ display: "inline-flex", ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        className="logo-img"
        src={logoSrc}
        alt="SpeedMock logo"
        width={size}
        height={size}
        style={imgStyle}
        draggable={false}
        
      />
    </div>
  );
}
