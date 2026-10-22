'use client';

import * as React from 'react';
import {
  KeyRound,
  UserCheck,
  XCircle,
  Car,
  Clock,
  Phone,
  ShieldAlert,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  DoorOpen,
  History,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';
import {
  UnifiedVisitorPass,
  DEFAULT_UNIFIED_VISITORS,
} from '@/app/resident/passes/page';

export default function SecurityEntryExitPage() {
  const [visitors, setVisitors] = useSyncStore<UnifiedVisitorPass[]>(
    'societyos_unified_visitors',
    DEFAULT_UNIFIED_VISITORS
  );

  const [selectedVisitor, setSelectedVisitor] = React.useState<UnifiedVisitorPass | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [barrierTriggered, setBarrierTriggered] = React.useState<string | null>(null);
  const [vehicleSearch, setVehicleSearch] = React.useState('');
  const [vehicleFilter, setVehicleFilter] = React.useState<'ALL' | 'VEHICLES' | 'PEDESTRIANS'>('ALL');

  // Form state
  const [formData, setFormData] = React.useState({
    visitorName: '',
    phone: '',
    vehicle: '',
    unit: 'A-101',
    passCode: '',
    gate: 'Gate 1 North',
    purpose: 'Guest Visit',
    guardNotes: 'Identity checked at boom barrier.',
  });

  const activeInside = visitors.filter((v) => {
    if (v.status !== 'INSIDE') return false;
    if (vehicleFilter === 'VEHICLES' && !v.vehicleNumber) return false;
    if (vehicleFilter === 'PEDESTRIANS' && v.vehicleNumber) return false;
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.visitorName.toLowerCase().includes(q) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
      v.passCode.toLowerCase().includes(q) ||
      v.unitCode.toLowerCase().includes(q)
    );
  });

  const totalInsideVehiclesCount = visitors.filter((v) => v.status === 'INSIDE' && v.vehicleNumber).length;

  const handleCheckout = (id: string, name: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updated = visitors.map((v) =>
      v.id === id
        ? {
            ...v,
            status: 'CHECKED_OUT' as const,
            checkOutDate: nowDate,
            checkOutTime: nowTime,
          }
        : v
    );

    setVisitors(updated);
    setBarrierTriggered(`Boom Barrier Opened: Departure cleared for ${name}`);
    setTimeout(() => setBarrierTriggered(null), 4000);

    if (selectedVisitor?.id === id) {
      setSelectedVisitor({
        ...selectedVisitor,
        status: 'CHECKED_OUT',
        checkOutDate: nowDate,
        checkOutTime: nowTime,
      });
    }

    showAppToast(
      `Departure logged for ${name}. Gate barrier raised and status updated to CHECKED OUT in real time.`,
      'info',
      'Departure Cleared'
    );
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitorName.trim() || !formData.phone.trim()) {
      showAppToast('Please provide both visitor name and contact phone.', 'error', 'Missing Information');
      return;
    }

    // Anti-Passback / Re-verification prevention check
    if (formData.passCode.trim()) {
      const codeUpper = formData.passCode.trim().toUpperCase();
      const existing = visitors.find((v) => v.passCode.toUpperCase() === codeUpper);
      if (existing) {
        if (existing.status === 'INSIDE') {
          showAppToast(`Visitor pass ${codeUpper} is ALREADY INSIDE the society compound. Cannot re-verify.`, 'error', 'Anti-Passback Blocked');
          return;
        }
        if (existing.status === 'CHECKED_OUT' || (existing.status as string) === 'USED') {
          showAppToast(`Visitor pass ${codeUpper} has already been verified and used.`, 'error', 'Pass Expired');
          return;
        }
        if (existing.status === 'REVOKED' || existing.status === 'DENIED') {
          showAppToast(`Visitor pass ${codeUpper} was ${existing.status}. Entry denied.`, 'error', 'Admission Blocked');
          return;
        }
      }
    }

    const newCode = formData.passCode.trim() || `VP-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newVisitor: UnifiedVisitorPass = {
      id: `vis-${Date.now()}`,
      passCode: newCode,
      unitCode: formData.unit,
      visitorName: formData.visitorName.trim(),
      visitorPhone: formData.phone.trim(),
      vehicleNumber: formData.vehicle.trim() || undefined,
      purpose: (formData.purpose.toUpperCase().includes('DELIV') ? 'DELIVERY' : 'GUEST') as any,
      status: 'INSIDE',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      checkInDate: nowDate,
      checkInTime: nowTime,
      expectedDurationHours: 4,
      gate: formData.gate,
      hostName: `Resident of ${formData.unit}`,
      guardNotes: formData.guardNotes,
      createdAt: `${nowDate} · ${nowTime}`,
      chatMessages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'SECURITY',
          senderName: `${formData.gate} Guard`,
          text: `Visitor ${formData.visitorName.trim()} admitted at ${formData.gate} for Unit ${formData.unit}.`,
          timestamp: nowTime,
        },
      ],
    };

    setVisitors([newVisitor, ...visitors]);
    setIsAddOpen(false);
    setFormData({
      visitorName: '',
      phone: '',
      vehicle: '',
      unit: 'A-101',
      passCode: '',
      gate: 'Gate 1 North',
      purpose: 'Guest Visit',
      guardNotes: 'Identity checked at boom barrier.',
    });

    setBarrierTriggered(`Boom Barrier Opened: Entry authorized for ${newVisitor.visitorName} (${newCode})`);
    setTimeout(() => setBarrierTriggered(null), 4000);

    showAppToast(
      `Pass ${newCode} generated. ${newVisitor.visitorName} admitted to compound. Synced across all tabs.`,
      'success',
      'Entry Granted'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Gate Entry & Exit Boom Barrier Controller
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Physical gate verification, automated boom barrier clearance, and inside compound accountability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Record Gate Entry</span>
          </Button>
        </div>
      </div>

      {/* Barrier Alert */}
      {barrierTriggered && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
          <span>{barrierTriggered}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-surface border-border-neutral shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted font-semibold uppercase">Currently Inside Compound</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-3xl font-display font-bold text-ink mt-1">{activeInside.length}</p>
          <p className="text-xs text-ink-muted mt-0.5">Visitors, technicians, and guests</p>
        </Card>

        <Card className="p-4 bg-surface border-border-neutral shadow-xs">
          <span className="text-xs text-ink-muted font-semibold uppercase">Today's Departures</span>
          <p className="text-3xl font-display font-bold text-brand mt-1">
            {visitors.filter((v) => v.status === 'CHECKED_OUT').length}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Logged departure exit barrier cycles</p>
        </Card>

        <Card className="p-4 bg-surface border-border-neutral shadow-xs">
          <span className="text-xs text-ink-muted font-semibold uppercase">Pre-Approved Awaiting Entry</span>
          <p className="text-3xl font-display font-bold text-amber-600 dark:text-amber-400 mt-1">
            {visitors.filter((v) => v.status === 'PENDING').length}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Passes generated by residents</p>
        </Card>
      </div>

      {/* Currently Inside List & Vehicle Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Currently Inside Compound ({activeInside.length})</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-mono">
              🚗 {totalInsideVehiclesCount} Vehicles
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-surface border border-border-neutral p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setVehicleFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'ALL' ? 'bg-brand text-white font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                All Inside
              </button>
              <button
                type="button"
                onClick={() => setVehicleFilter('VEHICLES')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'VEHICLES' ? 'bg-brand text-white font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Vehicles ({totalInsideVehiclesCount})
              </button>
              <button
                type="button"
                onClick={() => setVehicleFilter('PEDESTRIANS')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'PEDESTRIANS' ? 'bg-brand text-white font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Pedestrians
              </button>
            </div>

            <input
              type="text"
              placeholder="Search plate (e.g. KA-03), name, flat..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border-neutral bg-surface text-xs text-ink w-48 sm:w-64"
            />
          </div>
        </div>

        {activeInside.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border-neutral p-6 text-xs text-ink-muted">
            No active visitors currently recorded inside the society compound.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInside.map((visitor) => (
              <Card
                key={visitor.id}
                onClick={() => setSelectedVisitor(visitor)}
                className="p-4 border border-emerald-500/30 bg-surface hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-neutral">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand">{visitor.passCode}</span>
                      <h3 className="font-bold text-base text-ink group-hover:text-brand transition-colors mt-0.5">
                        {visitor.visitorName}
                      </h3>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                      ON-SITE
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink-muted mt-3">
                    <div className="flex justify-between">
                      <span>Target Flat:</span>
                      <span className="font-bold text-ink font-mono">{visitor.unitCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="text-ink font-medium">{visitor.visitorPhone}</span>
                    </div>
                    {visitor.vehicleNumber && (
                      <div className="flex justify-between">
                        <span>Vehicle Plate:</span>
                        <span className="font-mono font-bold text-ink">{visitor.vehicleNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-border-subtle">
                      <span>Checked In At:</span>
                      <span>{visitor.checkInDate || 'Today'} · {visitor.checkInTime}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="pt-3 mt-3 border-t border-border-neutral flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-ink-muted">Gate: {visitor.gate || 'Gate 1'}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-7 text-xs bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleCheckout(visitor.id, visitor.visitorName)}
                  >
                    <DoorOpen className="w-3.5 h-3.5 mr-1" />
                    Open Barrier (Check Out)
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
              <DialogTitle className="text-lg font-bold text-ink mt-1">
                {selectedVisitor.visitorName}
              </DialogTitle>
              <DialogDescription>
                Unit {selectedVisitor.unitCode} · Gate Admission Audit
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
                    <span className="text-ink-muted">Vehicle:</span>
                    <span className="font-mono font-bold text-ink">{selectedVisitor.vehicleNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-muted">Admission Timestamp:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedVisitor.checkInDate || 'Today'} · {selectedVisitor.checkInTime}
                  </span>
                </div>
                {selectedVisitor.checkOutTime && (
                  <div className="flex justify-between font-semibold text-blue-600 dark:text-blue-400">
                    <span>Departure Timestamp:</span>
                    <span>{selectedVisitor.checkOutDate || 'Today'} · {selectedVisitor.checkOutTime}</span>
                  </div>
                )}
              </div>

              {selectedVisitor.guardNotes && (
                <div className="p-3 rounded-xl bg-surface border border-border-neutral text-ink-muted">
                  <span className="font-bold text-ink block mb-0.5">Guard Observations:</span>
                  <p>{selectedVisitor.guardNotes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {selectedVisitor.status === 'INSIDE' && (
                  <Button
                    variant="primary"
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleCheckout(selectedVisitor.id, selectedVisitor.visitorName)}
                  >
                    <DoorOpen className="w-4 h-4 mr-1.5" />
                    Open Barrier (Check Out)
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setSelectedVisitor(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Entry Modal with 160-Unit Search */}
      {isAddOpen && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Gate Visitor Entry</DialogTitle>
              <DialogDescription>
                Log visitor identity, select from all 160 units, and trigger gate barrier clearance
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateEntry} className="space-y-3 pt-1 text-xs">
              <div>
                <UnitSearchSelect
                  label="Target Flat / Unit (160 Units) *"
                  value={formData.unit}
                  onChange={(val) => setFormData({ ...formData, unit: val })}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Visitor Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-ink mb-1">Phone Number *</label>
                  <Input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Vehicle Plate</label>
                  <Input
                    placeholder="KA-05-AB-1234"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-ink mb-1">Entry Gate</label>
                  <select
                    value={formData.gate}
                    onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    <option value="Gate 1 North">Gate 1 North (Main)</option>
                    <option value="Gate 2 Service">Gate 2 Service</option>
                    <option value="Gate 3 South">Gate 3 South</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Pass Code (Optional)</label>
                  <Input
                    placeholder="Auto-generated"
                    value={formData.passCode}
                    onChange={(e) => setFormData({ ...formData, passCode: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Purpose of Visit</label>
                <Input
                  placeholder="e.g. Delivery, Guest, Technician"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-neutral">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Approve Entry & Open Barrier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
