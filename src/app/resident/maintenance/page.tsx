'use client';

import * as React from 'react';
import {
  Wrench,
  Plus,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  User,
  ShieldAlert,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  unitCode: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'CARPENTRY' | 'CIVIL' | 'LIFT' | 'GARDEN';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: string;
  assignedTechnician?: string;
  createdAt: string;
  description: string;
  unit?: string;
  createdBy?: string;
  createdByName?: string;
  resolutionNotes?: string;
}

export const DEFAULT_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'TCK-1092',
    unitCode: 'A-402',
    unit: 'Unit A-402',
    title: 'Balcony Light Sensor Fault',
    category: 'ELECTRICAL',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    assignedTo: 'Kailash Nath (Lead Electrician)',
    assignedTechnician: 'Kailash Nath (Lead Electrician)',
    createdAt: 'Today, 10:30 AM',
    description: 'The automatic twilight sensor on the north balcony is flickering continuously when activated.',
    createdBy: 'resident-user-1',
    createdByName: 'Aarav Sharma (A-402)',
    resolutionNotes: 'Spare photocell relay requisitioned from central stores. Installation scheduled for 3:00 PM.',
  },
  {
    id: 't-2',
    ticketNumber: 'TCK-1093',
    unitCode: 'Tower B',
    unit: 'Tower B',
    title: 'Passenger Lift #2 Vibration & Creak',
    category: 'LIFT',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedTo: 'Otis Field Engineer',
    assignedTechnician: 'Otis Field Engineer',
    createdAt: 'Today, 08:15 AM',
    description: 'Vibration detected during descent between floors 4 and 2 in Tower B lift car.',
    createdBy: 'admin-1',
    createdByName: 'Estate Admin',
    resolutionNotes: 'Guide rail lubricant scheduled. Brake pads inspected and verified within safety limits.',
  },
  {
    id: 't-3',
    ticketNumber: 'TCK-1070',
    unitCode: 'A-402',
    unit: 'Unit A-402',
    title: 'Kitchen Sink Trap Water Drainage Slow',
    category: 'PLUMBING',
    priority: 'LOW',
    status: 'COMPLETED',
    assignedTo: 'Vinod Verma (Plumber)',
    assignedTechnician: 'Vinod Verma (Plumber)',
    createdAt: 'Oct 12, 2026',
    description: 'Under-sink drainage pipe cleaned and new gasket installed.',
    createdBy: 'resident-user-1',
    createdByName: 'Aarav Sharma (A-402)',
    resolutionNotes: 'Drain trap cleared of mineral buildup and flow tested at full capacity. Verified leak-free.',
  },
  {
    id: 't-4',
    ticketNumber: 'TCK-1094',
    unitCode: 'Basement 2',
    unit: 'Basement 2',
    title: 'Drainage Sump Pump Valve Leakage',
    category: 'PLUMBING',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'Vinod Verma (Plumber)',
    assignedTechnician: 'Vinod Verma (Plumber)',
    createdAt: 'Yesterday, 16:45',
    description: 'Check valve weeping on secondary basement sump ejection system.',
    createdBy: 'security-1',
    createdByName: 'Gate Security',
  },
  {
    id: 't-5',
    ticketNumber: 'TCK-1045',
    unitCode: 'A-402',
    unit: 'Unit A-402',
    title: 'Main Door Mortise Lock Latch Sticking',
    category: 'CARPENTRY',
    priority: 'NORMAL',
    status: 'COMPLETED',
    assignedTo: 'Ramesh Carpenter',
    assignedTechnician: 'Ramesh Carpenter',
    createdAt: 'Sep 28, 2026',
    description: 'The brass door latch cylinder sticks when unlocking from the exterior keyway.',
    createdBy: 'resident-user-1',
    createdByName: 'Aarav Sharma (A-402)',
    resolutionNotes: 'Strike plate aligned and high-lubricity graphite applied to tumbler mechanism.',
  },
];

