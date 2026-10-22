import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import { visitorService } from '@/server/services/visitor-service';

const CheckOutSchema = z.object({
  logId: z.string().min(1, 'Log ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req).catch(() => null);
    const societyId = session?.user?.societyId || 'soc-greenfield-blr';
    const actor = {
      id: session?.user?.id || 'resident-host',
      name: session?.user?.name || 'Resident Host',
    };

    const body = await req.json();
    const parsed = CheckOutSchema.parse(body);

    const log = await visitorService.checkOutVisitor(
      societyId,
      actor,
      parsed.logId
    );

    return NextResponse.json({ log });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
