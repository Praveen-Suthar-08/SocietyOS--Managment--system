# SocietyOS — Role-Based Access Control (RBAC) & Permission Matrix

**Version:** 1.0  
**Date:** 20 October 2026  
**Enforcement Principle:** Server-Side Default-Deny on Every Endpoint & Mutation  

---

## 1. Role Definitions

| Role Code | Role Title | Primary Workspace | Description |
|-----------|------------|-------------------|-------------|
| `RESIDENT` | Resident / Member | `/resident` | Household occupant. Access strictly scoped to their assigned unit(s) and personal requests. |
| `SECURITY` | Security Officer | `/security` | On-duty gate and perimeter officer. Focus on visitor entry/exit, incident dispatch, patrols, and shift logs. |
| `ADMIN` | Society Administrator | `/admin` | Executive officer. Global tenant oversight over units, personnel, cameras, announcements, audit logs, and configuration. |

---

## 2. Resource-by-Resource Permission Matrix

### Legend
- **`OWN`**: Allowed only if resource belongs to the actor's user ID or assigned unit.
- **`ALL`**: Allowed across all records within the current `societyId` tenant.
- **`DENIED`**: Completely forbidden (returns HTTP 403 Forbidden).
- **`AUDITED`**: Operation generates an immutable entry in `auditLogs`.

