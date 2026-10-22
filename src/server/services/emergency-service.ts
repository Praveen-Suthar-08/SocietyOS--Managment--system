import 'server-only';
import { ObjectId, Collection } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { auditService } from './audit-service';

export type EmergencyCategory =
  | 'MEDICAL'
  | 'FIRE'
  | 'SECURITY'
  | 'LIFT_ENTRAPMENT'
  | 'GAS_LEAK'
  | 'OTHER';

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export type IncidentStatus =
  | 'ACTIVE'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'RESOLVED'
  | 'CLOSED';

export interface EmergencyIncident {
  _id?: ObjectId;
  incidentNumber: string;
  societyId: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  unitId: string;
  category: EmergencyCategory;
  severity: EmergencySeverity;
  locationDescription: string;
  description: string;
  status: IncidentStatus;
  assignedResponder?: {
    id: string;
    name: string;
    assignedAt: Date;
  };
  acknowledgedAt?: Date;
  acknowledgedBy?: {
    id: string;
    name: string;
  };
  resolvedAt?: Date;
  resolvedBy?: {
    id: string;
    name: string;
  };
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentTimelineEvent {
  _id?: ObjectId;
  incidentId: string;
  societyId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  notes?: string;
  timestamp: Date;
}

export interface OutboxEvent {
  _id?: ObjectId;
  societyId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'SENT' | 'FAILED';
  retryCount: number;
  createdAt: Date;
  sentAt?: Date;
}

// In-memory resilient store for demo/development or MongoDB connection timeout resilience
declare global {
  var _memoryIncidents: EmergencyIncident[] | undefined;
  var _memoryTimeline: IncidentTimelineEvent[] | undefined;
}

if (!global._memoryIncidents) {
  global._memoryIncidents = [];
}
if (!global._memoryTimeline) {
  global._memoryTimeline = [];
}

export class EmergencyService {
  private incidentsCol?: Collection<EmergencyIncident>;
  private timelineCol?: Collection<IncidentTimelineEvent>;
  private outboxCol?: Collection<OutboxEvent>;

  private async getIncidentsCollection(): Promise<Collection<EmergencyIncident> | null> {
    try {
      if (!this.incidentsCol) {
        const db = await getDb();
        const col = db.collection<EmergencyIncident>('emergencyIncidents');
        col.createIndex({ societyId: 1, status: 1 }).catch(() => {});
        col.createIndex({ societyId: 1, incidentNumber: 1 }, { unique: true }).catch(() => {});
        col.createIndex({ societyId: 1, createdAt: -1 }).catch(() => {});
        this.incidentsCol = col;
      }
      return this.incidentsCol;
    } catch (err) {
      console.warn('⚠️ MongoDB connection unavailable for emergency incidents, falling back to memory store:', (err as Error).message);
      return null;
    }
  }

  private async getTimelineCollection(): Promise<Collection<IncidentTimelineEvent> | null> {
    try {
      if (!this.timelineCol) {
        const db = await getDb();
        const col = db.collection<IncidentTimelineEvent>('incidentEvents');
        col.createIndex({ incidentId: 1, timestamp: 1 }).catch(() => {});
        this.timelineCol = col;
      }
      return this.timelineCol;
    } catch {
      return null;
    }
  }

  private async getOutboxCollection(): Promise<Collection<OutboxEvent> | null> {
    try {
      if (!this.outboxCol) {
        const db = await getDb();
        this.outboxCol = db.collection<OutboxEvent>('outboxEvents');
      }
      return this.outboxCol;
    } catch {
      return null;
    }
  }

