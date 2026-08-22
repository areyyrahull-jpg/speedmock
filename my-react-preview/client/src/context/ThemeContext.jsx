import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Global theme CSS
const THEME_CSS = `
:root {
  --f:#d946ef; --fl:#e879f9; --fd:#a21caf;
  --nb-h: 62px;

  /* DARK theme */
  --bg:#0e0e0e; --bg2:#141414; --bg3:#1c1c1c; --bg4:#242424;
  --t:#f0f0f0; --t2:#c0c0c0; --m:#888; --m2:#444;
  --b:rgba(217,70,239,0.16); --b2:rgba(255,255,255,0.07);
  --card:rgba(255,255,255,0.03);
  --shadow: 0 20px 60px rgba(0,0,0,0.7);
  --overlay: rgba(0,0,0,0.6);
}

[data-theme="light"] {
  --bg:#f4f4f6; --bg2:#ffffff; --bg3:#eeeeee; --bg4:#e4e4e4;
  --t:#111111; --t2:#333333; --m:#666; --m2:#bbb;
  --b:rgba(217,70,239,0.2); --b2:rgba(0,0,0,0.08);
  --card:rgba(0,0,0,0.03);
  --shadow: 0 20px 60px rgba(0,0,0,0.15);
  --overlay: rgba(0,0,0,0.35);
}

*, *::before, *::after { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

body { 
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
  background: var(--bg); 
  color: var(--t); 
  transition: background 0.3s ease, color 0.3s ease; 
}

html {
  transition: background 0.3s ease;
}
`;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  // Inject global theme CSS once on mount
  useEffect(() => {
    if (!document.getElementById("theme-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "theme-styles";
      styleEl.textContent = THEME_CSS;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Apply theme to root element and save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
