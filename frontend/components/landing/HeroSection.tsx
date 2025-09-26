/**
 * Hero section with Container Scroll Animation and real-time crypto/stock data
 */

'use client';

import { useEffect, useState, useMemo, memo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon, 
  CpuChipIcon, 
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
  BookOpenIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useIntersectionObserver, usePerformanceMonitoring } from '@/lib/performance';
import { HeroSkeleton } from '@/components/ui/skeleton';
import { BentoGrid, BentoHero, BentoStat, BentoCard } from '@/components/ui/BentoGrid';

// Real-time market data
const initialMarketData = {
  BTC: { price: 67234, change: 2.34, color: "orange" },
  ETH: { price: 2567, change: 1.87, color: "blue" },
  TSLA: { price: 248.50, change: -0.45, color: "red" },
  AAPL: { price: 175.84, change: 0.92, color: "gray" }
};

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '2.3s', label: 'Avg Response' },
  { value: '95%', label: 'Accuracy' },
  { value: '24/7', label: 'Available' }
];

const FLOATING_ICONS = [
  { icon: CpuChipIcon, delay: 0, x: 10, y: 20 },
  { icon: ChartBarIcon, delay: 1000, x: 80, y: 30 },
  { icon: BoltIcon, delay: 2000, x: 70, y: 70 },
  { icon: SparklesIcon, delay: 1500, x: 20, y: 60 },
];

