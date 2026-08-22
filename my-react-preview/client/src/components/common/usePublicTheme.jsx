import { useState, useEffect, useCallback } from "react";

// Shared light/dark theme for the public marketing pages (Hero, Navbar,
// Footer, FeatureCarousel). Default is "light" — a white + soft blue
// palette, per the brief. Persisted in localStorage so the choice
// carries across the whole public site (all 4 components read this
// same key, independently, since they're separate top-level components).
const STORAGE_KEY = "speedmock_public_theme";

export function usePublicTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) setThemeState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    // Let other mounted public components (different top-level trees)
    // pick up the change immediately without a full page reload.
    window.dispatchEvent(new CustomEvent("speedmock-public-theme", { detail: next }));
  }, []);

  useEffect(() => {
    const onCustom = (e) => setThemeState(e.detail);
    window.addEventListener("speedmock-public-theme", onCustom);
    return () => window.removeEventListener("speedmock-public-theme", onCustom);
  }, []);

  return [theme, setTheme];
}

// Small pill toggle — sun / moon — matches the compact style already
// used elsewhere in the app (PqThemeToggle), kept local here since the
// public site is a separate, unauthenticated surface.
export function PublicThemeToggle({ theme, setTheme }) {
  return (
    <div className="pub-theme-toggle">
      <button
        className={`pub-theme-btn${theme === "light" ? " active" : ""}`}
        onClick={() => setTheme("light")}
        title="Light mode"
        aria-label="Light mode"
      >☀️</button>
      <button
        className={`pub-theme-btn${theme === "dark" ? " active" : ""}`}
        onClick={() => setTheme("dark")}
        title="Dark mode"
        aria-label="Dark mode"
      >🌙</button>
    </div>
  );
}
