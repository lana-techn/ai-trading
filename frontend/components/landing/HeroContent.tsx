'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon, 
  CpuChipIcon, 
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '2.3s', label: 'Avg Response' },
  { value: '95%', label: 'Accuracy' },
  { value: '24/7', label: 'Available' }
];

interface HeroContentProps {
  mounted: boolean;
}

export function HeroContent({ mounted }: HeroContentProps) {
  const stats = useMemo(() => STATS, []);

  return (
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
  );
}
