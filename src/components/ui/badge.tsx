import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'brand' | 'notice' | 'destructive' | 'outline' | 'neutral';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surface-muted text-ink border-border-neutral',
    brand: 'bg-brand/10 text-brand border-brand/25',
    notice: 'bg-notice/10 text-notice border-notice/25',
    destructive: 'bg-emergency/10 text-emergency border-emergency/25',
    outline: 'bg-transparent text-ink border-border-neutral',
    neutral: 'bg-surface-elevated text-ink-muted border-border-neutral',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
