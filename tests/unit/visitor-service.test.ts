import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';
import { visitorService, VisitorPass, EntryLog } from '@/server/services/visitor-service';

// Mock MongoDB
const mockPasses: VisitorPass[] = [];
const mockLogs: EntryLog[] = [];

const mockPassesCollection = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  countDocuments: vi.fn().mockImplementation(async () => mockPasses.length),
  insertOne: vi.fn().mockImplementation(async (doc: VisitorPass) => {
    const inserted = { ...doc, _id: new ObjectId() };
    mockPasses.push(inserted);
    return { insertedId: inserted._id };
  }),
  findOne: vi.fn().mockImplementation(async (query: Record<string, unknown>) => {
    return (
      mockPasses.find((p) => {
        if (query.societyId && p.societyId !== query.societyId) return false;
        if (query.passCode && p.passCode !== query.passCode) return false;
        if (query.qrToken && p.qrToken !== query.qrToken) return false;
        if (query._id && !p._id?.equals(query._id as ObjectId)) return false;
        return true;
      }) || null
    );
  }),
  updateOne: vi.fn().mockImplementation(async (filter: { _id?: ObjectId }, update: { $set?: Partial<VisitorPass> }) => {
    const item = mockPasses.find((p) => p._id?.equals(filter._id as ObjectId));
    if (item && update.$set) {
      Object.assign(item, update.$set);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }),
  findOneAndUpdate: vi.fn().mockImplementation(async (filter: { _id?: ObjectId; societyId?: string; status?: string }, update: { $inc?: { entryCount?: number }; $set?: Partial<VisitorPass> }) => {
    const item = mockPasses.find((p) => p._id?.equals(filter._id as ObjectId));
    if (!item) return null;
    if (filter.status && item.status !== filter.status) return null;
    if (update.$inc?.entryCount) item.entryCount += update.$inc.entryCount;
    if (update.$set) Object.assign(item, update.$set);
    return item;
  }),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockImplementation(async () => [...mockPasses]),
  }),
};

const mockLogsCollection = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  insertOne: vi.fn().mockImplementation(async (doc: EntryLog) => {
    const inserted = { ...doc, _id: new ObjectId() };
    mockLogs.push(inserted);
    return { insertedId: inserted._id };
  }),
  findOne: vi.fn().mockImplementation(async (query: Record<string, unknown>) => {
    return (
      mockLogs.find((l) => {
        if (query.societyId && l.societyId !== query.societyId) return false;
        if (query.idempotencyKey && l.idempotencyKey !== query.idempotencyKey) return false;
        return true;
      }) || null
    );
  }),
  findOneAndUpdate: vi.fn().mockImplementation(async (filter: { _id?: ObjectId }, update: { $set?: Partial<EntryLog> }) => {
    const item = mockLogs.find((l) => l._id?.equals(filter._id as ObjectId));
    if (item && update.$set) {
      Object.assign(item, update.$set);
      return item;
    }
    return null;
  }),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockImplementation(async () => [...mockLogs]),
  }),
};

vi.mock('@/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: (name: string) => (name === 'visitorPasses' ? mockPassesCollection : mockLogsCollection),
  }),
}));

