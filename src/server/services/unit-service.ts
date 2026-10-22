import 'server-only';
import { ObjectId } from 'mongodb';
import { mongoDb } from '@/lib/db/mongodb';
import { auditService } from './audit-service';

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type OccupancyEventType = 'MOVE_IN' | 'MOVE_OUT' | 'RESERVATION' | 'MAINTENANCE_FLAG';

export interface UnitRecord {
  _id?: ObjectId;
  societyId: string;
  unitCode: string; // e.g. "A-402"
  floor: number;
  block: string;
  status: UnitStatus;
  memberUserIds: string[];
  isPubliclyListed: boolean;
  listingNotes?: string;
  listingPrice?: number;
  lastUpdatedBy: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OccupancyEventRecord {
  _id?: ObjectId;
  societyId: string;
  unitId: ObjectId;
  unitCode: string;
  previousStatus: UnitStatus;
  newStatus: UnitStatus;
  eventType: OccupancyEventType;
  actorId: string;
  actorRole: string;
  reasonCode: string;
  note?: string;
  createdAt: Date;
}

export class UnitService {
  private get unitsCollection() {
    return mongoDb.collection<UnitRecord>('units');
  }

  private get eventsCollection() {
    return mongoDb.collection<OccupancyEventRecord>('occupancyEvents');
  }

