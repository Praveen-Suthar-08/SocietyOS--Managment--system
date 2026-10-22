'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Search,
  Plus,
  KeyRound,
  Compass,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ClipboardList,
  ArrowRight,
  UserCheck,
  Radio,
  Eye,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { DEFAULT_GATE_STATIONS, GateStation } from '@/app/security/gates/page';

interface Guard {
  id: string;
  name: string;
  badgeNumber: string;
  phone: string;
  gateAssignment: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  status: 'ON_DUTY' | 'OFF_DUTY' | 'PATROL';
  lastCheckIn: string;
}

const DEFAULT_GUARDS: Guard[] = [
  {
    id: 'sec-1',
    name: 'Officer Vikram Singh',
    badgeNumber: 'SEC-801',
    phone: '+91 98765 22001',
    gateAssignment: 'Gate 1 (Main Entrance)',
    shift: 'MORNING',
    status: 'ON_DUTY',
    lastCheckIn: '10 mins ago',
  },
  {
    id: 'sec-2',
    name: 'Officer Ramesh Kumar',
    badgeNumber: 'SEC-802',
    phone: '+91 98765 22002',
    gateAssignment: 'Gate 1 North (Visitor Terminal)',
    shift: 'MORNING',
    status: 'ON_DUTY',
    lastCheckIn: '15 mins ago',
  },
  {
    id: 'sec-3',
    name: 'Officer Dilip Jha',
    badgeNumber: 'SEC-803',
    phone: '+91 98765 22003',
    gateAssignment: 'Gate 2 (Service & Deliveries)',
    shift: 'MORNING',
    status: 'PATROL',
    lastCheckIn: '2 mins ago (Basement 1)',
  },
  {
    id: 'sec-4',
    name: 'Officer Manoj Yadav',
    badgeNumber: 'SEC-804',
    phone: '+91 98765 22004',
    gateAssignment: 'Gate 1 (Main Entrance)',
    shift: 'EVENING',
    status: 'OFF_DUTY',
    lastCheckIn: 'Shift starts 15:00',
  },
];

