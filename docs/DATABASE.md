# Database — Medical Wellness Backend MVP

PostgreSQL 16, accessed via Prisma. Schema file: `apps/api/prisma/schema.prisma`. Migrations: `apps/api/prisma/migrations/`.

## Models

### User

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | UUID v4 |
| `email` | `TEXT UNIQUE` | Stored lowercased, `@IsEmail` validated |
| `password_hash` | `TEXT` | `bcrypt` hash (cost 12), never returned by the API |
| `first_name`, `last_name` | `TEXT` | Required |
| `role` | `UserRole` enum | `ADMIN \| RECEPTION` |
| `active` | `BOOLEAN` | Default `true`; inactive users cannot log in |
| `created_at`, `updated_at` | `TIMESTAMPTZ(3)` | Prisma-managed |

Indexes: `users_email_key` (unique), `role`, `active`.

### Client

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `first_name`, `last_name` | `TEXT` | Required |
| `phone` | `TEXT` | Required, validated as phone characters, no uniqueness (shared numbers possible) |
| `email` | `TEXT NULL` | Optional, validated as email, stored lowercased |
| `created_at`, `updated_at` | `TIMESTAMPTZ(3)` | |

Indexes: `(last_name, first_name)`, `phone`, `email`. No medical fields in this MVP.

### Employee

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `first_name`, `last_name` | `TEXT` | Required |
| `active` | `BOOLEAN` | Default `true`; only active employees can be assigned to new appointments |
| `created_at`, `updated_at` | `TIMESTAMPTZ(3)` | |

Indexes: `(last_name, first_name)`, `active`.

### Appointment

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `client_id` | `TEXT FK → clients.id` | `ON DELETE RESTRICT` |
| `employee_id` | `TEXT FK → employees.id` | `ON DELETE RESTRICT` |
| `created_by_id` | `TEXT FK → users.id` | Authenticated user who created the appointment; immutable |
| `start_at`, `end_at` | `TIMESTAMPTZ(3)` | `end_at > start_at` enforced in service and by CHECK constraint |
| `source` | `AppointmentSource` enum | `PHONE \| IN_PERSON \| WHATSAPP` |
| `status` | `AppointmentStatus` enum | `SCHEDULED \| CONFIRMED \| COMPLETED \| CANCELLED`, default `SCHEDULED` |
| `notes` | `TEXT NULL` | Optional; cancellation reasons are appended here |
| `created_at`, `updated_at` | `TIMESTAMPTZ(3)` | |

Indexes: `(employee_id, start_at, end_at)` for overlap queries, `(client_id, start_at)`, `(status, start_at)`, `start_at`, `created_by_id`.

Constraints (migration `20261109125700_overlap_constraints`):

- `appointments_end_after_start` — `CHECK (end_at > start_at)`
- `appointments_no_overlap` — partial exclusion: `EXCLUDE USING gist (employee_id WITH =, tstzrange(start_at, end_at) WITH &&) WHERE (status <> 'CANCELLED')`. Requires `btree_gist`.

## Relationships

`User 1—N Appointment` (as creator) · `Client 1—N Appointment` · `Employee 1—N Appointment`. All `ON DELETE RESTRICT` to prevent accidental loss of history.

## Migrations

- `20261109125600_init` — creates enums, tables, indexes, foreign keys.
- `20261109125700_overlap_constraints` — `btree_gist`, CHECK, and exclusion constraint.

Commands:

```powershell
cd apps/api
npx prisma validate
npx prisma migrate dev --name <change>   # create + apply (dev)
npx prisma migrate deploy                # apply (deploy)
npx prisma db seed                       # or: npm run prisma:seed
```

The seed is idempotent and synthetic-only: it upserts `admin@example.local` / `reception@example.local` (passwords from `SEED_ADMIN_PASSWORD` / `SEED_RECEPTION_PASSWORD`, default `ChangeMeDevOnly!2026`) plus 3 demo clients and 3 demo employees (one inactive). It refuses to run with the example password in `NODE_ENV=production`.

## Existing local database note

The local Windows PostgreSQL 16 instance already contains `medwell_dev` (legacy tables: `users`, `appointments`, `prospects`, `services`, `subscriptions`, `transactions`, `wellness_coin_ledger`, `legacy_clients`). This MVP does not read, migrate, or delete that database. Development uses a new empty database `medical_wellness` created for this project.
