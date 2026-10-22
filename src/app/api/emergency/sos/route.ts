import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/permissions';
import { emergencyService, EmergencyCategory } from '@/server/services/emergency-service';

const TriggerSOSSchema = z.object({
  category: z.enum(['MEDICAL', 'FIRE', 'SECURITY', 'LIFT_ENTRAPMENT', 'GAS_LEAK', 'OTHER']),
  locationDescription: z.string().min(2, 'Location description is required for responders'),
  description: z.string().min(2, 'Description is required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);

    const body = await req.json();
    const parsed = TriggerSOSSchema.parse(body);

    const incident = await emergencyService.triggerSOS(
      session.user.societyId,
      {
        id: session.user.id,
        name: session.user.name,
        phone: session.user.email, // using verified contact info
        unitId: session.user.unitIds?.[0] || 'Unassigned',
      },
      {
        category: parsed.category as EmergencyCategory,
        locationDescription: parsed.locationDescription,
        description: parsed.description,
      }
    );

    return NextResponse.json(
      {
        incident,
        message: 'EMERGENCY ALERT PERSISTED AND DISPATCHED TO GATE & ADMIN CONSOLES',
        hotlineReminder: 'If life-threatening, call emergency services directly at 112 / 911.',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
