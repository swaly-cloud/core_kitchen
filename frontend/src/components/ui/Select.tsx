'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-stone-900 transition-colors',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50',
          'appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%237c786f\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")] bg-[right_0.65rem_center] bg-no-repeat pr-9',
          error
            ? 'border-danger/60 focus-visible:border-danger focus-visible:ring-danger/15'
            : 'border-stone-200 hover:border-stone-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
