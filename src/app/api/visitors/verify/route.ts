import { NextRequest, NextResponse } from 'next/server';
import { requireSession, requireRole } from '@/lib/permissions';
import { visitorService } from '@/server/services/visitor-service';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const pass = await visitorService.findPassByCodeOrQr(session.user.societyId, query);
    if (!pass) {
      return NextResponse.json({ found: false, message: 'Visitor pass not found' }, { status: 404 });
    }

    return NextResponse.json({ found: true, pass });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
