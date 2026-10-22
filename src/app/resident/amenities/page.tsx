'use client';

import * as React from 'react';
import {
  Calendar,
  Clock,
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  CreditCard,
  QrCode,
  Building,
  Printer,
  X,
  Check,
  Download,
  Receipt,
  Sparkles,
  Undo2,
  RefreshCw,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

export interface Amenity {
  _id: string;
  name: string;
  code: string;
  type: string;
  capacity: number;
  description: string;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  feePerSlot: number;
  depositAmount: number;
  status: string;
  rules: string[];
}

export interface AmenityBooking {
  _id: string;
  bookingRef: string;
  amenityId: string;
  amenityName: string;
  unitCode: string;
  residentName: string;
  residentPhone?: string;
  bookingDate: string; // YYYY-MM-DD
  startTimeStr: string; // "10:00 AM"
  endTimeStr: string; // "02:00 PM"
  startTime: string; // ISO
  endTime: string; // ISO
  purpose: string;
  attendeesCount: number;
  totalFee: number;
  depositAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod?: 'UPI_QR' | 'CARD' | 'NET_BANKING';
  transactionId?: string;
  paidAt?: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  specialRequests?: string;
  refundReference?: string;
  refundAmount?: number;
  cancellationReason?: string;
  cancelledAt?: string;
}

export const DEFAULT_AMENITIES: Amenity[] = [
  {
    _id: 'amen-1',
    name: 'Grand Clubhouse Banquet Hall',
    code: 'HALL-A',
    type: 'COMMUNITY_HALL',
    capacity: 150,
    description: 'Air-conditioned banquet hall with private lawn access for birthdays, celebrations, and gatherings.',
    openTime: '09:00',
    closeTime: '23:00',
    slotMinutes: 240,
    feePerSlot: 2500,
    depositAmount: 5000,
    status: 'ACTIVE',
    rules: ['No loud music after 22:00 PM', 'Catering waste must be cleared by contractor', 'Resident host must be present'],
  },
  {
    _id: 'amen-2',
    name: 'Resident Guest Suite (Room 1)',
    code: 'GUEST-1',
    type: 'GUEST_ROOM',
    capacity: 3,
    description: 'Furnished studio suite with attached bathroom and kitchenette for visiting family members of residents.',
    openTime: '12:00',
    closeTime: '11:00',
    slotMinutes: 1440,
    feePerSlot: 1200,
    depositAmount: 1000,
    status: 'ACTIVE',
    rules: ['Valid government photo ID mandatory at check-in', 'Maximum stay 5 nights consecutively', 'No smoking'],
  },
  {
    _id: 'amen-3',
    name: 'All-Weather Floodlit Tennis Court',
    code: 'TENNIS-1',
    type: 'SPORTS_FACILITY',
    capacity: 4,
    description: 'Synthetic floodlit tennis court. Proper non-marking tennis shoes mandatory at all times.',
    openTime: '06:00',
    closeTime: '21:00',
    slotMinutes: 60,
    feePerSlot: 200,
    depositAmount: 0,
    status: 'ACTIVE',
    rules: ['Non-marking shoes only', 'Booking restricted to 1 hour per day per household', 'Turn off floodlights after play'],
  },
  {
    _id: 'amen-4',
    name: 'Clubhouse Badminton Court 1',
    code: 'BADMINTON-1',
    type: 'SPORTS_FACILITY',
    capacity: 4,
    description: 'Indoor wooden flooring badminton court with high-lux LED sports lighting.',
    openTime: '06:00',
    closeTime: '22:00',
    slotMinutes: 60,
    feePerSlot: 0,
    depositAmount: 0,
    status: 'ACTIVE',
    rules: ['Non-marking gum sole shoes only', 'Carry own racquets and shuttlecocks'],
  },
];

export const DEFAULT_BOOKINGS: AmenityBooking[] = [
  {
    _id: 'bk-101',
    bookingRef: 'BK-8902',
    amenityId: 'amen-4',
    amenityName: 'Clubhouse Badminton Court 1',
    unitCode: 'A-402',
    residentName: 'Aarav Sharma',
    residentPhone: '+91 98765 43210',
    bookingDate: '2026-10-24',
    startTimeStr: '07:00 AM',
    endTimeStr: '08:00 AM',
    startTime: '2026-10-24T07:00:00.000Z',
    endTime: '2026-10-24T08:00:00.000Z',
    status: 'CONFIRMED',
    purpose: 'Morning Exercise Match',
    attendeesCount: 2,
    totalFee: 0,
    depositAmount: 0,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_QR',
    transactionId: 'TXN-SOC-001092-COMPLIMENTARY',
    paidAt: 'Oct 20, 2026',
    createdAt: 'Oct 20, 2026',
  },
  {
    _id: 'bk-102',
    bookingRef: 'BK-7714',
    amenityId: 'amen-1',
    amenityName: 'Grand Clubhouse Banquet Hall',
    unitCode: 'A-101',
    residentName: 'Dr. Suresh Mehta',
    residentPhone: '+91 98765 11002',
    bookingDate: '2026-10-25',
    startTimeStr: '06:00 PM',
    endTimeStr: '10:00 PM',
    startTime: '2026-10-25T18:00:00.000Z',
    endTime: '2026-10-25T22:00:00.000Z',
    status: 'CONFIRMED',
    purpose: 'Family Anniversary Dinner & Reception',
    attendeesCount: 65,
    totalFee: 2500,
    depositAmount: 5000,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_QR',
    transactionId: 'TXN-SOC-981248-UPI',
    paidAt: 'Oct 19, 2026',
    createdAt: 'Oct 19, 2026',
  },
];

export default function ResidentAmenitiesPage() {
  const [amenities] = React.useState<Amenity[]>(DEFAULT_AMENITIES);
  const [bookings, setBookings] = useSyncStore<AmenityBooking[]>(
    'societyos_amenity_bookings',
    DEFAULT_BOOKINGS
  );

  const [selectedAmenity, setSelectedAmenity] = React.useState<Amenity | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [receiptBooking, setReceiptBooking] = React.useState<AmenityBooking | null>(null);

  const [bookingDate, setBookingDate] = React.useState('2026-10-25');
  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setBookingDate(d.toISOString().split('T')[0]);
  }, []);
  const [startTimeStr, setStartTimeStr] = React.useState('10:00');
  const [durationHours, setDurationHours] = React.useState('2');
  const [purpose, setPurpose] = React.useState('');
  const [attendeesCount, setAttendeesCount] = React.useState(10);
  const [clashError, setClashError] = React.useState<string | null>(null);

  // Demo Payment Gateway State
  const [paymentTab, setPaymentTab] = React.useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState('HDFC Bank');
  const [cardNumber, setCardNumber] = React.useState('4532 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = React.useState('08/29');
  const [cardCvv, setCardCvv] = React.useState('921');

  // Cancellation & 3-Day Refund Modal State
  const [cancellingBooking, setCancellingBooking] = React.useState<AmenityBooking | null>(null);
  const [cancellationReason, setCancellationReason] = React.useState('Schedule Conflict / Change of Plans');
  const [cancellationNote, setCancellationNote] = React.useState('');
  const [refundVoucherBooking, setRefundVoucherBooking] = React.useState<AmenityBooking | null>(null);

  // Filter resident's bookings (A-402)
  const myBookings = bookings.filter((b) => b.unitCode === 'A-402' || b.residentName === 'Aarav Sharma');

  const handleOpenBooking = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setPurpose('');
    setAttendeesCount(Math.min(amenity.capacity, 10));
    setClashError(null);
    setBookingDialogOpen(true);
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;
    setClashError(null);

    // 1. DUPLICATE & OVERLAP CHECK
    const requestedStart = new Date(`${bookingDate}T${startTimeStr}:00`);
    const requestedEnd = new Date(requestedStart.getTime() + parseInt(durationHours, 10) * 3600 * 1000);

    const hasClash = bookings.some((b) => {
      if (b.status === 'CANCELLED') return false;
      if (b.amenityId !== selectedAmenity._id) return false;
      if (b.bookingDate !== bookingDate) return false;

      const existingStart = new Date(b.startTime);
      const existingEnd = new Date(b.endTime);

      // Overlap: requestedStart < existingEnd && requestedEnd > existingStart
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });

    if (hasClash) {
      setClashError(
        `Time Slot Clash: ${selectedAmenity.name} is already booked on ${bookingDate} during that time window. Duplicate bookings are not allowed. Please choose a different time or date.`
      );
      return;
    }

    // No clash! Proceed to demo payment gateway
    setBookingDialogOpen(false);
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = () => {
    if (!selectedAmenity) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const requestedStart = new Date(`${bookingDate}T${startTimeStr}:00`);
      const requestedEnd = new Date(requestedStart.getTime() + parseInt(durationHours, 10) * 3600 * 1000);

      const slots = Math.ceil((parseInt(durationHours, 10) * 60) / selectedAmenity.slotMinutes);
      const totalFee = slots * selectedAmenity.feePerSlot;
      const depositAmount = selectedAmenity.depositAmount;
      const txnRef = `TXN-SOC-${Math.floor(100000 + Math.random() * 900000)}-${paymentTab}`;
      const bookingRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

      const formatTime = (date: Date) =>
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newBooking: AmenityBooking = {
        _id: `bk-${Date.now()}`,
        bookingRef,
        amenityId: selectedAmenity._id,
        amenityName: selectedAmenity.name,
        unitCode: 'A-402',
        residentName: 'Aarav Sharma',
        residentPhone: '+91 98765 43210',
        bookingDate,
        startTimeStr: formatTime(requestedStart),
        endTimeStr: formatTime(requestedEnd),
        startTime: requestedStart.toISOString(),
        endTime: requestedEnd.toISOString(),
        purpose: purpose.trim() || 'Resident Personal Event',
        attendeesCount: Number(attendeesCount),
        totalFee,
        depositAmount,
        paymentStatus: 'PAID',
        paymentMethod: paymentTab === 'UPI' ? 'UPI_QR' : paymentTab === 'CARD' ? 'CARD' : 'NET_BANKING',
        transactionId: txnRef,
        paidAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'CONFIRMED',
        createdAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      };

      setBookings([newBooking, ...bookings]);
      setIsProcessingPayment(false);
      setPaymentDialogOpen(false);
      setReceiptBooking(newBooking);

      showAppToast(
        `Payment of ₹${totalFee + depositAmount} verified! Booking ${bookingRef} confirmed.`,
        'success',
        'Reservation & Payment Confirmed'
      );
    }, 1200);
  };

  const handleOpenCancelModal = (booking: AmenityBooking) => {
    setCancellingBooking(booking);
    setCancellationReason('Schedule Conflict / Change of Plans');
    setCancellationNote('');
  };

  const handleConfirmCancellation = () => {
    if (!cancellingBooking) return;
    const refId = `REF-GH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullRefund = cancellingBooking.totalFee + cancellingBooking.depositAmount;
    const nowIso = new Date().toISOString();

    const updatedBooking: AmenityBooking = {
      ...cancellingBooking,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      refundReference: refId,
      refundAmount: fullRefund,
      cancellationReason: cancellationNote.trim()
        ? `${cancellationReason}: ${cancellationNote.trim()}`
        : cancellationReason,
      cancelledAt: nowIso,
    };

    const updated = bookings.map((b) => (b._id === cancellingBooking._id ? updatedBooking : b));
    setBookings(updated);
    setCancellingBooking(null);
    setReceiptBooking(null);
    setRefundVoucherBooking(updatedBooking);

    showAppToast(
      `Booking ${cancellingBooking.bookingRef} cancelled. 100% refund of ₹${fullRefund.toLocaleString()} initiated. Bank credit within 2-3 business days.`,
      'info',
      'Refund Voucher Issued'
    );
  };

  const printSlipElement = (elementId: string, title: string) => {
    const el = document.getElementById(elementId);
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
          <title>${title}</title>
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
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              border: 2px solid #0f172a !important;
              border-radius: 12px !important;
              padding: 20px 24px !important;
              box-sizing: border-box !important;
            }
            .slip-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              gap: 16px !important;
              padding-bottom: 12px !important;
              border-bottom: 2px solid #0f172a !important;
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
            .slip-ribbon-amber {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 8px 12px !important;
              background: #fffbeb !important;
              border: 1.5px solid #f59e0b !important;
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
            .slip-table .total-row-amber td {
              background: #fffbeb !important;
              color: #78350f !important;
              font-weight: 700 !important;
              font-size: 13px !important;
            }
            .slip-callout-amber {
              background: #fffbeb !important;
              border: 1.5px solid #fcd34d !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              margin-top: 10px !important;
              color: #78350f !important;
            }
            .slip-callout-emerald {
              background: #ecfdf5 !important;
              border: 1.5px solid #6ee7b7 !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              margin-top: 10px !important;
              color: #065f46 !important;
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
            .slip-seal-amber {
              border: 2px dashed #d97706 !important;
              background: #fffbeb !important;
              color: #92400e !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              text-align: center !important;
            }
            .slip-seal-emerald {
              border: 2px dashed #059669 !important;
              background: #ecfdf5 !important;
              color: #065f46 !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              text-align: center !important;
            }
            /* Explicit fallback layout rules */
            .flex { display: flex !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
            .font-serif { font-family: Georgia, Cambria, "Times New Roman", Times, serif !important; }
            .uppercase { text-transform: uppercase !important; }
            .font-bold { font-weight: 700 !important; }
            .font-black { font-weight: 900 !important; }
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

  const handlePrint = () => {
    printSlipElement('printable-booking-slip', `Official Booking Slip - ${receiptBooking?.bookingRef || 'Receipt'}`);
  };

  const handlePrintRefundVoucher = () => {
    printSlipElement('printable-refund-voucher', `Refund Voucher - ${refundVoucherBooking?.refundReference || 'Voucher'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Society Amenities & Facility Bookings
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Reserve community halls, guest rooms, and sports courts with atomic clash protection & payment gateway
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">My Active Bookings:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/20">
            {myBookings.filter((b) => b.status === 'CONFIRMED').length} Reserved
          </span>
        </div>
      </div>

      {/* Facilities Grid */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
          <Building className="w-5 h-5 text-brand" />
          <span>Available Facilities (Greenfield Heights)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {amenities.map((amenity) => (
            <Card
              key={amenity._id}
              className="flex flex-col justify-between border border-border-neutral hover:border-brand/40 hover:shadow-md transition-all group"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {amenity.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {amenity.feePerSlot === 0 ? 'Complimentary' : `₹${amenity.feePerSlot.toLocaleString()}/slot`}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-ink mt-2 group-hover:text-brand transition-colors">
                  {amenity.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {amenity.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                <div className="space-y-1.5 text-xs text-ink-muted border-t border-border-neutral pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-ink-subtle" /> Hours:
                    </span>
                    <span className="font-medium text-ink">
                      {amenity.openTime} - {amenity.closeTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-ink-subtle" /> Max Guests:
                    </span>
                    <span className="font-medium text-ink">{amenity.capacity} People</span>
                  </div>
                  {amenity.depositAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-ink-subtle" /> Deposit:
                      </span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        ₹{amenity.depositAmount.toLocaleString()} (Refundable)
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleOpenBooking(amenity)}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Reserve Slot</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Reservations Section */}
      <div className="pt-4 border-t border-border-neutral">
        <h2 className="text-lg font-bold text-ink mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand" />
            <span>My Bookings & Payment Slips</span>
          </span>
          <span className="text-xs font-normal text-ink-muted">Click any booking to view or print official receipt</span>
        </h2>

        {myBookings.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-2xl border border-dashed border-border-neutral p-6">
            <Calendar className="w-9 h-9 mx-auto text-ink-muted mb-2" />
            <p className="text-sm font-semibold text-ink">No Facility Reservations Yet</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Choose an amenity above to book banquet halls, guest suites, or sports courts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myBookings.map((b) => (
              <Card
                key={b._id}
                onClick={() => setReceiptBooking(b)}
                className={`p-4 border cursor-pointer hover:border-brand/50 hover:shadow-md transition-all group ${
                  b.status === 'CONFIRMED' ? 'border-border-neutral bg-surface' : 'border-border-neutral bg-surface opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-neutral">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand">{b.bookingRef}</span>
                    <h3 className="font-bold text-sm text-ink group-hover:text-brand transition-colors mt-0.5">
                      {b.amenityName}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-surface-muted text-ink-muted border-border-subtle'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      PAID · {b.transactionId?.slice(0, 14)}...
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted mt-3">
                  <div>
                    <span>Date:</span>
                    <p className="font-semibold text-ink">{b.bookingDate}</p>
                  </div>
                  <div>
                    <span>Timing:</span>
                    <p className="font-semibold text-ink">
                      {b.startTimeStr} - {b.endTimeStr}
                    </p>
                  </div>
                  <div>
                    <span>Total Amount Paid:</span>
                    <p className="font-bold text-ink">₹{(b.totalFee + b.depositAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <span>Purpose:</span>
                    <p className="text-ink truncate">{b.purpose}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-neutral text-xs">
                  <span className="text-brand font-semibold flex items-center gap-1 group-hover:underline">
                    <Printer className="w-3.5 h-3.5" /> View & Print Receipt
                  </span>
                  {b.status === 'CONFIRMED' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCancelModal(b);
                      }}
                      className="text-xs text-emergency font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel & Refund
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRefundVoucherBooking(b);
                      }}
                      className="text-xs text-brand font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Refund Voucher
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reservation Setup Dialog */}
      {selectedAmenity && (
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" />
                <span>Reserve {selectedAmenity.name}</span>
              </DialogTitle>
              <DialogDescription>
                Unit A-402 · Greenfield Heights Compound
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInitiatePayment} className="space-y-4 mt-1 text-xs">
              {clashError && (
                <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{clashError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Reservation Date</label>
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setClashError(null);
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Start Time</label>
                  <select
                    value={startTimeStr}
                    onChange={(e) => {
                      setStartTimeStr(e.target.value);
                      setClashError(null);
                    }}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((t) => (
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
                  <select
                    value={durationHours}
                    onChange={(e) => {
                      setDurationHours(e.target.value);
                      setClashError(null);
                    }}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours (Full Day)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Expected Attendees</label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedAmenity.capacity}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Event / Booking Purpose</label>
                <Input
                  placeholder="e.g. Birthday Party, Badminton Match, Family Gathering"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              {/* Price Calculation preview */}
              <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Facility Slot Charges:</span>
                  <span className="font-bold text-ink">
                    ₹{((Math.ceil((parseInt(durationHours, 10) * 60) / selectedAmenity.slotMinutes)) * selectedAmenity.feePerSlot).toLocaleString()}
                  </span>
                </div>
                {selectedAmenity.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Refundable Security Deposit:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      ₹{selectedAmenity.depositAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border-neutral font-bold text-sm text-ink">
                  <span>Total Payable:</span>
                  <span className="text-brand">
                    ₹{(
                      ((Math.ceil((parseInt(durationHours, 10) * 60) / selectedAmenity.slotMinutes)) * selectedAmenity.feePerSlot) +
                      selectedAmenity.depositAmount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Proceed to Payment & Receipt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Demo Payment Gateway Dialog */}
      {selectedAmenity && (
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-brand">
                <Sparkles className="w-5 h-5 text-brand" />
                <DialogTitle>Greenfield Heights Payment Gateway</DialogTitle>
              </div>
              <DialogDescription>
                Secure Demo Banking Terminal · SSL 256-bit Encrypted
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Order Summary */}
              <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral flex justify-between items-center">
                <div>
                  <span className="font-bold text-ink text-sm block">{selectedAmenity.name}</span>
                  <span className="text-ink-muted text-[11px]">
                    {bookingDate} · {startTimeStr} ({durationHours} Hours)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Amount Due</span>
                  <span className="text-lg font-bold text-brand">
                    ₹{(
                      ((Math.ceil((parseInt(durationHours, 10) * 60) / selectedAmenity.slotMinutes)) * selectedAmenity.feePerSlot) +
                      selectedAmenity.depositAmount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex rounded-lg bg-surface-muted p-1 border border-border-neutral">
                {(['UPI', 'CARD', 'NET_BANKING'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPaymentTab(tab)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      paymentTab === tab
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {tab === 'UPI' ? 'UPI QR Code' : tab === 'CARD' ? 'Card Payment' : 'Net Banking'}
                  </button>
                ))}
              </div>

              {/* UPI Tab */}
              {paymentTab === 'UPI' && (
                <div className="p-4 rounded-xl border border-brand/20 bg-brand/5 text-center space-y-3">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-xs border border-border-neutral flex flex-col items-center justify-center">
                    <QrCode className="w-28 h-28 text-slate-900" />
                    <span className="text-[9px] font-mono text-slate-600 font-bold">UPI ID: greenfield@sbi</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Scan using Google Pay, PhonePe, Paytm, or BHIM UPI app.
                  </p>
                  <div className="flex justify-center gap-2">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <span key={app} className="px-2 py-0.5 rounded bg-surface border border-border-neutral text-[10px] font-bold text-ink">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {paymentTab === 'CARD' && (
                <div className="space-y-3 p-3 rounded-xl border border-border-neutral bg-surface">
                  <div>
                    <label className="text-[11px] font-semibold text-ink block mb-1">Card Number</label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-ink block mb-1">Expiry</label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="font-mono text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-ink block mb-1">CVV</label>
                      <Input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="font-mono text-xs text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Tab */}
              {paymentTab === 'NET_BANKING' && (
                <div className="space-y-2 p-3 rounded-xl border border-border-neutral bg-surface">
                  <label className="text-[11px] font-semibold text-ink block">Choose Participating Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2 rounded-lg border text-left text-xs font-semibold cursor-pointer ${
                          selectedBank === bank
                            ? 'border-brand bg-brand/10 text-brand font-bold'
                            : 'border-border-neutral text-ink hover:bg-surface-muted'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <Button
                variant="primary"
                className="w-full py-3 text-sm font-bold shadow-md cursor-pointer"
                disabled={isProcessingPayment}
                onClick={handleProcessPayment}
              >
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment Authorization...
                  </span>
                ) : (
                  <span>
                    Simulate Payment & Generate Receipt (₹
                    {(
                      ((Math.ceil((parseInt(durationHours, 10) * 60) / selectedAmenity.slotMinutes)) * selectedAmenity.feePerSlot) +
                      selectedAmenity.depositAmount
                    ).toLocaleString()}
                    )
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Official Printable Booking Slip & Tax Receipt Modal */}
      {receiptBooking && (
        <Dialog open={!!receiptBooking} onOpenChange={() => setReceiptBooking(null)}>
          <DialogContent className="max-w-2xl p-0 max-h-[90vh] flex flex-col overflow-hidden border border-border-neutral shadow-2xl bg-surface" hideCloseButton={true}>
            {/* Action Bar (Hidden in Print) */}
            <div className="no-print p-3 sm:p-4 bg-surface border-b border-border-neutral flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand" />
                <span className="font-bold text-sm text-ink">Official Society Facility Booking Slip</span>
              </div>
              <div className="flex items-center gap-2">
                {receiptBooking.status === 'CONFIRMED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const target = receiptBooking;
                      setReceiptBooking(null);
                      handleOpenCancelModal(target);
                    }}
                    className="text-emergency border-emergency/30 hover:bg-emergency/10 text-xs font-semibold"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    <span>Cancel Booking</span>
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1.5" />
                  <span>Print Slip / PDF</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReceiptBooking(null)} title="Close Slip">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Canvas Container — Slip Fits Perfectly with No Parts Cut Off */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/60 flex-1">
              <div
                id="printable-booking-slip"
                className="slip-container printable-slip max-w-[640px] mx-auto bg-white text-slate-900 rounded-xl shadow-lg p-5 sm:p-6 space-y-3 text-xs font-sans"
                style={{
                  maxWidth: '640px',
                  margin: '0 auto',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '2px solid #047857',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Receipt Header */}
                <div
                  className="slip-header flex items-start justify-between gap-3 pb-3"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #047857',
                    paddingBottom: '12px',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🏛️</span>
                      <h1
                        className="font-serif font-black tracking-tight text-slate-900"
                        style={{ fontSize: '17px', margin: 0, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}
                      >
                        GREENFIELD HEIGHTS RESIDENTIAL SOCIETY
                      </h1>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '10.5px', color: '#475569' }}>
                      Co-op Housing Society · Reg #SOC-BLR-2024-8891 · Outer Ring Road, Bangalore 560103
                    </p>
                    <div style={{ marginTop: '5px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '9.5px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Official Facility Allotment & Payment Clearance Slip
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      flexShrink: 0,
                      background: '#ecfdf5',
                      border: '1.5px solid #10b981',
                      borderRadius: '8px',
                      padding: '6px 12px',
                    }}
                  >
                    <span style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#047857', display: 'block' }}>
                      BOOKING REF
                    </span>
                    <span style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 900, color: '#047857', display: 'block', margin: '2px 0' }}>
                      {receiptBooking.bookingRef}
                    </span>
                    <span style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#64748b', display: 'block' }}>
                      Date: {receiptBooking.bookingDate}
                    </span>
                  </div>
                </div>

                {/* Status & Barcode Ribbon */}
                <div
                  className="slip-ribbon-emerald"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ecfdf5',
                    border: '1.5px solid #10b981',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#064e3b', fontSize: '10.5px' }}>
                      RESERVATION {receiptBooking.status} · PAYMENT {receiptBooking.paymentStatus}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '10.5px', fontWeight: 700, color: '#334155' }}>
                    Txn ID: {receiptBooking.transactionId}
                  </span>
                </div>

                {/* Resident & Slot Particulars */}
                <div
                  className="slip-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginTop: '10px',
                  }}
                >
                  <div
                    className="slip-card"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '3px solid #047857',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                      ALLOTTEE DETAILS
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '2px 0' }}>
                      {receiptBooking.residentName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0' }}>
                      Flat/Unit: <strong>{receiptBooking.unitCode}</strong> · Mob: {receiptBooking.residentPhone || '+91 98765 43210'}
                    </p>
                  </div>

                  <div
                    className="slip-card"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '3px solid #10b981',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                      FACILITY & TIME WINDOW
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '2px 0' }}>
                      {receiptBooking.amenityName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0' }}>
                      Date: <strong>{receiptBooking.bookingDate}</strong> · Timing: <strong>{receiptBooking.startTimeStr} to {receiptBooking.endTimeStr}</strong>
                    </p>
                  </div>
                </div>

                {/* Purpose */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                    PURPOSE & AUTHORIZED ATTENDEES
                  </span>
                  <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '11px', margin: 0 }}>
                    {receiptBooking.purpose} · Authorized Max Headcount: <strong>{receiptBooking.attendeesCount} persons</strong>
                  </p>
                </div>

                {/* Itemized Billing Table */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
                  <table className="slip-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
                    <thead style={{ background: '#0f172a', color: '#ffffff' }}>
                      <tr>
                        <th style={{ padding: '7px 10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #334155' }}>
                          Description
                        </th>
                        <th style={{ padding: '7px 10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', border: '1px solid #334155' }}>
                          Duration
                        </th>
                        <th style={{ padding: '7px 10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', border: '1px solid #334155' }}>
                          Amount (INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '11px', color: '#1e293b' }}>
                      <tr>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                          {receiptBooking.amenityName} Facility Hire
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          {receiptBooking.startTimeStr} - {receiptBooking.endTimeStr}
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                          ₹{receiptBooking.totalFee.toLocaleString()}
                        </td>
                      </tr>
                      {receiptBooking.depositAmount > 0 && (
                        <tr style={{ background: '#f8fafc' }}>
                          <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                            Refundable Damage & Security Deposit
                          </td>
                          <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            Post-inspection refund
                          </td>
                          <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                            ₹{receiptBooking.depositAmount.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                          Society Sinking Fund / Maintenance GST (Waived)
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                          —
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>
                          ₹0.00
                        </td>
                      </tr>
                      <tr className="total-row-emerald" style={{ background: '#ecfdf5', color: '#064e3b', fontWeight: 800 }}>
                        <td colSpan={2} style={{ padding: '9px 10px', border: '1px solid #a7f3d0', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          TOTAL AMOUNT PAID & CLEARED
                        </td>
                        <td style={{ padding: '9px 10px', border: '1px solid #a7f3d0', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', color: '#047857' }}>
                          ₹{(receiptBooking.totalFee + receiptBooking.depositAmount).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Official Stamp & Security QR Code */}
                <div
                  className="slip-footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: '10px',
                    marginTop: '10px',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode className="w-12 h-12 text-slate-900 border border-slate-400 p-0.5 rounded flex-shrink-0" />
                    <div>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11px', display: 'block' }}>SECURITY GATE CLEARANCE</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '9.5px', color: '#64748b' }}>Show QR token at Gate 1 for guest vehicle admissions.</p>
                      <p style={{ margin: '1px 0 0 0', fontSize: '8.5px', fontFamily: 'monospace', color: '#94a3b8' }}>
                        Issued: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · SocietyOS Digital Seal
                      </p>
                    </div>
                  </div>

                  <div
                    className="slip-seal-emerald"
                    style={{
                      border: '2px dashed #059669',
                      background: '#ecfdf5',
                      color: '#065f46',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: 'serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '10.5px', textTransform: 'uppercase', display: 'block' }}>
                      APPROVED & ALLOTTED
                    </span>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, display: 'block', color: '#065f46', marginTop: '1px' }}>
                      GREENFIELD HEIGHTS ESTATE MGMT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancellation Reason & 3-Day Refund Confirmation Dialog */}
      {cancellingBooking && (
        <Dialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
          <DialogContent className="max-w-md bg-surface border border-border-neutral shadow-2xl p-6">
            <DialogHeader className="pb-3 border-b border-border-neutral">
              <DialogTitle className="text-lg font-bold text-ink flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Cancel Amenity Reservation</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted">
                Reference: <span className="font-mono font-bold text-ink">{cancellingBooking.bookingRef}</span> · {cancellingBooking.amenityName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs">
              {/* Refund Guarantee Callout */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-ink space-y-1.5">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                  <RefreshCw className="w-4 h-4" />
                  <span>100% Refund Guaranteed within 3 Days</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  As per <strong>Greenfield Heights Society Bylaws Section 14.2</strong>, a full refund of{' '}
                  <strong className="text-ink">₹{(cancellingBooking.totalFee + cancellingBooking.depositAmount).toLocaleString()}</strong> will be credited directly to your original payment account within <strong>2 to 3 business days</strong>.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Reason for Cancellation *
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-border-neutral text-xs font-semibold text-ink"
                >
                  <option value="Schedule Conflict / Change of Plans">Schedule Conflict / Change of Plans</option>
                  <option value="Health / Medical Emergency">Health / Medical Emergency</option>
                  <option value="Adverse Weather / Rain Forecast">Adverse Weather / Rain Forecast</option>
                  <option value="Alternate Venue Arranged">Alternate Venue Arranged</option>
                  <option value="Guest Count Modified">Guest Count Modified</option>
                  <option value="Personal / Family Reasons">Personal / Family Reasons</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Additional Note / Explanation (Optional)
                </label>
                <textarea
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Family gathering postponed to next month due to travel delay..."
                  className="w-full p-2.5 rounded-xl bg-surface border border-border-neutral text-xs text-ink resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-neutral">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancellingBooking(null)}
                >
                  Keep Reservation
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmCancellation}
                  className="bg-emergency text-white hover:bg-emergency/90 font-semibold"
                >
                  Confirm Cancellation & Issue Refund
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Official Society Cancellation & Refund Voucher Modal */}
      {refundVoucherBooking && (
        <Dialog open={!!refundVoucherBooking} onOpenChange={() => setRefundVoucherBooking(null)}>
          <DialogContent className="max-w-2xl p-0 max-h-[90vh] flex flex-col overflow-hidden border border-border-neutral shadow-2xl bg-surface" hideCloseButton={true}>
            {/* Action Bar */}
            <div className="no-print p-3 sm:p-4 bg-surface border-b border-border-neutral flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-sm text-ink">Official Society Cancellation & Refund Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handlePrintRefundVoucher}>
                  <Printer className="w-4 h-4 mr-1.5" />
                  <span>Print Refund Voucher</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setRefundVoucherBooking(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Canvas Container */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/60 flex-1">
              <div
                id="printable-refund-voucher"
                className="slip-container printable-slip max-w-[640px] mx-auto bg-white text-slate-900 rounded-xl shadow-lg p-5 sm:p-6 space-y-3 text-xs font-sans"
                style={{
                  maxWidth: '640px',
                  margin: '0 auto',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '2px solid #b45309',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Header */}
                <div
                  className="slip-header flex items-start justify-between gap-3 pb-3"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #b45309',
                    paddingBottom: '12px',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🏛️</span>
                      <h1
                        className="font-serif font-black tracking-tight text-slate-900"
                        style={{ fontSize: '17px', margin: 0, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}
                      >
                        GREENFIELD HEIGHTS RESIDENTIAL SOCIETY
                      </h1>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '10.5px', color: '#475569' }}>
                      Co-op Housing Society · Reg #SOC-BLR-2024-8891 · Outer Ring Road, Bangalore 560103
                    </p>
                    <div style={{ marginTop: '5px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fcd34d',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '9.5px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Official Society Cancellation & Refund Clearance Certificate
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      flexShrink: 0,
                      background: '#fffbeb',
                      border: '1.5px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '6px 12px',
                    }}
                  >
                    <span style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b45309', display: 'block' }}>
                      REFUND VOUCHER REF
                    </span>
                    <span style={{ fontSize: '15px', fontFamily: 'monospace', fontWeight: 900, color: '#b45309', display: 'block', margin: '2px 0' }}>
                      {refundVoucherBooking.refundReference || 'REF-GH-2026-881024'}
                    </span>
                    <span style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#64748b', display: 'block' }}>
                      Cancelled: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status Ribbon */}
                <div
                  className="slip-ribbon-amber"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fffbeb',
                    border: '1.5px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#78350f', fontSize: '10.5px' }}>
                      BOOKING CANCELLED · 100% REFUND SANCTIONED
                    </span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '10.5px', fontWeight: 700, color: '#334155' }}>
                    Orig Booking: {refundVoucherBooking.bookingRef}
                  </span>
                </div>

                {/* Particulars Grid */}
                <div
                  className="slip-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginTop: '10px',
                  }}
                >
                  <div
                    className="slip-card"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '3px solid #b45309',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                      RESIDENT PARTICULARS
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '2px 0' }}>
                      {refundVoucherBooking.residentName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0' }}>
                      Flat/Unit: <strong>{refundVoucherBooking.unitCode}</strong> · Mob: {refundVoucherBooking.residentPhone || '+91 98765 43210'}
                    </p>
                  </div>

                  <div
                    className="slip-card"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '3px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                      CANCELLED RESERVATION
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', margin: '2px 0' }}>
                      {refundVoucherBooking.amenityName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0' }}>
                      Date: <strong>{refundVoucherBooking.bookingDate}</strong> ({refundVoucherBooking.startTimeStr} – {refundVoucherBooking.endTimeStr})
                    </p>
                  </div>
                </div>

                {/* Cancellation Reason Stated */}
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#92400e', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                    RECORDED CANCELLATION REASON
                  </span>
                  <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '11px', margin: 0, fontStyle: 'italic' }}>
                    &ldquo;{refundVoucherBooking.cancellationReason || 'Schedule Conflict / Change of Plans'}&rdquo;
                  </p>
                </div>

                {/* Itemized Refund Breakdown */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
                  <table className="slip-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', margin: 0 }}>
                    <thead style={{ background: '#0f172a', color: '#ffffff' }}>
                      <tr>
                        <th style={{ padding: '7px 10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #334155' }}>
                          Credit Description
                        </th>
                        <th style={{ padding: '7px 10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', border: '1px solid #334155' }}>
                          Reversal Policy
                        </th>
                        <th style={{ padding: '7px 10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', border: '1px solid #334155' }}>
                          Refund Amount (INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '11px', color: '#1e293b' }}>
                      <tr>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                          {refundVoucherBooking.amenityName} Booking Fee Reversal
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>
                            100% Full Refund
                          </span>
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                          ₹{refundVoucherBooking.totalFee.toLocaleString()}
                        </td>
                      </tr>
                      {refundVoucherBooking.depositAmount > 0 && (
                        <tr style={{ background: '#f8fafc' }}>
                          <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                            Security & Damage Deposit Release
                          </td>
                          <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>
                              100% Full Release
                            </span>
                          </td>
                          <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                            ₹{refundVoucherBooking.depositAmount.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                          Cancellation Processing Charge
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                          Waived by Society
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>
                          ₹0.00
                        </td>
                      </tr>
                      <tr className="total-row-amber" style={{ background: '#ecfdf5', color: '#064e3b', fontWeight: 800 }}>
                        <td colSpan={2} style={{ padding: '9px 10px', border: '1px solid #a7f3d0', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          TOTAL REFUND PAYABLE TO RESIDENT
                        </td>
                        <td style={{ padding: '9px 10px', border: '1px solid #a7f3d0', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', color: '#047857' }}>
                          ₹{(refundVoucherBooking.totalFee + refundVoucherBooking.depositAmount).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3-Day Refund Policy Banner & Official Signoff */}
                <div
                  className="slip-callout-amber"
                  style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    marginTop: '10px',
                    color: '#78350f',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '11px', color: '#92400e' }}>
                    <span>⏱️</span>
                    <span>Bank Clearing & Refund Timeline (Within 2 to 3 Business Days)</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#475569', lineHeight: 1.45 }}>
                    Electronic reimbursement has been routed via original payment gateway (UPI/Bank/Card). As per Society Financial Bylaw Rule 14.2, funds will reflect in your account within <strong>3 business days</strong>. Please quote Reference ID <strong style={{ fontFamily: 'monospace', color: '#b45309' }}>{refundVoucherBooking.refundReference || 'REF-GH-2026-881024'}</strong> for society accounts queries.
                  </p>
                </div>

                {/* Signoff Stamp */}
                <div
                  className="slip-footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: '10px',
                    marginTop: '10px',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode className="w-11 h-11 text-slate-900 border border-slate-400 p-0.5 rounded flex-shrink-0" />
                    <div>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11px', display: 'block' }}>DIGITAL AUDIT TRAIL</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '9.5px', color: '#64748b' }}>Scannable accounting reconciliation voucher</p>
                      <p style={{ margin: '1px 0 0 0', fontSize: '8.5px', fontFamily: 'monospace', color: '#94a3b8' }}>SocietyOS Automated Treasury Engine</p>
                    </div>
                  </div>

                  <div
                    className="slip-seal-amber"
                    style={{
                      border: '2px dashed #d97706',
                      background: '#fffbeb',
                      color: '#92400e',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: 'serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '10.5px', textTransform: 'uppercase', display: 'block' }}>
                      REFUND PROCESSED
                    </span>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, display: 'block', color: '#78350f', marginTop: '1px' }}>
                      TREASURER · GREENFIELD HEIGHTS
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
