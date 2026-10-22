import 'server-only';
import { ObjectId } from 'mongodb';
import { mongoDb } from '@/lib/db/mongodb';
import { auditService } from './audit-service';

export type AnnouncementAudience = 'ALL' | 'RESIDENTS' | 'SECURITY';
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AnnouncementPriority = 'NORMAL' | 'URGENT';

export interface CorrectionRecord {
  editedAt: Date;
  editorId: string;
  reason: string;
  previousTitle?: string;
  previousBody?: string;
}

export interface AnnouncementRecord {
  _id?: ObjectId;
  societyId: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  publishedBy: string;
  publishedAt?: Date;
  expiresAt?: Date;
  correctionHistory: CorrectionRecord[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AnnouncementService {
  private get collection() {
    return mongoDb.collection<AnnouncementRecord>('announcements');
  }

  private get readsCollection() {
    return mongoDb.collection('announcementReads');
  }

  /**
   * Creates a new announcement in DRAFT or PUBLISHED state
   */
  async createAnnouncement(input: {
    societyId: string;
    title: string;
    body: string;
    audience: AnnouncementAudience;
    priority?: AnnouncementPriority;
    publishImmediately?: boolean;
    expiresAt?: Date;
    actorId: string;
    actorRole: string;
  }) {
    const isPublish = Boolean(input.publishImmediately);
    const now = new Date();

    const announcement: AnnouncementRecord = {
      societyId: input.societyId,
      title: input.title.trim(),
      body: input.body.trim(),
      audience: input.audience,
      status: isPublish ? 'PUBLISHED' : 'DRAFT',
      priority: input.priority || 'NORMAL',
      publishedBy: input.actorId,
      publishedAt: isPublish ? now : undefined,
      expiresAt: input.expiresAt,
      correctionHistory: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(announcement);
    const announcementId = result.insertedId;

    await auditService.logAction({
      societyId: input.societyId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: isPublish ? 'ANNOUNCEMENT_PUBLISHED' : 'ANNOUNCEMENT_DRAFT_CREATED',
      resourceType: 'ANNOUNCEMENT',
      resourceId: announcementId.toString(),
      outcome: 'SUCCESS',
      details: { title: announcement.title, audience: announcement.audience, priority: announcement.priority },
    });

    return { ...announcement, _id: announcementId };
  }

  /**
   * Updates an announcement.
   * CRITICAL SECURITY RULE: If already published, appends an immutable correction entry.
   */
  async updateAnnouncement(input: {
    announcementId: string;
    societyId: string;
    title: string;
    body: string;
    audience?: AnnouncementAudience;
    priority?: AnnouncementPriority;
    correctionReason?: string;
    actorId: string;
    actorRole: string;
  }) {
    const objectId = new ObjectId(input.announcementId);
    const existing = await this.collection.findOne({
      _id: objectId,
      societyId: input.societyId,
    });

    if (!existing) {
      throw new Error('Announcement not found');
    }

    const updates: Partial<AnnouncementRecord> = {
      title: input.title.trim(),
      body: input.body.trim(),
      updatedAt: new Date(),
    };

    if (input.audience) updates.audience = input.audience;
    if (input.priority) updates.priority = input.priority;

    let correctionEntry: CorrectionRecord | undefined;

    // If already published, append to correction history rather than overwriting silently
    if (existing.status === 'PUBLISHED') {
      if (!input.correctionReason) {
        throw new Error('A correction reason is required when editing an already published safety notice.');
      }

      correctionEntry = {
        editedAt: new Date(),
        editorId: input.actorId,
        reason: input.correctionReason.trim(),
        previousTitle: existing.title !== input.title ? existing.title : undefined,
        previousBody: existing.body !== input.body ? existing.body : undefined,
      };
    }

    const updated = await this.collection.findOneAndUpdate(
      { _id: objectId, societyId: input.societyId, version: existing.version },
      {
        $set: updates,
        ...(correctionEntry ? { $push: { correctionHistory: correctionEntry } } : {}),
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    await auditService.logAction({
      societyId: input.societyId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: 'ANNOUNCEMENT_UPDATED',
      resourceType: 'ANNOUNCEMENT',
      resourceId: input.announcementId,
      outcome: 'SUCCESS',
      details: {
        wasPublished: existing.status === 'PUBLISHED',
        correctionReason: input.correctionReason,
      },
    });

    return updated;
  }

  /**
   * Publishes a draft announcement
   */
  async publishAnnouncement(announcementId: string, societyId: string, actorId: string, actorRole: string) {
    const objectId = new ObjectId(announcementId);
    const updated = await this.collection.findOneAndUpdate(
      { _id: objectId, societyId, status: 'DRAFT' },
      {
        $set: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      throw new Error('Draft announcement not found or already published');
    }

    await auditService.logAction({
      societyId,
      actorId,
      actorRole,
      action: 'ANNOUNCEMENT_PUBLISHED',
      resourceType: 'ANNOUNCEMENT',
      resourceId: announcementId,
      outcome: 'SUCCESS',
      details: { title: updated.title },
    });

    return updated;
  }

  /**
   * Archives an announcement
   */
  async archiveAnnouncement(announcementId: string, societyId: string, actorId: string, actorRole: string) {
    const objectId = new ObjectId(announcementId);
    const updated = await this.collection.findOneAndUpdate(
      { _id: objectId, societyId },
      {
        $set: {
          status: 'ARCHIVED',
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!updated) throw new Error('Announcement not found');

    await auditService.logAction({
      societyId,
      actorId,
      actorRole,
      action: 'ANNOUNCEMENT_ARCHIVED',
      resourceType: 'ANNOUNCEMENT',
      resourceId: announcementId,
      outcome: 'SUCCESS',
      details: { title: updated.title },
    });

    return updated;
  }

  /**
   * Gets published announcements filtered by audience for a role
   */
  async getAnnouncementsForRole(societyId: string, role: 'RESIDENT' | 'SECURITY' | 'ADMIN') {
    const audienceList: AnnouncementAudience[] = ['ALL', role === 'RESIDENT' ? 'RESIDENTS' : 'SECURITY'];
    const audienceFilter =
      role === 'ADMIN'
        ? {} // Admin sees all
        : { audience: { $in: audienceList } };

    return this.collection
      .find({
        societyId,
        status: 'PUBLISHED',
        ...audienceFilter,
      })
      .sort({ priority: -1, publishedAt: -1 })
      .toArray();
  }

  /**
   * Admin view of all announcements (Drafts, Published, Archived)
   */
  async getAllAnnouncements(societyId: string, status?: AnnouncementStatus) {
    const filter: Record<string, unknown> = { societyId };
    if (status) filter.status = status;

    return this.collection.find(filter).sort({ createdAt: -1 }).toArray();
  }
}

export const announcementService = new AnnouncementService();
