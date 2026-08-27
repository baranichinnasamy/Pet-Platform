# Architecture Overview

## Design Philosophy

This platform uses a **modular monolith** architecture — suitable for academic projects and early production, with clear module boundaries that can be extracted into microservices later under high load.

## Core Modules

### Phase 1 (Current)
- **Auth** — Registration, login, JWT tokens, RBAC
- **User** — Profiles, addresses, multi-role support
- **Pet** — Central entity linking all modules
- **Admin** — Dashboard, user management, listing approval

### Phase 2 — Auction
- Pet listings (DIRECT_SALE / AUCTION)
- Bid validation with PostgreSQL row locking
- Socket.IO real-time updates per auction room
- Winner selection and ownership transfer

### Phase 3 — Marketplace
- Product catalogue, cart, checkout
- Order management with price snapshots
- Inventory tracking

### Phase 4 — Hospitality
- Service provider profiles
- Availability management
- Booking engine with double-booking prevention

### Phase 5 — Vaccination
- Health records with RBAC document access
- BullMQ scheduled reminder jobs
- Status calculation (UP_TO_DATE, DUE_SOON, OVERDUE)

## Data Flow: Pet Lifecycle

```
Pet Registration
      ↓
Health & Vaccination Records
      ↓
Pet Sale / Auction
      ↓
Ownership Transfer (pet_owners history preserved)
      ↓
New Owner continues: Essentials, Services, Vaccinations
```

## Security

- Argon2 password hashing
- JWT access + refresh token rotation
- Helmet security headers
- Rate limiting (200 req / 15 min)
- Role-based middleware on all protected routes
- Health documents via signed S3 URLs (Phase 5)

## Real-Time Auction (Phase 2)

```
Buyer → POST /api/auctions/:id/bids
              ↓
        PostgreSQL FOR UPDATE lock
              ↓
        Redis state sync
              ↓
        io.to("auction:{id}").emit("new_bid")
```

## Deployment Target

| Component | Service |
|-----------|---------|
| Frontend | Vercel / AWS |
| Backend | AWS EC2 / ECS |
| Database | AWS RDS PostgreSQL |
| Cache | AWS ElastiCache Redis |
| Storage | AWS S3 |
| CI/CD | GitHub Actions |
| Containers | Docker |
