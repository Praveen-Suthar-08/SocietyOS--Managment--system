import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { mongoDb } from '@/lib/db/mongodb';
import { invitationService } from '@/server/services/invitation-service';

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = acceptInviteSchema.parse(body);

    // 1. Verify invitation token validity
    const invite = await invitationService.verifyInvitation(validated.token);

    // 2. Register user through Better Auth with server-bound role and societyId
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: invite.email,
        password: validated.password,
        name: validated.name,
        phone: validated.phone || '',
      },
    });

    if (!signUpResult || !signUpResult.user) {
      throw new Error('Failed to register user account');
    }

    // Authoritative server-side assignment of role, societyId, and unitIds directly from verified invitation
    await mongoDb.collection('user').updateOne(
      { email: invite.email },
      {
        $set: {
          role: invite.role,
          societyId: invite.societyId,
          status: 'ACTIVE',
          unitIds: invite.unitIds || [],
          updatedAt: new Date(),
        },
      }
    );

    // 3. Atomically mark invitation token as consumed
    await invitationService.consumeInvitation(validated.token, signUpResult.user.id);

    // 4. Record audit log
    await mongoDb.collection('auditLogs').insertOne({
      societyId: invite.societyId,
      actorId: signUpResult.user.id,
      actorRole: invite.role,
      action: 'INVITATION_ACCEPTED',
      resourceType: 'USER',
      outcome: 'SUCCESS',
      details: {
        email: invite.email,
        role: invite.role,
        unitIds: invite.unitIds,
      },
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account successfully created and activated',
        email: invite.email,
        role: invite.role,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to accept invitation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
