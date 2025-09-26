'use client';

import HeroSection from '@/components/landing/HeroSection';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import TradingDashboard from '@/components/trading/TradingDashboard';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Container Scroll Animation & Real-time Data */}
      <HeroSection />
      
      {/* AI Trading Dashboard */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Live AI Trading Analytics
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real-time market data powered by advanced AI algorithms
            </p>
          </div>
          <TradingDashboard />
        </div>
      </section>
      
      {/* Scroll Indicator */}
      <ScrollIndicator />
      
      {/* Features Section */}
      <div data-section="features">
        <FeaturesSection />
      </div>
      
      {/* Statistics Section */}
      <StatsSection />
      
      {/* Call-to-Action Section */}
      <CTASection />
    </div>
  );
}
