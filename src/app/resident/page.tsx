'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  PhoneCall,
  Plus,
  ArrowRight,
  Users,
  Wrench,
  Package,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  Car,
  QrCode,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

export default function ResidentDashboardPage() {
  const [residentName, setResidentName] = React.useState('Aarav');
  const [residentUnit, setResidentUnit] = React.useState('Block A · Flat 402');

  React.useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('societyos_profile') || localStorage.getItem('societyos-resident-profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          const fullName = parsed.fullName || parsed.name;
          if (fullName) setResidentName(fullName.split(' ')[0]);
          if (parsed.unit) setResidentUnit(`Block A · Flat ${parsed.unit.replace(/^[A-Z]-?/, '')}`);
        }
      } catch {}
    };
    load();
    window.addEventListener('profileUpdated', load);
    return () => window.removeEventListener('profileUpdated', load);
  }, []);

  // Modal states for popup views
  const [selectedPass, setSelectedPass] = React.useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = React.useState<boolean>(false);
  const [selectedParcel, setSelectedParcel] = React.useState<boolean>(false);
  const [selectedNotice, setSelectedNotice] = React.useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = React.useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Top Greeting & Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Welcome home, {residentName}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Registered Unit: <span className="font-semibold text-ink">{residentUnit}</span> · Greenfield Heights
          </p>
        </div>

        {/* Emergency SOS Trigger Button */}
        <div className="flex items-center gap-3">
          <Link href="/resident/emergency">
            <Button
              variant="emergency"
              size="md"
              className="w-full sm:w-auto shadow-md"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              <span>Emergency Help / SOS</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Immediate Hotline Alert Notice */}
      <div className="bg-emergency-subtle border border-emergency/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 text-emergency">
          <PhoneCall className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">
            Emergency Hotline: For fire, medical, or immediate danger, dial 112 (National Emergency) or Main Gate Desk.
          </span>
        </div>
        <a
          href="tel:112"
          className="text-xs font-bold text-emergency underline hover:no-underline whitespace-nowrap"
        >
          Call Emergency (112) &gt;
        </a>
      </div>

      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Guest Passes Today */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-ink">Guest Passes Today</CardTitle>
                <CardDescription className="text-xs text-ink-muted">Visitors scheduled for Unit A-402</CardDescription>
              </div>
            </div>
            <Link href="/resident/visitors">
              <button
                type="button"
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => setSelectedPass(true)}
              className="w-full p-3 rounded-xl border border-border-neutral bg-surface-muted/50 hover:bg-surface-muted transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-brand transition-colors">Vikram Sethi</p>
                <p className="text-xs text-ink-muted">VIS-4021 · 1 Guest</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status="ACTIVE" labelOverride="Valid Today" />
                <span className="text-ink-muted text-xs">&gt;</span>
              </div>
            </button>
            <Link
              href="/resident/visitors"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1 pt-1"
            >
              Manage guest passes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Module 2: Maintenance Tickets */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-ink">Maintenance Tickets</CardTitle>
                <CardDescription className="text-xs text-ink-muted">Service requests for Unit A-402</CardDescription>
              </div>
            </div>
            <Link href="/resident/maintenance">
              <button
                type="button"
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Ticket
              </button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => setSelectedTicket(true)}
              className="w-full p-3 rounded-xl border border-border-neutral bg-surface-muted/50 hover:bg-surface-muted transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Balcony Light Sensor
                </p>
                <p className="text-xs text-ink-muted">Ticket #TCK-1092 · Electrical</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  In Progress
                </span>
                <span className="text-ink-muted text-xs">&gt;</span>
              </div>
            </button>
            <Link
              href="/resident/maintenance"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1 pt-1"
            >
              Track all requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Module 3: Parcel Desk */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-ink">Parcel Desk</CardTitle>
                <CardDescription className="text-xs text-ink-muted">Packages held at Gate 1</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => setSelectedParcel(true)}
              className="w-full p-3 rounded-xl border border-border-neutral bg-surface-muted/50 hover:bg-surface-muted transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-sm font-bold text-ink group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Amazon Courier (1 box)
                </p>
                <p className="text-xs text-ink-muted">Arrived 11:15 AM · Received by Guard</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Ready for Pickup
                </span>
                <span className="text-ink-muted text-xs">&gt;</span>
              </div>
            </button>
            <Link
              href="/resident/parcels"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1 pt-1"
            >
              View collection logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom 2 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 4: Society Notices & Bulletins */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-ink">Society Notices & Bulletins</CardTitle>
                <CardDescription className="text-xs text-ink-muted">Published by Management Committee</CardDescription>
              </div>
            </div>
            <Link
              href="/resident/announcements"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
            >
              View all &gt;
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <button
              type="button"
              onClick={() => setSelectedNotice(true)}
              className="w-full p-4 rounded-xl border border-border-neutral bg-surface-muted/40 hover:bg-surface-muted transition-colors text-left cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-subtle text-brand border border-brand/30">
                  NOTICE
                </span>
                <span className="text-xs text-ink-muted font-medium">Today, 9:00 AM</span>
              </div>
              <h3 className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
                Water Supply Tank Cleaning Schedule
              </h3>
              <p className="text-xs text-ink-muted line-clamp-2">
                Periodic overhead tank cleaning is scheduled for Thursday from 10:00 AM to 2:00 PM. Kindly keep water usage low during the mentioned time.
              </p>
            </button>
          </CardContent>
        </Card>

        {/* Module 5: Amenity Bookings */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-ink">Amenity Bookings</CardTitle>
                <CardDescription className="text-xs text-ink-muted">Clubhouse & sports facility reservations</CardDescription>
              </div>
            </div>
            <Link
              href="/resident/amenities"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
            >
              View all &gt;
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <button
              type="button"
              onClick={() => setSelectedBooking(true)}
              className="w-full p-4 rounded-xl border border-border-neutral bg-surface-muted/40 hover:bg-surface-muted transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <h3 className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
                  Clubhouse Badminton Court 1
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Saturday, 07:00 AM – 08:00 AM · Confirmed
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Booked
              </span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* POPUP MODAL 1: Guest Pass Details */}
      {selectedPass && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPass(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Visitor Pass Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPass(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-surface-muted/50 border border-border-neutral flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-muted">Visitor Name</p>
                  <p className="font-bold text-ink text-base">Vikram Sethi</p>
                  <p className="text-xs text-ink-muted mt-0.5">Phone: +91 98765 43210</p>
                </div>
                <StatusBadge status="ACTIVE" labelOverride="Valid Today" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-border-subtle bg-surface-muted/30">
                  <span className="text-ink-muted block">Pass Code:</span>
                  <span className="font-mono font-bold text-brand text-sm">VP-4021</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border-subtle bg-surface-muted/30">
                  <span className="text-ink-muted block">Vehicle Number:</span>
                  <span className="font-mono font-bold text-ink text-sm">KA-03-MG-4021</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border-subtle bg-surface-muted/30">
                  <span className="text-ink-muted block">Target Unit:</span>
                  <span className="font-bold text-ink">Block A · Flat 402</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border-subtle bg-surface-muted/30">
                  <span className="text-ink-muted block">Allowed Entries:</span>
                  <span className="font-bold text-ink">1 Single Use (0 used)</span>
                </div>
              </div>

              {/* Opaque QR code simulation */}
              <div className="p-4 rounded-xl border border-dashed border-border-neutral bg-surface-muted/20 flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 bg-white p-2 rounded-xl border border-border-neutral flex items-center justify-center shadow-xs">
                  <QrCode className="w-24 h-24 text-ink" />
                </div>
                <p className="text-[11px] text-ink-muted mt-2 font-mono">
                  Token: vp_opq_91a0f8b1c4 (Zero PII Encoded)
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedPass(false)}
              >
                Close
              </Button>
              <Link href="/resident/visitors" className="flex-1">
                <Button variant="primary" className="w-full">
                  Manage Passes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Maintenance Ticket Details */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedTicket(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-ink">Maintenance Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-surface-muted/50 border border-border-neutral">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-600 font-bold">TCK-1092</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                    In Progress
                  </span>
                </div>
                <h4 className="font-bold text-ink mt-1">Balcony Motion Sensor Fault</h4>
                <p className="text-xs text-ink-muted mt-1">
                  Automatic twilight sensor flickering intermittently. Replacement PIR module requested.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border-subtle">
                  <span className="text-ink-muted">Assigned Electrician:</span>
                  <span className="font-semibold text-ink">Kailash Nath (+91 98765 11092)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle">
                  <span className="text-ink-muted">Scheduled Window:</span>
                  <span className="font-semibold text-ink">Today, 4:00 PM – 5:30 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle">
                  <span className="text-ink-muted">Location:</span>
                  <span className="font-semibold text-ink">Unit A-402, North Balcony</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => setSelectedTicket(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: Parcel Pickup Details */}
      {selectedParcel && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedParcel(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-ink">Package Held at Gate</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParcel(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">Amazon Logistics · 1 Corrugated Box</p>
                <p className="text-xs text-ink-muted mt-0.5">AWB: 4029-AMZ-8812</p>
                <p className="text-xs text-ink-muted">Delivered to: Officer Ramesh Kumar · Gate 1 Main Desk</p>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-border-neutral bg-surface-muted/30 text-center">
                <p className="text-xs text-ink-muted">Resident Pickup Security OTP</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-brand mt-1">7294</p>
                <p className="text-[11px] text-ink-muted mt-1">
                  Present this 4-digit code to the duty guard at Gate 1 North to claim your package.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => setSelectedParcel(false)}
            >
              Acknowledge
            </Button>
          </div>
        </div>
      )}

      {/* POPUP MODAL 4: Full Notice & Safety Correction History */}
      {selectedNotice && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedNotice(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Official Society Bulletin</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-subtle text-brand border border-brand/30">
                  SCHEDULED MAINTENANCE
                </span>
                <span className="text-xs text-ink-muted">Published Today at 9:00 AM by Facility Committee</span>
              </div>

              <h2 className="text-lg font-bold text-ink">
                Water Supply Tank Cleaning & Preventive Chlorination
              </h2>

              <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-neutral space-y-2 text-xs leading-relaxed text-ink">
                <p>
                  Please be informed that the biannual deep-cleaning and high-pressure descaling of overhead residential water tanks for Block A and Block B is scheduled for this Thursday between 10:00 AM and 2:00 PM.
                </p>
                <p className="font-semibold">
                  Key Resident Instructions:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-ink-muted">
                  <li>Store adequate drinking and domestic water in advance.</li>
                  <li>Inlet booster pumps will remain temporarily deactivated during the treatment.</li>
                  <li>Post-cleaning flush will be executed by maintenance at 2:15 PM.</li>
                </ul>
              </div>

              {/* Safety Correction History (Append-only governance) */}
              <div className="p-3 rounded-xl border border-border-subtle bg-surface-muted/30 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-brand" /> Immutable Safety Correction Log (1)
                </span>
                <div className="text-xs text-ink-muted pl-4 border-l-2 border-brand/40">
                  <p className="font-semibold text-ink">Correction #1 · 09:30 AM:</p>
                  <p>Extended flushing window by 15 minutes to guarantee chlorine neutralization before domestic supply resumption.</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedNotice(false)}
            >
              Close Notice
            </Button>
          </div>
        </div>
      )}

      {/* POPUP MODAL 5: Amenity Booking Details */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedBooking(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Facility Reservation</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Clubhouse Badminton Court 1</p>
                  <p className="text-xs text-ink-muted mt-0.5">Slot: Saturday, 07:00 AM – 08:00 AM</p>
                </div>
                <StatusBadge status="ACTIVE" labelOverride="Confirmed" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border-subtle">
                  <span className="text-ink-muted">Reserved By:</span>
                  <span className="font-semibold text-ink">Aarav Sharma (Unit A-402)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle">
                  <span className="text-ink-muted">Access Code / Token:</span>
                  <span className="font-mono font-bold text-brand">BK-BADM-9402</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle">
                  <span className="text-ink-muted">Mandatory Rule:</span>
                  <span className="font-semibold text-ink">Non-marking court shoes only</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedBooking(false)}
              >
                Close
              </Button>
              <Link href="/resident/amenities" className="flex-1">
                <Button variant="primary" className="w-full">
                  All Amenities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
