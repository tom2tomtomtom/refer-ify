'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clamped = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    return (
      <div
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
        {...props}
      >
        <div
          className="h-full w-full translate-x-[-100%] rounded-full bg-primary transition-transform"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';


