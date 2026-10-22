import { NextRequest, NextResponse } from 'next/server';
import { requireSession, requireRole } from '@/lib/permissions';
import { cctvService } from '@/server/services/cctv-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);
    const { id } = await params;

    const grant = await cctvService.requestPlaybackGrant(session.user.societyId, id, {
      id: session.user.id,
      name: session.user.name,
      role: session.user.role,
    });

    return NextResponse.json({ grant });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
