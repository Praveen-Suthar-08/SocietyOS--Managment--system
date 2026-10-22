'use client';

import * as React from 'react';
import { Search, Building, Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Canonical list of all 160 residential units in Greenfield Heights + Common Society Areas
export function getAll160Units(): string[] {
  const units: string[] = [];
  const blocks = ['A', 'B', 'C', 'D'];
  blocks.forEach((block) => {
    for (let floor = 1; floor <= 10; floor++) {
      for (let unit = 1; unit <= 4; unit++) {
        units.push(`${block}-${floor}${unit.toString().padStart(2, '0')}`);
      }
    }
  });
  return units;
}

export const COMMON_SOCIETY_AREAS = [
  'Gate 1 (Main Compound Ingress)',
  'Gate 2 (Service & Deliveries)',
  'Gate 3 (South Egress)',
  'Grand Clubhouse Banquet Hall',
  'Resident Gym & Fitness Studio',
  'Swimming Pool & Deck',
  'Floodlit Tennis Court',
  'Basement 1 Parking & Sump',
  'Basement 2 Services',
  'Tower A Lift Lobby',
  'Tower B Lift Lobby',
  'Tower C Lift Lobby',
  'Tower D Lift Lobby',
  'Central Park & Children Play Area',
];

interface UnitSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  includeCommonAreas?: boolean;
  className?: string;
  required?: boolean;
}

export function UnitSearchSelect({
  value,
  onChange,
  label = 'Target Unit / Flat *',
  placeholder = 'Select or search unit (e.g. A-402, B-101)...',
  includeCommonAreas = true,
  className,
  required = false,
}: UnitSearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const allUnits = React.useMemo(() => getAll160Units(), []);

  const options = React.useMemo(() => {
    const list = [...allUnits];
    if (includeCommonAreas) {
      list.push(...COMMON_SOCIETY_AREAS);
    }
    return list;
  }, [allUnits, includeCommonAreas]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((item) => item.toLowerCase().includes(q));
  }, [options, search]);

  // Close on outside click
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
    <div className={cn('relative space-y-1', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-ink block">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-sm flex items-center justify-between cursor-pointer transition-colors shadow-2xs hover:border-brand',
          isOpen && 'border-brand ring-2 ring-brand/20',
          !value && 'text-ink-muted'
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <Building className="w-4 h-4 text-brand flex-shrink-0" />
          <span className={cn('font-semibold truncate', value ? 'text-ink' : 'text-ink-muted')}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-ink-muted transition-transform', isOpen && 'rotate-180')} />
      </div>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border-neutral rounded-xl shadow-2xl z-50 p-2 space-y-2 animate-in fade-in slide-in-from-top-1 max-h-72 flex flex-col">
          {/* Search Box */}
          <div className="relative flex-shrink-0">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-ink-muted" />
            <input
              type="text"
              autoFocus
              placeholder="Search 160 units or facilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-surface-muted border border-border-neutral text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-ink-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Tower Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold flex-shrink-0">
            {['ALL', 'A', 'B', 'C', 'D'].map((tower) => {
              const isActive = (tower === 'ALL' && !search) || (tower !== 'ALL' && search.startsWith(`${tower}-`));
              return (
                <button
                  key={tower}
                  type="button"
                  onClick={() => setSearch(tower === 'ALL' ? '' : `${tower}-`)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors border',
                    isActive
                      ? 'bg-brand text-white border-brand shadow-2xs font-bold'
                      : 'bg-surface-muted hover:bg-brand/10 hover:text-brand text-ink-muted border-border-neutral'
                  )}
                >
                  {tower === 'ALL' ? 'All (160)' : `Tower ${tower}`}
                </button>
              );
            })}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 divide-y divide-border-neutral/40 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-ink-muted">
                No units or facilities matching &quot;{search}&quot;
              </div>
            ) : (
              filteredOptions.map((unit) => {
                const isSelected = value === unit;
                const isArea = COMMON_SOCIETY_AREAS.includes(unit);

                return (
                  <div
                    key={unit}
                    onClick={() => {
                      onChange(unit);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'px-2.5 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-ink hover:bg-surface-muted',
                      isArea && 'italic'
                    )}
                  >
                    <span className="truncate">{unit}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand flex-shrink-0 ml-1" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
