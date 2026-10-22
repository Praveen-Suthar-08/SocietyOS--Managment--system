import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/permissions';
import { unitService } from '@/server/services/unit-service';

export async function GET() {
  try {
    const verified = await requireSession();
    const stats = await unitService.getOccupancyStats(verified.user.societyId);
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch unit stats';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
