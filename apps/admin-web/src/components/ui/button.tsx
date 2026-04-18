import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-space-2 whitespace-nowrap rounded-radius-md text-text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-interactive disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-color-accent text-white hover:opacity-90',
        outline:
          'border border-color-border-default bg-color-bg-elevated text-color-text-primary hover:bg-color-bg-secondary',
        ghost: 'hover:bg-color-bg-secondary text-color-text-primary',
        danger: 'bg-color-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-space-3',
        md: 'h-10 px-space-4',
        lg: 'h-12 px-space-6 text-text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
