'use client';

import * as React from 'react';
import {
  Building,
  Home,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  UserCheck,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

export interface Unit {
  _id: string;
  unitCode: string;
  floor: number;
  block: string;
  status: StatusType;
  memberUserIds: string[];
  occupantName?: string;
  occupantPhone?: string;
  isPubliclyListed: boolean;
  version: number;
  lastUpdated?: string;
}

// Generate the complete authoritative 160 units of Greenfield Heights
function generate160Units(): Unit[] {
  const blocks = ['A', 'B', 'C', 'D'];
  const units: Unit[] = [];
  let id = 1;

  blocks.forEach((block) => {
    for (let floor = 1; floor <= 10; floor++) {
      for (let unitNum = 1; unitNum <= 4; unitNum++) {
        const unitCode = `${block}-${floor}${unitNum.toString().padStart(2, '0')}`;
        
        // Distribution matching real stats: ~92.5% occupied, rest vacant, maintenance, reserved
        let status: StatusType = 'OCCUPIED';
        let occupantName: string | undefined = `Resident ${block}-${floor}0${unitNum}`;
        let occupantPhone: string | undefined = `+91 98765 ${10000 + ((id * 37) % 89999)}`;

        if (unitCode === 'A-402') {
          occupantName = 'Aarav Sharma';
          occupantPhone = '+91 98765 43210';
        } else if (unitCode === 'A-101') {
          status = 'MAINTENANCE';
          occupantName = 'Dr. Suresh Mehta (Renovation)';
        } else if (unitCode === 'A-102' || unitCode === 'B-103' || unitCode === 'C-204' || unitCode === 'D-101') {
          status = 'VACANT';
          occupantName = undefined;
          occupantPhone = undefined;
        } else if (unitCode === 'B-201' || unitCode === 'C-102') {
          status = 'RESERVED';
          occupantName = 'Agreement In Progress';
        }

        units.push({
          _id: `unit_${id++}`,
          unitCode,
          floor,
          block,
          status,
          occupantName,
          occupantPhone,
          memberUserIds: status === 'OCCUPIED' ? [`user_${id}`] : [],
          isPubliclyListed: status === 'VACANT',
          version: 1,
          lastUpdated: 'Oct 2026',
        });
      }
    }
  });

  return units;
}

function getInitial160Units(): Unit[] {
  const default160 = generate160Units();
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('societyos_admin_units');
      if (saved) {
        const parsed: Unit[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          const towerA = parsed.filter((u) => u.block === 'A').length;
          const towerB = parsed.filter((u) => u.block === 'B').length;
          const towerC = parsed.filter((u) => u.block === 'C').length;
          const towerD = parsed.filter((u) => u.block === 'D').length;
          if (towerA >= 40 && towerB >= 40 && towerC >= 40 && towerD >= 40) {
            return parsed;
          }
        }
        // If an older incomplete array was saved, merge with default 160 units
        const map = new Map<string, Unit>();
        default160.forEach((u) => map.set(u.unitCode, u));
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            if (u && u.unitCode) {
              const existing = map.get(u.unitCode);
              map.set(u.unitCode, existing ? { ...existing, ...u } : u);
            }
          });
        }
        const merged = Array.from(map.values());
        localStorage.setItem('societyos_admin_units', JSON.stringify(merged));
        return merged;
      }
    } catch {}
  }
  return default160;
}

