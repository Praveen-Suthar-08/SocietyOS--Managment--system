'use client';

import * as React from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Car,
  Clock,
  Phone,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import {
  UnifiedVisitorPass,
  DEFAULT_UNIFIED_VISITORS,
} from '@/app/resident/passes/page';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminVisitorsPage() {
  const [visitors] = useSyncStore<UnifiedVisitorPass[]>(
    'societyos_unified_visitors',
    DEFAULT_UNIFIED_VISITORS
  );

  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  const [selectedVisitor, setSelectedVisitor] = React.useState<UnifiedVisitorPass | null>(null);

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      v.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      v.passCode.toLowerCase().includes(search.toLowerCase()) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(search.toLowerCase())) ||
      v.visitorPhone.includes(search);

    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['PassCode', 'VisitorName', 'Unit', 'Purpose', 'Status', 'Phone', 'Vehicle', 'CheckIn', 'CheckOut'];
    const rows = filtered.map((v) => [
      v.passCode,
      `"${v.visitorName}"`,
      v.unitCode,
      v.purpose,
      v.status,
      v.visitorPhone,
      v.vehicleNumber || 'None',
      `"${v.checkInDate || ''} ${v.checkInTime || ''}"`,
      `"${v.checkOutDate || ''} ${v.checkOutTime || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield-visitors-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAppToast('Visitor ledger exported to CSV file successfully.', 'success', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Visitor & Gate Admission History
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Real-time inside compound tracking, pass verification logs, and departure timestamps (Real-Time Sync)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg border border-border-neutral bg-surface text-xs text-ink flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Currently On-Site: <strong>{visitors.filter((l) => l.status === 'INSIDE').length}</strong></span>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 no-print">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by visitor name, pass code (VP-XXXX), vehicle, or target unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
          />
        </div>

        <div className="flex rounded-lg bg-surface border border-border-neutral p-1 text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
          {(['ALL', 'INSIDE', 'PENDING', 'CHECKED_OUT', 'DENIED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-brand text-white shadow-2xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {s === 'ALL'
                ? 'All Admissions'
                : s === 'INSIDE'
                ? 'On-Site Now'
                : s === 'PENDING'
                ? 'Pre-Approved'
                : s === 'CHECKED_OUT'
                ? 'Departed'
                : 'Denied'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Pass Code</th>
                <th className="px-4 py-3">Visitor Name & Contact</th>
                <th className="px-4 py-3">Destination Unit</th>
                <th className="px-4 py-3">Check-In Arrival</th>
                <th className="px-4 py-3">Check-Out Departure</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-ink-muted">
                    No visitor records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedVisitor(log)}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand">{log.passCode}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-ink text-xs">{log.visitorName}</p>
                      <p className="text-[11px] text-ink-muted font-mono">{log.visitorPhone}</p>
                      {log.vehicleNumber && (
                        <p className="text-[10px] text-ink-subtle font-mono mt-0.5">Vehicle: {log.vehicleNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                        {log.unitCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink">
                      {log.checkInTime ? (
                        <div>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {log.checkInDate || 'Today'} · {log.checkInTime}
                          </p>
                          <p className="text-[10px] text-ink-muted">{log.gate || 'Gate 1 North'}</p>
                        </div>
                      ) : (
                        <span className="text-ink-muted text-xs">Awaiting Entry</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {log.checkOutTime ? (
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {log.checkOutDate || 'Today'} · {log.checkOutTime}
                        </p>
                      ) : log.status === 'INSIDE' ? (
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
                          On-Site (Active)
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          log.status === 'INSIDE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : log.status === 'CHECKED_OUT'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : log.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-emergency/10 text-emergency border-emergency/30'
                        }`}
                      >
                        {log.status === 'INSIDE'
                          ? 'INSIDE'
                          : log.status === 'CHECKED_OUT'
                          ? 'DEPARTED'
                          : log.status === 'PENDING'
                          ? 'PRE-APPROVED'
                          : log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVisitor(log);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <span className="font-mono text-sm font-bold text-brand">{selectedVisitor.passCode}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded border bg-brand/10 text-brand">
                  {selectedVisitor.status}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                {selectedVisitor.visitorName}
              </DialogTitle>
              <DialogDescription>
                Unit: {selectedVisitor.unitCode} · Resident Host: {selectedVisitor.hostName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs">
              <div className="p-3 bg-surface-muted rounded-xl border border-border-neutral space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Phone Number:</span>
                  <span className="font-semibold text-ink">{selectedVisitor.visitorPhone}</span>
                </div>
                {selectedVisitor.vehicleNumber && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Vehicle Registration:</span>
                    <span className="font-mono font-bold text-ink">{selectedVisitor.vehicleNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-muted">Purpose:</span>
                  <span className="font-semibold text-ink">{selectedVisitor.purpose}</span>
                </div>
                {selectedVisitor.checkInTime && (
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Check-In Arrival:</span>
                    <span>{selectedVisitor.checkInDate || 'Today'} · {selectedVisitor.checkInTime} ({selectedVisitor.gate || 'Gate 1'})</span>
                  </div>
                )}
                {selectedVisitor.checkOutTime && (
                  <div className="flex justify-between font-semibold text-blue-600 dark:text-blue-400">
                    <span>Check-Out Departure:</span>
                    <span>{selectedVisitor.checkOutDate || 'Today'} · {selectedVisitor.checkOutTime}</span>
                  </div>
                )}
              </div>

              {selectedVisitor.guardNotes && (
                <div className="p-3 rounded-xl bg-surface border border-border-neutral text-ink-muted">
                  <span className="font-bold text-ink block mb-0.5">Security Gate Verification Notes:</span>
                  <p>{selectedVisitor.guardNotes}</p>
                </div>
              )}

              {selectedVisitor.chatMessages && selectedVisitor.chatMessages.length > 0 && (
                <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-1.5">
                  <span className="font-bold text-ink block">Intercom Communication History ({selectedVisitor.chatMessages.length} msgs):</span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1">
                    {selectedVisitor.chatMessages.map((m) => (
                      <div key={m.id} className="p-2 rounded bg-surface-muted text-[11px]">
                        <span className="font-bold text-ink">{m.senderName} ({m.timestamp}): </span>
                        <span>{m.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="primary" className="w-full" onClick={() => setSelectedVisitor(null)}>
                Close Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
