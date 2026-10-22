import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/permissions';
import { emergencyService } from '@/server/services/emergency-service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    const { id } = await params;

    const data = await emergencyService.getIncidentWithTimeline(session.user.societyId, id);
    if (!data) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Residents can only view incidents they reported
    if (session.user.role === 'RESIDENT' && data.incident.reporterId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