export default function ResidentMaintenancePage() {
  const [tickets, setTickets] = useSyncStore<MaintenanceTicket[]>(
    'societyos_maintenance_tickets',
    DEFAULT_MAINTENANCE_TICKETS
  );

  const [selectedTicket, setSelectedTicket] = React.useState<MaintenanceTicket | null>(null);
  const [isNewOpen, setIsNewOpen] = React.useState(false);
  const [editingTicket, setEditingTicket] = React.useState<MaintenanceTicket | null>(null);

  // Form State for New
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<MaintenanceTicket['category']>('PLUMBING');
  const [newPriority, setNewPriority] = React.useState<MaintenanceTicket['priority']>('NORMAL');
  const [newDescription, setNewDescription] = React.useState('');

  // Form State for Edit
  const [editTitle, setEditTitle] = React.useState('');
  const [editCategory, setEditCategory] = React.useState<MaintenanceTicket['category']>('PLUMBING');
  const [editPriority, setEditPriority] = React.useState<MaintenanceTicket['priority']>('NORMAL');
  const [editDescription, setEditDescription] = React.useState('');

  // Filter tickets to show those for Unit A-402 or created by this resident
  const residentTickets = tickets.filter(
    (t) =>
      t.unitCode === 'A-402' ||
      t.unit?.includes('A-402') ||
      t.createdBy === 'resident-user-1' ||
      !t.unitCode // show general tickets if any
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newTck: MaintenanceTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      unitCode: 'A-402',
      unit: 'Unit A-402',
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'PENDING',
      createdAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      description: newDescription.trim(),
      createdBy: 'resident-user-1',
      createdByName: 'Aarav Sharma (A-402)',
    };

    setTickets([newTck, ...tickets]);
    setIsNewOpen(false);
    setNewTitle('');
    setNewDescription('');
    showAppToast(
      `Ticket ${newTck.ticketNumber} created successfully! Dispatched to Admin & Facility team.`,
      'success',
      'Issue Reported'
    );
  };

  const handleStartEdit = (ticket: MaintenanceTicket, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTicket(ticket);
    setEditTitle(ticket.title);
    setEditCategory(ticket.category);
    setEditPriority(ticket.priority);
    setEditDescription(ticket.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket || !editTitle.trim() || !editDescription.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === editingTicket.id) {
        return {
          ...t,
          title: editTitle.trim(),
          category: editCategory,
          priority: editPriority,
          description: editDescription.trim(),
        };
      }
      return t;
    });

    setTickets(updated);
    if (selectedTicket && selectedTicket.id === editingTicket.id) {
      setSelectedTicket({
        ...selectedTicket,
        title: editTitle.trim(),
        category: editCategory,
        priority: editPriority,
        description: editDescription.trim(),
      });
    }

    setEditingTicket(null);
    showAppToast(
      `Ticket ${editingTicket.ticketNumber} updated successfully. Changes synced to Admin in real time.`,
      'success',
      'Ticket Updated'
    );
  };

  const getStatusBadge = (status: MaintenanceTicket['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="brand">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="notice">In Progress</Badge>;
      default:
        return <Badge variant="neutral">Pending Dispatch</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            My Maintenance Tickets
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Service requests, technician schedules, and repairs for Unit A-402 (Synced Real-Time)
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsNewOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Report New Issue</span>
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {residentTickets.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border-neutral p-8">
            <Wrench className="w-10 h-10 mx-auto text-ink-muted mb-3" />
            <p className="text-sm font-semibold text-ink">No Maintenance Issues Reported</p>
            <p className="text-xs text-ink-muted mt-1">
              Need electrical, plumbing, or carpentary repairs? Click "Report New Issue" above.
            </p>
          </div>
        ) : (
          residentTickets.map((tck) => (
            <Card
              key={tck.id}
              onClick={() => setSelectedTicket(tck)}
              className="cursor-pointer hover:border-brand/50 hover:shadow-md transition-all group p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brand">{tck.ticketNumber}</span>
                    <span className="text-ink-subtle">·</span>
                    <Badge variant="outline">{tck.category}</Badge>
                    {getStatusBadge(tck.status)}
                    <span className="text-[11px] font-mono text-ink-muted bg-surface-muted px-2 py-0.5 rounded">
                      {tck.unitCode || tck.unit || 'A-402'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink group-hover:text-brand transition-colors">
                    {tck.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-1">{tck.description}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-ink-muted flex-shrink-0">
                  {(tck.assignedTechnician || tck.assignedTo) && (
                    <span className="hidden md:inline-flex items-center gap-1 font-medium text-ink">
                      <User className="w-3.5 h-3.5 text-brand" />
                      {tck.assignedTechnician || tck.assignedTo}
                    </span>
                  )}
                  <span className="font-mono">{tck.createdAt}</span>

                  {/* Edit Option for Creator */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-brand hover:bg-brand/10 border border-brand/20"
                    onClick={(e) => handleStartEdit(tck, e)}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Popup Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <span className="font-mono text-sm font-bold text-brand">{selectedTicket.ticketNumber}</span>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <DialogTitle className="text-lg font-bold text-ink mt-2">
                {selectedTicket.title}
              </DialogTitle>
              <DialogDescription>
                Logged for {selectedTicket.unitCode || selectedTicket.unit || 'Unit A-402'} · {selectedTicket.createdAt}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="p-3 bg-surface-muted/50 rounded-xl border border-border-neutral">
                <span className="font-bold text-ink block mb-1">Issue Description</span>
                <p className="text-ink-muted leading-relaxed text-sm">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-surface rounded-xl border border-border-neutral">
                <div>
                  <span className="text-ink-muted block font-medium">Trade Category</span>
                  <p className="font-bold text-ink mt-0.5">{selectedTicket.category}</p>
                </div>
                <div>
                  <span className="text-ink-muted block font-medium">Priority Level</span>
                  <p className="font-bold text-ink mt-0.5">{selectedTicket.priority}</p>
                </div>
                <div>
                  <span className="text-ink-muted block font-medium">Assigned Specialist</span>
                  <p className="font-bold text-ink mt-0.5">
                    {selectedTicket.assignedTechnician || selectedTicket.assignedTo || 'Pending Assignment'}
                  </p>
                </div>
                <div>
                  <span className="text-ink-muted block font-medium">Resolution Status</span>
                  <p className="font-bold text-brand mt-0.5">{selectedTicket.status}</p>
                </div>
              </div>

              {selectedTicket.resolutionNotes && (
                <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl">
                  <span className="font-bold text-brand block mb-1">Technician Resolution Log</span>
                  <p className="text-ink leading-relaxed">{selectedTicket.resolutionNotes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const t = selectedTicket;
                  setSelectedTicket(null);
                  handleStartEdit(t);
                }}
              >
                <Edit2 className="w-4 h-4 mr-1.5 text-brand" />
                <span>Edit Ticket Details</span>
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <Dialog open={!!editingTicket} onOpenChange={() => setEditingTicket(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Maintenance Ticket</DialogTitle>
              <DialogDescription>
                Modify details for {editingTicket.ticketNumber} ({editingTicket.unitCode || editingTicket.unit || 'A-402'})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-ink">Title / Summary</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as MaintenanceTicket['category'])}
                    className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="HVAC">HVAC / Air Conditioning</option>
                    <option value="CARPENTRY">Carpentry & Locks</option>
                    <option value="CIVIL">Civil & Painting</option>
                    <option value="LIFT">Elevator / Lift</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">Urgency</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as MaintenanceTicket['priority'])}
                    className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="EMERGENCY">Emergency (Leak/Spark)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Problem Details</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full mt-1 p-2.5 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditingTicket(null)}>
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

      {/* Report Issue Modal */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Maintenance Issue</DialogTitle>
            <DialogDescription>
              Submit a work order to Greenfield Heights Facilities Management
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-ink">Title / Summary</label>
              <Input
                placeholder="e.g. Geyser tripping circuit breaker"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MaintenanceTicket['category'])}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="HVAC">HVAC / Air Conditioning</option>
                  <option value="CARPENTRY">Carpentry & Locks</option>
                  <option value="CIVIL">Civil & Painting</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Urgency</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as MaintenanceTicket['priority'])}
                  className="w-full mt-1 px-3 py-2 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                  <option value="EMERGENCY">Emergency (Leak/Spark)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Problem Details</label>
              <textarea
                placeholder="Detailed description of the issue..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                required
                className="w-full mt-1 p-2.5 text-sm bg-surface border border-border-neutral rounded-lg text-ink"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Work Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
