# VahanLoop – Peer-to-Peer Vehicle Rental Marketplace
**Version 0.5.0 – Phase 5: Fleet Operations, Owner Verification, Driver Management & Compliance Readiness**  
*Tagline: "Your vehicle. Your earnings. Your journey."*

---

## 1. Project Overview
**VahanLoop** is an Indian mobility marketplace connecting private vehicle owners and commercial fleet operators with customers seeking flexible short-term rentals (self-drive and chauffeur-driven cars, bikes, and scooters).

In **Phase 5**, VahanLoop has deployed the complete operational infrastructure required for a controlled city-level pilot:
1. **Multi-Step Partner Onboarding**: Dedicated workflows for Individual Hosts and Commercial Fleet Operators with KYC reference validation, bank payout verification, and versioned host terms.
2. **Owner & Business Verification Workflow**: Complete administrative review lifecycle (`NOT_STARTED` → `IN_PROGRESS` → `SUBMITTED` → `UNDER_REVIEW` → `VERIFIED` / `REJECTED` / `SUSPENDED`) with self-approval conflict-of-interest prevention and mandatory recorded reasons.
3. **Multi-Depot Fleet Management**: Multi-vehicle roster, hub location assignment (e.g. Indiranagar Central Hub, Kempegowda Airport Depot), operational maintenance blocks, and utilization tracking.
4. **Professional Driver Management**: Dedicated driver profiles with commercial license validation (`LMV-TR`, `HMV`), real-time duty toggle (`AVAILABLE`, `ON_DUTY`, `UNAVAILABLE`), and anti-conflict scheduling preventing overlapping chauffeur bookings.
5. **Configurable Compliance & Vehicle Eligibility Engine**: Real-time evaluation of Indian transport regulations, state schemes (*Rent a Cab Scheme 1989*, *Rent a Motorcycle Scheme 1997*), required permits (`RENT_A_CAB`, `ALL_INDIA_TOURIST_PERMIT`), and valid insurance policies.
6. **Central Document Expiry Monitor**: Proactive notification thresholds (30, 15, 7, and 0 days remaining) for vehicle RC, commercial insurance, PUC, and driver licenses.
7. **Rental Telemetry & Operations Desk**: Checkpoints for vehicle handover and return recording verified odometer readings, fuel/battery charge %, physical condition ratings, and formal damage dispute escalation.
8. **Emergency & Road Safety Desk**: Incident triage system for breakdowns, road collisions, suspected theft, late returns, and driver misconduct with safety helpline guidance.
9. **Support Ticket Desk**: Customer and host ticketing system with role-based conversation messaging and resolution notes.
10. **Administrative Operations Hub**: Centralized command center providing tabs for KYC Verifications, Fleet Operations, Driver Roster, Compliance Engine Rules & Versions, Expiry Alerts, Safety Incidents, and Audit Logs.

---

## 2. Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode, 0 errors across all 64 routes)
- **Styling**: Tailwind CSS with custom navy (`#10243A`) & emerald (`#15966B`) brand identity, Manrope & Inter typography
- **Database & ORM**: PostgreSQL with Prisma ORM (v5.22.0) and zero-downtime dual-mode in-memory fallback
- **Authentication**: Stateless HTTP-only JWT cookies (`jose`), password hashing via `bcryptjs`
- **Validation**: Zod schemas & binary magic-byte stream validation

---

## 3. Demo Accounts & Credentials

All demo accounts share the development demonstration password:
> **Password**: `Demo@123456`

| Role | Email | Key Capabilities |
| :--- | :--- | :--- |
| **Customer** | `customer@vahanloop.demo` | Search vehicles, request rentals, test checkout & payment, raise support tickets, file journey incidents |
| **Owner** | `owner@vahanloop.demo` | Partner onboarding & KYC, multi-depot fleet management, driver dispatch, maintenance blocks, view earnings |
| **Driver** | `ramesh.driver@vahanloop.demo` | Toggle duty availability, review assigned chauffeur trips, log starting/ending odometer readings |
| **Admin** | `admin@vahanloop.demo` | Operations hub, approve/reject host applications, configure state compliance rules, inspect incidents, manage support tickets |

---

## 4. Key Route Directory

