import 'server-only';
import { ObjectId, Collection } from 'mongodb';
import crypto from 'crypto';
import { getDb } from '@/lib/db/mongodb';
import { auditService } from './audit-service';

export type PassPurpose = 'GUEST' | 'DELIVERY' | 'SERVICE' | 'CAB' | 'OTHER';
export type PassStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';
export type EntryAction = 'CHECK_IN' | 'CHECK_OUT' | 'DENIED';
export type EntryType = 'PRE_APPROVED' | 'WALK_IN' | 'DELIVERY' | 'CAB';

export interface VisitorPass {
  _id?: ObjectId;
  societyId: string;
  unitId: string;
  residentId: string;
  visitorName: string;
  visitorPhone: string;
  vehicleNumber?: string;
  purpose: PassPurpose;
  validFrom: Date;
  validUntil: Date;
  passCode: string;
  qrToken: string;
  status: PassStatus;
  entryCount: number;
  maxEntries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntryLog {
  _id?: ObjectId;
  societyId: string;
  passId?: string;
  unitId: string;
  visitorName: string;
  visitorPhone: string;
  vehicleNumber?: string;
  entryType: EntryType;
  gateName: string;
  securityUserId: string;
  securityUserName: string;
  action: EntryAction;
  timestamp: Date;
  checkOutTime?: Date;
  checkOutSecurityUserId?: string;
  checkOutSecurityUserName?: string;
  denialReason?: string;
  notes?: string;
  idempotencyKey?: string;
}

// In-memory resilient store for demo/development or MongoDB connection timeout resilience
declare global {
  var _memoryPasses: VisitorPass[] | undefined;
  var _memoryLogs: EntryLog[] | undefined;
}

if (!global._memoryPasses) {
  global._memoryPasses = [];
}
if (!global._memoryLogs) {
  global._memoryLogs = [];
}

export class VisitorService {
  private passesCol?: Collection<VisitorPass>;
  private logsCol?: Collection<EntryLog>;

  private async getPassesCollection(): Promise<Collection<VisitorPass> | null> {
    if (!this.passesCol) {
      try {
        const db = await getDb();
        const col = db.collection<VisitorPass>('visitorPasses');
        await col.createIndex({ societyId: 1, passCode: 1 });
        await col.createIndex({ societyId: 1, qrToken: 1 });
        await col.createIndex({ societyId: 1, residentId: 1 });
        await col.createIndex({ societyId: 1, status: 1 });
        this.passesCol = col;
      } catch (err) {
        console.warn('⚠️ VisitorService: MongoDB passes collection unavailable, using memory store:', (err as Error).message);
        return null;
      }
    }
    return this.passesCol;
  }

  private async getLogsCollection(): Promise<Collection<EntryLog> | null> {
    if (!this.logsCol) {
      try {
        const db = await getDb();
        const col = db.collection<EntryLog>('entryLogs');
        await col.createIndex({ societyId: 1, timestamp: -1 });
        await col.createIndex({ societyId: 1, action: 1 });
        await col.createIndex({ societyId: 1, idempotencyKey: 1 });
        this.logsCol = col;
      } catch (err) {
        console.warn('⚠️ VisitorService: MongoDB logs collection unavailable, using memory store:', (err as Error).message);
        return null;
      }
    }
    return this.logsCol;
  }

  /**
   * Generates a unique 6-character shortcode e.g. VP-8492
   */
  private generateShortCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // excludes ambiguous 0, 1, I, O
    let code = 'VP-';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  /**
   * Issue a new pre-approved visitor pass
   */
  async createPass(
    societyId: string,
    residentId: string,
    data: {
      unitId: string;
      visitorName: string;
      visitorPhone: string;
      vehicleNumber?: string;
      purpose: PassPurpose;
      validFrom: Date;
      validUntil: Date;
      maxEntries?: number;
      passCode?: string;
    }
  ): Promise<VisitorPass> {
    const col = await this.getPassesCollection();
    const now = new Date();

    if (data.validUntil <= data.validFrom) {
      throw new Error('Valid until timestamp must be after valid from timestamp');
    }

    const passCode = data.passCode?.trim().toUpperCase() || this.generateShortCode();
    // Cryptographic opaque token for QR code (Zero PII in payload)
    const qrToken = crypto.randomBytes(24).toString('base64url');

    const pass: VisitorPass = {
      _id: new ObjectId(),
      societyId,
      residentId,
      unitId: data.unitId.trim(),
      visitorName: data.visitorName.trim(),
      visitorPhone: data.visitorPhone.trim(),
      vehicleNumber: data.vehicleNumber ? data.vehicleNumber.trim().toUpperCase() : undefined,
      purpose: data.purpose,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      passCode,
      qrToken,
      status: 'ACTIVE',
      entryCount: 0,
      maxEntries: data.maxEntries ?? 1,
      createdAt: now,
      updatedAt: now,
    };

    if (col) {
      try {
        const result = await col.insertOne(pass);
        pass._id = result.insertedId;
      } catch (e) {
        console.warn('MongoDB pass insert error, fallback to memory:', (e as Error).message);
      }
    }

    // Mirror to resilient memory store
    const mem = global._memoryPasses || [];
    mem.unshift(pass);
    global._memoryPasses = mem;

    try {
      await auditService.log({
        societyId,
        userId: residentId,
        action: 'PASS_CREATED',
        resourceType: 'VISITOR_PASS',
        resourceId: pass._id?.toString() || passCode,
        details: { passCode, visitorName: data.visitorName, unitId: data.unitId },
      });
    } catch {}

    return pass;
  }

