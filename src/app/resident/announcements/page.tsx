'use client';

import * as React from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  History,
  Shield,
  Eye,
  X,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSyncStore } from '@/lib/sync-store';
import { DEFAULT_ANNOUNCEMENTS, Announcement } from '@/app/admin/announcements/page';

export default function ResidentAnnouncementsPage() {
  const [allAnnouncements] = useSyncStore<Announcement[]>(
    'societyos_admin_announcements',
    DEFAULT_ANNOUNCEMENTS
  );

  // Filter only published notices visible to all or residents
  const announcements = allAnnouncements.filter(
    (a) => a.status === 'PUBLISHED' && (a.audience === 'ALL' || a.audience === 'RESIDENTS')
  );

  const [selectedItem, setSelectedItem] = React.useState<Announcement | null>(null);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border-neutral">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
          Society Notices & Announcements
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Official bulletins and operational notices published by the Greenfield Heights Management Committee
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <Card
            key={item._id}
            onClick={() => setSelectedItem(item)}
            className="p-5 border border-border-neutral bg-surface shadow-xs hover:border-brand/40 transition-all cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.priority === 'URGENT' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" /> URGENT
                    </Badge>
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-subtle text-brand border border-brand/20">
                    {item.audience === 'ALL' ? 'All Residents' : item.audience}
                  </span>
                  <span className="text-xs text-ink-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {item.publishedAt}
                  </span>
                </div>

                <span className="text-xs font-semibold text-brand group-hover:underline flex items-center gap-1">
                  View full details &gt;
                </span>
              </div>

              <h2 className="text-lg font-bold text-ink font-display group-hover:text-brand transition-colors">
                {item.title}
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">
                {item.body}
              </p>

              {item.correctionHistory && item.correctionHistory.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Has {item.correctionHistory.length} official correction(s)</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Announcement Full Details Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-surface border border-border-neutral rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-neutral">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Official Society Notice</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {selectedItem.priority === 'URGENT' && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" /> URGENT
                  </Badge>
                )}
                <span className="font-semibold px-2 py-0.5 rounded bg-brand-subtle text-brand border border-brand/20">
                  Target: {selectedItem.audience}
                </span>
                <span className="text-ink-muted">Published: {selectedItem.publishedAt}</span>
                {selectedItem.author && (
                  <span className="text-ink-muted">By: <strong className="text-ink">{selectedItem.author}</strong></span>
                )}
              </div>

              <h2 className="text-xl font-bold font-display text-ink leading-snug">
                {selectedItem.title}
              </h2>

              <div className="p-4 rounded-xl bg-surface-muted/50 border border-border-neutral text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
                {selectedItem.body}
              </div>

              {/* Safety Correction History */}
              {selectedItem.correctionHistory && selectedItem.correctionHistory.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <History className="w-4 h-4" />
                    <span>Authoritative Correction Log ({selectedItem.correctionHistory.length})</span>
                  </div>
                  {selectedItem.correctionHistory.map((corr, idx) => (
                    <div key={idx} className="pl-3 border-l-2 border-amber-500/50 text-ink space-y-0.5">
                      <p className="font-semibold text-[11px] text-ink-muted">{corr.editedAt}:</p>
                      <p>{corr.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedItem(null)}
              >
                Close Notice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
