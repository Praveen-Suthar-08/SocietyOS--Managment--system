'use client';

import * as React from 'react';
import {
  Calendar,
  Clock,
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Printer,
  Receipt,
  X,
  Building,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';
import {
  AmenityBooking,
  DEFAULT_BOOKINGS,
  DEFAULT_AMENITIES,
} from '@/app/resident/amenities/page';

export default function AdminAmenitiesPage() {
  const [bookings, setBookings] = useSyncStore<AmenityBooking[]>(
    'societyos_amenity_bookings',
    DEFAULT_BOOKINGS
  );

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [selectedReceipt, setSelectedReceipt] = React.useState<AmenityBooking | null>(null);

  // New Booking Modal State
  const [isNewBookingOpen, setIsNewBookingOpen] = React.useState(false);
  const [newUnit, setNewUnit] = React.useState('A-101');
  const [newResident, setNewResident] = React.useState('Dr. Suresh Mehta');
  const [newAmenityId, setNewAmenityId] = React.useState(DEFAULT_AMENITIES[0]._id);
  const [newDate, setNewDate] = React.useState('2026-10-25');
  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setNewDate(d.toISOString().split('T')[0]);
  }, []);
  const [newStartTime, setNewStartTime] = React.useState('18:00');
  const [newDuration, setNewDuration] = React.useState('4');
  const [newPurpose, setNewPurpose] = React.useState('Society Cultural Event');
  const [newAttendees, setNewAttendees] = React.useState(50);
  const [clashError, setClashError] = React.useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.amenityName.toLowerCase().includes(search.toLowerCase()) ||
      b.residentName.toLowerCase().includes(search.toLowerCase()) ||
      b.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdminCancel = (booking: AmenityBooking) => {
    if (!confirm(`Cancel reservation ${booking.bookingRef} for ${booking.residentName}?`)) return;

    const updated = bookings.map((b) =>
      b._id === booking._id ? { ...b, status: 'CANCELLED' as const, paymentStatus: 'REFUNDED' as const } : b
    );
    setBookings(updated);
    if (selectedReceipt?._id === booking._id) {
      setSelectedReceipt({ ...selectedReceipt, status: 'CANCELLED', paymentStatus: 'REFUNDED' });
    }
    showAppToast(`Booking ${booking.bookingRef} cancelled. Real-time update synced to resident.`, 'info', 'Reservation Cancelled');
  };

  const handlePrint = () => {
    const el = document.getElementById('admin-printable-booking-slip');
    if (!el) {
      window.print();
      return;
    }
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Booking Slip - ${selectedReceipt?.bookingRef || 'Receipt'}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 10mm;
            }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 10px;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            .slip-container, .printable-slip {
              width: 100% !important;
              max-width: 660px !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              border: 2px solid #047857 !important;
              border-radius: 12px !important;
              padding: 20px 24px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              box-sizing: border-box !important;
            }
            .slip-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              gap: 16px !important;
              padding-bottom: 12px !important;
              border-bottom: 2px solid #047857 !important;
            }
            .slip-ribbon-emerald {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 8px 12px !important;
              background: #ecfdf5 !important;
              border: 1.5px solid #10b981 !important;
              border-radius: 6px !important;
              margin-top: 10px !important;
            }
            .slip-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
              margin-top: 10px !important;
            }
            .slip-card {
              background: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
            }
            .slip-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-top: 10px !important;
              border: 1px solid #cbd5e1 !important;
              border-radius: 6px !important;
              overflow: hidden !important;
            }
            .slip-table th {
              background: #0f172a !important;
              color: #ffffff !important;
              font-size: 10px !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
              padding: 7px 10px !important;
              border: 1px solid #334155 !important;
              text-align: left !important;
            }
            .slip-table td {
              padding: 7px 10px !important;
              font-size: 11px !important;
              border: 1px solid #cbd5e1 !important;
              color: #1e293b !important;
            }
            .slip-table tr:nth-child(even) td {
              background: #f8fafc !important;
            }
            .slip-table .total-row-emerald td {
              background: #ecfdf5 !important;
              color: #064e3b !important;
              font-weight: 700 !important;
              font-size: 13px !important;
            }
            .slip-footer {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              gap: 16px !important;
              margin-top: 12px !important;
              padding-top: 10px !important;
              border-top: 1px solid #cbd5e1 !important;
            }
            .slip-seal-emerald {
              border: 2px dashed #059669 !important;
              background: #ecfdf5 !important;
              color: #065f46 !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              text-align: center !important;
            }
            .flex { display: flex !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch {}
      }, 1000);
    }, 350);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setClashError(null);

    const amenity = DEFAULT_AMENITIES.find((a) => a._id === newAmenityId) || DEFAULT_AMENITIES[0];
    const start = new Date(`${newDate}T${newStartTime}:00`);
    const end = new Date(start.getTime() + parseInt(newDuration, 10) * 3600 * 1000);

    // Duplicate check
    const clash = bookings.some((b) => {
      if (b.status === 'CANCELLED') return false;
      if (b.amenityId !== amenity._id) return false;
      if (b.bookingDate !== newDate) return false;
      const existStart = new Date(b.startTime);
      const existEnd = new Date(b.endTime);
      return start < existEnd && end > existStart;
    });

    if (clash) {
      setClashError(`Clash detected: ${amenity.name} is already reserved on ${newDate} during this window.`);
      return;
    }

    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slots = Math.ceil((parseInt(newDuration, 10) * 60) / amenity.slotMinutes);
    const totalFee = slots * amenity.feePerSlot;
    const ref = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: AmenityBooking = {
      _id: `bk-${Date.now()}`,
      bookingRef: ref,
      amenityId: amenity._id,
      amenityName: amenity.name,
      unitCode: newUnit,
      residentName: newResident.trim() || 'Resident',
      bookingDate: newDate,
      startTimeStr: formatTime(start),
      endTimeStr: formatTime(end),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      purpose: newPurpose.trim(),
      attendeesCount: Number(newAttendees),
      totalFee,
      depositAmount: amenity.depositAmount,
      paymentStatus: 'PAID',
      paymentMethod: 'NET_BANKING',
      transactionId: `TXN-ADM-${Date.now().toString().slice(-6)}`,
      paidAt: 'Today',
      status: 'CONFIRMED',
      createdAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setBookings([newBooking, ...bookings]);
    setIsNewBookingOpen(false);
    showAppToast(`Allotted ${amenity.name} to ${newBooking.unitCode} (${ref}).`, 'success', 'Allotment Confirmed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Amenity Bookings & Facility Governance
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Society-wide clubhouse reservations, payment reconciliation, and printable slips (Real-Time Sync)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => setIsNewBookingOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Issue Manual Allotment</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by resident name, flat number, amenity, or ref (BK-XXXX)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
          />
        </div>

        <div className="flex rounded-lg bg-surface border border-border-neutral p-1 text-xs font-semibold self-stretch sm:self-auto">
          {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-brand text-white shadow-2xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {s === 'ALL' ? 'All Bookings' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Resident / Unit</th>
                <th className="px-4 py-3">Date & Slot</th>
                <th className="px-4 py-3">Payment / Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-ink-muted">
                    No amenity reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b._id}
                    onClick={() => setSelectedReceipt(b)}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand">{b.bookingRef}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-ink text-xs">
                      {b.amenityName}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-ink text-xs">{b.residentName}</p>
                      <span className="text-[11px] font-mono font-bold text-brand">{b.unitCode}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-muted">
                      <p className="font-semibold text-ink">{b.bookingDate}</p>
                      <p className="text-[11px]">{b.startTimeStr} - {b.endTimeStr}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <p className="font-bold text-ink">₹{(b.totalFee + b.depositAmount).toLocaleString()}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-surface-muted text-ink-muted border-border-subtle'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceipt(b)}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" />
                          Slip
                        </Button>
                        {b.status === 'CONFIRMED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-emergency hover:bg-emergency/10"
                            onClick={() => handleAdminCancel(b)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Allotment Modal */}
      {isNewBookingOpen && (
        <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Administrative Facility Allotment</DialogTitle>
              <DialogDescription>
                Assign society amenities to any of the 160 units
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 mt-1 text-xs">
              {clashError && (
                <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency font-semibold">
                  {clashError}
                </div>
              )}

              <div>
                <label className="font-semibold text-ink block mb-1">Target Unit (160 Society Units)</label>
                <UnitSearchSelect value={newUnit} onChange={setNewUnit} />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Resident / Allottee Name</label>
                <Input
                  value={newResident}
                  onChange={(e) => setNewResident(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Facility</label>
                <select
                  value={newAmenityId}
                  onChange={(e) => setNewAmenityId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  {DEFAULT_AMENITIES.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.feePerSlot === 0 ? 'Complimentary' : `₹${a.feePerSlot}/slot`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Date</label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Start Time</label>
                  <select
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Duration (Hours)</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Expected Attendees</label>
                  <Input
                    type="number"
                    min={1}
                    value={newAttendees}
                    onChange={(e) => setNewAttendees(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Event Purpose</label>
                <Input
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsNewBookingOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Allot & Confirm Slot
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Official Printable Booking Slip & Tax Receipt Modal */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent hideCloseButton={true} className="max-w-2xl p-0 max-h-[90vh] flex flex-col overflow-hidden border border-border-neutral shadow-2xl bg-surface">
            {/* Action Bar */}
            <div className="no-print p-3 sm:p-4 bg-surface border-b border-border-neutral flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand" />
                <span className="font-bold text-sm text-ink">Official Society Facility Booking Slip</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1.5" />
                  <span>Print Slip / PDF</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Canvas Container — Slip Fits Perfectly */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/60 flex-1">
              <div id="admin-printable-booking-slip" className="printable-slip max-w-[620px] mx-auto bg-white text-slate-900 rounded-xl shadow-md border border-slate-300 p-5 sm:p-6 space-y-3.5 text-xs font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b-2 border-slate-800">
                <div>
                  <h1 className="text-lg sm:text-xl font-serif font-black tracking-tight text-slate-900">
                    GREENFIELD HEIGHTS RESIDENTIAL SOCIETY
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Co-operative Housing Society Ltd. · Registration #SOC-BLR-2024-8891
                  </p>
                  <p className="text-xs text-slate-600">
                    Survey 14/2, Outer Ring Road, Bellandur, Bangalore 560103
                  </p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    BOOKING REFERENCE
                  </span>
                  <span className="text-xl font-mono font-extrabold text-brand">
                    {selectedReceipt.bookingRef}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 block mt-0.5">
                    Date: {selectedReceipt.bookingDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="font-bold uppercase tracking-wider text-emerald-800">
                    RESERVATION {selectedReceipt.status} · PAYMENT {selectedReceipt.paymentStatus}
                  </span>
                </div>
                <span className="font-mono font-semibold text-slate-700">
                  Txn ID: {selectedReceipt.transactionId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">ALLOTTEE DETAILS</span>
                  <p className="font-bold text-sm text-slate-900">{selectedReceipt.residentName}</p>
                  <p className="text-slate-700">Flat/Unit: <strong>{selectedReceipt.unitCode}</strong></p>
                  <p className="text-slate-700">Mobile: {selectedReceipt.residentPhone || '+91 98765 43210'}</p>
                </div>

                <div className="space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">FACILITY & TIME WINDOW</span>
                  <p className="font-bold text-sm text-slate-900">{selectedReceipt.amenityName}</p>
                  <p className="text-slate-700">Date: <strong>{selectedReceipt.bookingDate}</strong></p>
                  <p className="text-slate-700">
                    Timing: <strong>{selectedReceipt.startTimeStr} to {selectedReceipt.endTimeStr}</strong>
                  </p>
                </div>
              </div>

              <div className="text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">PURPOSE OF OCCUPANCY</span>
                <p className="text-slate-800">
                  {selectedReceipt.purpose} (Expected Attendees: {selectedReceipt.attendeesCount} persons)
                </p>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-center">Duration</th>
                      <th className="p-2.5 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-medium">{selectedReceipt.amenityName} Facility Hire</td>
                      <td className="p-2.5 text-center">{selectedReceipt.startTimeStr} - {selectedReceipt.endTimeStr}</td>
                      <td className="p-2.5 text-right font-mono">₹{selectedReceipt.totalFee.toLocaleString()}</td>
                    </tr>
                    {selectedReceipt.depositAmount > 0 && (
                      <tr>
                        <td className="p-2.5 font-medium">Refundable Damage & Security Deposit</td>
                        <td className="p-2.5 text-center">Post-inspection refund</td>
                        <td className="p-2.5 text-right font-mono">₹{selectedReceipt.depositAmount.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 font-bold text-sm">
                      <td colSpan={2} className="p-3 text-slate-900">
                        TOTAL AMOUNT PAID & CLEARED
                      </td>
                      <td className="p-3 text-right font-mono text-slate-900">
                        ₹{(selectedReceipt.totalFee + selectedReceipt.depositAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-300 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <QrCode className="w-16 h-16 text-slate-900 border border-slate-400 p-1 rounded" />
                  <div>
                    <span className="font-bold text-slate-900 block">SECURITY GATE CLEARANCE</span>
                    <p className="text-[11px]">Show this QR code at Gate 1 for guest vehicle admissions.</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-emerald-700 bg-emerald-50 text-emerald-900 px-4 py-2 rounded-lg text-center">
                  <span className="font-serif font-black tracking-widest text-xs uppercase block">
                    APPROVED & ALLOTTED
                  </span>
                  <span className="text-[10px] block font-sans">
                    GREENFIELD HEIGHTS ESTATE MGMT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
