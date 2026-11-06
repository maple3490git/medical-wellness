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

**sales** (a sale can contain several services/products)
- `id`, `clientId FK?`, `createdByUserId FK NOT NULL`
- `status enum`: `DRAFT | CONFIRMED | CANCELLED`
- `subtotal`, `tax`, `discount`, `total numeric(12,2)`
- `createdAt`, `updatedAt`

**sale_items**
- `saleId FK`, `serviceId FK?`, `description text`, `quantity int`
- `unitPrice numeric(12,2)`, `lineTotal numeric(12,2)`

**payments**
- `id`, `saleId FK?`, `appointmentId FK?`
- `method enum`: `CASH | CARD | BANK_TRANSFER | OTHER`
- `amount numeric(12,2) NOT NULL`, `paidAt timestamptz`, `reference text?`
- `status enum`: `RECORDED | VOIDED | REFUNDED`
- Append-only history — never update amount on a recorded payment; use void/refund rows.

**cash_registers**
- `id`, `name UNIQUE` (e.g. `CAISSE-01`), `isActive`

**cash_movements** (immutable ledger)
- `id`, `registerId FK`, `type enum`: `OPEN | CLOSE | INCOME | EXPENSE | TRANSFER`
- `amount numeric(12,2)`, `balanceSnapshot numeric(12,2)?`
- `referenceType?` / `referenceId?` (sale/payment/invoice), `notes?`
- `recordedById FK → users`, `occurredAt timestamptz`, `createdAt`

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
