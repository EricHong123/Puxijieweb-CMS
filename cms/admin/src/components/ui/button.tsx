import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-fluent ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-px active:translate-y-0',
        secondary:
          'bg-[#F5F5F5] text-slate-700 hover:bg-[#EBEBEB] shadow-elevation-1 hover:-translate-y-px',
        outline:
          'border border-[hsl(var(--border))] bg-white/60 backdrop-blur-sm text-slate-700 hover:bg-[hsl(var(--accent))] hover:border-primary/40 hover:-translate-y-px',
        ghost:
          'text-slate-600 hover:bg-[hsl(var(--accent))] hover:text-primary',
        destructive:
          'bg-red-500 text-white shadow-elevation-1 hover:bg-red-600 hover:-translate-y-px',
        'destructive-ghost':
          'text-slate-400 hover:text-red-500 hover:bg-red-50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-xs gap-1',
        default: 'h-10 px-4 py-2.5',
        lg: 'h-12 px-6 py-3 text-base gap-2',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
