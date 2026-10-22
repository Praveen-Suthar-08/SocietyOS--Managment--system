import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, requireRole } from '@/lib/permissions';
import { unitService, UnitStatus } from '@/server/services/unit-service';

const createUnitSchema = z.object({
  unitCode: z.string().min(1).max(20),
  floor: z.number().int(),
  block: z.string().min(1).max(10),
});

export async function GET(req: Request) {
  try {
    const verified = await requireSession();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status') as UnitStatus | undefined;
    const block = searchParams.get('block') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await unitService.getUnits(verified.user.societyId, {
      status,
      block,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch units';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const verified = await requireRole(['ADMIN']);
    const body = await req.json();
    const validated = createUnitSchema.parse(body);

    const unit = await unitService.createUnit({
      societyId: verified.user.societyId,
      unitCode: validated.unitCode,
      floor: validated.floor,
      block: validated.block,
      actorId: verified.user.id,
      actorRole: verified.user.role,
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create unit';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
