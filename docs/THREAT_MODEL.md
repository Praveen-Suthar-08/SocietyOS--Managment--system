# SocietyOS — Threat Model & Security Architecture

**Version:** 1.0  
**Date:** 20 October 2026  
**Methodology:** STRIDE Threat Classification & OWASP Top 10 Alignment  

---

## 1. Threat Landscape & Security Boundaries

SocietyOS manages sensitive residential operations: resident identities, unit occupancy, physical security logs, visitor passes, emergency alerts, and CCTV metadata. A compromise could impact physical safety, resident privacy, and facility operations.

```text
[UNTRUSTED INTERNET]
        │
        │ HTTPS (TLS 1.3) / Strict CSP / SameSite Cookies
        ▼
+───────────────────────────────────────────────────────────────+
| TRUST BOUNDARY 1: Next.js Edge & Server Runtime               |
| - Rate Limiter (IP + Account level)                           |
| - Zod Input Validator (Rejects NoSQL operators & unparsed PII) |
| - Session Validator (HttpOnly, Secure, SameSite=Lax)          |
+───────────────────────────────┬───────────────────────────────+
                                │
+───────────────────────────────▼───────────────────────────────+
| TRUST BOUNDARY 2: Core Domain Services & RBAC Enforcer        |
| - Role Checks (ADMIN, SECURITY, RESIDENT)                     |
| - Multi-tenant Scoping (societyId enforced on all queries)     |
| - Resource Ownership Verification (BOLA/IDOR prevention)      |
+───────────────────────────────┬───────────────────────────────+
                                │
+───────────────────────────────▼───────────────────────────────+
| TRUST BOUNDARY 3: Persistence & Integrations                  |
| - MongoDB Atlas (Isolated credentials, TLS, indexes)          |
| - Media Gateway (Short-lived signed playback grants)          |
| - Realtime Adapter (Authenticated private channels)           |
+───────────────────────────────────────────────────────────────+
```

---

## 2. STRIDE Threat Assessment

### 2.1 Spoofing (Identity Deception)
| Threat ID | Threat Description | Attack Vector | Mitigation Strategy |
|-----------|--------------------|---------------|---------------------|
| **S-01** | Attacker creates unauthorized Administrator account | Public registration tampering or default credential brute force | **Zero public admin registration.** First admin bootstrapped via secure CLI. Subsequent users invited by email with single-use, role-bound, cryptographically hashed tokens. |
| **S-02** | Credential stuffing or brute-force attack on resident/guard accounts | Automated dictionary attacks against `/api/auth/sign-in` | IP and account-level rate limiting (max 5 failed attempts per 15 min), constant-time failure responses, generic *"Invalid email or password"* messages. |
| **S-03** | Guard identity spoofing at gate | Unauthenticated QR code scan or session forgery | Mandatory TOTP MFA for `SECURITY` and `ADMIN` roles. Session cookie stored `HttpOnly` and `Secure`. Session rotated on credential change. |

### 2.2 Tampering (Data Modification)
| Threat ID | Threat Description | Attack Vector | Mitigation Strategy |
|-----------|--------------------|---------------|---------------------|
| **T-01** | Privilege Escalation via modified request body | User injects `role: "ADMIN"` during profile update or onboarding | Role assignment is strictly derived from the server-persisted `invitation` record; client-provided role fields are completely ignored. Profile updates only allow safe fields (`displayName`, `phone`). |
| **T-02** | NoSQL Injection via query parameters | Passing MongoDB operators (`{ "$gt": "" }`) in JSON payloads | Authoritative Zod schema validation strips non-allowlisted properties. Database queries constructed using strongly typed literal keys, never raw client objects. |
| **T-03** | Gate check-in manipulation / double entry | Replaying visitor check-in requests or forging pass parameters | Unique `idempotencyKey` on entry logs. Atomic conditional write (`findOneAndUpdate` where `status: 'ACTIVE'`) prevents race conditions or duplicate check-ins. |

