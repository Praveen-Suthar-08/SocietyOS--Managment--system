import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import { visitorService } from '@/server/services/visitor-service';

const CheckInSchema = z.object({
  passId: z.string().optional(),
  unitId: z.string().min(1, 'Unit identifier is required'),
  visitorName: z.string().min(2, 'Visitor name is required'),
  visitorPhone: z.string().min(5, 'Visitor phone is required'),
  vehicleNumber: z.string().optional(),
  entryType: z.enum(['PRE_APPROVED', 'WALK_IN', 'DELIVERY', 'CAB']),
  gateName: z.string().min(1, 'Gate name is required'),
  idempotencyKey: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['SECURITY', 'ADMIN']);

    const body = await req.json();
    const parsed = CheckInSchema.parse(body);

    const log = await visitorService.checkInVisitor(
      session.user.societyId,
      { id: session.user.id, name: session.user.name },
      parsed
    );

    return NextResponse.json({ log }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
