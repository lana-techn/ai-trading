'use client';

import { useTheme } from 'next-themes';
// Fallback to our custom provider if needed
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  CommandLineIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
  variant?: 'button' | 'dropdown' | 'segmented' | 'floating' | 'minimal' | 'cards';
  size?: 'sm' | 'md' | 'lg';
}

function ThemeToggle({
  className, 
  showLabels = false, 
  variant = 'dropdown',
  size = 'md'
}: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        className={cn(
          "p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
          className
        )}
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  const themes = [
    { 
      value: 'light' as const, 
      label: 'Light', 
      icon: SunIcon,
      description: 'Clean light interface',
      color: 'text-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
      darkBgColor: 'dark:from-amber-900/20 dark:to-orange-900/20',
      accentColor: 'border-amber-200 dark:border-amber-800'
    },
    { 
      value: 'dark' as const, 
      label: 'Dark', 
      icon: MoonIcon,
      description: 'Easy on the eyes',
      color: 'text-slate-400',
      bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
      darkBgColor: '',
      accentColor: 'border-slate-600'
    },
    { 
      value: 'terminal' as const, 
      label: 'Terminal', 
      icon: CommandLineIcon,
      description: 'Pro trader interface',
      color: 'text-green-400',
      bgColor: 'bg-gradient-to-br from-green-900 to-emerald-900',
      darkBgColor: '',
      accentColor: 'border-green-500'
    },
    { 
      value: 'system' as const, 
      label: 'System', 
      icon: ComputerDesktopIcon,
      description: 'Follow system preference',
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      darkBgColor: 'dark:from-blue-900/20 dark:to-indigo-900/20',
      accentColor: 'border-blue-200 dark:border-blue-800'
    },
  ];

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return actualTheme === 'dark' ? MoonIcon : SunIcon;
    }
    return themes.find(t => t.value === theme)?.icon || SunIcon;
  };

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('terminal');
    } else if (theme === 'terminal') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Size variants
  const sizeClasses = {
    sm: {
      button: 'p-1.5',
      icon: 'h-4 w-4',
      text: 'text-xs'
    },
    md: {
      button: 'p-2',
      icon: 'h-5 w-5',
      text: 'text-sm'
    },
    lg: {
      button: 'p-3',
      icon: 'h-6 w-6',
      text: 'text-base'
    }
  };

  const currentTheme = themes.find(t => t.value === theme);

  if (variant === 'button') {
    return (
      <button
        onClick={handleThemeChange}
        className={cn(
          sizeClasses[size].button,
          "rounded-xl transition-all duration-300 group relative overflow-hidden",
          "bg-gradient-to-br from-card via-card to-accent",
          "hover:from-accent hover:via-accent hover:to-primary/10",
          "border border-card-border hover:border-primary/30",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          "shadow-sm hover:shadow-lg hover:shadow-primary/10",
          "transform hover:scale-105 active:scale-95",
          className
        )}
        title={`Switch theme (currently: ${theme})`}
      >
        <div className="relative z-10">
          {(() => {
            const Icon = getCurrentIcon();
            return (
              <Icon 
                className={cn(
                  sizeClasses[size].icon,
                  "text-card-foreground group-hover:text-primary transition-all duration-300",
                  "group-hover:rotate-12 group-hover:scale-110"
                )} 
              />
            );
          })()}
        </div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    );
  }

  // Segmented Control Variant
  if (variant === 'segmented') {
    return (
      <div className={cn(
        "inline-flex items-center bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-card-border shadow-sm",
        className
      )}>
        {themes.slice(0, 3).map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "relative flex items-center justify-center transition-all duration-300",
                sizeClasses[size].button,
                "rounded-lg font-medium",
                isSelected 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md scale-105" 
                  : "text-muted-foreground hover:text-card-foreground hover:bg-accent/50"
              )}
              title={themeOption.description}
            >
              <Icon className={cn(
                sizeClasses[size].icon,
                "transition-all duration-300",
                isSelected && "scale-110"
              )} />
              {showLabels && (
                <span className={cn("ml-2", sizeClasses[size].text)}>
                  {themeOption.label}
                </span>
              )}
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Floating Variant
  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50",
        className
      )}>
        <div className="flex flex-col items-center space-y-2">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={cn(
                  "group relative transition-all duration-300",
                  sizeClasses[size].button,
                  "rounded-full backdrop-blur-md border shadow-lg",
                  isSelected
                    ? cn(
                        "bg-gradient-to-br", 
                        themeOption.bgColor, 
                        themeOption.darkBgColor,
                        "border-primary shadow-primary/20 scale-110"
                      )
                    : "bg-card/80 border-card-border hover:bg-accent hover:scale-105 hover:shadow-xl"
                )}
                title={themeOption.description}
              >
                <Icon className={cn(
                  sizeClasses[size].icon,
                  "transition-all duration-300",
                  isSelected 
                    ? themeOption.color
                    : "text-muted-foreground group-hover:text-card-foreground"
                )} />
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-card border border-card-border rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
                    <div className={cn("font-medium", sizeClasses[size].text)}>
                      {themeOption.label}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Cards Variant
  if (variant === 'cards') {
    return (
      <div className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-3",
        className
      )}>
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "group relative p-4 rounded-xl transition-all duration-300 text-left",
                "bg-gradient-to-br border-2 shadow-sm hover:shadow-lg",
                isSelected
                  ? cn(
                      themeOption.bgColor,
                      themeOption.darkBgColor,
                      "border-primary shadow-primary/20 scale-105"
                    )
                  : "from-card to-accent/20 border-card-border hover:border-primary/30 hover:scale-102"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isSelected 
                    ? themeOption.color
                    : "text-muted-foreground group-hover:text-card-foreground"
                )} />
                {isSelected && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              
              <div className={cn(
                "font-semibold mb-1 transition-colors",
                sizeClasses[size].text,
                isSelected ? themeOption.color : "text-card-foreground"
              )}>
                {themeOption.label}
              </div>
              
              <div className={cn(
                "text-xs transition-colors",
                isSelected 
                  ? `${themeOption.color} opacity-80`
                  : "text-muted-foreground"
              )}>
                {themeOption.description}
              </div>
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-transparent via-current to-current rounded-xl" />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Minimal Variant
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleThemeChange}
        className={cn(
          "group flex items-center space-x-2 transition-all duration-200 hover:scale-105",
          sizeClasses[size].text,
          className
        )}
        title={`Switch theme (currently: ${theme})`}
      >
        {(() => {
          const Icon = getCurrentIcon();
          return (
            <Icon className={cn(
              sizeClasses[size].icon,
              "text-muted-foreground group-hover:text-primary transition-colors duration-200"
            )} />
          );
        })()}
        {showLabels && (
          <span className="text-muted-foreground group-hover:text-card-foreground font-medium">
            {theme === 'system' ? 'Auto' : 
             theme === 'terminal' ? 'Terminal' :
             theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center space-x-2 transition-all duration-300 relative overflow-hidden",
          sizeClasses[size].button,
          "rounded-xl bg-gradient-to-br from-card via-card to-accent/30",
          "border border-card-border hover:border-primary/30",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          "shadow-sm hover:shadow-lg hover:shadow-primary/5",
          "hover:scale-105 active:scale-95",
          isOpen && "ring-2 ring-primary/50 ring-offset-2 scale-105 shadow-lg"
        )}
        title="Toggle theme"
      >
        <div className="relative z-10 flex items-center space-x-2">
          {(() => {
            const Icon = getCurrentIcon();
            return (
              <>
                <div className="relative">
                  <Icon className={cn(
                    sizeClasses[size].icon,
                    "text-card-foreground group-hover:text-primary transition-all duration-300",
                    "group-hover:rotate-12 group-hover:scale-110"
                  )} />
                  {/* Theme indicator dot */}
                  <div className={cn(
                    "absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300",
                    currentTheme?.color.replace('text-', 'bg-'),
                    "opacity-60 group-hover:opacity-100 group-hover:scale-125"
                  )} />
                </div>
                {showLabels && (
                  <span className={cn(
                    "font-medium text-card-foreground group-hover:text-primary transition-colors",
                    sizeClasses[size].text
                  )}>
                    {theme === 'system' ? 'Auto' : 
                     theme === 'terminal' ? 'Terminal' :
                     theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </span>
                )}
              </>
            );
          })()}
        </div>
        
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className={cn(
            "absolute right-0 top-full mt-3 z-50",
            "w-64 p-2 rounded-2xl shadow-2xl border backdrop-blur-xl",
            "bg-card/80 border-card-border/50",
            "animate-fade-in transform origin-top-right",
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none"
          )}>
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "group relative w-full flex items-center space-x-3 p-3 text-left transition-all duration-300 rounded-xl",
                    "hover:scale-[1.02] backdrop-blur-sm",
                    isSelected 
                      ? cn(
                          "bg-gradient-to-r shadow-md border",
                          themeOption.bgColor,
                          themeOption.darkBgColor,
                          themeOption.accentColor,
                          "shadow-primary/10"
                        )
                      : "hover:bg-accent/50 hover:shadow-sm border border-transparent hover:border-border-accent"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn(
                      "h-6 w-6 flex-shrink-0 transition-all duration-300",
                      isSelected 
                        ? cn(themeOption.color, "scale-110")
                        : "text-muted-foreground group-hover:text-card-foreground group-hover:scale-105"
                    )} />
                    {/* Icon glow effect for selected theme */}
                    {isSelected && (
                      <div className={cn(
                        "absolute inset-0 rounded-full blur-md opacity-30 scale-150",
                        themeOption.color.replace('text-', 'bg-')
                      )} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-semibold transition-colors mb-1",
                      isSelected ? themeOption.color : "text-card-foreground"
                    )}>
                      {themeOption.label}
                    </div>
                    <div className={cn(
                      "text-xs transition-colors leading-relaxed",
                      isSelected 
                        ? `${themeOption.color} opacity-80`
                        : "text-muted-foreground group-hover:text-muted-foreground"
                    )}>
                      {themeOption.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        themeOption.color.replace('text-', 'bg-')
                      )} />
                    )}
                    {/* Subtle arrow for non-selected items */}
                    {!isSelected && (
                      <div className="w-1 h-1 bg-muted-foreground/30 rounded-full group-hover:bg-muted-foreground transition-colors" />
                    )}
                  </div>
                  
                  {/* Background gradient overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl" />
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

export { ThemeToggle };
export default ThemeToggle;