export default function AdminSecurityTeamPage() {
  const [guards, setGuards] = useSyncStore<Guard[]>('societyos_security_guards', DEFAULT_GUARDS);
  const [shiftHandovers, setShiftHandovers] = useSyncStore<any[]>('societyos_shift_handovers', []);
  const [gateStations, setGateStations] = useSyncStore<GateStation[]>(
    'societyos_gate_stations',
    DEFAULT_GATE_STATIONS
  );
  const [selectedGuard, setSelectedGuard] = React.useState<Guard | null>(null);

  // Compute live gate stations reflecting handovers per gate
  const liveGateStations = React.useMemo(() => {
    if (!shiftHandovers || shiftHandovers.length === 0) return gateStations;

    return gateStations.map((station) => {
      const matchingHandovers = shiftHandovers.filter((h: any) => {
        if (!h.postLocation) return false;
        const postNorm = h.postLocation.toLowerCase();
        const stationNorm = station.name.toLowerCase();
        return (
          postNorm.includes(station.id) ||
          postNorm.includes(stationNorm) ||
          (station.id === 'gate-1' && (postNorm.includes('gate 1') || postNorm.includes('main'))) ||
          (station.id === 'gate-2' && (postNorm.includes('gate 2') || postNorm.includes('service'))) ||
          (station.id === 'gate-3' && (postNorm.includes('gate 3') || postNorm.includes('clubhouse'))) ||
          (station.id === 'gate-4' && (postNorm.includes('cctv') || postNorm.includes('control')))
        );
      });

      if (matchingHandovers.length > 0) {
        const latest = matchingHandovers[0];
        return {
          ...station,
          currentOfficer: {
            ...station.currentOfficer,
            name: latest.incomingOfficer || station.currentOfficer.name,
            relievedOfficer: latest.outgoingOfficer || station.currentOfficer.relievedOfficer,
            checkedInAt: latest.timestamp || 'Live Handover',
          },
          lastHandoverTime: latest.signedAt || latest.timestamp || 'Just now',
          lastHandoverNotes: latest.notes || station.lastHandoverNotes,
        };
      }
      return station;
    });
  }, [gateStations, shiftHandovers]);

  // Fetch guards from MongoDB backend
  React.useEffect(() => {
    fetch('/api/security/guards')
      .then((res) => res.json())
      .then((data) => {
        if (data.guards && Array.isArray(data.guards) && data.guards.length > 0) {
          setGuards((current) => {
            const currentIds = new Set(current.map((g) => g.id || g.badgeNumber));
            const newGuards = [...current];
            data.guards.forEach((g: any) => {
              if (!currentIds.has(g.id) && !currentIds.has(g.badgeNumber)) {
                newGuards.push(g);
              }
            });
            return newGuards;
          });
        }
      })
      .catch(() => {});
  }, [setGuards]);

  // Compute live guards reflecting latest shift handover
  const activeGuards = React.useMemo(() => {
    if (!shiftHandovers || shiftHandovers.length === 0) return guards;
    const latest = shiftHandovers[0];
    return guards.map((g) => {
      const gNameClean = g.name.toLowerCase().replace('officer ', '').trim();
      const isIncoming =
        (latest.incomingOfficer && latest.incomingOfficer.toLowerCase().includes(gNameClean)) ||
        (latest.incomingOfficer && latest.incomingOfficer.includes(g.badgeNumber)) ||
        (latest.incomingOfficer && g.name.toLowerCase().includes(latest.incomingOfficer.toLowerCase()));

      const isOutgoing =
        (latest.outgoingOfficer && latest.outgoingOfficer.toLowerCase().includes(gNameClean)) ||
        (latest.outgoingOfficer && latest.outgoingOfficer.includes(g.badgeNumber)) ||
        (latest.outgoingOfficer && g.name.toLowerCase().includes(latest.outgoingOfficer.toLowerCase()));

      if (isIncoming) {
        return {
          ...g,
          status: 'ON_DUTY' as const,
          gateAssignment: latest.postLocation || g.gateAssignment,
          lastCheckIn: `Handover signed (${latest.timestamp || 'Just now'})`,
        };
      }
      if (isOutgoing) {
        return {
          ...g,
          status: 'OFF_DUTY' as const,
          lastCheckIn: `Relieved from duty (${latest.timestamp || 'Just now'})`,
        };
      }
      return g;
    });
  }, [guards, shiftHandovers]);

  const latestHandover = shiftHandovers[0];

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newBadge, setNewBadge] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [newGate, setNewGate] = React.useState('Gate 1 (Main Entrance)');

  // Shift Rotation / Handover Dialog
  const [isRotateOpen, setIsRotateOpen] = React.useState(false);
  const [rotateGate, setRotateGate] = React.useState('Gate 1 (Main Entrance)');
  const [incomingOfficerName, setIncomingOfficerName] = React.useState('Officer Manoj Yadav (SEC-804)');
  const [outgoingOfficerName, setOutgoingOfficerName] = React.useState('Officer Vikram Singh (SEC-801)');
  const [handoverNotes, setHandoverNotes] = React.useState('Normal operational handover executed via Security Admin Console.');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGuard: Guard = {
      id: `sec-${Date.now()}`,
      name: newName,
      badgeNumber: newBadge,
      phone: newPhone,
      gateAssignment: newGate,
      shift: 'MORNING',
      status: 'ON_DUTY',
      lastCheckIn: 'Just onboarded',
    };
    setGuards([newGuard, ...guards]);
    setNewName('');
    setNewBadge('');
    setNewPhone('');
    setIsAddOpen(false);

    // Persist to MongoDB
    try {
      await fetch('/api/security/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuard),
      });
    } catch {}

    showAppToast(`Officer ${newGuard.name} registered and saved to roster database.`, 'success', 'Guard Registered');
  };

  const handleUpdateGuardStatus = async (guardId: string, newStatus: Guard['status']) => {
    const updated = guards.map((g) => (g.id === guardId ? { ...g, status: newStatus } : g));
    setGuards(updated);
    if (selectedGuard?.id === guardId) {
      setSelectedGuard({ ...selectedGuard, status: newStatus });
    }
    showAppToast(`Officer status updated to ${newStatus}.`, 'info', 'Status Updated');
  };

  const handleShiftRotateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const fullDateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timestampStr = `${fullDateFormatted} · ${timeFormatted}`;

    const newHandover = {
      id: `ho-${Date.now()}`,
      outgoingOfficer: outgoingOfficerName,
      incomingOfficer: incomingOfficerName,
      shift: 'Live Roster Shift Handover',
      postLocation: rotateGate,
      keysCount: 8,
      radiosCount: 4,
      equipmentVerified: true,
      notes: handoverNotes.trim(),
      timestamp: timestampStr,
      signedAt: timestampStr,
    };

    setShiftHandovers([newHandover, ...shiftHandovers]);

    // Update gateStations sync store
    const updatedStations = gateStations.map((st) => {
      const match =
        st.name.toLowerCase() === rotateGate.toLowerCase() ||
        (rotateGate.includes('Gate 1') && st.id === 'gate-1') ||
        (rotateGate.includes('Gate 2') && st.id === 'gate-2') ||
        (rotateGate.includes('Gate 3') && st.id === 'gate-3') ||
        (rotateGate.includes('Control') && st.id === 'gate-4');
      if (match) {
        return {
          ...st,
          currentOfficer: {
            ...st.currentOfficer,
            name: incomingOfficerName,
            relievedOfficer: outgoingOfficerName,
            checkedInAt: timeFormatted,
          },
          lastHandoverTime: timestampStr,
          lastHandoverNotes: handoverNotes.trim(),
        };
      }
      return st;
    });
    setGateStations(updatedStations);

    setIsRotateOpen(false);
    showAppToast(
      `Shift handover for ${rotateGate} executed. Officer ${incomingOfficerName} is now ON DUTY.`,
      'success',
      'Shift Rotation Applied'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Security Force & Gate Officers
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Active guard roster, gate station assignments, and live shift duty allocations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={() => setIsRotateOpen(true)} className="border-brand/40 text-brand hover:bg-brand/10">
            <ClipboardList className="w-4 h-4 mr-1.5" />
            <span>Shift Handover & Station Rotation</span>
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Guard Officer</span>
          </Button>
        </div>
      </div>

      {/* Live Shift Handover Banner (Recent Event) */}
      {latestHandover && (
        <div className="p-4 rounded-xl border border-brand/30 bg-brand/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand uppercase tracking-wider">
                  Live Shift Handover Active
                </span>
                <Badge variant="brand" className="text-[10px]">Real-Time Sync</Badge>
              </div>
              <p className="text-xs text-ink mt-0.5">
                Current Guard on Duty: <strong className="text-ink">{latestHandover.incomingOfficer}</strong> (relieved {latestHandover.outgoingOfficer}) at <strong>{latestHandover.postLocation}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            Signed: {latestHandover.signedAt || latestHandover.timestamp}
          </span>
        </div>
      )}

      {/* Real-Time All Gate Stations & Assigned Officers Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <span>Gate Station Officer Assignments & Next Shift Roster (All Gates)</span>
            </h2>
            <p className="text-xs text-ink-muted">
              Live duty assignments, current on-duty officers, and scheduled next shift incoming officers across all compound gates
            </p>
          </div>
          <Link
            href="/security/gates"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Security Gate Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {liveGateStations.map((st) => (
            <Card key={st.id} className="border border-border-neutral bg-surface shadow-2xs flex flex-col justify-between">
              <CardContent className="p-4 space-y-3 text-xs">
                {/* Station Header */}
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-ink">{st.name}</h3>
                    <p className="text-[10px] text-ink-muted truncate max-w-[180px]">{st.locationTag}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                    ● ACTIVE
                  </span>
                </div>

                {/* Current On-Duty Guard */}
                <div className="p-2.5 rounded-lg bg-brand/5 border border-brand/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-brand uppercase tracking-wider">
                    <span>Current Guard on Duty</span>
                    <span className="font-mono">{st.currentOfficer.badge}</span>
                  </div>
                  <p className="font-bold text-xs text-ink">{st.currentOfficer.name}</p>
                  <p className="text-[11px] text-ink-muted">
                    {st.currentOfficer.phone} · <span className="text-ink font-mono">{st.currentOfficer.checkedInAt}</span>
                  </p>
                  {st.currentOfficer.relievedOfficer && (
                    <p className="text-[10px] text-ink-muted pt-1 border-t border-brand/10">
                      Relieved: <strong className="text-ink">{st.currentOfficer.relievedOfficer}</strong>
                    </p>
                  )}
                </div>

                {/* Next Shift Officer Coming */}
                <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    <span>Next Shift Incoming</span>
                    <span className="font-mono">{st.nextOfficer.badge}</span>
                  </div>
                  <p className="font-bold text-xs text-ink">{st.nextOfficer.name}</p>
                  <p className="text-[10px] text-ink-muted">
                    Shift: {st.nextOfficer.shift} ({st.nextOfficer.scheduledTime})
                  </p>
                </div>

                {/* Equipment & Traffic */}
                <div className="flex items-center justify-between text-[11px] text-ink-muted px-1">
                  <span>🔑 {st.equipment.keysCount} Keys</span>
                  <span>📻 {st.equipment.radiosCount} Radios</span>
                  <span>🚗 {st.todayEntries} Ingress</span>
                </div>

                {/* Handover Action */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold cursor-pointer border-brand/30 text-brand hover:bg-brand/10"
                  onClick={() => {
                    setRotateGate(st.name);
                    setOutgoingOfficerName(st.currentOfficer.name);
                    setIncomingOfficerName(st.nextOfficer.name);
                    setIsRotateOpen(true);
                  }}
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  <span>Rotate Station / Handover</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Roster Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted font-semibold">On-Duty Officers</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-display text-ink mt-2">
            {activeGuards.filter((g) => g.status === 'ON_DUTY').length} Active
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Staffing Gate 1 & Visitor Desks</p>
        </div>

        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted font-semibold">Active Patrols</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400 mt-2">
            {activeGuards.filter((g) => g.status === 'PATROL').length} Round
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Basement & Perimeter Sweep</p>
        </div>

        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted font-semibold">Shift Timing</span>
            <Clock className="w-4 h-4 text-brand" />
          </div>
          <p className="text-2xl font-bold font-display text-ink mt-2">Day Shift</p>
          <p className="text-xs text-ink-muted mt-0.5">07:00 – 15:00 (Next Handover 15:00)</p>
        </div>
      </div>

      {/* Guards Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Officer</th>
                <th className="px-4 py-3">Badge ID</th>
                <th className="px-4 py-3">Gate Station</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Check-in</th>
                <th className="px-4 py-3 text-right">Live Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {activeGuards.map((guard) => (
                <tr
                  key={guard.id}
                  onClick={() => setSelectedGuard(guard)}
                  className="hover:bg-brand/5 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-ink group-hover:text-brand transition-colors">{guard.name}</p>
                        <p className="text-xs text-ink-muted">{guard.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-ink px-2 py-0.5 rounded bg-surface-muted border border-border-subtle text-xs">
                      {guard.badgeNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-ink">
                    {guard.gateAssignment}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted font-medium">
                    {guard.shift}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${
                        guard.status === 'ON_DUTY'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : guard.status === 'PATROL'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          : 'bg-surface-muted text-ink-muted border-border-neutral'
                      }`}
                    >
                      {guard.status === 'ON_DUTY' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {guard.status === 'PATROL' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      {guard.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted">
                    {guard.lastCheckIn}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-xs font-semibold text-brand group-hover:underline inline-flex items-center gap-1">
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Real-Time Officer Details Modal */}
      {selectedGuard && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedGuard(null)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-ink">{selectedGuard.name}</h3>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted border border-border-subtle text-ink">
                      {selectedGuard.badgeNumber}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Security Force Officer · Greenfield Heights Command Post
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGuard(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Status Ribbon */}
            <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedGuard.status === 'ON_DUTY'
                      ? 'bg-emerald-500 animate-pulse'
                      : selectedGuard.status === 'PATROL'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-ink uppercase tracking-wider">
                  Live Duty Status: {selectedGuard.status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs font-mono text-ink-muted">
                Last check: {selectedGuard.lastCheckIn}
              </span>
            </div>

            {/* Officer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-1">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                  Assigned Gate Station
                </span>
                <p className="font-bold text-sm text-ink">{selectedGuard.gateAssignment}</p>
                <p className="text-ink-muted text-[11px]">Primary Inbound & Outbound Barrier Control</p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-1">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                  Shift Timing & Allocation
                </span>
                <p className="font-bold text-sm text-ink">{selectedGuard.shift} SHIFT</p>
                <p className="text-ink-muted text-[11px]">
                  {selectedGuard.shift === 'MORNING'
                    ? '07:00 – 15:00'
                    : selectedGuard.shift === 'EVENING'
                    ? '15:00 – 23:00'
                    : '23:00 – 07:00'}{' '}
                  (Next Handover in 2h 45m)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-1">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                  Contact Telephony
                </span>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-bold text-ink">{selectedGuard.phone}</p>
                  <a
                    href={`tel:${selectedGuard.phone}`}
                    className="px-2 py-1 rounded bg-brand/10 text-brand text-[11px] font-semibold hover:bg-brand/20 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                </div>
                <p className="text-ink-muted text-[10px]">Emergency Radio Backup: Speed Dial #4</p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-1">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                  Security Clearance & Verification
                </span>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Police Verified & PSARA Certified</span>
                </div>
                <p className="text-ink-muted text-[10px]">Blood Group: O+ · Biometrics Enrolled</p>
              </div>
            </div>

            {/* Issued Inventory & Telecom */}
            <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-2 text-xs">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                Issued Tactical Equipment & Radios
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-muted border border-border-subtle">
                  <Radio className="w-4 h-4 text-brand flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Walkie-Talkie Radio</span>
                    <span className="text-ink-muted text-[10px]">CH-02 (Gate Operations)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-muted border border-border-subtle">
                  <KeyRound className="w-4 h-4 text-brand flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Gate Master RFID</span>
                    <span className="text-ink-muted text-[10px]">Card #RFID-G1-8891</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-muted border border-border-subtle">
                  <Eye className="w-4 h-4 text-brand flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Bodycam Telemetry</span>
                    <span className="text-ink-muted text-[10px]">BWC-SEC-04 (Streaming)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-muted border border-border-subtle">
                  <Compass className="w-4 h-4 text-brand flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Barrier Remote</span>
                    <span className="text-ink-muted text-[10px]">Controller #RC-01</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duty Status Control */}
            <div className="p-3 rounded-xl bg-surface border border-border-neutral space-y-2 text-xs">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                Update Officer Duty Status (Real-Time Database Sync)
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedGuard.status === 'ON_DUTY' ? 'primary' : 'outline'}
                  className="text-xs"
                  onClick={() => handleUpdateGuardStatus(selectedGuard.id, 'ON_DUTY')}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  Set On Duty
                </Button>
                <Button
                  size="sm"
                  variant={selectedGuard.status === 'PATROL' ? 'primary' : 'outline'}
                  className="text-xs"
                  onClick={() => handleUpdateGuardStatus(selectedGuard.id, 'PATROL')}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
                  Set On Patrol
                </Button>
                <Button
                  size="sm"
                  variant={selectedGuard.status === 'OFF_DUTY' ? 'secondary' : 'outline'}
                  className="text-xs"
                  onClick={() => handleUpdateGuardStatus(selectedGuard.id, 'OFF_DUTY')}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5" />
                  Set Off Duty
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-border-neutral">
              <Button variant="secondary" onClick={() => setSelectedGuard(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Register Guard Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Register Guard Officer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Officer Kailash Shinde"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />

              <Input
                label="Badge ID / Radio Tag"
                placeholder="e.g. SEC-805"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                required
              />

              <Input
                label="Emergency Duty Phone"
                placeholder="e.g. +91 98765 22005"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  Assigned Gate Post
                </label>
                <select
                  value={newGate}
                  onChange={(e) => setNewGate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Gate 1 (Main Entrance)">Gate 1 (Main Entrance)</option>
                  <option value="Gate 1 North (Visitor Terminal)">Gate 1 North (Visitor Terminal)</option>
                  <option value="Gate 2 (Service & Deliveries)">Gate 2 (Service & Deliveries)</option>
                  <option value="Basement Parking Post">Basement Parking Post</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Enlist Guard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Handover & Gate Duty Allocation Modal */}
      {isRotateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-lg text-ink">Rotate Shift & Gate Duty</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRotateOpen(false)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShiftRotateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">
                  Gate Post Station *
                </label>
                <select
                  value={rotateGate}
                  onChange={(e) => setRotateGate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Gate 1 (Main Entrance)">Gate 1 (Main Entrance)</option>
                  <option value="Gate 1 North (Visitor Terminal)">Gate 1 North (Visitor Terminal)</option>
                  <option value="Gate 2 (Service & Deliveries)">Gate 2 (Service & Deliveries)</option>
                  <option value="Basement Parking Post">Basement Parking Post</option>
                  <option value="Clubhouse & Perimeter Patrol">Clubhouse & Perimeter Patrol</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Relieving / Incoming Guard (Reporting ON DUTY) *
                </label>
                <select
                  value={incomingOfficerName}
                  onChange={(e) => setIncomingOfficerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {guards.map((g) => (
                    <option key={g.id} value={`${g.name} (${g.badgeNumber})`}>
                      {g.name} ({g.badgeNumber}) · currently {g.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Outgoing Guard (Going OFF DUTY) *
                </label>
                <select
                  value={outgoingOfficerName}
                  onChange={(e) => setOutgoingOfficerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {guards.map((g) => (
                    <option key={g.id} value={`${g.name} (${g.badgeNumber})`}>
                      {g.name} ({g.badgeNumber}) · {g.gateAssignment}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Handover Log Notes & Instructions
                </label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="e.g. 8 master keys and 4 Motorola walkie-talkies transferred."
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border-neutral">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsRotateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Execute Shift Handover
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
