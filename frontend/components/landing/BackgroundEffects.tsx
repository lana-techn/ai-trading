'use client';

import { useMemo } from 'react';

interface BackgroundEffectsProps {
  scrollY: number;
}

export function BackgroundEffects({ scrollY }: BackgroundEffectsProps) {
  const parallaxStyles = useMemo(() => {
    const speeds: Record<string, number> = {
      'orb1': -0.3,
      'orb2': -0.5,
      'orb3': -0.2,
      'grid': -0.1,
    };
    
    const styles: Record<string, React.CSSProperties> = {};
    Object.keys(speeds).forEach(elementId => {
      const speed = speeds[elementId];
      styles[elementId] = {
        transform: `translateY(${scrollY * speed}px)`
      };
    });
    return styles;
  }, [scrollY]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dynamic grid pattern with parallax */}
      <div 
        className="parallax-element absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"
        style={parallaxStyles.grid}
      />
      
      {/* Additional mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 dark:from-primary/3 dark:to-primary/3" />
      
      {/* Enhanced gradient orbs for depth with different parallax speeds */}
      <div 
        className="parallax-element absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl animate-pulse-gentle"
        style={{
          ...parallaxStyles.orb1,
          animationDelay: '0s'
        }}
      />
      <div 
        className="parallax-element absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-radial from-primary/6 via-primary/3 to-transparent rounded-full blur-3xl animate-pulse-gentle"
        style={{
          ...parallaxStyles.orb2,
          animationDelay: '1.5s'
        }}
      />
      <div 
        className="parallax-element absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-primary/4 via-primary/2 to-transparent rounded-full blur-3xl animate-pulse-gentle"
        style={{
          ...parallaxStyles.orb3,
          animationDelay: '3s'
        }}
      />
      
      {/* Additional smaller accent orbs */}
      <div 
        className="parallax-element absolute top-32 right-32 w-24 h-24 bg-gradient-radial from-primary/12 to-transparent rounded-full blur-2xl animate-float-gentle"
        style={{
          ...parallaxStyles.orb1,
          animationDelay: '4s'
        }}
      />
      <div 
        className="parallax-element absolute bottom-32 left-32 w-32 h-32 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-xl animate-float-gentle"
        style={{
          ...parallaxStyles.orb2,
          animationDelay: '5s'
        }}
      />
    </div>
  );
}