const HeroSection = memo(function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 });
  const { renderCount } = usePerformanceMonitoring('HeroSection');
  
  // Container Scroll Animation - Safe for SSR
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Market data state
  const [marketData, setMarketData] = useState(initialMarketData);
  const [aiAnalysis, setAiAnalysis] = useState({ sentiment: 75, confidence: 87 });
  const [totalPnL, setTotalPnL] = useState(127000);

  // Simple parallax without complex dependency management
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
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    return (...args: any[]) => {
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
  
  // Real-time market data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          const fluctuation = (Math.random() - 0.5) * 0.015;
          newData[key].price = Math.round((newData[key].price * (1 + fluctuation)) * 100) / 100;
          newData[key].change = Math.round((newData[key].change + fluctuation * 100) * 100) / 100;
        });
        return newData;
      });
      
      setAiAnalysis(prev => ({
        sentiment: Math.max(65, Math.min(90, prev.sentiment + (Math.random() - 0.5) * 8)),
        confidence: Math.max(75, Math.min(95, prev.confidence + (Math.random() - 0.5) * 6))
      }));
      
      setTotalPnL(prev => Math.round(prev + (Math.random() - 0.4) * 800));
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  
  // Memoize parallax styles untuk performance
  const parallaxStyles = useMemo(() => {
    const speeds: Record<string, number> = {
      'orb1': -0.3,
      'orb2': -0.5,
      'orb3': -0.2,
      'grid': -0.1,
      'content': -0.15
    };
    
    const styles: Record<string, any> = {};
    Object.keys(speeds).forEach(elementId => {
      const speed = speeds[elementId];
      styles[elementId] = {
        transform: `translateY(${scrollY * speed}px)`
      };
    });
    return styles;
  }, [scrollY]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize heavy computations
  const floatingIcons = useMemo(() => FLOATING_ICONS, []);
  const stats = useMemo(() => STATS, []);

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
      
      {/* Enhanced Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={cn(
              "absolute transition-all duration-1000 ease-out opacity-[0.06] dark:opacity-[0.04]",
              mounted && hasIntersected && "animate-float-slow"
            )}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: `${item.delay}ms`,
              transform: mounted ? 'translate(0, 0)' : 'translate(50px, 50px)'
            }}
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/5 rounded-full blur-sm" />
              <item.icon className="relative h-12 w-12 text-primary/20 dark:text-primary/15" />
            </div>
          </div>
        ))}
      </div>

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
          <div className="text-center space-y-12 sm:space-y-16">
          {/* Enhanced Badge & Title */}
          <div className={cn(
            "space-y-6 sm:space-y-8 transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-primary text-sm font-medium shadow-lg hover:shadow-xl hover:bg-primary/15 transition-all duration-300">
              <SparklesIcon className="h-4 w-4" />
              <span>Next-Generation AI Trading</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[0.9] tracking-tight">
                <span className="block mb-2 sm:mb-4">AI-Powered</span>
                <span className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Trading Intelligence
                </span>
              </h1>
              
              {/* Supporting tagline */}
              <div className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground/80 tracking-wide">
                Revolutionize Your Investment Strategy
              </div>
            </div>
          </div>

          {/* Enhanced Subtitle */}
          <div className={cn(
            "transition-all duration-1000 ease-out delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
              Experience the future of trading with hybrid AI models, real-time analysis, 
              and intelligent decision-making powered by{' '}
              <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Qwen</span> and{' '}
              <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Gemini</span>.
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className={cn(
            "flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 ease-out delay-400",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Link
              href="/analysis"
              className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden min-w-[180px] sm:min-w-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              
              <span className="relative flex items-center space-x-3">
                <span>Start Trading</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>

            <Link
              href="/tutorials"
              className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 bg-transparent border-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 min-w-[180px] sm:min-w-[200px] backdrop-blur-md"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              
              <span className="relative flex items-center space-x-3">
                <span>Learn More</span>
                <BookOpenIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </Link>
          </div>

          {/* Enhanced Stats Grid */}
          <div className={cn(
            "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-2xl lg:max-w-4xl mx-auto transition-all duration-1000 ease-out delay-600",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {stats.map((stat, index) => (
              <div key={index} className="relative text-center p-6 sm:p-8 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40 hover:bg-card/80 hover:border-border/60 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Feature Pills */}
          <div className={cn(
            "flex flex-wrap justify-center gap-3 sm:gap-4 max-w-2xl mx-auto transition-all duration-1000 ease-out delay-800",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-card/50 backdrop-blur-md rounded-full border border-border/40 hover:bg-card/70 hover:border-border/60 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
              <CpuChipIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/80 group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm sm:text-base font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-300">AI Powered</span>
            </div>
            <div className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-card/50 backdrop-blur-md rounded-full border border-border/40 hover:bg-card/70 hover:border-border/60 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
              <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/80 group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm sm:text-base font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-300">Real-time</span>
            </div>
            <div className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-card/50 backdrop-blur-md rounded-full border border-border/40 hover:bg-card/70 hover:border-border/60 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
              <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/80 group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm sm:text-base font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-300">Fast</span>
            </div>
            <div className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-card/50 backdrop-blur-md rounded-full border border-border/40 hover:bg-card/70 hover:border-border/60 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
              <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/80 group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm sm:text-base font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-300">24/7</span>
            </div>
          </div>
        </div>
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
            {/* Modern Trading Dashboard */}
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 md:p-6 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <CpuChipIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">AI Trader Pro</span>
                    <div className="text-xs text-gray-400">Real-time Analytics</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">LIVE</span>
                </div>
              </div>

              {/* Top Crypto/Stock Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                {Object.entries(marketData).map(([symbol, data]) => {
                  const colorMap = {
                    orange: { bg: "bg-orange-500", text: data.change >= 0 ? "text-green-400" : "text-red-400", gradient: data.change >= 0 ? "from-green-500/20 to-green-400/40" : "from-red-500/20 to-red-400/40" },
                    blue: { bg: "bg-blue-500", text: data.change >= 0 ? "text-green-400" : "text-red-400", gradient: data.change >= 0 ? "from-green-500/20 to-green-400/40" : "from-red-500/20 to-red-400/40" },
                    red: { bg: "bg-red-500", text: data.change >= 0 ? "text-green-400" : "text-red-400", gradient: data.change >= 0 ? "from-green-500/20 to-green-400/40" : "from-red-500/20 to-red-400/40" },
                    gray: { bg: "bg-gray-600", text: data.change >= 0 ? "text-green-400" : "text-red-400", gradient: data.change >= 0 ? "from-green-500/20 to-green-400/40" : "from-red-500/20 to-red-400/40" }
                  };
                  
                  const colors = colorMap[data.color];
                  const symbolIcons = { BTC: "₿", ETH: "E", TSLA: "T", AAPL: "A" };
                  
                  return (
                    <div key={symbol} className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded-lg border border-zinc-700/50 transition-all duration-300 hover:bg-zinc-800/70">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                          {symbolIcons[symbol]}
                        </div>
                        <span className="text-sm font-semibold text-white">{symbol}</span>
                      </div>
                      <div className="text-lg font-bold text-white transition-all duration-500">
                        ${data.price.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`text-xs ${colors.text} transition-colors duration-300`}>
                          {data.change >= 0 ? '+' : ''}{data.change}%
                        </div>
                        <div className={`w-12 h-4 bg-gradient-to-r ${colors.gradient} rounded-sm animate-pulse`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Analysis Section */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-4 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-3">
                  <SparklesIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">AI Market Analysis</span>
                  <div className="ml-auto text-xs text-blue-400 animate-pulse">Processing...</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300">Market Sentiment</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(aiAnalysis.sentiment / 100) * 16 * 4}px` }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-400 font-medium transition-all duration-500">
                        {aiAnalysis.sentiment >= 70 ? 'Bullish' : aiAnalysis.sentiment >= 40 ? 'Neutral' : 'Bearish'} {Math.round(aiAnalysis.sentiment)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300">AI Confidence</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(aiAnalysis.confidence / 100) * 16 * 4}px` }}
                        ></div>
                      </div>
                      <span className="text-xs text-blue-400 font-medium transition-all duration-500">
                        {aiAnalysis.confidence >= 80 ? 'High' : aiAnalysis.confidence >= 60 ? 'Medium' : 'Low'} {Math.round(aiAnalysis.confidence)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white transition-all duration-500">94.7%</div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold transition-all duration-500 ${
                    totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {totalPnL >= 0 ? '+' : ''}${Math.round(totalPnL / 1000)}K
                  </div>
                  <div className="text-xs text-gray-400">Total P&L</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">0.8s</div>
                  <div className="text-xs text-gray-400">Exec Time</div>
                </div>
              </div>

              {/* Active Trades */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Positions</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded border border-zinc-700/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white font-medium">BTC Long</span>
                    </div>
                    <div className="text-sm text-green-400">+{Math.abs(marketData.BTC.change).toFixed(1)}%</div>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded border border-zinc-700/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-white font-medium">ETH Long</span>
                    </div>
                    <div className="text-sm text-green-400">+{Math.abs(marketData.ETH.change).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default HeroSection;
