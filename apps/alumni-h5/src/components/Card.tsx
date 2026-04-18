import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        clsx(
          'rounded-radius-lg border border-color-border-default bg-color-bg-elevated p-space-4 shadow-shadow-sm',
        ),
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
