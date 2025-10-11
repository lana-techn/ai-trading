'use client';

import { useMemo } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const FLOATING_ICONS = [
  { icon: CpuChipIcon, delay: 0, x: 10, y: 20 },
  { icon: ChartBarIcon, delay: 1000, x: 80, y: 30 },
  { icon: BoltIcon, delay: 2000, x: 70, y: 70 },
  { icon: SparklesIcon, delay: 1500, x: 20, y: 60 },
];

interface FloatingIconsProps {
  mounted: boolean;
  hasIntersected: boolean;
}

export function FloatingIcons({ mounted, hasIntersected }: FloatingIconsProps) {
  const floatingIcons = useMemo(() => FLOATING_ICONS, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {floatingIcons.map((item, index) => (
        <div
          key={index}
          className={cn(
            "absolute transition-all duration-1000 ease-out opacity-[0.06] dark:opacity-[0.04]",
            mounted && hasIntersected && "animate-float-slow"
          )}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}ms`,
            transform: mounted ? 'translate(0, 0)' : 'translate(50px, 50px)'
          }}
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-primary/5 rounded-full blur-sm" />
            <item.icon className="relative h-12 w-12 text-primary/20 dark:text-primary/15" />
          </div>
        </div>
      ))}
    </div>
  );
}
