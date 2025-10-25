'use client';

import { useState, Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui';
import {
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Lazy load section components for better performance
const OverviewSection = lazy(() => import('./sections/OverviewSection'));
const ResearchSection = lazy(() => import('./sections/ResearchSection'));
const ObjectivesSection = lazy(() => import('./sections/ObjectivesSection'));
const ResultsSection = lazy(() => import('./sections/ResultsSection'));
const InnovationSection = lazy(() => import('./sections/InnovationSection'));

// Loading skeleton component
function SectionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-background-secondary rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type TabType = 'overview' | 'research' | 'objectives' | 'results' | 'innovation';

const tabs = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'research', label: 'Research Questions', icon: LightBulbIcon },
  { id: 'objectives', label: 'Objectives', icon: CheckCircleIcon },
  { id: 'results', label: 'Key Results', icon: ArrowTrendingUpIcon },
  { id: 'innovation', label: 'Innovation', icon: SparklesIcon },
] as const;

export default function AnalyticsResultsView() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection />;
      case 'research':
        return <ResearchSection />;
      case 'objectives':
        return <ObjectivesSection />;
      case 'results':
        return <ResultsSection />;
      case 'innovation':
        return <InnovationSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header Section */}
      <Card className="border-border bg-gradient-to-br from-card via-card to-card/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardContent className="relative p-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <ChartBarIcon className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Analysis & Results
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                Data-driven insights and research results of NousTrade platform - AI Trading Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card-hover text-muted-foreground hover:text-foreground hover:bg-background-tertiary'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Content Section with Suspense */}
      <Suspense fallback={<SectionSkeleton />}>
        {renderSection()}
      </Suspense>
    </div>
  );
}
