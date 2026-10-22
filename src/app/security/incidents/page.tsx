'use client';

import * as React from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Flame,
  HeartPulse,
  ShieldAlert,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  X,
  Plus,
  Radio,
  UserCheck,
  Send,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { StatusBadge } from '@/components/ui/status-badge';

export interface Incident {
  id: string;
  number: string;
  incidentNumber?: string;
  category: 'ELEVATOR' | 'SECURITY' | 'FIRE' | 'MEDICAL' | 'WATER_LEAK';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  location: string;
  description: string;
  status: 'PENDING' | 'REPORTED' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';
  time: string;
  timestamp?: string;
  reportedBy: string;
  guardAssigned: string;
  assignedTo?: string;
  dispatchNotes: string;
  resolutionNotes?: string;
}

export const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    number: 'INC-2026-001',
    incidentNumber: 'INC-2026-001',
    category: 'ELEVATOR',
    severity: 'HIGH',
    location: 'Tower B · Lift 2',
    description: 'Passenger lift stopped between 4th and 5th floor. Two residents reported inside with ventilation operational.',
    status: 'ACKNOWLEDGED',
    time: '18 mins ago',
    timestamp: 'Today, 14:32',
    reportedBy: 'Resident Aarav Sharma (A-402)',
    guardAssigned: 'Duty Guard Ramesh + Otis Emergency Tech',
    assignedTo: 'Officer Ramesh Kumar + Otis Tech',
    dispatchNotes: 'Technician on-site. Manual rescue brake release in progress. Guard stationed at Level 4.',
  },
  {
    id: 'inc-2',
    number: 'INC-2026-003',
    incidentNumber: 'INC-2026-003',
    category: 'SECURITY',
    severity: 'MEDIUM',
    location: 'North Boundary Wall · Zone 3',
    description: 'Suspicious motion sensor alarm triggered near perimeter fence. Beam cut warning flagged by CCTV camera 04.',
    status: 'RESOLVED',
    time: 'Yesterday, 23:45',
    timestamp: 'Yesterday, 23:45',
    reportedBy: 'Perimeter Sensor System',
    guardAssigned: 'Patrol Guard Dilip Jha',
    assignedTo: 'Officer Dilip Jha',
    dispatchNotes: 'Physical search completed. Stray animal triggered optical tripwire. Perimeter verified clear.',
    resolutionNotes: 'Perimeter physically searched and confirmed secure.',
  },
  {
    id: 'inc-3',
    number: 'INC-2026-004',
    incidentNumber: 'INC-2026-004',
    category: 'WATER_LEAK',
    severity: 'LOW',
    location: 'Tower A · Basement -1 Parking',
    description: 'Fire sprinkler secondary line valve weeping minor water droplets near Pillar B-12.',
    status: 'DISPATCHED',
    time: '45 mins ago',
    timestamp: 'Today, 13:15',
    reportedBy: 'Tower Guard Vikas',
    guardAssigned: 'Plumber Mahendra',
    assignedTo: 'Plumber Mahendra',
    dispatchNotes: 'Valve isolated. Maintenance gasket replacement scheduled.',
  },
];

