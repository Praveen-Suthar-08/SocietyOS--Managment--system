'use client';

import * as React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-flex items-center', className)} ref={containerRef}>
      {/* Quick compact selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer border border-border-neutral focus-visible:ring-2 focus-visible:ring-brand"
        aria-label={`Theme: ${theme}. Click to change theme.`}
        aria-expanded={isOpen}
      >
        {theme === 'light' && <Sun className="w-4 h-4 text-amber-600" />}
        {theme === 'dark' && <Moon className="w-4 h-4 text-emerald-400" />}
        {theme === 'system' && <Laptop className="w-4 h-4 text-ink-muted" />}
        <span className="sr-only">Toggle theme</span>
      </button>

      {/* Accessible theme selection dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-surface border border-border-neutral shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
              theme === 'light'
                ? 'bg-brand-subtle text-brand font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
            )}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Light</span>
            {theme === 'light' && <span className="ml-auto text-[10px] text-brand">✓</span>}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
              theme === 'dark'
                ? 'bg-brand-subtle text-brand font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
            )}
          >
            <Moon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dark</span>
            {theme === 'dark' && <span className="ml-auto text-[10px] text-brand">✓</span>}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
              theme === 'system'
                ? 'bg-brand-subtle text-brand font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
            )}
          >
            <Laptop className="w-3.5 h-3.5 text-ink-muted" />
            <span>System</span>
            {theme === 'system' && <span className="ml-auto text-[10px] text-brand">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
