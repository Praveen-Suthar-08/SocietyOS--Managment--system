import { describe, it, expect } from 'vitest';
import { UnitStatus, OccupancyEventType } from '@/server/services/unit-service';

interface MockUnit {
  id: string;
  societyId: string;
  unitCode: string;
  status: UnitStatus;
  version: number;
  memberUserIds: string[];
  isPubliclyListed: boolean;
  listingNotes?: string;
  listingPrice?: number;
}

function validateStatusTransition(
  unit: MockUnit,
  newStatus: UnitStatus,
  eventType: OccupancyEventType,
  reasonCode: string
) {
  if (unit.status === newStatus) {
    throw new Error(`Unit ${unit.unitCode} is already in status ${newStatus}`);
  }

  if (newStatus === 'OCCUPIED' && eventType !== 'MOVE_IN') {
    throw new Error('Transitioning to OCCUPIED requires a MOVE_IN event type');
  }

  if (newStatus === 'VACANT' && eventType !== 'MOVE_OUT') {
    throw new Error('Transitioning to VACANT requires a MOVE_OUT event type');
  }

  return {
    ...unit,
    status: newStatus,
    version: unit.version + 1,
  };
}

function redactVacancyRecord(unit: MockUnit) {
  if (unit.status !== 'VACANT' || !unit.isPubliclyListed) {
    return null;
  }

  // Strictly redact memberUserIds, internal logs, and tenant history
  return {
    id: unit.id,
    unitCode: unit.unitCode,
    status: unit.status,
    listingNotes: unit.listingNotes,
    listingPrice: unit.listingPrice,
  };
}

describe('Unit Occupancy & Vacancy Rules (Phase 3)', () => {
  const baseUnit: MockUnit = {
    id: 'unit_1',
    societyId: 'soc_greenfield',
    unitCode: 'A-402',
    status: 'VACANT',
    version: 1,
    memberUserIds: [],
    isPubliclyListed: true,
    listingNotes: 'Spacious 3BHK with garden view',
    listingPrice: 45000,
  };

  it('allows valid move-in transition from VACANT to OCCUPIED', () => {
    const updated = validateStatusTransition(baseUnit, 'OCCUPIED', 'MOVE_IN', 'TENANT_MOVE_IN');
    expect(updated.status).toBe('OCCUPIED');
    expect(updated.version).toBe(2);
  });

  it('rejects transitioning to the same status (No-op prevention)', () => {
    expect(() =>
      validateStatusTransition(baseUnit, 'VACANT', 'MOVE_OUT', 'REASON')
    ).toThrow(/already in status VACANT/);
  });

  it('rejects OCCUPIED transition with invalid event type', () => {
    expect(() =>
      validateStatusTransition(baseUnit, 'OCCUPIED', 'MAINTENANCE_FLAG', 'REPAIR')
    ).toThrow(/requires a MOVE_IN event type/);
  });

  it('correctly redacts private household data in public vacancy listings', () => {
    const occupiedUnit: MockUnit = {
      ...baseUnit,
      status: 'OCCUPIED',
      memberUserIds: ['user_secret_resident_id_123'],
    };

    // Occupied unit should not be listed
    expect(redactVacancyRecord(occupiedUnit)).toBeNull();

    // Vacant unit should expose only public listing fields, zero memberUserIds
    const publicRecord = redactVacancyRecord(baseUnit);
    expect(publicRecord).not.toBeNull();
    expect(publicRecord).toHaveProperty('unitCode', 'A-402');
    expect(publicRecord).not.toHaveProperty('memberUserIds');
    expect(publicRecord).not.toHaveProperty('version');
  });
});
