import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectId } from 'mongodb';
import { amenityService, Amenity, AmenityBooking } from '@/server/services/amenity-service';

const mockAmenities: Amenity[] = [];
const mockBookings: AmenityBooking[] = [];

const mockAmenitiesCol = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  countDocuments: vi.fn().mockImplementation(async () => mockAmenities.length),
  insertMany: vi.fn().mockImplementation(async (docs: Amenity[]) => {
    docs.forEach((d) => mockAmenities.push({ ...d, _id: new ObjectId() }));
  }),
  findOne: vi.fn().mockImplementation(async (query: Record<string, unknown>) => {
    return (
      mockAmenities.find((a) => {
        if (query.societyId && a.societyId !== query.societyId) return false;
        if (query._id && !a._id?.equals(query._id as ObjectId)) return false;
        if (query.status && a.status !== query.status) return false;
        return true;
      }) || null
    );
  }),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockImplementation(async () => [...mockAmenities]),
  }),
};

const mockBookingsCol = {
  createIndex: vi.fn().mockResolvedValue('ok'),
  insertOne: vi.fn().mockImplementation(async (doc: AmenityBooking) => {
    const inserted = { ...doc, _id: new ObjectId() };
    mockBookings.push(inserted);
    return { insertedId: inserted._id };
  }),
  findOne: vi.fn().mockImplementation(async (query: Record<string, unknown>) => {
    return (
      mockBookings.find((b) => {
        if (query.societyId && b.societyId !== query.societyId) return false;
        if (query.amenityId && b.amenityId !== query.amenityId) return false;
        if (query.status && b.status !== query.status) return false;
        // Overlap query check
        const qStart = query.startTime as { $lt?: Date };
        const qEnd = query.endTime as { $gt?: Date };
        if (qStart?.$lt && qEnd?.$gt) {
          // Booking conflicts if existing.startTime < requestedEnd && existing.endTime > requestedStart
          const overlaps = b.startTime < qStart.$lt && b.endTime > qEnd.$gt;
          if (!overlaps) return false;
        }
        return true;
      }) || null
    );
  }),
  findOneAndUpdate: vi.fn().mockImplementation(async (filter: { _id?: ObjectId; residentId?: string }, update: { $set?: Partial<AmenityBooking> }) => {
    const item = mockBookings.find((b) => {
      if (!b._id?.equals(filter._id as ObjectId)) return false;
      if (filter.residentId && b.residentId !== filter.residentId) return false;
      return true;
    });
    if (item && update.$set) {
      Object.assign(item, update.$set);
      return item;
    }
    return null;
  }),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockImplementation(async () => [...mockBookings]),
  }),
};

vi.mock('@/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: (name: string) => (name === 'amenities' ? mockAmenitiesCol : mockBookingsCol),
  }),
}));

vi.mock('@/server/services/audit-service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

describe('AmenityService & Double-Booking Prevention', () => {
  beforeEach(() => {
    mockAmenities.length = 0;
    mockBookings.length = 0;
    vi.clearAllMocks();
  });

  it('lists default amenities and seeds defaults if catalog is empty', async () => {
    const amenities = await amenityService.listAmenities('society-1');
    expect(amenities.length).toBe(3);
    expect(amenities.some((a) => a.code === 'HALL-A')).toBe(true);
    expect(amenities.some((a) => a.code === 'GUEST-1')).toBe(true);
    expect(amenities.some((a) => a.code === 'TENNIS-1')).toBe(true);
  });

  it('successfully books an amenity when slot is available', async () => {
    await amenityService.ensureDefaultAmenities('society-1');
    const hall = mockAmenities.find((a) => a.code === 'HALL-A')!;

    const startTime = new Date(Date.now() + 24 * 3600 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 4 * 3600 * 1000); // 4 hours

    const booking = await amenityService.createBooking(
      'society-1',
      { id: 'res-1', name: 'John Resident', unitId: 'A-201' },
      {
        amenityId: hall._id!.toString(),
        startTime,
        endTime,
        purpose: 'Birthday Party',
        attendeesCount: 50,
      }
    );

    expect(booking.status).toBe('CONFIRMED');
    expect(booking.amenityName).toBe('Grand Clubhouse Banquet Hall');
    expect(booking.totalFee).toBe(2500); // 1 slot of 4 hours
  });

  it('strictly prevents double booking of the same amenity at overlapping time', async () => {
    await amenityService.ensureDefaultAmenities('society-1');
    const hall = mockAmenities.find((a) => a.code === 'HALL-A')!;

    const startTime = new Date(Date.now() + 24 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 4 * 3600 * 1000);

    // First booking
    await amenityService.createBooking(
      'society-1',
      { id: 'res-1', name: 'John Resident', unitId: 'A-201' },
      {
        amenityId: hall._id!.toString(),
        startTime,
        endTime,
        purpose: 'Birthday Party',
        attendeesCount: 50,
      }
    );

    // Overlapping attempt: starts 1 hour after first booking starts
    const clashStart = new Date(startTime.getTime() + 3600 * 1000);
    const clashEnd = new Date(clashStart.getTime() + 4 * 3600 * 1000);

    await expect(
      amenityService.createBooking(
        'society-1',
        { id: 'res-2', name: 'Other Resident', unitId: 'B-303' },
        {
          amenityId: hall._id!.toString(),
          startTime: clashStart,
          endTime: clashEnd,
          purpose: 'Anniversary',
          attendeesCount: 30,
        }
      )
    ).rejects.toThrow('This slot conflicts with an existing reservation');
  });

  it('rejects booking when attendees exceed capacity', async () => {
    await amenityService.ensureDefaultAmenities('society-1');
    const room = mockAmenities.find((a) => a.code === 'GUEST-1')!; // Capacity: 3

    const startTime = new Date(Date.now() + 48 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 24 * 3600 * 1000);

    await expect(
      amenityService.createBooking(
        'society-1',
        { id: 'res-1', name: 'John Resident', unitId: 'A-201' },
        {
          amenityId: room._id!.toString(),
          startTime,
          endTime,
          purpose: 'Family Stay',
          attendeesCount: 8, // Exceeds 3
        }
      )
    ).rejects.toThrow('exceed maximum capacity of 3');
  });

  it('allows cancellation of a confirmed booking', async () => {
    await amenityService.ensureDefaultAmenities('society-1');
    const tennis = mockAmenities.find((a) => a.code === 'TENNIS-1')!;

    const startTime = new Date(Date.now() + 12 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 3600 * 1000);

    const booking = await amenityService.createBooking(
      'society-1',
      { id: 'res-1', name: 'John Resident', unitId: 'A-201' },
      {
        amenityId: tennis._id!.toString(),
        startTime,
        endTime,
        purpose: 'Morning Tennis Practice',
        attendeesCount: 2,
      }
    );

    const cancelled = await amenityService.cancelBooking(
      'society-1',
      booking._id!.toString(),
      'res-1',
      'RESIDENT',
      'Rain forecast'
    );

    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancellationReason).toBe('Rain forecast');
  });
});
