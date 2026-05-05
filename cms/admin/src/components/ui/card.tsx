import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'paper' | 'lined' | 'sticky';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const variants: Record<string, string> = {
  default: 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-paper-sm',
  paper: 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-paper-md',
  lined: 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-paper-sm paper-lined',
  sticky: 'sticky-note',
};

const paddings: Record<string, string> = {
  none: '',
  sm: 'p-3',
  default: 'p-5',
  lg: 'p-6',
};

function Card({
  variant = 'default',
  hover = false,
  padding = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-paper-md hover:-translate-y-px transition-all duration-paper ease-out',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('font-semibold text-warm-charcoal text-lg', className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t border-[hsl(var(--border))] pt-3 mt-3 flex items-center gap-2', className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
