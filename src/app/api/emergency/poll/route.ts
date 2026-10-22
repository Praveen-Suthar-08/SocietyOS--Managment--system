import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/permissions';
import { emergencyService } from '@/server/services/emergency-service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    const searchParams = req.nextUrl.searchParams;
    const sinceParam = searchParams.get('since');

    const sinceDate = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 30000); // default last 30s
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json({ error: 'Invalid since timestamp' }, { status: 400 });
    }

    const updates = await emergencyService.getIncidentsSince(session.user.societyId, sinceDate);
    return NextResponse.json({
      updates,
      serverTime: new Date().toISOString(),
      pollIntervalMs: 5000,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
