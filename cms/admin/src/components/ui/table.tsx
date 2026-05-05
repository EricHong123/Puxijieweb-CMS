import { cn } from '@/lib/utils';
import React from 'react';

function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cn('w-full text-sm', className)} {...props}>
      {children}
    </table>
  );
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))]', className)} {...props} />;
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('text-left px-4 py-3 font-medium text-warm-charcoal-muted text-xs', className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-[hsl(var(--border))]', className)} {...props} />;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
}

function TableRow({ className, isSelected, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors duration-paper',
        isSelected ? 'bg-pastel-blue/[0.06]' : 'hover:bg-[hsl(var(--accent))]',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />;
}

export { Table, TableHeader, TableHead, TableBody, TableRow, TableCell };
