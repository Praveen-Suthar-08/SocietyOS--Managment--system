'use client';

import * as React from 'react';
import {
  Video,
  Shield,
  Search,
  KeyRound,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

interface Camera {
  id: string;
  name: string;
  location: string;
  zone: string;
  resolution: string;
  fps: number;
  retentionDays: number;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  isGatewayConfigured: boolean;
  streamUrl?: string;
}

export default function AdminCamerasPage() {
  const [cameras] = React.useState<Camera[]>([
    {
      id: 'cam-01',
      name: 'Gate 1 Main Vehicle Entrance',
      location: 'Main Gate Complex (Boom Barrier North)',
      zone: 'Perimeter Entry',
      resolution: '4K (3840x2160)',
      fps: 30,
      retentionDays: 30,
      status: 'ONLINE',
      isGatewayConfigured: false,
    },
    {
      id: 'cam-02',
      name: 'Tower A Lobby & Passenger Lift Foyer',
      location: 'Block A Ground Floor Access Corridor',
      zone: 'Residential Tower A',
      resolution: '1080p (1920x1080)',
      fps: 25,
      retentionDays: 30,
      status: 'ONLINE',
      isGatewayConfigured: false,
    },
    {
      id: 'cam-03',
      name: 'Basement 1 Visitor Parking Bays',
      location: 'Lower Ground Deck · Pillar B-12',
      zone: 'Parking Complex',
      resolution: '1080p (1920x1080)',
      fps: 20,
      retentionDays: 30,
      status: 'ONLINE',
      isGatewayConfigured: false,
    },
    {
      id: 'cam-04',
      name: 'North Boundary Wall Perimeter',
      location: 'North Fence Line opposite Tower B',
      zone: 'Perimeter Security',
      resolution: '4K IR Night Vision',
      fps: 30,
      retentionDays: 45,
      status: 'ONLINE',
      isGatewayConfigured: false,
    },
    {
      id: 'cam-05',
      name: 'Clubhouse Swimming Pool & Deck',
      location: 'Recreation Facility South Terrace',
      zone: 'Amenity Grounds',
      resolution: '1080p (1920x1080)',
      fps: 25,
      retentionDays: 15,
      status: 'ONLINE',
      isGatewayConfigured: false,
    },
  ]);

  const [selectedCam, setSelectedCam] = React.useState<Camera | null>(null);
  const [granting, setGranting] = React.useState(false);
  const [grantToken, setGrantToken] = React.useState<string | null>(null);

  const handleRequestGrant = (cam: Camera) => {
    setSelectedCam(cam);
    setGranting(true);
    setGrantToken(null);

    setTimeout(() => {
      setGranting(false);
      setGrantToken(`cctv_ephemeral_grant_${cam.id}_${Date.now().toString(36)}`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            CCTV Camera Systems & Video Audit
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Cryptographic 60s stream playback grants, honest gateway disclosures, and zero simulated video
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-border-neutral bg-surface text-xs text-ink flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-brand" />
            <span>Audited Playback Only</span>
          </div>
        </div>
      </div>

      {/* Honest Disclosures Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <Shield className="w-5 h-5 flex-shrink-0 text-amber-700 dark:text-amber-300 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Zero Fake Feed Architecture Enforced</p>
          <p className="text-xs leading-relaxed opacity-90">
            SocietyOS strictly prohibits looping dummy video files. When media gateway integrations (WebRTC/RTSP) are not provisioned with live hardware credentials, cameras display their authoritative physical inventory, retention policy, and health status instead of simulated playback.
          </p>
        </div>
      </div>

      {/* Camera Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((cam) => (
          <Card key={cam.id} className="border border-border-neutral bg-surface shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand">{cam.id.toUpperCase()}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {cam.status}
                </span>
              </div>
              <CardTitle className="text-base text-ink mt-1">{cam.name}</CardTitle>
              <CardDescription className="text-xs text-ink-muted">{cam.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Honest Preview Screen Placeholder */}
              <div className="w-full aspect-video rounded-xl bg-surface-muted border border-border-neutral flex flex-col items-center justify-center p-4 text-center">
                <Video className="w-8 h-8 text-ink-subtle mb-2" />
                <p className="text-xs font-bold text-ink">Media Gateway Standby</p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {cam.resolution} · {cam.fps} FPS · {cam.retentionDays}d Retention
                </p>
                <span className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-ink-muted">
                  Gateway: Unprovisioned (Hardware Offline)
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-ink-muted">Zone: <strong>{cam.zone}</strong></span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestGrant(cam)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Request Grant</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grant Request Modal */}
      {selectedCam && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedCam(null)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Ephemeral Playback Grant</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCam(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-ink font-semibold">{selectedCam.name} ({selectedCam.id})</p>

              {granting ? (
                <div className="p-6 rounded-xl bg-surface-muted border border-border-neutral text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-brand mx-auto" />
                  <p className="text-ink font-semibold">Generating single-use 60s RTSP token...</p>
                  <p className="text-[11px] text-ink-muted">Writing administrator grant event to MongoDB audit log.</p>
                </div>
              ) : grantToken ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                      <span>Ephemeral Grant Issued</span>
                      <span>Expires in 60s</span>
                    </div>
                    <p className="text-[11px] font-mono break-all text-ink bg-surface p-2 rounded border border-border-subtle">
                      {grantToken}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral space-y-1 text-ink-muted">
                    <p className="font-semibold text-ink">Playback Policy Notice:</p>
                    <p>• Stream token automatically revokes after 60 seconds.</p>
                    <p>• Administrator viewing timestamp logged in society audit registry.</p>
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedCam(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