export default function SecurityIncidentsPage() {
  const [incidents, setIncidents] = useSyncStore<Incident[]>(
    'societyos_admin_incidents',
    DEFAULT_INCIDENTS
  );
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [newIncident, setNewIncident] = React.useState({
    category: 'SECURITY' as Incident['category'],
    severity: 'HIGH' as Incident['severity'],
    location: '',
    description: '',
    reportedBy: 'Security Operations Desk',
  });

  const handleStatusChange = (id: string, newStatus: Incident['status']) => {
    const updated = incidents.map((inc) =>
      inc.id === id ? { ...inc, status: newStatus } : inc
    );
    setIncidents(updated);
    if (selectedIncident?.id === id) {
      setSelectedIncident({ ...selectedIncident, status: newStatus });
    }
    showAppToast(`Incident status updated to ${newStatus}.`, 'info', 'Status Updated');
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.location || !newIncident.description) {
      showAppToast('Please fill in location and description', 'warning');
      return;
    }

    const num = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const created: Incident = {
      id: `inc-${Date.now()}`,
      number: num,
      incidentNumber: num,
      category: newIncident.category,
      severity: newIncident.severity,
      location: newIncident.location,
      description: newIncident.description,
      status: 'PENDING',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: `${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · ${nowTime}`,
      reportedBy: newIncident.reportedBy,
      guardAssigned: 'Unassigned',
      assignedTo: 'Unassigned',
      dispatchNotes: 'Incident newly reported. Standby for guard coordinator dispatch.',
    };

    setIncidents([created, ...incidents]);
    setIsReportOpen(false);
    setNewIncident({
      category: 'SECURITY',
      severity: 'HIGH',
      location: '',
      description: '',
      reportedBy: 'Security Operations Desk',
    });
    showAppToast(`Incident ${num} dispatched and synced with Admin panel in real time.`, 'success', 'Incident Dispatched');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Active Incident & SOS Response Console
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Emergency alarms, guard dispatch coordinator, and resident panic button monitor
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsReportOpen(true)}
            className="bg-brand text-white hover:bg-brand-emphasis font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Incident</span>
          </Button>

          <a
            href="tel:112"
            className="px-3.5 py-2 rounded-xl bg-emergency text-white text-xs font-bold shadow-xs hover:bg-emergency/90 transition-colors flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Police / Fire (112)</span>
          </a>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Click any incident card below to inspect full dispatch details & update resolution status.</span>
          <span>Showing <strong>{incidents.length}</strong> recorded events</span>
        </div>

        {incidents.map((inc) => (
          <Card
            key={inc.id}
            onClick={() => setSelectedIncident(inc)}
            className={`border transition-all cursor-pointer group ${
              inc.status !== 'RESOLVED'
                ? 'border-emergency/60 bg-surface shadow-md hover:border-emergency'
                : 'border-border-neutral bg-surface opacity-85 hover:opacity-100 hover:border-brand/40'
            }`}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    inc.severity === 'HIGH' || inc.severity === 'CRITICAL'
                      ? 'bg-emergency text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">{inc.number}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        inc.severity === 'HIGH' || inc.severity === 'CRITICAL'
                          ? 'bg-emergency-subtle text-emergency border-emergency/30'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] font-bold text-ink-subtle uppercase px-1.5 py-0.2 rounded bg-surface-muted border border-border-subtle">
                        {inc.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-ink text-base mt-0.5 group-hover:text-brand transition-colors">
                      {inc.location}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">{inc.time}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      inc.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : inc.status === 'DISPATCHED'
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                        : inc.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-emergency-subtle text-emergency border-emergency/30'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink leading-relaxed font-medium">
                {inc.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border-subtle/60 text-xs text-ink-muted">
                <div className="flex items-center gap-4">
                  <span>Reporter: <strong className="text-ink">{inc.reportedBy}</strong></span>
                  <span>Assigned: <strong className="text-brand">{inc.guardAssigned}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-brand font-semibold group-hover:underline flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> View Incident Dossier →
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
          <DialogContent className="max-w-lg bg-surface border-border-neutral text-ink">
            <DialogHeader>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                    {selectedIncident.number}
                  </span>
                  <DialogTitle className="text-xl font-bold font-display text-ink">
                    {selectedIncident.location}
                  </DialogTitle>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    selectedIncident.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-emergency-subtle text-emergency border-emergency/30'
                  }`}
                >
                  {selectedIncident.status}
                </span>
              </div>
              <DialogDescription className="text-ink-muted text-xs">
                Emergency response ledger, guard dispatch coordinate, and resolution audit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                  <span className="text-ink-subtle uppercase text-[10px] font-bold">Severity Level</span>
                  <p className="font-bold text-emergency mt-0.5">{selectedIncident.severity}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                  <span className="text-ink-subtle uppercase text-[10px] font-bold">Category</span>
                  <p className="font-bold text-ink mt-0.5">{selectedIncident.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                  <span className="text-ink-subtle uppercase text-[10px] font-bold">Reported By</span>
                  <p className="font-bold text-ink mt-0.5">{selectedIncident.reportedBy}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                  <span className="text-ink-subtle uppercase text-[10px] font-bold">Assigned Responder</span>
                  <p className="font-bold text-brand mt-0.5">{selectedIncident.guardAssigned}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                <span className="text-ink-subtle uppercase text-[10px] font-bold">Incident Briefing</span>
                <p className="text-ink mt-0.5 leading-relaxed font-medium">{selectedIncident.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                <span className="text-ink-subtle uppercase text-[10px] font-bold">Dispatch & Rescue Action Notes</span>
                <p className="text-ink mt-0.5 leading-relaxed">{selectedIncident.dispatchNotes}</p>
              </div>

              {/* Status View Only - Locked to Central Admin */}
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border-neutral space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-brand" />
                    <span>Live Operational Status (Real-Time Sync)</span>
                  </span>
                  <StatusBadge status={selectedIncident.status} />
                </div>

                {selectedIncident.status === 'RESOLVED' ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Incident Formally Resolved & Closed by Central Command</span>
                    </div>
                    {selectedIncident.resolutionNotes && (
                      <p className="text-[11px] text-ink-muted">
                        Official Notes: {selectedIncident.resolutionNotes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                      <span>Incident In-Progress · Status: {selectedIncident.status}</span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Ground responders dispatched. Live updates from Estate Administration sync to this terminal automatically.
                    </p>
                  </div>
                )}

                <div className="p-2 rounded bg-surface border border-border-subtle text-[11px] text-ink-muted flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
                  <span>
                    Status control is restricted to Central Administration Command. Security Officers have live telemetry view-only clearance.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border-subtle">
                <Button variant="secondary" onClick={() => setSelectedIncident(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Report New Incident Modal */}
      {isReportOpen && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-md bg-surface border-border-neutral text-ink">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-display text-ink">
                Report Life-Safety or Security Incident
              </DialogTitle>
              <DialogDescription className="text-ink-muted text-xs">
                Broadcast an active incident to security patrol guards and campus command.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateIncident} className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-ink mb-1">Incident Category</label>
                  <select
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value as Incident['category'] })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="SECURITY">Security / Intrusion</option>
                    <option value="ELEVATOR">Elevator Trap / Stalled</option>
                    <option value="FIRE">Fire / Smoke Alarm</option>
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="WATER_LEAK">Plumbing / Water Leak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Severity Level</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as Incident['severity'] })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="CRITICAL">CRITICAL (Life Safety)</option>
                    <option value="HIGH">HIGH (Urgent Response)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW (Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Exact Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower C · Lift 1 or Basement B-2"
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Description & Immediate Action Needed *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the nature of the emergency and observed details..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-neutral text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border-subtle">
                <Button type="button" variant="outline" onClick={() => setIsReportOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="emergency" className="font-bold">
                  Dispatch Emergency Alert
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