### Customer & General
- `/` – Marketplace homepage with curved hero & floating search bar
- `/explore` – Fleet catalog with real-time filters and sorting
- `/vehicles/[id]` – Vehicle detail page with specs and booking modal
- `/bookings` – Customer reservation ledger with trip status and receipts
- `/support` – Customer & host support ticket desk
- `/incidents` – 24/7 Road safety and incident reporting desk

### Host & Fleet Operations
- `/owner` – Host executive overview dashboard
- `/owner/onboarding` – 5-step partner KYC and bank payout setup
- `/owner/fleet` – Multi-vehicle fleet roster and maintenance management
- `/owner/fleet/locations` – Operational depot and handover hub manager
- `/owner/drivers` – Driver roster and chauffeur trip dispatch
- `/owner/add-vehicle` – Multi-step vehicle onboarding
- `/owner/requests` – Booking request approval and rejection flow
- `/owner/earnings` – Gross and net payout ledger
- `/owner/documents` – Confidential document safe
- `/owner/inspections` – Handover and return inspection logs

### Driver Portal
- `/driver` – Mobile-responsive driver cockpit with live duty toggle, assigned trips, and odometer logging

### Platform Operations & Administration
- `/admin` – Executive administration console
- `/admin/operations` – Unified Operations, KYC Verification, Compliance Rules, Expiry, Incidents & Audit Desk
- `/admin/vehicles` – Vehicle listing approval queue
- `/admin/documents` – Document verification and vehicle eligibility check
- `/admin/bookings` – Platform reservation ledger
- `/admin/payments` – Test payment transaction and refund ledger

---

## 5. Automated Tests

Run the full automated test suite:
```bash
npm test
```

Or run phase-specific unit tests:
```bash
# Phase 3 core engine tests (15 unit tests)
npm run test:phase3

# Phase 5 fleet, compliance, driver & security tests (26 unit tests)
npm run test:phase5
```

All 26 Phase 5 automated tests validate:
1. Individual owner application initialized with step 1
2. Commercial business owner registration stores corporate PAN and GSTIN
3. Onboarding application moves to SUBMITTED upon completion of step 5
4. Admin can reject application with documented reason for resubmission
5. Operational fleet depot created and attached to fleet organisation
6. Multiple vehicles managed under single commercial fleet organisation
7. Commercial chauffeur profile registered with LMV-TR transport badge
8. Driver commercial license verification confirmed
9. Driver availability transitions dynamically to ON_DUTY
10. Qualified driver assigned to chauffeur trip
11. Overlapping trip assignment correctly blocked by driver conflict check
12. Distinct compliance policies mapped for Self-Drive vs Chauffeur rentals
13. Expired mandatory document disqualifies vehicle from booking eligibility
14. Missing insurance blocks booking eligibility
15. Platform listing approval alone does not confer legal rental eligibility without verified transport docs
16. Compliance rule updates record incremented version and administrative audit entry
17. Handover recorded telemetry and transitioned booking to ACTIVE
18. Return inspection reconciled and booking marked COMPLETED
19. High-priority breakdown incident logged with emergency dispatch status
20. Support ticket opened with initial message thread
21. Administrative decisions require mandatory documented reason in audit trail
22. Multi-tenant fleet isolation enforces strict organisation boundary
23. Drivers restricted exclusively to their assigned trips
24. Private compliance vault prohibits direct customer document access
25. Support agents prevented from altering ledger and financial payment records
26. Conflict-of-interest check blocks administrators from approving their own onboarding application

---

## 6. Known Pilot Limitations & Non-Production Disclaimers
1. **Identity & KYC Services**: Aadhaar numbers and biometric records are not collected during prototype development. Identity verification tokens are synthetic representations simulating regulated identity providers.
2. **Banking & Payouts**: Bank IFSC routing and account holder checks are simulated for sandbox development. Live payout integration requires approval from regulated payment aggregators.
3. **Regulatory Schemes**: Compliance rules represent operational models based on Indian transport statutes (*Motor Vehicles Act 1988*, *Rent a Cab Scheme 1989*, *Rent a Motorcycle Scheme 1997*). Internal compliance evaluation does not constitute government transport authority certification.
4. **Emergency Services**: Incident reporting routes issues to the platform operational desk. Life-threatening emergencies must always be reported directly to national authorities (112 / 108).
