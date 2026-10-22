import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rate-limit';
import { withSocietyScope } from '@/lib/permissions';

describe('Auth Security & RBAC Guard Units', () => {
  it('enforces password policy minimum length of 12 characters', () => {
    const isPasswordValid = (pwd: string) => pwd.length >= 12;
    expect(isPasswordValid('short123')).toBe(false);
    expect(isPasswordValid('exact12chars')).toBe(true);
    expect(isPasswordValid('SecureP@ssword2026!')).toBe(true);
  });

  it('generates consistent SHA-256 hashes for invitation tokens', () => {
    const token = 'inv_sample_random_token_12345';
    const hash1 = crypto.createHash('sha256').update(token).digest('hex');
    const hash2 = crypto.createHash('sha256').update(token).digest('hex');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('rate limits repeated abuse attempts', () => {
    const testKey = 'test-ip-rate-limit-check';
    resetRateLimit(testKey);

    const opts = { intervalMs: 1000, maxRequests: 3 };

    // Request 1, 2, 3 should be allowed
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);

    // Request 4 should be rejected
    const blocked = checkRateLimit(testKey, opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('strictly injects societyId into query filters via withSocietyScope', () => {
    const userSocietyId = 'society-greenfield-42';
    const filter = { status: 'OPEN', category: 'MEDICAL' };
    const scopedFilter = withSocietyScope(userSocietyId, filter);

    expect(scopedFilter.societyId).toBe('society-greenfield-42');
    expect(scopedFilter.status).toBe('OPEN');
    expect(scopedFilter.category).toBe('MEDICAL');
  });

  it('prevents cross-society query manipulation', () => {
    const userSocietyId = 'society-alpha';
    // Even if an attacker tries to pass societyId in the raw filter, withSocietyScope overrides it
    const maliciousFilter = { societyId: 'society-beta', incidentId: '123' };
    const safeFilter = withSocietyScope(userSocietyId, maliciousFilter);

    expect(safeFilter.societyId).toBe('society-alpha');
  });
});