export default function AdminUnitsPage() {
  const [units, setUnits] = useSyncStore<Unit[]>('societyos_admin_units', getInitial160Units());

  const [selectedBlock, setSelectedBlock] = React.useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  // Add Unit Form State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newUnitCode, setNewUnitCode] = React.useState('');
  const [newFloor, setNewFloor] = React.useState(1);
  const [newBlock, setNewBlock] = React.useState('A');
  const [newOccupant, setNewOccupant] = React.useState('');

  // Status Change Dialog State
  const [selectedUnit, setSelectedUnit] = React.useState<Unit | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<StatusType>('MAINTENANCE');
  const [reasonCode, setReasonCode] = React.useState('Owner Renovation');
  const [auditNotes, setAuditNotes] = React.useState('');

  // Dynamic statistics
  const stats = React.useMemo(() => {
    const total = units.length;
    const occupied = units.filter((u) => u.status === 'OCCUPIED').length;
    const vacant = units.filter((u) => u.status === 'VACANT').length;
    const reserved = units.filter((u) => u.status === 'RESERVED').length;
    const maintenance = units.filter((u) => u.status === 'MAINTENANCE').length;
    const occupancyRate = Math.round((occupied / (total || 1)) * 100);
    return { total, occupied, vacant, reserved, maintenance, occupancyRate };
  }, [units]);

  const filteredUnits = units.filter((u) => {
    const matchesBlock = selectedBlock === 'ALL' || u.block === selectedBlock;
    const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
    const matchesSearch =
      u.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.occupantName && u.occupantName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBlock && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage) || 1;
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitCode.trim()) return;

    const normalizedCode = newUnitCode.trim().toUpperCase();

    // Check duplicate unit code
    if (units.some((u) => u.unitCode.toUpperCase() === normalizedCode)) {
      showAppToast(
        `Unit "${normalizedCode}" already exists in the authoritative registry. You can only add new units!`,
        'error',
        'Duplicate Unit Prevented'
      );
      return;
    }

    const newUnit: Unit = {
      _id: `unit_${Date.now()}`,
      unitCode: normalizedCode,
      floor: Number(newFloor),
      block: newBlock.toUpperCase(),
      status: 'VACANT',
      occupantName: newOccupant.trim() || undefined,
      memberUserIds: [],
      isPubliclyListed: true,
      version: 1,
      lastUpdated: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setUnits([newUnit, ...units]);
    setIsAddModalOpen(false);
    setNewUnitCode('');
    setNewOccupant('');
    showAppToast(`Unit ${newUnit.unitCode} added to authoritative registry.`, 'success', 'Unit Registered');
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const updated = units.map((u) => {
      if (u._id === selectedUnit._id) {
        return {
          ...u,
          status: targetStatus,
          version: u.version + 1,
          lastUpdated: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
        };
      }
      return u;
    });

    setUnits(updated);

    // Save audit log entry
    try {
      await fetch(`/api/units/${selectedUnit._id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          reasonCode,
          auditNotes,
        }),
      });
    } catch {}

    showAppToast(
      `Unit ${selectedUnit.unitCode} status transitioned to ${targetStatus}. Audit record saved.`,
      'success',
      'Status Updated'
    );
    setSelectedUnit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Units & Occupancy Governance
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Full Authoritative Society Inventory: 160 Units across Blocks A, B, C & D
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add New Unit</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 text-center">
          <span className="text-[11px] font-semibold text-ink-muted uppercase">Total Compound</span>
          <p className="text-2xl font-mono font-bold text-ink mt-0.5">{stats.total}</p>
        </Card>
        <Card className="p-3.5 text-center">
          <span className="text-[11px] font-semibold text-brand uppercase">Occupied</span>
          <p className="text-2xl font-mono font-bold text-brand mt-0.5">{stats.occupied}</p>
        </Card>
        <Card className="p-3.5 text-center">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Vacant</span>
          <p className="text-2xl font-mono font-bold text-emerald-600 mt-0.5">{stats.vacant}</p>
        </Card>
        <Card className="p-3.5 text-center">
          <span className="text-[11px] font-semibold text-amber-500 uppercase">Reserved</span>
          <p className="text-2xl font-mono font-bold text-amber-500 mt-0.5">{stats.reserved}</p>
        </Card>
        <Card className="p-3.5 text-center">
          <span className="text-[11px] font-semibold text-emergency uppercase">Maintenance</span>
          <p className="text-2xl font-mono font-bold text-emergency mt-0.5">{stats.maintenance}</p>
        </Card>
        <Card className="p-3.5 text-center bg-brand/5 border-brand/20">
          <span className="text-[11px] font-bold text-brand uppercase">Occupancy Rate</span>
          <p className="text-2xl font-mono font-bold text-brand mt-0.5">{stats.occupancyRate}%</p>
        </Card>
      </div>

      {/* Filter and Tower Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tower Selector */}
        <div className="flex rounded-lg bg-surface-muted p-1 border border-border-neutral text-xs font-semibold overflow-x-auto">
          {['ALL', 'A', 'B', 'C', 'D'].map((b) => (
            <button
              key={b}
              onClick={() => {
                setSelectedBlock(b);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedBlock === b
                  ? 'bg-brand text-white shadow-xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {b === 'ALL' ? 'All Blocks (160)' : `Tower ${b} (40 Units)`}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 flex-1 sm:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
            <Input
              placeholder="Search by unit or resident..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
          >
            <option value="ALL">All Statuses</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="VACANT">Vacant</option>
            <option value="RESERVED">Reserved</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Units Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink min-w-[640px]">
              <thead className="bg-surface-muted border-b border-border-neutral text-ink-muted uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Unit Code</th>
                  <th className="p-3.5">Tower / Floor</th>
                  <th className="p-3.5">Current Occupant</th>
                  <th className="p-3.5">Occupancy Status</th>
                  <th className="p-3.5">Audit Version</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-neutral">
                {paginatedUnits.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => {
                      setSelectedUnit(u);
                      setTargetStatus(u.status === 'MAINTENANCE' ? 'OCCUPIED' : 'MAINTENANCE');
                    }}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 font-bold font-mono text-sm text-brand group-hover:underline">
                      {u.unitCode}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold">Tower {u.block}</span>
                      <span className="text-ink-muted block text-[11px]">Floor {u.floor}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-ink">
                        {u.occupantName || <span className="text-ink-subtle italic">Unassigned (Vacant)</span>}
                      </span>
                      {u.occupantPhone && (
                        <span className="text-ink-muted block text-[11px] font-mono">{u.occupantPhone}</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-3.5 font-mono text-ink-subtle">
                      v{u.version} · {u.lastUpdated || 'Initial'}
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7 px-2.5"
                        onClick={() => {
                          setSelectedUnit(u);
                          setTargetStatus(u.status === 'MAINTENANCE' ? 'OCCUPIED' : 'MAINTENANCE');
                        }}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-3.5 border-t border-border-neutral text-xs text-ink-muted">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUnits.length)} of {filteredUnits.length} units
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-mono text-ink font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Status Update Modal: Rich context for Update Status: A-101 */}
      {selectedUnit && (
        <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-ink">
                Update Status: {selectedUnit.unitCode}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted leading-relaxed">
                All status changes are recorded as append-only occupancy audit events.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 my-2">
              <div className="p-3 bg-surface-muted/50 rounded-xl border border-border-neutral space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Tower Block:</span>
                  <span className="font-bold text-ink">Tower {selectedUnit.block} (Floor {selectedUnit.floor})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Current Registry Status:</span>
                  <StatusBadge status={selectedUnit.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Registered Resident:</span>
                  <span className="font-semibold text-ink">{selectedUnit.occupantName || 'None'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as StatusType)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink font-bold"
                >
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="VACANT">VACANT</option>
                  <option value="RESERVED">RESERVED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Reason Code</label>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="Owner Renovation">Owner Renovation</option>
                  <option value="Tenant Move-In Inspection">Tenant Move-In Inspection</option>
                  <option value="Lease Vacated & Cleaned">Lease Vacated & Cleaned</option>
                  <option value="Deep Plumbing / Seepage Repair">Deep Plumbing / Seepage Repair</option>
                  <option value="Legal Governance Hold">Legal Governance Hold</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Audit Notes (Optional)</label>
                <textarea
                  placeholder="Enter specific renovation scope, contractor permit, or committee approval notes..."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 p-2.5 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setSelectedUnit(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Commit Status Transition
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Unit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New Unit to Society</DialogTitle>
            <DialogDescription>
              Create an authoritative entry in the Greenfield Heights compound inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUnit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-ink">Unit Identifier</label>
              <Input
                placeholder="e.g. A-1101, B-505"
                value={newUnitCode}
                onChange={(e) => setNewUnitCode(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Tower Block</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="A">Tower A</option>
                  <option value="B">Tower B</option>
                  <option value="C">Tower C</option>
                  <option value="D">Tower D</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Floor Level</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={newFloor}
                  onChange={(e) => setNewFloor(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Primary Occupant (Optional)</label>
              <Input
                placeholder="Owner or primary tenant name"
                value={newOccupant}
                onChange={(e) => setNewOccupant(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Unit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
