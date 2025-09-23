'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect } from 'react';

export function SmoothThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Add CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
      /* Smooth theme transition for all elements */
      *,
      *::before,
      *::after {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    fill 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Smooth transitions for gradients */
      .bg-gradient-to-r,
      .bg-gradient-to-l,
      .bg-gradient-to-t,
      .bg-gradient-to-b,
      .bg-gradient-to-br,
      .bg-gradient-to-bl,
      .bg-gradient-to-tr,
      .bg-gradient-to-tl {
        transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Theme switching animation */
      html {
        transition: color-scheme 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Prevent flash during theme switch */
      html.theme-transitioning * {
        transition-duration: 0.1s !important;
      }
      
      /* Smooth scrollbar theme transition */
      ::-webkit-scrollbar {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      ::-webkit-scrollbar-thumb {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Special handling for charts and complex components */
      .apexcharts-canvas,
      .apexcharts-svg,
      canvas {
        transition: opacity 0.2s ease-in-out !important;
      }
      
      /* Smooth transitions for custom properties */
      :root {
        transition: 
          --background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --foreground 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --card 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --card-foreground 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --primary 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --primary-foreground 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --secondary 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --secondary-foreground 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --muted 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --muted-foreground 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --accent 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --accent-foreground 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --border 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --input 0.3s cubic-bezier(0.4, 0, 0.2, 1),
          --ring 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
      }, 150);
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