'use client';

import * as React from 'react';
import {
  KeyRound,
  Plus,
  QrCode,
  Calendar,
  Clock,
  Car,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Check,
  Building,
  UserCheck,
  Pencil,
  LogOut,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore, broadcastSync } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';

export interface ChatMessage {
  id: string;
  senderRole: 'RESIDENT' | 'SECURITY';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface UnifiedVisitorPass {
  id: string;
  passCode: string;
  unitCode: string;
  visitorName: string;
  visitorPhone: string;
  vehicleNumber?: string;
  purpose: 'GUEST' | 'DELIVERY' | 'SERVICE' | 'CAB' | 'OTHER';
  status: 'PENDING' | 'INSIDE' | 'CHECKED_OUT' | 'DENIED' | 'REVOKED';
  validFrom: string;
  validUntil: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  expectedDurationHours?: number;
  gate?: string;
  guardNotes?: string;
  hostName: string;
  creatorEmail?: string;
  creatorId?: string;
  qrToken?: string;
  createdAt: string;
  chatMessages: ChatMessage[];
}

export const DEFAULT_UNIFIED_VISITORS: UnifiedVisitorPass[] = [
  {
    id: 'vis-1',
    passCode: 'VP-4021',
    unitCode: 'A-402',
    visitorName: 'Vikram Sethi',
    visitorPhone: '+91 98765 43210',
    vehicleNumber: 'KA-03-MG-4021',
    purpose: 'GUEST',
    status: 'INSIDE',
    validFrom: '2026-10-21T14:00:00.000Z',
    validUntil: '2026-10-21T18:00:00.000Z',
    checkInDate: 'Oct 21, 2026',
    checkInTime: '14:15',
    expectedDurationHours: 4,
    gate: 'Gate 1 North',
    hostName: 'Aarav Sharma',
    guardNotes: 'Physical identity verified with Aadhaar copy. Admitted to Tower A visitor bay.',
    createdAt: 'Today, 13:45',
    chatMessages: [
      {
        id: 'm-1',
        senderRole: 'SECURITY',
        senderName: 'Officer Ramesh Kumar (Gate 1)',
        text: 'Visitor Vikram Sethi arrived at Gate 1 North in white Creta KA-03-MG-4021.',
        timestamp: '14:14',
      },
      {
        id: 'm-2',
        senderRole: 'RESIDENT',
        senderName: 'Aarav Sharma (Resident)',
        text: 'Approved, thank you Ramesh. Please ask him to park in guest slot A-02.',
        timestamp: '14:15',
      },
      {
        id: 'm-3',
        senderRole: 'SECURITY',
        senderName: 'Officer Ramesh Kumar (Gate 1)',
        text: 'Directed to Slot A-02. Pass VP-4021 issued and barrier opened.',
        timestamp: '14:16',
      },
    ],
  },
  {
    id: 'vis-2',
    passCode: 'SRV-9012',
    unitCode: 'B-201',
    visitorName: 'Urban Company AC Technician',
    visitorPhone: '+91 98765 11988',
    vehicleNumber: 'KA-03-EZ-1102',
    purpose: 'SERVICE',
    status: 'INSIDE',
    validFrom: '2026-10-21T15:00:00.000Z',
    validUntil: '2026-10-21T17:00:00.000Z',
    checkInDate: 'Oct 21, 2026',
    checkInTime: '15:00',
    expectedDurationHours: 2,
    gate: 'Gate 2 Service',
    hostName: 'Rohan Deshmukh',
    guardNotes: 'Toolbag inspected at service barrier. Service pass valid till 17:00.',
    createdAt: 'Today, 14:30',
    chatMessages: [
      {
        id: 'm-4',
        senderRole: 'SECURITY',
        senderName: 'Officer Vikram Singh',
        text: 'Technician checked in with tool kit.',
        timestamp: '15:00',
      },
    ],
  },
  {
    id: 'vis-3',
    passCode: 'DLV-4412',
    unitCode: 'A-402',
    visitorName: 'Amazon Logistics Delivery',
    visitorPhone: '+91 98765 11099',
    vehicleNumber: 'KA-04-AB-9812',
    purpose: 'DELIVERY',
    status: 'CHECKED_OUT',
    validFrom: '2026-10-21T11:00:00.000Z',
    validUntil: '2026-10-21T12:00:00.000Z',
    checkInDate: 'Oct 21, 2026',
    checkInTime: '11:15',
    checkOutDate: 'Oct 21, 2026',
    checkOutTime: '11:28',
    expectedDurationHours: 1,
    gate: 'Gate 1 North',
    hostName: 'Aarav Sharma',
    guardNotes: 'Packages transferred to Gate Parcel Locker rack.',
    createdAt: 'Today, 11:00',
    chatMessages: [],
  },
  {
    id: 'vis-4',
    passCode: 'VP-8821',
    unitCode: 'A-402',
    visitorName: 'Rajesh & Meera Gupta',
    visitorPhone: '+91 98765 77881',
    vehicleNumber: 'MH-02-CB-1190',
    purpose: 'GUEST',
    status: 'PENDING',
    validFrom: '2026-10-21T17:00:00.000Z',
    validUntil: '2026-10-21T22:00:00.000Z',
    expectedDurationHours: 5,
    gate: 'Gate 1 North',
    hostName: 'Aarav Sharma',
    createdAt: 'Today, 12:00',
    chatMessages: [],
  },
];

export default function ResidentPassesPage() {
  const [passes, setPasses] = useSyncStore<UnifiedVisitorPass[]>(
    'societyos_unified_visitors',
    DEFAULT_UNIFIED_VISITORS
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPass, setSelectedPass] = React.useState<UnifiedVisitorPass | null>(null);
  const [activeChatPassId, setActiveChatPassId] = React.useState<string | null>(null);
  const [chatInput, setChatInput] = React.useState('');
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  // Derive latest active chat pass directly from synchronized passes store
  const activeChatPass = React.useMemo(() => {
    if (!activeChatPassId) return null;
    return passes.find((p) => p.id === activeChatPassId) || null;
  }, [passes, activeChatPassId]);

  // Auto-scroll to latest message whenever chat messages update
  React.useEffect(() => {
    if (activeChatPass?.chatMessages?.length) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatPass?.chatMessages?.length]);

  // Form state
  const [unitCode, setUnitCode] = React.useState('A-402');
  const [visitorName, setVisitorName] = React.useState('');
  const [visitorPhone, setVisitorPhone] = React.useState('');
  const [vehicleNumber, setVehicleNumber] = React.useState('');
  const [purpose, setPurpose] = React.useState<UnifiedVisitorPass['purpose']>('GUEST');
  const [validHours, setValidHours] = React.useState('4');

  // Active authenticated account state
  const [activeAccount, setActiveAccount] = React.useState({
    name: 'Aarav Sharma',
    email: 'resident@societyos.local',
    unit: 'A-402',
  });

  React.useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem('societyos-resident-profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const name = parsed.name || parsed.fullName || 'Aarav Sharma';
          const email = parsed.email || 'resident@societyos.local';
          const unit = parsed.unit || 'A-402';
          setActiveAccount({ name, email, unit });
          setUnitCode(unit);
        } catch {}
      }
    };
    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, []);

  const [filterMode, setFilterMode] = React.useState<'MY_PASSES' | 'ALL_PASSES'>('MY_PASSES');

  // Strict ownership check: Only the account that created the pass can edit, change, or delete it
  const isPassCreator = React.useCallback(
    (pass: UnifiedVisitorPass) => {
      if (!pass) return false;
      if (pass.creatorEmail && pass.creatorEmail.toLowerCase() === activeAccount.email.toLowerCase()) {
        return true;
      }
      if (pass.creatorId && (pass.creatorId === activeAccount.email || pass.creatorId === activeAccount.name)) {
        return true;
      }
      if (pass.hostName && pass.hostName.toLowerCase() === activeAccount.name.toLowerCase()) {
        return true;
      }
      if (pass.unitCode && pass.unitCode.toUpperCase() === activeAccount.unit.toUpperCase()) {
        return true;
      }
      return false;
    },
    [activeAccount]
  );

  const displayedPasses = React.useMemo(() => {
    if (filterMode === 'MY_PASSES') {
      return passes.filter((p) => isPassCreator(p));
    }
    return passes;
  }, [passes, filterMode, isPassCreator]);

  // Edit Pass & Vehicle State
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingPass, setEditingPass] = React.useState<UnifiedVisitorPass | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editVehicle, setEditVehicle] = React.useState('');
  const [editPurpose, setEditPurpose] = React.useState<UnifiedVisitorPass['purpose']>('GUEST');
  const [editHours, setEditHours] = React.useState('4');

  const handleOpenEdit = (pass: UnifiedVisitorPass) => {
    if (!isPassCreator(pass)) {
      showAppToast(
        `Permission Denied: This pass was created by ${pass.hostName} (${pass.unitCode}). Only the creator can edit or modify details.`,
        'error',
        'Unauthorized'
      );
      return;
    }
    setEditingPass(pass);
    setEditName(pass.visitorName);
    setEditPhone(pass.visitorPhone);
    setEditVehicle(pass.vehicleNumber || '');
    setEditPurpose(pass.purpose);
    setEditHours(String(pass.expectedDurationHours || 4));
    setEditDialogOpen(true);
  };

  const handleDeletePass = (pass: UnifiedVisitorPass) => {
    if (!isPassCreator(pass)) {
      showAppToast(
        `Permission Denied: This pass was created by ${pass.hostName} (${pass.unitCode}). Only the creator can delete it.`,
        'error',
        'Unauthorized'
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete pass ${pass.passCode} for ${pass.visitorName}? This will remove it from gate records.`
      )
    ) {
      return;
    }

    const updated = passes.filter((p) => p.id !== pass.id && p.passCode !== pass.passCode);
    setPasses(updated);

    if (selectedPass?.id === pass.id) {
      setSelectedPass(null);
    }

    // Call DELETE API to remove from MongoDB visitorPasses
    fetch(`/api/visitors/passes/${pass.passCode}`, {
      method: 'DELETE',
    }).catch(() => null);

    showAppToast(
      `Pass ${pass.passCode} for ${pass.visitorName} deleted successfully.`,
      'info',
      'Pass Deleted'
    );
  };

  const handleResidentGuestCheckOut = (pass: UnifiedVisitorPass) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // 1. Update passes in societyos_unified_visitors
    const updatedPasses = passes.map((p) => {
      if (p.id === pass.id || p.passCode === pass.passCode) {
        return {
          ...p,
          status: 'CHECKED_OUT' as const,
          checkOutDate: dateStr,
          checkOutTime: timeStr,
          isUsed: true,
          chatMessages: [
            ...(p.chatMessages || []),
            {
              id: `msg-${Date.now()}`,
              senderRole: 'RESIDENT' as const,
              senderName: `${pass.hostName || 'Resident'} (Host)`,
              text: `Resident confirmed guest ${pass.visitorName} has departed Unit ${pass.unitCode}. Gate checkout logged.`,
              timestamp: timeStr,
            },
          ],
        };
      }
      return p;
    });
    setPasses(updatedPasses);

    // 2. Also remove from active visitors in societyos_active_visitors
    try {
      const rawActive = localStorage.getItem('societyos_active_visitors');
      if (rawActive) {
        const activeList = JSON.parse(rawActive);
        const filtered = activeList.filter(
          (v: any) =>
            v._id !== pass.id &&
            v.visitorName.toLowerCase() !== pass.visitorName.toLowerCase()
        );
        localStorage.setItem('societyos_active_visitors', JSON.stringify(filtered));
        broadcastSync('societyos_active_visitors', filtered);
      }
    } catch {}

    if (selectedPass?.id === pass.id) {
      setSelectedPass({
        ...selectedPass,
        status: 'CHECKED_OUT',
        checkOutDate: dateStr,
        checkOutTime: timeStr,
      });
    }

    showAppToast(
      `Guest departure recorded for ${pass.visitorName}. Security gate marked checked-out in real time.`,
      'success',
      'Departure Logged'
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPass) return;

    const hours = parseInt(editHours, 10);
    const validFromDate = editingPass.validFrom ? new Date(editingPass.validFrom) : new Date();
    const newValidUntil = new Date(validFromDate.getTime() + hours * 3600 * 1000).toISOString();

    const updated = passes.map((p) => {
      if (p.id === editingPass.id) {
        return {
          ...p,
          visitorName: editName.trim(),
          visitorPhone: editPhone.trim(),
          vehicleNumber: editVehicle.trim() || undefined,
          purpose: editPurpose,
          expectedDurationHours: hours,
          validUntil: newValidUntil,
        };
      }
      return p;
    });

    setPasses(updated);

    // If already inside or active, sync vehicle and duration to active visitors store too!
    try {
      const rawActive = localStorage.getItem('societyos_active_visitors');
      if (rawActive) {
        const activeList = JSON.parse(rawActive);
        const updatedActive = activeList.map((v: any) => {
          if (
            v._id === editingPass.id ||
            v.visitorName.toLowerCase() === editingPass.visitorName.toLowerCase() ||
            v.unitId === editingPass.unitCode
          ) {
            return {
              ...v,
              vehicleNumber: editVehicle.trim() || undefined,
              expectedDurationHours: hours,
              validUntil: newValidUntil,
            };
          }
          return v;
        });
        localStorage.setItem('societyos_active_visitors', JSON.stringify(updatedActive));
        broadcastSync('societyos_active_visitors', updatedActive);
      }
    } catch {}

    if (selectedPass?.id === editingPass.id) {
      setSelectedPass({
        ...selectedPass,
        visitorName: editName.trim(),
        visitorPhone: editPhone.trim(),
        vehicleNumber: editVehicle.trim() || undefined,
        purpose: editPurpose,
        expectedDurationHours: hours,
        validUntil: newValidUntil,
      });
    }
    setEditDialogOpen(false);
    setEditingPass(null);
    showAppToast(
      `Pass ${editingPass.passCode} updated: ${hours}h duration & plate ${editVehicle.trim() || 'Pedestrian'} synced to Security desk.`,
      'success',
      'Pass Updated'
    );
  };

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim()) return;

    const now = new Date();
    const until = new Date(now.getTime() + parseInt(validHours, 10) * 3600 * 1000);
    const passCode = `VP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPass: UnifiedVisitorPass = {
      id: `vis-${Date.now()}`,
      passCode,
      unitCode: unitCode || activeAccount.unit || 'A-402',
      visitorName: visitorName.trim(),
      visitorPhone: visitorPhone.trim(),
      vehicleNumber: vehicleNumber.trim() || undefined,
      purpose,
      status: 'PENDING',
      validFrom: now.toISOString(),
      validUntil: until.toISOString(),
      expectedDurationHours: parseInt(validHours, 10),
      hostName: activeAccount.name || 'Aarav Sharma',
      creatorEmail: activeAccount.email || 'resident@societyos.local',
      creatorId: activeAccount.email || 'resident@societyos.local',
      createdAt: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      chatMessages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'RESIDENT',
          senderName: `${activeAccount.name} (${unitCode || activeAccount.unit})`,
          text: `Pre-approved guest pass ${passCode} issued for ${visitorName.trim()}. Expected arrival today.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setPasses([newPass, ...passes]);
    setDialogOpen(false);
    setSelectedPass(newPass);
    setVisitorName('');
    setVisitorPhone('');
    setVehicleNumber('');

    // Persist to MongoDB backend as well for cross-device/server verification
    fetch('/api/visitors/passes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'RESIDENT',
      },
      body: JSON.stringify({
        unitId: unitCode || activeAccount.unit || 'A-402',
        visitorName: newPass.visitorName,
        visitorPhone: newPass.visitorPhone,
        vehicleNumber: newPass.vehicleNumber,
        purpose: newPass.purpose,
        validFrom: now.toISOString(),
        validUntil: until.toISOString(),
        maxEntries: 1,
        passCode,
      }),
    }).catch((err) => {
      console.warn('API pass persistence fallback:', err);
    });

    showAppToast(
      `Guest pass ${passCode} generated for ${newPass.visitorName}. Synced to Gate Security in real time.`,
      'success',
      'Pass Pre-Approved'
    );
  };

  const handleRevokePass = (passId: string) => {
    const target = passes.find((p) => p.id === passId);
    if (target && !isPassCreator(target)) {
      showAppToast(
        `Permission Denied: Only the creator of this pass (${target.hostName}) can revoke it.`,
        'error',
        'Unauthorized'
      );
      return;
    }

    if (!confirm('Are you sure you want to revoke this pass? Security will reject entry.')) return;
    const updated = passes.map((p) =>
      p.id === passId ? { ...p, status: 'REVOKED' as const } : p
    );
    setPasses(updated);
    if (selectedPass?.id === passId) {
      setSelectedPass({ ...selectedPass, status: 'REVOKED' });
    }
    showAppToast('Pass revoked. Security barrier will reject this passcode.', 'info', 'Pass Revoked');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatPass || !chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'RESIDENT',
      senderName: 'Aarav Sharma (Unit A-402)',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = passes.map((p) => {
      if (p.id === activeChatPass.id) {
        return {
          ...p,
          chatMessages: [...(p.chatMessages || []), newMsg],
        };
      }
      return p;
    });

    setPasses(updated);
    setChatInput('');
    showAppToast('Message dispatched to Gate 1 Security Intercom.', 'info', 'Intercom Sent');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Visitor Passes & Pre-Approvals
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Generate digital QR passes, track check-in/out timestamps, and chat real-time with gate guards
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Guest Pass</span>
        </Button>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-xl bg-surface-muted border border-border-neutral">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterMode('MY_PASSES')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'MY_PASSES'
                ? 'bg-brand text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span>My Issued Passes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {passes.filter(isPassCreator).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('ALL_PASSES')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'ALL_PASSES'
                ? 'bg-brand text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span>All Society Passes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 text-ink">
              {passes.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-ink-muted px-2">
          Signed in as: <strong className="text-ink">{activeAccount.name}</strong> ({activeAccount.unit})
        </div>
      </div>

      {/* Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedPasses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-surface rounded-2xl border border-dashed border-border-neutral p-6">
            <UserCheck className="w-10 h-10 mx-auto text-ink-muted mb-2" />
            <p className="text-sm font-semibold text-ink">No Visitor Passes in this view</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {filterMode === 'MY_PASSES'
                ? `You haven't issued any passes from this account (${activeAccount.unit}) yet. Click New Guest Pass to create one.`
                : 'No visitor passes currently registered in the society system.'}
            </p>
          </div>
        ) : (
          displayedPasses.map((pass) => {
            const isInside = pass.status === 'INSIDE';
            const isCheckedOut = pass.status === 'CHECKED_OUT';
            const isPending = pass.status === 'PENDING';
            const isOwner = isPassCreator(pass);

            return (
              <Card
                key={pass.id}
                onClick={() => setSelectedPass(pass)}
                className={`p-4 border cursor-pointer hover:border-brand/50 hover:shadow-md transition-all group ${
                  isInside
                    ? 'border-emerald-500/40 bg-surface'
                    : isPending
                    ? 'border-amber-500/40 bg-surface'
                    : 'border-border-neutral bg-surface opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-border-neutral">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-brand">{pass.passCode}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {pass.purpose}
                      </Badge>
                      {isOwner ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                          Your Pass ({pass.unitCode})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-muted text-ink-muted border border-border-neutral flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-ink-subtle" /> View Only ({pass.hostName})
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-ink group-hover:text-brand transition-colors mt-0.5">
                      {pass.visitorName}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                      isInside
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : isCheckedOut
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-emergency/10 text-emergency border-emergency/30'
                    }`}
                  >
                    {isInside
                      ? 'INSIDE COMPOUND'
                      : isCheckedOut
                      ? 'CHECKED OUT / DEPARTED'
                      : isPending
                      ? 'PRE-APPROVED / AWAITING ENTRY'
                      : pass.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-ink-muted mt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Mobile:
                    </span>
                    <span className="font-medium text-ink">{pass.visitorPhone}</span>
                  </div>

                  {pass.vehicleNumber && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" /> Vehicle:
                      </span>
                      <span className="font-mono font-semibold text-ink">{pass.vehicleNumber}</span>
                    </div>
                  )}

                  {/* Complete Check-in Time & Date */}
                  {pass.checkInTime && (
                    <div className="p-2.5 rounded-lg bg-surface-muted border border-border-neutral space-y-1">
                      <div className="flex items-center justify-between font-semibold text-ink">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked In:
                        </span>
                        <span>
                          {pass.checkInDate || 'Today'} at {pass.checkInTime}
                        </span>
                      </div>
                      {pass.gate && (
                        <p className="text-[11px] text-ink-muted">Admitted through: {pass.gate}</p>
                      )}
                    </div>
                  )}

                  {/* Complete Check-out Time & Date - Prominent Already Checked Out Notice */}
                  {isCheckedOut && (
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-900 dark:text-blue-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Already Checked Out & Departed
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300">
                          {pass.checkOutDate || 'Today'} · {pass.checkOutTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted">
                        Guest departure recorded. Compound gate clearance completed; this pass is closed and cannot be re-used.
                      </p>
                    </div>
                  )}

                  {/* Overstay Notice if Inside */}
                  {isInside && (
                    <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/25">
                      <span>Expected Duration: {pass.expectedDurationHours || 4} Hours</span>
                      <span>Stay in progress</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div
                  className="flex items-center justify-between pt-3 mt-3 border-t border-border-neutral text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex items-center gap-1 text-brand border-brand/20 hover:bg-brand/10"
                    onClick={() => setActiveChatPassId(pass.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Gate Intercom ({pass.chatMessages?.length || 0})</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {isOwner ? (
                      <>
                        {pass.status === 'INSIDE' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
                            onClick={() => handleResidentGuestCheckOut(pass)}
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Mark Left</span>
                          </Button>
                        )}
                        {pass.status === 'CHECKED_OUT' && (
                          <span className="h-7 px-2 text-[11px] font-semibold rounded bg-surface-muted text-ink-muted border border-border-neutral inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Checked Out</span>
                          </span>
                        )}
                        {pass.status !== 'CHECKED_OUT' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-ink"
                            onClick={() => handleOpenEdit(pass)}
                          >
                            <Pencil className="w-3 h-3 text-brand" />
                            <span>Edit</span>
                          </Button>
                        )}
                        {pass.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleRevokePass(pass.id)}
                            className="text-xs text-emergency hover:underline cursor-pointer px-1"
                          >
                            Revoke
                          </button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-ink-muted hover:text-emergency hover:bg-emergency/10"
                          onClick={() => handleDeletePass(pass)}
                          title="Delete pass"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <span className="h-7 px-2 text-[11px] font-semibold rounded bg-surface-muted text-ink-muted border border-border-neutral inline-flex items-center gap-1">
                        <Lock className="w-3 h-3 text-ink-subtle" />
                        <span>View Only</span>
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pass Detail Dialog with QR */}
      {selectedPass && (
        <Dialog open={!!selectedPass} onOpenChange={() => setSelectedPass(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <span className="font-mono text-sm font-bold text-brand">{selectedPass.passCode}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded border bg-brand/10 text-brand border-brand/20">
                  {selectedPass.status}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                {selectedPass.visitorName}
              </DialogTitle>
              <DialogDescription>
                Unit {selectedPass.unitCode} · Pre-authorized by {selectedPass.hostName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 rounded-xl bg-surface-muted border border-border-neutral text-center space-y-2">
                <QrCode className="w-28 h-28 mx-auto text-ink" />
                <p className="font-mono font-extrabold text-2xl tracking-widest text-ink">
                  {selectedPass.passCode}
                </p>
                <p className="text-[11px] text-ink-muted">
                  Present this code or QR at Gate 1 North Boom Barrier
                </p>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border-neutral space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Purpose:</span>
                  <span className="font-semibold text-ink">{selectedPass.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Visitor Phone:</span>
                  <span className="font-semibold text-ink">{selectedPass.visitorPhone}</span>
                </div>
                {selectedPass.vehicleNumber && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Vehicle Registration:</span>
                    <span className="font-mono font-bold text-ink">{selectedPass.vehicleNumber}</span>
                  </div>
                )}
                {selectedPass.checkInTime && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Checked In At:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedPass.checkInDate} · {selectedPass.checkInTime}
                    </span>
                  </div>
                )}
                {selectedPass.checkOutTime && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Departed At:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {selectedPass.checkOutDate} · {selectedPass.checkOutTime}
                    </span>
                  </div>
                )}
              </div>

              {selectedPass.status === 'CHECKED_OUT' && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Pass Closed · Guest Already Checked Out</span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    This guest was recorded departed on <strong>{selectedPass.checkOutDate || 'Today'}</strong> at <strong>{selectedPass.checkOutTime}</strong>. The gate clearance code <strong className="font-mono">{selectedPass.passCode}</strong> has expired and cannot be reused.
                  </p>
                </div>
              )}
              {/* Creator vs View-Only Notice */}
              {!isPassCreator(selectedPass) ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>View Only · Issued by {selectedPass.hostName} ({selectedPass.unitCode})</span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Under Society Governance Bylaws, this pass is managed exclusively by the creator account. Only <strong>{selectedPass.hostName}</strong> has permission to edit details, adjust duration, mark departure, or delete this pass.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/20 text-brand text-xs flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Your Authorized Pass</span>
                  </span>
                  <span className="text-[11px]">You have full management access</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {isPassCreator(selectedPass) && selectedPass.status === 'INSIDE' && (
                <Button
                  variant="primary"
                  className="w-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    const p = selectedPass;
                    setSelectedPass(null);
                    if (p) handleResidentGuestCheckOut(p);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span>Mark Guest Departure / Check Out</span>
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const p = selectedPass;
                    setSelectedPass(null);
                    if (p) setActiveChatPassId(p.id);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5 text-brand" />
                  <span>Gate Intercom</span>
                </Button>
                {isPassCreator(selectedPass) && selectedPass.status !== 'CHECKED_OUT' && (
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => {
                      const p = selectedPass;
                      setSelectedPass(null);
                      handleOpenEdit(p);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1 text-brand" />
                    <span>Edit Pass</span>
                  </Button>
                )}
                {isPassCreator(selectedPass) && (
                  <Button
                    variant="outline"
                    className="text-xs text-emergency hover:bg-emergency/10 border-emergency/30"
                    onClick={() => {
                      const p = selectedPass;
                      setSelectedPass(null);
                      if (p) handleDeletePass(p);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete</span>
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setSelectedPass(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Real-Time Gate Intercom / Chat Dialog */}
      {activeChatPass && (
        <Dialog open={!!activeChatPassId} onOpenChange={(open) => { if (!open) setActiveChatPassId(null); }}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <DialogHeader className="p-4 bg-surface-muted border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <div>
                  <DialogTitle className="text-sm font-bold text-ink">
                    Gate 1 Intercom · {activeChatPass.visitorName} ({activeChatPass.passCode})
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Real-time direct channel between Resident (A-402) and On-duty Security Guard
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-surface text-xs">
              {activeChatPass.chatMessages?.length === 0 ? (
                <p className="text-center py-6 text-ink-muted">
                  No messages yet. Send a note to Gate Security below.
                </p>
              ) : (
                activeChatPass.chatMessages?.map((msg) => {
                  const isResident = msg.senderRole === 'RESIDENT';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isResident ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-ink-subtle mb-0.5">
                        <span className="font-bold text-ink">{msg.senderName}</span>
                        <span>· {msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                          isResident
                            ? 'bg-brand text-white rounded-tr-none'
                            : 'bg-surface-muted text-ink border border-border-neutral rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <form
              onSubmit={handleSendChatMessage}
              className="p-3 bg-surface-muted border-t border-border-neutral flex gap-2"
            >
              <Input
                placeholder="Type message to Gate Security (e.g. Please allow parking in slot A-02)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="text-xs bg-surface"
              />
              <Button type="submit" variant="primary" size="sm">
                <Send className="w-4 h-4 mr-1" />
                <span>Send</span>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Generate Pass Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Pre-Cleared Visitor Pass</DialogTitle>
            <DialogDescription>
              Pre-authorize family, delivery couriers, or maintenance workers for smooth gate admission
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePass} className="space-y-4 mt-1 text-xs">
            <div>
              <label className="font-semibold text-ink block mb-1">Target Flat / Unit</label>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border-neutral bg-surface-muted/60">
                <div>
                  <span className="font-bold text-xs text-ink block">Unit A-402 (My Flat)</span>
                  <span className="text-[11px] text-ink-muted">Resident Host: Aarav Sharma</span>
                </div>
                <Badge variant="brand" className="text-[10px]">Active Resident</Badge>
              </div>
            </div>

            <div>
              <label className="font-semibold text-ink block mb-1">Visitor Full Name</label>
              <Input
                placeholder="e.g. Vikram Sethi"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-semibold text-ink block mb-1">Visitor Mobile Number</label>
              <Input
                placeholder="e.g. +91 98765 43210"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-ink block mb-1">Vehicle Plate (Optional)</label>
                <Input
                  placeholder="e.g. KA-03-MG-4021"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="GUEST">Personal Guest</option>
                  <option value="DELIVERY">Food / Courier Delivery</option>
                  <option value="SERVICE">Service & Repair</option>
                  <option value="CAB">Taxi / Cab Pickup</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-ink block mb-1">Pass Validity Window</label>
              <select
                value={validHours}
                onChange={(e) => setValidHours(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
              >
                <option value="2">2 Hours</option>
                <option value="4">4 Hours (Standard)</option>
                <option value="8">8 Hours (Full Day)</option>
                <option value="24">24 Hours (Overnight Guest)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Generate Digital Pass
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Pass & Vehicle Details Modal — Exclusive to Pass Owner */}
      {editingPass && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                  {editingPass.passCode}
                </span>
                <span className="text-xs text-ink-muted">Resident Access Only</span>
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                Edit Pass & Vehicle Details
              </DialogTitle>
              <DialogDescription>
                Update visitor credentials, mobile contact, vehicle registration plate, or expected stay duration.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-2 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Visitor Full Name *</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Visitor Mobile Number *</label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-ink block mb-1">Vehicle License Plate</label>
                  <Input
                    placeholder="e.g. KA-03-MG-4021"
                    value={editVehicle}
                    onChange={(e) => setEditVehicle(e.target.value.toUpperCase())}
                  />
                  <span className="text-[10px] text-ink-muted mt-0.5 block">Gate camera ANPR match</span>
                </div>
                <div>
                  <label className="font-semibold text-ink block mb-1">Visit Purpose</label>
                  <select
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    <option value="GUEST">Personal Guest</option>
                    <option value="DELIVERY">Food / Courier Delivery</option>
                    <option value="SERVICE">Service & Repair</option>
                    <option value="CAB">Taxi / Cab Pickup</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Expected Duration</label>
                <select
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours (Standard)</option>
                  <option value="8">8 Hours (Full Day)</option>
                  <option value="24">24 Hours (Overnight)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-neutral">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
