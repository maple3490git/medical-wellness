# ADR-002 — PostgreSQL 16 + Prisma

**Status**: Accepted (Phase 1)
**Date**: 2026-11-06

## Context
Needs: relational data (clients, appointments, sales, cash ledger), audit history, financial immutability, migrations.

## Decision
- **PostgreSQL 16** as the only database.
- **Prisma ORM** for schema, migrations, and typed queries.
- Money stored as `numeric(12,2)` (never float).
- All schema changes via Prisma migrations; no manual DDL in production.

## Alternatives Considered
- MySQL/MariaDB (prototype used MariaDB — not retained: PostgreSQL enums, JSONB, citext, better audit story).
- TypeORM (rejected: active-record pitfalls, weaker migration story than Prisma for this team size).

## Consequences
- (+) Strong typing from schema to API; migrations are reviewable SQL.
- (+) JSONB for flexible fields (communication preferences, audit diffs).
- (-) Team must learn Prisma; raw SQL only for reports (with care).