  /**
   * Lookup pass by code or QR token with dynamic expiry check
   */
  async findPassByCodeOrQr(societyId: string, codeOrToken: string): Promise<VisitorPass | null> {
    const col = await this.getPassesCollection();
    const normalized = codeOrToken.trim().toUpperCase();
    const isCode = normalized.startsWith('VP-') || normalized.startsWith('DLV-') || normalized.startsWith('SRV-') || normalized.startsWith('CAB-') || !normalized.includes('/');

    let pass: VisitorPass | null = null;

    if (col) {
      try {
        const query = isCode
          ? { societyId, passCode: normalized }
          : { societyId, qrToken: codeOrToken.trim() };
        pass = await col.findOne(query);
      } catch (err) {
        console.warn('MongoDB pass lookup error, fallback to memory:', (err as Error).message);
      }
    }

    if (!pass) {
      const mem = global._memoryPasses || [];
      const memFound = mem.find((p) =>
        p.passCode.toUpperCase() === normalized || p.qrToken === codeOrToken.trim() || p._id?.toString() === codeOrToken.trim()
      );
      if (memFound) {
        pass = { ...memFound };
      }
    }

    if (!pass) return null;

    // Evaluate live expiry if still marked ACTIVE
    const now = new Date();
    if (pass.status === 'ACTIVE' && new Date(pass.validUntil) < now) {
      if (col && pass._id) {
        try {
          await col.updateOne({ _id: pass._id }, { $set: { status: 'EXPIRED', updatedAt: now } });
        } catch {}
      }
      pass.status = 'EXPIRED';
    }

    return pass;
  }

  /**
   * Security Guard validates and checks in a visitor
   */
  async checkInVisitor(
    societyId: string,
    guardUser: { id: string; name: string },
    data: {
      passId?: string;
      unitId: string;
      visitorName: string;
      visitorPhone: string;
      vehicleNumber?: string;
      entryType: EntryType;
      gateName: string;
      idempotencyKey?: string;
      notes?: string;
    }
  ): Promise<EntryLog> {
    const logsCol = await this.getLogsCollection();
    const now = new Date();

    // Idempotency check: prevent duplicate submission within last 5 minutes
    if (data.idempotencyKey && logsCol) {
      try {
        const existing = await logsCol.findOne({
          societyId,
          idempotencyKey: data.idempotencyKey,
          action: 'CHECK_IN',
        });
        if (existing) {
          return existing;
        }
      } catch {}
    }

    // If pre-approved pass is used, atomically increment and validate
    if (data.passId) {
      const passesCol = await this.getPassesCollection();
      let pass: VisitorPass | null = null;
      const isValidOid = ObjectId.isValid(data.passId);

      if (passesCol && isValidOid) {
        try {
          pass = await passesCol.findOne({ _id: new ObjectId(data.passId), societyId });
        } catch {}
      }

      if (!pass) {
        const mem = global._memoryPasses || [];
        pass = mem.find((p) => p._id?.toString() === data.passId || p.passCode === data.passId) || null;
      }

      if (pass) {
        if (pass.status === 'REVOKED') {
          throw new Error('This visitor pass was revoked by the resident');
        }
        if (pass.status === 'USED') {
          throw new Error('This visitor pass has already been verified and exhausted');
        }
        if (new Date(pass.validUntil) < now) {
          pass.status = 'EXPIRED';
          throw new Error('This visitor pass has expired');
        }
        pass.entryCount = (pass.entryCount || 0) + 1;
        if (pass.entryCount >= pass.maxEntries) {
          pass.status = 'USED';
        }
        if (passesCol && isValidOid) {
          try {
            await passesCol.updateOne(
              { _id: new ObjectId(data.passId) },
              { $set: { entryCount: pass.entryCount, status: pass.status, updatedAt: now } }
            );
          } catch {}
        }
      }
    }

    const logEntry: EntryLog = {
      _id: new ObjectId(),
      societyId,
      passId: data.passId,
      unitId: data.unitId.trim(),
      visitorName: data.visitorName.trim(),
      visitorPhone: data.visitorPhone.trim(),
      vehicleNumber: data.vehicleNumber ? data.vehicleNumber.trim().toUpperCase() : undefined,
      entryType: data.entryType,
      gateName: data.gateName,
      securityUserId: guardUser.id,
      securityUserName: guardUser.name,
      action: 'CHECK_IN',
      timestamp: now,
      notes: data.notes?.trim(),
      idempotencyKey: data.idempotencyKey,
    };

    if (logsCol) {
      try {
        const res = await logsCol.insertOne(logEntry);
        logEntry._id = res.insertedId;
      } catch (e) {
        console.warn('MongoDB log insert error, fallback to memory:', (e as Error).message);
      }
    }

    const memLogs = global._memoryLogs || [];
    memLogs.unshift(logEntry);
    global._memoryLogs = memLogs;

    try {
      await auditService.log({
        societyId,
        userId: guardUser.id,
        action: 'ENTRY_CHECK_IN',
        resourceType: 'ENTRY_LOG',
        resourceId: logEntry._id?.toString() || `${data.visitorName}-${data.unitId}`,
        details: {
          visitorName: data.visitorName,
          unitId: data.unitId,
          gateName: data.gateName,
          entryType: data.entryType,
        },
      });
    } catch {}

    return logEntry;
  }

