# AI Tools Directory

A bilingual (Arabic/English) AI tools directory platform built with Next.js and NestJS.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, next-intl, Framer Motion
- **Backend**: NestJS, Prisma (PostgreSQL), Throttler, Helmet
- **Infrastructure**: Docker, nginx, Let's Encrypt SSL

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Docker for the DB)

### Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Environment variables
cp .env.example .env
# Edit .env with your values (generate secrets with: openssl rand -base64 64)

# 3. Database (PostgreSQL)
# Make sure PostgreSQL is running, then:
cd backend
npx prisma migrate dev
npx prisma db seed

# 4. Run development servers
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Seed Data

The seed script creates test accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | TestPass123! |
| Admin | admin@example.com | TestPass123! |
| User | user1@example.com | TestPass123! |
| Vendor | vendor@example.com | TestPass123! |

**Warning**: Change these credentials and use a strong password in production.

## Docker Deployment

```bash
# Build and start
docker compose -f docker/docker-compose.yml up --build

# Production
docker compose -f docker/docker-compose.prod.yml up --build
```

### Production Checklist

Before deploying to production:

1. **Generate strong secrets**: `openssl rand -base64 64` for JWT_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET
2. **Set NODE_ENV=production** and **ENABLE_SWAGGER=false**
3. **Update CORS_ORIGINS** to your production domain
4. **Configure SSL certificates** in `docker/nginx.conf`
5. **Replace domain placeholders** in `docker/nginx.conf` (search for `yourdomain.com`)
6. **Run `npm audit`** and fix any vulnerabilities
7. **Set up monitoring** (Sentry, error tracking)
8. **Configure backup strategy** for PostgreSQL database

## Security Features

- Content Security Policy (CSP) on frontend and backend
- Helmet security headers
- XSS protection via DOMPurify on all user-rendered HTML
- Rate limiting (global + endpoint-specific)
- JWT authentication with guards
- File upload validation (type, size, path traversal)
- Mass assignment protection (whitelist validation)
- CSRF-safe (OAuth uses hash fragments)
- Console log stripping in production (except error/warn)

## Project Structure

```
ai-tools-directory/
├── backend/           # NestJS API server
│   ├── prisma/        # Schema, migrations, seed
│   └── src/           # API source code
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/# UI components
│   │   └── lib/       # Utilities, hooks, constants
│   └── public/        # Static assets
├── docker/            # Docker & nginx configs
└── .env.example       # Environment variables template
```
