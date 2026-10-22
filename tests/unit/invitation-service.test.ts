import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

interface MockInvitation {
  tokenHash: string;
  email: string;
  role: 'RESIDENT' | 'SECURITY';
  societyId: string;
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function validateInvitation(invite: MockInvitation | null) {
  if (!invite) throw new Error('Invalid invitation token');
  if (invite.acceptedAt) throw new Error('This invitation has already been accepted and cannot be reused');
  if (invite.revokedAt) throw new Error('This invitation has been revoked by an administrator');
  if (new Date() > invite.expiresAt) throw new Error('This invitation has expired');
  return { valid: true, email: invite.email, role: invite.role };
}

describe('Invitation Life-cycle & Single-Use Rules', () => {
  const sampleToken = 'inv_test_sample_token_abcdef';
  const tokenHash = hashToken(sampleToken);

  it('validates a fresh, unexpired invitation', () => {
    const invite: MockInvitation = {
      tokenHash,
      email: 'resident@society.local',
      role: 'RESIDENT',
      societyId: 'society-1',
      expiresAt: new Date(Date.now() + 86400000), // tomorrow
    };

    const res = validateInvitation(invite);
    expect(res.valid).toBe(true);
    expect(res.role).toBe('RESIDENT');
  });

  it('rejects an invitation that has already been accepted (Replay Attack Prevention)', () => {
    const invite: MockInvitation = {
      tokenHash,
      email: 'resident@society.local',
      role: 'RESIDENT',
      societyId: 'society-1',
      expiresAt: new Date(Date.now() + 86400000),
      acceptedAt: new Date(Date.now() - 3600000), // accepted 1h ago
    };

    expect(() => validateInvitation(invite)).toThrow(/already been accepted/);
  });

  it('rejects an expired invitation', () => {
    const invite: MockInvitation = {
      tokenHash,
      email: 'guard@society.local',
      role: 'SECURITY',
      societyId: 'society-1',
      expiresAt: new Date(Date.now() - 1000), // expired 1s ago
    };

    expect(() => validateInvitation(invite)).toThrow(/has expired/);
  });

  it('rejects a revoked invitation', () => {
    const invite: MockInvitation = {
      tokenHash,
      email: 'guard@society.local',
      role: 'SECURITY',
      societyId: 'society-1',
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: new Date(),
    };

    expect(() => validateInvitation(invite)).toThrow(/has been revoked/);
  });

  it('rejects unknown or invalid tokens', () => {
    expect(() => validateInvitation(null)).toThrow(/Invalid invitation token/);
  });
});
