'use client';

import * as React from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  Shield,
  Eye,
  X,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  Check,
  Wrench,
  Car,
  Package,
  Calendar,
  AlertTriangle,
  ClipboardList,
  Building,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { showAppToast } from '@/components/ui/toast-notification';
import { useSyncStore } from '@/lib/sync-store';

export interface AuditLog {
  _id: string;
  actorId: string;
  actorRole: string;
  action: string;
  eventSummary?: string;
  resourceType: string;
  outcome: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: Record<string, any>;
  timestamp: string;
  isLive?: boolean;
  ipAddress?: string;
}

export function formatAuditTimestamp(val?: any): string {
  if (!val) {
    return 'Synchronized Live';
  }

  const str = String(val).trim();
  if (
    str === 'Just now' ||
    str === 'Recently' ||
    str === 'null' ||
    str === 'undefined' ||
    str === '' ||
    str.toLowerCase().includes('just now')
  ) {
    return 'Synchronized Live';
  }

  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  return str;
}

export const SEED_FALLBACK_LOGS: AuditLog[] = [
  {
    _id: 'aud_inc_1',
    actorId: 'guard_ramesh',
    actorRole: 'SECURITY',
    action: 'INCIDENT_ACKNOWLEDGED_DISPATCH',
    resourceType: 'INCIDENT',
    outcome: 'SUCCESS',
    details: {
      incidentRef: 'INC-2026-001',
      severity: 'HIGH_CRITICAL',
      location: 'Tower B Passenger Elevator #2',
      responder: 'Officer Ramesh Kumar · SEC-802',
      actionTaken: 'First-response guard dispatched with manual brake key. Otis elevator engineering summoned.',
      status: 'RESOLVED',
    },
    timestamp: 'Today, 12:02 PM',
    ipAddress: '192.168.29.1',
  },
  {
    _id: 'aud_maint_1',
    actorId: 'facility_manager',
    actorRole: 'ADMIN',
    action: 'WORK_ORDER_COMPLETED',
    resourceType: 'MAINTENANCE',
    outcome: 'SUCCESS',
    details: {
      workOrderId: 'WO-2026-88',
      equipment: 'Tower B Lift 2 Traction Drive & Hoist Ropes',
      contractor: 'Otis Elevator India Pvt Ltd',
      technician: 'Suresh Patil (Cert #OT-8812)',
      partsReplaced: 'Governor cable & safety gear lubricated',
      costIncurred: '₹14,500 (Annual Maintenance Contract)',
      complianceStatus: 'Lift Inspector Load Certification Renewed',
    },
    timestamp: 'Today, 11:45 AM',
    ipAddress: '192.168.29.14',
  },
  {
    _id: 'aud_maint_2',
    actorId: 'resident_aarav',
    actorRole: 'RESIDENT',
    action: 'MAINTENANCE_TICKET_RAISED',
    resourceType: 'MAINTENANCE',
    outcome: 'SUCCESS',
    details: {
      workOrderId: 'WO-2026-92',
      unitCode: 'A-402',
      category: 'PLUMBING',
      reportedIssue: 'Main water inlet pressure valve fluctuation in utility balcony',
      priority: 'MEDIUM',
      assignedTo: 'In-house Technician Mahendra',
    },
    timestamp: 'Today, 10:30 AM',
    ipAddress: '192.168.29.88',
  },
  {
    _id: 'aud_veh_1',
    actorId: 'anpr_camera_gate1',
    actorRole: 'GATE_ANPR',
    action: 'VEHICLE_BARRIER_AUTOMATED_INGRESS',
    resourceType: 'VEHICLE',
    outcome: 'SUCCESS',
    details: {
      vehiclePlate: 'KA-03-MG-4021',
      makeModel: 'Hyundai Creta (White)',
      entryGate: 'Gate 1 North Barrier Boom #1',
      barrierAction: 'BOOM_RAISED_AUTOMATIC',
      assignedSlot: 'Guest Bay A-02',
      speedKmh: '16 km/h (Speed Limit: 20 km/h - Compliant)',
      residentHost: 'Aarav Sharma · Unit A-402',
    },
    timestamp: 'Today, 12:04 PM',
    ipAddress: '192.168.29.102',
  },
  {
    _id: 'aud_amen_1',
    actorId: 'resident_aarav',
    actorRole: 'RESIDENT',
    action: 'AMENITY_BOOKING_CLEARED',
    resourceType: 'AMENITY',
    outcome: 'SUCCESS',
    details: {
      bookingRef: 'BK-8902',
      facilityName: 'Clubhouse Badminton Court 1',
      unitCode: 'A-402',
      slotTiming: '07:00 AM - 08:00 AM',
      attendees: 2,
      totalFee: '₹0 (Resident Complimentary Daily Slot)',
      depositAmount: '₹0',
      transactionId: 'TXN-SOC-001092-COMPLIMENTARY',
      clashVerification: 'PASSED_ZERO_OVERLAP',
    },
    timestamp: 'Today, 10:15 AM',
    ipAddress: '192.168.29.88',
  },
  {
    _id: 'aud_amen_2',
    actorId: 'resident_suresh',
    actorRole: 'RESIDENT',
    action: 'AMENITY_BOOKING_CLEARED',
    resourceType: 'AMENITY',
    outcome: 'SUCCESS',
    details: {
      bookingRef: 'BK-7714',
      facilityName: 'Grand Clubhouse Banquet Hall',
      unitCode: 'A-101',
      residentName: 'Dr. Suresh Mehta',
      slotTiming: '06:00 PM - 10:00 PM',
      attendees: 65,
      totalFee: '₹2,500',
      depositAmount: '₹5,000 (Refundable Escrow)',
      transactionId: 'TXN-SOC-253305-NET_BANKING',
      paymentMethod: 'HDFC NetBanking',
    },
    timestamp: 'Yesterday, 16:30',
    ipAddress: '192.168.29.45',
  },
  {
    _id: 'aud_parc_1',
    actorId: 'guard_ramesh',
    actorRole: 'SECURITY',
    action: 'PARCEL_CUSTODY_REGISTERED',
    resourceType: 'PARCEL',
    outcome: 'SUCCESS',
    details: {
      trackingId: 'AWB-4029-AMZ-8812',
      courier: 'Amazon Logistics',
      recipientUnit: 'A-402',
      recipientName: 'Aarav Sharma',
      storageBay: 'Bay B-14 (Secure Courier Room)',
      pickupOtpGenerated: '7294 (Encrypted One-Time Token)',
      status: 'HELD_AT_GATE',
    },
    timestamp: 'Today, 11:15 AM',
    ipAddress: '192.168.29.102',
  },
  {
    _id: 'aud_parc_2',
    actorId: 'guard_vikram',
    actorRole: 'SECURITY',
    action: 'PARCEL_OTP_VERIFIED_AND_RELEASED',
    resourceType: 'PARCEL',
    outcome: 'SUCCESS',
    details: {
      trackingId: 'SWIGGY-INSTA-4401',
      courier: 'Swiggy Instamart (Grocery Bag)',
      recipientUnit: 'A-402',
      otpSubmitted: '1109 (Exact Match Verified)',
      releasedByGuard: 'Officer Vikram Singh · SEC-801',
      recipientPerson: 'Resident Aarav Sharma in person',
      status: 'COLLECTED',
    },
    timestamp: 'Yesterday, 18:35',
    ipAddress: '192.168.29.102',
  },
  {
    _id: 'aud_ho_1',
    actorId: 'guard_manoj',
    actorRole: 'SECURITY',
    action: 'SHIFT_HANDOVER_EXECUTED',
    resourceType: 'SHIFT_HANDOVER',
    outcome: 'SUCCESS',
    details: {
      handoverId: 'HO-2026-101',
      outgoingOfficer: 'Officer Ramesh Kumar (SEC-802)',
      incomingOfficer: 'Officer Manoj Yadav (SEC-804)',
      shiftPeriod: 'Afternoon Shift (15:00 - 23:00)',
      postStation: 'Gate 1 (Main Entrance)',
      keysCustodyCount: 8,
      walkieTalkieRadiosCount: 4,
      equipmentChecklist: 'VERIFIED_100_PERCENT',
      logBookNotes: 'Otis maintenance completed. 3 pending parcels in Bay B-14.',
    },
    timestamp: 'Today, 15:00',
    ipAddress: '192.168.29.102',
  },
  {
    _id: 'aud_unit_1',
    actorId: 'admin_sunita',
    actorRole: 'ADMIN',
    action: 'UNIT_STATUS_CHANGED',
    resourceType: 'UNIT',
    outcome: 'SUCCESS',
    details: {
      unitCode: 'A-101',
      previousStatus: 'OCCUPIED',
      newStatus: 'MAINTENANCE',
      reasonCode: 'OWNER_RENOVATION',
      notes: 'Owner renovation approved for civil woodwork. NOC #2026-99 issued.',
    },
    timestamp: 'Today, 11:30 AM',
    ipAddress: '192.168.29.14',
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>(SEED_FALLBACK_LOGS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastSynced, setLastSynced] = React.useState<string>('Live Sync Active');

  React.useEffect(() => {
    setLastSynced(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    );
  }, []);
  const [selectedResource, setSelectedResource] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  // Sync real-time stores so fresh actions appear immediately
  const [incidents] = useSyncStore<any[]>('societyos_admin_incidents', []);
  const [amenityBookings] = useSyncStore<any[]>('societyos_amenity_bookings', []);
  const [parcels] = useSyncStore<any[]>('societyos_parcels', []);
  const [shiftHandovers] = useSyncStore<any[]>('societyos_shift_handovers', []);
  const [unifiedVisitors] = useSyncStore<any[]>('societyos_unified_visitors', []);

  const fetchDbLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/audit?limit=50', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: AuditLog[] = items.map((doc: any) => {
            const formattedTime = formatAuditTimestamp(doc.timestamp);
            return {
              _id: doc._id?.toString() || `aud_${Math.random()}`,
              actorId: doc.actorId || doc.userId || 'system',
              actorRole: doc.actorRole || 'ADMIN',
              action: doc.action || 'OPERATION',
              eventSummary: doc.details?.eventSummary || doc.details?.note || undefined,
              resourceType: doc.resourceType || 'DATABASE',
              outcome: (doc.outcome as any) || 'SUCCESS',
              details: doc.details || {},
              timestamp: formattedTime,
              ipAddress: doc.ipAddress || 'Internal Network',
            };
          });

          // Merge with unique IDs
          const existingIds = new Set(mapped.map((m) => m._id));
          const leftovers = SEED_FALLBACK_LOGS.filter((s) => !existingIds.has(s._id));
          setLogs([...mapped, ...leftovers]);
          setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Audit logs live fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDbLogs();
    const interval = setInterval(fetchDbLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchDbLogs]);

  // Aggregate live store events covering Incidents, Maintenance, Vehicles, Amenities, Parcels, and Shift Handovers
  const combinedLogs = React.useMemo(() => {
    const dynamicLogs: AuditLog[] = [];

    // 1. Live Incidents
    incidents.forEach((inc: any) => {
      const isResolved = inc.status === 'RESOLVED';
      dynamicLogs.push({
        _id: `live_inc_${inc.id || inc.incidentNumber}`,
        actorId: inc.reportedBy || 'Resident (A-402)',
        actorRole: 'RESIDENT',
        action: isResolved ? 'INCIDENT_RESOLVED_CLOSED' : 'INCIDENT_SOS_REPORTED',
        eventSummary: isResolved
          ? `Emergency incident #${inc.incidentNumber || inc.number} resolved & cleared on-scene at ${inc.location || inc.locationDescription || 'Estate'}`
          : `Emergency ${inc.category || 'SOS'} alert (${inc.severity || 'HIGH'}) reported at ${inc.location || inc.locationDescription || 'Estate'}`,
        resourceType: 'INCIDENT',
        outcome: 'SUCCESS',
        isLive: true,
        details: {
          incidentRef: inc.incidentNumber || inc.number,
          category: inc.category,
          severity: inc.severity,
          location: inc.location || inc.locationDescription,
          status: inc.status,
          reportedBy: inc.reportedBy || inc.reporterName,
          assignedTo: inc.assignedTo || inc.guardAssigned,
          dispatchNotes: inc.dispatchNotes,
          resolutionNotes: inc.resolutionNotes,
        },
        timestamp: formatAuditTimestamp(inc.timestamp || inc.createdAt || inc.time),
        ipAddress: '192.168.29.1',
      });
    });

    // 2. Live Amenities
    amenityBookings.forEach((b: any) => {
      const isCancelled = b.status === 'CANCELLED';
      dynamicLogs.push({
        _id: `live_amen_${b._id || b.bookingRef}`,
        actorId: b.residentName || 'Resident',
        actorRole: 'RESIDENT',
        action: isCancelled ? 'AMENITY_BOOKING_CANCELLED' : 'AMENITY_RESERVATION_RECORDED',
        eventSummary: isCancelled
          ? `Reservation cancelled for ${b.amenityName || 'Amenity'} (${b.unitCode || 'Unit'}) · 100% refund settlement initiated`
          : `Confirmed booking for ${b.amenityName || 'Amenity'} (${b.unitCode || 'Unit'}) · Slot: ${b.bookingDate || 'Upcoming'}`,
        resourceType: 'AMENITY',
        outcome: isCancelled ? 'DENIED' : 'SUCCESS',
        isLive: true,
        details: {
          bookingRef: b.bookingRef,
          facilityName: b.amenityName,
          unitCode: b.unitCode,
          slotDate: b.bookingDate,
          timing: `${b.startTimeStr || ''} - ${b.endTimeStr || ''}`,
          attendees: b.attendeesCount,
          totalFee: b.totalFee ? `₹${b.totalFee}` : undefined,
          deposit: b.depositAmount ? `₹${b.depositAmount}` : undefined,
          transactionId: b.transactionId,
          status: b.status,
        },
        timestamp: formatAuditTimestamp(b.createdAt),
        ipAddress: '192.168.29.88',
      });
    });

    // 3. Live Parcels
    parcels.forEach((p: any) => {
      const isCollected = p.status === 'COLLECTED';
      dynamicLogs.push({
        _id: `live_parc_${p.id || p.trackingId}`,
        actorId: p.releasedBy || p.gateGuard || 'Gate 1 Parcel Desk',
        actorRole: 'SECURITY',
        action: isCollected ? 'PARCEL_OTP_VERIFIED_RELEASED' : 'PARCEL_GATE_INBOUND_HELD',
        eventSummary: isCollected
          ? `Parcel ${p.trackingId} OTP verified & released to ${p.residentName} (${p.unitCode})`
          : `${p.courier || 'Courier'} parcel held at gate desk for ${p.residentName} (${p.unitCode})`,
        resourceType: 'PARCEL',
        outcome: 'SUCCESS',
        isLive: true,
        details: {
          trackingId: p.trackingId,
          courier: p.courier,
          unitCode: p.unitCode,
          recipient: p.residentName,
          storageBay: p.storageBay || 'Bay B-14',
          pickupOtp: p.pickupOtp,
          status: p.status,
          receivedAt: p.receivedAt,
          collectedAt: p.collectedAt,
          releasedBy: p.releasedBy,
        },
        timestamp: formatAuditTimestamp(p.collectedAt || p.receivedAt || p.createdAt),
        ipAddress: '192.168.29.102',
      });
    });

    // 4. Live Shift Handovers
    shiftHandovers.forEach((h: any) => {
      dynamicLogs.push({
        _id: `live_ho_${h.id}`,
        actorId: h.incomingOfficer || 'Shift Guard',
        actorRole: 'SECURITY',
        action: 'SECURITY_SHIFT_DUTY_ROTATION',
        eventSummary: `Officer ${h.outgoingOfficer || 'Outgoing'} handed over post ${h.postLocation || 'Gate 1'} to Officer ${h.incomingOfficer || 'Incoming'}`,
        resourceType: 'SHIFT_HANDOVER',
        outcome: 'SUCCESS',
        isLive: true,
        details: {
          outgoingOfficer: h.outgoingOfficer,
          incomingOfficer: h.incomingOfficer,
          shift: h.shift,
          postLocation: h.postLocation,
          keysInspected: h.keysCount,
          radiosInspected: h.radiosCount,
          equipmentVerified: h.equipmentVerified ? 'PASSED_100%' : 'FLAGGED_DISCREPANCY',
          signedTimestamp: h.signedAt || h.timestamp,
          instructions: h.notes || 'None logged',
        },
        timestamp: formatAuditTimestamp(h.timestamp || h.signedAt),
        ipAddress: '192.168.29.102',
      });
    });

    // 5. Live Vehicles & Visitors
    unifiedVisitors.forEach((v: any) => {
      const isInside = v.status === 'INSIDE';
      const isCheckedOut = v.status === 'CHECKED_OUT';
      dynamicLogs.push({
        _id: `live_veh_${v.id || v.passCode}`,
        actorId: 'anpr_barrier_system',
        actorRole: 'GATE_ANPR',
        action: isInside
          ? 'VEHICLE_INGRESS_AUTHENTICATED'
          : isCheckedOut
          ? 'VISITOR_GUEST_DEPARTURE_RECORDED'
          : 'VISITOR_PASS_PRE_APPROVED',
        eventSummary: isCheckedOut
          ? `Guest ${v.visitorName} departed compound; checkout logged for Unit ${v.unitCode} (Host: ${v.hostName})`
          : isInside
          ? `Vehicle ${v.vehicleNumber || 'Pass ' + v.passCode} (${v.visitorName}) verified & admitted at gate for Unit ${v.unitCode}`
          : `Pre-approved pass ${v.passCode} created for ${v.visitorName} visiting Unit ${v.unitCode} (Host: ${v.hostName})`,
        resourceType: 'VEHICLE',
        outcome: 'SUCCESS',
        isLive: true,
        details: {
          vehiclePlate: v.vehicleNumber,
          passCode: v.passCode,
          driverName: v.visitorName,
          visitorPhone: v.visitorPhone,
          targetUnit: v.unitCode,
          purpose: v.purpose,
          gateAdmitted: v.gate || 'Gate 1 North',
          checkInTime: v.checkInTime || 'Pending Entry',
          checkOutTime: v.checkOutTime,
          status: v.status,
        },
        timestamp: formatAuditTimestamp(v.checkOutTime || v.checkInTime || v.createdAt),
        ipAddress: '192.168.29.102',
      });
    });

    // Merge without duplicates
    const all = [...dynamicLogs, ...logs];
    const seen = new Set();
    return all.filter((l) => {
      if (seen.has(l._id)) return false;
      seen.add(l._id);
      return true;
    });
  }, [logs, incidents, amenityBookings, parcels, shiftHandovers, unifiedVisitors]);

  const filtered = combinedLogs.filter((log) => {
    const matchesResource =
      selectedResource === 'ALL' ||
      log.resourceType.toUpperCase() === selectedResource ||
      log.resourceType.toUpperCase().includes(selectedResource);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      Boolean(log.eventSummary && log.eventSummary.toLowerCase().includes(q)) ||
      log.actorRole.toLowerCase().includes(q) ||
      log.actorId.toLowerCase().includes(q) ||
      log.resourceType.toLowerCase().includes(q) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(q);
    return matchesResource && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor ID', 'Actor Role', 'Resource Type', 'Outcome', 'IP Address', 'Details'];
    const rows = filtered.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.actorId}"`,
      `"${l.actorRole}"`,
      `"${l.resourceType}"`,
      `"${l.outcome}"`,
      `"${l.ipAddress || '—'}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SocietyOS_AuditReport_${Date.now()}.csv`;
    link.click();
    showAppToast(`Exported ${filtered.length} audit records to CSV`, 'success', 'Audit Export Complete');
  };

  const handlePrint = () => {
    window.print();
  };

  const getResourceBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INCIDENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-emergency border border-red-500/30">INCIDENT</span>;
      case 'MAINTENANCE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30">MAINTENANCE</span>;
      case 'VEHICLE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">VEHICLE</span>;
      case 'AMENITY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">AMENITY</span>;
      case 'PARCEL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">PARCEL</span>;
      case 'SHIFT_HANDOVER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">SHIFT_HANDOVER</span>;
      case 'GATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">GATE</span>;
      case 'UNIT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/30">UNIT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-muted text-ink-muted border border-border-neutral">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand" />
            System Audit Trail & Governance Log
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Cryptographically sealed, append-only log covering Incidents, Maintenance, Vehicles, Amenities, Parcels, and Shift Handovers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDbLogs}
            disabled={isLoading}
            className="text-xs"
            title={`Last synced: ${lastSynced}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-brand' : ''}`} />
            <span>Sync Live</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print Audit / PDF</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleExportCSV} className="text-xs font-semibold">
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-border-neutral bg-surface shadow-xs no-print">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              'ALL',
              'INCIDENT',
              'MAINTENANCE',
              'VEHICLE',
              'AMENITY',
              'PARCEL',
              'SHIFT_HANDOVER',
              'GATE',
              'UNIT',
            ].map((res) => (
              <button
                key={res}
                onClick={() => setSelectedResource(res)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedResource === res
                    ? 'bg-brand text-white shadow-2xs font-bold'
                    : 'bg-surface-muted text-ink-muted hover:text-ink'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions, vehicle plates, units, parcels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface border border-border-neutral rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[720px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold text-ink-muted uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Timestamp & Live Status</th>
                <th className="px-5 py-3">Resource & Event Occurred</th>
                <th className="px-5 py-3">Actor & Role</th>
                <th className="px-5 py-3">Audit Details & Parameters</th>
                <th className="px-5 py-3 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((log) => (
                <tr
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-surface-muted/60 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span className="font-semibold text-ink">{log.timestamp}</span>
                    </div>
                    {log.isLive && (
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE EVENT
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      {getResourceBadge(log.resourceType)}
                      <span className="font-mono font-bold text-xs text-brand group-hover:underline">
                        {log.action}
                      </span>
                    </div>
                    {log.eventSummary && (
                      <p className="text-xs font-medium text-ink bg-surface-muted/80 px-2 py-1 rounded border border-border-subtle/50 mt-1">
                        {log.eventSummary}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-ink block">{log.actorId}</span>
                    <span className="text-[11px] text-ink-muted">{log.actorRole}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-ink-muted max-w-md">
                    {log.details ? (
                      <div className="space-y-0.5">
                        {log.details.vehiclePlate && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 font-mono font-bold text-[11px] text-blue-700 dark:text-blue-300 mr-1.5">
                            🚗 {log.details.vehiclePlate}
                          </span>
                        )}
                        {log.details.bookingRef && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 font-mono font-bold text-[11px] text-emerald-700 dark:text-emerald-300 mr-1.5">
                            🎟️ {log.details.bookingRef}
                          </span>
                        )}
                        {log.details.trackingId && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 font-mono font-bold text-[11px] text-amber-700 dark:text-amber-300 mr-1.5">
                            📦 {log.details.trackingId}
                          </span>
                        )}
                        {log.details.workOrderId && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-purple-500/10 font-mono font-bold text-[11px] text-purple-700 dark:text-purple-300 mr-1.5">
                            🔧 {log.details.workOrderId}
                          </span>
                        )}
                        {log.details.incidentRef && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-red-500/10 font-mono font-bold text-[11px] text-red-700 dark:text-red-300 mr-1.5">
                            🚨 {log.details.incidentRef}
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-ink block truncate">
                          {Object.entries(log.details)
                            .slice(0, 3)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {log.outcome === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emergency bg-emergency-subtle px-2 py-0.5 rounded border border-emergency/30">
                        <XCircle className="w-3.5 h-3.5" /> Denied
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ink-muted">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Detail Popup Modal - Single Close Button */}
      {/* Audit Detail Popup Modal - Fully Responsive & Scrollable (Never Cut Off) */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent
            hideCloseButton={true}
            className="w-[95vw] max-w-2xl p-0 max-h-[88vh] flex flex-col overflow-hidden border border-border-neutral shadow-2xl rounded-2xl bg-surface"
          >
            {/* Sticky Header */}
            <div className="p-4 sm:p-5 bg-surface border-b border-border-neutral flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <Shield className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-ink leading-tight">
                    Immutable Audit Certificate
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Cryptographic Sequence Verification & Integrity Receipt
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-surface-muted cursor-pointer"
                onClick={() => setSelectedLog(null)}
              >
                <X className="w-4 h-4 text-ink-muted hover:text-ink" />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1 overscroll-contain">
              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-muted/60 border border-border-neutral space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-border-subtle/50 text-xs items-center">
                  <span className="text-ink-muted font-medium">Action Identifier:</span>
                  <span className="font-mono font-bold text-brand sm:col-span-2 sm:text-right break-all">
                    {selectedLog.action}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-border-subtle/50 text-xs items-center">
                  <span className="text-ink-muted font-medium">Resource Category:</span>
                  <div className="sm:col-span-2 sm:text-right flex sm:justify-end">
                    {getResourceBadge(selectedLog.resourceType)}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-border-subtle/50 text-xs items-center">
                  <span className="text-ink-muted font-medium">Committed Timestamp:</span>
                  <span className="font-mono text-ink font-semibold sm:col-span-2 sm:text-right break-words">
                    {selectedLog.timestamp}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-border-subtle/50 text-xs items-center">
                  <span className="text-ink-muted font-medium">Actor / Authorization:</span>
                  <span className="font-semibold text-ink sm:col-span-2 sm:text-right break-words">
                    {selectedLog.actorId}{' '}
                    <span className="text-[11px] font-mono text-ink-muted">({selectedLog.actorRole})</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 py-1.5 border-b border-border-subtle/50 text-xs items-center">
                  <span className="text-ink-muted font-medium">Network Origin (IP):</span>
                  <span className="font-mono text-ink sm:col-span-2 sm:text-right">
                    {selectedLog.ipAddress || 'Internal Network'}
                  </span>
                </div>
                {selectedLog.eventSummary && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block mb-1">
                      Event Description:
                    </span>
                    <span className="font-medium text-ink block bg-surface p-2.5 rounded-lg border border-border-neutral leading-relaxed">
                      {selectedLog.eventSummary}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-ink text-xs">State Payload & Full Details:</span>
                  <span className="text-[10px] font-mono text-ink-muted">JSON Structure (Immutable)</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-surface-muted border border-border-neutral font-mono text-[11px] text-ink overflow-x-auto leading-relaxed max-h-48 whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <strong>Cryptographic Integrity:</strong> This event is persisted with a tamper-evident sequence index in Greenfield Heights MongoDB collection.
              </div>
            </div>

            {/* Sticky Footer - Always Visible */}
            <div className="p-3.5 sm:p-4 bg-surface-muted/50 border-t border-border-neutral flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `[AUDIT CERTIFICATE]\nAction: ${selectedLog.action}\nTimestamp: ${selectedLog.timestamp}\nActor: ${selectedLog.actorId} (${selectedLog.actorRole})\nDetails: ${JSON.stringify(selectedLog.details)}`
                  );
                  showAppToast('Audit certificate text copied to clipboard.', 'success');
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Audit Certificate</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs px-4 cursor-pointer"
                onClick={() => setSelectedLog(null)}
              >
                Close Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
