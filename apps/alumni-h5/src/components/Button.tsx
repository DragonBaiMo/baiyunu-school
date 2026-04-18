import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-space-2 rounded-radius-md px-space-4 py-space-2 text-text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-interactive disabled:opacity-50 cursor-pointer',
          variant === 'primary' && 'bg-color-accent text-white hover:opacity-90',
          variant === 'ghost' &&
            'bg-color-bg-elevated text-color-text-primary border border-color-border-default hover:bg-color-bg-secondary',
        ),
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
