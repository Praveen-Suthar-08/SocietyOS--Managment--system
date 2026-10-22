import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';
import {
  emergencyService,
  EmergencyIncident,
  IncidentTimelineEvent,
  OutboxEvent,
} from '@/server/services/emergency-service';

const mockIncidents: EmergencyIncident[] = [];
const mockTimeline: IncidentTimelineEvent[] = [];
const mockOutbox: OutboxEvent[] = [];

const mockIncidentsCol = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  insertOne: vi.fn().mockImplementation(async (doc: EmergencyIncident) => {
    const inserted = { ...doc, _id: new ObjectId() };
    mockIncidents.push(inserted);
    return { insertedId: inserted._id };
  }),
  findOne: vi.fn().mockImplementation(async (query: Record<string, unknown>) => {
    return (
      mockIncidents.find((i) => {
        if (query.societyId && i.societyId !== query.societyId) return false;
        if (query._id && !i._id?.equals(query._id as ObjectId)) return false;
        return true;
      }) || null
    );
  }),
  findOneAndUpdate: vi.fn().mockImplementation(async (filter: { _id?: ObjectId; societyId?: string }, update: { $set?: Partial<EmergencyIncident> }) => {
    const item = mockIncidents.find((i) => i._id?.equals(filter._id as ObjectId));
    if (item && update.$set) {
      Object.assign(item, update.$set);
      return item;
    }
    return null;
  }),
  find: vi.fn().mockImplementation((query: Record<string, unknown>) => {
    const filtered = mockIncidents.filter((i) => {
      if (query.societyId && i.societyId !== query.societyId) return false;
      if (query['updatedAt'] && (query['updatedAt'] as { $gt?: Date }).$gt) {
        if (i.updatedAt <= (query['updatedAt'] as { $gt: Date }).$gt) return false;
      }
      return true;
    });
    return {
      sort: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue(filtered),
    };
  }),
};

const mockTimelineCol = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  insertOne: vi.fn().mockImplementation(async (doc: IncidentTimelineEvent) => {
    const inserted = { ...doc, _id: new ObjectId() };
    mockTimeline.push(inserted);
    return { insertedId: inserted._id };
  }),
  find: vi.fn().mockImplementation((query: { incidentId?: string }) => ({
    sort: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue(mockTimeline.filter((t) => t.incidentId === query.incidentId)),
  })),
};

const mockOutboxCol = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  insertOne: vi.fn().mockImplementation(async (doc: OutboxEvent) => {
    const inserted = { ...doc, _id: new ObjectId() };
    mockOutbox.push(inserted);
    return { insertedId: inserted._id };
  }),
};

vi.mock('@/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: (name: string) => {
      if (name === 'emergencyIncidents') return mockIncidentsCol;
      if (name === 'incidentEvents') return mockTimelineCol;
      if (name === 'outboxEvents') return mockOutboxCol;
      return mockIncidentsCol;
    },
  }),
}));

vi.mock('@/server/services/audit-service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

describe('EmergencyService & Life-Safety Workflows', () => {
  beforeEach(() => {
    mockIncidents.length = 0;
    mockTimeline.length = 0;
    mockOutbox.length = 0;
    vi.clearAllMocks();
  });

  it('triggers an SOS alert with durable persistence to MongoDB before enqueuing outbox event', async () => {
    const reporter = {
      id: 'res-42',
      name: 'Sunita Sharma',
      phone: '+91 98765 22222',
      unitId: 'Tower B, Flat 402',
    };

    const incident = await emergencyService.triggerSOS('society-1', reporter, {
      category: 'MEDICAL',
      locationDescription: 'Tower B 4th floor corridor near elevator',
      description: 'Senior resident feeling severe chest pain and breathlessness',
    });

    // 1. Persisted in incidents collection
    expect(incident.status).toBe('ACTIVE');
    expect(incident.severity).toBe('HIGH');
    expect(incident.incidentNumber).toMatch(/^INC-\d{8}-\d{4}$/);
    expect(mockIncidents.length).toBe(1);

    // 2. Timeline event recorded
    expect(mockTimeline.length).toBe(1);
    expect(mockTimeline[0].action).toBe('INCIDENT_TRIGGERED');

    // 3. Outbox enqueued for resilient broadcast
    expect(mockOutbox.length).toBe(1);
    expect(mockOutbox[0].status).toBe('PENDING');
    expect(mockOutbox[0].eventType).toBe('EMERGENCY_ALERT');
  });

  it('assigns CRITICAL severity automatically for fire or gas leak emergencies', async () => {
    const reporter = {
      id: 'res-42',
      name: 'Sunita Sharma',
      phone: '+91 98765 22222',
      unitId: 'Tower B, Flat 402',
    };

    const fireIncident = await emergencyService.triggerSOS('society-1', reporter, {
      category: 'FIRE',
      locationDescription: 'Electrical shaft B-wing',
      description: 'Heavy black smoke coming from 3rd floor electrical shaft',
    });

    expect(fireIncident.severity).toBe('CRITICAL');
  });

  it('allows security guard or admin to acknowledge incident and update state machine', async () => {
    const reporter = {
      id: 'res-42',
      name: 'Sunita Sharma',
      phone: '+91 98765 22222',
      unitId: 'Flat 402',
    };

    const incident = await emergencyService.triggerSOS('society-1', reporter, {
      category: 'LIFT_ENTRAPMENT',
      locationDescription: 'Passenger Lift #2',
      description: 'Lift stuck between 5th and 6th floor with 2 passengers',
    });

    const guard = { id: 'guard-10', name: 'Officer Vikram', role: 'SECURITY' };
    const ack = await emergencyService.acknowledgeIncident(
      'society-1',
      incident._id!.toString(),
      guard,
      'Dispatching emergency lift technician'
    );

    expect(ack.status).toBe('ACKNOWLEDGED');
    expect(ack.acknowledgedBy?.name).toBe('Officer Vikram');

    // Assign responder
    const responding = await emergencyService.assignResponder(
      'society-1',
      incident._id!.toString(),
      guard,
      { id: 'guard-12', name: 'Duty Guard Ramesh' }
    );
    expect(responding.status).toBe('RESPONDING');
    expect(responding.assignedResponder?.name).toBe('Duty Guard Ramesh');

    // Resolve incident
    const resolved = await emergencyService.resolveIncident(
      'society-1',
      incident._id!.toString(),
      guard,
      'Technician manually released brake; passengers evacuated safely'
    );
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolvedBy?.name).toBe('Officer Vikram');
  });

  it('provides cursor-based polling synchronization for offline/real-time disconnect recovery', async () => {
    const reporter = {
      id: 'res-42',
      name: 'Sunita Sharma',
      phone: '+91 98765 22222',
      unitId: 'Flat 402',
    };

    const past = new Date(Date.now() - 10000);

    await emergencyService.triggerSOS('society-1', reporter, {
      category: 'SECURITY',
      locationDescription: 'Clubhouse back gate',
      description: 'Unauthorized trespasser spotted near rear boundary wall',
    });

    const updates = await emergencyService.getIncidentsSince('society-1', past);
    expect(updates.length).toBe(1);
    expect(updates[0].category).toBe('SECURITY');
  });
});
