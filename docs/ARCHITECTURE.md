# SocietyOS — System Architecture & Data Model Specification

**Version:** 1.0  
**Date:** 20 October 2026  
**Pattern:** Modular Monolith with Server-Side Domain Boundaries  

---

## 1. System Overview & Technology Stack

SocietyOS is architected as a high-integrity, modular monolith leveraging the Next.js App Router. It separates client presentation from authoritative server-side domain services, enforcing strict data persistence, role boundaries, and audit logging.

```text
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  | Resident PWA (Mobile) | | Security Console Desk | | Admin Command Center    |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|            |                           |                          |               |
|            +---------------------------+--------------------------+               |
|                                        | HTTPS / Secure Cookies                   |
+----------------------------------------v------------------------------------------+
|                              NEXT.JS SERVER RUNTIME                               |
|  +-----------------------------------------------------------------------------+  |
|  | Route Handlers & Server Actions (/api/*, server actions)                   |  |
|  | - Zod Input Validation                                                      |  |
|  | - Session Extraction & Rotation (Better Auth)                               |  |
|  | - Central Authorization Guards (requireRole, requirePermission)             |  |
|  +-----------------------------------------------------------------------------+  |
|                                        |                                          |
|  +-----------------------------------------------------------------------------+  |
|  | DOMAIN SERVICES (Business Logic & Transactions)                             |  |
|  | - AuthService        - IncidentService      - UnitService                   |  |
|  | - VisitorService     - AmenityService       - CameraService                 |  |
|  | - TicketService      - AuditService         - NotificationService           |  |
|  +-----------------------------------------------------------------------------+  |
|                     |                                      |                      |
|  +------------------v------------------+  +----------------v-------------------+  |
|  | Database Repositories               |  | Integration Adapters               |  |
|  | - MongoDB Client Singleton          |  | - Realtime Adapter (Ably/WS/Poll)  |  |
|  | - Strongly Typed Collections        |  | - Email Adapter (Resend/DevSink)   |  |
|  | - Atomic Updates & Compound Indexes |  | - Media Gateway Token Generator    |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
                               |                                      |
                     +---------v---------+                  +---------v---------+
                     |   MongoDB Atlas   |                  | External Services |
                     | (Primary Source)  |                  | (Ably, Resend)    |
                     +-------------------+                  +-------------------+
```

---

## 2. Directory Layout & Module Structure

```text
societyos/
├── .env.example
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── design-system/
│   └── societyos/
│       ├── MASTER.md
│       └── pages/
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── PERMISSION_MATRIX.md
│   ├── THREAT_MODEL.md
│   └── TEST_PLAN.md
├── scripts/
│   ├── bootstrap-admin.ts
│   ├── setup-indexes.ts
│   └── seed-demo.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── security/page.tsx
│   │   │   └── invite/accept/page.tsx
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── mfa-verify/page.tsx
│   │   ├── (resident)/resident/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── emergency/page.tsx
│   │   │   ├── visitors/page.tsx
│   │   │   ├── maintenance/page.tsx
│   │   │   ├── announcements/page.tsx
│   │   │   ├── amenities/page.tsx
│   │   │   ├── parcels/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── security/page.tsx
│   │   ├── (security)/security/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── visitors/page.tsx
│   │   │   ├── entry-exit/page.tsx
│   │   │   ├── incidents/page.tsx
│   │   │   ├── cameras/page.tsx
│   │   │   ├── patrol/page.tsx
│   │   │   └── shift-handover/page.tsx
│   │   ├── (admin)/admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── units/page.tsx
│   │   │   ├── residents/page.tsx
│   │   │   ├── security-team/page.tsx
│   │   │   ├── incidents/page.tsx
│   │   │   ├── visitors/page.tsx
│   │   │   ├── cameras/page.tsx
│   │   │   ├── maintenance/page.tsx
│   │   │   ├── announcements/page.tsx
│   │   │   ├── amenities/page.tsx
│   │   │   ├── parcels/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...better-auth]/route.ts
│   │       ├── health/route.ts
│   │       ├── incidents/route.ts
│   │       ├── incidents/[id]/events/route.ts
│   │       ├── visitors/passes/route.ts
│   │       ├── visitors/check-in/route.ts
│   │       ├── visitors/check-out/route.ts
│   │       ├── units/route.ts
│   │       ├── units/[id]/status/route.ts
│   │       ├── amenities/route.ts
│   │       ├── amenities/bookings/route.ts
│   │       ├── parcels/route.ts
│   │       ├── announcements/route.ts
│   │       ├── cameras/route.ts
│   │       ├── cameras/[id]/token/route.ts
│   │       └── notifications/route.ts
│   ├── components/
│   │   ├── ui/          # Accessible primitives (Button, Dialog, Input, Card, Badge, etc.)
│   │   ├── layout/      # AppShell, Sidebar, Header, Breadcrumbs, ConnectionIndicator
│   │   ├── shared/      # StatusBadge, ConfirmDialog, EmptyState, DataTable, FallbackNotice
│   │   └── forms/       # React Hook Form + Zod form wrappers
│   ├── lib/
│   │   ├── auth/        # Better Auth config, session utilities, MFA helpers
│   │   ├── db/          # MongoDB connection singleton & collection accessors
│   │   ├── env/         # Zod environment schema & runtime validator
│   │   ├── permissions/ # RBAC definitions, permission matrix & ownership guards
│   │   ├── realtime/    # Ably & polling adapter implementations
│   │   ├── email/       # Resend & development sink adapters
│   │   └── security/    # Rate limiters, sanitizers, CSRF & token hashing
│   └── server/
│       ├── repositories/# Low-level MongoDB queries and index definitions
│       └── services/    # Authoritative domain logic and state transitions
└── tests/
    ├── unit/            # Schema validation, transition rules, permission tests
    ├── integration/     # Service layer, DB operations, multi-tenant isolation
    └── e2e/             # Playwright journeys across Resident, Security, Admin
```

