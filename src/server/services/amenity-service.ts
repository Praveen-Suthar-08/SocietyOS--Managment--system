import 'server-only';
import { ObjectId, Collection } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { auditService } from './audit-service';

export type AmenityType = 'COMMUNITY_HALL' | 'GUEST_ROOM' | 'SPORTS_FACILITY' | 'MEETING_ROOM';
export type AmenityStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Amenity {
  _id?: ObjectId;
  societyId: string;
  name: string;
  code: string;
  type: AmenityType;
  capacity: number;
  description: string;
  openTime: string; // e.g. "08:00"
  closeTime: string; // e.g. "22:00"
  slotMinutes: number; // e.g. 60
  feePerSlot: number;
  depositAmount: number;
  status: AmenityStatus;
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AmenityBooking {
  _id?: ObjectId;
  societyId: string;
  amenityId: string;
  amenityName: string;
  residentId: string;
  residentName: string;
  unitId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  purpose: string;
  attendeesCount: number;
  totalFee: number;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AmenityService {
  private amenitiesCol?: Collection<Amenity>;
  private bookingsCol?: Collection<AmenityBooking>;

  private async getAmenitiesCollection(): Promise<Collection<Amenity>> {
    if (!this.amenitiesCol) {
      const db = await getDb();
      const col = db.collection<Amenity>('amenities');
      await col.createIndex({ societyId: 1, code: 1 }, { unique: true });
      await col.createIndex({ societyId: 1, status: 1 });
      this.amenitiesCol = col;
    }
    return this.amenitiesCol;
  }

  private async getBookingsCollection(): Promise<Collection<AmenityBooking>> {
    if (!this.bookingsCol) {
      const db = await getDb();
      const col = db.collection<AmenityBooking>('amenityBookings');
      await col.createIndex({ societyId: 1, amenityId: 1, startTime: 1, endTime: 1 });
      await col.createIndex({ societyId: 1, residentId: 1 });
      await col.createIndex({ societyId: 1, status: 1 });
      this.bookingsCol = col;
    }
    return this.bookingsCol;
  }

  /**
   * Seed default society amenities if none exist
   */
  async ensureDefaultAmenities(societyId: string) {
    const col = await this.getAmenitiesCollection();
    const count = await col.countDocuments({ societyId });
    if (count > 0) return;

    const defaults: Omit<Amenity, '_id'>[] = [
      {
        societyId,
        name: 'Grand Clubhouse Banquet Hall',
        code: 'HALL-A',
        type: 'COMMUNITY_HALL',
        capacity: 150,
        description: 'Spacious banquet hall for private family celebrations, community events, and AGM meetings.',
        openTime: '09:00',
        closeTime: '23:00',
        slotMinutes: 240, // 4-hour slots
        feePerSlot: 2500,
        depositAmount: 5000,
        status: 'ACTIVE',
        rules: [
          'No loud music past 22:00 in accordance with local quiet hours.',
          'Cleaning fee applies if hall is not cleared by end of slot.',
          'Decorations must not damage interior paint or fixtures.',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        name: 'Resident Guest Suite (Room 1)',
        code: 'GUEST-1',
        type: 'GUEST_ROOM',
        capacity: 3,
        description: 'Furnished air-conditioned studio room for visiting family members of registered residents.',
        openTime: '12:00',
        closeTime: '11:00', // standard overnight check-in / check-out
        slotMinutes: 1440, // 24-hour day
        feePerSlot: 1200,
        depositAmount: 1000,
        status: 'ACTIVE',
        rules: [
          'Valid government photo ID required for all staying guests.',
          'Maximum continuous stay of 5 nights per booking.',
          'No smoking or alcohol permitted inside guest suites.',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        name: 'All-Weather Tennis Court',
        code: 'TENNIS-1',
        type: 'SPORTS_FACILITY',
        capacity: 4,
        description: 'Synthetic floodlit tennis court. Proper non-marking tennis shoes mandatory.',
        openTime: '06:00',
        closeTime: '21:00',
        slotMinutes: 60,
        feePerSlot: 200,
        depositAmount: 0,
        status: 'ACTIVE',
        rules: [
          'Non-marking tennis footwear mandatory.',
          'Bring your own racquets and tennis balls.',
          'Maximum 1 court reservation per resident per day.',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await col.insertMany(defaults);
  }

  /**
   * List all amenities for a society
   */
  async listAmenities(societyId: string, onlyActive = true): Promise<Amenity[]> {
    await this.ensureDefaultAmenities(societyId);
    const col = await this.getAmenitiesCollection();
    const query = onlyActive ? { societyId, status: 'ACTIVE' as AmenityStatus } : { societyId };
    return col.find(query).sort({ name: 1 }).toArray();
  }

  /**
   * Get single amenity details with upcoming bookings
   */
  async getAmenity(societyId: string, amenityId: string): Promise<Amenity | null> {
    const col = await this.getAmenitiesCollection();
    return col.findOne({ _id: new ObjectId(amenityId), societyId });
  }

  /**
   * Check slot availability and retrieve existing bookings for a date range
   */
  async getAvailability(
    societyId: string,
    amenityId: string,
    startRange: Date,
    endRange: Date
  ): Promise<AmenityBooking[]> {
    const col = await this.getBookingsCollection();
    return col
      .find({
        societyId,
        amenityId,
        status: 'CONFIRMED',
        startTime: { $lt: endRange },
        endTime: { $gt: startRange },
      })
      .sort({ startTime: 1 })
      .toArray();
  }

  /**
   * Atomic booking reservation preventing double bookings or conflicting time slots
   */
  async createBooking(
    societyId: string,
    user: { id: string; name: string; unitId: string },
    data: {
      amenityId: string;
      startTime: Date;
      endTime: Date;
      purpose: string;
      attendeesCount: number;
    }
  ): Promise<AmenityBooking> {
    const amenitiesCol = await this.getAmenitiesCollection();
    const bookingsCol = await this.getBookingsCollection();
    const now = new Date();

    if (data.startTime < now) {
      throw new Error('Booking start time cannot be in the past');
    }

    if (data.endTime <= data.startTime) {
      throw new Error('Booking end time must be after start time');
    }

    // Verify amenity exists and is active
    const amenity = await amenitiesCol.findOne({
      _id: new ObjectId(data.amenityId),
      societyId,
      status: 'ACTIVE',
    });

    if (!amenity) {
      throw new Error('Amenity not found or currently unavailable');
    }

    if (data.attendeesCount > amenity.capacity) {
      throw new Error(`Attendees (${data.attendeesCount}) exceed maximum capacity of ${amenity.capacity}`);
    }

    // Check for conflicting confirmed bookings (atomic check)
    const conflict = await bookingsCol.findOne({
      societyId,
      amenityId: data.amenityId,
      status: 'CONFIRMED',
      startTime: { $lt: data.endTime },
      endTime: { $gt: data.startTime },
    });

    if (conflict) {
      throw new Error(
        `This slot conflicts with an existing reservation from ${conflict.startTime.toLocaleTimeString()} to ${conflict.endTime.toLocaleTimeString()}`
      );
    }

    // Calculate fee
    const durationMinutes = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);
    const slots = Math.max(1, Math.ceil(durationMinutes / amenity.slotMinutes));
    const totalFee = slots * amenity.feePerSlot;

    const booking: AmenityBooking = {
      societyId,
      amenityId: data.amenityId,
      amenityName: amenity.name,
      residentId: user.id,
      residentName: user.name,
      unitId: user.unitId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'CONFIRMED',
      purpose: data.purpose.trim(),
      attendeesCount: data.attendeesCount,
      totalFee,
      createdAt: now,
      updatedAt: now,
    };

    const res = await bookingsCol.insertOne(booking);

    await auditService.log({
      societyId,
      userId: user.id,
      action: 'AMENITY_BOOKED',
      resourceType: 'AMENITY_BOOKING',
      resourceId: res.insertedId.toString(),
      details: {
        amenityName: amenity.name,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        totalFee,
      },
    });

    return { ...booking, _id: res.insertedId };
  }

  /**
   * Cancel booking by resident or admin
   */
  async cancelBooking(
    societyId: string,
    bookingId: string,
    userId: string,
    userRole: string,
    reason?: string
  ): Promise<AmenityBooking> {
    const bookingsCol = await this.getBookingsCollection();
    const now = new Date();

    const query: Record<string, unknown> = {
      _id: new ObjectId(bookingId),
      societyId,
      status: 'CONFIRMED',
    };

    // If resident, must own the booking
    if (userRole === 'RESIDENT') {
      query.residentId = userId;
    }

    const res = await bookingsCol.findOneAndUpdate(
      query,
      {
        $set: {
          status: 'CANCELLED',
          cancellationReason: reason?.trim() || 'Cancelled by user',
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    if (!res) {
      throw new Error('Confirmed booking not found or unauthorized to cancel');
    }

    await auditService.log({
      societyId,
      userId,
      action: 'AMENITY_BOOKING_CANCELLED',
      resourceType: 'AMENITY_BOOKING',
      resourceId: bookingId,
      details: { amenityName: res.amenityName, reason },
    });

    return res;
  }

  /**
   * List bookings for a resident
   */
  async getResidentBookings(societyId: string, residentId: string): Promise<AmenityBooking[]> {
    const bookingsCol = await this.getBookingsCollection();
    return bookingsCol.find({ societyId, residentId }).sort({ startTime: -1 }).toArray();
  }

  /**
   * List all society bookings (Admin view)
   */
  async getAllBookings(societyId: string, limit = 100): Promise<AmenityBooking[]> {
    const bookingsCol = await this.getBookingsCollection();
    return bookingsCol.find({ societyId }).sort({ startTime: -1 }).limit(limit).toArray();
  }
}

export const amenityService = new AmenityService();
