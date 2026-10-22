import { NextRequest, NextResponse } from 'next/server';
import { requireSession, requireRole } from '@/lib/permissions';
import { cctvService, CameraZone } from '@/server/services/cctv-service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);

    const searchParams = req.nextUrl.searchParams;
    const zone = searchParams.get('zone') as CameraZone | null;

    const cameras = await cctvService.listCameras(session.user.societyId, zone || undefined);
    return NextResponse.json({ cameras });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
