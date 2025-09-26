/**
 * Statistics section with animated counters and impressive metrics
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BentoSection, BentoStat, BentoCTA } from '@/components/ui/BentoGrid';

const STATS = [
  {
    value: 1500000,
    suffix: '+',
    label: 'Trades Analyzed',
    description: 'Real-time market transactions processed daily'
  },
  {
    value: 95.7,
    suffix: '%',
    label: 'Prediction Accuracy',
    description: 'AI model accuracy across multiple timeframes'
  },
  {
    value: 2.3,
    suffix: 's',
    label: 'Analysis Speed',
    description: 'Average time for comprehensive market analysis'
  },
  {
    value: 99.9,
    suffix: '%',
    label: 'System Uptime',
    description: 'Reliable 24/7 trading infrastructure'
  }
];

interface AnimatedCounterProps {
  value: number;
  suffix: string;
  duration?: number;
  start?: boolean;
}

function AnimatedCounter({ value, suffix, duration = 2000, start = false }: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = value * easeOut;
      
      setCurrentValue(newValue);

      if (now < endTime) {
        requestAnimationFrame(updateValue);
      } else {
        setCurrentValue(value);
      }
    };

    updateValue();
  }, [value, duration, start]);

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    } else {
      return val.toFixed(1);
    }
  };

  return (
    <span className="tabular-nums">
      {value >= 1000 ? formatValue(currentValue) : currentValue.toFixed(1)}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const [mounted, setMounted] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStartAnimation(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <BentoSection 
      ref={sectionRef}
      title="Trusted by Traders Worldwide"
      subtitle="Join thousands of traders who rely on our AI-powered platform for intelligent market decisions"
      className="bg-secondary/30"
    >
      {STATS.map((stat, index) => (
        <BentoStat key={index}>
          <div className={cn(
            "text-center transition-all duration-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: `${index * 200}ms` }}>
            {/* Animated Value */}
            <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
              <AnimatedCounter 
                value={stat.value} 
                suffix={stat.suffix}
                start={startAnimation}
                duration={2000 + index * 300}
              />
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-2">
              {stat.label}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stat.description}
            </p>
          </div>
        </BentoStat>
      ))}
      
      {/* Bottom CTA in bento grid */}
      <BentoCTA>
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center text-sm font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold">
              Join 10,000+ Active Traders
            </p>
            <p className="text-sm opacity-80">
              Start your AI-powered trading journey today
            </p>
          </div>
        </div>
      </BentoCTA>
    </BentoSection>
  );
}