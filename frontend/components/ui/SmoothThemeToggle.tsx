'use client';

import { useTheme } from 'next-themes';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { optimizeThemeSwitch } from '@/lib/theme-utils';

interface SmoothThemeToggleProps {
  className?: string;
  variant?: 'button' | 'dropdown' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function SmoothThemeToggle({
  className,
  variant = 'button',
  size = 'md',
  showLabels = false
}: SmoothThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg",
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
      )} />
    );
  }

  const themes = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: SunIcon,
      description: 'Light mode',
      gradient: 'from-amber-400 to-orange-500',
      hoverGradient: 'hover:from-amber-500 hover:to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: MoonIcon,
      description: 'Dark mode',
      gradient: 'from-slate-600 to-slate-800',
      hoverGradient: 'hover:from-slate-700 hover:to-slate-900',
      textColor: 'text-slate-400'
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: ComputerDesktopIcon,
      description: 'System preference',
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
      textColor: 'text-blue-500'
    }
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  const handleThemeChange = (newTheme: string) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Optimize theme switching for instant change
    optimizeThemeSwitch();
    
    // Apply theme immediately
    setTheme(newTheme);
    setIsOpen(false);
    
    // Reset transition state quickly
    setTimeout(() => {
      setIsTransitioning(false);
    }, 75);
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex].value);
  };

  // Button variant - cycles through themes
  if (variant === 'button') {
    const Icon = currentTheme.icon;
    const actualIcon = theme === 'system' && systemTheme === 'dark' ? MoonIcon : Icon;
    const ActualIcon = actualIcon;

    return (
      <button
        onClick={cycleTheme}
        disabled={isTransitioning}
        className={cn(
          "group relative overflow-hidden rounded-lg transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          "transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Size variants
          size === 'sm' && "p-1.5",
          size === 'md' && "p-2",
          size === 'lg' && "p-3",
          
          // Base styling
          "bg-gradient-to-br from-background via-card to-accent/20",
          "hover:from-accent hover:to-card shadow-sm hover:shadow-lg",
          "border border-border hover:border-primary/30",
          "backdrop-blur-sm",
          
          // Smooth hover effects
          "hover:scale-105 hover:shadow-primary/10",
          "transition-[transform,box-shadow,background,border-color] duration-300",
          
          className
        )}
        title={`Switch theme (${currentTheme.label})`}
      >
        {/* Background glow effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300",
          currentTheme.gradient
        )} />
        
        {/* Icon container */}
        <div className="relative z-10 flex items-center justify-center">
          <ActualIcon 
            className={cn(
              "transition-all duration-300 ease-out",
              "group-hover:rotate-12 group-hover:scale-110",
              currentTheme.textColor,
              
              // Size variants
              size === 'sm' && "h-4 w-4",
              size === 'md' && "h-5 w-5", 
              size === 'lg' && "h-6 w-6"
            )} 
          />
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-30 bg-primary/20 transition-opacity duration-150" />
      </button>
    );
  }

  // Segmented variant - shows all options
  if (variant === 'segmented') {
    return (
      <div className={cn(
        "inline-flex items-center bg-card/80 backdrop-blur-sm rounded-xl p-1",
        "border border-border/50 shadow-sm",
        className
      )}>
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <button
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value)}
              disabled={isTransitioning}
              className={cn(
                "relative flex items-center justify-center transition-all duration-300",
                "rounded-lg font-medium disabled:opacity-50",
                
                // Size variants
                size === 'sm' && "px-2 py-1",
                size === 'md' && "px-3 py-2",
                size === 'lg' && "px-4 py-3",
                
                // Selected state
                isSelected 
                  ? cn(
                      "bg-gradient-to-br text-primary-foreground shadow-lg scale-105 z-10",
                      themeOption.gradient,
                      "transform transition-all duration-300"
                    )
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
              )}
              title={themeOption.description}
            >
              <Icon className={cn(
                "transition-all duration-300",
                isSelected && "scale-110",
                
                // Size variants
                size === 'sm' && "h-4 w-4",
                size === 'md' && "h-5 w-5",
                size === 'lg' && "h-6 w-6"
              )} />
              
              {showLabels && (
                <span className={cn(
                  "ml-2 transition-all duration-300",
                  size === 'sm' && "text-xs",
                  size === 'md' && "text-sm",
                  size === 'lg' && "text-base"
                )}>
                  {themeOption.label}
                </span>
              )}
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-all duration-300",
          "bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30",
          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
          "shadow-sm hover:shadow-md disabled:opacity-50",
          
          // Size variants
          size === 'sm' && "px-2 py-1 text-xs",
          size === 'md' && "px-3 py-2 text-sm",
          size === 'lg' && "px-4 py-3 text-base"
        )}
      >
        <currentTheme.icon className={cn(
          "transition-colors duration-300",
          currentTheme.textColor,
          
          // Size variants
          size === 'sm' && "h-4 w-4",
          size === 'md' && "h-5 w-5",
          size === 'lg' && "h-6 w-6"
        )} />
        
        {showLabels && (
          <span className="font-medium text-foreground">
            {currentTheme.label}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            "absolute right-0 z-50 mt-2 min-w-[160px] origin-top-right",
            "animate-in slide-in-from-top-2 duration-200",
            "bg-card/95 backdrop-blur-xl rounded-xl shadow-xl border border-border",
            "py-2 ring-1 ring-black/5 dark:ring-white/10"
          )}>
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={cn(
                    "group flex w-full items-center gap-3 px-4 py-3 transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary border-l-2 border-primary" 
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className={cn(
                    "transition-all duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : themeOption.textColor,
                    "h-5 w-5"
                  )} />
                  
                  <div className="text-left">
                    <div className={cn(
                      "font-medium transition-colors duration-200",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {themeOption.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
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