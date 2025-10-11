/**
 * Hero section with Container Scroll Animation and real-time crypto/stock data
 * Optimized version with extracted components
 */

'use client';

import { useEffect, useState, useMemo, memo, useRef, useCallback } from 'react';
import { useIntersectionObserver, usePerformanceMonitoring } from '@/lib/performance';
import { HeroSkeleton } from '@/components/ui/skeleton';
import { BackgroundEffects } from './BackgroundEffects';
import { FloatingIcons } from './FloatingIcons';
import { HeroContent } from './HeroContent';
import TradingDashboard from '../trading/TradingDashboard';

const HeroSection = memo(function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 });
  usePerformanceMonitoring('HeroSection');
  
  // Container Scroll Animation - Safe for SSR
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // Memoize scale dimensions
  const scaleDimensions = useMemo(() => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  }, [isMobile]);
  
  // Memoize scroll transforms calculation
  const scrollTransforms = useMemo(() => {
    const rotate = 20 - (scrollProgress * 20); // 20 to 0
    const scale = scaleDimensions[0] + (scrollProgress * (scaleDimensions[1] - scaleDimensions[0]));
    const translateY = scrollProgress * -100; // 0 to -100
    
    return { rotate, scale, translateY };
  }, [scrollProgress, scaleDimensions]);
  
  // Throttle function for performance
  const throttle = useCallback((func: (...args: unknown[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    return (...args: unknown[]) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      }
    };
  }, []);
  
  // Optimized scroll handler
  const handleScroll = useCallback(throttle(() => {
    if (typeof window === 'undefined') return;
    
    const scrollTop = window.pageYOffset;
    setScrollY(scrollTop);
    
    // Calculate scroll progress for container animation
    if (containerRef.current) {
      const containerTop = containerRef.current.offsetTop;
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      const elementTop = containerTop - windowHeight;
      const elementHeight = containerHeight + windowHeight;
      
      const progress = Math.min(Math.max((scrollTop - elementTop) / elementHeight, 0), 1);
      setScrollProgress(progress);
    }
  }, 16), [throttle]); // ~60fps throttling
  
  // Optimized resize handler
  const handleResize = useCallback(throttle(() => {
    setIsMobile(window.innerWidth <= 768);
  }, 250), [throttle]); // 4fps throttling for resize
  
  // Event listeners setup
  useEffect(() => {
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleResize, handleScroll]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until intersected for better performance
  if (!hasIntersected) {
    return (
      <div ref={ref as unknown as React.Ref<HTMLDivElement>} className="min-h-screen">
        <HeroSkeleton />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background">
      {/* Hero Title Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24"
        ref={containerRef}
      >
      {/* Enhanced Background Elements with Parallax */}
      <BackgroundEffects scrollY={scrollY} />
      
      {/* Enhanced Floating Icons */}
      <FloatingIcons mounted={mounted} hasIntersected={hasIntersected} />

        {/* Container Scroll Content */}
        <div 
          className="py-10 md:py-40 w-full relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ perspective: "1000px" }}
        >
          {/* Animated Title Component */}
          <div
            style={{ 
              transform: `translateY(${scrollTransforms.translateY}px)`,
              transition: 'transform 0.1s ease-out'
            }}
            className="max-w-5xl mx-auto text-center"
          >
            <HeroContent mounted={mounted} />
          </div>
        </div>
      </section>
      
      {/* Trading Dashboard Section */}
      <section className="relative py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            style={{
              transform: `perspective(1000px) rotateX(${scrollTransforms.rotate}deg) scale(${scrollTransforms.scale})`,
              boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
              transition: 'transform 0.1s ease-out'
            }}
            className="max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
          >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
              <TradingDashboard 
                variant="compact"
                showActivePositions={true}
                updateInterval={4000}
                className="h-full border-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default HeroSection;
