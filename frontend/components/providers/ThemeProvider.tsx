'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'terminal' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark' | 'terminal';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'trader-ai-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark' | 'terminal'>('light');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and set initial theme
  useEffect(() => {
    setMounted(true);
    // Set initial light theme to prevent flash
    document.documentElement.classList.add('light');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Load theme from localStorage on mount
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && ['light', 'dark', 'terminal', 'system'].includes(storedTheme)) {
        console.log(`Loading stored theme: ${storedTheme}`);
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, [storageKey, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    const applyTheme = (newTheme: 'light' | 'dark' | 'terminal') => {
      console.log(`Applying theme: ${newTheme}`);
      setActualTheme(newTheme);
      
      // Remove all theme classes first
      root.classList.remove('light', 'dark', 'terminal');
      
      // Add the new theme class
      root.classList.add(newTheme);
      
      // Force a repaint - set color scheme for light/dark, terminal uses dark scheme
      root.style.colorScheme = newTheme === 'terminal' ? 'dark' : newTheme;
      
      console.log(`Theme applied. Current classes: ${root.className}`);
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      console.log(`System theme detected: ${systemTheme}`);
      applyTheme(systemTheme);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        console.log(`System theme changed to: ${newSystemTheme}`);
        applyTheme(newSystemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (theme === 'terminal') {
      console.log(`Terminal theme set`);
      applyTheme('terminal');
    } else {
      console.log(`Manual theme set: ${theme}`);
      applyTheme(theme as 'light' | 'dark');
    }
  }, [theme, mounted]);

  const value: ThemeContextType = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log(`Setting theme to: ${newTheme}`);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
      setTheme(newTheme);
    },
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};