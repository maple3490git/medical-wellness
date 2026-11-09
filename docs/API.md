# API — Medical Wellness Backend MVP

Base URL: `http://localhost:4000/api/v1` (global prefix `api/v1`). Swagger UI: `http://localhost:4000/api/docs`. OpenAPI JSON is generated at runtime by `@nestjs/swagger`.

## Conventions

- Auth: `Authorization: Bearer <token>` (JWT). All routes require a token except `POST /api/v1/auth/login` and `GET /api/v1/health` (marked `@Public()`).
- Validation: strict DTOs. Unknown JSON fields are rejected (`forbidNonWhitelisted`). Validation failures return 400.
- Pagination: `?page=&limit=` (defaults `1` / `20`, max `100`). List responses: `{ data: [...], meta: { total, page, limit, totalPages } }` sorted as documented per endpoint.
- Dates: ISO 8601 UTC with timezone (e.g. `2026-11-10T10:00:00.000Z`).
- Errors: Nest defaults. `400` validation / business-rule input, `401` unauthenticated or bad credentials, `403` insufficient role, `404` not found, `409` conflict (overlap, duplicate email, already cancelled, cannot update cancelled).

## Auth

| Method | Path | Role | Notes |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Body `{ email, password }`. Returns `{ accessToken, tokenType: "Bearer", expiresIn, user: { id, email, firstName, lastName, role, active } }`. Wrong password, unknown email, or inactive user all return 401 with generic message. Password hashes are never returned. |
| `GET` | `/api/v1/auth/me` | Any authenticated | Returns current user (safe fields). Useful to verify the token and role. |

No public registration. ADMIN creates users via `/api/v1/users`.

## Users (ADMIN only)

All endpoints require `ADMIN`. RECEPTION receives 403.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/users` | Body `{ email, password (≥10 chars), firstName, lastName, role, active? }`. 409 if email exists. Response excludes `passwordHash`. |
| `GET` | `/api/v1/users?page=&limit=` | Paginated, newest first. |
| `GET` | `/api/v1/users/:id` | 404 if missing. |
| `PATCH` | `/api/v1/users/:id` | Updates `firstName`, `lastName`, `role`, `active`, and optionally `password` (re-hashed). |

## Clients

Available to all authenticated roles (ADMIN and RECEPTION). No delete endpoint.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/clients` | Body `{ firstName, lastName, phone, email? }`. Phone validated, email lowercased. |
| `GET` | `/api/v1/clients?page=&limit=&search=` | Paginated, sorted by `lastName, firstName`. `search` matches `firstName`, `lastName`, `phone`, or `email` (case-insensitive for text fields). |
| `GET` | `/api/v1/clients/:id` | 404 if missing. |
| `PATCH` | `/api/v1/clients/:id` | Partial update (same validation). 404 if missing. |

## Employees

Available to all authenticated roles. No delete endpoint. `active` controls assignability.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/employees` | Body `{ firstName, lastName, active? }` (`active` defaults `true`). |
| `GET` | `/api/v1/employees?page=&limit=&active=` | Paginated, sorted by `lastName, firstName`. `active=true/false` filters. |
| `GET` | `/api/v1/employees/:id` | 404 if missing. |
| `PATCH` | `/api/v1/employees/:id` | Partial update including `active` (activate / deactivate). 404 if missing. |

Only `active` employees can be assigned in appointments. Inactive assignment returns 400.

## Appointments

Available to all authenticated roles. `createdById` is recorded from the JWT (`sub`) and is immutable.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/appointments` | Body `{ clientId, employeeId, startAt, endAt, source, status?, notes? }`. `status` defaults `SCHEDULED`; `CANCELLED` at creation is rejected (use `/cancel`). Validates: client exists (400), employee exists + active (400), `endAt > startAt` (400), no overlap for the employee (409). Overlap uses half-open intervals, so back-to-back (`end == start`) is allowed. Cancelled appointments never block. |
| `GET` | `/api/v1/appointments?page=&limit=&from=&to=&employeeId=&clientId=&status=` | Paginated, sorted by `startAt` ascending. `from`/`to` are ISO instants; appointments whose interval intersects `[from, to)` are returned. `to` must be later than `from` (400). |
| `GET` | `/api/v1/appointments/:id` | Includes `client`, `employee`, `createdBy`. 404 if missing. |
| `PATCH` | `/api/v1/appointments/:id` | Partial update. `clientId`, `employeeId`, `startAt`, `endAt`, `source`, `status`, `notes` optional. `status: CANCELLED` via this endpoint is rejected (use `/cancel`, 400). Updating a cancelled appointment returns 409. Time/employee changes re-run active-employee and overlap checks. |
| `PATCH` | `/api/v1/appointments/:id/cancel` | Body `{ reason? }` (appended to `notes`). Allowed from `SCHEDULED` / `CONFIRMED`. Already `CANCELLED` → 409. `COMPLETED` → 409. 404 if missing. |

## Health

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/v1/health` | Public. `{ status: "ok" \| "degraded", database: "up" \| "down", timestamp }`. |

## Example session

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.local","password":"ChangeMeDevOnly!2026"}'

TOKEN=<accessToken>

curl http://localhost:4000/api/v1/clients -H "Authorization: Bearer $TOKEN"
curl "http://localhost:4000/api/v1/appointments?status=SCHEDULED&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

Do not use the example password in production. Change `SEED_ADMIN_PASSWORD` and `JWT_SECRET` before any shared deployment.
