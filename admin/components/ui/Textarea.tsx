import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 ring-offset-white placeholder:text-gray-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
