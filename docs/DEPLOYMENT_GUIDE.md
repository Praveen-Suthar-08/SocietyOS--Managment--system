# SocietyOS — Production Deployment & Operations Guide

**Version:** 1.0  
**Target Environment:** Node.js v20+ / v22+ · MongoDB Atlas M0/Dedicated · Vercel / Railway / Docker  
**Status:** Release Ready  

---

## 1. Prerequisites & System Requirements

- **Runtime:** Node.js `v20.x` or `v22.x` (LTS recommended)
- **Database:** MongoDB `v6.0+` or MongoDB Atlas Cluster (Free Tier M0 or higher)
- **Memory:** Minimum 512MB RAM (1GB+ recommended for production traffic)
- **Disk:** Ephemeral container storage is supported; all application state is persisted in MongoDB.

---

## 2. Environment Variables Configuration

Copy `.env.example` to your production environment configuration or deployment platform secrets:

```bash
cp .env.example .env.production
```

### Required Variables
| Variable | Description | Example / Recommendations |
|---|---|---|
| `NODE_ENV` | Application runtime environment | `production` |
| `APP_ENV` | SocietyOS environment identifier | `production` |
| `NEXT_PUBLIC_APP_URL` | Canonical public URL of your instance | `https://societyos.example.com` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB_NAME` | Database name | `societyos` |
| `BETTER_AUTH_SECRET` | 32+ character high-entropy secret | Generate via `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Canonical base URL for auth session callbacks | `https://societyos.example.com` |

### Optional / Integration Variables
| Variable | Description | Behavior When Empty |
|---|---|---|
| `RESEND_API_KEY` | Transactional email provider key | Invites and reset links print to secure server logs |
| `EMAIL_FROM` | From sender address | Defaults to `notifications@societyos.local` |
| `ABLY_API_KEY` | Real-time event broker key | Automatically falls back to resilient 5s HTTP polling |
| `CAMERA_GATEWAY_URL` | HLS / WebRTC media gateway base URL | Honest "Not configured" state shown; zero fake feeds |
| `ENABLE_DEMO_SEED` | Seed sample units / demo data | **Strictly `false` in production** |

---

## 3. Initial Administrator Bootstrap

To securely provision the initial Society Administrator without storing credentials in source control:

```bash
# Set temporary shell environment or pass variables directly
BOOTSTRAP_ADMIN_NAME="Chief Administrator" \
BOOTSTRAP_ADMIN_EMAIL="admin@societyos.example.com" \
BOOTSTRAP_ADMIN_PASSWORD="StrongAndUniquePassword123!" \
BOOTSTRAP_SOCIETY_ID="society-greenfield" \
npx tsx scripts/bootstrap-admin.ts
```

> **Security Note:** Once bootstrapped, all subsequent staff and residents must be invited via role-bound, single-use email tokens from `/admin/invitations`.

---

## 4. Database Indexing & Collections

SocietyOS automatically initializes compound indexes upon service instantiation. For manual verification or migration scripts:

```javascript
// Units & Occupancy
db.units.createIndex({ societyId: 1, unitCode: 1 }, { unique: true });
db.units.createIndex({ societyId: 1, status: 1 });
db.occupancyEvents.createIndex({ societyId: 1, unitId: 1, timestamp: -1 });

// Visitor Management & Gates
db.visitorPasses.createIndex({ societyId: 1, passCode: 1 });
db.visitorPasses.createIndex({ societyId: 1, qrToken: 1 });
db.visitorPasses.createIndex({ societyId: 1, residentId: 1 });
db.entryLogs.createIndex({ societyId: 1, timestamp: -1 });
db.entryLogs.createIndex({ societyId: 1, idempotencyKey: 1 });

// Emergency Incidents
db.emergencyIncidents.createIndex({ societyId: 1, incidentNumber: 1 }, { unique: true });
db.emergencyIncidents.createIndex({ societyId: 1, status: 1 });
db.emergencyIncidents.createIndex({ societyId: 1, createdAt: -1 });
db.incidentEvents.createIndex({ incidentId: 1, timestamp: 1 });

// Amenities & Bookings
db.amenities.createIndex({ societyId: 1, code: 1 }, { unique: true });
db.amenityBookings.createIndex({ societyId: 1, amenityId: 1, startTime: 1, endTime: 1 });
db.amenityBookings.createIndex({ societyId: 1, residentId: 1 });

// Immutable Audit Logs
db.auditLogs.createIndex({ societyId: 1, timestamp: -1 });
db.auditLogs.createIndex({ societyId: 1, action: 1 });
```

---

## 5. Build & Execution

### Local / Standalone Node.js
```bash
# 1. Install dependencies with strict lockfile
npm ci

# 2. Compile TypeScript and production assets
npm run build

# 3. Start high-performance production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 6. Health & Liveness Checks

SocietyOS exposes a health check endpoint for container orchestrators (Kubernetes, AWS ECS, Railway):

- **Endpoint:** `GET /api/health`
- **Expected Status:** `200 OK`
- **Payload:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-20T13:45:00.000Z",
  "version": "1.0.0"
}
```
