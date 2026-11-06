# 60-Day MVP Roadmap — Medical Wellness

**Goal**: Internal management system replacing Easybel progressively. 60 days to MVP (modules §4 of `AGENTS.md`, confirmed rules only).

## Principles

- Vertical slices (one flow end-to-end before starting the next).
- Nothing speculative — unresolved questions (`docs/requirements/unresolved.md`) block their modules.
- Each week ends with a runnable build + typecheck/tests.

---

## Phase 0 — Foundation (Days 1–7)

- [ ] Monorepo scaffold: `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared`, `infrastructure/docker`
- [ ] PostgreSQL 16 via Docker Compose + Prisma init + first migration
- [ ] Env validation (`ConfigModule` + zod), `.env.example` (no secrets)
- [ ] Auth skeleton (login, httpOnly session or JWT — after Q10)
- [ ] RBAC foundation (roles, permissions, guards) — Admin + Reception only
- [ ] Audit interceptor skeleton (`audit_logs` writer)
- [ ] CI: typecheck + lint + unit tests (GitHub Actions or local scripts)

**Exit criteria**: `docker compose up` starts DB · `pnpm dev` starts web + api · login works · audit log written.

## Phase 1 — Core Reference Data (Days 8–14)

- [ ] Users & Permissions module (CRUD, Admin only)
- [ ] Employees module (CRUD, link to user optional — after Q13)
- [ ] Services & Categories module (no hardcoded catalog; seeded demo data)
- [ ] Clients module — full Easybel field set (§7 AGENTS.md), search, regular flag, referrals
- [ ] Client create/edit forms with validation + audit
- [ ] Playwright smoke: login → create client → create service

**Exit criteria**: Admin/Reception can manage users, employees, services, clients with backend-enforced permissions.

## Phase 2 — Appointments / Agenda (Days 15–25)

- [ ] Appointments CRUD with `createdByUserId`, `assignedEmployeeId`, `bookingSource` enum
- [ ] Multi-service appointments (junction + price snapshot) — after Q2
- [ ] Status lifecycle (SCHEDULED…NO_SHOW) — after Q3
- [ ] Agenda views: day / week; overlap detection for the same employee — after Q4
- [ ] Modification history (audit diff visible in UI)
- [ ] Print appointment summary (if Q18 answered; else skip)

**Exit criteria**: Reception books by phone/in-person/WhatsApp; agenda is authoritative.

## Phase 3 — Sales, Payments, Cash (Days 26–38)

- [ ] Sales (DRAFT→CONFIRMED) with line items
- [ ] Payments (append-only history; void/refund) — after Q7
- [ ] Cash registers: opening/closing, income/expense movements — after Q6
- [ ] Daily cash close & variance check
- [ ] Money formatting (MAD, no float math)

**Exit criteria**: End-of-day close balances; financial history is immutable.

## Phase 4 — Packages, Sessions, Invoices (Days 39–50)

- [ ] Packages + items; client subscriptions; session consumption — after Q5
- [ ] Invoices (numbering, statuses, PDF) — after Q8
- [ ] Link sales ↔ invoices ↔ payments
- [ ] Audit export (CSV) — after Q11

**Exit criteria**: Package balance decreases per session; invoices can be issued and tracked paid/partial.

## Phase 5 — Reports & MVP Hardening (Days 51–60)

- [ ] Reports (revenue, occupancy, packages, no-shows) — after Q12
- [ ] UX polish, empty states, error handling, i18n (FR) — after Q14
- [ ] Security review (auth, RBAC, validation, secrets)
- [ ] E2E suite (Playwright) for critical flows
- [ ] Backup/restore runbook + deployment guide
- [ ] MVP acceptance demo — **stop and wait for approval**

**Exit criteria**: MVP signed off; Easybel replacement plan (Q17) scheduled as Phase 6.

---

## Risk Log

| Risk | Mitigation |
|---|---|
| Unresolved business rules (Q1–Q18) | Block the module, not the whole MVP; ship confirmed scope |
| Easybel data migration complexity | Start export analysis in Phase 1 (read-only) |
| Scope creep (portal, online booking) | Explicit non-goals in AGENTS.md §2 |
| Financial bugs | Append-only ledger, snapshot prices, unit tests on rounding |
| Audit/compliance gaps | Audit from day 1; retention decision Q11 |

## Milestones

- **Day 7** — Foundation demo (login + audit)
- **Day 14** — Reference data demo (users, clients, services)
- **Day 25** — Agenda demo (booking end-to-end)
- **Day 38** — Money demo (sales + cash close)
- **Day 50** — Packages/invoices demo
- **Day 60** — MVP acceptance
