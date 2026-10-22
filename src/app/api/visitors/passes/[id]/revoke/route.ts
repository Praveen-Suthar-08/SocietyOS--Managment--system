import { NextRequest, NextResponse } from 'next/server';
import { requireSession, requireRole } from '@/lib/permissions';
import { visitorService } from '@/server/services/visitor-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['RESIDENT', 'ADMIN']);
    const { id } = await params;

    const success = await visitorService.revokePass(session.user.societyId, id, session.user.id);
    if (!success) {
      return NextResponse.json({ error: 'Pass not found or already inactive' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Pass revoked' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
