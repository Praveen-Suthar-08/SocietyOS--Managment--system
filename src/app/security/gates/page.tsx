'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Clock,
  User,
  Radio,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Calendar,
  Building,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  ClipboardList,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

export interface GateStation {
  id: string;
  name: string;
  locationTag: string;
  type: string;
  currentOfficer: {
    name: string;
    badge: string;
    phone: string;
    role: string;
    shift: string;
    checkedInAt: string;
    relievedOfficer?: string;
  };
  nextOfficer: {
    name: string;
    badge: string;
    phone: string;
    shift: string;
    scheduledTime: string;
    etaMinutes: number;
  };
  equipment: {
    keysCount: number;
    radiosCount: number;
    tabletsCount: number;
    isVerified: boolean;
  };
  todayEntries: number;
  barrierStatus: 'OPERATIONAL' | 'MANUAL_OVERRIDE' | 'MAINTENANCE';
  lastHandoverTime?: string;
  lastHandoverNotes?: string;
}

export const DEFAULT_GATE_STATIONS: GateStation[] = [
  {
    id: 'gate-1',
    name: 'Gate 1 (Main Entrance)',
    locationTag: 'North Boulevard · Main Compound Ingress',
    type: 'Primary Vehicle & Visitor Checkpoint',
    currentOfficer: {
      name: 'Officer Vikram Singh',
      badge: 'SEC-801',
      phone: '+91 98765 22001',
      role: 'Head Guard / Post Commander',
      shift: 'Morning Duty (07:00 - 15:00)',
      checkedInAt: '07:00 AM',
      relievedOfficer: 'Officer Rajesh Nair (SEC-806)',
    },
    nextOfficer: {
      name: 'Officer Manoj Yadav',
      badge: 'SEC-804',
      phone: '+91 98765 22004',
      shift: 'Afternoon Shift (15:00 - 23:00)',
      scheduledTime: '15:00 Today',
      etaMinutes: 25,
    },
    equipment: {
      keysCount: 8,
      radiosCount: 4,
      tabletsCount: 1,
      isVerified: true,
    },
    todayEntries: 142,
    barrierStatus: 'OPERATIONAL',
    lastHandoverTime: 'Today, 07:00 AM',
    lastHandoverNotes: 'Perimeter lights operational. ANPR camera 01 calibrated.',
  },
  {
    id: 'gate-2',
    name: 'Gate 2 (Service & Deliveries)',
    locationTag: 'East Perimeter · Tower A Service Bay',
    type: 'Heavy Logistics, Couriers & Vendor Desk',
    currentOfficer: {
      name: 'Officer Ramesh Kumar',
      badge: 'SEC-802',
      phone: '+91 98765 22002',
      role: 'Senior Delivery & Parcel Officer',
      shift: 'Morning Duty (07:00 - 15:00)',
      checkedInAt: '07:00 AM',
      relievedOfficer: 'Officer Dilip Jha (SEC-803)',
    },
    nextOfficer: {
      name: 'Officer Dilip Jha',
      badge: 'SEC-803',
      phone: '+91 98765 22003',
      shift: 'Afternoon Shift (15:00 - 23:00)',
      scheduledTime: '15:00 Today',
      etaMinutes: 25,
    },
    equipment: {
      keysCount: 6,
      radiosCount: 2,
      tabletsCount: 1,
      isVerified: true,
    },
    todayEntries: 68,
    barrierStatus: 'OPERATIONAL',
    lastHandoverTime: 'Today, 07:00 AM',
    lastHandoverNotes: 'Otis elevator service truck cleared. 4 Amazon deliveries logged.',
  },
  {
    id: 'gate-3',
    name: 'Gate 3 (Clubhouse & Pedestrian Exit)',
    locationTag: 'South Green Park · Resident Turnstiles',
    type: 'Biometric Pedestrian & Resident Express Lane',
    currentOfficer: {
      name: 'Officer Dilip Jha',
      badge: 'SEC-803',
      phone: '+91 98765 22003',
      role: 'Patrol & Turnstile Controller',
      shift: 'Morning Duty (07:00 - 15:00)',
      checkedInAt: '07:15 AM',
      relievedOfficer: 'Officer Santosh Patil (SEC-805)',
    },
    nextOfficer: {
      name: 'Officer Santosh Patil',
      badge: 'SEC-805',
      phone: '+91 98765 22005',
      shift: 'Evening Shift (15:00 - 23:00)',
      scheduledTime: '15:00 Today',
      etaMinutes: 35,
    },
    equipment: {
      keysCount: 4,
      radiosCount: 2,
      tabletsCount: 1,
      isVerified: true,
    },
    todayEntries: 89,
    barrierStatus: 'OPERATIONAL',
    lastHandoverTime: 'Today, 07:15 AM',
    lastHandoverNotes: 'Pool gate locked for morning cleaning. Turnstiles functioning smoothly.',
  },
  {
    id: 'gate-4',
    name: 'Central Control Room (CCTV & Fire)',
    locationTag: 'Clubhouse Level B1 · Command Hub',
    type: '24/7 Matrix Surveillance & Fire Alarm Command',
    currentOfficer: {
      name: 'Officer Santosh Patil',
      badge: 'SEC-805',
      phone: '+91 98765 22005',
      role: 'Systems & Fire Safety Specialist',
      shift: 'Morning Shift (07:00 - 15:00)',
      checkedInAt: '06:55 AM',
      relievedOfficer: 'Officer Rajesh Nair (SEC-806)',
    },
    nextOfficer: {
      name: 'Officer Rajesh Nair',
      badge: 'SEC-806',
      phone: '+91 98765 22006',
      shift: 'Night Duty Supervisor (23:00 - 07:00)',
      scheduledTime: '23:00 Today',
      etaMinutes: 480,
    },
    equipment: {
      keysCount: 12,
      radiosCount: 6,
      tabletsCount: 2,
      isVerified: true,
    },
    todayEntries: 24,
    barrierStatus: 'OPERATIONAL',
    lastHandoverTime: 'Today, 06:55 AM',
    lastHandoverNotes: 'All 32 camera feeds recording at 1080p. Smoke detectors battery tested.',
  },
];

