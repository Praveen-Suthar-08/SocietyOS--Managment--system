import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/permissions';
import { invitationService } from '@/server/services/invitation-service';

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['RESIDENT', 'SECURITY']),
  unitIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const verified = await requireRole(['ADMIN']);
    const body = await req.json();
    const validated = createInviteSchema.parse(body);

    const result = await invitationService.createInvitation({
      societyId: verified.user.societyId,
      email: validated.email,
      role: validated.role,
      unitIds: validated.unitIds,
      invitedByUserId: verified.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        email: result.email,
        role: result.role,
        expiresAt: result.expiresAt,
        // In non-production only, return token to ease local testing
        ...(process.env.NODE_ENV !== 'production' ? { devToken: result.token } : {}),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create invitation';
    const status = (err as { statusCode?: number }).statusCode || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
