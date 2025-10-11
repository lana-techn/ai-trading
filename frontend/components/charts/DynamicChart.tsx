'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Skeleton loading untuk charts
function ChartSkeleton() {
  return (
    <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading chart...</div>
    </div>
  );
}

// Dynamic import untuk ApexCharts dengan loading fallback
export const DynamicApexChart = dynamic(
  () => import('react-apexcharts'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>;

// Dynamic import untuk Lightweight Charts dengan loading fallback
export const DynamicLightweightChart = dynamic(
  () => import('lightweight-charts').then(mod => ({ default: mod.createChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as any;
