import { describe, it, expect } from 'vitest';
import { Role, UserStatus, AuthError, ForbiddenError } from '@/lib/permissions';

interface TestUser {
  id: string;
  role: Role;
  status: UserStatus;
  societyId: string;
  mfaEnrolled?: boolean;
}

function evaluateRolePermission(user: TestUser | null, allowedRoles: Role[]) {
  if (!user) throw new AuthError('Valid session is required');
  if (user.status !== 'ACTIVE') throw new ForbiddenError(`Account status is ${user.status}. Access prohibited.`);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Role '${user.role}' is not authorized for this operation`);
  }
  return true;
}

function evaluateResourceOwnership(user: TestUser | null, resourceOwnerId: string, overrideRoles: Role[] = ['ADMIN']) {
  if (!user) throw new AuthError('Valid session is required');
  if (user.status !== 'ACTIVE') throw new ForbiddenError(`Account status is ${user.status}`);
  if (user.id === resourceOwnerId || overrideRoles.includes(user.role)) {
    return true;
  }
  throw new ForbiddenError('You do not own this resource');
}

describe('RBAC & Resource Ownership Guard Logic', () => {
  const residentUser: TestUser = {
    id: 'user_resident_1',
    role: 'RESIDENT',
    status: 'ACTIVE',
    societyId: 'soc_1',
  };

  const securityUser: TestUser = {
    id: 'user_sec_1',
    role: 'SECURITY',
    status: 'ACTIVE',
    societyId: 'soc_1',
  };

  const adminUser: TestUser = {
    id: 'user_admin_1',
    role: 'ADMIN',
    status: 'ACTIVE',
    societyId: 'soc_1',
  };

  const suspendedUser: TestUser = {
    id: 'user_suspended_1',
    role: 'RESIDENT',
    status: 'SUSPENDED',
    societyId: 'soc_1',
  };

  it('allows ADMIN to access admin-only operations', () => {
    expect(evaluateRolePermission(adminUser, ['ADMIN'])).toBe(true);
  });

  it('rejects RESIDENT attempting to access admin-only operations (BOLA/Privilege Escalation)', () => {
    expect(() => evaluateRolePermission(residentUser, ['ADMIN'])).toThrow(ForbiddenError);
  });

  it('rejects SECURITY attempting to access admin-only operations', () => {
    expect(() => evaluateRolePermission(securityUser, ['ADMIN'])).toThrow(ForbiddenError);
  });

  it('rejects anonymous access with AuthError (401)', () => {
    expect(() => evaluateRolePermission(null, ['ADMIN', 'RESIDENT'])).toThrow(AuthError);
  });

  it('immediately blocks SUSPENDED accounts regardless of role', () => {
    expect(() => evaluateRolePermission(suspendedUser, ['RESIDENT'])).toThrow(/Access prohibited/);
  });

  it('permits resource owner to access their own resource', () => {
    expect(evaluateResourceOwnership(residentUser, 'user_resident_1')).toBe(true);
  });

  it('blocks another resident from accessing a private resource (IDOR prevention)', () => {
    expect(() => evaluateResourceOwnership(residentUser, 'user_resident_other')).toThrow(ForbiddenError);
  });

  it('allows ADMIN override on resources for governance', () => {
    expect(evaluateResourceOwnership(adminUser, 'user_resident_1')).toBe(true);
  });
});
