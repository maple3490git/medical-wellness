# Architecture — Medical Wellness Backend MVP

Modular monolith. Single NestJS application in `apps/api/`, single PostgreSQL 16 database via Prisma. No microservices, no frontend in this scope.

## Module layout

```
apps/api/src/
├── main.ts                  # bootstrap, global prefix, validation pipe, Swagger
├── app.module.ts            # root module, ConfigModule, global JwtAuthGuard
├── prisma/                  # PrismaService (global), PrismaModule
├── auth/                    # login, JWT strategy, JwtAuthGuard, RolesGuard
├── users/                   # ADMIN-only user management
├── clients/                 # client CRUD (minimal fields for appointments)
├── employees/               # employee CRUD + active flag
├── appointments/            # appointment CRUD + cancel + overlap prevention
├── health/                  # GET /api/v1/health (public, includes DB check)
└── common/
    ├── decorators/          # Public, Roles, CurrentUser
    └── utils/               # pagination helpers
```

Controllers handle HTTP and DTO validation. Services contain business rules and Prisma access. Prisma is the only data-access layer.

## Cross-cutting concerns

| Concern | Implementation |
|---|---|
| Auth | JWT Bearer access tokens (`passport-jwt`). Global `JwtAuthGuard` (all routes require a token unless marked `@Public()`). |
| RBAC | `@Roles(ADMIN)` + `RolesGuard`. Backend-only. `RECEPTION` has no administrative user management. |
| Validation | `class-validator` DTOs, global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. Unknown fields are rejected with 400. |
| Passwords | `bcrypt` cost 12. Hashes never selected or returned by user endpoints. |
| Errors | Nest default exception filter. Business-rule conflicts use 409, invalid input / unknown client or employee / invalid date range use 400, missing resources use 404, unauthenticated use 401, forbidden use 403. |
| Time | All instants stored as `TIMESTAMPTZ(3)` in UTC. Transport format is ISO 8601. Render in `Africa/Casablanca` in any future UI (no UI in this MVP). |
| Pagination | `?page=&limit=` (defaults 1/20, max 100). List responses return `{ data, meta: { total, page, limit, totalPages } }`. |
| Logging | No secret or token logging. `console` restricted to warnings/errors by ESLint. |
| Config | `@nestjs/config` with mandatory `DATABASE_URL` and `JWT_SECRET` (≥16 chars). Fail-fast on missing or weak secrets. |

## Auth flow

`POST /api/v1/auth/login` → `AuthService.login()` looks up the user by lowercased email, checks `active`, `bcrypt.compare()` against `passwordHash`, then issues a JWT `{ sub, email, role }` via `JwtService`. `JwtStrategy.validate()` returns the payload as `AuthenticatedUser` for `@CurrentUser()`. There is no public registration. The initial ADMIN is created by `prisma/seed.ts` from `SEED_ADMIN_*` environment variables (development only).

## Appointment overlap prevention

Application layer + database layer:

1. **Application check** (in `AppointmentsService`): within a Prisma interactive transaction, `pg_advisory_xact_lock(hashtextextended(employeeId, 0))` serializes writes per employee, then `findFirst` checks `employeeId = ? AND status != CANCELLED AND startAt < newEnd AND endAt > newStart` (half-open interval, so `[10:00,11:00)` and `[11:00,12:00)` do not overlap). The check excludes the appointment being updated.
2. **Database constraints** (migration `20261109125700_overlap_constraints`): `CHECK (end_at > start_at)` plus a partial exclusion constraint `EXCLUDE USING gist (employee_id WITH =, tstzrange(start_at, end_at) WITH &&) WHERE (status <> 'CANCELLED')` backed by `btree_gist`. This blocks overlapping rows even from writers that bypass the advisory lock.

Cancelled appointments never block: they are excluded from the application query and from the partial exclusion constraint.

## What is intentionally not in the MVP

Frontend, dashboard, mobile, sales, payments, cash register, subscriptions, financial reports, client portal, public booking, services catalog, multi-service appointments, audit-log table. See `docs/PROJECT_STATUS.md` for the full boundary.
