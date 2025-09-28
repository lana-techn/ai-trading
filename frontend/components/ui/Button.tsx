import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          
          // Size variants
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
            'h-14 px-8 text-lg': size === 'xl',
          },
          
          // Color variants (use single string to avoid duplicate keys)
          (() => {
            switch (variant) {
              case 'primary':
                return 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md';
              case 'secondary':
                return 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border';
              case 'success':
                return 'bg-success text-success-foreground hover:bg-success/90 shadow-sm';
              case 'destructive':
                return 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm';
              case 'warning':
                return 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm';
              case 'outline':
                return 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground';
              case 'ghost':
                return 'text-foreground hover:bg-accent hover:text-accent-foreground';
              case 'link':
                return 'text-primary underline-offset-4 hover:underline';
              case 'default':
              default:
                return 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border';
            }
          })(),
          
          // Full width
          {
            'w-full': fullWidth,
          },
          
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };