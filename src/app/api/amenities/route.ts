import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/permissions';
import { amenityService } from '@/server/services/amenity-service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    const amenities = await amenityService.listAmenities(session.user.societyId);
    return NextResponse.json({ amenities });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
