'use client';

import * as React from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Car,
  Phone,
  Clock,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  FileText,
  MessageSquare,
  Send,
  DoorOpen,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore, broadcastSync } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';
import {
  UnifiedVisitorPass,
  DEFAULT_UNIFIED_VISITORS,
  ChatMessage,
} from '@/app/resident/passes/page';

export default function SecurityVisitorsLookupPage() {
  const [visitors, setVisitors] = useSyncStore<UnifiedVisitorPass[]>(
    'societyos_unified_visitors',
    DEFAULT_UNIFIED_VISITORS
  );

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [selectedVisitor, setSelectedVisitor] = React.useState<UnifiedVisitorPass | null>(null);
  const [activeChatPassId, setActiveChatPassId] = React.useState<string | null>(null);
  const [chatInput, setChatInput] = React.useState('');
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  // Derive latest active chat pass directly from real-time synchronized visitors store
  const activeChatPass = React.useMemo(() => {
    if (!activeChatPassId) return null;
    return visitors.find((v) => v.id === activeChatPassId) || null;
  }, [visitors, activeChatPassId]);

  // Auto-scroll to latest message whenever new messages arrive
  React.useEffect(() => {
    if (activeChatPass?.chatMessages?.length) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatPass?.chatMessages?.length]);

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(search.toLowerCase())) ||
      v.passCode.toLowerCase().includes(search.toLowerCase()) ||
      v.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      v.visitorPhone.includes(search);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (visitor: UnifiedVisitorPass) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updated = visitors.map((v) =>
      v.id === visitor.id
        ? {
            ...v,
            status: 'INSIDE' as const,
            checkInDate: nowDate,
            checkInTime: nowTime,
            gate: 'Gate 1 North',
          }
        : v
    );

    setVisitors(updated);
    if (selectedVisitor?.id === visitor.id) {
      setSelectedVisitor({
        ...selectedVisitor,
        status: 'INSIDE',
        checkInDate: nowDate,
        checkInTime: nowTime,
        gate: 'Gate 1 North',
      });
    }

    showAppToast(
      `Visitor ${visitor.visitorName} admitted through Gate 1. Status updated across Admin & Resident in real time.`,
      'success',
      'Visitor Admitted'
    );
  };

  const handleCheckOut = (visitor: UnifiedVisitorPass) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updated = visitors.map((v) =>
      v.id === visitor.id
        ? {
            ...v,
            status: 'CHECKED_OUT' as const,
            checkOutDate: nowDate,
            checkOutTime: nowTime,
          }
        : v
    );

    setVisitors(updated);
    if (selectedVisitor?.id === visitor.id) {
      setSelectedVisitor({
        ...selectedVisitor,
        status: 'CHECKED_OUT',
        checkOutDate: nowDate,
        checkOutTime: nowTime,
      });
    }

    // Sync removal from active visitors list
    try {
      const rawActive = localStorage.getItem('societyos_active_visitors');
      if (rawActive) {
        const activeList = JSON.parse(rawActive);
        const filtered = activeList.filter(
          (v: any) =>
            v._id !== visitor.id &&
            v.visitorName.toLowerCase() !== visitor.visitorName.toLowerCase()
        );
        localStorage.setItem('societyos_active_visitors', JSON.stringify(filtered));
        broadcastSync('societyos_active_visitors', filtered);
      }
    } catch {}

    showAppToast(
      `Departure cleared for ${visitor.visitorName}. Barrier opened and status updated for all users.`,
      'info',
      'Departure Cleared'
    );
  };

  const handleSendGuardMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatPass || !chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'SECURITY',
      senderName: 'Officer Ramesh Kumar (Gate 1 Duty)',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = visitors.map((v) => {
      if (v.id === activeChatPass.id) {
        return {
          ...v,
          chatMessages: [...(v.chatMessages || []), newMsg],
        };
      }
      return v;
    });

    setVisitors(updated);
    setChatInput('');
    showAppToast('Intercom message sent to resident app.', 'info', 'Message Sent');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Gate Visitor Directory & Intercom
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Search pre-cleared passes, track live inside visitors, manage departures, and chat with residents (Real-Time Sync)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg border border-border-neutral bg-surface text-xs text-ink flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Currently On-Site: <strong>{visitors.filter((v) => v.status === 'INSIDE').length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by visitor name, pass code (VP-XXXX), vehicle, or flat number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
          />
        </div>

        <div className="flex rounded-lg bg-surface border border-border-neutral p-1 text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
          {(['ALL', 'INSIDE', 'PENDING', 'CHECKED_OUT', 'DENIED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-brand text-white shadow-2xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {s === 'ALL'
                ? 'All Entries'
                : s === 'INSIDE'
                ? 'Currently Inside'
                : s === 'PENDING'
                ? 'Pre-Approved'
                : s === 'CHECKED_OUT'
                ? 'Departed'
                : 'Denied'}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-surface rounded-2xl border border-dashed border-border-neutral p-6 text-ink-muted text-xs">
            No visitor passes match your search or filter criteria.
          </div>
        ) : (
          filtered.map((v) => {
            const isInside = v.status === 'INSIDE';
            const isCheckedOut = v.status === 'CHECKED_OUT';
            const isPending = v.status === 'PENDING';

            return (
              <Card
                key={v.id}
                onClick={() => setSelectedVisitor(v)}
                className={`p-4 border cursor-pointer hover:border-brand/50 hover:shadow-md transition-all group flex flex-col justify-between ${
                  isInside ? 'border-emerald-500/40 bg-surface' : 'border-border-neutral bg-surface'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-neutral">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand">{v.passCode}</span>
                      <h3 className="font-bold text-sm text-ink group-hover:text-brand transition-colors mt-0.5">
                        {v.visitorName}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isInside
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : isCheckedOut
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-emergency/10 text-emergency border-emergency/30'
                      }`}
                    >
                      {isInside ? 'INSIDE' : isCheckedOut ? 'DEPARTED' : isPending ? 'PRE-APPROVED' : v.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink-muted mt-3">
                    <div className="flex justify-between">
                      <span>Target Unit:</span>
                      <span className="font-bold text-ink font-mono">{v.unitCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Host Resident:</span>
                      <span className="font-semibold text-ink">{v.hostName}</span>
                    </div>
                    {v.vehicleNumber && (
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span className="font-mono text-ink font-semibold">{v.vehicleNumber}</span>
                      </div>
                    )}
                    {v.checkInTime && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Check-In:</span>
                        <span>{v.checkInDate || 'Today'} · {v.checkInTime}</span>
                      </div>
                    )}
                    {v.checkOutTime && (
                      <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                        <span>Check-Out:</span>
                        <span>{v.checkOutDate || 'Today'} · {v.checkOutTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  className="flex items-center justify-between pt-3 mt-3 border-t border-border-neutral text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-brand hover:bg-brand/10 border border-brand/20"
                    onClick={() => setActiveChatPassId(v.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    <span>Chat ({v.chatMessages?.length || 0})</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleCheckIn(v)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Admit
                      </Button>
                    )}
                    {isInside && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                        onClick={() => handleCheckOut(v)}
                      >
                        <DoorOpen className="w-3.5 h-3.5 mr-1" />
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <span className="font-mono text-sm font-bold text-brand">{selectedVisitor.passCode}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded border bg-brand/10 text-brand border-brand/20">
                  {selectedVisitor.status}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                {selectedVisitor.visitorName}
              </DialogTitle>
              <DialogDescription>
                Destination: Unit {selectedVisitor.unitCode} · Resident: {selectedVisitor.hostName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs">
              <div className="p-3 bg-surface-muted rounded-xl border border-border-neutral space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Phone:</span>
                  <span className="font-semibold text-ink">{selectedVisitor.visitorPhone}</span>
                </div>
                {selectedVisitor.vehicleNumber && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Vehicle Registration:</span>
                    <span className="font-mono font-bold text-ink">{selectedVisitor.vehicleNumber}</span>
                  </div>
                )}
                {selectedVisitor.checkInTime && (
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Admitted At:</span>
                    <span>{selectedVisitor.checkInDate || 'Today'} at {selectedVisitor.checkInTime} ({selectedVisitor.gate || 'Gate 1'})</span>
                  </div>
                )}
                {selectedVisitor.checkOutTime && (
                  <div className="flex justify-between font-semibold text-blue-600 dark:text-blue-400">
                    <span>Departed At:</span>
                    <span>{selectedVisitor.checkOutDate || 'Today'} at {selectedVisitor.checkOutTime}</span>
                  </div>
                )}
                {selectedVisitor.guardNotes && (
                  <div className="pt-1 text-ink-muted border-t border-border-subtle">
                    <span className="font-bold text-ink block">Gate Verification Notes:</span>
                    <p className="mt-0.5">{selectedVisitor.guardNotes}</p>
                  </div>
                )}
              </div>

              {/* Status Transition Actions */}
              <div className="flex gap-2 pt-2">
                {selectedVisitor.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleCheckIn(selectedVisitor)}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Admit to Compound (Check In)
                  </Button>
                )}
                {selectedVisitor.status === 'INSIDE' && (
                  <Button
                    variant="primary"
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleCheckOut(selectedVisitor)}
                  >
                    <DoorOpen className="w-4 h-4 mr-1.5" />
                    Clear Departure (Check Out)
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const v = selectedVisitor;
                    setSelectedVisitor(null);
                    if (v) setActiveChatPassId(v.id);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5 text-brand" />
                  Resident Intercom
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Real-time Gate Intercom Dialog */}
      {activeChatPass && (
        <Dialog open={!!activeChatPassId} onOpenChange={(open) => { if (!open) setActiveChatPassId(null); }}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <DialogHeader className="p-4 bg-surface-muted border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <div>
                  <DialogTitle className="text-sm font-bold text-ink">
                    Gate 1 Security Intercom · Flat {activeChatPass.unitCode} ({activeChatPass.hostName})
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Concerning visitor: {activeChatPass.visitorName} ({activeChatPass.passCode})
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-surface text-xs">
              {activeChatPass.chatMessages?.length === 0 ? (
                <p className="text-center py-6 text-ink-muted">
                  No previous intercom messages for this visitor pass.
                </p>
              ) : (
                activeChatPass.chatMessages?.map((msg) => {
                  const isGuard = msg.senderRole === 'SECURITY';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isGuard ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-ink-subtle mb-0.5">
                        <span className="font-bold text-ink">{msg.senderName}</span>
                        <span>· {msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                          isGuard
                            ? 'bg-brand text-white rounded-tr-none'
                            : 'bg-surface-muted text-ink border border-border-neutral rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <form
              onSubmit={handleSendGuardMessage}
              className="p-3 bg-surface-muted border-t border-border-neutral flex gap-2"
            >
              <Input
                placeholder="Type instructions or update to resident..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="text-xs bg-surface"
              />
              <Button type="submit" variant="primary" size="sm">
                <Send className="w-4 h-4 mr-1" />
                <span>Dispatch</span>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
