# Unresolved Business Requirements

> Questions that must be answered **before** implementing the corresponding module.
> Do not guess — ask the business. Each item blocks specific work.

| # | Question | Blocks | Notes / Options |
|---|---|---|---|
| Q1 | What is the exact **Practitioner** role scope? | Users/Permissions, Employees | Do not implement until the business confirms. Is a practitioner a system user? Can they see other clients' files? Agenda visibility? |
| Q2 | Is an appointment **strictly multi-service**? Can the mix be edited after creation? | Appointments | Confirmed: "may contain multiple services, subject to confirmation". Need: max number, ordering, who can edit, price impact. |
| Q3 | **Appointment statuses** lifecycle | Appointments, Reports | Proposed: SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED / NO_SHOW. Confirm who can move each state and whether cancellation frees the slot. |
| Q4 | **Scheduling constraints** | Appointments | Working hours? Slot granularity (15/30 min)? Same employee overlap rule? Holidays/weekends? Max advance booking? |
| Q5 | **Packages & subscriptions** semantics | Packages, Sessions | What is a "session"? Does one session = one service event? Can a package mix services? Expiry, transfer, refund, partial use? |
| Q6 | **Cash management** model | Cash, Payments | One register or several? Opening/closing procedure? Who can close? Expense categories? Difference vs payments? |
| Q7 | **Payments vs Sales vs Invoices** flow | Sales, Payments, Invoices | When is a sale created vs an invoice? Can a service be paid without an invoice? Partial payments? Refunds? |
| Q8 | **Invoice numbering & VAT** | Invoices | Sequential numbering rule (per year?). VAT rate(s)? Legal mentions required in Morocco? Credit notes? |
| Q9 | **Client form codes** | Clients | Exact civility list? Account number format? Barcode symbology (Code128?)? Acquisition source values? Communication preferences values? |
| Q10 | **Auth strategy** | Auth, Security | Session cookie vs JWT? MFA? Password policy? Session timeout? Concurrent logins? |
| Q11 | **Audit retention** | Audit Logs | How long to keep audit logs and financial history? Who can export them? (Legal requirement in Morocco?) |
| Q12 | **Reports** list & definitions | Reports | Which KPIs: revenue, occupancy, packages sold, no-shows, cash variance? Daily/weekly/monthly? Export format (PDF/Excel)? |
| Q13 | **Employees vs Users** | Employees, Users | Is every employee a user? Link employee ↔ user (1:1 optional)? Specialty/qualification tracking? |
| Q14 | **Language & locale** | All UI | UI language: French only, or French + Arabic? Currency display (MAD)? Date/time format (Africa/Casablanca)? |
| Q15 | **Data retention / privacy** | Clients, Audit | Legal basis for keeping client data (Moroccan CNDP / law 09-08)? Consent capture? Right to erasure vs financial retention conflict? |
| Q16 | **Multi-branch / multi-register** | Cash, Reports | Single site in MVP? If multi-site, appointments/cash/reports per site? |
| Q17 | **Easybel migration** | Clients, Catalog | Data export from Easybel available (CSV)? ID mapping for historical payments/invoices? Cut-over date? |
| Q18 | **Printing** | Invoices, Payments | Receipt/invoice templates (logo, layout, barcode)? Printer type (thermal A5/A4)? |
| Q23 | **Overpayment / change procedure** | Payments, Cash | What does Reception do when actual > expected (change)? Configurable via `payment_settings`; until confirmed, flag with reason only — never auto-refund. |
| Q24 | **TPE batch / settlement** | Payments, Reports | Is there a daily TPE batch/settlement file to import later? MVP: manual `terminalRef` only. |
| Q25 | **Rounding tolerance** | Payments, Cash | Threshold (MAD) before a discrepancy is flagged (configurable via `payment_settings`). |

> **Rule**: Until a Q is answered, the corresponding business rule is **not implemented**. The DB schema may include the field, but logic waits for the answer.
