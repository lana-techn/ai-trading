/**
 * Features showcase section with interactive cards and animations
 */

'use client';

import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/lib/performance';
import { FeatureCardSkeleton } from '@/components/ui/skeleton';
import { BentoSection, BentoFeature, BentoCard } from '@/components/ui/BentoGrid';

const FEATURES = [
  {
    icon: CpuChipIcon,
    title: 'Hybrid AI Models',
    description: 'Powered by Qwen and Gemini AI for comprehensive market analysis and intelligent trading decisions.',
    size: 'lg' as const,
    gradient: 'from-secondary to-accent/20'
  },
  {
    icon: ChartBarIcon,
    title: 'Real-time Analytics', 
    description: 'Live market data processing with advanced technical indicators and pattern recognition.',
    size: 'md' as const,
    gradient: 'from-accent/10 to-secondary/30'
  },
  {
    icon: BoltIcon,
    title: 'Lightning Fast',
    description: 'Sub-second analysis and execution with optimized algorithms for high-frequency trading.',
    size: 'md' as const,
    gradient: 'from-secondary/50 to-accent/10'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Risk Management',
    description: 'Advanced risk assessment and portfolio protection with automated stop-loss mechanisms.',
    size: 'lg' as const,
    gradient: 'from-accent/20 to-secondary'
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Smart Predictions',
    description: 'Machine learning algorithms that adapt and improve prediction accuracy over time.',
    size: 'md' as const,
    gradient: 'from-secondary/30 to-accent/20'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'AI Assistant',
    description: 'Intelligent chat interface for market insights, strategy discussions, and trading guidance.',
    size: 'md' as const,
    gradient: 'from-accent/15 to-secondary/40'
  }
];

const FeaturesSection = memo(function FeaturesSection() {
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 });

  // Memoize features array
  const features = useMemo(() => FEATURES, []);

  const staggerAnimations = useCallback(() => {
    features.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, index]);
      }, index * 200);
    });
  }, [features]);

  useEffect(() => {
    setMounted(true);
    
    if (hasIntersected) {
      staggerAnimations();
    }
  }, [hasIntersected, staggerAnimations]);

  // Show skeleton while loading
  if (!hasIntersected) {
    return (
      <section ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-black dark:to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeatureCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <BentoSection 
      title="Powerful Features"
      subtitle="Experience cutting-edge AI technology designed to revolutionize your trading strategy"
      className="bg-background"
    >
      {features.map((feature, index) => {
        const Component = feature.size === 'lg' ? BentoFeature : BentoCard;
        
        return (
          <Component
            key={index}
            className={cn(
              "bg-gradient-to-br",
              feature.gradient,
              "transition-all duration-700 ease-out",
              visibleCards.includes(index) 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex flex-col justify-between h-full">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <feature.icon className="h-7 w-7" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover indicator */}
              <div className="mt-6 flex items-center text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowTrendingUpIcon className="h-4 w-4 ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Component>
        );
      })}
    </BentoSection>
  );
});

export default FeaturesSection;
