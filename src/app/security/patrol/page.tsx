'use client';

import * as React from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Checkpoint {
  id: string;
  name: string;
  location: string;
  schedule: string;
  completed: boolean;
  lastChecked?: string;
  officer?: string;
}

const DEFAULT_CHECKPOINTS: Checkpoint[] = [
  {
    id: 'cp-1',
    name: 'North Boundary Perimeter Wall',
    location: 'Behind Tower B Boundary Fence',
    schedule: 'Every 2 Hours',
    completed: true,
    lastChecked: 'Today, 14:00',
    officer: 'Officer Dilip Jha',
  },
  {
    id: 'cp-2',
    name: 'Basement 1 Electrical Panel Room',
    location: 'Substation Deck · Pillar B-04',
    schedule: 'Every 3 Hours',
    completed: true,
    lastChecked: 'Today, 13:30',
    officer: 'Officer Ramesh Kumar',
  },
  {
    id: 'cp-3',
    name: 'Clubhouse Terrace & Overhead Tanks',
    location: 'Recreation Wing Rooftop Gate',
    schedule: 'Every 4 Hours',
    completed: false,
  },
  {
    id: 'cp-4',
    name: 'Basement 2 Fire Booster Pump Station',
    location: 'Pump Chamber South Corridors',
    schedule: 'Every 3 Hours',
    completed: false,
  },
  {
    id: 'cp-5',
    name: 'Gate 2 Pedestrian Turnstile & Intercom',
    location: 'South Perimeter Access Gate',
    schedule: 'Every 1 Hour',
    completed: false,
  },
];

export default function SecurityPatrolPage() {
  const [checkpoints, setCheckpoints] = React.useState<Checkpoint[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('societyos_security_patrol');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CHECKPOINTS;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('societyos_security_patrol', JSON.stringify(checkpoints));
    } catch {}
  }, [checkpoints]);

  const handleLogCheckpoint = (id: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = checkpoints.map((cp) =>
      cp.id === id
        ? {
            ...cp,
            completed: true,
            lastChecked: `Today, ${timeStr}`,
            officer: 'Officer Vikram Singh (On Duty)',
          }
        : cp
    );
    setCheckpoints(updated);
  };

  const handleResetShift = () => {
    if (!confirm('Reset all checkpoints for the next shift guard round?')) return;
    const reset = checkpoints.map((cp) => ({
      ...cp,
      completed: false,
      lastChecked: undefined,
      officer: undefined,
    }));
    setCheckpoints(reset);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Perimeter Patrol Checks & Sweeps
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Routine guard rounds, critical infrastructure checkpoints, and physical security logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleResetShift} className="text-xs text-ink-muted hover:text-ink">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset Round</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Progress:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/30">
              {checkpoints.filter((c) => c.completed).length} / {checkpoints.length} Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Checkpoints Grid */}
      <div className="space-y-3">
        {checkpoints.map((cp) => (
          <Card key={cp.id} className="border border-border-neutral bg-surface shadow-xs">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    cp.completed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-base">{cp.name}</h3>
                  <p className="text-xs text-ink-muted">{cp.location}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted mt-1">
                    <span>Frequency: <strong>{cp.schedule}</strong></span>
                    {cp.lastChecked && (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Cleared: <strong>{cp.lastChecked}</strong> ({cp.officer})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {cp.completed ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Checkpoint Cleared
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLogCheckpoint(cp.id)}
                  >
                    Log Patrol Check
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
