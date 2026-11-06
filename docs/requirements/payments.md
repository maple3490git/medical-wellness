# Payment Workflow — Confirmed Requirements

**Status**: Confirmed (Phase 1). Applies to the `payments`, `cash`, and `reports` modules.

## 1. Confirmed Rules

- **Payment methods (MVP)**: `CASH` (Espèces) · `TPE` (bank card via terminal) — no other methods.
- **Timing**: Reception records the payment **after** the operation/service is completed.
- **Reception captures**: amount actually received, method, related client, related sale/operation, date/time, authenticated employee (`recordedByUserId`).
- **One sale → multiple payment records** supported (split CASH + TPE allowed; not assumed common). Every payment **must reference a sale** (`saleId` required); `appointmentId` is optional operational metadata only.
- **Theoretical vs actual amounts stay separate**: `expectedTotal` (frozen at sale confirmation) vs `actualTotal` (derived = Σ active payments). Balance = expected − actual.
- **CASH and TPE are separated** in financial reports and daily closing. **TPE never affects the physical cash drawer** (no cash movement).
- **TPE is manual**: processed on the physical terminal; no integration in MVP. Optional `terminalRef` (auth code) entered by Reception.
- **Refunds**: partial or full, via **separate refund transactions** linked to the original payment. **Method is inherited** from the original payment (no independent selection). Never overwrite or delete the original payment.
- **Voids**: append-only. The original `payments` row stays **immutable**; effective status is **derived** from a separate `payment_voids` record (original payment ID, reason, authorized employee, timestamp).
- **Cash register**: one `OPEN` session per register at a time. Every CASH payment is bound to exactly one valid open session. Closed sessions are **never modified** (compensating movements land in the currently open session).
- **Single accounting source**: all totals come from the `payments` ledger (via `payment_effective`); appointment references never double-count.

## 2. Payment & Refund Workflow

```
Payment:
  sale CONFIRMED → Reception records actual amount + method (CASH | TPE)
  + client, sale reference, receivedAt, recordedByUserId
  CASH → requires OPEN session (same register) → creates INCOME movement
  TPE  → manual terminal step; optional terminalRef; NO cash movement
  Multi-payment per sale allowed (append-only ledger).

Refund (partial or full, method inherited from original payment):
  BEGIN → SELECT amount FROM payments WHERE id=:paymentId FOR UPDATE
          → reject if payment_voids exists (voided payments can't be refunded)
          → refundable = amount − Σ(payment_refunds.amount); reject if over
          → INSERT payment_refunds (+ CASH: WITHDRAWAL in currently OPEN session,
            linked via refund.cashMovementId ↔ movement.refundId)
  COMMIT   — concurrent refunds serialized by the row lock.

Void (admin correction, not a refund):
  Original payments row stays immutable; payment_voids row appended
  (originalPaymentId, reason, authorizedByUserId, timestamp).
  Voided CASH → compensating REVERSAL movement (negative, linked to original INCOME,
  payment, and void).
  Void after session closing → same rule: compensating movement in the CURRENTLY OPEN
  session of the same register; if none is open → void blocked until one is opened.
  Closed sessions are never modified.
  Payments with existing refunds CANNOT be voided until refunds are formally reconciled
  (reversing entries + manager sign-off) — no silent erasure of refund history.
```

## 3. Cash Opening & Closing Workflow

```
OPEN:
  Reception selects register → enters openingBalance → status=OPEN
  (partial unique index enforces one OPEN per register; concurrent open blocked)
  CASH payments bind to this session (sessionId validated at insert)

DURING DAY:
  INCOME (CASH payments) | EXPENSE | WITHDRAWAL | REVERSAL | ADJUSTMENT movements
  TPE: never in cash_movements

CLOSE (gated — all must pass):
  ✓ Every CASH payment on this register has session_id on a session of the same register
  ✓ Every cash_movements row has a session_id (no orphans)
  ✓ expected_balance = opening_balance + Σ(balance_effect)   where:
        INCOME +amount | EXPENSE/WITHDRAWAL −amount |
        REVERSAL = stored amount (negative) | ADJUSTMENT signed
    → Reception counts physical cash (countedBalance)
    → discrepancy = counted − expected → persisted, session CLOSED + immutable

Daily closing report (separate totals):
  Cash received / TPE received / cash expenses & withdrawals /
  refunds (CASH vs TPE) / expected drawer / counted drawer / discrepancy
  (TPE excluded from drawer equation)
```

## 4. Open Questions (do not invent answers)

- **Q23** — Overpayment/change business procedure (configurable via `payment_settings`; flag with reason only).
- **Q24** — TPE daily batch/settlement import (future; MVP manual only).
- **Q25** — Rounding tolerance threshold (MAD) before a discrepancy is flagged.
