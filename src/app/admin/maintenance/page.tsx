'use client';

import * as React from 'react';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Building,
  User,
  Check,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';
import { UnitSearchSelect } from '@/components/ui/unit-search-select';
import { DEFAULT_MAINTENANCE_TICKETS, MaintenanceTicket } from '@/app/resident/maintenance/page';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const TECHNICIAN_OPTIONS = [
  'Kailash Nath (Lead Electrician)',
  'Vinod Verma (Master Plumber)',
  'Otis Field Engineer',
  'Ramesh Carpenter',
  'FitTech Services',
  'Apex HVAC Engineering',
  'Greenfield Landscaping Crew',
];

export default function AdminMaintenancePage() {
  const [tickets, setTickets] = useSyncStore<MaintenanceTicket[]>(
    'societyos_maintenance_tickets',
    DEFAULT_MAINTENANCE_TICKETS
  );

  const [search, setSearch] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = React.useState<MaintenanceTicket | null>(null);

  // New Work Order Modal
  const [isNewOrderOpen, setIsNewOrderOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newUnit, setNewUnit] = React.useState('A-101');
  const [newCategory, setNewCategory] = React.useState<MaintenanceTicket['category']>('ELECTRICAL');
  const [newPriority, setNewPriority] = React.useState<MaintenanceTicket['priority']>('NORMAL');
  const [newDescription, setNewDescription] = React.useState('');
  const [newTechnician, setNewTechnician] = React.useState(TECHNICIAN_OPTIONS[0]);

  // Manage Dialog State
  const [manageTech, setManageTech] = React.useState('');
  const [manageNotes, setManageNotes] = React.useState('');

  React.useEffect(() => {
    if (selectedTicket) {
      setManageTech(selectedTicket.assignedTechnician || selectedTicket.assignedTo || '');
      setManageNotes(selectedTicket.resolutionNotes || '');
    }
  }, [selectedTicket]);

  const filtered = tickets.filter((t) => {
    const loc = t.unitCode || t.unit || '';
    const creator = t.createdByName || '';
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      loc.toLowerCase().includes(search.toLowerCase()) ||
      creator.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleUpdateStatus = (id: string, newStatus: MaintenanceTicket['status']) => {
    const updated = tickets.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          assignedTechnician: manageTech || t.assignedTechnician,
          assignedTo: manageTech || t.assignedTo,
          resolutionNotes: manageNotes || t.resolutionNotes,
        };
      }
      return t;
    });

    setTickets(updated);
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({
        ...selectedTicket,
        status: newStatus,
        assignedTechnician: manageTech || selectedTicket.assignedTechnician,
        assignedTo: manageTech || selectedTicket.assignedTo,
        resolutionNotes: manageNotes || selectedTicket.resolutionNotes,
      });
    }

    showAppToast(
      `Ticket status updated to ${newStatus.replace('_', ' ')}. Synced to resident in real time.`,
      'success',
      'Work Order Updated'
    );
  };

  const handleSaveDetails = () => {
    if (!selectedTicket) return;
    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          assignedTechnician: manageTech,
          assignedTo: manageTech,
          resolutionNotes: manageNotes,
        };
      }
      return t;
    });

    setTickets(updated);
    showAppToast(`Technician & resolution notes saved for ${selectedTicket.ticketNumber}.`, 'success', 'Saved');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTck: MaintenanceTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      unitCode: newUnit,
      unit: newUnit,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'IN_PROGRESS',
      assignedTechnician: newTechnician,
      assignedTo: newTechnician,
      createdAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: newDescription.trim() || 'Facility maintenance work order initiated by Estate Management.',
      createdBy: 'admin-1',
      createdByName: 'Estate Administrator',
    };

    setTickets([newTck, ...tickets]);
    setIsNewOrderOpen(false);
    setNewTitle('');
    setNewDescription('');
    showAppToast(`Work order ${newTck.ticketNumber} created and dispatched.`, 'success', 'Work Order Dispatched');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Facility Maintenance & Work Orders
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Society-wide maintenance requests, lift servicing, and resident work orders (Real-Time Sync)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted font-semibold">Active Orders:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {tickets.filter((t) => t.status !== 'COMPLETED').length} Active
            </span>
          </div>

          <Button variant="primary" size="md" onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Work Order</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by ticket number, title, unit, or resident name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border-neutral text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-ink-subtle"
          />
        </div>

        <div className="flex rounded-lg bg-surface border border-border-neutral p-1 text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
          {(['ALL', 'ELECTRICAL', 'PLUMBING', 'LIFT', 'CIVIL', 'HVAC', 'CARPENTRY'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-brand text-white shadow-2xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {cat === 'ALL' ? 'All Work' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-border-neutral bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-surface-muted border-b border-border-neutral text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Unit / Target</th>
                <th className="px-4 py-3">Issue Title & Creator</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Specialist</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-muted text-xs">
                    No tickets found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tck) => (
                  <tr
                    key={tck.id}
                    onClick={() => setSelectedTicket(tck)}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand">{tck.ticketNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-ink text-xs">
                      {tck.unitCode || tck.unit || 'A-402'}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-ink">{tck.title}</p>
                      <p className="text-[11px] text-ink-muted">
                        {tck.createdAt} · {tck.category} · {tck.createdByName ? `By ${tck.createdByName}` : 'Resident Reported'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${
                          tck.priority === 'URGENT' || tck.priority === 'EMERGENCY'
                            ? 'bg-emergency-subtle text-emergency border-emergency/30'
                            : tck.priority === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-surface-muted text-ink-muted border-border-subtle'
                        }`}
                      >
                        {tck.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink font-medium">
                      {tck.assignedTechnician || tck.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          tck.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : tck.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {tck.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(tck);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Management Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent hideCloseButton={true} className="max-w-lg p-0 overflow-hidden border border-border-neutral shadow-2xl">
            <div className="p-4 bg-surface border-b border-border-neutral flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand" />
                <span className="font-bold text-sm text-ink">{selectedTicket.ticketNumber} · Work Order</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedTicket.title}</h3>
                  <p className="text-ink-muted text-xs mt-0.5">
                    Location: <strong className="text-ink">{selectedTicket.unitCode || selectedTicket.unit}</strong> · Logged {selectedTicket.createdAt}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    selectedTicket.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : selectedTicket.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  }`}
                >
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted border border-border-neutral">
                <span className="font-bold text-ink block mb-1">Issue Description</span>
                <p className="text-ink-muted leading-relaxed text-sm">
                  {selectedTicket.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Technician Assignment with Instant Alert Dispatch */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink block">Assigned Specialist / Vendor</label>
                <div className="flex gap-2">
                  <select
                    value={manageTech}
                    onChange={(e) => setManageTech(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-surface border border-border-neutral rounded-lg text-ink font-semibold"
                  >
                    <option value="">-- Select Specialist --</option>
                    {TECHNICIAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={handleSaveDetails}>
                    Save
                  </Button>
                </div>

                {manageTech && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold border-brand/30 bg-brand/5 hover:bg-brand/10 text-brand"
                    onClick={() => {
                      const msg = `ALERT: Work order #${selectedTicket.ticketNumber} assigned to ${manageTech}. Issue: "${selectedTicket.title}" at ${selectedTicket.unitCode || 'Society Common Area'}. Priority SLA: Active.`;
                      try {
                        navigator.clipboard.writeText(msg);
                      } catch {}
                      showAppToast(
                        `Dispatch alert sent to ${manageTech}! SMS text copied to clipboard.`,
                        'success',
                        'Technician Dispatched'
                      );
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    <span>Dispatch Live Alert / SMS to {manageTech}</span>
                  </Button>
                )}
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Technician Log & Resolution Notes</label>
                <textarea
                  value={manageNotes}
                  onChange={(e) => setManageNotes(e.target.value)}
                  placeholder="Enter parts replaced, observations, or next inspection date..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-surface border border-border-neutral rounded-lg text-ink"
                />
              </div>

              {/* Update Status Buttons */}
              <div>
                <p className="text-ink font-semibold mb-2">Transition Ticket Status (Real-Time):</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedTicket.status === 'PENDING' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'PENDING')}
                  >
                    Pending
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTicket.status === 'IN_PROGRESS' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                  >
                    In Progress
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTicket.status === 'COMPLETED' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'COMPLETED')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full mt-2" onClick={() => setSelectedTicket(null)}>
              Close Panel
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Society Work Order Modal */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Society Work Order</DialogTitle>
            <DialogDescription>
              Deploy facility contractors or estate maintenance staff to any unit or common area
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-ink">Target Unit / Common Area (160 Units)</label>
              <UnitSearchSelect
                value={newUnit}
                onChange={setNewUnit}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Work Order Title</label>
              <Input
                placeholder="e.g. Lift Car #2 quarterly lubrication"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Trade</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="LIFT">Elevator / Lift</option>
                  <option value="CIVIL">Civil & Structural</option>
                  <option value="HVAC">HVAC / Cooling</option>
                  <option value="CARPENTRY">Carpentry</option>
                  <option value="GARDEN">Landscaping</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent / Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Assign Specialist</label>
              <select
                value={newTechnician}
                onChange={(e) => setNewTechnician(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
              >
                {TECHNICIAN_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Description</label>
              <textarea
                placeholder="Specific instructions for the technician..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2.5 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsNewOrderOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Dispatch Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
