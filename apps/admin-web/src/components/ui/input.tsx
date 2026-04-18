import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-10 w-full rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary placeholder:text-color-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-interactive disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
