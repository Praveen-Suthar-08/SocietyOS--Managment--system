'use client';

import * as React from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  Mail,
  Phone,
  Home,
  ShieldCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitCode: string;
  type: 'OWNER' | 'TENANT';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedDate: string;
}

export default function AdminResidentsPage() {
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState<'ALL' | 'OWNER' | 'TENANT'>('ALL');
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  // Invite Form
  const [inviteName, setInviteName] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [invitePhone, setInvitePhone] = React.useState('');
  const [inviteUnit, setInviteUnit] = React.useState('A-102');
  const [inviteType, setInviteType] = React.useState<'OWNER' | 'TENANT'>('OWNER');
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [selectedResident, setSelectedResident] = React.useState<Resident | null>(null);

  const defaultResidents: Resident[] = [
    {
      id: 'res-1',
      name: 'Aarav Sharma',
      email: 'resident@societyos.local',
      phone: '+91 98765 43210',
      unitCode: 'A-402',
      type: 'OWNER',
      status: 'ACTIVE',
      joinedDate: 'Jan 2024',
    },
    {
      id: 'res-2',
      name: 'Dr. Suresh Mehta',
      email: 'suresh.mehta@example.com',
      phone: '+91 98765 12345',
      unitCode: 'A-101',
      type: 'OWNER',
      status: 'ACTIVE',
      joinedDate: 'Mar 2023',
    },
    {
      id: 'res-3',
      name: 'Priya Nambiar',
      email: 'priya.n@example.com',
      phone: '+91 98765 67890',
      unitCode: 'A-201',
      type: 'TENANT',
      status: 'ACTIVE',
      joinedDate: 'Aug 2024',
    },
    {
      id: 'res-4',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@example.com',
      phone: '+91 98765 89012',
      unitCode: 'B-201',
      type: 'OWNER',
      status: 'ACTIVE',
      joinedDate: 'Nov 2023',
    },
    {
      id: 'res-5',
      name: 'Ananya Verma',
      email: 'ananya.v@example.com',
      phone: '+91 98765 44321',
      unitCode: 'B-302',
      type: 'TENANT',
      status: 'INVITED',
      joinedDate: 'Pending Acceptance',
    },
  ];

  const [residents, setResidents] = React.useState<Resident[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('societyos_admin_residents');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return defaultResidents;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('societyos_admin_residents', JSON.stringify(residents));
    } catch {}
  }, [residents]);

  const filtered = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: Resident = {
      id: `res-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone,
      unitCode: inviteUnit,
      type: inviteType,
      status: 'INVITED',
      joinedDate: 'Just Invited',
    };
    setResidents([newRes, ...residents]);
    setSuccessMsg(`Single-use registration invitation dispatched to ${inviteEmail}`);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setTimeout(() => {
      setSuccessMsg(null);
      setIsInviteOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Resident Management & Directory
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Verified household occupancy, single-use onboarding invitations, and contact registry
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsInviteOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Invite New Resident</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by resident name, unit number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
          />
        </div>

        <div className="flex rounded-lg bg-surface border border-border-neutral p-1 text-xs font-semibold self-stretch sm:self-auto">
          {(['ALL', 'OWNER', 'TENANT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-brand text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t === 'ALL' ? 'All Residents' : t === 'OWNER' ? 'Owners' : 'Tenants'}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Occupancy</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center">
                        {res.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-ink">{res.name}</p>
                        <p className="text-xs text-ink-muted">{res.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-brand px-2 py-0.5 rounded bg-brand-subtle border border-brand/20">
                      {res.unitCode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        res.type === 'OWNER'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {res.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted space-y-0.5">
                    <p className="flex items-center gap-1.5 text-ink">
                      <Mail className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{res.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{res.phone}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={res.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedResident(res)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resident Details Modal */}
      {selectedResident && (
        <Dialog open={!!selectedResident} onOpenChange={() => setSelectedResident(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                  Unit {selectedResident.unitCode}
                </span>
                <StatusBadge status={selectedResident.status} />
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                {selectedResident.name}
              </DialogTitle>
              <DialogDescription>
                Verified Greenfield Heights Household Directory Record
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface-muted/50 rounded-xl border border-border-neutral">
                <div>
                  <span className="text-ink-muted block font-medium">Occupancy Tenure</span>
                  <p className="font-bold text-ink mt-0.5">{selectedResident.type}</p>
                </div>
                <div>
                  <span className="text-ink-muted block font-medium">Member Since</span>
                  <p className="font-bold text-ink mt-0.5">{selectedResident.joinedDate}</p>
                </div>
                <div>
                  <span className="text-ink-muted block font-medium">Email Address</span>
                  <p className="font-bold text-ink mt-0.5">{selectedResident.email}</p>
                </div>
                <div>
                  <span className="text-ink-muted block font-medium">Phone Number</span>
                  <p className="font-bold text-ink mt-0.5">{selectedResident.phone}</p>
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border-neutral space-y-1">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Gate & Access Entitlements
                </span>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Active RFID windshield sticker authorized for Gate 1 and Gate 2 boom barriers. Pre-approved for guest pass generation and facility bookings.
                </p>
              </div>
            </div>

            <Button variant="primary" className="w-full" onClick={() => setSelectedResident(null)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Resident Modal */}
      {isInviteOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsInviteOpen(false)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Invite New Resident</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Ramesh Chandra"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                />

                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 98765 99999"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Unit Assignment"
                    placeholder="e.g. A-102"
                    value={inviteUnit}
                    onChange={(e) => setInviteUnit(e.target.value)}
                    required
                  />

                  <div>
                    <label className="text-xs font-semibold text-ink-muted block mb-1">
                      Occupant Type
                    </label>
                    <select
                      value={inviteType}
                      onChange={(e) => setInviteType(e.target.value as 'OWNER' | 'TENANT')}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="OWNER">Owner</option>
                      <option value="TENANT">Tenant</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsInviteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Send Single-Use Invite
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
