import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-slate-100 text-slate-600',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        danger: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-700',
        blue: 'bg-[#E8F4FD] text-[#0078D4]',
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
