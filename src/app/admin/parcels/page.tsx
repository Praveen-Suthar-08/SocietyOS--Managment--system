'use client';

import * as React from 'react';
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Car,
  KeyRound,
  X,
  ShieldCheck,
  Check,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';
import { DEFAULT_PARCELS, Parcel } from '@/app/resident/parcels/page';

export default function AdminParcelsPage() {
  const [parcels, setParcels] = useSyncStore<Parcel[]>('societyos_parcels', DEFAULT_PARCELS);
  const [search, setSearch] = React.useState('');
  const [selectedParcel, setSelectedParcel] = React.useState<Parcel | null>(null);
  const [inputOtp, setInputOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState(false);

  // Fast OTP Bar
  const [quickOtp, setQuickOtp] = React.useState('');
  const [quickError, setQuickError] = React.useState('');

  // New parcel modal
  const [isNewOpen, setIsNewOpen] = React.useState(false);
  const [newTracking, setNewTracking] = React.useState('');
  const [newCourier, setNewCourier] = React.useState('Amazon Logistics');
  const [newUnit, setNewUnit] = React.useState('A-402');
  const [newName, setNewName] = React.useState('Aarav Sharma');
  const [newBay, setNewBay] = React.useState('Bay B-14');

  const filtered = parcels.filter(
    (p) =>
      p.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      p.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      p.residentName.toLowerCase().includes(search.toLowerCase()) ||
      p.pickupOtp.includes(search)
  );

  const handleConfirmPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;
    if (inputOtp.trim() !== selectedParcel.pickupOtp) {
      setOtpError(true);
      return;
    }

    const updated = parcels.map((p) =>
      p.id === selectedParcel.id
        ? {
            ...p,
            status: 'COLLECTED' as const,
            collectedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            releasedBy: 'Officer Ramesh Kumar (Gate 1 Staff)',
          }
        : p
    );

    setParcels(updated);
    showAppToast(
      `OTP Verified! Package for ${selectedParcel.residentName} (${selectedParcel.unitCode}) released.`,
      'success',
      'Parcel Handed Over'
    );
    setSelectedParcel(null);
    setInputOtp('');
    setOtpError(false);
  };

  const handleQuickOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = quickOtp.trim();
    if (!cleanPin) return;

    const match = parcels.find((p) => p.status === 'HELD_AT_GATE' && p.pickupOtp === cleanPin);
    if (!match) {
      setQuickError('No package held at gate with this OTP. Please check with resident.');
      return;
    }

    const updated = parcels.map((p) =>
      p.id === match.id
        ? {
            ...p,
            status: 'COLLECTED' as const,
            collectedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            releasedBy: 'Officer Ramesh Kumar (Fast Kiosk)',
          }
        : p
    );

    setParcels(updated);
    showAppToast(
      `OTP Valid! Package for ${match.residentName} (${match.unitCode}) released successfully.`,
      'success',
      'Handover Confirmed'
    );
    setQuickOtp('');
    setQuickError('');
  };

  const handleRegisterParcel = (e: React.FormEvent) => {
    e.preventDefault();
    const genOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newPcl: Parcel = {
      id: `pcl-${Date.now()}`,
      trackingId: newTracking.trim() || `AWB-${Math.floor(1000 + Math.random() * 9000)}-DEL`,
      courier: newCourier.trim(),
      unitCode: newUnit,
      residentName: newName.trim(),
      pickupOtp: genOtp,
      status: 'HELD_AT_GATE',
      receivedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      receivedByGuard: 'Officer Ramesh Kumar (Gate 1 North)',
      gateGuard: 'Officer Ramesh Kumar · Gate 1 North',
      storageBay: newBay,
    };

    setParcels([newPcl, ...parcels]);
    setIsNewOpen(false);
    setNewTracking('');
    showAppToast(
      `Delivery logged for Unit ${newPcl.unitCode}. OTP ${genOtp} dispatched to resident.`,
      'success',
      'Package Received at Gate'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Gate 1 Parcel & Delivery Ledger
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Package receipt logging, resident pickup OTP verification, and custody transfer audit (Real-Time Sync)
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsNewOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Log Incoming Package</span>
        </Button>
      </div>

      {/* Quick OTP Handover Desk Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand/10 via-brand/5 to-surface border border-brand/25 space-y-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-brand" />
          <h2 className="text-sm font-bold text-ink">Fast Resident Pickup OTP Verification Desk</h2>
        </div>
        <p className="text-xs text-ink-muted">
          When resident presents their 4-digit code at the gate, type it here to instantly release package custody.
        </p>

        <form onSubmit={handleQuickOtpVerify} className="flex flex-col sm:flex-row gap-2 pt-1 max-w-lg">
          <Input
            placeholder="Type 4-digit resident OTP (e.g. 7294)..."
            value={quickOtp}
            maxLength={4}
            onChange={(e) => {
              setQuickOtp(e.target.value);
              setQuickError('');
            }}
            className="font-mono text-sm bg-surface"
          />
          <Button type="submit" variant="primary" size="md" className="sm:w-auto">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Verify & Release</span>
          </Button>
        </form>
        {quickError && <p className="text-xs text-emergency font-semibold">{quickError}</p>}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-xs">
          <span className="text-xs text-ink-muted font-semibold">Held at Gate Desks</span>
          <p className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
            {parcels.filter((p) => p.status === 'HELD_AT_GATE').length} Awaiting Collection
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Stored in secure parcel racks at Gate 1</p>
        </div>

        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-xs">
          <span className="text-xs text-ink-muted font-semibold">Handed Over Today</span>
          <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {parcels.filter((p) => p.status === 'COLLECTED').length} Released
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Verified via resident 4-digit OTP</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          placeholder="Search by tracking number, unit code, OTP, or resident name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
        />
      </div>

      {/* Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Tracking / Courier</th>
                <th className="px-4 py-3">Destination Unit</th>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-ink-muted">
                    No parcels match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-ink">{p.courier}</p>
                      <p className="text-xs font-mono text-ink-muted">{p.trackingId}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                        {p.unitCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-ink">
                      {p.residentName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-muted">
                      <p>{p.receivedAt}</p>
                      <p className="text-[10px]">By {p.receivedByGuard || p.gateGuard}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          p.status === 'HELD_AT_GATE'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {p.status === 'HELD_AT_GATE' ? 'Held at Gate' : 'Collected'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {p.status === 'HELD_AT_GATE' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedParcel(p);
                            setInputOtp('');
                            setOtpError(false);
                          }}
                        >
                          Verify OTP Release
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Released ({p.collectedAt || 'Verified'})
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Verify OTP Modal */}
      {selectedParcel && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedParcel(null)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Verify Resident Pickup OTP</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral space-y-1 text-xs">
              <p>
                Resident: <strong className="text-ink">{selectedParcel.residentName}</strong> ({selectedParcel.unitCode})
              </p>
              <p>
                Courier: <strong className="text-ink">{selectedParcel.courier}</strong> · {selectedParcel.trackingId}
              </p>
              {selectedParcel.storageBay && <p>Storage Rack: <strong>{selectedParcel.storageBay}</strong></p>}
            </div>

            <form onSubmit={handleConfirmPickup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Enter 4-Digit Resident Verification OTP
                </label>
                <Input
                  placeholder="e.g. 7294"
                  maxLength={4}
                  value={inputOtp}
                  onChange={(e) => {
                    setInputOtp(e.target.value);
                    setOtpError(false);
                  }}
                  required
                  className="font-mono text-center text-lg tracking-widest"
                />
              </div>

              {otpError && (
                <p className="text-xs text-emergency font-semibold">
                  Invalid OTP. Please verify the code displayed on resident's SocietyOS app.
                </p>
              )}

              <p className="text-[11px] text-ink-muted">
                Demo hint: Resident OTP for this item is{' '}
                <button
                  type="button"
                  onClick={() => setInputOtp(selectedParcel.pickupOtp)}
                  className="text-brand font-mono font-bold underline cursor-pointer"
                >
                  {selectedParcel.pickupOtp}
                </button>
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedParcel(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Release Package
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Package Modal */}
      {isNewOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsNewOpen(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Log Incoming Package</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterParcel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Destination Unit (160 Society Units)
                </label>
                <UnitSearchSelect value={newUnit} onChange={setNewUnit} />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Recipient Resident Name</label>
                <Input
                  placeholder="e.g. Aarav Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Courier / Service Provider</label>
                <Input
                  placeholder="e.g. Amazon, Bluedart, Delhivery, Swiggy"
                  value={newCourier}
                  onChange={(e) => setNewCourier(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">Tracking Number / AWB</label>
                  <Input
                    placeholder="e.g. AWB-9912"
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">Storage Rack / Bay</label>
                  <Input
                    placeholder="e.g. Bay B-14"
                    value={newBay}
                    onChange={(e) => setNewBay(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNewOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Log at Gate Rack
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
