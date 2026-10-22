'use client';

import * as React from 'react';
import {
  Video,
  ShieldCheck,
  AlertCircle,
  Eye,
  Lock,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';

interface CameraItem {
  _id: string;
  cameraId: string;
  name: string;
  zone: string;
  streamType: string;
  status: string;
  isConfigured: boolean;
  retentionDays: number;
}

export default function AdminCctvPage() {
  const [cameras, setCameras] = React.useState<CameraItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/cctv/cameras')
      .then((r) => r.json())
      .then((d) => setCameras(d.cameras || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#17231D]">
            CCTV Gateway Management & Boundary Oversight
          </h1>
          <p className="text-sm text-[#66716A] mt-0.5">
            Zone surveillance catalog, stream access security bounds, and honest integration compliance.
          </p>
        </div>
      </div>

      {/* Honest Integration Disclosure */}
      <div className="bg-[#F6F6F1] border border-[#D9DED8] rounded-xl p-5 text-xs text-[#17231D] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#276749]">
          <ShieldCheck className="w-5 h-5" />
          <span>SocietyOS CCTV Security Architecture Rules</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[#66716A]">
          <li><strong>No Simulated Feeds:</strong> Fake looping video clips or mock canvas animations are strictly banned by system architecture.</li>
          <li><strong>Zero Credential Leakage:</strong> RTSP URLs, camera IP addresses, and NVR passwords never reach the browser client bundle or network responses.</li>
          <li><strong>Short-Lived Ephemeral Grants:</strong> Authorized security viewing requests receive 60-second cryptographically verified gateway grants after server-side RBAC checks.</li>
          <li><strong>Access Auditing:</strong> Every playback grant generates an immutable record in the society audit trail.</li>
        </ul>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Society Camera Zones Inventory ({cameras.length})</CardTitle>
          <CardDescription>
            Configured cameras across entry gates, clubhouse perimeters, and parking basements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-[#66716A]">Loading camera inventory...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#17231D] min-w-[640px]">
                <thead className="bg-[#F6F6F1] border-b border-[#D9DED8] text-[#66716A] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Camera ID</th>
                    <th className="p-3">Location / Name</th>
                    <th className="p-3">Zone</th>
                    <th className="p-3">Stream Gateway</th>
                    <th className="p-3">Retention</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DED8]">
                  {cameras.map((c) => (
                    <tr key={c._id} className="hover:bg-[#F6F6F1]/50">
                      <td className="p-3 font-mono font-bold text-[#276749]">{c.cameraId}</td>
                      <td className="p-3 font-semibold">{c.name}</td>
                      <td className="p-3">
                        <Badge variant="outline">{c.zone}</Badge>
                      </td>
                      <td className="p-3">
                        {c.isConfigured ? (
                          <span className="text-[#276749] font-bold">Verified Gateway</span>
                        ) : (
                          <span className="text-[#66716A]">Not Configured (Standby)</span>
                        )}
                      </td>
                      <td className="p-3 text-[#66716A]">{c.retentionDays} Days</td>
                      <td className="p-3">
                        <StatusBadge
                          status={c.isConfigured ? 'operational' : 'offline'}
                          label={c.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
