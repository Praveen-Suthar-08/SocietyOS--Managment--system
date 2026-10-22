'use client';

import * as React from 'react';
import {
  Settings,
  Shield,
  PhoneCall,
  Save,
  Check,
  Building,
  KeyRound,
  Bell,
  Clock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const [societyName, setSocietyName] = React.useState('Greenfield Heights Co-Operative Housing Society');
  const [registrationNo, setRegistrationNo] = React.useState('BOM/HSG/2019/9401');
  const [address, setAddress] = React.useState('Plot 42, Sector 18, Kharghar, Navi Mumbai 410210');
  const [gateCount, setGateCount] = React.useState('2 Gates (Gate 1 Main & Gate 2 Service)');
  const [nationalEmergency, setNationalEmergency] = React.useState('112');
  const [localPolice, setLocalPolice] = React.useState('+91 22 2774 0100');
  const [nearbyHospital, setNearbyHospital] = React.useState('+91 22 3988 8888 (Apollo Hospital)');
  const [fireBrigade, setFireBrigade] = React.useState('101');
  const [gateDeskPhone, setGateDeskPhone] = React.useState('+91 98765 22001');

  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Society Settings & Governance Policy
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Configure statutory emergency hotlines, gate terminal policies, and society legal profile
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const config = {
                societyName,
                registrationNo,
                address,
                gateCount,
                emergencyHotlines: {
                  national: nationalEmergency,
                  police: localPolice,
                  hospital: nearbyHospital,
                  fire: fireBrigade,
                  gateDesk: gateDeskPhone,
                },
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `societyos_config_${Date.now()}.json`;
              a.click();
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export Configuration</span>
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">Society settings and emergency hotlines updated successfully!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Society Identification */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-brand" />
              <span>Society Profile & Legal Registration</span>
            </CardTitle>
            <CardDescription>
              Authoritative details displayed across resident receipts and gate passes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Registered Society Legal Name"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Society Registration / Cooperative Number"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                required
              />

              <Input
                label="Gate Complex Architecture"
                value={gateCount}
                onChange={(e) => setGateCount(e.target.value)}
                required
              />
            </div>

            <Input
              label="Postal Address & Pincode"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* Emergency Hotlines */}
        <Card className="border border-border-neutral bg-surface shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emergency" />
              <span>Statutory Emergency Hotlines & Dispatch Contacts</span>
            </CardTitle>
            <CardDescription>
              Broadcasted immediately to residents during SOS alerts and displayed on gate consoles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="National Emergency Hotline (Ambulance, Fire, Police)"
                value={nationalEmergency}
                onChange={(e) => setNationalEmergency(e.target.value)}
                required
              />

              <Input
                label="Local Police Station Jurisdiction"
                value={localPolice}
                onChange={(e) => setLocalPolice(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nearby Trauma & Emergency Hospital"
                value={nearbyHospital}
                onChange={(e) => setNearbyHospital(e.target.value)}
                required
              />

              <Input
                label="Municipal Fire Brigade Control"
                value={fireBrigade}
                onChange={(e) => setFireBrigade(e.target.value)}
                required
              />
            </div>

            <Input
              label="Gate 1 Duty Guard Hot-Line"
              value={gateDeskPhone}
              onChange={(e) => setGateDeskPhone(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-2 border-t border-border-subtle">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-1.5" />
              <span>Save Governance Policy</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
