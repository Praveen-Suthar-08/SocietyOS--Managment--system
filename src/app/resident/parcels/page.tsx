'use client';

import * as React from 'react';
import {
  Package,
  KeyRound,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  Info,
  Plus,
  X,
  Truck,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

export interface Parcel {
  id: string;
  trackingId: string;
  courier: string;
  unitCode: string;
  residentName: string;
  pickupOtp: string;
  status: 'HELD_AT_GATE' | 'COLLECTED';
  receivedAt: string;
  collectedAt?: string;
  receivedByGuard?: string;
  gateGuard?: string;
  storageBay?: string;
  releasedBy?: string;
}

export const DEFAULT_PARCELS: Parcel[] = [
  {
    id: 'p-1',
    trackingId: 'AWB-4029-AMZ-8812',
    courier: 'Amazon Logistics (1 Corrugated Box)',
    unitCode: 'A-402',
    residentName: 'Aarav Sharma',
    pickupOtp: '7294',
    status: 'HELD_AT_GATE',
    receivedAt: 'Today, 11:15 AM',
    gateGuard: 'Officer Ramesh Kumar · Gate 1 North',
    receivedByGuard: 'Officer Ramesh Kumar',
    storageBay: 'Bay B-14 (Secure Courier Room)',
  },
  {
    id: 'p-2',
    trackingId: 'SWIGGY-INSTA-4401',
    courier: 'Swiggy Instamart (Grocery Bag)',
    unitCode: 'A-402',
    residentName: 'Aarav Sharma',
    pickupOtp: '1109',
    status: 'COLLECTED',
    receivedAt: 'Yesterday, 18:20',
    collectedAt: 'Yesterday, 18:35',
    gateGuard: 'Officer Vikram Singh · Gate 1 North',
    receivedByGuard: 'Officer Vikram Singh',
    storageBay: 'Bay A-03',
    releasedBy: 'Officer Vikram Singh',
  },
  {
    id: 'p-3',
    trackingId: 'BD-7719-BLUEDART',
    courier: 'BlueDart Express (Document Envelope)',
    unitCode: 'B-201',
    residentName: 'Rohan Deshmukh',
    pickupOtp: '3910',
    status: 'HELD_AT_GATE',
    receivedAt: 'Today, 12:40 PM',
    gateGuard: 'Officer Vikram Singh · Gate 1 North',
    receivedByGuard: 'Officer Vikram Singh',
    storageBay: 'Bay C-02',
  },
  {
    id: 'p-4',
    trackingId: 'FK-9901-FLIPKART',
    courier: 'Flipkart Delivery (Electronics Box)',
    unitCode: 'A-101',
    residentName: 'Dr. Suresh Mehta',
    pickupOtp: '5512',
    status: 'COLLECTED',
    receivedAt: 'Yesterday, 14:10',
    collectedAt: 'Yesterday, 17:30',
    gateGuard: 'Officer Ramesh Kumar',
    receivedByGuard: 'Officer Ramesh Kumar',
    storageBay: 'Bay A-01',
    releasedBy: 'Officer Ramesh Kumar',
  },
];

export default function ResidentParcelsPage() {
  const [parcels, setParcels] = useSyncStore<Parcel[]>('societyos_parcels', DEFAULT_PARCELS);
  const [selectedParcel, setSelectedParcel] = React.useState<Parcel | null>(null);
  const [copiedOtp, setCopiedOtp] = React.useState(false);
  // Pre-Register / Create Parcel State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [courierProvider, setCourierProvider] = React.useState('Amazon Logistics');
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [packageDescription, setPackageDescription] = React.useState('');
  const [expectedTimeWindow, setExpectedTimeWindow] = React.useState('Today Afternoon (12:00 - 16:00)');

  const residentParcels = parcels.filter(
    (p) => p.unitCode === 'A-402' || !p.unitCode || p.residentName?.toLowerCase().includes('aarav')
  );

  const heldParcels = residentParcels.filter((p) => p.status === 'HELD_AT_GATE');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    showAppToast(`OTP ${code} copied to clipboard!`, 'info', 'OTP Copied');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCreateParcel = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedTracking = trackingNumber.trim() || `TRK-AMZ-${Math.floor(10000 + Math.random() * 90000)}`;

    const newParcel: Parcel = {
      id: `p-${Date.now()}`,
      trackingId: generatedTracking,
      courier: `${courierProvider} ${packageDescription.trim() ? `(${packageDescription.trim()})` : ''}`,
      unitCode: 'A-402',
      residentName: 'Aarav Sharma',
      pickupOtp: otp,
      status: 'HELD_AT_GATE',
      receivedAt: `Pre-Alerted by Resident (${expectedTimeWindow})`,
      gateGuard: 'Officer Ramesh Kumar · Gate 1 Parcel Desk',
      receivedByGuard: 'Officer Ramesh Kumar',
      storageBay: 'Bay B-14 (Inbound Parcel Shelf)',
    };

    setParcels([newParcel, ...parcels]);
    setIsCreateOpen(false);
    setTrackingNumber('');
    setPackageDescription('');
    showAppToast(
      `Delivery pre-alert created! Present OTP ${otp} to security at Gate 1 when package arrives.`,
      'success',
      'Parcel Pre-Alert Logged'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            My Packages & Gate Deliveries
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Deliveries held securely at Gate 1 for Unit A-402. Verification & release is handled strictly by Security with your OTP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Pre-Alert Expected Parcel</span>
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Package className="w-3.5 h-3.5" />
            <span>{heldParcels.length} Awaiting Pickup</span>
          </div>
        </div>
      </div>

      {/* Guide Banner: Where to submit OTP */}
      <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-ink text-sm">Strict Security Handover Protocol</p>
            <p className="text-ink-muted leading-relaxed">
              Under society security regulations, <strong>only on-duty Security Officers</strong> at Gate 1 North Parcel Desk are authorized to verify and release packages. Present your <strong>4-digit Pickup OTP</strong> at the gate desk to claim custody.
            </p>
          </div>
        </div>
      </div>

      {/* Parcels List */}
      <div className="space-y-4">
        {residentParcels.map((parcel) => (
          <Card
            key={parcel.id}
            onClick={() => setSelectedParcel(parcel)}
            className={`border cursor-pointer transition-all hover:shadow-md hover:border-brand/50 group ${
              parcel.status === 'HELD_AT_GATE'
                ? 'border-amber-500/40 bg-surface shadow-xs'
                : 'border-border-neutral bg-surface opacity-85'
            }`}
          >
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-neutral">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      parcel.status === 'HELD_AT_GATE'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-surface-muted text-ink-muted'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base group-hover:text-brand transition-colors">
                      {parcel.courier}
                    </h3>
                    <p className="text-xs font-mono text-ink-muted">Tracking: {parcel.trackingId}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1 ${
                    parcel.status === 'HELD_AT_GATE'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-brand/10 text-brand border-brand/25'
                  }`}
                >
                  {parcel.status === 'HELD_AT_GATE' ? 'Ready for Pickup at Gate 1' : 'Collected by Resident'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Clock className="w-4 h-4 text-ink-subtle" />
                    <span>Logged by Gate: {parcel.receivedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    <span>Duty Guard: {parcel.gateGuard || parcel.receivedByGuard || 'Officer Ramesh Kumar'}</span>
                  </div>
                  {parcel.storageBay && (
                    <div className="flex items-center gap-2 text-ink-muted">
                      <Building className="w-4 h-4 text-ink-subtle" />
                      <span>Holding Location: {parcel.storageBay}</span>
                    </div>
                  )}
                  {parcel.collectedAt && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Handed Over: {parcel.collectedAt}</span>
                    </div>
                  )}
                </div>

                {/* OTP Box */}
                {parcel.status === 'HELD_AT_GATE' ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase tracking-wider">
                        Gate Pickup Passcode
                      </span>
                      <span className="text-2xl font-mono font-extrabold text-amber-800 dark:text-amber-200 tracking-wider">
                        {parcel.pickupOtp}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(parcel.pickupOtp);
                      }}
                      className="h-8 px-2.5 text-xs bg-surface border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                    >
                      {copiedOtp ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedOtp ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-surface-muted border border-border-neutral flex items-center justify-between text-ink-muted">
                    <span className="text-xs">Custody released successfully</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pre-Register / Create Parcel Modal */}
      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                  Unit A-402
                </span>
                <span className="text-xs text-ink-muted">Inbound Pre-Alert</span>
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                Pre-Alert / Log Expected Parcel
              </DialogTitle>
              <DialogDescription>
                Alert Gate 1 Security about an incoming courier delivery so it is received into secure custody.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateParcel} className="space-y-4 my-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">Courier / Delivery Service *</label>
                <select
                  value={courierProvider}
                  onChange={(e) => setCourierProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border-neutral rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Amazon Logistics">Amazon Logistics</option>
                  <option value="Flipkart Delivery">Flipkart Delivery</option>
                  <option value="Swiggy Instamart">Swiggy Instamart</option>
                  <option value="Blinkit Quick Delivery">Blinkit Quick Delivery</option>
                  <option value="Zomato Hyperpure">Zomato Hyperpure</option>
                  <option value="BlueDart Express">BlueDart Express</option>
                  <option value="DTDC Courier">DTDC Courier</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Delhivery Courier">Delhivery Courier</option>
                  <option value="India Post EMS">India Post EMS</option>
                  <option value="Other Private Courier">Other Private Courier</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">Tracking ID / Order Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AWB-991204 or AMZ-88412"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-surface border border-border-neutral rounded-xl text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">Package Description</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Large Box Electronics, Documents, Medicine"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border-neutral rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">Expected Delivery Window</label>
                <select
                  value={expectedTimeWindow}
                  onChange={(e) => setExpectedTimeWindow(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border-neutral rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Today Morning (09:00 - 13:00)">Today Morning (09:00 - 13:00)</option>
                  <option value="Today Afternoon (13:00 - 17:00)">Today Afternoon (13:00 - 17:00)</option>
                  <option value="Today Evening (17:00 - 21:00)">Today Evening (17:00 - 21:00)</option>
                  <option value="Tomorrow All Day">Tomorrow All Day</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-brand/5 border border-brand/20 text-ink-muted space-y-1">
                <p className="font-semibold text-ink text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Automatic OTP Generation
                </p>
                <p className="text-[11px] leading-relaxed">
                  A unique 4-digit OTP will be generated upon saving. When you go to Gate 1 Parcel Desk, show this OTP to Security to collect your package.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Log Parcel Pre-Alert</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Detail Dialog — Security Handover Only */}
      {selectedParcel && (
        <Dialog open={!!selectedParcel} onOpenChange={() => setSelectedParcel(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <span className="font-mono text-xs font-bold text-brand">{selectedParcel.trackingId}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    selectedParcel.status === 'HELD_AT_GATE'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {selectedParcel.status === 'HELD_AT_GATE' ? 'Held at Gate 1' : 'Collected'}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                {selectedParcel.courier}
              </DialogTitle>
              <DialogDescription>
                Recipient: {selectedParcel.residentName} · {selectedParcel.unitCode || 'Unit A-402'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* If parcel is still held, show prominent OTP pass */}
              {selectedParcel.status === 'HELD_AT_GATE' && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-surface border border-amber-500/30 text-center space-y-2">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Present this code to Security Guard at Gate 1
                  </p>
                  <p className="text-4xl font-mono font-extrabold tracking-widest text-amber-700 dark:text-amber-200">
                    {selectedParcel.pickupOtp}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Guard terminal: Gate 1 North · Bay: {selectedParcel.storageBay || 'B-14'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedParcel.pickupOtp)}
                    className="mx-auto text-xs"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>{copiedOtp ? 'Copied OTP' : 'Copy OTP to Clipboard'}</span>
                  </Button>
                </div>
              )}

              <div className="p-3 bg-surface-muted/50 rounded-xl border border-border-neutral space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Logged In:</span>
                  <span className="font-medium text-ink">{selectedParcel.receivedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Receiving Officer:</span>
                  <span className="font-medium text-ink">
                    {selectedParcel.gateGuard || selectedParcel.receivedByGuard || 'Officer Ramesh Kumar'}
                  </span>
                </div>
                {selectedParcel.collectedAt && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Collected At:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {selectedParcel.collectedAt}
                    </span>
                  </div>
                )}
                {selectedParcel.releasedBy && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Released By:</span>
                    <span className="font-medium text-ink">{selectedParcel.releasedBy}</span>
                  </div>
                )}
              </div>

              {/* Strict Security Handover Protocol Notice */}
              {selectedParcel.status === 'HELD_AT_GATE' ? (
                <div className="p-3.5 rounded-xl border border-border-neutral bg-surface-muted/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-ink font-semibold">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    <span>Security Verification Required</span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Under society security bylaws, resident packages can only be verified and released by on-duty Security personnel at Gate 1 North Parcel Desk. Residents cannot self-release packages.
                  </p>
                </div>
              ) : null}
            </div>

            <Button variant="ghost" className="w-full" onClick={() => setSelectedParcel(null)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