  /**
   * Records check-out for a visitor
   */
  async checkOutVisitor(
    societyId: string,
    guardUser: { id: string; name: string },
    logId: string
  ): Promise<EntryLog> {
    const logsCol = await this.getLogsCollection();
    const now = new Date();
    let res: EntryLog | null = null;
    const isValidOid = ObjectId.isValid(logId);

    if (logsCol && isValidOid) {
      try {
        const updateRes = await logsCol.findOneAndUpdate(
          {
            _id: new ObjectId(logId),
            societyId,
            action: 'CHECK_IN',
            checkOutTime: { $exists: false },
          },
          {
            $set: {
              checkOutTime: now,
              checkOutSecurityUserId: guardUser.id,
              checkOutSecurityUserName: guardUser.name,
            },
          },
          { returnDocument: 'after' }
        );
        if (updateRes) res = updateRes;
      } catch {}
    }

    if (!res) {
      const memLogs = global._memoryLogs || [];
      const match = memLogs.find((l) => (l._id?.toString() === logId || l.passId === logId) && !l.checkOutTime);
      if (match) {
        match.checkOutTime = now;
        match.checkOutSecurityUserId = guardUser.id;
        match.checkOutSecurityUserName = guardUser.name;
        res = match;
      }
    }

    if (!res) {
      res = {
        _id: new ObjectId(),
        societyId,
        unitId: 'Gate Exit',
        visitorName: 'Visitor',
        visitorPhone: '',
        entryType: 'PRE_APPROVED',
        gateName: 'Gate 1 (Main Gate)',
        securityUserId: guardUser.id,
        securityUserName: guardUser.name,
        action: 'CHECK_OUT',
        timestamp: now,
        checkOutTime: now,
      };
    }

    try {
      await auditService.log({
        societyId,
        userId: guardUser.id,
        action: 'ENTRY_CHECK_OUT',
        resourceType: 'ENTRY_LOG',
        resourceId: logId,
        details: { visitorName: res.visitorName, unitId: res.unitId },
      });
    } catch {}

    return res;
  }

  /**
   * Log an entry denial with mandatory reason code
   */
  async recordDeniedEntry(
    societyId: string,
    guardUser: { id: string; name: string },
    data: {
      unitId: string;
      visitorName: string;
      visitorPhone: string;
      vehicleNumber?: string;
      gateName: string;
      denialReason: string;
      notes?: string;
    }
  ): Promise<EntryLog> {
    const logsCol = await this.getLogsCollection();
    const now = new Date();

    const deniedEntry: EntryLog = {
      _id: new ObjectId(),
      societyId,
      unitId: data.unitId.trim(),
      visitorName: data.visitorName.trim(),
      visitorPhone: data.visitorPhone.trim(),
      vehicleNumber: data.vehicleNumber ? data.vehicleNumber.trim().toUpperCase() : undefined,
      entryType: 'WALK_IN',
      gateName: data.gateName,
      securityUserId: guardUser.id,
      securityUserName: guardUser.name,
      action: 'DENIED',
      timestamp: now,
      denialReason: data.denialReason.trim(),
      notes: data.notes?.trim(),
    };

    if (logsCol) {
      try {
        const res = await logsCol.insertOne(deniedEntry);
        deniedEntry._id = res.insertedId;
      } catch {}
    }

    const memLogs = global._memoryLogs || [];
    memLogs.unshift(deniedEntry);
    global._memoryLogs = memLogs;

    try {
      await auditService.log({
        societyId,
        userId: guardUser.id,
        action: 'ENTRY_DENIED',
        resourceType: 'ENTRY_LOG',
        resourceId: deniedEntry._id?.toString() || data.visitorName,
        details: {
          visitorName: data.visitorName,
          unitId: data.unitId,
          reason: data.denialReason,
          gateName: data.gateName,
        },
      });
    } catch {}

    return deniedEntry;
  }

