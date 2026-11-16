# VahanLoop – Peer-to-Peer Vehicle Rental Marketplace
**Version 0.3.0 – Phase 3: Production-Oriented Booking Engine, Payment Integration & Secure Document Management**  
*Tagline: "Your vehicle. Your earnings. Your journey."*

---

## 1. Project Overview
**VahanLoop** is an Indian mobility marketplace connecting private & commercial fleet owners who have underutilized cars, motorcycles, or scooters with verified customers seeking short-term rentals (self-drive or with a verified chauffeur).

In **Phase 3**, the system has been strengthened with:
1. **A Reliable Booking Engine**: Full lifecycle tracking (`REQUESTED` → `ACCEPTED` / `AWAITING_PAYMENT` → `CONFIRMED` → `ACTIVE` → `COMPLETED` / `EXPIRED`), a centralized pricing engine calculating in integer paise with zero floating-point error, and half-open time interval double-booking prevention.
2. **Reservation Expiry Engine**: Automatic 15-minute reservation hold release when payment is not completed in time.
3. **Payment Gateway Abstraction**: Pluggable `MockPaymentProvider` and `RazorpayTestProvider` with server-side signature validation, idempotent webhook event deduplication, and immutable refund logging.
4. **Secure Vehicle Document Management**: Isolated private storage (outside public folders), OWASP-compliant magic byte and extension allowlist verification, signed temporary URLs, and complete audit logging.
5. **Vehicle Eligibility Engine**: Multi-point automated compliance checklist (RC, Insurance, PUC, Owner verification) preventing unverified vehicles from being published.
6. **Handover & Return Inspections**: Verifiable odometer, fuel percentage, and condition check records before and after rentals.

---

## 2. Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database & ORM**: PostgreSQL with Prisma ORM (v5.22.0)
- **Payment Providers**: Razorpay SDK (Test Mode) & MockPaymentProvider
- **Authentication**: Stateless HTTP-only JWT cookies (`jose`), password hashing via `bcryptjs`
- **Validation**: Zod schemas & binary magic-byte stream validation

---

## 3. Demo Accounts & Credentials

All demo accounts share the development demonstration password:
> **Password**: `Demo@123456`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Customer** | `customer@vahanloop.demo` | Search vehicles, request rentals, track bookings, test checkout & payment |
| **Owner** | `owner@vahanloop.demo` | Register fleet, accept/decline rental requests (with 15m hold), upload compliance documents, submit vehicle inspections |
| **Admin** | `admin@vahanloop.demo` | Supervise reservations, verify compliance documents, inspect transactions, issue test refunds, platform audits |

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ or 20+

### Setup & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Run Automated Unit Tests**:
   ```bash
   node scripts/test-phase3.mjs
   ```

4. **Run Next.js Production Build**:
   ```bash
   npm run build
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Phase 3 API Reference

### Booking & Availability
- `POST /api/bookings` – Submit rental request with server-side pricing and half-open collision validation
- `POST /api/bookings/[id]/accept` – Host accepts request; sets 15-minute temporary reservation hold (`AWAITING_PAYMENT`)
- `POST /api/bookings/[id]/reject` – Host declines request with reason
- `POST /api/bookings/[id]/cancel` – Customer or host cancels booking
- `POST /api/pricing/quote` – Centralized immutable pricing quote in integer paise

### Payment Gateway (Test Mode)
- `POST /api/bookings/[id]/create-payment-order` – Generates provider payment order
- `POST /api/bookings/[id]/verify-payment` – Verifies cryptographic signature before setting booking to `CONFIRMED`
- `POST /api/payments/webhook` – Idempotent Razorpay test webhook listener with HMAC signature verification
- `GET /api/admin/refunds` – List refund transactions
- `POST /api/admin/refunds` – Issue test refund without altering original payment records

### Secure Document Management
- `POST /api/documents/upload` – Upload vehicle documents to private storage (OWASP magic-byte verified)
- `GET /api/documents/download/[fileKey]` – Secure download with short-lived HMAC-signed URLs and access checks
- `POST /api/documents/[id]/review` – Administrative document approval/rejection with mandatory audit logging

### Eligibility & Inspections
- `GET /api/vehicles/[id]/eligibility` – Multi-point vehicle publication compliance check
- `GET /api/inspections?bookingId=...` – Fetch handover & return inspection records
- `POST /api/inspections` – Record odometer, fuel level, and condition before/after trips
- `GET /api/notifications` – Fetch in-app user notifications

---

## 6. Financial & Security Restriction Notice
- **All financial transactions operate strictly in test mode.**
- Live credit cards, real bank transfers, and live Razorpay keys (`rzp_live_...`) are rejected by runtime safety checks.
- Confidential vehicle documents are stored in an isolated private directory outside the public web root.
