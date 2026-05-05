import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-paper ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-pastel-blue text-white shadow-paper-sm hover:shadow-paper-md hover:-translate-y-px active:translate-y-0',
        secondary:
          'bg-[hsl(var(--secondary))] text-warm-charcoal hover:bg-[hsl(var(--accent))] shadow-paper-xs hover:shadow-paper-sm hover:-translate-y-px',
        outline:
          'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-warm-charcoal hover:bg-[hsl(var(--accent))] hover:border-pastel-blue/40 hover:-translate-y-px shadow-paper-xs',
        ghost:
          'text-warm-charcoal-muted hover:bg-[hsl(var(--accent))] hover:text-pastel-blue',
        destructive:
          'bg-pastel-rose text-white shadow-paper-sm hover:shadow-paper-md hover:-translate-y-px',
        'destructive-ghost':
          'text-warm-charcoal-muted hover:text-pastel-rose hover:bg-pastel-rose/5',
        link: 'text-pastel-blue underline-offset-4 hover:underline',
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
