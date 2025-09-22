import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'warning' | 'info' | 'outline' | 'trading-bullish' | 'trading-bearish' | 'trading-neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center rounded-full font-medium transition-all duration-200',
          
          // Size variants
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-sm': size === 'lg',
          },
          
          // Color variants
          {
            // Default
            'bg-muted text-muted-foreground border border-border': variant === 'default',
            
            // Primary
            'bg-primary text-primary-foreground': variant === 'primary',
            
            // Secondary
            'bg-secondary text-secondary-foreground border border-border': variant === 'secondary',
            
            // Success
            'bg-success text-success-foreground': variant === 'success',
            
            // Destructive
            'bg-destructive text-destructive-foreground': variant === 'destructive',
            
            // Warning
            'bg-warning text-warning-foreground': variant === 'warning',
            
            // Info
            'bg-info text-info-foreground': variant === 'info',
            
            // Outline
            'border-2 border-border text-foreground bg-transparent': variant === 'outline',
            
            // Trading specific
            'bg-trading-bullish-bg text-trading-bullish border border-trading-bullish/20': variant === 'trading-bullish',
            'bg-trading-bearish-bg text-trading-bearish border border-trading-bearish/20': variant === 'trading-bearish',
            'bg-trading-neutral-bg text-trading-neutral border border-trading-neutral/20': variant === 'trading-neutral',
          },
          
          className
        )}
        {...props}
      >
        {dot && (
          <div 
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              {
                'bg-muted-foreground': variant === 'default',
                'bg-primary-foreground': variant === 'primary',
                'bg-secondary-foreground': variant === 'secondary',
                'bg-success-foreground': variant === 'success',
                'bg-destructive-foreground': variant === 'destructive',
                'bg-warning-foreground': variant === 'warning',
                'bg-info-foreground': variant === 'info',
                'bg-foreground': variant === 'outline',
                'bg-trading-bullish': variant === 'trading-bullish',
                'bg-trading-bearish': variant === 'trading-bearish',
                'bg-trading-neutral': variant === 'trading-neutral',
              }
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

// Predefined trading action badges
const TradingActionBadge = React.forwardRef<HTMLDivElement, Omit<BadgeProps, 'variant'> & { action: 'buy' | 'sell' | 'hold' }>(
  ({ action, className, ...props }, ref) => {
    const variantMap = {
      buy: 'trading-bullish' as const,
      sell: 'trading-bearish' as const,
      hold: 'trading-neutral' as const,
    };

    return (
      <Badge 
        ref={ref}
        variant={variantMap[action]}
        className={className}
        {...props}
      >
        {action.toUpperCase()}
      </Badge>
    );
  }
);
TradingActionBadge.displayName = 'TradingActionBadge';

// Status badge with dot indicator
const StatusBadge = React.forwardRef<HTMLDivElement, Omit<BadgeProps, 'dot'> & { status: 'online' | 'offline' | 'warning' | 'error' }>(
  ({ status, className, ...props }, ref) => {
    const variantMap = {
      online: 'success' as const,
      offline: 'default' as const,
      warning: 'warning' as const,
      error: 'destructive' as const,
    };

    const textMap = {
      online: 'Online',
      offline: 'Offline',
      warning: 'Warning',
      error: 'Error',
    };

    return (
      <Badge
        ref={ref}
        variant={variantMap[status]}
        dot
        className={className}
        {...props}
      >
        {textMap[status]}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { Badge, TradingActionBadge, StatusBadge };