'use client';

import * as React from 'react';
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  Building,
  UserCheck,
  AlertCircle,
  X,
  Truck,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';
import { DEFAULT_PARCELS, Parcel } from '@/app/resident/parcels/page';

export default function SecurityParcelsPage() {
  const [parcels, setParcels] = useSyncStore<Parcel[]>('societyos_parcels', DEFAULT_PARCELS);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'HELD' | 'COLLECTED'>('HELD');

  // Quick OTP Kiosk
  const [quickOtp, setQuickOtp] = React.useState('');
  const [quickError, setQuickError] = React.useState('');
  const [matchedParcel, setMatchedParcel] = React.useState<Parcel | null>(null);
  const [receiverType, setReceiverType] = React.useState('Resident in person');

  // Register New Delivery modal
  const [isNewOpen, setIsNewOpen] = React.useState(false);
  const [newTracking, setNewTracking] = React.useState('');
  const [newCourier, setNewCourier] = React.useState('Amazon Logistics');
  const [newAgentName, setNewAgentName] = React.useState('');
  const [newUnit, setNewUnit] = React.useState('A-402');
  const [newName, setNewName] = React.useState('Aarav Sharma');
  const [newBay, setNewBay] = React.useState('Bay B-14');

  // Manual Handover modal
  const [handoverParcel, setHandoverParcel] = React.useState<Parcel | null>(null);
  const [handoverOtp, setHandoverOtp] = React.useState('');
  const [handoverError, setHandoverError] = React.useState('');

  const heldCount = parcels.filter((p) => p.status === 'HELD_AT_GATE').length;
  const collectedCount = parcels.filter((p) => p.status === 'COLLECTED').length;

  const filtered = parcels.filter((p) => {
    if (statusFilter === 'HELD' && p.status !== 'HELD_AT_GATE') return false;
    if (statusFilter === 'COLLECTED' && p.status !== 'COLLECTED') return false;

    const q = search.toLowerCase();
    return (
      p.trackingId.toLowerCase().includes(q) ||
      p.unitCode.toLowerCase().includes(q) ||
      p.residentName.toLowerCase().includes(q) ||
      p.pickupOtp.includes(q) ||
      p.storageBay?.toLowerCase().includes(q)
    );
  });

  const handleQuickOtpLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = quickOtp.trim();
    if (!pin) return;

    const match = parcels.find((p) => p.status === 'HELD_AT_GATE' && p.pickupOtp === pin);
    if (!match) {
      setQuickError(`No package currently held at gate matches OTP "${pin}". Ask resident to recheck their Resident App.`);
      setMatchedParcel(null);
      return;
    }

    setQuickError('');
    setMatchedParcel(match);
  };

  const handleConfirmQuickRelease = () => {
    if (!matchedParcel) return;

    const timestamp = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const updated = parcels.map((p) =>
      p.id === matchedParcel.id
        ? {
            ...p,
            status: 'COLLECTED' as const,
            collectedAt: timestamp,
            releasedBy: `Security Officer (Gate 1 - Handed to ${receiverType})`,
          }
        : p
    );

    setParcels(updated);
    showAppToast(
      `Package for ${matchedParcel.residentName} (${matchedParcel.unitCode}) released from ${matchedParcel.storageBay || 'Gate'}!`,
      'success',
      'Delivery Handed Over'
    );
    setMatchedParcel(null);
    setQuickOtp('');
    setQuickError('');
  };

  const handleManualHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverParcel) return;

    if (handoverOtp.trim() !== handoverParcel.pickupOtp) {
      setHandoverError('Incorrect OTP. Please enter the exact 4-digit code provided by the resident.');
      return;
    }

    const timestamp = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const updated = parcels.map((p) =>
      p.id === handoverParcel.id
        ? {
            ...p,
            status: 'COLLECTED' as const,
            collectedAt: timestamp,
            releasedBy: `Security Officer (Gate 1 - Handed to ${receiverType})`,
          }
        : p
    );

    setParcels(updated);
    showAppToast(
      `OTP verified! Package for ${handoverParcel.residentName} released.`,
      'success',
      'Parcel Released'
    );
    setHandoverParcel(null);
    setHandoverOtp('');
    setHandoverError('');
  };

  const handleCreateNewParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTracking) return;

    // Generate random 4-digit OTP
    const genOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newEntry: Parcel = {
      id: `p-${Date.now()}`,
      trackingId: newTracking.trim().toUpperCase(),
      courier: `${newCourier} ${newAgentName ? `(${newAgentName})` : ''}`.trim(),
      unitCode: newUnit,
      residentName: newName,
      pickupOtp: genOtp,
      status: 'HELD_AT_GATE',
      receivedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      gateGuard: 'Security Guard (Gate 1 Desk)',
      receivedByGuard: 'Security Guard (Gate 1 Desk)',
      storageBay: newBay,
    };

    setParcels([newEntry, ...parcels]);
    showAppToast(
      `Package logged for ${newName} (${newUnit}). Resident notified with OTP: ${genOtp}`,
      'success',
      'Parcel Received at Gate'
    );

    setIsNewOpen(false);
    setNewTracking('');
    setNewAgentName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Package className="w-6 h-6 text-brand" />
            Security Parcel & Courier Desk
          </h1>
          <p className="text-sm text-ink-muted">
            Log incoming courier packages, manage locker bays, and verify resident pickup OTPs for secure handover.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsNewOpen(true)} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Log Incoming Courier</span>
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-surface border-border-neutral">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Parcels Held at Gate</p>
              <p className="text-2xl font-bold text-ink mt-1 font-mono">{heldCount}</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Awaiting resident pickup OTP</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Box className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border-neutral">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Handed Over Today</p>
              <p className="text-2xl font-bold text-ink mt-1 font-mono">{collectedCount}</p>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">Verified & collected</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border-neutral">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Active Bays in Use</p>
              <p className="text-2xl font-bold text-ink mt-1 font-mono">
                {new Set(parcels.filter((p) => p.status === 'HELD_AT_GATE').map((p) => p.storageBay)).size}
              </p>
              <p className="text-xs text-brand font-medium mt-0.5">Locker Bay Storage</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Affordance Resident OTP Verification Kiosk */}
      <Card className="border-2 border-brand/50 bg-gradient-to-r from-brand/5 via-surface to-brand/5 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-brand" />
              <CardTitle className="text-base font-bold text-ink">
                Resident Handover Station — OTP Verification
              </CardTitle>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-brand/10 text-brand font-bold uppercase tracking-wider">
              Gate Guard Authorized
            </span>
          </div>
          <CardDescription className="text-xs text-ink-muted">
            When resident or representative arrives at gate desk, enter the 4-digit pickup code shown on their phone to release the parcel.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleQuickOtpLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input
                type="text"
                maxLength={6}
                value={quickOtp}
                onChange={(e) => {
                  setQuickOtp(e.target.value.replace(/\D/g, ''));
                  setQuickError('');
                }}
                placeholder="Enter 4-digit Resident Pickup OTP (e.g. 8821)..."
                className="pl-9 text-base font-mono font-bold tracking-widest bg-surface border-border-neutral"
              />
            </div>
            <Button type="submit" variant="primary" className="font-semibold whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Lookup Package
            </Button>
          </form>

          {quickError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{quickError}</span>
            </div>
          )}

          {matchedParcel && (
            <div className="p-4 bg-surface border-2 border-emerald-500/50 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-neutral pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    OTP MATCHED (CODE: {matchedParcel.pickupOtp})
                  </span>
                  <span className="text-xs font-mono text-ink-muted">Ref: {matchedParcel.trackingId}</span>
                </div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">
                  {matchedParcel.storageBay || 'Main Desk Shelf'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-ink-muted block text-[11px]">Resident Name</span>
                  <span className="font-bold text-sm text-ink">{matchedParcel.residentName}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Unit / Flat</span>
                  <span className="font-bold text-sm text-ink">{matchedParcel.unitCode}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Courier / Vendor</span>
                  <span className="font-semibold text-ink">{matchedParcel.courier}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Storage Bay</span>
                  <span className="font-bold text-sm text-brand">{matchedParcel.storageBay || 'Bay B-14'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-ink-muted font-medium">Delivered to:</span>
                  <select
                    value={receiverType}
                    onChange={(e) => setReceiverType(e.target.value)}
                    className="p-1.5 rounded border border-border-neutral bg-surface text-ink text-xs font-medium"
                  >
                    <option value="Resident in person">Resident in person</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Authorized House Help">Authorized House Help</option>
                    <option value="Authorized Driver / Staff">Authorized Driver / Staff</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMatchedParcel(null);
                      setQuickOtp('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleConfirmQuickRelease} className="font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Confirm Handover & Release
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parcels Inventory Table */}
      <Card className="border border-border-neutral bg-surface">
        <CardHeader className="pb-3 border-b border-border-neutral">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === 'HELD' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('HELD')}
              >
                Held at Gate ({heldCount})
              </Button>
              <Button
                variant={statusFilter === 'COLLECTED' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('COLLECTED')}
              >
                Collected Archive ({collectedCount})
              </Button>
              <Button
                variant={statusFilter === 'ALL' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All Records ({parcels.length})
              </Button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search flat, name, OTP..."
                className="pl-9 text-xs bg-surface border-border-neutral"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-neutral text-ink-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Unit / Flat</th>
                  <th className="p-3">Resident</th>
                  <th className="p-3">Courier / Item</th>
                  <th className="p-3">Storage Bay</th>
                  <th className="p-3">Pickup OTP</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-neutral">
                {filtered.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-ink">
                      <span className="px-2 py-0.5 rounded bg-surface border border-border-neutral">
                        {parcel.unitCode}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-ink">{parcel.residentName}</td>
                    <td className="p-3">
                      <div className="font-semibold text-ink">{parcel.courier}</div>
                      <div className="font-mono text-[10px] text-ink-muted">{parcel.trackingId}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                        {parcel.storageBay || 'Desk Shelf'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-surface border border-border-neutral text-ink">
                        {parcel.pickupOtp}
                      </span>
                    </td>
                    <td className="p-3">
                      {parcel.status === 'HELD_AT_GATE' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Held at Gate
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Collected
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {parcel.status === 'HELD_AT_GATE' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setHandoverParcel(parcel);
                            setHandoverOtp('');
                            setHandoverError('');
                          }}
                          className="text-xs h-7 font-bold"
                        >
                          Verify & Hand Over
                        </Button>
                      ) : (
                        <span className="text-[11px] text-ink-muted font-medium">
                          {parcel.collectedAt || 'Released'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-ink-muted">
                      No parcels found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Verify Modal */}
      {handoverParcel && (
        <Dialog open={!!handoverParcel} onOpenChange={() => setHandoverParcel(null)}>
          <DialogContent hideCloseButton={true} className="max-w-md p-0 overflow-hidden border border-border-neutral shadow-2xl">
            <div className="p-4 bg-surface border-b border-border-neutral flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand" />
                <span className="font-bold text-sm text-ink">Verify Handover OTP</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setHandoverParcel(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleManualHandover} className="p-5 space-y-4">
              <div className="p-3 bg-surface-subtle rounded-lg border border-border-neutral text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Resident:</span>
                  <span className="font-bold text-ink">{handoverParcel.residentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Flat:</span>
                  <span className="font-bold text-ink">{handoverParcel.unitCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Package:</span>
                  <span className="font-semibold text-ink">{handoverParcel.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Locker Bay:</span>
                  <span className="font-bold text-brand">{handoverParcel.storageBay || 'Bay B-14'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Enter 4-Digit Resident Pickup OTP
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={handoverOtp}
                  onChange={(e) => {
                    setHandoverOtp(e.target.value.replace(/\D/g, ''));
                    setHandoverError('');
                  }}
                  placeholder="e.g. 8821"
                  className="text-center font-mono text-xl font-bold tracking-widest"
                  autoFocus
                />
                {handoverError && (
                  <p className="text-xs text-red-500 font-medium mt-1">{handoverError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setHandoverParcel(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
                  Release Delivery
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Log Incoming Delivery Modal */}
      {isNewOpen && (
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogContent hideCloseButton={true} className="max-w-lg p-0 overflow-hidden border border-border-neutral shadow-2xl">
            <div className="p-4 bg-surface border-b border-border-neutral flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand" />
                <span className="font-bold text-sm text-ink">Register Inbound Courier at Gate</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsNewOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateNewParcel} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Courier Partner</label>
                  <select
                    value={newCourier}
                    onChange={(e) => setNewCourier(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border-neutral bg-surface text-ink text-xs"
                  >
                    <option value="Amazon Logistics">Amazon Logistics</option>
                    <option value="Flipkart Delivery">Flipkart Delivery</option>
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="Swiggy Instamart">Swiggy Instamart</option>
                    <option value="Zomato / Blinkit">Zomato / Blinkit</option>
                    <option value="India Post">India Post</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tracking / AWB Number</label>
                  <Input
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                    placeholder="e.g. AMZN-902188"
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Delivery Agent Name (Optional)</label>
                  <Input
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g. Santosh K"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Assign Storage Bay</label>
                  <select
                    value={newBay}
                    onChange={(e) => setNewBay(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border-neutral bg-surface text-ink text-xs"
                  >
                    <option value="Bay A-01">Bay A-01</option>
                    <option value="Bay A-02">Bay A-02</option>
                    <option value="Bay B-10">Bay B-10</option>
                    <option value="Bay B-14">Bay B-14</option>
                    <option value="Bay C-02">Bay C-02</option>
                    <option value="Bay C-05">Bay C-05</option>
                    <option value="Front Gate Shelf">Front Gate Shelf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Destination Unit & Resident</label>
                <UnitSearchSelect
                  value={newUnit}
                  onChange={(u) => {
                    setNewUnit(u);
                    if (u === 'A-402') setNewName('Aarav Sharma');
                    else if (u === 'B-201') setNewName('Sunita Reddy');
                    else if (u === 'C-104') setNewName('Rajesh Verma');
                    else setNewName(`Resident of ${u}`);
                  }}
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Recipient Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Resident Name"
                  required
                  className="text-xs"
                />
              </div>

              <div className="p-3 bg-brand/5 border border-brand/20 rounded-lg text-ink-muted">
                <span className="font-bold text-brand block mb-0.5">Secure OTP Handover Guarantee</span>
                Logging this delivery generates a secure 4-digit OTP delivered instantly to the resident. Guard requires this OTP at pickup to release the item.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsNewOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
                  Register Package & Notify Resident
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