---

## 3. MongoDB Collections & Index Specification

All documents inherit standard tenant and audit fields:
- `_id: ObjectId`
- `societyId: string` (Tenant partition boundary)
- `createdAt: Date`
- `updatedAt: Date`
- `version: number` (Optimistic concurrency control)

### 3.1 Collections Detail

#### 1. `users`
Managed partly by Better Auth, extended with SocietyOS tenant attributes.
```typescript
interface UserDocument {
  _id: ObjectId;
  societyId: string;
  email: string; // Normalized lowercase
  role: 'RESIDENT' | 'SECURITY' | 'ADMIN';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  displayName: string;
  phone?: string;
  unitIds: string[]; // Assigned units (for residents)
  emailVerified: boolean;
  mfaEnrolled: boolean;
  mfaSecretEncrypted?: string;
  mfaRecoveryCodesHashed?: string[];
  lastSignInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes:*
- `{ societyId: 1, email: 1 }` (Unique)
- `{ societyId: 1, role: 1, status: 1 }`

#### 2. `invitations`
Single-use, role-bound onboarding tokens.
```typescript
interface InvitationDocument {
  _id: ObjectId;
  societyId: string;
  email: string;
  role: 'RESIDENT' | 'SECURITY' | 'ADMIN';
  tokenHash: string; // SHA-256 hash of single-use URL token
  unitIds?: string[];
  invitedBy: ObjectId;
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
}
```
*Indexes:*
- `{ tokenHash: 1 }` (Unique)
- `{ expiresAt: 1 }` (TTL index for automatic expiry cleanup)
- `{ societyId: 1, email: 1 }`

#### 3. `units`
Canonical unit inventory and current occupancy status.
```typescript
interface UnitDocument {
  _id: ObjectId;
  societyId: string;
  unitCode: string; // e.g. "A-402"
  floor: number;
  block: string;
  status: 'VACANT' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  memberUserIds: ObjectId[];
  isPubliclyListed: boolean; // Opt-in visibility for public vacancy listing
  listingNotes?: string;
  lastUpdatedBy: ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes:*
- `{ societyId: 1, unitCode: 1 }` (Unique)
- `{ societyId: 1, status: 1 }`

#### 4. `occupancyEvents`
Append-only log of unit occupancy transitions.
```typescript
interface OccupancyEventDocument {
  _id: ObjectId;
  societyId: string;
  unitId: ObjectId;
  previousStatus: string;
  newStatus: string;
  eventType: 'MOVE_IN' | 'MOVE_OUT' | 'RESERVATION' | 'MAINTENANCE_FLAG';
  actorId: ObjectId;
  reasonCode: string;
  note?: string;
  createdAt: Date;
}
```
*Indexes:*
- `{ societyId: 1, unitId: 1, createdAt: -1 }`

#### 5. `visitorPasses`
Pre-approval passes generated by residents.
```typescript
interface VisitorPassDocument {
  _id: ObjectId;
  societyId: string;
  unitId: ObjectId;
  residentId: ObjectId;
  passCode: string; // 6-character short search code (e.g. "VIS-892")
  passTokenHash: string; // SHA-256 of QR verification payload
  visitorName: string;
  expectedGuestCount: number;
  validFrom: Date;
  validUntil: Date;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';
  purpose?: string;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes:*
- `{ societyId: 1, passCode: 1 }` (Unique)
- `{ passTokenHash: 1 }` (Unique)
- `{ societyId: 1, residentId: 1, createdAt: -1 }`
- `{ validUntil: 1 }`

#### 6. `entryLogs`
Audited gate records of entries, exits, and denials.
```typescript
interface EntryLogDocument {
  _id: ObjectId;
  societyId: string;
  passId?: ObjectId;
  unitId: ObjectId;
  visitorCategory: 'GUEST' | 'DELIVERY' | 'STAFF' | 'MAINTENANCE' | 'MANUAL';
  event: 'ENTRY' | 'EXIT' | 'DENIED';
  gate: string;
  guardId: ObjectId;
  timestamp: Date;
  denialReason?: string;
  manualEntryReason?: string;
  idempotencyKey: string; // Prevents duplicate double-scans
  createdAt: Date;
}
```
*Indexes:*
- `{ idempotencyKey: 1 }` (Unique)
- `{ societyId: 1, timestamp: -1 }`
- `{ societyId: 1, unitId: 1, timestamp: -1 }`

#### 7. `emergencyIncidents`
Safety-critical SOS incident records.
```typescript
interface EmergencyIncidentDocument {
  _id: ObjectId;
  societyId: string;
  incidentRef: string; // e.g. "INC-20261020-001"
  reporterId: ObjectId;
  unitId: ObjectId;
  locationDetails: string;
  category: 'MEDICAL' | 'FIRE_SMOKE' | 'SECURITY_THREAT' | 'LIFT_ELEVATOR' | 'GAS_WATER' | 'UTILITY_OUTAGE' | 'OTHER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESPONDER_ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  description?: string;
  acknowledgedAt?: Date;
  assignedResponderId?: ObjectId;
  assignedResponderName?: string;
  resolutionCode?: string;
  resolutionNotes?: string;
  closedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes:*
- `{ societyId: 1, incidentRef: 1 }` (Unique)
- `{ societyId: 1, status: 1, createdAt: -1 }`
- `{ societyId: 1, reporterId: 1, createdAt: -1 }`

#### 8. `incidentEvents`
Append-only timeline of incident life-cycle transitions.
```typescript
interface IncidentEventDocument {
  _id: ObjectId;
  societyId: string;
  incidentId: ObjectId;
  transitionType: string;
  actorId: ObjectId;
  actorRole: string;
  note?: string;
  createdAt: Date;
}
```
*Indexes:*
- `{ incidentId: 1, createdAt: 1 }`

#### 9. `maintenanceTickets` & `maintenanceEvents`
Facility and unit repair requests.
```typescript
interface MaintenanceTicketDocument {
  _id: ObjectId;
  societyId: string;
  ticketRef: string;
  reporterId: ObjectId;
  unitId: ObjectId;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY' | 'HVAC' | 'STRUCTURAL' | 'COMMON_AREA';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  assignedTo?: string;
  attachmentKeys?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 10. `announcements` & `announcementReads`
Official notices with audience targeting.
```typescript
interface AnnouncementDocument {
  _id: ObjectId;
  societyId: string;
  title: string;
  body: string;
  audience: 'ALL' | 'RESIDENTS' | 'SECURITY';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedBy: ObjectId;
  publishedAt?: Date;
  expiresAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 11. `amenities` & `amenityBookings`
Facility configuration and reservation engine.
```typescript
interface AmenityDocument {
  _id: ObjectId;
  societyId: string;
  name: string; // e.g. "Clubhouse Party Hall", "Tennis Court A"
  capacity: number;
  openTime: string; // "06:00"
  closeTime: string; // "22:00"
  slotDurationMinutes: number;
  cancellationNoticeHours: number;
  isActive: boolean;
}

interface AmenityBookingDocument {
  _id: ObjectId;
  societyId: string;
  amenityId: ObjectId;
  userId: ObjectId;
  unitId: ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}
```
*Indexes on `amenityBookings`:*
- `{ societyId: 1, amenityId: 1, startTime: 1, endTime: 1 }`

#### 12. `parcels`
Package logging and receipt confirmation.
```typescript
interface ParcelDocument {
  _id: ObjectId;
  societyId: string;
  unitId: ObjectId;
  recipientName: string;
  carrier: 'AMAZON' | 'FLIPKART' | 'FEDEX' | 'DHL' | 'LOCAL' | 'OTHER';
  trackingNumber?: string;
  status: 'ARRIVED' | 'COLLECTED';
  receivedByGuardId: ObjectId;
  collectedAt?: Date;
  handoverGuardId?: ObjectId;
  createdAt: Date;
}
```

#### 13. `cameras`
Strict inventory and authorization boundary.
```typescript
interface CameraDocument {
  _id: ObjectId;
  societyId: string;
  label: string; // e.g. "Gate 1 North Entry"
  zone: 'GATE' | 'PERIMETER' | 'CLUBHOUSE' | 'PARKING';
  providerType: 'WEBRTC_GATEWAY' | 'HLS_STREAM' | 'UNCONFIGURED';
  gatewayStreamId?: string; // Internal identifier on gateway (NOT credentials)
  permittedRoles: ('ADMIN' | 'SECURITY')[];
  isEnabled: boolean;
  healthStatus: 'ONLINE' | 'OFFLINE' | 'UNCONFIGURED';
  lastHealthCheckAt?: Date;
  retentionPolicyUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 14. `auditLogs`
Immutable record of all sensitive actions.
```typescript
interface AuditLogDocument {
  _id: ObjectId;
  societyId: string;
  actorId: ObjectId;
  actorRole: string;
  action: string; // e.g. "AUTH_SIGN_IN", "INCIDENT_STATUS_CHANGE", "CAMERA_PLAYBACK_REQUEST"
  resourceType: string;
  resourceId?: string;
  outcome: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: Record<string, unknown>; // PII-sanitized metadata
  timestamp: Date;
}
```
*Indexes:*
- `{ societyId: 1, timestamp: -1 }`
- `{ societyId: 1, actorId: 1, timestamp: -1 }`
- `{ societyId: 1, resourceType: 1, timestamp: -1 }`

#### 15. `outboxEvents`
Reliable secondary event publishing.
```typescript
interface OutboxEventDocument {
  _id: ObjectId;
  societyId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  attempts: number;
  nextAttemptAt: Date;
  createdAt: Date;
  deliveredAt?: Date;
}
```

---

## 4. Authoritative Server-Side Data Flow

Every state mutation executes the canonical 6-stage lifecycle:

```text
[HTTP Request]
       │
       ▼
1. Validate Input (Zod schema parse, reject unknown fields & NoSQL injection operators)
       │
       ▼
2. Authenticate & Authorize (Extract session, check role, verify tenant & resource ownership)
       │
       ▼
3. Atomic Business Mutation (Perform conditional write / transaction in MongoDB)
       │
       ▼
4. Append Audit & Outbox Record (Write immutable auditLog and durable outboxEvent)
       │
       ▼
5. Return Safe DTO (Sanitize document, strip internal secrets, return typed JSON)
       │
       ▼
6. Publish Asynchronous Events (Dispatch real-time notification with retry & error boundary)
```

**Critical Rule:** If Stage 6 (Real-time or email delivery) fails, Stages 1–5 remain committed and durable. Real-time failure never rolls back valid business data.

---

## 5. Resilient Real-Time & Fallback Architecture

1. **Primary Push Channel:** Real-time adapter (Ably Free Tier or WebSockets). Messages are lightweight signals:
   ```json
   { "event": "INCIDENT_UPDATED", "incidentId": "65b...", "timestamp": 1776680000 }
   ```
2. **Durable Source of Truth:** The client uses the event signal to query the authoritative REST endpoint.
3. **Automatic Fallback Mode:**
   - If the real-time connection drops, the frontend transitions the UI connection indicator from `Live (Green)` to `Polling (Amber)`.
   - The client activates a 5-second interval poll to `/api/incidents?since=<lastTimestamp>`.
   - On reconnect, the client requests all events created after the last known timestamp, deduplicating updates by document ID and version.

---

## 6. CCTV Security Boundary & Stream Gateway

```text
+-----------------------+                    +---------------------------+
|    Browser Client     |                    |    SocietyOS Server       |
| (Security Role Only)  |                    |                           |
+-----------------------+                    +---------------------------+
           │                                               │
           │  1. GET /api/cameras/:id/token                │
           ├──────────────────────────────────────────────>│
           │                                               │ Verify role == SECURITY
           │                                               │ Audit access in auditLogs
           │                                               │ Generate 60s signed JWT
           │  2. Return signed temporary playback token    │
           │<──────────────────────────────────────────────┤
           │                                               │
           │  3. Connect to Media Gateway (WSS/HLS)        │
           ├──────────────────────────────┐                │
           │                              │                │
           v                              v                │
+-----------------------+      +-----------------------+   │
|   External WebRTC/    |      | RTSP Camera / NVR     |   │
|   HLS Gateway         |◄─────┤ (Behind Private LAN)  |   │
+-----------------------+      +-----------------------+   │
```

- **Strict Isolation:** RTSP credentials, camera IP addresses, and private gateway keys reside strictly on the server or gateway LAN.
- **Client Visibility:** The client only ever receives a short-lived signed grant token and an HTTPS/WSS stream URL.
- **Unconfigured State:** If no gateway is configured in environment variables, the API returns `{ status: "UNCONFIGURED" }`, and the UI displays an honest *"Camera integration not configured"* banner.

---

## 7. Error Handling, Logging & Observability

- **Generic Client Errors:** Auth, validation, and database errors returned to clients do not leak database connection strings, stack traces, or collection names.
- **No Committed Secrets:** Verified via typed `src/lib/env/index.ts` validator.
- **Health Check (`/api/health`):** Returns only operational status (`{ status: "ok", timestamp: ... }`). It never dumps internal configs or connection strings.
