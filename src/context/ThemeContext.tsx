import React, { createContext, useContext, useEffect, useState } from 'react';
import { triggerHaptic } from '../lib/haptics';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('fabriq_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'light'; // Default champagne luxury light mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('bg-[#0A0A0E]', 'text-slate-100');
      document.body.classList.remove('bg-[#FAFAFC]', 'text-slate-900');
    } else {
      root.classList.remove('dark');
      document.body.classList.add('bg-[#FAFAFC]', 'text-slate-900');
      document.body.classList.remove('bg-[#0A0A0E]', 'text-slate-100');
    }
    try {
      localStorage.setItem('fabriq_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    triggerHaptic('medium');
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (mode: ThemeMode) => {
    triggerHaptic('light');
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