vi.mock('@/server/services/audit-service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

describe('VisitorService & Security Gate Control', () => {
  beforeEach(() => {
    mockPasses.length = 0;
    mockLogs.length = 0;
    vi.clearAllMocks();
  });

  it('creates a visitor pass with 6-character short code and zero PII in QR token', async () => {
    const now = new Date();
    const validUntil = new Date(now.getTime() + 4 * 3600 * 1000); // 4 hours later

    const pass = await visitorService.createPass('society-1', 'resident-123', {
      unitId: 'A-101',
      visitorName: 'Rajesh Kumar',
      visitorPhone: '+91 98765 43210',
      purpose: 'GUEST',
      validFrom: now,
      validUntil,
      maxEntries: 1,
    });

    expect(pass.passCode).toMatch(/^VP-[A-Z0-9]{4}$/);
    expect(pass.qrToken).toBeDefined();
    // Verify QR payload is an opaque string, not containing visitor's phone or name
    expect(pass.qrToken).not.toContain('Rajesh');
    expect(pass.qrToken).not.toContain('98765');
    expect(pass.status).toBe('ACTIVE');
    expect(pass.entryCount).toBe(0);
  });

  it('rejects visitor pass creation if validUntil is before validFrom', async () => {
    const now = new Date();
    const past = new Date(now.getTime() - 3600 * 1000);

    await expect(
      visitorService.createPass('society-1', 'resident-123', {
        unitId: 'A-101',
        visitorName: 'Jane Doe',
        visitorPhone: '555-0100',
        purpose: 'DELIVERY',
        validFrom: now,
        validUntil: past,
      })
    ).rejects.toThrow('Valid until timestamp must be after valid from timestamp');
  });

  it('allows security guard to check in visitor with valid pass and marks pass USED when max entries reached', async () => {
    const now = new Date();
    const pass = await visitorService.createPass('society-1', 'resident-123', {
      unitId: 'A-101',
      visitorName: 'Anil Verma',
      visitorPhone: '+91 98765 11111',
      purpose: 'SERVICE',
      validFrom: new Date(now.getTime() - 60000),
      validUntil: new Date(now.getTime() + 3600000),
      maxEntries: 1,
    });

    const guardUser = { id: 'guard-99', name: 'Officer Singh' };

    const entry = await visitorService.checkInVisitor('society-1', guardUser, {
      passId: pass._id!.toString(),
      unitId: 'A-101',
      visitorName: 'Anil Verma',
      visitorPhone: '+91 98765 11111',
      entryType: 'PRE_APPROVED',
      gateName: 'Main Gate',
      idempotencyKey: 'idemp-tx-123',
    });

    expect(entry.action).toBe('CHECK_IN');
    expect(entry.securityUserName).toBe('Officer Singh');
    const stored = mockPasses.find((p) => p._id?.equals(pass._id!));
    expect(stored?.entryCount).toBe(1);
    expect(stored?.status).toBe('USED');
  });

  it('enforces idempotency on duplicate scanner submission', async () => {
    const guardUser = { id: 'guard-99', name: 'Officer Singh' };
    const payload = {
      unitId: 'B-202',
      visitorName: 'Courier Delivery',
      visitorPhone: '555-9999',
      entryType: 'DELIVERY' as const,
      gateName: 'Service Gate',
      idempotencyKey: 'idemp-duplicate-test',
    };

    const first = await visitorService.checkInVisitor('society-1', guardUser, payload);
    const second = await visitorService.checkInVisitor('society-1', guardUser, payload);

    expect(first._id).toEqual(second._id);
    expect(mockLogs.length).toBe(1); // Only 1 database record created
  });

  it('records visitor check-out successfully', async () => {
    const guardUser = { id: 'guard-99', name: 'Officer Singh' };
    const entry = await visitorService.checkInVisitor('society-1', guardUser, {
      unitId: 'C-303',
      visitorName: 'Guest Person',
      visitorPhone: '555-2222',
      entryType: 'WALK_IN',
      gateName: 'Main Gate',
    });

    const checkOut = await visitorService.checkOutVisitor('society-1', guardUser, entry._id!.toString());
    expect(checkOut.checkOutTime).toBeDefined();
    expect(checkOut.checkOutSecurityUserName).toBe('Officer Singh');
  });

  it('records entry denial with mandatory reason code', async () => {
    const guardUser = { id: 'guard-99', name: 'Officer Singh' };
    const denial = await visitorService.recordDeniedEntry('society-1', guardUser, {
      unitId: 'A-101',
      visitorName: 'Unknown Person',
      visitorPhone: '555-0000',
      gateName: 'Main Gate',
      denialReason: 'SUSPICIOUS_BEHAVIOR',
      notes: 'Refused to disclose resident contact or purpose of visit',
    });

    expect(denial.action).toBe('DENIED');
    expect(denial.denialReason).toBe('SUSPICIOUS_BEHAVIOR');
  });

  it('allows resident to revoke an active visitor pass', async () => {
    const now = new Date();
    const pass = await visitorService.createPass('society-1', 'resident-123', {
      unitId: 'A-101',
      visitorName: 'Canceled Visitor',
      visitorPhone: '555-3333',
      purpose: 'GUEST',
      validFrom: now,
      validUntil: new Date(now.getTime() + 3600000),
    });

    const revoked = await visitorService.revokePass('society-1', pass._id!.toString(), 'resident-123');
    expect(revoked).toBe(true);
    const stored = mockPasses.find((p) => p._id?.equals(pass._id!));
    expect(stored?.status).toBe('REVOKED');
  });
});
