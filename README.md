# Medical Wellness — Internal Management System

Internal management system for **Medical Wellness** (Tanger). Modular monolith: **Next.js** (web) + **NestJS** (API) + **PostgreSQL** (via Prisma).

> **Status**: Phase 1 — architecture & documentation. Business modules start after approval.
> Project rules: see [`AGENTS.md`](./AGENTS.md).

## Structure (target)

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
│   └── decisions/
├── infrastructure/
│   └── docker/               # PostgreSQL (dev)
├── AGENTS.md
└── README.md
```

## Quickstart (once the monorepo is scaffolded)

```bash
# 1) Prerequisites: Node 20+, pnpm 9+, Docker Desktop (or local PostgreSQL 16)
# 2) Start the database
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 3) Install dependencies
pnpm install

# 4) Environment (never commit real secrets)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 5) Database
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed

# 6) Run
pnpm dev
```

| App | URL (default) |
|---|---|
| Web   | http://localhost:3000 |
| API   | http://localhost:4000 |

## Environment variables

See `.env.example` files in `apps/api` and `apps/web`. Minimum for the API:

- `DATABASE_URL` — `postgresql://USER:PASSWORD@localhost:5432/medical_wellness`
- `SESSION_SECRET` or `JWT_SECRET` — long random string (see Q10, unresolved)
- `NODE_ENV` — `development | production`

## Docs

- [Architecture](docs/architecture/overview.md)
- [Database design](docs/database/design.md)
- [Unresolved requirements](docs/requirements/unresolved.md)
- [60-day roadmap](docs/planning/60-day-roadmap.md)
- [ADRs](docs/decisions/)

## Legacy prototype

The previous prototype (`src/`, `electron/`, `android/`, `dist/`) is kept for reference in git history.
It is **not** used by the new monorepo. Do not mix prototype code into `apps/`.

## License

Internal use — Medical Wellness.
