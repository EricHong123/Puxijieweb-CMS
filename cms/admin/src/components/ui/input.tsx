import { cn } from '@/lib/utils';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 rounded-lg border text-sm bg-[hsl(var(--card))]',
        'placeholder:text-[hsl(var(--muted-foreground))]',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]',
        'transition-all duration-paper shadow-paper-xs',
        error && 'border-pastel-rose/50 focus:ring-pastel-rose/20 focus:border-pastel-rose/50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full px-3 py-2.5 rounded-lg border text-sm bg-[hsl(var(--card))]',
      'placeholder:text-[hsl(var(--muted-foreground))]',
      'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]',
      'transition-all duration-paper resize-y shadow-paper-xs',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 rounded-lg border text-sm bg-[hsl(var(--card))]',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]',
        'transition-all duration-paper shadow-paper-xs',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, error, required, htmlFor, children, className }: FormFieldProps) {
  return (
    <div className={cn(className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-warm-charcoal mb-1.5">
        {label}
        {required && <span className="text-pastel-rose ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-pastel-rose mt-1">{error}</p>}
    </div>
  );
}

export { Input, Textarea, Select, FormField };
