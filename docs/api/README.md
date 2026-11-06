# API Documentation (REST)

> **Status**: Phase 1 — no endpoints yet. This file will document the public REST contract once the API module lands.

## Conventions (proposed)

- Base URL: `/api/v1` (versioned).
- Auth: session cookie (httpOnly) — pending Q10 decision.
- Validation: strict DTOs (unknown fields rejected).
- Pagination: `?page=&limit=` (max 100).
- Errors: RFC 7807 `application/problem+json` with stable `code` values.
- Money: JSON `number` in MAD (2 decimals); never compute floats on the client.
- Dates: ISO 8601 UTC in transport; UI renders Africa/Casablanca.

## Endpoints (planned, by module)

See `docs/architecture/overview.md` §5 for the module list. Each module will add its routes here with examples and RBAC matrix.
