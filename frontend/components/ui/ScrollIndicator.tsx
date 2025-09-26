/**
 * Scroll Indicator Component - positioned between sections
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const ScrollIndicator = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToNextSection = () => {
    const featuresSection = document.querySelector('[data-section="features"]');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll by viewport height
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-background/50 via-transparent to-background/50 flex justify-center">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.005] dark:opacity-[0.01]" />
      
      <div 
        className={cn(
          "cursor-pointer group transition-all duration-1000 ease-out",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        onClick={scrollToNextSection}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Clean scroll text */}
          <div className="text-center space-y-1">
            <span className="block text-sm text-muted-foreground/70 font-medium tracking-wider uppercase group-hover:text-primary/80 group-hover:opacity-100 transition-all duration-300">
              Scroll to explore
            </span>
          </div>
          
          {/* Minimalist scroll mouse design */}
          <div className="relative">
            <div className="relative w-6 h-10 border-2 border-muted-foreground/30 group-hover:border-primary/60 rounded-full flex justify-center transition-all duration-500 group-hover:scale-110">
              {/* Animated scrolling dot */}
              <div className="w-1.5 h-3 bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/60 group-hover:from-primary/70 group-hover:to-primary rounded-full mt-2 animate-scroll-bounce" />
              
              {/* Subtle glow effect on hover */}
              <div className="absolute -inset-1 border border-primary/20 rounded-full opacity-0 group-hover:opacity-60 animate-pulse transition-opacity duration-500" />
            </div>
            
            {/* Floating particles effect - more subtle */}
            <div className="absolute -inset-3 opacity-0 group-hover:opacity-50 transition-opacity duration-700">
              <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-primary/30 rounded-full animate-float-up" style={{animationDelay: '0s'}} />
              <div className="absolute top-2 left-1/4 w-0.5 h-0.5 bg-primary/20 rounded-full animate-float-up" style={{animationDelay: '0.8s'}} />
              <div className="absolute top-1 right-1/4 w-0.5 h-0.5 bg-primary/20 rounded-full animate-float-up" style={{animationDelay: '1.2s'}} />
            </div>
          </div>
          
          {/* Minimal double chevron */}
          <div className="flex flex-col space-y-0.5">
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-300 animate-chevron-bounce" />
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all duration-300 animate-chevron-bounce" style={{animationDelay: '0.15s'}} />
          </div>
        </div>
      </div>
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default ScrollIndicator;