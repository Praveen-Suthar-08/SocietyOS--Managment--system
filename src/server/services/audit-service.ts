import 'server-only';
import { ObjectId } from 'mongodb';
import { mongoDb } from '@/lib/db/mongodb';

export interface AuditLogInput {
  societyId: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: Record<string, unknown>;
}

export interface AuditLogRecord extends AuditLogInput {
  _id?: ObjectId;
  timestamp: Date;
}

export class AuditService {
  private collectionName = 'auditLogs';

  private get collection() {
    return mongoDb.collection<AuditLogRecord>(this.collectionName);
  }

  async logAction(input: AuditLogInput): Promise<void> {
    try {
      await this.collection.insertOne({
        ...input,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('CRITICAL: Failed to write audit log:', err);
      // In production, send to fallback syslog or queue
    }
  }

  async log(params: {
    societyId: string;
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await this.logAction({
      societyId: params.societyId,
      actorId: params.userId || 'system',
      actorRole: 'USER',
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      outcome: 'SUCCESS',
      details: params.details,
    });
  }

  async getLogs(
    societyId: string,
    options: {
      page?: number;
      limit?: number;
      action?: string;
      resourceType?: string;
      actorId?: string;
    } = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { societyId };
    if (options.action) filter.action = options.action;
    if (options.resourceType) filter.resourceType = options.resourceType;
    if (options.actorId) filter.actorId = options.actorId;

    const [items, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const auditService = new AuditService();
