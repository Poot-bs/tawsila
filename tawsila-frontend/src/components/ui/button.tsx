import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg hover:brightness-110 active:brightness-95',
  secondary:
    'bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] active:bg-[var(--border-hover)]',
  ghost:
    'text-[var(--text)] hover:bg-[var(--surface-hover)] active:bg-[var(--border)]',
  danger:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/80',
  outline:
    'border border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[32px] rounded-lg',
  md: 'px-4 py-2.5 text-sm min-h-[44px] rounded-xl',
  lg: 'px-6 py-3.5 text-base min-h-[54px] rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
          variantClasses[variant],
          sizeClasses[size],
          isLoading && 'relative text-transparent',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
