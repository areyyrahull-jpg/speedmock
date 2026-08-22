// usePqTheme.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "pq_theme"; // scoped to practice pages only — independent of the app-wide ThemeContext
import "../styles/themetoggle.css";
export function usePqTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "dark");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}

export function PqThemeToggle({ theme, setTheme }) {
  const options = [
    { id: "light",  icon: "☀️", label: "Light" },
    { id: "dark",   icon: "🌙", label: "Dark" },
    { id: "yellow", icon: "💡", label: "Warm" },
  ];
  return (
    <div className="pq-theme-toggle">
      {options.map(o => (
        <button
          key={o.id}
          className={`pq-theme-btn${theme === o.id ? " active" : ""}`}
          onClick={() => setTheme(o.id)}
          title={o.label}
          aria-label={o.label}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
