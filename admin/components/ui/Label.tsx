import { cn } from '@/lib/utils';
import { LabelHTMLAttributes, forwardRef } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium text-gray-700 mb-1 block',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';
