# Medical Wellness — Internal Management System

Internal management system for **Medical Wellness** (wellness center, Morocco). Modular monolith: **NestJS** (API) + **PostgreSQL** (via Prisma). Frontend (Next.js) is not part of this MVP.

> **Status**: Backend MVP — Authentication, RBAC (ADMIN / RECEPTION), Clients, Employees, Appointments. Implemented in `apps/api/` on branch `feature/appointments-and-roles`.
> Project rules: see [`AGENTS.md`](./AGENTS.md).

## Structure

```
medical-wellness/
├── apps/
│   ├── web/                  # Next.js frontend (.gitkeep — not implemented)
│   └── api/                  # NestJS backend (REST) — implemented
│       ├── src/              # NestJS application (strict TypeScript)
│       ├── prisma/           # schema.prisma, migrations/, seed.ts
│       ├── test/             # e2e tests
│       └── docs/             # (see docs/ below for project-wide docs)
├── packages/shared/          # shared types (.gitkeep)
├── docs/
│   ├── ARCHITECTURE.md       # architecture (MVP)
│   ├── API.md                # REST API reference
│   ├── DATABASE.md           # database design (MVP)
│   ├── PROJECT_STATUS.md     # implementation status & limitations
│   ├── architecture/         # preliminary architecture (Phase 1)
│   ├── database/             # preliminary DB design (Phase 1)
│   ├── requirements/         # open business questions
│   ├── planning/             # 60-day roadmap
│   └── decisions/            # ADRs
├── infrastructure/docker/    # PostgreSQL (dev, docker-compose)
├── AGENTS.md
└── README.md
```

> The legacy prototype (`src/`, `electron/`, `android/`, `dist/`, `build/`, `out/`, `.next/`) is kept for reference only.
> It is **not** used by the new backend. Do not mix prototype code into `apps/api/`.

## Quickstart (backend)

Prerequisites: Node.js 20+ (verified with Node 24), npm 11, PostgreSQL 16.

```powershell
# 1) Start PostgreSQL and create the database (local Windows dev)
# The existing medwell_dev database is not touched by this MVP.
# Create a fresh database for the new backend:
$env:PGPASSWORD = 'postgres'  # local dev password for the postgres role
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -h localhost -p 5432 -w `
  -c "CREATE DATABASE medical_wellness WITH ENCODING 'UTF8' TEMPLATE template0;"

# 2) Install API dependencies
cd apps/api
npm install

# 3) Environment (never commit real secrets)
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL to your local PostgreSQL:
#   postgresql://postgres:postgres@localhost:5432/medical_wellness?schema=public
# Set a strong JWT_SECRET (>=16 chars).

# 4) Database: apply migrations and seed demo data
npx prisma migrate deploy
npm run prisma:seed

# 5) Run
npm run start:dev
```

| Service | URL (default) |
|---|---|
| API | http://localhost:4000/api/v1 |
| Health | http://localhost:4000/api/v1/health |
| Swagger UI | http://localhost:4000/api/docs |

## Environment variables

See `apps/api/.env.example`. Minimum for the API:

- `DATABASE_URL` — `postgresql://USER:PASSWORD@localhost:5432/medical_wellness?schema=public`
- `JWT_SECRET` — long random secret, minimum 16 characters (used to sign access tokens)
- `JWT_EXPIRES_IN` — token lifetime, default `1h`
- `PORT` — default `4000`
- `NODE_ENV` — `development | production`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — seed bootstrap credentials (development only; see `docs/API.md`)

## Development commands

```powershell
cd apps/api
npm run start:dev        # watch mode
npm run build            # production build (nest build)
npm run start:prod       # run dist/main.js
npx tsc --noEmit         # TypeScript strict check
npm run lint             # ESLint (with --fix)
npm test                 # unit tests (Jest, mocked Prisma)
npm run test:e2e         # integration tests (real PostgreSQL, requires DATABASE_URL + migrations)
npx prisma validate      # schema validation
npx prisma migrate dev   # create + apply a new migration (dev)
npx prisma migrate deploy # apply existing migrations (deploy)
npm run prisma:seed      # seed ADMIN + demo data
```

## Docs

- [Architecture (MVP)](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Database (MVP)](docs/DATABASE.md)
- [Project status](docs/PROJECT_STATUS.md)
- [Preliminary architecture](docs/architecture/overview.md)
- [Preliminary DB design](docs/database/design.md)
- [Unresolved requirements](docs/requirements/unresolved.md)
- [60-day roadmap](docs/planning/60-day-roadmap.md)
- [ADRs](docs/decisions/)

## License

Internal use — Medical Wellness.
