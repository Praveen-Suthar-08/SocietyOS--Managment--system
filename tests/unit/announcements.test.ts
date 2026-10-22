import { describe, it, expect } from 'vitest';
import {
  AnnouncementAudience,
  AnnouncementStatus,
  CorrectionRecord,
} from '@/server/services/announcement-service';

interface MockAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  correctionHistory: CorrectionRecord[];
}

function updateNotice(
  notice: MockAnnouncement,
  newTitle: string,
  newBody: string,
  correctionReason?: string
) {
  if (notice.status === 'PUBLISHED') {
    if (!correctionReason || correctionReason.trim() === '') {
      throw new Error('A correction reason is required when editing an already published safety notice.');
    }

    const correction: CorrectionRecord = {
      editedAt: new Date(),
      editorId: 'editor_1',
      reason: correctionReason.trim(),
      previousTitle: notice.title !== newTitle ? notice.title : undefined,
      previousBody: notice.body !== newBody ? notice.body : undefined,
    };

    return {
      ...notice,
      title: newTitle,
      body: newBody,
      correctionHistory: [...notice.correctionHistory, correction],
    };
  }

  return {
    ...notice,
    title: newTitle,
    body: newBody,
  };
}

describe('Announcement Lifecycle & Safety Notice Integrity', () => {
  const publishedNotice: MockAnnouncement = {
    id: 'ann_1',
    title: 'Fire Alarm Test Notice',
    body: 'Inspection at 1:00 PM.',
    audience: 'ALL',
    status: 'PUBLISHED',
    correctionHistory: [],
  };

  const draftNotice: MockAnnouncement = {
    id: 'ann_2',
    title: 'Upcoming Pool Maintenance',
    body: 'Pool closed on Tuesday.',
    audience: 'RESIDENTS',
    status: 'DRAFT',
    correctionHistory: [],
  };

  it('allows draft notices to be updated without requiring a correction reason', () => {
    const updated = updateNotice(draftNotice, 'Updated Pool Maintenance', 'New schedule details');
    expect(updated.title).toBe('Updated Pool Maintenance');
    expect(updated.correctionHistory).toHaveLength(0);
  });

  it('prohibits silent editing of already published notices without a correction reason', () => {
    expect(() =>
      updateNotice(publishedNotice, 'Altered Fire Alarm Notice', 'Different time without explanation')
    ).toThrow(/A correction reason is required/);
  });

  it('appends an audited correction entry when updating a published notice with a reason', () => {
    const updated = updateNotice(
      publishedNotice,
      'Fire Alarm Test Notice (Rescheduled)',
      'Inspection moved to 3:00 PM.',
      'Rescheduled by local fire brigade notification.'
    );

    expect(updated.title).toBe('Fire Alarm Test Notice (Rescheduled)');
    expect(updated.correctionHistory).toHaveLength(1);
    expect(updated.correctionHistory[0].reason).toBe('Rescheduled by local fire brigade notification.');
    expect(updated.correctionHistory[0].previousTitle).toBe('Fire Alarm Test Notice');
  });
});
