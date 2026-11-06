# Preliminary Database Design — Medical Wellness

**Engine**: PostgreSQL 16 · **ORM**: Prisma · **Charset**: UTF-8 · **Timezone**: UTC in DB, Africa/Casablanca in UI

> This is a **proposal**. No tables are created yet. Every change will go through Prisma migrations after approval.

## 1. Conventions

- PK: `uuid` (v4) by default; legacy `id` kept visible as `accountNumber`/`barcode` where needed.
- Money: `numeric(12,2)` in MAD (dirhams). Never `float`. Price snapshots on transactions.
- Timestamps: `timestamptz` for instants, `date` for birth dates, `time` for daily slots.
- Audit columns: `createdAt`, `updatedAt`, `createdById`, `updatedById` (FK → users).
- Deletes: soft delete (`deletedAt`) for clients, users, services; hard delete only for audit retention.
- Enums as PostgreSQL enums (mirrored in Prisma).

## 2. Entity List (Preliminary)

### 2.1 Identity & Access

**users**
- `id uuid PK`
- `email citext UNIQUE NOT NULL`
- `passwordHash text NOT NULL` (argon2id/bcrypt)
- `firstName`, `lastName`, `phone`
- `avatarUrl`, `department`, `serviceId FK?`
- `status enum`: `ACTIVE | SUSPENDED | DEACTIVATED`
- `lastLoginAt timestamptz?`, `createdAt`, `updatedAt`

**roles** — `id`, `name UNIQUE` (ADMIN, RECEPTION, PRACTITIONER...), `description`
**permissions** — `id`, `code UNIQUE` (e.g. `clients.create`, `cash.close`)
**role_permissions** — `(roleId, permissionId)` PK
**user_roles** — `(userId, roleId)` PK
> Note: Practitioner role is **not confirmed** — model exists, no behavior implemented yet.

### 2.2 Clients

**clients**
- `id uuid PK`
- `civility enum`: `M | MME | MLLE | ...` (confirm list)
- `gender enum`: `M | F`
- `firstName text NOT NULL`, `lastName text NOT NULL`
- `birthDate date?`
- `phonePrimary text NOT NULL`, `phoneSecondary text?`
- `email citext?`
- `address text?`, `postalCode text?`
- `accountNumber text UNIQUE?`, `barcode text UNIQUE?`
- `isRegular boolean NOT NULL DEFAULT false`
- `acquisitionSource enum?` (`PHONE | IN_PERSON | WHATSAPP | REFERRAL | SOCIAL | WALK_IN | OTHER`)
- `referrerClientId FK? → clients`
- `comments text?`, `communicationPreferences jsonb?` (e.g. `{ preferredChannel, language, consent }`)
- `createdById`, `createdAt`, `updatedAt`, `deletedAt?`

Indexes: `lastName, firstName`, `phonePrimary`, `email`, `accountNumber`.

### 2.3 Catalog

**service_categories**
- `id`, `name UNIQUE NOT NULL`, `description?`, `sortOrder int`, `isActive boolean`

**services**
- `id`, `categoryId FK`, `name NOT NULL`, `code UNIQUE?`, `description?`
- `durationMinutes int NOT NULL`, `price numeric(12,2) NOT NULL`
- `isActive boolean`, `createdAt`, `updatedAt`
> No hardcoded catalog. Prices live here and are versioned by `updatedAt` + audit.

**employees** (practitioners / staff for `assignedEmployeeId`)
- `id`, `userId FK?` (nullable — not every employee is a system user)
- `firstName`, `lastName`, `email?`, `phone?`
- `specialty?`, `status enum` (`ACTIVE | INACTIVE`), `createdAt`, `updatedAt`

### 2.4 Appointments & Agenda

**appointments**
- `id uuid PK`
- `clientId FK → clients NOT NULL`
- `createdByUserId FK → users NOT NULL` (Reception user who recorded it — immutable)
- `assignedEmployeeId FK → employees NOT NULL` (who performs the service)
- `bookingSource enum NOT NULL`: `PHONE | IN_PERSON | WHATSAPP`
- `startsAt timestamptz NOT NULL`, `endsAt timestamptz NOT NULL` (computed from services)
- `status enum NOT NULL`: `SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW`
- `notes text?`, `cancellationReason text?`
- `createdAt`, `updatedAt`, `updatedById`

**appointment_services** (multi-service support)
- `(appointmentId, serviceId)` PK
- `priceSnapshot numeric(12,2) NOT NULL` (catalog price at booking time)
- `durationSnapshot int`
- `status enum`: `SCHEDULED | DONE | SKIPPED`

