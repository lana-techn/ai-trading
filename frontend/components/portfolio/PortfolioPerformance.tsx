'use client';

import { Card, CardContent } from '@/components/ui';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface PortfolioPerformanceProps {
  portfolioData: any;
}

export default function PortfolioPerformance({ portfolioData }: PortfolioPerformanceProps) {
  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowTrendingUpIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Performance Charts</h3>
        </div>
        <div className="text-center py-20">
          <ArrowTrendingUpIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-muted-foreground">Performance Charts Coming Soon</p>
          <p className="text-muted-foreground">Advanced performance analytics and charts will be available here</p>
        </div>
      </CardContent>
    </Card>
  );
}