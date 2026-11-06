# ADR-001 — Modular Monolith (not microservices)

**Status**: Accepted (Phase 1)
**Date**: 2026-11-06

## Context
Small team, 60-day MVP, clear domain boundaries (clients, appointments, sales, cash...), single database needs.

## Decision
Build a **Modular Monolith**: one NestJS backend, one Next.js frontend, one PostgreSQL database.
Modules are enforced by NestJS feature modules with explicit boundaries; no network calls between modules.

## Alternatives Considered
- Microservices (rejected: operational cost, distributed transactions, latency, team size).
- Serverless functions (rejected: session/state costs, vendor lock-in, debug complexity).

## Consequences
- (+) Simple deploy, single DB transaction across modules, easier debugging.
- (+) Modules can be extracted later if a boundary is proven (e.g. reporting).
- (-) Module boundaries must be disciplined (no cross-module internal imports without a public API).
