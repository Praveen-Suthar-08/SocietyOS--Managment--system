import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/permissions';
import { amenityService } from '@/server/services/amenity-service';

const CreateBookingSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  purpose: z.string().min(2, 'Purpose of reservation is required'),
  attendeesCount: z.number().int().min(1, 'At least 1 attendee is required'),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    const { id } = await params;

    const startRange = new Date();
    const endRange = new Date(Date.now() + 30 * 24 * 3600 * 1000); // Next 30 days

    const bookings = await amenityService.getAvailability(session.user.societyId, id, startRange, endRange);
    return NextResponse.json({ bookings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    const { id } = await params;

    const body = await req.json();
    const parsed = CreateBookingSchema.parse(body);

    const booking = await amenityService.createBooking(
      session.user.societyId,
      {
        id: session.user.id,
        name: session.user.name,
        unitId: session.user.unitIds?.[0] || 'Unassigned',
      },
      {
        amenityId: id,
        startTime: new Date(parsed.startTime),
        endTime: new Date(parsed.endTime),
        purpose: parsed.purpose,
        attendeesCount: parsed.attendeesCount,
      }
    );

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('conflicts') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
