# AGENTS.md — Medical Wellness Management System

Internal management system for **Medical Wellness** (wellness & healthcare center, Morocco).
This file is the canonical project rules document for all agents and developers.

---

## 1. Project Overview

| Item | Value |
|---|---|
| Project | Medical Wellness — Internal Management System |
| Goal | Progressive replacement of the existing Easybel functionality |
| First MVP | 60 days |
| Architecture | Modular Monolith (no microservices) |
| Frontend | Next.js 15 + React 19 + TypeScript (strict) |
| Backend | NestJS + TypeScript (strict) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| API | REST |
| Testing | Jest (unit/e2e) + Playwright (E2E) |
| Language | UI and documentation in French (internal users) |

---

## 2. Confirmed Business Decisions

1. **No public online booking** — appointments are created by Reception after a client request.
2. **Booking sources**: `PHONE` · `IN_PERSON` · `WHATSAPP` only.
3. **Prices are visible inside the internal management app only.**
4. **Client Portal** is a future phase, NOT MVP.
5. The existing **public website stays separate** from this internal application.

---

## 3. Target Repository Structure

```
medical-wellness/
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # NestJS backend (REST)
├── packages/
│   └── shared/               # shared types, DTOs, constants
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── decisions/            # ADR records
├── infrastructure/
│   └── docker/               # docker-compose for PostgreSQL (dev)
├── AGENTS.md
└── README.md
```

> The current prototype (`src/`, `electron/`, `android/`, `dist/`) is **legacy for reference purposes**.
> New development targets the monorepo structure above. Do not mix prototype code into the new apps.

---

## 4. Modules (Preliminary Scope)

- Authentication
- Users & Permissions (RBAC)
- Clients
- Services & Categories
- Employees
- Appointments / Agenda
- Sales
- Payments
- Cash Management
- Packages & Subscriptions
- Sessions
- Invoices
- Reports
- Audit Logs

> **Rule**: These modules are a preliminary scope, NOT permission to invent undocumented business rules.
> Implement only confirmed requirements. If a rule is not confirmed, stop and ask.

---

## 5. User Roles (Confirmed)

| Role | Access |
|---|---|
| **Admin** | Full administrative access |
| **Reception** | Restricted operational access |
| **Practitioner** | ⚠️ Not confirmed — do not implement until requirements are provided |

---

## 6. Appointment Rules (Confirmed)

- `createdByUserId` — the Reception user who records the appointment.
- `assignedEmployeeId` — the employee who performs the service.
- `bookingSource` — `PHONE | IN_PERSON | WHATSAPP`.
- Appointment may contain **multiple services** (subject to confirmation).
- Preserve creation time and full modification history (audit).

---

## 7. Client Information (from existing Easybel form)

- Civility, Gender
- First name, Last name
- Birth date
- Primary phone, Secondary phone
- Email
- Address, Postal code
- Account number, Barcode
- Regular client flag
- Acquisition source, Referral person
- Comments
- Communication preferences

> **Rule**: Do not use real customer/patient data during development. Use synthetic demo data.

---

## 8. Security Rules (Mandatory)

- Enforce **permissions in the backend**, never frontend-only.
- Validate every input (DTO validation, server-side).
- Protect authentication and sessions (secure cookies / hashing / rate limiting).
- Secrets live in environment variables only (`.env` never committed).
- Never expose database credentials in code or logs.
- Maintain **audit logs** for important operations (create/update/delete, financial ops).
- Financial records are **append-only** in history (no destructive overwrite of paid invoices).
- Do not seed real data.

---

## 9. Engineering Rules

- **TypeScript strict mode** everywhere.
- Modular, maintainable code; clear separation frontend / backend / database.
- No unnecessary microservices; no premature extraction.
- **No hardcoded service catalog or prices** — everything in the database (migrations).
- Database schema changes go through **migrations** (Prisma) only.
- Document significant decisions in `docs/decisions/` (ADR format).
- Add tests for business logic (Jest unit, Playwright E2E for critical flows).
- Do not invent APIs or business workflows.
- Do not overwrite existing files without inspecting them first.
- Ask before any **irreversible** change (deletes, schema drops, key rotations, data migration).
- Keep commits small and descriptive.

---

## 10. Agent Workflow

1. Inspect the repository before changing anything.
2. Implement only the approved phase / task.
3. Stop after Phase 1 and wait for approval before implementing business modules.
4. Report: assessment, architecture, structure, DB design, unresolved questions, commands, completed/remaining tasks.
5. Never claim a feature is complete if it has not been verified (typecheck + tests + build).

---

## 11. Development Environment (Production-like defaults)

- PostgreSQL 16 (Docker Compose or local service). See `infrastructure/docker/`.
- Environment variables: `DATABASE_URL`, `JWT_SECRET` / `SESSION_SECRET`, `NODE_ENV`.
- Example values only — never commit real secrets.
- Dev ports (proposed): Web `3000`, API `4000`.

---

## 12. Documentation Map

- `docs/architecture/overview.md` — system architecture & module boundaries
- `docs/database/design.md` — preliminary database design (PostgreSQL + Prisma)
- `docs/requirements/unresolved.md` — open business questions
- `docs/planning/60-day-roadmap.md` — 60-day MVP task breakdown
- `docs/decisions/` — ADR records