  /**
   * Generates sequential or timestamped incident identifier INC-YYYYMMDD-XXXX
   */
  private generateIncidentNumber(): string {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INC-${dateStr}-${rand}`;
  }

  /**
   * Determine default severity based on emergency category
   */
  private calculateSeverity(category: EmergencyCategory): EmergencySeverity {
    switch (category) {
      case 'FIRE':
      case 'GAS_LEAK':
        return 'CRITICAL';
      case 'MEDICAL':
      case 'LIFT_ENTRAPMENT':
      case 'SECURITY':
        return 'HIGH';
      default:
        return 'MEDIUM';
    }
  }

  /**
   * SAFETY WORKFLOW: Durable MongoDB persistence with automatic fallback to in-memory store
   */
  async triggerSOS(
    societyId: string,
    reporter: { id: string; name: string; phone: string; unitId: string },
    data: {
      category: EmergencyCategory;
      locationDescription: string;
      description: string;
      severity?: EmergencySeverity;
    }
  ): Promise<EmergencyIncident> {
    const now = new Date();
    const incidentNumber = this.generateIncidentNumber();
    const severity = data.severity || this.calculateSeverity(data.category);

    const incident: EmergencyIncident = {
      incidentNumber,
      societyId,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reporterPhone: reporter.phone,
      unitId: reporter.unitId,
      category: data.category,
      severity,
      locationDescription: data.locationDescription.trim(),
      description: data.description.trim(),
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    const incidentsCol = await this.getIncidentsCollection();
    const timelineCol = await this.getTimelineCollection();
    const outboxCol = await this.getOutboxCollection();

    if (incidentsCol) {
      try {
        const insertResult = await incidentsCol.insertOne(incident);
        const incidentId = insertResult.insertedId.toString();

        if (timelineCol) {
          await timelineCol.insertOne({
            incidentId,
            societyId,
            actorId: reporter.id,
            actorName: reporter.name,
            actorRole: 'RESIDENT',
            action: 'INCIDENT_TRIGGERED',
            notes: `SOS triggered: ${data.category} in unit ${reporter.unitId}. Description: ${data.description}`,
            timestamp: now,
          }).catch(() => {});
        }

        auditService.log({
          societyId,
          userId: reporter.id,
          action: 'EMERGENCY_TRIGGERED',
          resourceType: 'EMERGENCY_INCIDENT',
          resourceId: incidentId,
          details: {
            incidentNumber,
            category: data.category,
            severity,
            unitId: reporter.unitId,
          },
        }).catch(() => {});

        if (outboxCol) {
          await outboxCol.insertOne({
            societyId,
            eventType: 'EMERGENCY_ALERT',
            payload: {
              incidentId,
              incidentNumber,
              category: data.category,
              severity,
              unitId: reporter.unitId,
              timestamp: now.toISOString(),
            },
            status: 'PENDING',
            retryCount: 0,
            createdAt: now,
          }).catch(() => {});
        }

        const created = { ...incident, _id: insertResult.insertedId };
        global._memoryIncidents = [created, ...(global._memoryIncidents || [])];
        return created;
      } catch (err) {
        console.warn('⚠️ MongoDB insert failed, saving to in-memory fallback:', (err as Error).message);
      }
    }

    // In-memory fallback
    const memIncident: EmergencyIncident = {
      ...incident,
      _id: new ObjectId(),
    };
    global._memoryIncidents = [memIncident, ...(global._memoryIncidents || [])];
    return memIncident;
  }

  /**
   * Security or Administrator acknowledges the incident
   */
  async acknowledgeIncident(
    societyId: string,
    incidentId: string,
    actor: { id: string; name: string; role: string },
    notes?: string
  ): Promise<EmergencyIncident> {
    const now = new Date();
    const incidentsCol = await this.getIncidentsCollection();
    const timelineCol = await this.getTimelineCollection();

    if (incidentsCol) {
      try {
        let objectId: ObjectId | null = null;
        try {
          objectId = new ObjectId(incidentId);
        } catch {}

        const query = objectId ? { _id: objectId, societyId, status: 'ACTIVE' } : { incidentNumber: incidentId, societyId, status: 'ACTIVE' };
        const updated = await incidentsCol.findOneAndUpdate(
          query as any,
          {
            $set: {
              status: 'ACKNOWLEDGED',
              acknowledgedAt: now,
              acknowledgedBy: { id: actor.id, name: actor.name },
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );

        if (updated) {
          if (timelineCol) {
            await timelineCol.insertOne({
              incidentId,
              societyId,
              actorId: actor.id,
              actorName: actor.name,
              actorRole: actor.role,
              action: 'INCIDENT_ACKNOWLEDGED',
              notes: notes?.trim() || `Acknowledged by ${actor.name}`,
              timestamp: now,
            }).catch(() => {});
          }
          return updated;
        }
      } catch (err) {
        console.warn('⚠️ MongoDB acknowledgeIncident failed, checking in-memory store:', (err as Error).message);
      }
    }

    // In-memory fallback
    const found = (global._memoryIncidents || []).find(
      (i) => (i._id?.toString() === incidentId || i.incidentNumber === incidentId) && i.societyId === societyId
    );
    if (found) {
      found.status = 'ACKNOWLEDGED';
      found.acknowledgedAt = now;
      found.acknowledgedBy = { id: actor.id, name: actor.name };
      found.updatedAt = now;
      return found;
    }

    throw new Error('Incident not found or already acknowledged');
  }

  /**
   * Assign a security guard or responder team to the incident
   */
  async assignResponder(
    societyId: string,
    incidentId: string,
    assigner: { id: string; name: string; role: string },
    responder: { id: string; name: string }
  ): Promise<EmergencyIncident> {
    const now = new Date();
    const incidentsCol = await this.getIncidentsCollection();
    const timelineCol = await this.getTimelineCollection();

    if (incidentsCol) {
      try {
        let objectId: ObjectId | null = null;
        try {
          objectId = new ObjectId(incidentId);
        } catch {}

        const query = objectId
          ? { _id: objectId, societyId, status: { $in: ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'] } }
          : { incidentNumber: incidentId, societyId, status: { $in: ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'] } };

        const updated = await incidentsCol.findOneAndUpdate(
          query as any,
          {
            $set: {
              status: 'RESPONDING',
              assignedResponder: { id: responder.id, name: responder.name, assignedAt: now },
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );

        if (updated) {
          if (timelineCol) {
            await timelineCol.insertOne({
              incidentId,
              societyId,
              actorId: assigner.id,
              actorName: assigner.name,
              actorRole: assigner.role,
              action: 'RESPONDER_ASSIGNED',
              notes: `Assigned responder: ${responder.name}`,
              timestamp: now,
            }).catch(() => {});
          }
          return updated;
        }
      } catch (err) {
        console.warn('⚠️ MongoDB assignResponder failed, checking in-memory store:', (err as Error).message);
      }
    }

    // In-memory fallback
    const found = (global._memoryIncidents || []).find(
      (i) => (i._id?.toString() === incidentId || i.incidentNumber === incidentId) && i.societyId === societyId
    );
    if (found) {
      found.status = 'RESPONDING';
      found.assignedResponder = { id: responder.id, name: responder.name, assignedAt: now };
      found.updatedAt = now;
      return found;
    }

    throw new Error('Active incident not found');
  }

  /**
   * Add operational notes or updates to the incident timeline
   */
  async addTimelineNote(
    societyId: string,
    incidentId: string,
    actor: { id: string; name: string; role: string },
    note: string
  ): Promise<IncidentTimelineEvent> {
    const now = new Date();
    const event: IncidentTimelineEvent = {
      incidentId,
      societyId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'NOTE_ADDED',
      notes: note.trim(),
      timestamp: now,
    };

    const timelineCol = await this.getTimelineCollection();
    if (timelineCol) {
      try {
        const res = await timelineCol.insertOne(event);
        return { ...event, _id: res.insertedId };
      } catch {}
    }

    global._memoryTimeline = [...(global._memoryTimeline || []), event];
    return event;
  }

  /**
   * Mark incident as resolved
   */
  async resolveIncident(
    societyId: string,
    incidentId: string,
    resolver: { id: string; name: string; role: string },
    resolutionNotes: string
  ): Promise<EmergencyIncident> {
    const now = new Date();
    const incidentsCol = await this.getIncidentsCollection();
    const timelineCol = await this.getTimelineCollection();

    if (incidentsCol) {
      try {
        let objectId: ObjectId | null = null;
        try {
          objectId = new ObjectId(incidentId);
        } catch {}

        const query = objectId
          ? { _id: objectId, societyId, status: { $in: ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'] } }
          : { incidentNumber: incidentId, societyId, status: { $in: ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'] } };

        const updated = await incidentsCol.findOneAndUpdate(
          query as any,
          {
            $set: {
              status: 'RESOLVED',
              resolvedAt: now,
              resolvedBy: { id: resolver.id, name: resolver.name },
              resolutionNotes: resolutionNotes.trim(),
              updatedAt: now,
            },
          },
          { returnDocument: 'after' }
        );

        if (updated) {
          if (timelineCol) {
            await timelineCol.insertOne({
              incidentId,
              societyId,
              actorId: resolver.id,
              actorName: resolver.name,
              actorRole: resolver.role,
              action: 'INCIDENT_RESOLVED',
              notes: `Resolved: ${resolutionNotes}`,
              timestamp: now,
            }).catch(() => {});
          }
          return updated;
        }
      } catch (err) {
        console.warn('⚠️ MongoDB resolveIncident failed, updating in-memory store:', (err as Error).message);
      }
    }

    // In-memory fallback
    const found = (global._memoryIncidents || []).find(
      (i) => (i._id?.toString() === incidentId || i.incidentNumber === incidentId) && i.societyId === societyId
    );
    if (found) {
      found.status = 'RESOLVED';
      found.resolvedAt = now;
      found.resolvedBy = { id: resolver.id, name: resolver.name };
      found.resolutionNotes = resolutionNotes.trim();
      found.updatedAt = now;
      return found;
    }

    throw new Error('Active incident not found to resolve');
  }

  /**
   * Get active incidents for security and admin consoles
   */
  async getActiveIncidents(societyId: string): Promise<EmergencyIncident[]> {
    const col = await this.getIncidentsCollection();
    if (col) {
      try {
        return await col
          .find({
            societyId,
            status: { $in: ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'] },
          })
          .sort({ severity: 1, createdAt: -1 })
          .toArray();
      } catch (err) {
        console.warn('⚠️ MongoDB getActiveIncidents failed, falling back to memory store:', (err as Error).message);
      }
    }

    return (global._memoryIncidents || []).filter(
      (i) => i.societyId === societyId && ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'].includes(i.status)
    );
  }

  /**
   * Get all incidents (including resolved) for audit logs & incident command history
   */
  async getAllIncidents(societyId: string): Promise<EmergencyIncident[]> {
    const col = await this.getIncidentsCollection();
    if (col) {
      try {
        return await col
          .find({ societyId })
          .sort({ createdAt: -1 })
          .toArray();
      } catch (err) {
        console.warn('⚠️ MongoDB getAllIncidents failed, falling back to memory store:', (err as Error).message);
      }
    }

    return (global._memoryIncidents || []).filter((i) => i.societyId === societyId);
  }

  /**
   * Get incident by ID with complete timeline
   */
  async getIncidentWithTimeline(
    societyId: string,
    incidentId: string
  ): Promise<{ incident: EmergencyIncident; timeline: IncidentTimelineEvent[] } | null> {
    const incidentsCol = await this.getIncidentsCollection();
    const timelineCol = await this.getTimelineCollection();

    if (incidentsCol) {
      try {
        let objectId: ObjectId | null = null;
        try {
          objectId = new ObjectId(incidentId);
        } catch {}

        const query = objectId ? { _id: objectId, societyId } : { incidentNumber: incidentId, societyId };
        const incident = await incidentsCol.findOne(query as any);

        if (incident) {
          const timeline = timelineCol
            ? await timelineCol.find({ incidentId, societyId }).sort({ timestamp: 1 }).toArray()
            : [];
          return { incident, timeline };
        }
      } catch (err) {
        console.warn('⚠️ MongoDB getIncidentWithTimeline failed:', (err as Error).message);
      }
    }

    const incident = (global._memoryIncidents || []).find(
      (i) => (i._id?.toString() === incidentId || i.incidentNumber === incidentId) && i.societyId === societyId
    );
    if (!incident) return null;

    const timeline = (global._memoryTimeline || []).filter((t) => t.incidentId === incidentId);
    return { incident, timeline };
  }

  /**
   * Resident view of their submitted incidents
   */
  async getResidentIncidents(societyId: string, reporterId: string): Promise<EmergencyIncident[]> {
    const col = await this.getIncidentsCollection();
    if (col) {
      try {
        return await col.find({ societyId, reporterId }).sort({ createdAt: -1 }).toArray();
      } catch (err) {
        console.warn('⚠️ MongoDB getResidentIncidents failed:', (err as Error).message);
      }
    }

    return (global._memoryIncidents || []).filter(
      (i) => i.societyId === societyId && i.reporterId === reporterId
    );
  }

  /**
   * Polling fallback endpoint for real-time sync (returns updates since last cursor)
   */
  async getIncidentsSince(societyId: string, sinceDate: Date): Promise<EmergencyIncident[]> {
    const col = await this.getIncidentsCollection();
    if (col) {
      try {
        return await col
          .find({
            societyId,
            updatedAt: { $gt: sinceDate },
          })
          .sort({ updatedAt: 1 })
          .toArray();
      } catch {}
    }

    return (global._memoryIncidents || []).filter(
      (i) => i.societyId === societyId && new Date(i.updatedAt).getTime() > sinceDate.getTime()
    );
  }
}

export const emergencyService = new EmergencyService();
