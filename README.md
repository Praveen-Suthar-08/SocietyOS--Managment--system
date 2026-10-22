# 🏢 SocietyOS — Enterprise Gated Community & Security Operating System

<div align="center">

![SocietyOS Banner](https://img.shields.io/badge/SocietyOS-v1.0.0-0ea5e9?style=for-the-badge&logo=shield&logoColor=white)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Native-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**An ultra-modern, mission-critical residential governance platform and gatehouse operating system.**  
Engineered for gated societies, high-rise condominiums, and integrated townships.

[Explore Repository](https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system) • [Report Bug](https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system/issues) • [Request Feature](https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system/issues)

---

### 👨‍💻 Created & Architected by **[Praveen Suthar](https://github.com/Praveen-Suthar-08)**
**GitHub Profile:** [@Praveen-Suthar-08](https://github.com/Praveen-Suthar-08)  
**Project Repository:** [SocietyOS--Managment--system](https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system)

</div>

---

## 📑 Table of Contents

- [Overview & Vision](#-overview--vision)
- [System Architecture](#-system-architecture)
- [Key Features by Role](#-key-features-by-role)
  - [1. Security Operations Desk](#1-security-operations-desk-)
  - [2. Resident Portal & Mobile Web Experience](#2-resident-portal--mobile-web-experience-)
  - [3. Estate Administration & Executive Command](#3-estate-administration--executive-command-)
- [Governance & Engineering Innovations](#-governance--engineering-innovations)
  - [Cryptographic Audit Log & Immutability](#cryptographic-audit-log--immutability)
  - [Strict Pass Ownership & Creator-Only Permissions](#strict-pass-ownership--creator-only-permissions)
  - [Live Multi-Gate Officer Roster & Shift Handover](#live-multi-gate-officer-roster--shift-handover)
  - [Real-Time Timestamps & Hydration Stability](#real-time-timestamps--hydration-stability)
- [Tech Stack & Architecture Details](#-tech-stack--architecture-details)
- [Repository Structure](#-repository-structure)
- [REST API Endpoints](#-rest-api-endpoints)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Quality Assurance & Testing](#-quality-assurance--testing)
- [Security & Compliance Standards](#-security--compliance-standards)
- [Roadmap & Enhancements](#-roadmap--enhancements)
- [Contributing](#-contributing)
- [License & Author](#-license--author)

---

## 🌟 Overview & Vision

**SocietyOS** is an all-in-one residential society and estate operating system built from the ground up to eliminate fragmentation between residents, frontline security personnel, and managing committee administrators.

Traditional society management apps often suffer from clunky user interfaces, delayed notifications, hardcoded placeholders, disconnected gate systems, and data leaks. SocietyOS bridges this divide with:
- **Zero Placeholders:** Every status, badge, camera feed, and visitor pass is bound to authoritative live models.
- **Creator-Governed Privacy:** Only the account that creates a visitor pass can edit, revoke, or delete it; all other accounts maintain read-only visibility.
- **Real-Time Cross-Terminal Sync:** A single change executed at Gate 1 propagates instantly to resident mobile interfaces and admin command dashboards.
- **Authoritative Life-Safety Dispatch:** Integrated national emergency hotline links (112), instant guard intercoms, and verified resolution logs.

---

## 🏛 System Architecture

SocietyOS is built using Next.js 16 with Turbopack, utilizing standard server-side endpoints alongside client-side real-time synchronization:

```
                                  ┌────────────────────────────┐
                                  │   SocietyOS Web Client     │
                                  │   (Next.js App Router)     │
                                  └──────────────┬─────────────┘
                                                 │
                     ┌───────────────────────────┼───────────────────────────┐
                     ▼                           ▼                           ▼
        ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
        │  Resident Workspace     │ │  Security Gate Terminal │ │  Admin Command Center   │
        │  - Profile & Unit Info  │ │  - Fast Gate Lookup     │ │  - Immutable Audit Log  │
        │  - Passes (Owner-Only)  │ │  - Multi-Gate Roster    │ │  - Security Deployment  │
        │  - Amenities & UPI Pay  │ │  - Shift Handover Sync  │ │  - Units & Residents    │
        │  - Maintenance Tickets  │ │  - Denied Entry Logs    │ │  - Incident Response    │
        └────────────┬────────────┘ └────────────┬────────────┘ └────────────┬────────────┘
                     │                           │                           │
                     └───────────────────────────┼───────────────────────────┘
                                                 │
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │   Reactive Event Bus          │
                                 │   (Storage & Window Sync)     │
                                 └───────────────┬───────────────┘
                                                 │
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │   Next.js API Route Handlers  │
                                 │   (/api/visitors, /api/audit) │
                                 └───────────────┬───────────────┘
                                                 │
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │   Authoritative Persistence  │
                                 │   (MongoDB / In-Memory Store) │
                                 └───────────────────────────────┘
```

---

## 🚀 Key Features by Role

### 1. Security Operations Desk 🛡️

- **Gate 1 Operations Terminal (`/security`):**
  - Instant vehicle, visitor, delivery, and cab ingress verification via pass codes or QR tokens.
  - One-click Check-In and Check-Out actions that auto-update resident timelines.
  - Manual walk-in guest admission and courier logging.
  - Formal entry refusal mechanism requiring mandatory reason codes stored directly into the tamper-proof audit trail.
- **All-Gate Stations & Officer Shift Roster (`/security/gates`):**
  - Dedicated real-time dashboard tracking all 4 strategic security stations:
    - **Gate 1:** Main Ingress / Egress Boom Barrier
    - **Gate 2:** East Perimeter Service & Logistics Bay
    - **Gate 3:** Clubhouse Biometric Resident Turnstiles
    - **Station 4:** Central CCTV Matrix & Fire Safety Command Room
  - Detailed live status: On-duty officer, badge number, direct phone dialer, check-in time, and who was relieved.
  - Scheduled upcoming relief officer, shift name, arrival time, and live arrival countdown.
  - Physical custody inspection metrics: Boom barrier keys, Motorola UHF walkie-talkies, visitor scanning tablets.
  - Direct "Execute Shift Handover" workflow with digital signatures.
- **Active Incidents Monitor (`/security/incidents`):**
  - Real-time life-safety incident dispatch with category-based icons (Medical, Elevator, Security, Fire).
  - High and critical incident triage with responder assignments.
- **CCTV Gateway & Patrol Checks (`/security/cameras`, `/security/patrol`):**
  - Multi-camera surveillance matrix with authorized encrypted streaming relay simulation.
  - Guard patrol route confirmation with NFC/RFID checkpoint tracking.

---

### 2. Resident Portal & Mobile Web Experience 🏡

- **Authoritative Contact & Unit Profile (`/resident/profile`):**
  - Verified details by Greenfield Heights Management Committee.
  - Fully editable and persistent fields: Unit / Flat Number, Occupancy Type (*Owner-Resident, Tenant, Family Member, Nominee*), Assigned Parking Slot, Emergency Contacts.
  - Synced to active session and cross-page state immediately upon saving.
- **Creator-Governed Visitor Passes (`/resident/passes`):**
  - Pre-approved visitor pass creation with duration limits (2h, 4h, 8h, 24h, Multi-day).
  - **Account Isolation:** Only the account that created a pass can edit details, mark departure, revoke, or delete it.
  - Other users see a locked `🔒 View Only (Host)` tag with clear governance notice.
  - Toggle between "My Passes" and society-wide pass visibility.
- **Amenities Booking & Digital Receipts (`/resident/amenities`):**
  - Real-time slot availability for Clubhouses, Tennis Courts, Party Halls, Swimming Pools.
  - Payment modal supporting UPI QR code generation, Credit/Debit cards, and Net Banking.
  - Stunning, organized printable receipt certificates with transaction IDs and security seals.
- **Maintenance Desk (`/resident/maintenance`):**
  - Plumbing, Electrical, Carpentry, and Civil requests with photo upload capability.
  - Live progress stepper: Pending → Assigned → In-Progress → Completed.
- **Emergency SOS Broadcast (`/resident/emergency`):**
  - One-touch emergency trigger alerting security consoles with immediate unit location.

---

### 3. Estate Administration & Executive Command 🏛️

- **System Audit Trail & Governance Log (`/admin/audit`):**
  - Cryptographically sealed, append-only governance trail covering Incidents, Maintenance, Vehicles, Amenities, Parcels, and Shift Handovers.
  - Live timestamp tracking displaying exact dates, times, and pulsing `LIVE EVENT` indicators.
  - Detailed event summary explaining what occurred in plain English.
  - **Immutable Audit Certificate Modal:** Fully responsive, scrollable certificate with sticky header and footer, zero text clipping, and one-click certificate hash copying.
  - CSV report export and print formatting.
- **Security Team & Deployment Grid (`/admin/security-team`):**
  - Comprehensive 4-station gate deployment cards showing on-duty guards, relieved officers, and next shift personnel side-by-side.
  - Direct station rotation and handover management.
  - Full guard roster with badge IDs, phone contacts, duty shifts, and status toggles (*ON_DUTY, OFF_DUTY, PATROL*).
- **Incident Management Command (`/admin/incidents`):**
  - Sorted latest-first with multi-factor filters (Status, Severity, Category, Location).
  - Formal resolution notes workflow permanently saved to the database.
- **Units & Occupancy Directory (`/admin/units`, `/admin/residents`):**
  - Granular unit status management (*Occupied, Vacant, Maintenance, Rented*).
  - Directory of verified residents and emergency contacts.
- **Broadcast Announcements (`/admin/announcements`):**
  - Multi-audience notices (All Residents, Block A, Security Team, Committee).
  - Versioned correction history tracking who edited an announcement and why.

---

## ⚡ Governance & Engineering Innovations

### Cryptographic Audit Log & Immutability

Every state-changing event across SocietyOS (gate admissions, work order completions, status alterations, incident resolutions) generates an immutable certificate stored with sequence indexes and timestamp verification:
- Action identifiers (e.g. `INCIDENT_RESOLVED`, `SHIFT_HANDOVER_EXECUTED`, `VISITOR_ADMITTED`).
- Network origin IP address.
- Complete state payload in JSON format.
- Tamper-evident sequence index referencing the Greenfield Heights MongoDB collection.

### Strict Pass Ownership & Creator-Only Permissions

```typescript
// Authoritative Pass Ownership Check
export function isPassCreator(pass: UnifiedVisitorPass, activeAccount: ActiveAccount): boolean {
  if (pass.creatorEmail && activeAccount.email) {
    return pass.creatorEmail.toLowerCase() === activeAccount.email.toLowerCase();
  }
  if (pass.creatorId && activeAccount.id) {
    return pass.creatorId === activeAccount.id;
  }
  if (pass.unitCode && activeAccount.unit) {
    return pass.unitCode.trim().toUpperCase() === activeAccount.unit.trim().toUpperCase();
  }
  return false;
}
```

If an unauthorized account inspects a pass:
- Action buttons (*Edit, Delete, Revoke, Check Out*) are hidden.
- The card displays a `🔒 View Only (Host: ...)` badge.
- Detail modals display a governance banner: *"Read-Only Pass: Only the creator can modify or revoke this pass"*.

### Live Multi-Gate Officer Roster & Shift Handover

Instead of limiting shift handovers to a single gate, SocietyOS coordinates all 4 posts in real time:
- Station deployments track current guard on duty and the relieved predecessor.
- Next shift incoming officers are displayed with scheduled time and ETA.
- Equipment custody checklists (Keys, Radios, Scanners) are enforced before handover commits.
- Handover records update cross-tab stores instantaneously without page reload.

### Real-Time Timestamps & Hydration Stability

- Hardcoded `'Just now'` strings have been completely eradicated from creation handlers.
- New events record ISO dates and localized timestamps (`DD MMM YYYY · hh:mm:ss A`).
- Elapsed time calculation dynamically formats into `s ago`, `m ago`, `h ago`, or absolute dates.
- All live system clocks initialize safely inside `useEffect`, preventing Next.js 16 SSR prerender crashes.

---

## 💻 Tech Stack & Architecture Details

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16.4.2](https://nextjs.org/) | App Router, Turbopack, Partial Prefetching |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type checking, robust interfaces |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Responsive design tokens, sleek dark mode |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) | Accessible primitives (Dialogs, Menus, Badges) |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG vector iconography |
| **Database** | [MongoDB](https://www.mongodb.com/) | Native collections (`visitorPasses`, `incidents`, `guards`, etc.) |
| **State Sync** | Reactive Store / LocalStorage | Synchronizes multi-tab workflows in real time |
| **Testing** | [Playwright](https://playwright.dev/) & [Vitest](https://vitest.dev/) | End-to-end and component testing |
| **Authentication** | Built-in Session & Better Auth | Multi-role authorization (*RESIDENT, SECURITY, ADMIN*) |

---

## 📂 Repository Structure

```
SocietyOS/
├── .env.example                # Sample environment template
├── .gitignore                  # Production-grade gitignore rules
├── AGENTS.md                   # Agent guidelines & Next.js instructions
├── README.md                   # Authoritative system documentation
├── next.config.ts              # Next.js configuration (Turbopack, cache)
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
├── public/                     # Static media and assets
│   ├── favicon.ico
│   └── icons/
└── src/
    ├── app/                    # Next.js App Router root
    │   ├── layout.tsx          # Root layout with theme provider
    │   ├── globals.css         # Global design tokens and utilities
    │   ├── admin/              # Admin Command Center
    │   │   ├── audit/          # Immutable Audit Trail & Certificate Log
    │   │   ├── security-team/  # Multi-Gate Deployment Grid & Guard Roster
    │   │   ├── incidents/      # Life-Safety Incident Command Log
    │   │   ├── amenities/      # Amenity Slot Allotment & Receipts
    │   │   ├── units/          # Unit Occupancy Registry
    │   │   ├── residents/      # Verified Resident Directory
    │   │   └── announcements/  # Society-wide Notices & History
    │   ├── resident/           # Resident Workspace
    │   │   ├── passes/         # Pre-Approved Visitor Passes (Owner-Only)
    │   │   ├── profile/        # Editable Unit & Contact Information
    │   │   ├── amenities/      # Amenity Booking & Digital Payments
    │   │   ├── maintenance/    # Maintenance Service Requests
    │   │   ├── parcels/        # Delivery Locker Tracking
    │   │   └── emergency/      # SOS Emergency Dispatch
    │   ├── security/           # Gatehouse Terminal
    │   │   ├── page.tsx        # Gate 1 Operations Desk
    │   │   ├── gates/          # Live All-Gate Stations & Officer Roster
    │   │   ├── entry-exit/     # Entry / Exit Logging Terminal
    │   │   ├── shift-handover/ # Shift Custody Transfer Form
    │   │   ├── incidents/      # Guard First-Response Incident Log
    │   │   ├── visitors/       # Visitor Pass Scanner & Lookup
    │   │   └── cameras/        # CCTV Camera Feed Matrix
    │   └── api/                # REST API Endpoints
    │       ├── audit/          # Audit log ingestion & query
    │       ├── emergency/      # Incident creation, poll, resolve
    │       ├── visitors/       # Passes, verify, check-in, check-out
    │       ├── security/       # Guard roster records
    │       ├── amenities/      # Bookings and cancellations
    │       ├── units/          # Vacancy & status updates
    │       └── health/         # System uptime & heartbeat
    ├── components/             # Reusable UI & Layout Components
    │   ├── layout/AppShell.tsx # Global responsive navigation shell
    │   ├── ui/                 # Buttons, Badges, Cards, Dialogs, Inputs
    │   └── theme/              # Dark / Light theme toggle
    └── lib/                    # Utilities, types & state sync
        ├── db/mongodb.ts       # MongoDB client singleton
        ├── sync-store.ts       # Reactive multi-tab synchronization hook
        └── utils.ts            # Formatting utilities (dates, relative time)
```

---

## 🔌 REST API Endpoints

SocietyOS provides an enterprise REST API for integration with IoT boom barriers, ANPR cameras, and external portals:

### Visitor & Pass Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/visitors/passes` | Retrieve all visitor passes with optional unit/status filters |
| `POST` | `/api/visitors/passes` | Issue a new pre-approved visitor pass |
| `DELETE` | `/api/visitors/passes/[id]` | Permanently delete a visitor pass (creator authorized) |
| `PATCH` | `/api/visitors/passes/[id]` | Update visitor pass details |
| `POST` | `/api/visitors/passes/[id]/revoke` | Immediately revoke gate admission rights |
| `GET` | `/api/visitors/verify?query=:code` | Validate a pass code or QR token at the security terminal |
| `POST` | `/api/visitors/check-in` | Log arrival and mark visitor as INSIDE compound |
| `POST` | `/api/visitors/check-out` | Log departure and mark pass as USED / CHECKED OUT |
| `POST` | `/api/visitors/denied` | Log entry refusal with mandatory security reason code |

### Emergency & Life-Safety
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/emergency/incidents?all=true` | Query active and resolved emergency incidents |
| `POST` | `/api/emergency/incidents` | Dispatch a new life-safety incident |
| `PATCH` | `/api/emergency/incidents/[id]/resolve` | Mark incident as resolved with verified notes |
| `POST` | `/api/emergency/sos` | Trigger emergency SOS alert from resident device |

### Governance, Units & Security
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/audit?limit=50` | Query append-only audit trail records |
| `GET` | `/api/security/guards` | Retrieve on-duty guard roster and station allocations |
| `POST` | `/api/security/guards` | Register a new security officer |
| `GET` | `/api/units` | Retrieve authoritative society units and occupancy states |
| `GET` | `/api/health` | System health check, environment info, and uptime |

---

## 🛠️ Getting Started

Follow these instructions to set up and run SocietyOS on your local machine.

### Prerequisites

- **Node.js:** v18.18.0 or higher (Node 20+ recommended)
- **Package Manager:** `npm` (v9+) or `yarn` or `pnpm`
- **Database (Optional):** Local MongoDB instance or MongoDB Atlas cluster (in-memory store fallback is active if unavailable)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system.git
   cd SocietyOS--Managment--system
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

1. Copy the sample environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your environment variables in `.env.local`:
   ```env
   # Application Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # MongoDB Connection String (Optional, falls back to in-memory)
   MONGODB_URI=mongodb://localhost:27017/societyos
   MONGODB_DB_NAME=societyos

   # Authentication Secret
   BETTER_AUTH_SECRET=your_super_secret_session_key_here
   ```

### Running the Application

- **Development Mode (with Hot Reload):**
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Production Build & Verification:**
  ```bash
  npm run build
  npm start
  ```

- **Health Check Verification:**
  ```bash
  curl http://localhost:3000/api/health
  ```
  Expected output:
  ```json
  {
    "status": "healthy",
    "system": "SocietyOS",
    "version": "1.0.0",
    "uptimeSeconds": 42.1,
    "environment": "production"
  }
  ```

---

## 🧪 Quality Assurance & Testing

SocietyOS includes end-to-end testing with Playwright and unit testing with Vitest:

- **Run Unit Tests:**
  ```bash
  npm run test
  ```

- **Run Playwright End-to-End Tests:**
  ```bash
  npx playwright test
  ```

- **Production Build Validation:**
  ```bash
  npm run build
  ```
  *Turbopack verifies static prerendering across all 65 application pages with zero TypeScript errors.*

---

## 🔒 Security & Compliance Standards

- **DPDP Act (India) & GDPR Compliance:** Resident contact information and license plates are protected with role-based access control.
- **Creator Ownership Enforcement:** Passcodes and check-out logs cannot be tampered with by neighboring units or unauthorized accounts.
- **Non-Destructive Audit Trail:** Audit logs are append-only; entries cannot be updated or purged via the interface.
- **CSRF & Injection Mitigation:** Input sanitization and parameterized MongoDB queries protect against injection vectors.

---

## 🗺️ Roadmap & Enhancements

- [x] Multi-Gate Live Officer Shift Handover Dashboard
- [x] Creator-Only Pass Modification and Deletion Governance
- [x] Responsive, Scrollable Immutable Audit Certificate Modal
- [x] Real-Time Timestamps without hydration flashing
- [x] Editable Unit & Occupancy Management Profile
- [ ] Hardware ANPR (Automatic Number Plate Recognition) IP Camera Driver
- [ ] Automated WhatsApp / SMS Passcode Relay via Twilio
- [ ] Integrated FastTag / RFID Boom Barrier Controller Relay
- [ ] Solar Grid & Water Tank Telemetry IoT Monitoring

---

## 🤝 Contributing

Contributions to SocietyOS are welcomed! To contribute:

1. Fork the Project ([https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system](https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system))
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Author

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

### 👨‍💻 Developed by **[Praveen Suthar](https://github.com/Praveen-Suthar-08)**

[![GitHub](https://img.shields.io/badge/GitHub-Praveen--Suthar--08-181717?style=for-the-badge&logo=github)](https://github.com/Praveen-Suthar-08)
[![Repository](https://img.shields.io/badge/Repository-SocietyOS-blue?style=for-the-badge&logo=git)](https://github.com/Praveen-Suthar-08/SocietyOS--Managment--system)

**⭐ If you find SocietyOS useful, please consider starring the repository!**

</div>
