# Project Status — Medical Wellness Backend MVP

Branch: `feature/appointments-and-roles`. Location: `apps/api/`.

## Implemented

- Authentication: login with bcrypt verification, JWT access tokens, `GET /auth/me`, global JWT guard, validation and generic 401 errors.
- RBAC: `ADMIN` / `RECEPTION` enums, `@Roles()` + `RolesGuard`. ADMIN-only user management; RECEPTION can use operational modules but cannot manage users.
- Users: create / list (paginated) / get / update (including role, active flag, password rotation). Password hashes hashed (bcrypt 12) and never returned.
- Clients: create / list with `search` (name, phone, email) / get / update. Fields: `firstName`, `lastName`, `phone`, `email?`, timestamps. Paginated.
- Employees: create / list (paginated, `active` filter) / get / update including deactivate. Only active employees are assignable.
- Appointments: create / list with `from`/`to` + `employeeId` + `clientId` + `status` filters / get / update / cancel. Enforces existing client, active employee, `endAt > startAt`, duplicate booking prevention (advisory lock + application check + DB exclusion constraint), `createdById` tracking, and terminal-state rules for cancel.
- Health: `GET /api/v1/health` (public) with DB connectivity check.
- Swagger/OpenAPI: `GET /api/docs` (UI) with Bearer auth and DTO examples.
- Database: Prisma schema, 2 migrations (`init`, `overlap_constraints`), idempotent synthetic seed (ADMIN + demo RECEPTION, 3 clients, 3 employees).
- Tests: 33 unit tests (appointments overlap/boundaries/cancel rules, auth, RBAC guard, clients, employees, users) and 7 e2e integration tests (auth, RBAC 403, health, full appointment flow, inactive employee).

## Verified (executed on the development machine)

- `npx prisma validate` — valid.
- `npx prisma migrate deploy` — both migrations applied to `medical_wellness`.
- `npm run prisma:seed` — 2 users, 3 clients, 3 employees.
- `npx tsc --noEmit` — no type errors (strict mode).
- `npm run lint` — clean (after fixing unused import; prettier formatting via `--fix`).
- `npm test` — 6 suites, 33 tests passed.
- `npm run test:e2e` — 1 suite, 7 tests passed against real PostgreSQL.
- `npm run build` + `node dist/main.js` — production bundle starts and maps all routes.
- `git status` — new `apps/api/` tree untracked; legacy `src/`, `electron/`, `android/`, `medwell_dev` database untouched. No commit or push performed.

## Known limitations

- Prisma emits a deprecation warning for `package.json#prisma` (seed config). Functional on Prisma 6.19.3; migrate to `prisma.config.ts` before Prisma 7.
- JWT `expiresIn` type requires a cast (`as '1h'`) for `@nestjs/jwt` 11 typings; runtime still uses `JWT_EXPIRES_IN` from env.
- `apps/web/` is empty (`.gitkeep` only). No frontend exists.
- No audit-log table, services catalog, multi-service appointments, sales/payments/cash, subscriptions, reports, or email/SMS integration.
- `GET /api/v1/appointments` date filtering uses interval intersection (`[startAt,endAt) ∩ [from,to)`), not “starts on day”. Clients should pass full ISO instants.
- Seed demo users use the example password when `SEED_ADMIN_PASSWORD` / `SEED_RECEPTION_PASSWORD` are unset. The seed refuses this in `NODE_ENV=production`; any shared deployment must set strong passwords and rotate `JWT_SECRET`.
- e2e tests share `DATABASE_URL` with development and create real rows with unique suffixes, then clean them up. Running e2e against a production database is not supported.

## Remaining work for the next phase

Frontend (Next.js in `apps/web/`), services catalog, multi-service support, sales/payments/cash, subscriptions, audit logs, rate limiting on login, refresh-token strategy, and full bootstrap documentation for production deployment.

## Unresolved business decisions

Working hours, slot granularity, advance-booking limits, holidays, the PRACTITIONER role, multi-service semantics, and cancellation windows were not in the MVP specification and have not been invented. They remain open (see `docs/requirements/unresolved.md` Q1–Q4, Q13).