| Resource / Action | Resident | Security Officer | Society Administrator | Server Enforcement Rule |
|-------------------|----------|------------------|-----------------------|-------------------------|
| **User Profiles** | | | | |
| View profile | `OWN` | `OWN` | `ALL` | Reject any query for another user's profile |
| Update profile details | `OWN` (Name, contact) | `OWN` (Name) | `ALL` | Role, status, and unit membership cannot be self-edited |
| Change user status/suspend | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Suspended users immediately lose session validity |
| Invite new user | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Generates hashed single-use invitation token |
| | | | | |
| **Units & Occupancy** | | | | |
| View own unit membership | `OWN` | `DENIED` | `ALL` | Security sees unit code only when verifying visitor |
| Browse public vacancy listings | `ALLOWED` (Opt-in only) | `DENIED` | `ALL` | Only listings with `isPubliclyListed: true` returned; no PII |
| Create / modify unit | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Enforces unique `societyId + unitCode` |
| Change occupancy status | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Atomic conditional update creating `occupancyEvents` |
| | | | | |
| **Visitor Passes** | | | | |
| Create guest pass | `OWN` | `DENIED` | `DENIED` | Binds pass to resident's verified unit ID |
| Revoke guest pass | `OWN` (`AUDITED`) | `DENIED` | `ALL` (`AUDITED`) | Immediate invalidation of pass token |
| View pass history | `OWN` | `DENIED` | `ALL` | Resident sees only passes issued by their household |
| | | | | |
| **Gate Desk & Entry Logs** | | | | |
| Lookup / scan pass | `DENIED` | `ALL` | `ALL` | Validates status, time window, and matching `societyId` |
| Record check-in / check-out | `DENIED` | `ALL` (`AUDITED`) | `ALL` (`AUDITED`) | Atomic write with idempotency key; duplicate scans rejected |
| Record manual entry override | `DENIED` | `ALL` (`AUDITED` + Reason) | `ALL` (`AUDITED` + Reason) | Mandatory reason code and guard user ID recorded |
| View active on-site visitors | `DENIED` | `ALL` | `ALL` | Real-time presence table |
| View historical entry logs | `DENIED` | `CURRENT_SHIFT` | `ALL` (Filterable) | Paginated audit trail; no delete/edit operations permitted |
| | | | | |
| **Emergency Incidents (SOS)** | | | | |
| Trigger emergency incident | `OWN` | `ALL` (On resident behalf) | `ALL` | Immediate persistence to MongoDB before dispatch |
| View incident details | `OWN` | `ALL` | `ALL` | Resident sees only incidents they reported |
| Acknowledge incident | `DENIED` | `ALL` (`AUDITED`) | `ALL` (`AUDITED`) | Sets status to `ACKNOWLEDGED`, writes timeline event |
| Assign responder | `DENIED` | `ALL` (`AUDITED`) | `ALL` (`AUDITED`) | Sets responder ID and name in timeline |
| Resolve / Close incident | `DENIED` | `ALL` (`AUDITED` + Reason) | `ALL` (`AUDITED` + Reason) | Mandatory resolution code; creates closing event |
| Delete incident record | `DENIED` | `DENIED` | `DENIED` | Emergency incidents are append-only; never deleted |
| | | | | |
| **Maintenance Tickets** | | | | |
| Submit ticket | `OWN` | `DENIED` | `ALL` | Bound to resident's unit |
| View ticket status & comments | `OWN` | `ASSIGNED_ONLY` | `ALL` | Strict cross-household isolation |
| Assign / Update ticket status | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | State transitions recorded in `maintenanceEvents` |
| | | | | |
| **Announcements** | | | | |
| View announcements | `PUBLISHED_ONLY` | `PUBLISHED_ONLY` | `ALL` (Draft/Pub/Arch) | Filtered by `audience` field |
| Create / Publish / Archive | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Safety notices create versioned correction history |
| | | | | |
| **Amenities & Bookings** | | | | |
| View amenities & availability | `ALL` | `ALL` | `ALL` | Shows schedule and booked slots (no personal PII) |
| Book amenity slot | `OWN` | `DENIED` | `ALL` | Atomic slot conflict check; server enforces capacity |
| Cancel booking | `OWN` (Within window) | `DENIED` | `ALL` (`AUDITED`) | Enforces cancellation notice rule |
| Manage amenity schedules | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Operating hours, slot duration, capacity configs |
| | | | | |
| **Parcels Desk** | | | | |
| View parcel arrival status | `OWN` | `ALL` | `ALL` | Resident sees packages addressed to their unit |
| Log incoming parcel | `DENIED` | `ALL` | `ALL` | Guard records courier and unit reference |
| Record parcel collection | `DENIED` | `ALL` (`AUDITED`) | `ALL` (`AUDITED`) | Atomic status change to `COLLECTED` |
| | | | | |
| **CCTV & Cameras** | | | | |
| View camera list & health | `DENIED` | `ALL` | `ALL` | Resident has zero camera list access by default |
| Request live playback grant | `DENIED` | `PERMITTED_ZONES` (`AUDITED`)| `ALL` (`AUDITED`) | Issues 60s signed token; audits viewing event |
| Add / edit camera config | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Server-side gateway settings; zero RTSP in browser |
| | | | | |
| **Patrols & Shifts** | | | | |
| Record patrol checkpoint | `DENIED` | `ALL` | `ALL` | Guard logs location and timestamp |
| Record shift handover | `DENIED` | `ALL` (`AUDITED`) | `ALL` (`AUDITED`) | Summarizes open items; countersigned by incoming guard |
| | | | | |
| **Audit Logs & System Reports**| | | | |
| View audit logs | `DENIED` | `DENIED` | `ALL` (Read-only) | Filterable by date, actor, resource, outcome |
| Export audit reports | `DENIED` | `DENIED` | `ALL` (`AUDITED`) | Rate-limited CSV export with formula injection escaping |
| Modify / delete audit log | `DENIED` | `DENIED` | `DENIED` | Completely prohibited at application layer |

---

## 3. Server-Side Guard Implementation Contract

Every route handler and server action must utilize standardized helper functions from `src/lib/permissions`:

### 3.1 `requireSession()`
```typescript
// Validates session cookie, checks expiration, verifies user exists and status === 'ACTIVE'
const session = await requireSession();
```

### 3.2 `requireRole(roles: Role[])`
```typescript
// Throws 403 Forbidden if current user role is not in the allowed list
const user = await requireRole(['ADMIN', 'SECURITY']);
```

### 3.3 `requireResourceOwnership(resourceOwnerId: string | ObjectId, allowRoles?: Role[])`
```typescript
// Asserts that the authenticated user owns the resource or has an authorized override role (e.g. ADMIN)
await requireResourceOwnership(incident.reporterId, ['ADMIN', 'SECURITY']);
```

### 3.4 Multi-Tenant Society Enforcer
```typescript
// Automatically injects societyId into every MongoDB query filter
export function withSocietyScope<T extends { societyId?: string }>(
  userSocietyId: string, 
  filter: T
): T & { societyId: string } {
  return { ...filter, societyId: userSocietyId };
}
```
