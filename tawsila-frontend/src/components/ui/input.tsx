import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex w-full min-h-[44px] rounded-xl border bg-[var(--surface)] px-3 py-2 text-sm',
            'transition-colors placeholder:text-[var(--text-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-danger focus-visible:ring-danger/50 focus-visible:border-danger' : 'border-[var(--border)] hover:border-[var(--border-hover)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger animate-fade-up">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
