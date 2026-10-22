import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/permissions';
import { amenityService } from '@/server/services/amenity-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason : undefined;

    const booking = await amenityService.cancelBooking(
      session.user.societyId,
      id,
      session.user.id,
      session.user.role,
      reason
    );

    return NextResponse.json({ booking, message: 'Reservation cancelled successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('unauthorized') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
