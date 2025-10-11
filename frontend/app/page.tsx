'use client';

import HeroSection from '@/components/landing/HeroSection';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Container Scroll Animation & Real-time Trading Dashboard */}
      <HeroSection />
      
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