export default function SecurityGateRosterPage() {
  const [gateStations, setGateStations] = useSyncStore<GateStation[]>(
    'societyos_gate_stations',
    DEFAULT_GATE_STATIONS
  );
  const [shiftHandovers, setShiftHandovers] = useSyncStore<any[]>(
    'societyos_shift_handovers',
    []
  );

  // Live ticking clock state
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [selectedStation, setSelectedStation] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Handover Dialog State
  const [isHandoverOpen, setIsHandoverOpen] = React.useState(false);
  const [targetGateId, setTargetGateId] = React.useState('gate-1');
  const [incomingOfficerName, setIncomingOfficerName] = React.useState('Officer Manoj Yadav (SEC-804)');
  const [outgoingOfficerName, setOutgoingOfficerName] = React.useState('Officer Vikram Singh (SEC-801)');
  const [handoverNotes, setHandoverNotes] = React.useState('Regular shift transition. Keys, walkie-talkies, and visitor logbook inspected.');
  const [equipmentChecked, setEquipmentChecked] = React.useState(true);

  // Synchronize stations if a new shift handover is executed elsewhere
  const liveStations = React.useMemo(() => {
    if (!shiftHandovers || shiftHandovers.length === 0) return gateStations;

    const updated = gateStations.map((station) => {
      // Find the latest handover specifically targeting this gate location
      const matchingHandovers = shiftHandovers.filter((h) => {
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

    return updated;
  }, [gateStations, shiftHandovers]);

  const filteredStations = liveStations.filter((st) => {
    const matchesFilter = selectedStation === 'ALL' || st.id === selectedStation;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      st.name.toLowerCase().includes(q) ||
      st.locationTag.toLowerCase().includes(q) ||
      st.currentOfficer.name.toLowerCase().includes(q) ||
      st.currentOfficer.badge.toLowerCase().includes(q) ||
      st.nextOfficer.name.toLowerCase().includes(q) ||
      st.nextOfficer.badge.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleOpenHandover = (station: GateStation) => {
    setTargetGateId(station.id);
    setOutgoingOfficerName(station.currentOfficer.name);
    setIncomingOfficerName(station.nextOfficer.name);
    setHandoverNotes(`Station shift handover for ${station.name}. All perimeter assets checked.`);
    setIsHandoverOpen(true);
  };

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const fullDateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timestampStr = `${fullDateFormatted} · ${timeFormatted}`;

    const targetStation = liveStations.find((s) => s.id === targetGateId) || liveStations[0];

    const newHandoverRecord = {
      id: `ho-${Date.now()}`,
      outgoingOfficer: outgoingOfficerName,
      incomingOfficer: incomingOfficerName,
      shift: 'Live Roster Handover',
      postLocation: targetStation.name,
      keysCount: targetStation.equipment.keysCount,
      radiosCount: targetStation.equipment.radiosCount,
      equipmentVerified: equipmentChecked,
      notes: handoverNotes.trim(),
      timestamp: timestampStr,
      signedAt: timestampStr,
    };

    setShiftHandovers([newHandoverRecord, ...shiftHandovers]);

    // Update local gate stations state
    const updated = gateStations.map((st) => {
      if (st.id === targetGateId) {
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
    setGateStations(updated);

    setIsHandoverOpen(false);
    showAppToast(
      `Shift handover confirmed for ${targetStation.name}. ${incomingOfficerName} is now ON DUTY.`,
      'success',
      'Shift Handover Executed'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Ticking Real-Time Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              Gate Stations & Officer Shift Roster
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold tracking-wider">
              Real-Time Sync
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Live gate assignments, on-duty security officers, upcoming shift changeovers, and station equipment
          </p>
        </div>

        {/* Live Clock Ticker */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 px-3.5 rounded-xl border border-border-neutral bg-surface shadow-2xs flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                Live System Clock
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-ink">
                {currentTime
                  ? `${currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`
                  : 'Real-Time Sync Committed'}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="cursor-pointer font-bold text-xs flex items-center gap-1.5 shadow-xs"
            onClick={() => {
              setTargetGateId('gate-1');
              setIsHandoverOpen(true);
            }}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Execute Shift Handover</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-2xs">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Gate Stations</span>
          <p className="text-2xl font-bold font-display text-ink mt-1">4 / 4 Active</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" /> 100% Perimeter Guarded
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-2xs">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Officers On-Duty</span>
          <p className="text-2xl font-bold font-display text-brand mt-1">
            {liveStations.length} Officers
          </p>
          <span className="text-[11px] text-ink-muted mt-0.5 block">
            All posts fully manned
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-2xs">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Upcoming Relief</span>
          <p className="text-2xl font-bold font-display text-purple-600 dark:text-purple-400 mt-1">
            4 Relieving
          </p>
          <span className="text-[11px] text-ink-muted mt-0.5 block">
            Scheduled at 15:00 / 23:00
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border-neutral bg-surface shadow-2xs">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Today Traffic</span>
          <p className="text-2xl font-bold font-display text-ink mt-1">
            {liveStations.reduce((acc, curr) => acc + curr.todayEntries, 0)} Entries
          </p>
          <span className="text-[11px] text-ink-muted mt-0.5 block">
            Vehicles & visitors cleared
          </span>
        </div>
      </div>

      {/* Search & Station Selector */}
      <div className="p-4 rounded-xl border border-border-neutral bg-surface space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by officer name, badge # (e.g. SEC-801), gate station, or shift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-muted border border-border-neutral text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Gates (4)' },
              { id: 'gate-1', label: 'Gate 1 (Main)' },
              { id: 'gate-2', label: 'Gate 2 (Service)' },
              { id: 'gate-3', label: 'Gate 3 (Clubhouse)' },
              { id: 'gate-4', label: 'Control Room' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStation(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedStation === tab.id
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Gate Stations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredStations.map((station) => (
          <Card
            key={station.id}
            className="border border-border-neutral bg-surface hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border-subtle bg-surface-muted/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base sm:text-lg font-bold text-ink">
                        {station.name}
                      </CardTitle>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE POST
                      </span>
                    </div>
                    <CardDescription className="text-xs text-ink-muted mt-0.5">
                      {station.locationTag}
                    </CardDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0 cursor-pointer border-brand/40 text-brand hover:bg-brand/10"
                  onClick={() => handleOpenHandover(station)}
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  <span>Relieve / Handover</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              {/* CURRENT OFFICER ON DUTY */}
              <div className="p-3.5 rounded-xl border border-brand/20 bg-brand/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-brand font-bold text-xs uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>Current Guard on Duty</span>
                  </div>
                  <Badge variant="brand" className="text-[10px] font-mono">
                    {station.currentOfficer.shift}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div>
                    <h4 className="text-sm font-bold text-ink">
                      {station.currentOfficer.name}
                    </h4>
                    <p className="text-[11px] text-ink-muted">
                      Badge: <span className="font-mono font-semibold text-brand">{station.currentOfficer.badge}</span> · {station.currentOfficer.role}
                    </p>
                  </div>

                  <a
                    href={`tel:${station.currentOfficer.phone}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border-neutral text-ink hover:text-brand text-xs font-semibold self-start sm:self-auto"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-brand" />
                    <span>{station.currentOfficer.phone}</span>
                  </a>
                </div>

                {station.currentOfficer.relievedOfficer && (
                  <div className="pt-2 border-t border-brand/15 text-[11px] text-ink-muted flex items-center justify-between flex-wrap gap-1">
                    <span>
                      Relieved: <strong className="text-ink">{station.currentOfficer.relievedOfficer}</strong>
                    </span>
                    <span className="font-mono text-[10px]">
                      Checked-in: {station.currentOfficer.checkedInAt}
                    </span>
                  </div>
                )}
              </div>

              {/* NEXT OFFICER COMING ON SHIFT */}
              <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Next Officer Coming to Shift</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    Scheduled: {station.nextOfficer.scheduledTime}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div>
                    <h4 className="text-sm font-bold text-ink">
                      {station.nextOfficer.name}
                    </h4>
                    <p className="text-[11px] text-ink-muted">
                      Badge: <span className="font-mono font-semibold text-purple-700 dark:text-purple-300">{station.nextOfficer.badge}</span> · {station.nextOfficer.shift}
                    </p>
                  </div>

                  <span className="text-[11px] font-medium text-ink-muted bg-surface px-2.5 py-1 rounded-lg border border-border-neutral self-start sm:self-auto">
                    ETA: ~{station.nextOfficer.etaMinutes} mins
                  </span>
                </div>
              </div>

              {/* STATION EQUIPMENT & LOGISTICS */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-surface-muted border border-border-subtle text-center">
                  <span className="text-[10px] font-medium text-ink-muted block">Keys in Custody</span>
                  <span className="text-sm font-mono font-bold text-ink">
                    🔑 {station.equipment.keysCount} Keys
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-muted border border-border-subtle text-center">
                  <span className="text-[10px] font-medium text-ink-muted block">UHF Radios</span>
                  <span className="text-sm font-mono font-bold text-ink">
                    📻 {station.equipment.radiosCount} Units
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-muted border border-border-subtle text-center">
                  <span className="text-[10px] font-medium text-ink-muted block">Today Passages</span>
                  <span className="text-sm font-mono font-bold text-brand">
                    🚗 {station.todayEntries} Vehicles
                  </span>
                </div>
              </div>

              {/* LAST HANDOVER LOGBOOK NOTE */}
              {station.lastHandoverNotes && (
                <div className="p-2.5 rounded-lg bg-surface-muted/60 border border-border-neutral text-[11px] text-ink-muted">
                  <span className="font-bold text-ink">Logbook Note:</span> {station.lastHandoverNotes}
                  <div className="mt-1 text-[10px] text-ink-muted/80 font-mono">
                    Last signed: {station.lastHandoverTime}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shift Handover Modal */}
      {isHandoverOpen && (
        <Dialog open={isHandoverOpen} onOpenChange={setIsHandoverOpen}>
          <DialogContent
            hideCloseButton={true}
            className="w-[95vw] max-w-lg p-0 max-h-[88vh] flex flex-col overflow-hidden border border-border-neutral shadow-2xl rounded-2xl bg-surface"
          >
            <div className="p-4 sm:p-5 bg-surface border-b border-border-neutral flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-ink">
                    Station Shift Handover Execution
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Transfer custody of gate station, keys, and security radio units
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-surface-muted cursor-pointer"
                onClick={() => setIsHandoverOpen(false)}
              >
                <X className="w-4 h-4 text-ink-muted hover:text-ink" />
              </Button>
            </div>

            <form onSubmit={handleHandoverSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 overscroll-contain">
                <div>
                  <label className="block font-semibold text-ink mb-1">
                    Select Gate Station:
                  </label>
                  <select
                    value={targetGateId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setTargetGateId(id);
                      const st = liveStations.find((s) => s.id === id);
                      if (st) {
                        setOutgoingOfficerName(st.currentOfficer.name);
                        setIncomingOfficerName(st.nextOfficer.name);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {liveStations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink mb-1">
                      Outgoing Guard (Relieved):
                    </label>
                    <input
                      type="text"
                      required
                      value={outgoingOfficerName}
                      onChange={(e) => setOutgoingOfficerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">
                      Incoming Guard (Taking Post):
                    </label>
                    <input
                      type="text"
                      required
                      value={incomingOfficerName}
                      onChange={(e) => setIncomingOfficerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">
                    Handover Notes & Logbook Observations:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Note down any ongoing contractor works, pending visitor packages, or barrier status..."
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="eqCheck"
                    checked={equipmentChecked}
                    onChange={(e) => setEquipmentChecked(e.target.checked)}
                    className="h-4 w-4 rounded text-brand focus:ring-brand cursor-pointer"
                  />
                  <label htmlFor="eqCheck" className="text-xs text-ink cursor-pointer">
                    I verify all station boom barrier keys, UHF walkie-talkie units, and visitor tablets are physically accounted for without damage.
                  </label>
                </div>
              </div>

              <div className="p-4 bg-surface-muted/50 border-t border-border-neutral flex items-center justify-end gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHandoverOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!equipmentChecked}
                  className="font-bold text-xs"
                >
                  Sign & Confirm Handover
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
