'use client';

import * as React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionStatus = 'live' | 'polling' | 'disconnected';

interface ConnectionIndicatorProps {
  status?: ConnectionStatus;
  lastUpdated?: Date;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ConnectionIndicator({
  status = 'live',
  lastUpdated,
  className,
  onRefresh,
  isRefreshing = false,
}: ConnectionIndicatorProps) {
  const statusConfig = {
    live: {
      color: 'bg-[#166534]',
      badgeBg: 'bg-[#EAF3ED] border-[#B7D5C4]',
      textColor: 'text-[#276749]',
      label: 'Live Realtime',
      icon: Wifi,
    },
    polling: {
      color: 'bg-[#B86A2B]',
      badgeBg: 'bg-[#FDF6EE] border-[#F8DCBF]',
      textColor: 'text-[#B86A2B]',
      label: 'Polling Active (5s)',
      icon: RefreshCw,
    },
    disconnected: {
      color: 'bg-[#B42318]',
      badgeBg: 'bg-[#FEF3F2] border-[#FECDCA]',
      textColor: 'text-[#B42318]',
      label: 'Disconnected',
      icon: WifiOff,
    },
  };

  const current = statusConfig[status];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border shadow-2xs select-none',
        current.badgeBg,
        current.textColor,
        className
      )}
      title={`Connection state: ${current.label}${lastUpdated ? ` · Last checked: ${lastUpdated.toLocaleTimeString()}` : ''}`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'live' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#276749] opacity-75" />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.color)} />
      </span>
      <Icon className="w-3 h-3 text-current" aria-hidden="true" />
      <span className="hidden sm:inline font-mono text-[11px] font-semibold">{current.label}</span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-1 text-current opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
          aria-label="Refresh operational state"
        >
          <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
        </button>
      )}
    </div>
  );
}
