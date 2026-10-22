import { describe, it, expect } from 'vitest';
import { env } from '@/lib/env';

describe('Environment Validator (src/lib/env)', () => {
  it('should parse environment variables without throwing', () => {
    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBeDefined();
    expect(env.MONGODB_URI).toBeDefined();
    expect(env.MONGODB_DB_NAME).toBe('societyos');
  });

  it('should enforce fallback security values if variables are missing', () => {
    expect(env.BETTER_AUTH_SECRET.length).toBeGreaterThanOrEqual(16);
    expect(typeof env.ENABLE_DEMO_SEED).toBe('boolean');
  });
});
