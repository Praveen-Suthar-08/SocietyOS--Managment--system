# SocietyOS — Comprehensive Test Strategy & Quality Gate Specification

**Version:** 1.0  
**Date:** 20 October 2026  
**Target:** Continuous Quality Verification Across Unit, Integration, E2E, A11y, and Security Layers  

---

## 1. Testing Pyramid & Tooling Architecture

```text
                  ▲
                 / \
                /   \     E2E Testing (Playwright)
               / E2E \    - Multi-persona user journeys (Resident, Security, Admin)
              /-------\   - Responsive viewports (375px mobile, 1440px desktop)
             /  Integ  \  Integration Testing (Vitest + MongoDB Test DB)
            /   Tests   \ - RBAC matrix, Better Auth flow, tenant isolation,
           /-------------\  realtime outage fallback, atomic state changes
          /  Unit Tests   \ Unit Testing (Vitest + RTL)
         /                 \- Zod schemas, status machines, sanitizers, math
        +-------------------+
```

### Test Tooling Stack
- **Unit & Integration Runner:** Vitest (`vitest`)
- **Component Testing:** React Testing Library (`@testing-library/react`)
- **End-to-End Runner:** Playwright (`@playwright/test`)
- **Accessibility Automation:** Axe Core (`@axe-core/playwright`)
- **Static Analysis & Type Safety:** TypeScript (`tsc --noEmit`), ESLint (`eslint`)

---

## 2. Test Suites by Layer

### 2.1 Unit Test Plan (`tests/unit/`)
| Module / Target | Test Cases | Expected Outcome |
|-----------------|------------|------------------|
| **Zod Validation Schemas** | - Valid & invalid incident submission shapes<br>- Malformed email / invalid role strings<br>- Injection of extra unknown properties | - Valid inputs pass; invalid inputs return structured field-level errors; unknown properties stripped. |
| **Incident State Machine** | - Valid transitions: `OPEN` $\to$ `ACKNOWLEDGED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED`<br>- Illegal transitions: `OPEN` $\to$ `CLOSED` without resolution | - Illegal transitions throw domain validation errors. |
| **Visitor Pass Rules** | - Pass expiry calculation (`validUntil < now`)<br>- Remaining guest capacity decrement<br>- Revocation status flags | - Expired and revoked passes return `isValid === false`. |
| **Unit Occupancy Transitions** | - Valid: `VACANT` $\to$ `OCCUPIED`<br>- Invalid: Attempting to occupy an already `OCCUPIED` unit without move-out | - Conflict error returned; state preserved. |
| **Amenity Booking Conflict Logic** | - Overlapping time slots on same amenity<br>- Booking outside operating hours<br>- Cancellation within locked notice window | - Overlaps rejected; cancellation rules enforced. |
| **Sanitizers & Security Helpers** | - CSV formula sanitization (`=cmd|...` prefixed with `'`)<br>- Opaque token hash verification (SHA-256)<br>- Deep clone and PII redaction utilities | - Formulas safely escaped; PII redacted. |

---

### 2.2 Integration Test Plan (`tests/integration/`)
| Scenario / Flow | Test Methodology | Verification Points |
|-----------------|------------------|---------------------|
| **Multi-Tenant Isolation** | Seed Society A and Society B. Execute queries as User A. | Zero records from Society B returned in any endpoint. |
| **Invitation & Onboarding Lifecycle** | 1. Admin creates invite for `SECURITY` role.<br>2. Invitee accepts and registers with password.<br>3. Attempt token replay.<br>4. Attempt role tampering in request body. | Token is single-use (replay rejected); role strictly matches invitation record; user created with `status: ACTIVE`. |
| **RBAC Matrix Enforcement** | Execute all API endpoints with anonymous session, `RESIDENT`, `SECURITY`, and `ADMIN` tokens. | Matrix from `docs/PERMISSION_MATRIX.md` matches 100% of HTTP status codes (200 vs 403 vs 401). |
| **Atomic Concurrency & Check-in** | Simulate 2 concurrent check-in requests with the same visitor pass code. | Exactly one request succeeds with 200; the second fails with duplicate/already checked-in error. |
| **Realtime Provider Failure & Fallback** | 1. Disable realtime broadcast adapter.<br>2. Submit emergency SOS.<br>3. Query REST endpoint with `since` timestamp. | SOS persists cleanly in MongoDB; outbox logs delivery failure; client recovers incident data via REST polling. |
| **Camera Authorization & Secret Boundary** | Query `/api/cameras/:id/token` as Resident vs Security. | Resident receives 403 Forbidden; Security receives short-lived signed playback token; zero RTSP passwords in response. |

---

### 2.3 End-to-End User Journey Tests (`tests/e2e/`)

