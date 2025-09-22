'use client';

import { useEffect, useState } from 'react';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { themeManager, type Theme } from '@/lib/theme';

interface SimpleThemeToggleProps {
  className?: string;
  variant?: 'button' | 'dropdown';
}

export default function SimpleThemeToggle({ 
  className, 
  variant = 'button'
}: SimpleThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!themeManager) return;

    // Get initial values
    setTheme(themeManager.getTheme());
    setActualTheme(themeManager.getActualTheme());

    // Subscribe to changes
    const unsubscribe = themeManager.subscribe((newTheme) => {
      setTheme(newTheme);
      setActualTheme(themeManager.getActualTheme());
    });

    return unsubscribe;
  }, []);

  if (!mounted) {
    return (
      <button className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-800", className)}>
        <div className="h-5 w-5" />
      </button>
    );
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return actualTheme === 'dark' ? MoonIcon : SunIcon;
    }
    return theme === 'dark' ? MoonIcon : SunIcon;
  };

  const handleToggle = () => {
    if (!themeManager) return;
    themeManager.toggle();
  };

  const handleThemeSelect = (newTheme: Theme) => {
    if (!themeManager) return;
    themeManager.setTheme(newTheme);
    setIsOpen(false);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
          "border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "dark:focus:ring-offset-gray-900",
          "shadow-sm hover:shadow-md",
          className
        )}
        title={`Switch theme (currently: ${theme})`}
      >
        {(() => {
          const Icon = getCurrentIcon();
          return <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-colors" />;
        })()}
      </button>
    );
  }

  const themes = [
    { value: 'light' as const, label: 'Light', icon: SunIcon, description: 'Light theme' },
    { value: 'dark' as const, label: 'Dark', icon: MoonIcon, description: 'Dark theme' },
    { value: 'system' as const, label: 'System', icon: ComputerDesktopIcon, description: 'Follow system preference' },
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200",
          "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
          "border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "dark:focus:ring-offset-gray-900",
          isOpen && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900"
        )}
        title="Toggle theme"
      >
        {(() => {
          const Icon = getCurrentIcon();
          return (
            <>
              <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {theme === 'system' ? 'Auto' : theme.charAt(0).toUpperCase() + theme.slice(1)}
              </span>
            </>
          );
        })()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-full mt-2 z-50 w-48 py-1 rounded-lg shadow-lg bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeSelect(themeOption.value)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    isSelected && "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
                    !isSelected && "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className={cn(
                      "text-xs",
                      isSelected ? "text-indigo-500 dark:text-indigo-300" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {themeOption.description}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}