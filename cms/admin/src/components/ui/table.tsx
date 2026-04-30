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
  return <thead className={cn('bg-[#FAFAFA] border-b border-[#EBEBEB]', className)} {...props} />;
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('text-left px-4 py-3 font-medium text-slate-600 text-xs', className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-[#EBEBEB]', className)} {...props} />;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
}

function TableRow({ className, isSelected, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        isSelected ? 'bg-primary/[0.04]' : 'hover:bg-[#FAFAFA]/80',
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
