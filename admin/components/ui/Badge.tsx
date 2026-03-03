import { cn, getStatusColor } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status';
  status?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
    
    const variantStyles = variant === 'status' && status
      ? getStatusColor(status)
      : 'bg-gray-100 text-gray-800';

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles, className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
