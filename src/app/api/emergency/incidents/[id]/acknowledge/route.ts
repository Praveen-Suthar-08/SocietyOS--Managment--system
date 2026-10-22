import { NextRequest, NextResponse } from 'next/server';
import { requireSession, requireRole } from '@/lib/permissions';
import { emergencyService } from '@/server/services/emergency-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const notes = typeof body.notes === 'string' ? body.notes : undefined;

    const incident = await emergencyService.acknowledgeIncident(
      session.user.societyId,
      id,
      { id: session.user.id, name: session.user.name, role: session.user.role },
      notes
    );

    return NextResponse.json({ incident, message: 'Incident acknowledged' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
