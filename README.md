# FashionWholesale Corp — B2B Portal

A production-ready full-stack wholesale clothing portal built with Next.js 14, Prisma, and NextAuth.

---

## Architecture

```
Browser
   │
   ▼
┌─────────────────────────────┐
│      Nginx (Load Balancer)  │  ← Rate limiting, gzip, SSL termination
│   nginx.conf (10 req/s/IP)  │
└──────┬──────────────────────┘
       │  (round-robin / least-conn)
   ┌───┴───────────────────────┐
   │  App Server 1 :3000       │
   │  App Server 2 :3000       │  ← Next.js 14 (App Router) + Node.js
   │  App Server 3 :3000       │
   └───────────────┬───────────┘
                   │  (Prisma ORM)
         ┌─────────▼──────────┐
         │     PostgreSQL      │  ← Persistent volume, dev uses SQLite
         │   (docker volume)   │
         └────────────────────┘
```

---

## Local Development

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd fashion-wholesale
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Set up the database
npx prisma migrate dev --name init

# 4. Seed demo data
npm run db:seed

# 5. Start dev server
npm run dev
```

Open http://localhost:3000

---

## Demo Accounts

| Role  | Email                          | Password   |
|-------|-------------------------------|------------|
| Admin | admin@fashionwholesale.com    | demo1234   |
| Buyer | buyer@fashionwholesale.com    | demo1234   |

---

## Environment Variables

| Variable          | Description                          | Required |
|-------------------|--------------------------------------|----------|
| DATABASE_URL      | Prisma database connection string    | Yes      |
| NEXTAUTH_SECRET   | Random secret for JWT signing        | Yes      |
| NEXTAUTH_URL      | Public app URL (incl. protocol)      | Yes      |

Generate a secret: `openssl rand -base64 32`

---

## Database Seeding

The seed script creates:
- 2 demo accounts (admin + buyer)
- 3 buyer accounts with realistic company data
- 40+ clothing products across 4 categories
- 28 orders spread over the last 60 days

```bash
# Seed only
npm run db:seed

# Full reset + seed
npm run db:reset
```

---

## Docker

### Build & run with Docker Compose (includes PostgreSQL):

```bash
# Copy and configure env
cp .env.example .env

# Build and start
docker compose -f docker/docker-compose.yml up --build -d

# Run migrations
docker exec fashionwholesale_app npx prisma migrate deploy
```

### Build image manually:

```bash
docker build -f docker/Dockerfile -t fashionwholesale:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  fashionwholesale:latest
```

---

## CI/CD

Push to `main` triggers the GitHub Actions pipeline at `.github/workflows/deploy.yml`:

1. **Lint & type-check** — ESLint + TypeScript
2. **Next.js build** — confirms the app compiles
3. **Docker build & push** — tagged with Git SHA and `latest`
4. **SSH deploy** — pulls image, migrates DB, restarts container

### Required GitHub Secrets

| Secret            | Value                             |
|-------------------|-----------------------------------|
| DOCKER_USERNAME   | Docker Hub username               |
| DOCKER_PASSWORD   | Docker Hub access token           |
| SERVER_HOST       | Production server IP / hostname   |
| SERVER_USER       | SSH username (e.g. ubuntu)        |
| SERVER_SSH_KEY    | Private SSH key (PEM)             |
| NEXTAUTH_SECRET   | Production NextAuth secret        |
| DATABASE_URL      | Production PostgreSQL URL         |

---

## API Reference

| Endpoint                  | Methods              | Description                    |
|---------------------------|----------------------|--------------------------------|
| /api/health               | GET                  | Health check for load balancer |
| /api/products             | GET, POST, PUT, DELETE | Product CRUD                 |
| /api/orders               | GET, POST            | List / create orders           |
| /api/orders/[id]          | GET, PATCH           | Get single / update status     |
| /api/customers            | GET                  | List buyers (admin)            |
| /api/customers/[id]       | GET                  | Buyer profile + order history  |
| /api/dashboard/stats      | GET                  | KPIs and chart data            |
| /api/inventory/import     | POST                 | CSV bulk import                |

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** with custom design tokens
- **Prisma ORM** + SQLite (dev) / PostgreSQL (prod)
- **NextAuth.js** — JWT sessions, role-based access
- **Recharts** — line, bar, and donut charts
- **Framer Motion** — page and card animations
- **Zod** — schema validation on forms and APIs
- **Lucide React** — icon library
