'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect } from 'react';

export function SmoothThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Add CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
      /* Optimized theme transition - only essential properties */
      *,
      *::before,
      *::after {
        transition: background-color 0.15s ease,
                    border-color 0.15s ease,
                    color 0.15s ease !important;
      }
      
      /* Theme switching animation */
      html {
        transition: color-scheme 0.1s ease !important;
      }
      
      /* Instant theme switch for better performance */
      html.theme-transitioning * {
        transition-duration: 0.05s !important;
      }
    `;
    document.head.appendChild(style);
    
    // Theme switching optimization
    const optimizeThemeSwitch = () => {
      // Add transitioning class
      document.documentElement.classList.add('theme-transitioning');
      
      // Remove after transition completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 100);
    };
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const classList = (mutation.target as HTMLElement).classList;
          if (classList.contains('dark') !== mutation.oldValue?.includes('dark')) {
            optimizeThemeSwitch();
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class']
    });
    
    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
      themes={['light', 'dark', 'system']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}