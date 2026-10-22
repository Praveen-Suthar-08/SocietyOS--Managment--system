'use client';

import * as React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Clock,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Incident {
  _id: string;
  incidentNumber: string;
  category: string;
  severity: string;
  unitId: string;
  reporterName: string;
  reporterPhone: string;
  locationDescription: string;
  description: string;
  status: string;
  assignedResponder?: { name: string };
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: { name: string };
  createdAt: string;
}

export default function AdminEmergencyPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [resolutionDialogOpen, setResolutionDialogOpen] = React.useState(false);
  const [resolutionNotes, setResolutionNotes] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const fetchIncidents = React.useCallback(async () => {
    try {
      const res = await fetch('/api/emergency/incidents?all=true');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      const res = await fetch(`/api/emergency/incidents/${selectedIncident._id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNotes }),
      });

      if (res.ok) {
        setResolutionDialogOpen(false);
        setResolutionNotes('');
        setSelectedIncident(null);
        fetchIncidents();
      }
    } catch {
      alert('Failed to resolve incident');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#17231D]">
            Emergency & Life-Safety Incident Management
          </h1>
          <p className="text-sm text-[#66716A] mt-0.5">
            Real-time society incidents command desk with responder assignment and immutable resolution auditing.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => {
          const count =
            tab === 'ALL'
              ? incidents.length
              : tab === 'ACTIVE'
              ? incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length
              : incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === tab
                  ? 'bg-brand text-white border-brand shadow-2xs font-bold'
                  : 'bg-surface text-ink-muted border-border-neutral hover:text-ink'
              }`}
            >
              {tab === 'ALL' ? 'All Incidents' : tab === 'ACTIVE' ? 'Active / In-Progress' : 'Resolved Archive'} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-[#66716A]">Loading emergency stream...</div>
        ) : (
          (() => {
            const displayList = incidents.filter((inc) => {
              if (filterStatus === 'ALL') return true;
              if (filterStatus === 'ACTIVE') return inc.status !== 'RESOLVED' && inc.status !== 'CLOSED';
              if (filterStatus === 'RESOLVED') return inc.status === 'RESOLVED' || inc.status === 'CLOSED';
              return true;
            });

            if (displayList.length === 0) {
              return (
                <Card className="p-8 text-center text-[#66716A]">
                  <CheckCircle2 className="w-10 h-10 text-[#276749] mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-[#17231D]">No incidents found</p>
                  <p className="text-xs text-[#66716A] mt-1">No emergency incidents matching filter &ldquo;{filterStatus}&rdquo;.</p>
                </Card>
              );
            }

            return displayList.map((inc) => {
              const isResolved = inc.status === 'RESOLVED' || inc.status === 'CLOSED';
              return (
                <Card
                  key={inc._id}
                  className={`p-6 border-l-4 space-y-4 transition-all ${
                    isResolved ? 'border-l-emerald-600 bg-emerald-50/15' : 'border-l-[#B42318]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#D9DED8] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#66716A]">{inc.incidentNumber}</span>
                      <Badge variant="outline" className={`font-bold ${isResolved ? 'text-emerald-700' : 'text-[#B42318]'}`}>
                        {inc.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Severity: {inc.severity}
                      </Badge>
                    </div>
                    <StatusBadge
                      status={isResolved ? 'operational' : 'offline'}
                      label={inc.status}
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-base text-[#17231D]">{inc.description}</p>
                    <div className="flex flex-wrap gap-4 text-[#66716A]">
                      <span>Unit: <strong className="text-[#17231D]">{inc.unitId}</strong></span>
                      <span>Location: <strong className="text-[#17231D]">{inc.locationDescription}</strong></span>
                      <span>Reporter: <strong className="text-[#17231D]">{inc.reporterName} ({inc.reporterPhone})</strong></span>
                      <span>Reported at: <strong className="text-[#17231D]">{new Date(inc.createdAt).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {inc.assignedResponder && (
                    <div className="p-3 bg-[#E4ECE5] rounded-lg text-xs text-[#276749] font-medium flex items-center gap-2">
                      <UserCheck className="w-4 h-4 flex-shrink-0" />
                      <span>On-scene responder: <strong>{inc.assignedResponder.name}</strong></span>
                    </div>
                  )}

                  {isResolved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-800 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Authoritative Resolution Record Filed
                        </span>
                        <span className="font-mono text-[11px] text-emerald-700">
                          {inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString() : 'Resolved'}
                        </span>
                      </div>
                      {inc.resolutionNotes && (
                        <p className="text-slate-700 italic pl-5">&ldquo;{inc.resolutionNotes}&rdquo;</p>
                      )}
                    </div>
                  )}

                  {!isResolved && (
                    <div className="flex gap-2 pt-2 border-t border-[#D9DED8]">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(inc);
                          setResolutionDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        <span>Complete Resolution Report</span>
                      </Button>
                    </div>
                  )}
                </Card>
              );
            });
          })()
        )}
      </div>

      {/* Resolution Dialog */}
      {selectedIncident && (
        <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
          <DialogContent className="max-w-md bg-surface border-border-neutral text-ink">
            <DialogHeader>
              <DialogTitle className="text-ink font-bold">Resolve Incident: {selectedIncident.incidentNumber}</DialogTitle>
              <DialogDescription className="text-ink-muted">
                Provide formal closing notes summarizing actions taken, first responder involvement, and compound status.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResolve} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-ink">Official Incident Resolution Summary</label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail responder findings, medical or technician interventions, and final safety verification..."
                  required
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setResolutionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Resolution
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
