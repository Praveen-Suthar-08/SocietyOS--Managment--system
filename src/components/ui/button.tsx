import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'emergency' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'emergency';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.99] select-none';

    const variants = {
      primary: 'bg-[#276749] bg-brand text-white hover:bg-brand-hover shadow-sm',
      secondary: 'bg-surface text-ink border border-border-neutral hover:bg-surface-muted shadow-sm',
      destructive: 'bg-emergency-subtle text-emergency border border-emergency/30 hover:bg-emergency/20',
      emergency: 'bg-[#B42318] bg-emergency text-white hover:bg-red-700 shadow-md font-semibold tracking-wide',
      outline: 'bg-transparent text-ink border border-border-neutral hover:bg-surface-muted',
      ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-muted',
      link: 'text-brand underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-10 w-10 p-0',
      emergency: 'h-14 px-8 text-base gap-3 rounded-xl',
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