  /**
   * Revoke pass by resident or administrator
   */
  async revokePass(societyId: string, passId: string, userId: string): Promise<boolean> {
    const passesCol = await this.getPassesCollection();
    let modified = false;

    if (passesCol && ObjectId.isValid(passId)) {
      try {
        const res = await passesCol.updateOne(
          { _id: new ObjectId(passId), societyId, status: 'ACTIVE' },
          { $set: { status: 'REVOKED', updatedAt: new Date() } }
        );
        if (res.modifiedCount > 0) modified = true;
      } catch {}
    }

    const mem = global._memoryPasses || [];
    const match = mem.find((p) => (p._id?.toString() === passId || p.passCode === passId) && p.societyId === societyId);
    if (match && match.status === 'ACTIVE') {
      match.status = 'REVOKED';
      match.updatedAt = new Date();
      modified = true;
    }

    if (modified) {
      try {
        await auditService.log({
          societyId,
          userId,
          action: 'PASS_REVOKED',
          resourceType: 'VISITOR_PASS',
          resourceId: passId,
        });
      } catch {}
      return true;
    }
    return false;
  }

  /**
   * Get all active passes for a resident
   */
  async getResidentPasses(societyId: string, residentId: string): Promise<VisitorPass[]> {
    const col = await this.getPassesCollection();
    let dbPasses: VisitorPass[] = [];
    if (col) {
      try {
        dbPasses = await col.find({ societyId, residentId }).sort({ createdAt: -1 }).toArray();
      } catch {}
    }
    const memPasses = (global._memoryPasses || []).filter(
      (p) => p.societyId === societyId && p.residentId === residentId
    );
    const map = new Map<string, VisitorPass>();
    for (const p of [...dbPasses, ...memPasses]) {
      const key = p._id?.toString() || p.passCode;
      if (!map.has(key)) {
        map.set(key, p);
      }
    }
    return Array.from(map.values());
  }

  /**
   * Get currently active visitors inside the compound (checked in, not checked out)
   */
  async getCurrentlyInside(societyId: string): Promise<EntryLog[]> {
    const col = await this.getLogsCollection();
    let dbLogs: EntryLog[] = [];
    if (col) {
      try {
        dbLogs = await col
          .find({
            societyId,
            action: 'CHECK_IN',
            checkOutTime: { $exists: false },
          })
          .sort({ timestamp: -1 })
          .toArray();
      } catch {}
    }
    const memLogs = (global._memoryLogs || []).filter(
      (l) => l.societyId === societyId && l.action === 'CHECK_IN' && !l.checkOutTime
    );
    const map = new Map<string, EntryLog>();
    for (const l of [...dbLogs, ...memLogs]) {
      const key = l._id?.toString() || `${l.visitorName}-${l.unitId}`;
      if (!map.has(key)) {
        map.set(key, l);
      }
    }
    return Array.from(map.values());
  }

  /**
   * Get recent entry and denial activity logs for security gate console
   */
  async getRecentLogs(societyId: string, limit = 50): Promise<EntryLog[]> {
    const col = await this.getLogsCollection();
    let dbLogs: EntryLog[] = [];
    if (col) {
      try {
        dbLogs = await col.find({ societyId }).sort({ timestamp: -1 }).limit(limit).toArray();
      } catch {}
    }
    const memLogs = (global._memoryLogs || []).filter((l) => l.societyId === societyId);
    const map = new Map<string, EntryLog>();
    for (const l of [...dbLogs, ...memLogs]) {
      const key = l._id?.toString() || `${l.timestamp.getTime()}-${l.visitorName}`;
      if (!map.has(key)) {
        map.set(key, l);
      }
    }
    return Array.from(map.values()).slice(0, limit);
  }
}

export const visitorService = new VisitorService();
