import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/permissions';
import { unitService, UnitStatus, OccupancyEventType } from '@/server/services/unit-service';

const updateStatusSchema = z.object({
  newStatus: z.enum(['VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']),
  eventType: z.enum(['MOVE_IN', 'MOVE_OUT', 'RESERVATION', 'MAINTENANCE_FLAG']),
  reasonCode: z.string().min(2),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verified = await requireRole(['ADMIN']);
    const { id } = await params;
    const body = await req.json();
    const validated = updateStatusSchema.parse(body);

    const updated = await unitService.updateUnitStatus({
      unitId: id,
      societyId: verified.user.societyId,
      newStatus: validated.newStatus as UnitStatus,
      eventType: validated.eventType as OccupancyEventType,
      reasonCode: validated.reasonCode,
      note: validated.note,
      actorId: verified.user.id,
      actorRole: verified.user.role,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update unit status';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