#### Journey 1: Anonymous & Public Boundary
- Anonymous user navigates to `/` (Landing page).
- Verifies hero copy, feature highlights, and sample preview banner: *"Product preview — sample data"*.
- Attempts deep links to `/resident`, `/security`, `/admin`.
- **Assertion:** Automatically redirected to `/sign-in` with clean query return URL.

#### Journey 2: Resident Lifecycle
- Resident signs in with verified credentials.
- Navigates to `/resident/emergency`:
  - Triggers SOS with category `LIFT_ELEVATOR` and location `Tower B, Elevator 2`.
  - Sees immediate persisted incident status and unique reference (`INC-XXXX`).
- Navigates to `/resident/visitors`:
  - Creates a guest pass for tomorrow (1 guest).
  - Sees generated 6-character code and QR card.
- Navigates to `/resident/maintenance`:
  - Submits a plumbing repair request.
- Navigates to `/resident/amenities`:
  - Reserves the Clubhouse for an available slot.
- **Assertion:** All created records appear in their respective personal lists.

#### Journey 3: Security Operations Console
- Security Officer signs in; completes mandatory TOTP verification.
- Opens `/security/entry-exit`:
  - Scans/inputs valid visitor code created by Resident; verifies green confirmation and records entry.
  - Re-scans same code; verifies warning: *“Pass already checked in”*.
  - Scans an expired/revoked code; verifies red denial message with reason logging.
  - Records exit for the checked-in visitor; visitor count decrements.
- Opens `/security/incidents`:
  - Sees the active SOS incident reported by Resident in Journey 2.
  - Clicks **Acknowledge**; status updates to `ACKNOWLEDGED`.
  - Assigns responder; adds operational note.
- Opens `/security/shift-handover`:
  - Logs end-of-shift summary.
- **Assertion:** Guard console reflects atomic state transitions and audit logs.

#### Journey 4: Society Administrator Command Center
- Administrator signs in with MFA.
- Navigates to `/admin/units`:
  - Updates unit status from `VACANT` to `MAINTENANCE`.
  - Verifies live KPI counters and occupancy event log update.
- Navigates to `/admin/residents`:
  - Creates an invitation for a new resident.
- Navigates to `/admin/announcements`:
  - Publishes a safety announcement targeted to all residents.
- Navigates to `/admin/cameras`:
  - Inspects camera inventory; confirms unconfigured camera displays: *"Camera integration not configured"*.
- Navigates to `/admin/audit`:
  - Verifies presence of audit logs for every action executed in Journeys 2, 3, and 4.
  - Tests CSV export; verifies formula characters (`=,+,-,@`) are sanitized.

---

### 2.4 Accessibility & Visual Responsiveness Testing

#### Automated Axe-Core Scans
Run `@axe-core/playwright` on all critical templates:
- Public Landing Page (`/`)
- Sign In (`/sign-in`)
- Resident Dashboard (`/resident`)
- Resident SOS Dialog (`/resident/emergency`)
- Security Console (`/security`)
- Admin Units Overview (`/admin/units`)
- **Zero critical or serious WCAG 2.2 AA violations permitted.**

#### Keyboard Navigation & Focus Flow
- Skip-to-content links functional.
- All modal dialogs trap focus inside when open and return focus to triggering element on close.
- Focus rings visible on all interactive elements (`outline: 2px solid #276749; outline-offset: 2px`).

#### Responsive Breakpoint Matrix
Test all primary routes across:
1. `360 x 800px` (Compact mobile / Android)
2. `375 x 667px` (iPhone SE)
3. `768 x 1024px` (iPad Portrait)
4. `1024 x 768px` (iPad Landscape / Small Desktop)
5. `1440 x 900px` (Standard Desktop)
6. `1920 x 1080px` (Wide Screen)

**Acceptance Criteria:**
- Zero horizontal overflow (`scrollWidth === clientWidth`).
- No overlapping cards or text truncation of essential status badges.
- Touch targets $\ge 44 \times 44\text{px}$ on mobile screens.
- Tables collapse into card views or support smooth horizontal pan on small viewports.

---

## 3. Quality Release Gate Checklist

Before reporting completion in Phase 8, the following commands must execute cleanly:

```bash
# 1. Static Analysis & Type Checking
npm run lint
npm run typecheck

# 2. Unit & Integration Test Suite
npm run test

# 3. Automated End-to-End & Accessibility Tests
npx playwright test

# 4. Production Build Verification
npm run build
```

**Blocking Conditions:**
- Any failing test.
- Any TypeScript `any` bypass or type assertion suppressing actual errors.
- Any unhandled promise rejection or unverified integration masquerading as operational.
- Secrets or passwords detected in client bundles.
