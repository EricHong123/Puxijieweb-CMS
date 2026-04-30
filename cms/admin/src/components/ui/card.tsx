import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'acrylic';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const variants: Record<string, string> = {
  default: 'bg-white border border-[hsl(var(--border))] shadow-elevation-1',
  acrylic: 'acrylic shadow-acrylic',
};

const paddings: Record<string, string> = {
  none: '',
  sm: 'p-4',
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
        hover && 'hover:shadow-elevation-2 hover:-translate-y-px transition-all duration-fluent ease-out',
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
  return <h2 className={cn('font-semibold text-slate-800 text-lg', className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t border-[#EBEBEB] pt-3 mt-3 flex items-center gap-2', className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
