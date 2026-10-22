import * as React from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Home,
  UserCheck,
  Wrench,
  Wifi,
  WifiOff,
  HelpCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'RESPONDER_ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'VACANT'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'MAINTENANCE'
  | 'ONLINE'
  | 'OFFLINE'
  | 'UNCONFIGURED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'
  | 'USED';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
  labelOverride?: string;
  label?: string;
}

export function StatusBadge({ status, className, labelOverride, label }: StatusBadgeProps) {
  const displayLabel = labelOverride || label;
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'OPEN':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FDF6EE] text-[#B86A2B] border border-[#F8DCBF] dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30', className)}>
          <Clock className="w-3.5 h-3.5 text-[#B86A2B] dark:text-amber-400" aria-hidden="true" />
          <span>{displayLabel || 'Open'}</span>
        </span>
      );

    case 'ACKNOWLEDGED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30', className)}>
          <AlertCircle className="w-3.5 h-3.5 text-[#175CD3] dark:text-blue-400" aria-hidden="true" />
          <span>{displayLabel || 'Acknowledged'}</span>
        </span>
      );

    case 'RESPONDER_ASSIGNED':
    case 'IN_PROGRESS':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30', className)}>
          <Clock className="w-3.5 h-3.5 text-[#175CD3] dark:text-blue-400 animate-pulse" aria-hidden="true" />
          <span>{displayLabel || 'In Progress'}</span>
        </span>
      );

    case 'RESOLVED':
    case 'CLOSED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EAF3ED] text-[#276749] border border-[#B7D5C4] dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30', className)}>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#276749] dark:text-emerald-400" aria-hidden="true" />
          <span>{displayLabel || 'Resolved'}</span>
        </span>
      );

    case 'CRITICAL':
    case 'EMERGENCY':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30', className)}>
          <AlertTriangle className="w-3.5 h-3.5 text-[#B42318] dark:text-red-400" aria-hidden="true" />
          <span>{displayLabel || 'Critical SOS'}</span>
        </span>
      );

    case 'OCCUPIED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EAF3ED] text-[#276749] border border-[#B7D5C4] dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30', className)}>
          <UserCheck className="w-3.5 h-3.5 text-[#276749] dark:text-emerald-400" aria-hidden="true" />
          <span>{displayLabel || 'Occupied'}</span>
        </span>
      );

    case 'VACANT':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F2F4F7] text-[#475467] border border-[#EAECF0] dark:bg-surface-muted dark:text-ink-muted dark:border-border-neutral', className)}>
          <Home className="w-3.5 h-3.5 text-[#475467] dark:text-ink-muted" aria-hidden="true" />
          <span>{displayLabel || 'Vacant'}</span>
        </span>
      );

    case 'MAINTENANCE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FFF4ED] text-[#B93815] border border-[#FECDCA] dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30', className)}>
          <Wrench className="w-3.5 h-3.5 text-[#B93815] dark:text-orange-400" aria-hidden="true" />
          <span>{displayLabel || 'Maintenance'}</span>
        </span>
      );

    case 'ONLINE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EAF3ED] text-[#276749] border border-[#B7D5C4] dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30', className)}>
          <Wifi className="w-3.5 h-3.5 text-[#276749] dark:text-emerald-400" aria-hidden="true" />
          <span>{displayLabel || 'Online'}</span>
        </span>
      );

    case 'OFFLINE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30', className)}>
          <WifiOff className="w-3.5 h-3.5 text-[#B42318] dark:text-red-400" aria-hidden="true" />
          <span>{displayLabel || 'Offline'}</span>
        </span>
      );

    case 'UNCONFIGURED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F8F9FA] text-[#66716A] border border-[#D9DED8] dark:bg-surface-muted dark:text-ink-muted dark:border-border-neutral', className)}>
          <HelpCircle className="w-3.5 h-3.5 text-[#66716A] dark:text-ink-muted" aria-hidden="true" />
          <span>{displayLabel || 'Not configured'}</span>
        </span>
      );

    case 'ACTIVE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EAF3ED] text-[#276749] border border-[#B7D5C4] dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30', className)}>
          <ShieldCheck className="w-3.5 h-3.5 text-[#276749] dark:text-emerald-400" aria-hidden="true" />
          <span>{displayLabel || 'Active'}</span>
        </span>
      );

    case 'EXPIRED':
    case 'REVOKED':
    case 'CANCELLED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30', className)}>
          <XCircle className="w-3.5 h-3.5 text-[#B42318] dark:text-red-400" aria-hidden="true" />
          <span>{displayLabel || normalized}</span>
        </span>
      );

    default:
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F2F4F7] text-[#475467] border border-[#EAECF0] dark:bg-surface-muted dark:text-ink-muted dark:border-border-neutral', className)}>
          <span>{displayLabel || status}</span>
        </span>
      );
  }
}
