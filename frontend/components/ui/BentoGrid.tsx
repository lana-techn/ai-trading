/**
 * Modern Bento Grid Layout Component
 * Provides flexible grid system with various sizes and arrangements
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoGridItemProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  row?: 'span-1' | 'span-2' | 'span-3' | 'span-4';
  col?: 'span-1' | 'span-2' | 'span-3' | 'span-4';
  priority?: boolean; // For featured items
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid auto-rows-[200px] grid-cols-1 gap-4",
      "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      "w-full max-w-7xl mx-auto",
      className
    )}>
      {children}
    </div>
  );
}

export function BentoGridItem({ 
  children, 
  className, 
  size = 'md',
  row,
  col,
  priority = false 
}: BentoGridItemProps) {
  // Define size classes
  const sizeClasses = {
    sm: "md:col-span-1 md:row-span-1",
    md: "md:col-span-1 md:row-span-2",
    lg: "md:col-span-2 md:row-span-2",
    xl: "md:col-span-2 md:row-span-3 lg:col-span-3 lg:row-span-2",
    full: "md:col-span-2 lg:col-span-3 xl:col-span-4 md:row-span-1"
  };

  // Row span classes
  const rowClasses = {
    'span-1': 'row-span-1',
    'span-2': 'row-span-2', 
    'span-3': 'row-span-3',
    'span-4': 'row-span-4'
  };

  // Column span classes
  const colClasses = {
    'span-1': 'col-span-1',
    'span-2': 'md:col-span-2',
    'span-3': 'lg:col-span-3', 
    'span-4': 'xl:col-span-4'
  };

  return (
    <div className={cn(
      // Base styling
      "group relative overflow-hidden rounded-3xl border border-border",
      "bg-card text-card-foreground shadow-lg",
      "transition-all duration-300 ease-out",
      
      // Hover effects
      "hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/50",
      "hover:scale-[1.02] hover:-translate-y-1",
      "hover:border-border-accent",
      
      // Size classes
      sizeClasses[size],
      
      // Custom row/col spans
      row && rowClasses[row],
      col && colClasses[col],
      
      // Priority styling for featured items
      priority && [
        "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
        "bg-gradient-to-br from-card via-card to-accent/5"
      ],
      
      className
    )}>
      {/* Background pattern for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full p-6 flex flex-col">
        {children}
      </div>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// Specialized bento components for different content types
export function BentoHero({ children, className }: BentoGridItemProps) {
  return (
    <BentoGridItem 
      size="xl" 
      priority 
      className={cn("items-center justify-center text-center", className)}
    >
      {children}
    </BentoGridItem>
  );
}

export function BentoFeature({ children, className }: BentoGridItemProps) {
  return (
    <BentoGridItem 
      size="lg" 
      className={cn("relative overflow-hidden", className)}
    >
      {children}
    </BentoGridItem>
  );
}

export function BentoStat({ children, className }: BentoGridItemProps) {
  return (
    <BentoGridItem 
      size="sm" 
      className={cn("items-center justify-center text-center", className)}
    >
      {children}
    </BentoGridItem>
  );
}

export function BentoCard({ children, className }: BentoGridItemProps) {
  return (
    <BentoGridItem 
      size="md" 
      className={cn("", className)}
    >
      {children}
    </BentoGridItem>
  );
}

export function BentoCTA({ children, className }: BentoGridItemProps) {
  return (
    <BentoGridItem 
      size="full" 
      className={cn(
        "items-center justify-center text-center",
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
        "border-primary/20",
        className
      )}
    >
      {children}
    </BentoGridItem>
  );
}

// Layout templates
export function BentoSection({ 
  title, 
  subtitle, 
  children, 
  className 
}: {
  title?: string;
  subtitle?: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-24 px-4 sm:px-6 lg:px-8", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-16">
          {title && (
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <BentoGrid>
        {children}
      </BentoGrid>
    </section>
  );
}