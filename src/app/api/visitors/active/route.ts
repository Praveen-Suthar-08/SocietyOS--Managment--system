import { NextRequest, NextResponse } from 'next/server';
import { requireSession, requireRole } from '@/lib/permissions';
import { visitorService } from '@/server/services/visitor-service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);

    const visitors = await visitorService.getCurrentlyInside(session.user.societyId);
    return NextResponse.json({ visitors });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
