'use client';

import * as React from 'react';
import {
  Bell,
  Plus,
  Send,
  Archive,
  Edit3,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSyncStore } from '@/lib/sync-store';
import { showAppToast } from '@/components/ui/toast-notification';

interface Correction {
  editedAt: string;
  reason: string;
  editorId: string;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  audience: 'ALL' | 'RESIDENTS' | 'SECURITY';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  priority: 'NORMAL' | 'URGENT';
  publishedAt?: string;
  author?: string;
  correctionHistory?: Correction[];
}

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    _id: '1',
    title: 'Water Supply Tank Cleaning Schedule',
    body: 'Periodic overhead water tank cleaning will occur on Thursday from 10:00 AM to 2:00 PM. Please store sufficient water for morning requirements.',
    audience: 'ALL',
    status: 'PUBLISHED',
    priority: 'NORMAL',
    publishedAt: 'Today, 9:00 AM',
    correctionHistory: [],
  },
  {
    _id: '2',
    title: 'Fire Alarm System Annual Inspection',
    body: 'Technicians will test smoke detectors across all floors on Saturday from 2:00 PM. Periodic siren sounds are expected.',
    audience: 'ALL',
    status: 'PUBLISHED',
    priority: 'URGENT',
    publishedAt: 'Yesterday, 4:30 PM',
    correctionHistory: [
      {
        editedAt: 'Yesterday, 5:15 PM',
        reason: 'Corrected inspection start time from 1:00 PM to 2:00 PM per contractor availability.',
        editorId: 'admin_1',
      },
    ],
  },
  {
    _id: '3',
    title: 'Draft: Gate 2 Visitor Access Hours Update',
    body: 'Beginning next month, Gate 2 will remain open for pedestrian access until 10:00 PM.',
    audience: 'SECURITY',
    status: 'DRAFT',
    priority: 'NORMAL',
    correctionHistory: [],
  },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useSyncStore<Announcement[]>(
    'societyos_admin_announcements',
    DEFAULT_ANNOUNCEMENTS
  );

  const [activeTab, setActiveTab] = React.useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
  const [selectedNotice, setSelectedNotice] = React.useState<Announcement | null>(null);

  // Form state
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [audience, setAudience] = React.useState<'ALL' | 'RESIDENTS' | 'SECURITY'>('ALL');
  const [priority, setPriority] = React.useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [publishImmediately, setPublishImmediately] = React.useState(true);
  const [correctionReason, setCorrectionReason] = React.useState('');

  const filtered = announcements.filter(
    (a) => activeTab === 'ALL' || a.status === activeTab
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newNotice: Announcement = {
      _id: `ann_${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      audience,
      priority,
      status: publishImmediately ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publishImmediately ? new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
      correctionHistory: [],
    };

    setAnnouncements([newNotice, ...announcements]);
    setIsComposeOpen(false);
    setTitle('');
    setBody('');
    showAppToast(
      publishImmediately ? 'Notice published and broadcast society-wide!' : 'Notice saved as draft.',
      'success',
      'Announcement Saved'
    );
  };

  const handlePublish = (id: string) => {
    const timeStr = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    setAnnouncements(
      announcements.map((a) =>
        a._id === id ? { ...a, status: 'PUBLISHED', publishedAt: timeStr } : a
      )
    );
    showAppToast('Notice published live to residents and security!', 'success', 'Published');
  };

  const handleArchive = (id: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a._id === id ? { ...a, status: 'ARCHIVED' } : a
      )
    );
    showAppToast('Notice moved to archive.', 'info', 'Archived');
  };

  const handleUnarchive = (id: string) => {
    const timeStr = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    setAnnouncements(
      announcements.map((a) =>
        a._id === id ? { ...a, status: 'PUBLISHED', publishedAt: `Restored ${timeStr}` } : a
      )
    );
    showAppToast('Announcement unarchived and republished!', 'success', 'Notice Restored');
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;

    const timeStr = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const isPublished = editingAnnouncement.status === 'PUBLISHED';
    const newCorrections = isPublished
      ? [
          ...(editingAnnouncement.correctionHistory || []),
          {
            editedAt: timeStr,
            reason: correctionReason.trim(),
            editorId: 'admin_1',
          },
        ]
      : editingAnnouncement.correctionHistory;

    setAnnouncements(
      announcements.map((a) =>
        a._id === editingAnnouncement._id
          ? {
              ...a,
              title,
              body,
              audience,
              priority,
              correctionHistory: newCorrections,
            }
          : a
      )
    );

    setEditingAnnouncement(null);
    setCorrectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#17231D]">
            Announcements & Bulletins
          </h1>
          <p className="text-sm text-[#66716A] mt-0.5">
            Publish official notices with audience targeting and safety correction history
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsComposeOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Publish Notice</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9DED8] pb-1 overflow-x-auto">
        {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-[#276749] text-white'
                : 'text-[#66716A] hover:bg-[#EFF3EF] hover:text-[#17231D]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Announcement Cards List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Card key={item._id} className="p-5 bg-surface text-ink border-border-neutral shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.priority === 'URGENT' && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" /> URGENT
                      </Badge>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EFF3EF] text-[#276749] border border-[#D9DED8]">
                      Target: {item.audience}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        item.status === 'PUBLISHED'
                          ? 'bg-[#EAF3ED] text-[#276749] border border-[#B7D5C4]'
                          : item.status === 'DRAFT'
                          ? 'bg-[#FDF6EE] text-[#B86A2B] border border-[#F8DCBF]'
                          : 'bg-[#F2F4F7] text-[#475467] border border-[#EAECF0]'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.publishedAt && (
                      <span className="text-xs text-[#66716A] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {item.publishedAt}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-ink font-display">{item.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{item.body}</p>

                  {/* Correction History Disclosure */}
                  {item.correctionHistory && item.correctionHistory.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-[#FDF6EE] border border-[#F8DCBF] text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#B86A2B] mb-1">
                        <History className="w-3.5 h-3.5" />
                        <span>Notice Correction History ({item.correctionHistory.length})</span>
                      </div>
                      {item.correctionHistory.map((corr, idx) => (
                        <p key={idx} className="text-[#66716A]">
                          • <strong>{corr.editedAt}:</strong> {corr.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAnnouncement(item);
                      setTitle(item.title);
                      setBody(item.body);
                      setAudience(item.audience);
                      setPriority(item.priority);
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>

                  {item.status === 'DRAFT' && (
                    <Button variant="primary" size="sm" onClick={() => handlePublish(item._id)}>
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Publish
                    </Button>
                  )}

                  {item.status === 'PUBLISHED' && (
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(item._id)}>
                      <Archive className="w-3.5 h-3.5 mr-1 text-[#66716A]" />
                      Archive
                    </Button>
                  )}

                  {item.status === 'ARCHIVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnarchive(item._id)}
                      className="text-brand border-brand/30 hover:bg-brand/10 font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1 text-brand" />
                      Unarchive / Restore
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center bg-white border border-[#D9DED8] rounded-xl text-sm text-[#66716A]">
            No announcements found under {activeTab}.
          </div>
        )}
      </div>

      {/* Compose Announcement Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#D9DED8] shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold font-display text-[#17231D] mb-1">
              Compose Society Notice
            </h3>
            <p className="text-xs text-[#66716A] mb-4">
              Published notices will be broadcast to residents and security inboxes.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Title"
                placeholder="e.g. Scheduled Lift Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231D] mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#D9DED8] rounded-lg text-sm bg-white"
                  >
                    <option value="ALL">All (Residents & Staff)</option>
                    <option value="RESIDENTS">Residents Only</option>
                    <option value="SECURITY">Security Staff Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231D] mb-1.5">
                    Urgency Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#D9DED8] rounded-lg text-sm bg-white"
                  >
                    <option value="NORMAL">Normal Notice</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231D] mb-1.5">
                  Notice Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Provide detailed instructions or schedule..."
                  className="w-full px-3 py-2 border border-[#D9DED8] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishNow"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="rounded text-[#276749]"
                />
                <label htmlFor="publishNow" className="text-xs text-[#17231D] font-medium">
                  Publish immediately (otherwise save as Draft)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {publishImmediately ? 'Publish Now' : 'Save Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal with Mandatory Correction Reason */}
      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#D9DED8] shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold font-display text-[#17231D] mb-1">
              Edit Notice: {editingAnnouncement.title}
            </h3>
            <p className="text-xs text-[#66716A] mb-4">
              {editingAnnouncement.status === 'PUBLISHED'
                ? 'Notice is already published. Modifying it requires a documented correction reason.'
                : 'Modify draft notice before publication.'}
            </p>

            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#17231D] mb-1.5">
                  Notice Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#D9DED8] rounded-lg text-sm"
                  required
                />
              </div>

              {editingAnnouncement.status === 'PUBLISHED' && (
                <div className="p-3 rounded-lg bg-[#FDF6EE] border border-[#F8DCBF] space-y-1.5">
                  <label className="block text-xs font-bold text-[#B86A2B]">
                    Correction Reason (Mandatory for Published Notices)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Updated technician arrival time..."
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#D9DED8] rounded-md text-xs bg-white"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingAnnouncement(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