  /**
   * Creates a canonical unit record
   */
  async createUnit(input: {
    societyId: string;
    unitCode: string;
    floor: number;
    block: string;
    actorId: string;
    actorRole: string;
  }) {
    const normalizedCode = input.unitCode.trim().toUpperCase();

    // Enforce uniqueness per society
    const existing = await this.unitsCollection.findOne({
      societyId: input.societyId,
      unitCode: normalizedCode,
    });

    if (existing) {
      throw new Error(`Unit with code "${normalizedCode}" already exists in this society.`);
    }

    const unit: UnitRecord = {
      societyId: input.societyId,
      unitCode: normalizedCode,
      floor: input.floor,
      block: input.block.trim().toUpperCase(),
      status: 'VACANT',
      memberUserIds: [],
      isPubliclyListed: false,
      lastUpdatedBy: input.actorId,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.unitsCollection.insertOne(unit);
    const unitId = result.insertedId;

    // Log initial occupancy creation
    await this.eventsCollection.insertOne({
      societyId: input.societyId,
      unitId,
      unitCode: normalizedCode,
      previousStatus: 'VACANT',
      newStatus: 'VACANT',
      eventType: 'MOVE_OUT',
      actorId: input.actorId,
      actorRole: input.actorRole,
      reasonCode: 'UNIT_INITIALIZED',
      note: 'Initial unit creation in society inventory',
      createdAt: new Date(),
    });

    await auditService.logAction({
      societyId: input.societyId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: 'UNIT_CREATED',
      resourceType: 'UNIT',
      resourceId: unitId.toString(),
      outcome: 'SUCCESS',
      details: { unitCode: normalizedCode, floor: input.floor, block: input.block },
    });

    return { ...unit, _id: unitId };
  }

  /**
   * Retrieves units with pagination and filtering
   */
  async getUnits(
    societyId: string,
    options: {
      status?: UnitStatus;
      block?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { societyId };
    if (options.status) filter.status = options.status;
    if (options.block) filter.block = options.block.toUpperCase();
    if (options.search) {
      filter.unitCode = { $regex: options.search.trim(), $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.unitsCollection
        .find(filter)
        .sort({ block: 1, unitCode: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.unitsCollection.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Atomically updates unit status and writes an append-only occupancy event
   */
  async updateUnitStatus(input: {
    unitId: string;
    societyId: string;
    newStatus: UnitStatus;
    eventType: OccupancyEventType;
    reasonCode: string;
    note?: string;
    actorId: string;
    actorRole: string;
  }) {
    const objectId = new ObjectId(input.unitId);
    const currentUnit = await this.unitsCollection.findOne({
      _id: objectId,
      societyId: input.societyId,
    });

    if (!currentUnit) {
      throw new Error('Unit not found');
    }

    if (currentUnit.status === input.newStatus) {
      throw new Error(`Unit ${currentUnit.unitCode} is already ${input.newStatus}.`);
    }

    // Atomic conditional update using version to prevent race conditions
    const updated = await this.unitsCollection.findOneAndUpdate(
      {
        _id: objectId,
        societyId: input.societyId,
        version: currentUnit.version,
      },
      {
        $set: {
          status: input.newStatus,
          lastUpdatedBy: input.actorId,
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      throw new Error('Concurrent update conflict detected. Please refresh and try again.');
    }

    // Append-only occupancy event
    await this.eventsCollection.insertOne({
      societyId: input.societyId,
      unitId: objectId,
      unitCode: currentUnit.unitCode,
      previousStatus: currentUnit.status,
      newStatus: input.newStatus,
      eventType: input.eventType,
      actorId: input.actorId,
      actorRole: input.actorRole,
      reasonCode: input.reasonCode,
      note: input.note,
      createdAt: new Date(),
    });

    await auditService.logAction({
      societyId: input.societyId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: 'UNIT_STATUS_CHANGED',
      resourceType: 'UNIT',
      resourceId: input.unitId,
      outcome: 'SUCCESS',
      details: {
        unitCode: currentUnit.unitCode,
        previousStatus: currentUnit.status,
        newStatus: input.newStatus,
        reasonCode: input.reasonCode,
      },
    });

    return updated;
  }

  /**
   * Assigns a resident to a unit and marks unit OCCUPIED if vacant
   */
  async assignMember(input: {
    unitId: string;
    societyId: string;
    userId: string;
    actorId: string;
    actorRole: string;
  }) {
    const objectId = new ObjectId(input.unitId);
    const unit = await this.unitsCollection.findOne({
      _id: objectId,
      societyId: input.societyId,
    });

    if (!unit) throw new Error('Unit not found');

    if (unit.memberUserIds.includes(input.userId)) {
      return unit;
    }

    const newMembers = [...unit.memberUserIds, input.userId];
    const previousStatus = unit.status;
    const newStatus: UnitStatus = unit.status === 'VACANT' ? 'OCCUPIED' : unit.status;

    const updated = await this.unitsCollection.findOneAndUpdate(
      { _id: objectId, societyId: input.societyId, version: unit.version },
      {
        $set: {
          memberUserIds: newMembers,
          status: newStatus,
          lastUpdatedBy: input.actorId,
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    if (newStatus !== previousStatus) {
      await this.eventsCollection.insertOne({
        societyId: input.societyId,
        unitId: objectId,
        unitCode: unit.unitCode,
        previousStatus,
        newStatus,
        eventType: 'MOVE_IN',
        actorId: input.actorId,
        actorRole: input.actorRole,
        reasonCode: 'RESIDENT_ASSIGNED',
        note: `Resident member ${input.userId} registered to unit`,
        createdAt: new Date(),
      });
    }

    await auditService.logAction({
      societyId: input.societyId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: 'UNIT_MEMBER_ASSIGNED',
      resourceType: 'UNIT',
      resourceId: input.unitId,
      outcome: 'SUCCESS',
      details: { unitCode: unit.unitCode, assignedUserId: input.userId },
    });

    return updated;
  }

  /**
   * Public-facing vacancy listings.
   * STRICT PRIVACY RULE: Exposes only approved listing data, never memberUserIds or private occupant history.
   */
  async getPublicVacancies(societyId: string) {
    const vacancies = await this.unitsCollection
      .find({
        societyId,
        status: 'VACANT',
        isPubliclyListed: true,
      })
      .project({
        _id: 1,
        unitCode: 1,
        floor: 1,
        block: 1,
        listingNotes: 1,
        listingPrice: 1,
        updatedAt: 1,
      })
      .toArray();

    return vacancies;
  }

  /**
   * Calculates authoritative server-side occupancy statistics
   */
  async getOccupancyStats(societyId: string) {
    const [total, occupied, vacant, reserved, maintenance] = await Promise.all([
      this.unitsCollection.countDocuments({ societyId }),
      this.unitsCollection.countDocuments({ societyId, status: 'OCCUPIED' }),
      this.unitsCollection.countDocuments({ societyId, status: 'VACANT' }),
      this.unitsCollection.countDocuments({ societyId, status: 'RESERVED' }),
      this.unitsCollection.countDocuments({ societyId, status: 'MAINTENANCE' }),
    ]);

    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      total,
      occupied,
      vacant,
      reserved,
      maintenance,
      occupancyRate,
      lastCalculatedAt: new Date(),
    };
  }

  /**
   * Retrieves occupancy transition history for a unit
   */
  async getUnitHistory(societyId: string, unitId: string) {
    const objectId = new ObjectId(unitId);
    return this.eventsCollection
      .find({ societyId, unitId: objectId })
      .sort({ createdAt: -1 })
      .toArray();
  }
}

export const unitService = new UnitService();
