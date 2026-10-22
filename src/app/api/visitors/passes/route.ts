import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import { visitorService, PassPurpose } from '@/server/services/visitor-service';

const CreatePassSchema = z.object({
  unitId: z.string().min(1, 'Unit identifier is required'),
  visitorName: z.string().min(2, 'Visitor name is required'),
  visitorPhone: z.string().min(5, 'Visitor phone is required'),
  vehicleNumber: z.string().optional(),
  purpose: z.enum(['GUEST', 'DELIVERY', 'SERVICE', 'CAB', 'OTHER']),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  maxEntries: z.number().int().min(1).max(30).default(1),
  passCode: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    const passes = await visitorService.getResidentPasses(session.user.societyId, session.user.id);
    return NextResponse.json({ passes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session, ['RESIDENT', 'ADMIN']);

    const body = await req.json();
    const parsed = CreatePassSchema.parse(body);

    const pass = await visitorService.createPass(session.user.societyId, session.user.id, {
      unitId: parsed.unitId,
      visitorName: parsed.visitorName,
      visitorPhone: parsed.visitorPhone,
      vehicleNumber: parsed.vehicleNumber,
      purpose: parsed.purpose as PassPurpose,
      validFrom: new Date(parsed.validFrom),
      validUntil: new Date(parsed.validUntil),
      maxEntries: parsed.maxEntries,
      passCode: parsed.passCode,
    });

    return NextResponse.json({ pass }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