### 2.3 Repudiation (Denial of Actions)
| Threat ID | Threat Description | Attack Vector | Mitigation Strategy |
|-----------|--------------------|---------------|---------------------|
| **R-01** | Security guard denies admitting an unauthorized visitor | Guard claims someone else checked the visitor in | Every gate action records the authenticated `guardId`, server timestamp, gate ID, and idempotency key into an append-only `entryLogs` collection. |
| **R-02** | Administrator modifies unit occupancy or deletes audit history | Rogue admin attempts to cover unauthorized changes | `auditLogs` collection is append-only with no application-level update or delete endpoints. Critical state changes record both `actorId` and snapshot diff. |

### 2.4 Information Disclosure (Privacy Breaches)
| Threat ID | Threat Description | Attack Vector | Mitigation Strategy |
|-----------|--------------------|---------------|---------------------|
| **I-01** | BOLA / IDOR on maintenance tickets or emergency incidents | Resident modifies URL ID (`/api/incidents/:id`) to view another resident's report | Server enforces `requireResourceOwnership()` checking `incident.reporterId === currentUser.id`. Unauthorized access immediately returns 403 Forbidden. |
| **I-02** | Resident PII leakage via Visitor QR Codes | Intercepting or photographing visitor QR pass | **Zero PII in QR codes.** The QR payload contains only an opaque, signed random token string (`tokenHash`). Visitor name, phone, and host details are resolved strictly on the authenticated guard's console. |
| **I-03** | Camera stream credential leakage | Inspecting network traffic or client JavaScript bundles for RTSP URLs | RTSP credentials, IP addresses, and camera passwords are strictly kept server-side. Browser client only receives a temporary 60-second signed WebRTC/HLS playback token. If unconfigured, returns clean `UNCONFIGURED` status. |
| **I-04** | Cross-tenant data leakage | User in Society A querying records of Society B | Every single database query strictly includes `societyId` scoped from the verified user session token. |

### 2.5 Denial of Service (Availability Disruption)
| Threat ID | Threat Description | Attack Vector | Mitigation Strategy |
|-----------|--------------------|---------------|---------------------|
| **D-01** | Flooding emergency SOS API to overwhelm responders | Script generating thousands of fake SOS incidents | Rate limit of 3 incidents per minute per resident; duplicate detection within 60-second window. Valid incident triggers save to MongoDB first; real-time notifications fail over gracefully without crashing server. |
| **D-02** | MongoDB Atlas Free tier exhaustion (512MB / 100 ops/sec) | Large file uploads or unbounded list queries | Video binaries completely banned from MongoDB. Image attachments limited to 5MB and stored outside DB. All list endpoints enforce mandatory pagination (`limit <= 50`). |

### 2.6 Elevation of Privilege
| Threat ID | Threat Description | Attack Vector | Mitigation Strategy |
|-----------|--------------------|---------------|---------------------|
| **E-01** | Resident accesses Admin or Security endpoints | Directly issuing HTTP requests to `/api/admin/*` or `/api/security/*` | Central middleware and route-level `requireRole()` checks enforced on every route. Route handlers verify current user role directly from database/session, never from client headers. |
| **E-02** | SSRF via camera gateway configuration | Malicious admin enters internal IP address (`http://169.254.169.254`) as camera provider | Camera gateway hosts validated against a strict allowlist of approved domain names / protocol schemes. |

---

## 3. Web Security & Defensive Controls

### 3.1 Content Security Policy & HTTP Headers
```text
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.ably.io wss://*.ably.io; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 3.2 CSV Formula Injection Prevention
When exporting audit logs or visitor history to CSV, all fields are sanitized:
- Any cell starting with `=, +, -, @` is prepended with a single quote (`'`) to neutralize Excel/Sheets formula execution.

### 3.3 Cookie Security Architecture
- Auth Cookie: `societyos_session`
- Flags: `HttpOnly; Secure; SameSite=Lax; Path=/`
- **Zero storage of JWTs or session tokens in `localStorage` or `sessionStorage`.**