Indexes: `(startsAt, status)`, `(clientId)`, `(assignedEmployeeId, startsAt)`.

### 2.5 Sales, Payments, Cash

**Accounting anchor**: every payment references a **sale**. `appointment_id` is optional operational metadata only (see `sale_appointment_links`). Standalone operations are modeled as sales. The `payments` ledger (via `payment_effective`) is the **single authoritative source** for all financial totals — appointment references never double-count.

**sales** (a sale can contain several services/products)
- `id`, `clientId FK?`, `createdByUserId FK NOT NULL`
- `status enum`: `DRAFT | CONFIRMED | CANCELLED`
- `expectedTotal numeric(12,2) NOT NULL` (frozen at confirmation — the theoretical amount)
- `subtotal`, `tax`, `discount`, `total numeric(12,2)`
- Derived (computed, never stored): `actualTotal = Σ(payments.amount WHERE status='RECORDED')`, `balance = expectedTotal − actualTotal`, `isSettled = (balance = 0)`
- `createdAt`, `updatedAt`

**sale_items**
- `saleId FK`, `serviceId FK?`, `description text`, `quantity int`
- `unitPrice numeric(12,2)` (snapshot), `lineTotal numeric(12,2)`

**sale_appointment_links** (junction — **no 1:1 assumption** between sales and appointments)
- `saleId FK`, `appointmentId FK`, `linkType enum`: `PERFORMS | BILLED_FROM`

**payments** (append-only ledger — **immutable** rows, no `status` column)
- `id UUID PK`
- `saleId FK NOT NULL` (every payment belongs to a sale)
- `appointmentId FK?` (operational metadata only)
- `clientId FK NOT NULL` (must equal the parent `sale.clientId`)
- `method enum`: `CASH | TPE`
- `amount numeric(12,2) NOT NULL CHECK (amount > 0)` (actual amount received)
- `receivedAt timestamptz NOT NULL`, `recordedByUserId FK → users NOT NULL`
- `sessionId FK?` — **required for CASH, NULL for TPE** (`CHECK` constraint)
- `terminalRef text?` (manual TPE auth code — entered by Reception; no terminal integration)
- `createdAt timestamptz DEFAULT now()`
- **Derived:** `effective_status` via `payment_effective` view (see below)

**payment_effective** (view — single accounting source)
```sql
CREATE VIEW payment_effective AS
SELECT p.*,
       CASE WHEN v.id IS NULL THEN 'RECORDED' ELSE 'VOIDED' END AS effective_status
FROM payments p
LEFT JOIN payment_voids v ON v.original_payment_id = p.id;
```

**payment_voids** (append-only void records)
- `id UUID PK`, `originalPaymentId FK → payments NOT NULL`
- `reason text NOT NULL`, `authorizedByUserId FK NOT NULL` (must hold void permission)
- `voidedAt timestamptz DEFAULT now()`, `reversalMovementId FK?`

**payment_refunds** (separate transactions — never overwrite the original payment)
- `id UUID PK`, `paymentId FK → payments NOT NULL`
- `type enum`: `FULL | PARTIAL`, `amount numeric(12,2) NOT NULL`
- `reason text NOT NULL`, `recordedByUserId FK NOT NULL`, `createdAt timestamptz`
- `cashMovementId FK?` (CASH only — links the refund to its `WITHDRAWAL` movement)
- **Method is inherited** from the original payment (no independent method selection).
- **Guard:** within one transaction — `SELECT ... FOR UPDATE` on the base `payments` row (not the view), reject if `payment_voids` exists, compute `refundable = amount − Σ(refunds)`, insert refund (+ cash movement if CASH) atomically. Voiding a payment with existing refunds is **rejected** until refunds are formally reconciled (reversing entries + manager sign-off).

**cash_registers**
- `id`, `name UNIQUE` (e.g. `CAISSE-01`), `isActive`

**cash_sessions**
- `id`, `registerId FK`, `openedByUserId FK`, `openingBalance numeric(12,2) NOT NULL`
- `status enum`: `OPEN | CLOSED` (default `OPEN`)
- `closedByUserId FK?`, `closedAt timestamptz?`, `expectedBalance numeric(12,2)?`, `countedBalance numeric(12,2)?`, `discrepancy numeric(12,2)?`
- **Integrity:** partial unique index on `(registerId) WHERE status = 'OPEN'` — one open session per register. Closed sessions are **never modified** (compensating movements land in the currently open session; if none is open, the refund/void is blocked).

