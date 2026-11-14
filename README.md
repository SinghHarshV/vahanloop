# VahanLoop – Peer-to-Peer Vehicle Rental Marketplace
**Version 0.2.0 – Phase 2: Database-Backed Architecture & Authentication**  
*Tagline: "Your vehicle. Your earnings. Your journey."*

---

## 1. Project Overview
**VahanLoop** is a modern, trust-first peer-to-peer mobility marketplace connecting individual and commercial vehicle partners who have underutilised cars, motorcycles, or scooters with customers seeking short-term rentals (self-drive or with a verified chauffeur).

In **Phase 2**, the prototype has been upgraded from a client-side localStorage prototype into a full **database-driven, API-backed full-stack web application** with PostgreSQL, Prisma ORM, JWT session authentication, server-side Role-Based Access Control (RBAC), and server-side pricing & conflict validation.

---

## 2. Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom mobility startup design system (Deep Slate Navy, Emerald accents, light background)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: Stateless HTTP-only JWT cookies (`jose`), password hashing via `bcryptjs`
- **Validation**: Zod schemas for all API payloads and queries
- **Dual-Mode Database Layer**: Auto-detects PostgreSQL with Prisma; transparently falls back to an in-memory relational store when running without Docker/PostgreSQL so the app works out of the box anywhere.
- **Icons**: Lucide React

---

## 3. Demo Accounts & Credentials

All demo accounts share the development demonstration password:
> **Password**: `Demo@123456`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Customer** | `customer@vahanloop.demo` | Search vehicles, request rentals, track bookings, simulate payment checkout |
| **Owner** | `owner@vahanloop.demo` | Register vehicles (pending review), manage fleet status, accept/decline rental requests, track simulated earnings |
| **Admin** | `admin@vahanloop.demo` | Review & approve/reject host vehicle submissions, platform audit metrics, supervise all bookings |

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Optional: Docker and Docker Compose (for local PostgreSQL container)

### Setup & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Database Options**:
   - **Option A (With Docker & PostgreSQL)**:
     ```bash
     docker compose up -d
     npx prisma migrate dev --name init
     node scripts/seed.mjs
     ```
   - **Option B (Zero-Config / Without Docker)**:
     The application includes a dual-mode database client. If PostgreSQL is not running, it automatically switches to an in-memory relational store pre-seeded with all 3 demo roles, 9 vehicles, and sample bookings.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Automated API Test Suite**:
   ```bash
   node scripts/test-api.mjs
   ```

---

## 5. API Reference

### Authentication
- `POST /api/auth/register` – Register customer or owner account (auto password hashing, duplicate check)
- `POST /api/auth/login` – Authenticate with email & password, sets HTTP-only `vahanloop_session` JWT cookie
- `POST /api/auth/logout` – Clear session cookie
- `GET /api/auth/me` – Current authenticated user session & permitted roles

### Vehicles
- `GET /api/vehicles` – Public search with query parameters (`category`, `location`, `rentalType`, `fuelType`, `transmission`, `maxPrice`, `q`)
- `POST /api/vehicles` – Create new vehicle listing (owner only, status: `PENDING`)
- `GET /api/vehicles/[id]` – Vehicle details (unapproved hidden from unauthorized users)
- `PATCH /api/vehicles/[id]` – Update vehicle or toggle availability (`AVAILABLE` / `INACTIVE`)
- `DELETE /api/vehicles/[id]` – Delete/deactivate vehicle

### Admin Management
- `GET /api/admin/dashboard` – High-level KPI metrics and recent audit events
- `GET /api/admin/users` – User accounts ledger (passwords excluded)
- `GET /api/admin/vehicles` – All vehicles across all statuses
- `POST /api/admin/vehicles/[id]/approve` – Approve listing and publish to search
- `POST /api/admin/vehicles/[id]/reject` – Reject listing with reason
- `GET /api/admin/bookings` – All marketplace bookings
- `GET /api/admin/transactions` – All platform payment records
- `POST /api/admin/reset` – Factory restore demo store to seed data

### Bookings & Lifecycle
- `POST /api/bookings` – Submit reservation (server-side pricing, overlap detection transaction)
- `GET /api/bookings` – Fetch bookings (filtered by role)
- `GET /api/bookings/[id]` – Booking details with access control
- `POST /api/bookings/[id]/accept` – Host accepts reservation (`AWAITING_PAYMENT`)
- `POST /api/bookings/[id]/reject` – Host declines reservation with reason
- `POST /api/bookings/[id]/cancel` – Customer or Admin cancels booking
- `POST /api/bookings/[id]/simulate-payment` – Customer completes payment (`CONFIRMED`, generates `TXN-VL-...`)

### Owner Portal
- `GET /api/owner/dashboard` – Fleet overview metrics & pending requests
- `GET /api/owner/vehicles` – Owner's registered vehicles
- `GET /api/owner/bookings` – Rental requests for owner's fleet
- `GET /api/owner/earnings` – Payout breakdown & settlements ledger

---

## 6. Architecture & Security Highlights
- **Strict Server-Side Pricing**: Total amount, platform commission (10%), and security deposits (Car: ₹2,000, Bike: ₹1,500, Scooter: ₹1,000) are computed exclusively on the server.
- **Date Overlap Detection**: Enforced inside atomic transactions to prevent double-booking of vehicles.
- **HTTP-Only Cookies**: JWT tokens are transmitted via `httpOnly`, `sameSite: lax` cookies preventing XSS token theft.
- **Role-Based Protection**: Non-administrators cannot access admin endpoints or approve listings; owners can only manage their own vehicles and requests.
- **Graceful Fallback**: Transparent dual-mode DB client allows seamless development whether PostgreSQL is connected or not.
