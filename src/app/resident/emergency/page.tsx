'use client';

import * as React from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Flame,
  HeartPulse,
  ShieldAlert,
  ArrowUpDown,
  Wind,
  HelpCircle,
  Clock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { broadcastSync } from '@/lib/sync-store';

interface Incident {
  _id: string;
  incidentNumber: string;
  category: string;
  severity: string;
  locationDescription: string;
  description: string;
  status: string;
  assignedResponder?: { name: string; assignedAt: string };
  resolutionNotes?: string;
  createdAt: string;
}

export default function ResidentEmergencyPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form
  const [category, setCategory] = React.useState<string>('MEDICAL');
  const [locationDescription, setLocationDescription] = React.useState('Flat 402, Block A');
  const [description, setDescription] = React.useState('');

  const fetchIncidents = React.useCallback(async () => {
    try {
      const res = await fetch('/api/emergency/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIncidents();
    // 5-second resilient polling
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleTriggerSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the emergency situation');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          locationDescription,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch SOS');
      }

      setSuccessMsg(data.message || 'EMERGENCY ALERT PERSISTED & DISPATCHED');
      setDescription('');
      fetchIncidents();

      // Immediately sync with Admin and Security Incident stores in real-time
      if (data.incident) {
        try {
          const raw = localStorage.getItem('societyos_admin_incidents');
          const list = raw ? JSON.parse(raw) : [];
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newAdminInc = {
            id: data.incident._id || `inc-${Date.now()}`,
            incidentNumber: data.incident.incidentNumber || `INC-${Math.floor(100 + Math.random() * 900)}`,
            number: data.incident.incidentNumber,
            category: data.incident.category || category,
            severity: 'CRITICAL',
            location: locationDescription || 'Resident Unit A-402',
            reportedBy: 'Resident Aarav Sharma (A-402)',
            description: description,
            status: 'REPORTED',
            assignedTo: 'Duty Gate Officer + Quick Response Team',
            guardAssigned: 'Duty Gate Officer + Quick Response Team',
            timestamp: `Today, ${nowTime}`,
            time: `Today, ${nowTime}`,
          };
          const updated = [newAdminInc, ...list];
          localStorage.setItem('societyos_admin_incidents', JSON.stringify(updated));
          broadcastSync('societyos_admin_incidents', updated);
        } catch {}
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error sending alert');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'MEDICAL', label: 'Medical Emergency', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { id: 'FIRE', label: 'Fire Outbreak', icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { id: 'SECURITY', label: 'Security Threat / Intrusion', icon: ShieldAlert, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { id: 'LIFT_ENTRAPMENT', label: 'Lift Entrapment', icon: ArrowUpDown, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { id: 'GAS_LEAK', label: 'Gas Leak', icon: Wind, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { id: 'OTHER', label: 'Other Urgent Issue', icon: HelpCircle, color: 'text-neutral-600', bg: 'bg-neutral-50 border-neutral-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Critical Hotline Notice */}
      <div className="bg-[#FEF3F2] border-2 border-[#B42318] rounded-2xl p-6 text-[#B42318] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FECDCA] flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-6 h-6 text-[#B42318]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Life-Safety Notice & National Hotlines</h2>
              <p className="text-xs text-[#912018] mt-0.5">
                If lives or property are in immediate danger, dial official first responders directly. SocietyOS alerts compound security staff, but is not a substitute for certified 911 / 112 emergency dispatchers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="tel:112"
              className="px-5 py-2.5 bg-[#B42318] text-white rounded-xl font-bold text-sm hover:bg-[#912018] transition-colors shadow-sm flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 112 (National SOS)</span>
            </a>
          </div>
        </div>
      </div>

      {/* SOS Form Card */}
      <Card className="border-2 border-[#B42318]/30 overflow-hidden">
        <CardHeader className="bg-[#FEF3F2]/40 border-b border-[#D9DED8]">
          <div className="flex items-center gap-2 text-[#B42318]">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-xl">Trigger Emergency Security Alert</CardTitle>
          </div>
          <CardDescription>
            Submitting this form immediately alerts gate security officers and compound management with high-priority audio-visual alerts.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {successMsg && (
            <div className="p-4 mb-4 bg-[#E4ECE5] border border-[#276749] rounded-xl text-sm text-[#276749] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 mb-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-xl text-sm text-[#B42318] font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleTriggerSOS} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-[#17231D] uppercase tracking-wider block mb-2">
                1. Select Emergency Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-emergency bg-emergency-subtle ring-2 ring-emergency'
                          : 'border-border-neutral bg-surface hover:border-ink-muted'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-emergency' : cat.color}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-emergency' : 'text-ink'}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                2. Exact Location / Flat / Floor
              </label>
              <Input
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="e.g. Flat 402, Block A (or Staircase B 3rd Floor)"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                3. Situation Description & Immediate Hazards
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is happening: patient conscious? smoke or flames visible? persons trapped?"
                rows={3}
                required
                className="w-full px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-emergency"
              />
            </div>

            <Button
              type="submit"
              variant="emergency"
              size="lg"
              disabled={submitting}
              className="w-full py-4 text-base font-bold shadow-lg"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{submitting ? 'Transmitting Alert...' : 'DISPATCH EMERGENCY ALERT NOW'}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Incidents Tracking */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-3">My Reported Emergency Incidents</h2>
        {incidents.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border-neutral text-sm text-ink-muted">
            No emergency alerts reported.
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <Card key={inc._id} className="p-5 border-l-4 border-l-emergency border-border-neutral bg-surface text-ink shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-ink-muted">{inc.incidentNumber}</span>
                    <Badge variant="outline" className="font-bold text-emergency border-emergency/30 bg-emergency-subtle">
                      {inc.category}
                    </Badge>
                  </div>
                  <StatusBadge
                    status={
                      inc.status === 'RESOLVED' || inc.status === 'CLOSED'
                        ? 'operational'
                        : 'offline'
                    }
                    label={inc.status}
                  />
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-bold text-sm text-ink">{inc.description}</p>
                  <p className="text-ink-muted">Location: <span className="font-semibold text-ink">{inc.locationDescription}</span></p>

                  {inc.assignedResponder && (
                    <div className="p-3 bg-brand/10 rounded-lg text-brand font-medium flex items-center gap-2 border border-brand/20">
                      <UserCheck className="w-4 h-4 flex-shrink-0" />
                      <span>Assigned Security Responder: <strong>{inc.assignedResponder.name}</strong></span>
                    </div>
                  )}

                  {inc.resolutionNotes && (
                    <div className="p-3 bg-surface-muted rounded-lg text-ink border border-border-neutral">
                      <span className="font-bold">Resolution Report: </span>
                      <span>{inc.resolutionNotes}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-[#66716A] pt-1">
                    Reported at: {new Date(inc.createdAt).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
