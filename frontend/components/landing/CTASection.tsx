/**
 * Call-to-action section with smooth animations and engaging interactive elements
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon, 
  SparklesIcon,
  RocketLaunchIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const FEATURES = [
  'Real-time AI analysis',
  'Advanced risk management',
  'Portfolio optimization',
  'Multi-market support',
  '24/7 trading insights',
  'Automated alerts'
];

export default function CTASection() {
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-grid-white/5" />
        
        {/* Minimal Floating Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <SparklesIcon className="absolute top-1/4 left-1/4 h-6 w-6 text-primary-foreground animate-float" />
          <RocketLaunchIcon className="absolute top-3/4 right-1/4 h-5 w-5 text-primary-foreground animate-float" style={{ animationDelay: '1s' }} />
          <SparklesIcon className="absolute bottom-1/4 left-3/4 h-4 w-4 text-primary-foreground animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Content */}
          <div className={cn(
            "transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full text-primary-foreground/90 text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4" />
              <span>Limited Time Offer</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Ready to Transform
              <span className="block opacity-80 mt-2">
                Your Trading Strategy?
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of traders who've already discovered the power of AI-driven market analysis.
              Start your journey to smarter trading today.
            </p>
          </div>

          {/* Features List */}
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 transition-all duration-1000 ease-out delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-primary-foreground/80"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-5 h-5 bg-background rounded-full flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-foreground" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ease-out delay-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Link
              href="/analysis"
              className="group relative px-8 py-4 bg-background text-foreground rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              {/* Content */}
              <span className="relative flex items-center space-x-2">
                <RocketLaunchIcon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  hovering && "rotate-12 scale-110"
                )} />
                <span>Start Trading Now</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>

            <Link
              href="/tutorials"
              className="px-8 py-4 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-primary-foreground/20"
            >
              Learn More
            </Link>
          </div>

          {/* Bottom Text */}
          <div className={cn(
            "mt-12 text-center transition-all duration-1000 ease-out delay-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <p className="text-primary-foreground/60 text-sm">
              No credit card required • Free 30-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Simplified Background - removed animated dots to fix hydration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Static decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/10 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white/10 rounded-full" />
        <div className="absolute top-2/3 left-3/4 w-1.5 h-1.5 bg-white/10 rounded-full" />
      </div>
    </section>
  );
}