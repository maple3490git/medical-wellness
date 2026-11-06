# Architecture Overview — Medical Wellness

## 1. System Context

- **Internal-only** management system for Medical Wellness (Morocco).
- No public online booking. Reception records appointments after a client request (phone / in person / WhatsApp).
- Prices are visible **inside the management app only**.
- Client Portal and the public website are out of scope for the MVP.
- Long-term goal: progressive replacement of the existing Easybel functionality.

## 2. Architecture Style — Modular Monolith

- **Single backend application** (NestJS) organized in **domain modules**.
- **Single frontend application** (Next.js, App Router).
- **Single database** (PostgreSQL via Prisma).
- No microservices. No distributed transactions. Same deployment unit for the API.

> Rationale: small team, 60-day MVP, clear domain boundaries, simpler operations.

## 3. High-Level Diagram

```
┌────────────────────────────┐
│  Next.js Web App (apps/web) │
│  - App Router, React 19      │
│  - RTL/LTR? text FR          │
│  - calls REST via typed client│
└──────────────┬───────────────┘
               │ HTTPS / REST (JSON)
               ▼
┌────────────────────────────┐
│  NestJS API (apps/api)      │
│  - Auth (guard + RBAC)      │
│  - Modules: users, clients, │
│    services, appointments,  │
│    sales, payments, cash,   │
│    packages, sessions,      │
│    invoices, reports, audit │
│  - Global validation pipe   │
│  - Audit interceptor        │
└──────────────┬───────────────┘
               │ Prisma Client
               ▼
┌────────────────────────────┐
│  PostgreSQL 16              │
│  - migrations via Prisma    │
│  - money in numeric(12,2)   │
└────────────────────────────┘
```

## 4. Frontend (apps/web)

- Next.js 15 App Router, React 19, TypeScript strict.
- Tailwind CSS (design tokens already defined in prototype: gold/ivory/noir).
- Server Components for data fetching; Client Components for interactive forms.
- Typed API client generated from OpenAPI or shared DTOs in `packages/shared`.
- Route protection mirrors backend RBAC (UX only — backend is authoritative).

## 5. Backend (apps/api)

- NestJS modular structure:

```
apps/api/src/
├── main.ts                  # bootstrap, global pipes, CORS
├── app.module.ts
├── config/                  # ConfigModule, env validation
├── auth/                    # login, sessions, guards
├── users/                   # users, roles, permissions (RBAC)
├── clients/
├── services/                # service catalog & categories
├── employees/
├── appointments/            # agenda, multi-service
├── sales/                   # POS / sales records
├── payments/
├── cash/                    # registers, opening/closing, movements
├── packages/                # packages & subscriptions
├── sessions/                # treatment sessions log
├── invoices/
├── reports/
├── audit/                   # audit log writer + query
└── prisma/                  # PrismaService
```

### Cross-Cutting Concerns

| Concern | Implementation |
|---|---|
| Auth | Session cookie (httpOnly) + CSRF, or JWT access token — decision pending (see unresolved) |
| RBAC | `@Roles()` / `@Permissions()` decorators + guard; backend-enforced |
| Validation | `class-validator` DTOs, global `ValidationPipe` (whitelist, forbid unknown) |
| Errors | RFC 7807 problem details; consistent error codes |
| Audit | Entity history + `audit_logs` table via interceptor for mutations |
| Money | `Decimal` in DB, `number`/`string` at API boundary, never float math in JS |
| Dates | Store instants in UTC (`timestamptz`), render in Africa/Casablanca |
| Logging | Structured logs (pino), no secrets |
| Config | `ConfigModule.forRoot` + `zod` validation, fail fast on missing env |

## 6. Business Rules (Confirmed → Architecture Implications)

- `createdByUserId` — audit trail for appointments; never editable after creation.
- `assignedEmployeeId` — resource assignment; required for scheduling.
- `bookingSource` — enum `PHONE | IN_PERSON | WHATSAPP`; no other values accepted.
- Multi-service appointments — junction table `appointment_services` with price snapshot.
- Modification history — `AuditLog` + `updatedAt`/`updatedBy` on mutable entities.
- Client fields — all Easybel fields modeled in `clients` table (see DB design).

## 7. Integrations

- **None in MVP** except PostgreSQL.
- WhatsApp is a manual channel (Reception copies data) — no API integration in MVP.
- Public website remains separate; no shared DB in MVP.
- Printing / PDF invoices later (out of MVP scope unless confirmed).

## 8. Testing Strategy

- **Jest**: unit tests for services, guards, pricing/rounding, date logic.
- **Prisma e2e**: Testcontainers or Docker Compose Postgres for API e2e.
- **Playwright**: critical flows (login → create client → create appointment → cash close).
- Coverage target for business rules: ≥80% (services layer).

## 9. Deployment (MVP)

- Phase 1: local dev (Docker Compose Postgres + local Next/Nest).
- Phase 2: single VM/containers for internal network (LAN) or managed cloud.
- No public exposure in MVP unless decided otherwise.
- Backups: daily `pg_dump` + retention policy (to be defined).

## 10. Non-Goals (MVP)

- Public booking, client portal, online payment, SMS/WhatsApp API, multi-branch.
- Microservices, event bus, Kubernetes.
