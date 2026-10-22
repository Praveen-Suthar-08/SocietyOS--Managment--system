import 'server-only';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { mongoDb } from '@/lib/db/mongodb';
import { emailService } from '@/lib/email';
import { env } from '@/lib/env';
import { checkRateLimit } from '@/lib/security/rate-limit';

export interface CreateInvitationInput {
  societyId: string;
  email: string;
  role: 'RESIDENT' | 'SECURITY';
  unitIds?: string[];
  invitedByUserId: string;
}

export interface InvitationRecord {
  _id?: ObjectId;
  societyId: string;
  email: string;
  role: 'RESIDENT' | 'SECURITY';
  tokenHash: string;
  unitIds?: string[];
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export class InvitationService {
  private collectionName = 'invitations';

  private get collection() {
    return mongoDb.collection<InvitationRecord>(this.collectionName);
  }

  /**
   * Hashes a raw token with SHA-256 for secure constant-length storage
   */
  public hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a single-use onboarding invitation
   */
  async createInvitation(input: CreateInvitationInput) {
    const rateCheck = checkRateLimit(`invite:${input.societyId}`, {
      intervalMs: 60 * 1000,
      maxRequests: 20,
    });

    if (!rateCheck.allowed) {
      throw new Error('Too many invitation requests. Please wait before creating more.');
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const rawToken = `inv_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = this.hashToken(rawToken);

    const record: InvitationRecord = {
      societyId: input.societyId,
      email: normalizedEmail,
      role: input.role,
      tokenHash,
      unitIds: input.unitIds || [],
      invitedBy: input.invitedByUserId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
      createdAt: new Date(),
    };

    await this.collection.insertOne(record);

    // Send invitation email
    const onboardingUrl = `${env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${rawToken}`;
    await emailService.sendEmail({
      to: normalizedEmail,
      subject: `Welcome to SocietyOS — Onboarding for ${input.role}`,
      text: `You have been invited to join SocietyOS as a ${input.role}. Complete your setup at: ${onboardingUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #D9DED8; border-radius: 8px;">
          <h2 style="color: #276749;">Welcome to SocietyOS</h2>
          <p>You have been invited to activate your account as a <strong>${input.role}</strong>.</p>
          <p><a href="${onboardingUrl}" style="background-color: #276749; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Registration</a></p>
          <p style="font-size: 12px; color: #66716A;">This invitation token expires in 7 days and can only be used once.</p>
        </div>
      `,
    });

    // Record audit log
    await mongoDb.collection('auditLogs').insertOne({
      societyId: input.societyId,
      actorId: input.invitedByUserId,
      actorRole: 'ADMIN',
      action: 'INVITATION_CREATED',
      resourceType: 'INVITATION',
      outcome: 'SUCCESS',
      details: {
        targetEmail: normalizedEmail,
        role: input.role,
        unitIds: input.unitIds,
      },
      timestamp: new Date(),
    });

    return {
      success: true,
      email: normalizedEmail,
      role: input.role,
      expiresAt: record.expiresAt,
      // For automated tests and dev logs only
      token: rawToken,
    };
  }

  /**
   * Verifies that an invitation token exists, is unexpired, and has not been used or revoked
   */
  async verifyInvitation(rawToken: string): Promise<InvitationRecord> {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new Error('Invalid or missing invitation token');
    }

    const tokenHash = this.hashToken(rawToken);
    const invite = await this.collection.findOne({ tokenHash });

    if (!invite) {
      throw new Error('Invalid invitation token');
    }

    if (invite.acceptedAt) {
      throw new Error('This invitation has already been accepted and cannot be reused');
    }

    if (invite.revokedAt) {
      throw new Error('This invitation has been revoked by an administrator');
    }

    if (new Date() > invite.expiresAt) {
      throw new Error('This invitation has expired');
    }

    return invite;
  }

  /**
   * Consumes an invitation atomically and sets acceptedAt
   */
  async consumeInvitation(rawToken: string, userId: string) {
    const tokenHash = this.hashToken(rawToken);

    const result = await this.collection.findOneAndUpdate(
      {
        tokenHash,
        acceptedAt: { $exists: false },
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          acceptedAt: new Date(),
          acceptedByUserId: userId,
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Failed to consume invitation: token expired, already used, or revoked');
    }

    return result;
  }
}

export const invitationService = new InvitationService();
