'use client';

import * as React from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  PhoneCall,
  Flame,
  HeartPulse,
  ShieldAlert,
  ArrowUpDown,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

interface Incident {
  id: string;
  incidentNumber: string;
  number?: string;
  category: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'ELEVATOR' | 'GAS_LEAK' | 'WATER_LEAK' | 'OTHER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  reportedBy: string;
  description: string;
  status: 'REPORTED' | 'PENDING' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';
  assignedTo?: string;
  guardAssigned?: string;
  timestamp: string;
  time?: string;
  resolutionNotes?: string;
}

const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    incidentNumber: 'INC-2026-001',
    category: 'ELEVATOR',
    severity: 'HIGH',
    location: 'Tower B · Passenger Lift 2 (Between Fl 4 & 5)',
    reportedBy: 'Resident Priya Nambiar (A-201)',
    description: 'Passenger lift stopped between 4th and 5th floors with 2 passengers inside. Alarm bell pressed.',
    status: 'ACKNOWLEDGED',
    assignedTo: 'Officer Ramesh Kumar + Otis Technician',
    timestamp: '18 mins ago',
  },
  {
    id: 'inc-2',
    incidentNumber: 'INC-2026-002',
    category: 'MEDICAL',
    severity: 'CRITICAL',
    location: 'Block A · Unit A-101',
    reportedBy: 'Dr. Suresh Mehta',
    description: 'Elderly occupant chest discomfort. On-site first-aid dispatched while 108 ambulance was summoned.',
    status: 'RESOLVED',
    assignedTo: 'Officer Vikram Singh',
    timestamp: '2 hours ago',
    resolutionNotes: 'Ambulance arrived at 14:12. Patient stabilized and transferred to Apollo Hospital accompanied by family.',
  },
  {
    id: 'inc-3',
    incidentNumber: 'INC-2026-003',
    category: 'SECURITY',
    severity: 'MEDIUM',
    location: 'North Perimeter Fence near Tower A',
    reportedBy: 'Patrol Guard Dilip Jha',
    description: 'Unidentified individual attempted to scale north perimeter wall. Fled when spotlight activated.',
    status: 'RESOLVED',
    assignedTo: 'Officer Dilip Jha',
    timestamp: 'Yesterday, 23:45',
    resolutionNotes: 'Perimeter checked, additional barbed wire inspection scheduled with facility manager.',
  },
];

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useSyncStore<Incident[]>(
    'societyos_admin_incidents',
    DEFAULT_INCIDENTS
  );

  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [filterCategory, setFilterCategory] = React.useState<string>('ALL');
  const [filterLocation, setFilterLocation] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [newIncident, setNewIncident] = React.useState({
    category: 'SECURITY' as Incident['category'],
    severity: 'HIGH' as Incident['severity'],
    location: '',
    description: '',
    reportedBy: 'Estate Admin Command',
  });

  // Poll for MongoDB backend incidents to merge resident SOS alerts in real time
  React.useEffect(() => {
    const fetchApiIncidents = async () => {
      try {
        const res = await fetch('/api/emergency/incidents?all=true');
        if (!res.ok) return;
        const data = await res.json();
        if (data.incidents && Array.isArray(data.incidents)) {
          setIncidents((current) => {
            const currentIds = new Set(current.map((i) => i.id || i.incidentNumber));
            const newToAdd: Incident[] = [];
            data.incidents.forEach((apiInc: any) => {
              const id = apiInc._id || apiInc.id || apiInc.incidentNumber;
              if (!currentIds.has(id)) {
                newToAdd.push({
                  id,
                  incidentNumber: apiInc.incidentNumber || `INC-${id.slice(-4)}`,
                  number: apiInc.incidentNumber,
                  category: apiInc.category || 'OTHER',
                  severity: apiInc.severity || 'HIGH',
                  location: apiInc.locationDescription || `Unit ${apiInc.unitId || 'Campus'}`,
                  reportedBy: apiInc.reporterName || 'Resident SOS Alert',
                  description: apiInc.description || 'Emergency alert triggered from Resident App',
                  status: apiInc.status === 'ACTIVE' ? 'REPORTED' : apiInc.status === 'RESOLVED' ? 'RESOLVED' : 'ACKNOWLEDGED',
                  assignedTo: apiInc.assignedResponder?.name || 'Duty Security Guard',
                  guardAssigned: apiInc.assignedResponder?.name || 'Duty Security Guard',
                  timestamp: apiInc.createdAt ? new Date(apiInc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                  time: 'Recently',
                  resolutionNotes: apiInc.resolutionNotes,
                });
              }
            });
            return newToAdd.length > 0 ? [...newToAdd, ...current] : current;
          });
        }
      } catch {}
    };

    fetchApiIncidents();
    const interval = setInterval(fetchApiIncidents, 5000);
    return () => clearInterval(interval);
  }, [setIncidents]);

  // Sort latest incident first
  const sortedIncidents = React.useMemo(() => {
    return [...incidents].sort((a, b) => {
      const idA = a.id || '';
      const idB = b.id || '';
      const timeNumA = idA.startsWith('inc-') ? parseInt(idA.replace('inc-', '')) || 0 : 0;
      const timeNumB = idB.startsWith('inc-') ? parseInt(idB.replace('inc-', '')) || 0 : 0;
      if (timeNumA && timeNumB) return timeNumB - timeNumA;
      return (b.incidentNumber || '').localeCompare(a.incidentNumber || '');
    });
  }, [incidents]);

  const filtered = sortedIncidents.filter((inc) => {
    const matchesSev = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    const matchesStatus =
      statusFilter === 'ALL' ||
      inc.status === statusFilter ||
      (statusFilter === 'REPORTED' && (inc.status === 'REPORTED' || inc.status === 'PENDING'));
    const matchesCategory = filterCategory === 'ALL' || inc.category === filterCategory;
    const matchesLocation =
      filterLocation === 'ALL' ||
      inc.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      inc.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSev && matchesStatus && matchesCategory && matchesLocation && matchesSearch;
  });

  const handleResolve = async (id: string, notes: string) => {
    const updated = incidents.map((i) =>
      i.id === id ? { ...i, status: 'RESOLVED' as const, resolutionNotes: notes } : i
    );
    setIncidents(updated);
    setSelectedIncident(null);

    // Save resolution to MongoDB in background
    try {
      await fetch('/api/emergency/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: id,
          status: 'RESOLVED',
          resolutionNotes: notes,
        }),
      });
    } catch {}

    showAppToast(`Incident marked as RESOLVED and permanently recorded.`, 'success', 'Incident Resolved');
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.location.trim() || !newIncident.description.trim()) {
      showAppToast('Please provide location and description.', 'warning');
      return;
    }

    const num = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const created: Incident = {
      id: `inc-${Date.now()}`,
      incidentNumber: num,
      number: num,
      category: newIncident.category,
      severity: newIncident.severity,
      location: newIncident.location.trim(),
      reportedBy: newIncident.reportedBy.trim(),
      description: newIncident.description.trim(),
      status: 'REPORTED',
      assignedTo: 'Estate Safety Coordinator',
      guardAssigned: 'Estate Safety Coordinator',
      timestamp: `${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${nowTime}`,
      time: `${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${nowTime}`,
    };

    setIncidents([created, ...incidents]);
    setIsReportOpen(false);

    // Persist to MongoDB
    try {
      await fetch('/api/emergency/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newIncident.category,
          severity: newIncident.severity,
          location: newIncident.location.trim(),
          description: newIncident.description.trim(),
          reportedBy: newIncident.reportedBy.trim(),
        }),
      });
    } catch {}

    setNewIncident({
      category: 'SECURITY',
      severity: 'HIGH',
      location: '',
      description: '',
      reportedBy: 'Estate Admin Command',
    });
    showAppToast(`Incident ${num} successfully logged and dispatched to Security Roster.`, 'success', 'Incident Recorded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Emergency & Incident Command Log
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Durable life-safety incident persistence, responder triage, and authoritative resolution records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsReportOpen(true)}
            className="bg-brand text-white hover:bg-brand-emphasis font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Incident</span>
          </Button>

          <a
            href="tel:112"
            className="px-3.5 py-2 rounded-xl bg-emergency text-white text-xs font-bold shadow-xs hover:bg-emergency/90 transition-colors flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>National Emergency (112)</span>
          </a>
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="p-4 rounded-xl border border-border-neutral bg-surface space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by incident #, description, unit, location, or reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-border-neutral text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-surface border border-border-neutral text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="ALL">All Categories</option>
            <option value="SECURITY">Security / Intrusion</option>
            <option value="ELEVATOR">Elevator / Lift</option>
            <option value="MEDICAL">Medical Emergency</option>
            <option value="FIRE">Fire & Smoke</option>
            <option value="WATER_LEAK">Water Leak / Plumbing</option>
            <option value="GAS_LEAK">Gas Leak</option>
            <option value="OTHER">Other Life-Safety</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-surface border border-border-neutral text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="ALL">All Locations / Towers</option>
            <option value="Tower A">Tower A</option>
            <option value="Tower B">Tower B</option>
            <option value="Clubhouse">Clubhouse</option>
            <option value="Gate 1">Gate 1 (Main)</option>
            <option value="Gate 2">Gate 2 (Service)</option>
            <option value="Basement">Basement Parking</option>
          </select>
        </div>

        {/* Filter Pills: Status & Severity */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-ink-muted mr-1">Status:</span>
            {(['ALL', 'REPORTED', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-brand text-white border-brand shadow-2xs font-bold'
                    : 'bg-surface text-ink-muted border-border-neutral hover:text-ink'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-ink-muted mr-1">Severity:</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  filterSeverity === sev
                    ? 'bg-ink text-white border-ink shadow-2xs font-bold'
                    : 'bg-surface text-ink-muted border-border-neutral hover:text-ink'
                }`}
              >
                {sev === 'ALL' ? 'All' : sev}
              </button>
            ))}

            {(statusFilter !== 'ALL' || filterSeverity !== 'ALL' || filterCategory !== 'ALL' || filterLocation !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setFilterSeverity('ALL');
                  setFilterCategory('ALL');
                  setFilterLocation('ALL');
                  setSearchQuery('');
                }}
                className="text-[11px] text-emergency hover:underline font-bold ml-2 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
          <span>
            Showing <strong className="text-ink">{filtered.length}</strong> of {incidents.length} incidents (sorted newest first)
          </span>
          <span className="font-mono text-[10px]">Real-time MongoDB Sync Active</span>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {filtered.map((inc) => {
          const isCritical = inc.severity === 'CRITICAL';
          const isHigh = inc.severity === 'HIGH';

          return (
            <Card
              key={inc.id}
              className={`border transition-all hover:shadow-xs cursor-pointer ${
                inc.status === 'REPORTED'
                  ? 'border-emergency/60 bg-emergency-subtle/30'
                  : 'border-border-neutral bg-surface'
              }`}
              onClick={() => setSelectedIncident(inc)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCritical
                          ? 'bg-emergency text-white animate-pulse'
                          : isHigh
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {inc.category === 'MEDICAL' && <HeartPulse className="w-5 h-5" />}
                      {inc.category === 'ELEVATOR' && <ArrowUpDown className="w-5 h-5" />}
                      {inc.category === 'SECURITY' && <ShieldAlert className="w-5 h-5" />}
                      {inc.category === 'FIRE' && <Flame className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand">{inc.incidentNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            isCritical
                              ? 'bg-emergency-subtle text-emergency border-emergency/30'
                              : isHigh
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <p className="font-bold text-ink text-sm sm:text-base mt-0.5">{inc.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-muted">{inc.timestamp}</span>
                    <StatusBadge status={inc.status} />
                  </div>
                </div>

                <div className="pt-3 text-xs text-ink-muted space-y-1.5">
                  <p className="text-ink font-medium leading-relaxed">{inc.description}</p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
                    <span>Reported by: <strong className="text-ink">{inc.reportedBy}</strong></span>
                    {inc.assignedTo && (
                      <span>Responder: <strong className="text-brand">{inc.assignedTo}</strong></span>
                    )}
                  </div>
                  {inc.resolutionNotes && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Resolved Record:</strong> {inc.resolutionNotes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Incident Detail & Resolution Modal */}
      {selectedIncident && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedIncident(null)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div>
                <span className="font-mono text-xs font-bold text-brand">{selectedIncident.incidentNumber}</span>
                <h3 className="text-base font-bold text-ink">{selectedIncident.location}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Category:</span>
                  <span className="font-bold text-ink">{selectedIncident.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Severity:</span>
                  <span className="font-bold text-emergency">{selectedIncident.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Reported By:</span>
                  <span className="text-ink">{selectedIncident.reportedBy}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted/50 border border-border-neutral">
                <span className="text-ink-muted block font-semibold mb-1">Description:</span>
                <p className="text-ink leading-relaxed">{selectedIncident.description}</p>
              </div>

              {selectedIncident.resolutionNotes && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold block mb-1">Resolution Audit Notes:</span>
                  <p>{selectedIncident.resolutionNotes}</p>
                </div>
              )}
            </div>

            {selectedIncident.status !== 'RESOLVED' ? (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedIncident(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() =>
                    handleResolve(
                      selectedIncident.id,
                      `Incident verified resolved by on-duty administrator at ${new Date().toLocaleTimeString()}.`
                    )
                  }
                >
                  Mark as Resolved
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedIncident(null)}
              >
                Close Record
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Report New Incident Modal */}
      {isReportOpen && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-md bg-surface border-border-neutral text-ink">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emergency" />
                <DialogTitle className="text-lg font-bold font-display text-ink">
                  Log Campus Incident or Emergency
                </DialogTitle>
              </div>
              <DialogDescription className="text-ink-muted text-xs">
                Authoritative life-safety command log. Dispatches to on-duty security roster immediately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateIncident} className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-ink mb-1">Category</label>
                  <select
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value as Incident['category'] })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="SECURITY">Security / Intrusion</option>
                    <option value="ELEVATOR">Elevator Trap / Stalled</option>
                    <option value="FIRE">Fire / Smoke Alarm</option>
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="WATER_LEAK">Water Leak / Plumbing</option>
                    <option value="GAS_LEAK">Gas Leak</option>
                    <option value="OTHER">Other Life-Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Severity Level</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as Incident['severity'] })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="CRITICAL">CRITICAL (Life-Safety)</option>
                    <option value="HIGH">HIGH (Urgent)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW (Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Exact Campus Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower A Lift Lobby, Basement 1, or Gate 2"
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Reporting Officer / Authority *</label>
                <input
                  type="text"
                  required
                  value={newIncident.reportedBy}
                  onChange={(e) => setNewIncident({ ...newIncident, reportedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Incident Description & Observed Facts *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe observed hazards, trapped occupants, or immediate responder actions..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border-neutral">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsReportOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Persist & Dispatch Incident
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
