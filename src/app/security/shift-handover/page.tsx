'use client';

import * as React from 'react';
import {
  ClipboardList,
  Clock,
  KeyRound,
  ShieldCheck,
  Save,
  Check,
  AlertTriangle,
  User,
  Radio,
  CheckSquare,
  Square,
  Printer,
  History,
  Shield,
  PhoneCall,
  Calendar,
  Layers,
  Plus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { DEFAULT_GATE_STATIONS, GateStation } from '@/app/security/gates/page';

export interface Guard {
  id: string;
  name: string;
  badgeNumber: string;
  phone: string;
  gateAssignment: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  status: 'ON_DUTY' | 'OFF_DUTY' | 'PATROL';
  lastCheckIn: string;
  role?: string;
  gate?: string;
}

export const DEFAULT_GUARDS: Guard[] = [
  { id: 'sec-801', name: 'Officer Vikram Singh', badgeNumber: 'SEC-801', phone: '+91 98765 22001', role: 'Head Guard / Gate 1 Lead', gate: 'Gate 1 (Main Ingress)', gateAssignment: 'Gate 1 (Main Entrance)', shift: 'MORNING', status: 'ON_DUTY', lastCheckIn: '10 mins ago' },
  { id: 'sec-802', name: 'Officer Ramesh Kumar', badgeNumber: 'SEC-802', phone: '+91 98765 22002', role: 'Gate 1 Guard / Visitor Desk', gate: 'Gate 1 (Visitor Terminal)', gateAssignment: 'Gate 1 North (Visitor Terminal)', shift: 'MORNING', status: 'ON_DUTY', lastCheckIn: '15 mins ago' },
  { id: 'sec-803', name: 'Officer Dilip Jha', badgeNumber: 'SEC-803', phone: '+91 98765 22003', role: 'Gate 2 Delivery Officer', gate: 'Gate 2 (Service & Deliveries)', gateAssignment: 'Gate 2 (Service & Deliveries)', shift: 'MORNING', status: 'PATROL', lastCheckIn: '2 mins ago (Basement 1)' },
  { id: 'sec-804', name: 'Officer Manoj Yadav', badgeNumber: 'SEC-804', phone: '+91 98765 22004', role: 'Patrol & Inspection Officer', gate: 'Towers Perimeter Patrol', gateAssignment: 'Gate 1 (Main Entrance)', shift: 'EVENING', status: 'OFF_DUTY', lastCheckIn: 'Shift starts 15:00' },
  { id: 'sec-805', name: 'Officer Santosh Patil', badgeNumber: 'SEC-805', phone: '+91 98765 22005', role: 'CCTV & Fire Control Officer', gate: 'Central Security Control Room', gateAssignment: 'Central Security Control Room', shift: 'MORNING', status: 'ON_DUTY', lastCheckIn: '5 mins ago' },
  { id: 'sec-806', name: 'Officer Rajesh Nair', badgeNumber: 'SEC-806', phone: '+91 98765 22006', role: 'Night Duty Supervisor', gate: 'All Gates / Roving Command', gateAssignment: 'All Gates / Roving Command', shift: 'NIGHT', status: 'OFF_DUTY', lastCheckIn: 'Yesterday, 23:00' },
];

interface HandoverRecord {
  id: string;
  outgoingOfficer: string;
  incomingOfficer: string;
  shift: string;
  postLocation: string;
  keysCount: number;
  radiosCount: number;
  equipmentVerified: boolean;
  notes: string;
  timestamp: string;
  signedAt: string;
}

const DEFAULT_HANDOVERS: HandoverRecord[] = [
  {
    id: 'ho-101',
    outgoingOfficer: 'Officer Ramesh Kumar (SEC-802)',
    incomingOfficer: 'Officer Manoj Yadav (SEC-804)',
    shift: 'General / Afternoon Shift (15:00 - 23:00)',
    postLocation: 'Gate 1 (Main Entrance)',
    keysCount: 8,
    radiosCount: 4,
    equipmentVerified: true,
    notes: 'Tower B Lift 2 servicing ongoing by Otis technicians. 3 expected deliveries pending for Block A.',
    timestamp: 'Today, 15:00',
    signedAt: '2026-10-21 15:00:12',
  },
  {
    id: 'ho-100',
    outgoingOfficer: 'Officer Rajesh Nair (SEC-806)',
    incomingOfficer: 'Officer Ramesh Kumar (SEC-802)',
    shift: 'Morning Shift (07:00 - 15:00)',
    postLocation: 'Gate 1 (Main Entrance)',
    keysCount: 8,
    radiosCount: 4,
    equipmentVerified: true,
    notes: 'Night quiet hours observed without breaches. Perimeter lights operational.',
    timestamp: 'Today, 07:00',
    signedAt: '2026-10-21 07:00:45',
  },
];

export default function SecurityShiftHandoverPage() {
  const [handovers, setHandovers] = useSyncStore<HandoverRecord[]>('societyos_shift_handovers', DEFAULT_HANDOVERS);
  const [guards, setGuards] = useSyncStore<Guard[]>('societyos_security_guards', DEFAULT_GUARDS);
  const [gateStations, setGateStations] = useSyncStore<GateStation[]>('societyos_gate_stations', DEFAULT_GATE_STATIONS);

  const [outgoingId, setOutgoingId] = React.useState('sec-802');
  const [incomingId, setIncomingId] = React.useState('sec-804');
  const [shiftType, setShiftType] = React.useState('AFTERNOON');
  const [postLocation, setPostLocation] = React.useState('Gate 1 (Main Entrance)');
  const [keysCount, setKeysCount] = React.useState(8);
  const [radiosCount, setRadiosCount] = React.useState(4);

  // Add Officer Modal
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newBadge, setNewBadge] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [newGate, setNewGate] = React.useState('Gate 1 (Main Entrance)');

  // Equipment Checklist
  const [checklist, setChecklist] = React.useState({
    radiosOperational: true,
    keysAccounted: true,
    gateBarriersWorking: true,
    cctvMonitoringClear: true,
    visitorScannerOperational: true,
    firstAidAndFireClear: true,
  });

  const [specialInstructions, setSpecialInstructions] = React.useState(
    '1. Otis lift engineer scheduled for Tower B Lift 2 post-inspection.\n2. Guest Vikram Sethi (Unit A-402) inside compound with vehicle KA-03-MG-4021.\n3. Gate 2 hydraulic closer tension adjusted.'
  );

  const outgoingOfficer = guards.find((o) => o.id === outgoingId) || guards[1] || guards[0];
  const incomingOfficer = guards.find((o) => o.id === incomingId) || guards[3] || guards[0];

  const [currentTime, setCurrentTime] = React.useState('');
  React.useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allEquipmentVerified = Object.values(checklist).every(Boolean);

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBadge.trim()) {
      showAppToast('Please enter full officer name and badge number.', 'warning');
      return;
    }

    const newGuard: Guard = {
      id: `sec-${Date.now()}`,
      name: newName.trim().startsWith('Officer ') ? newName.trim() : `Officer ${newName.trim()}`,
      badgeNumber: newBadge.trim().toUpperCase(),
      phone: newPhone.trim() || '+91 98765 22010',
      gateAssignment: newGate,
      shift: 'MORNING',
      status: 'ON_DUTY',
      lastCheckIn: 'Just onboarded',
      role: `Gate Guard · ${newGate}`,
      gate: newGate,
    };

    setGuards([newGuard, ...guards]);
    setIncomingId(newGuard.id);
    setNewName('');
    setNewBadge('');
    setNewPhone('');
    setIsAddOpen(false);
    showAppToast(`Officer ${newGuard.name} (${newGuard.badgeNumber}) registered and available for shift handovers.`, 'success', 'Officer Registered');
  };

  const handleSignHandover = (e: React.FormEvent) => {
    e.preventDefault();

    if (outgoingId === incomingId) {
      showAppToast('Relieving and Incoming officer cannot be the same person.', 'error', 'Validation Error');
      return;
    }

    const shiftLabel =
      shiftType === 'MORNING'
        ? 'Morning Shift (07:00 - 15:00)'
        : shiftType === 'AFTERNOON'
        ? 'Afternoon Shift (15:00 - 23:00)'
        : 'Night Shift (23:00 - 07:00)';

    const fullDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const timestampFormatted = `${fullDate} · ${timeStr}`;

    const newRecord: HandoverRecord = {
      id: `ho-${Date.now()}`,
      outgoingOfficer: `${outgoingOfficer.name} (${outgoingOfficer.badgeNumber})`,
      incomingOfficer: `${incomingOfficer.name} (${incomingOfficer.badgeNumber})`,
      shift: shiftLabel,
      postLocation,
      keysCount,
      radiosCount,
      equipmentVerified: allEquipmentVerified,
      notes: specialInstructions,
      timestamp: timestampFormatted,
      signedAt: timestampFormatted,
    };

    setHandovers([newRecord, ...handovers]);

    // Update gateStations sync store
    const updatedStations = gateStations.map((st) => {
      const match =
        st.name.toLowerCase() === postLocation.toLowerCase() ||
        (postLocation.includes('Gate 1') && st.id === 'gate-1') ||
        (postLocation.includes('Gate 2') && st.id === 'gate-2') ||
        (postLocation.includes('Gate 3') && st.id === 'gate-3') ||
        (postLocation.includes('Control') && st.id === 'gate-4');
      if (match) {
        return {
          ...st,
          currentOfficer: {
            ...st.currentOfficer,
            name: `${incomingOfficer.name} (${incomingOfficer.badgeNumber})`,
            relievedOfficer: `${outgoingOfficer.name} (${outgoingOfficer.badgeNumber})`,
            checkedInAt: timeStr,
          },
          lastHandoverTime: timestampFormatted,
          lastHandoverNotes: specialInstructions,
        };
      }
      return st;
    });
    setGateStations(updatedStations);

    // Update guards roster status in societyos_security_guards
    const updatedGuards = guards.map((g) => {
      if (g.id === incomingId || g.name === incomingOfficer.name) {
        return {
          ...g,
          status: 'ON_DUTY' as const,
          gateAssignment: postLocation,
          lastCheckIn: 'On-duty via shift handover',
        };
      }
      if (g.id === outgoingId || g.name === outgoingOfficer.name) {
        return {
          ...g,
          status: 'OFF_DUTY' as const,
          lastCheckIn: 'Shift concluded',
        };
      }
      return g;
    });
    setGuards(updatedGuards);

    showAppToast(
      `Shift duty successfully transferred from ${outgoingOfficer.name} to ${incomingOfficer.name}! Active security consoles updated in real time.`,
      'success',
      'Shift Handover Logged'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand" />
            Security Shift Handover & Log
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Digital chain of custody for gate duty, perimeter keys, radio walkie-talkies, and unclosed gate tickets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/security/gates"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand text-xs font-semibold cursor-pointer transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Gate Stations & Officers</span>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Officer</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Report</span>
          </Button>
          <div className="px-3 py-1.5 rounded-lg border border-border-neutral bg-surface text-xs text-ink font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand" />
            <span>Current Time: {currentTime || 'Live Desk'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSignHandover} className="space-y-6">
        {/* Officers Selection Roster */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="pb-3 border-b border-border-neutral">
            <CardTitle className="text-base flex items-center gap-2 text-ink">
              <Shield className="w-5 h-5 text-brand" />
              <span>Duty Personnel Transfer</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Select verified security personnel from the active SocietyOS roster for incoming & outgoing duty.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Outgoing Officer */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Outgoing (Relieving) Officer
                </label>
                <select
                  value={outgoingId}
                  onChange={(e) => setOutgoingId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-border-neutral text-xs font-semibold text-ink"
                >
                  {guards.map((guard) => (
                    <option key={guard.id} value={guard.id}>
                      {guard.name} ({guard.badgeNumber}) · {guard.gateAssignment || guard.gate || guard.role || 'Officer'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-ink-muted mt-1">
                  Contact: {outgoingOfficer?.phone || 'N/A'} · Assigned Post: {outgoingOfficer?.gateAssignment || outgoingOfficer?.gate || 'Main Gate'}
                </p>
              </div>

              {/* Incoming Officer */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Incoming (Relieving) Officer
                </label>
                <select
                  value={incomingId}
                  onChange={(e) => setIncomingId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border-2 border-brand/50 text-xs font-bold text-ink"
                >
                  {guards.map((guard) => (
                    <option key={guard.id} value={guard.id}>
                      {guard.name} ({guard.badgeNumber}) · {guard.gateAssignment || guard.gate || guard.role || 'Officer'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-brand font-medium mt-1">
                  Contact: {incomingOfficer?.phone || 'N/A'} · Accepting duty at: {incomingOfficer?.gateAssignment || incomingOfficer?.gate || postLocation}
                </p>
              </div>
            </div>

            {/* Shift & Post Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-neutral">
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">Shift Window</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink font-medium"
                >
                  <option value="MORNING">Morning Shift (07:00 - 15:00)</option>
                  <option value="AFTERNOON">Afternoon Shift (15:00 - 23:00)</option>
                  <option value="NIGHT">Night Shift (23:00 - 07:00)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">Duty Post Location</label>
                <select
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink font-medium"
                >
                  <option value="Gate 1 (Main Entrance)">Gate 1 (Main Entrance - Vehicular & Pedestrian)</option>
                  <option value="Gate 2 (Service Gate)">Gate 2 (Service Gate & Deliveries)</option>
                  <option value="Clubhouse & Amenity Booth">Clubhouse & Amenity Surveillance Booth</option>
                  <option value="Perimeter Roving Patrol">Perimeter Roving Patrol (Towers A-D)</option>
                  <option value="Central Security Control Room">Central Security Control Room</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment & Custody Checklist */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="pb-3 border-b border-border-neutral">
            <CardTitle className="text-base flex items-center gap-2 text-ink">
              <KeyRound className="w-5 h-5 text-brand" />
              <span>Physical Custody & Equipment Verification</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Verify count and operational condition of gate assets prior to signing transfer of custody.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Master Keys in Custody Ring (Count)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={keysCount}
                  onChange={(e) => setKeysCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg bg-surface border border-border-neutral text-xs font-mono font-bold text-ink"
                />
                <span className="text-[11px] text-ink-muted">
                  Clubhouse, Pump Room, Electrical Substation, Terrace Fire Doors
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Motorola Walkie-Talkie Handsets (Count)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={radiosCount}
                  onChange={(e) => setRadiosCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg bg-surface border border-border-neutral text-xs font-mono font-bold text-ink"
                />
                <span className="text-[11px] text-ink-muted">All radios checked at 100% battery with charging dock</span>
              </div>
            </div>

            {/* Verification Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-border-neutral">
              <span className="text-xs font-bold text-ink block mb-2">Pre-Handover Inspection Items:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  onClick={() => toggleChecklist('radiosOperational')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-neutral bg-surface-subtle cursor-pointer hover:bg-surface"
                >
                  {checklist.radiosOperational ? (
                    <CheckSquare className="w-4 h-4 text-brand shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-ink">Walkie radios tested on Channel 1</span>
                </label>

                <label
                  onClick={() => toggleChecklist('keysAccounted')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-neutral bg-surface-subtle cursor-pointer hover:bg-surface"
                >
                  {checklist.keysAccounted ? (
                    <CheckSquare className="w-4 h-4 text-brand shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-ink">All physical keys verified in lockbox</span>
                </label>

                <label
                  onClick={() => toggleChecklist('gateBarriersWorking')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-neutral bg-surface-subtle cursor-pointer hover:bg-surface"
                >
                  {checklist.gateBarriersWorking ? (
                    <CheckSquare className="w-4 h-4 text-brand shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-ink">Boom barrier remotes responsive</span>
                </label>

                <label
                  onClick={() => toggleChecklist('visitorScannerOperational')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-neutral bg-surface-subtle cursor-pointer hover:bg-surface"
                >
                  {checklist.visitorScannerOperational ? (
                    <CheckSquare className="w-4 h-4 text-brand shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-ink">Gate tablet & QR scanner charged</span>
                </label>

                <label
                  onClick={() => toggleChecklist('cctvMonitoringClear')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-neutral bg-surface-subtle cursor-pointer hover:bg-surface"
                >
                  {checklist.cctvMonitoringClear ? (
                    <CheckSquare className="w-4 h-4 text-brand shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-ink">CCTV monitors streaming without dead feed</span>
                </label>

                <label
                  onClick={() => toggleChecklist('firstAidAndFireClear')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-neutral bg-surface-subtle cursor-pointer hover:bg-surface"
                >
                  {checklist.firstAidAndFireClear ? (
                    <CheckSquare className="w-4 h-4 text-brand shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                  <span className="text-ink">Gate extinguisher & emergency kit sealed</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handover Briefing & Log */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader className="pb-3 border-b border-border-neutral">
            <CardTitle className="text-base flex items-center gap-2 text-ink">
              <ClipboardList className="w-5 h-5 text-brand" />
              <span>Shift Briefing & Operational Notes</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Record special instructions, ongoing contractor work, and vehicles currently in premises.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <textarea
              rows={4}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-border-neutral text-xs text-ink leading-relaxed font-mono"
              placeholder="Enter special briefing notes..."
              required
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  By signing, both officers certify the physical verification of all items.
                </span>
              </div>

              <Button type="submit" variant="primary" className="w-full sm:w-auto font-bold px-6">
                <Save className="w-4 h-4 mr-2" />
                Sign & Execute Shift Handover
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Historical Shift Handover Ledger */}
      <Card className="border border-border-neutral bg-surface shadow-xs">
        <CardHeader className="pb-3 border-b border-border-neutral">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand" />
              <CardTitle className="text-base font-bold text-ink">
                Shift Handover Audit Records ({handovers.length})
              </CardTitle>
            </div>
            <span className="text-xs text-ink-muted font-mono">Immutable Shift Log</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border-neutral text-ink-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Shift & Timestamp</th>
                  <th className="p-3">Outgoing Officer</th>
                  <th className="p-3">Incoming Officer</th>
                  <th className="p-3">Post</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Briefing Notes</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-neutral">
                {handovers.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-3 font-medium text-ink whitespace-nowrap">
                      <div>{record.timestamp}</div>
                      <div className="text-[10px] text-ink-muted font-mono">{record.shift}</div>
                    </td>
                    <td className="p-3 font-semibold text-ink whitespace-nowrap">
                      {record.outgoingOfficer}
                    </td>
                    <td className="p-3 font-bold text-brand whitespace-nowrap">
                      {record.incomingOfficer}
                    </td>
                    <td className="p-3 text-ink-muted whitespace-nowrap">
                      {record.postLocation}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface border border-border-neutral font-mono text-[11px]">
                        🔑 {record.keysCount} keys · 📻 {record.radiosCount} radios
                      </span>
                    </td>
                    <td className="p-3 text-ink-muted max-w-xs truncate" title={record.notes}>
                      {record.notes}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Signed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Register New Officer Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-surface border border-border-neutral shadow-2xl p-6">
          <DialogHeader className="pb-3 border-b border-border-neutral">
            <DialogTitle className="text-lg font-bold text-ink flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand" />
              <span>Register New Guard Officer</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted">
              Add a new security guard to the society roster. The officer will immediately be available for shift handovers and gate assignments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOfficer} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Full Officer Name *
              </label>
              <Input
                placeholder="e.g. Anand Shinde"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="bg-surface border-border-neutral text-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Badge Number *
                </label>
                <Input
                  placeholder="e.g. SEC-807"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value.toUpperCase())}
                  required
                  className="bg-surface border-border-neutral font-mono uppercase text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Contact Mobile
                </label>
                <Input
                  placeholder="+91 98765 22007"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-surface border-border-neutral text-ink"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Assigned Post Location
              </label>
              <select
                value={newGate}
                onChange={(e) => setNewGate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface border border-border-neutral text-xs font-semibold text-ink"
              >
                <option value="Gate 1 (Main Entrance)">Gate 1 (Main Entrance)</option>
                <option value="Gate 2 (Service Gate)">Gate 2 (Service Gate)</option>
                <option value="Clubhouse & Amenity Booth">Clubhouse & Amenity Booth</option>
                <option value="Perimeter Roving Patrol">Perimeter Roving Patrol</option>
                <option value="Central Security Control Room">Central Security Control Room</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-neutral">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold"
              >
                Save & Add to Roster
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
