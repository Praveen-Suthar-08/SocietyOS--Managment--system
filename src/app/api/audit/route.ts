import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/permissions';
import { auditService } from '@/server/services/audit-service';

export async function GET(req: Request) {
  try {
    const verified = await requireRole(['ADMIN']);
    const { searchParams } = new URL(req.url);

    const action = searchParams.get('action') || undefined;
    const resourceType = searchParams.get('resourceType') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const logs = await auditService.getLogs(verified.user.societyId, {
      action,
      resourceType,
      page,
      limit,
    });

    return NextResponse.json(logs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
