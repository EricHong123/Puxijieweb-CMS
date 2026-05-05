import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-pastel-blue/10 text-pastel-blue ring-1 ring-pastel-blue/15',
        secondary: 'bg-[hsl(var(--secondary))] text-warm-charcoal-muted',
        success: 'bg-pastel-green/10 text-pastel-green ring-1 ring-pastel-green/15',
        warning: 'bg-pastel-amber/10 text-pastel-amber ring-1 ring-pastel-amber/15',
        danger: 'bg-pastel-rose/10 text-pastel-rose ring-1 ring-pastel-rose/15',
        purple: 'bg-pastel-lavender/10 text-pastel-lavender ring-1 ring-pastel-lavender/15',
        blue: 'bg-pastel-blue/10 text-pastel-blue ring-1 ring-pastel-blue/15',
      },
      interactive: {
        true: 'cursor-pointer hover:opacity-80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, interactive, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, interactive, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