**cash_movements** (immutable ledger — **CASH only**; TPE never creates a movement)
- `id`, `registerId FK`, `sessionId FK NOT NULL`, `type enum`: `INCOME | EXPENSE | WITHDRAWAL | REVERSAL | ADJUSTMENT`
- `paymentId FK?`, `refundId FK?`, `reversalOfMovementId FK?`
- `amount numeric(12,2)`, `balanceSnapshot numeric(12,2)?`
- `notes?`, `recordedByUserId FK`, `occurredAt timestamptz`, `createdAt`
- **Sign conventions** (`expected_balance = opening_balance + Σ(balance_effect)`):

| `type` | Stored `amount` | `balance_effect` |
|---|---|---|
| `INCOME` (CASH payment) | positive | `+ amount` |
| `EXPENSE` | positive | `− amount` |
| `WITHDRAWAL` (incl. refund-linked) | positive | `− amount` |
| `REVERSAL` (of a voided CASH payment) | **negative** | **the stored amount** (e.g. `−100` → `−100`) |
| `ADJUSTMENT` | **signed** | `+ stored amount` |

**payment_settings** (configurable until Q23 confirmed)
- `overpaymentPolicy enum`: `FLAG_ONLY | REQUIRE_REASON | ALLOW_CHANGE_AS_CASH_OUT`
- `roundingTolerance numeric(10,2)` (Q25), `updatedByUserId FK`, `updatedAt`

### 2.6 Packages & Subscriptions

**packages** (sellable bundles of services/sessions)
- `id`, `name`, `description?`, `price numeric(12,2)`, `isActive`

**package_items** — `packageId FK`, `serviceId FK?`, `sessionsCount int`, `sortOrder`
  (semantics to confirm — see unresolved §Q5)

**client_subscriptions**
- `id`, `clientId FK`, `packageId FK`, `purchasedAt`, `expiresAt?`
- `totalSessions int`, `usedSessions int DEFAULT 0`, `status enum`: `ACTIVE | EXPIRED | CANCELLED`

**sessions** (consumption log)
- `id`, `subscriptionId FK`, `appointmentId FK?`, `consumedAt`, `consumedById FK`
- Links a completed treatment to a package balance.

### 2.7 Invoices

**invoices**
- `id`, `number text UNIQUE` (sequential per year — confirm rule)
- `clientId FK`, `status enum`: `DRAFT | ISSUED | PAID | PARTIAL | CANCELLED`
- `subtotal`, `tax`, `discount`, `total numeric(12,2)`
- `issuedAt?`, `dueDate?`, `createdById`, `createdAt`, `updatedAt`

**invoice_items** — `invoiceId FK`, `description`, `quantity`, `unitPrice`, `lineTotal`
**invoice_payments** — `invoiceId FK`, `paymentId FK`, `amount`

### 2.8 Audit & Reports

**audit_logs**
- `id`, `userId FK?`, `action enum` (CREATE/UPDATE/DELETE/LOGIN/PAYMENT...)
- `entityType text`, `entityId text`, `diff jsonb?` (before/after)
- `ipAddress inet?`, `metadata jsonb?`, `createdAt`
- Retention: ≥ 5 years (confirm legal requirement).

Materialized views / summary tables for reports are **phase 2** (not MVP).

## 3. Prisma Model Sketch (excerpt)

```prisma
model Client {
  id             String    @id @default(uuid())
  firstName      String
  lastName       String
  phonePrimary   String
  gender         Gender
  createdAt      DateTime  @default(now())
  appointments   Appointment[]
  @@index([lastName, firstName])
}

enum BookingSource {
  PHONE
  IN_PERSON
  WHATSAPP
}

model Appointment {
  id                   String         @id @default(uuid())
  clientId             String
  createdByUserId      String
  assignedEmployeeId   String
  bookingSource        BookingSource
  startsAt             DateTime
  endsAt               DateTime
  status               AppointmentStatus @default(SCHEDULED)
  services             AppointmentService[]
}
```

## 4. Migration Strategy

- `prisma migrate dev --name init` → review SQL → commit.
- Seed (dev only): synthetic data, no real clients.
- Backups: `pg_dump` daily; WAL archiving if hosted (phase 2).

## 5. What Is NOT in the DB (by design)

- No price/city/name hardcoded in code — all reference data is in tables.
- No WhatsApp data (channel is manual in MVP).
- No public website tables (separate system).
