/**
 * Skeleton loader components for improved loading UX
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = true, 
  animate = true,
  style,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
        animate && 'animate-pulse',
        rounded && 'rounded-md',
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

// Pre-built skeleton components for common UI patterns
export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-3">
        <Skeleton width={40} height={40} className="rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="90%" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 space-y-4 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={20} width={120} />
          <Skeleton height={14} width={80} />
        </div>
        <div className="flex space-x-2">
          <Skeleton width={60} height={32} rounded />
          <Skeleton width={60} height={32} rounded />
        </div>
      </div>
      <Skeleton height={300} width="100%" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={16} width="80%" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
          {Array.from({ length: 4 }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={16} width={`${60 + Math.random() * 40}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function NavbarSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Skeleton width={40} height={40} className="rounded-xl" />
              <div className="space-y-1">
                <Skeleton height={16} width={100} />
                <Skeleton height={10} width={80} />
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width={80} height={36} className="rounded-xl" />
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Skeleton width={36} height={36} className="rounded-xl" />
              <Skeleton width={36} height={36} className="rounded-xl lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureCardSkeleton() {
  return (
    <div className="p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-xl">
      <div className="space-y-6">
        {/* Icon */}
        <Skeleton width={56} height={56} className="rounded-xl" />
        
        {/* Title */}
        <Skeleton height={24} width="70%" />
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="90%" />
          <Skeleton height={16} width="80%" />
        </div>
        
        {/* CTA */}
        <div className="flex items-center space-x-2">
          <Skeleton height={14} width={80} />
          <Skeleton width={16} height={16} className="rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-xl text-center">
      <Skeleton height={48} width={120} className="mx-auto mb-2" />
      <Skeleton height={20} width={100} className="mx-auto mb-2" />
      <Skeleton height={14} width="80%" className="mx-auto" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <Skeleton height={64} width="80%" className="mx-auto" />
            <Skeleton height={64} width="60%" className="mx-auto" />
          </div>
          
          {/* Subtitle */}
          <div className="space-y-2">
            <Skeleton height={20} width="100%" className="mx-auto max-w-3xl" />
            <Skeleton height={20} width="90%" className="mx-auto max-w-3xl" />
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton width={180} height={56} className="rounded-2xl" />
            <Skeleton width={140} height={56} className="rounded-2xl" />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton height={32} width="80%" className="mx-auto" />
                <Skeleton height={14} width="60%" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Shimmering animation variant
export function ShimmerSkeleton({ 
  className, 
  width, 
  height, 
  rounded = true,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
        rounded && 'rounded-md',
        className
      )}
      style={{ width, height }}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
}

// Pulse animation variant with custom colors
export function PulseSkeleton({ 
  className, 
  width, 
  height, 
  rounded = true,
  color = 'gray',
  ...props 
}: SkeletonProps & { color?: 'gray' | 'blue' | 'green' | 'purple' }) {
  const colorClasses = {
    gray: 'bg-gray-200 dark:bg-gray-700',
    blue: 'bg-blue-200 dark:bg-blue-800',
    green: 'bg-green-200 dark:bg-green-800',
    purple: 'bg-purple-200 dark:bg-purple-800',
  };

  return (
    <div
      className={cn(
        colorClasses[color],
        'animate-pulse',
        rounded && 'rounded-md',
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}