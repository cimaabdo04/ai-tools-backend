# Deployment Guide

## Prerequisites

### Required Software
- **Node.js** >= 20.x (LTS)
- **npm** >= 10.x
- **Docker** >= 24.x with Docker Compose v2
- **Git**
- **PostgreSQL** >= 16 (for local development)
- **Redis** >= 7 (for local development)

### Required Accounts
- **GitHub** account with repository access
- **GitHub Container Registry** (ghcr.io) access
- **Stripe** account (for payments)
- **SMTP provider** (for emails)
- **Domain name** with DNS configured
- **Cloudflare** or DNS provider for SSL

### Domain DNS Setup
```
A   aitoolsdirectory.com        <SERVER_IP>
A   api.aitoolsdirectory.com    <SERVER_IP>
```

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ai-tools-directory.git
cd ai-tools-directory
```

### 2. Configure Environment Variables

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Key variables to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/ai_tools_db` |
| `JWT_SECRET` | JWT signing secret (generate with `openssl rand -base64 32`) | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_live_`) | - |
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `REDIS_PASSWORD` | Redis password | - |
| `CORS_ORIGIN` | Allowed CORS origin | `https://aitoolsdirectory.com` |

### 3. Generate Secrets

```bash
# Generate strong secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 32  # Cookie secret
openssl rand -base64 32  # Encryption key
```

## Docker Deployment

### Production Deployment with Docker Compose

#### 1. Prepare Production Configuration

```bash
# Create SSL directory (will be populated by certbot)
mkdir -p docker/ssl

# Copy production compose file
cp docker/docker-compose.prod.yml docker-compose.prod.yml

# Set up environment
vi .env  # Configure all production environment variables
```

#### 2. Build and Start Services

```bash
# Build all images
docker compose -f docker-compose.prod.yml build

# Start services (initial run)
docker compose -f docker-compose.prod.yml up -d

# Run database migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed the database
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

#### 3. SSL Certificates (First Time)

```bash
# Run certbot manually for first-time SSL setup
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d aitoolsdirectory.com \
  -d api.aitoolsdirectory.com \
  --email admin@aitoolsdirectory.com \
  --agree-tos \
  --non-interactive

# Reload nginx to pick up certificates
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

#### 4. Monitoring and Maintenance

```bash
# View logs
docker compose logs -f backend
docker compose logs -f nginx

# Check service health
curl https://api.aitoolsdirectory.com/api/v1/health

# Restart a service
docker compose restart backend

# Update to latest images
docker compose pull
docker compose up -d --remove-orphans

# Clean up unused images
docker image prune -f

# Database backup
docker compose exec postgres pg_dump -U postgres ai_tools_db > backup_$(date +%Y%m%d).sql

# Database restore
cat backup.sql | docker compose exec -T postgres psql -U postgres ai_tools_db
```

### Docker Compose File Reference

The production compose file (`docker/docker-compose.prod.yml`) includes:

- **postgres** - PostgreSQL 16 with health checks, resource limits, and persistent volumes
- **redis** - Redis 7 with persistence, password protection, and LRU eviction
- **backend** - NestJS API server with auto-migration and health endpoint
- **frontend** - Next.js static site with API proxy configuration
- **nginx** - Reverse proxy with SSL termination, HTTP/2, rate limiting, caching
- **certbot** - Automatic SSL certificate renewal every 12 hours

All services include:
- Resource limits (CPU/memory)
- Health checks
- Restart policies
- Security options (no-new-privileges)
- Logging with rotation (10MB max, 3 files)
- Internal network isolation

## Manual Deployment (Without Docker)

### Backend Setup

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod
```

### Frontend Setup

```bash
cd frontend
npm ci
npm run build
npm run start
```

### Process Management with PM2

```bash
npm install -g pm2

# Backend
pm2 start dist/main.js --name ai-tools-backend -i max

# Frontend
pm2 start node_modules/.bin/next --name ai-tools-frontend -- start -p 3000

# Save process list
pm2 save
pm2 startup
```

## Database Migrations

### Creating Migrations

```bash
cd backend
npx prisma migrate dev --name description_of_change
```

### Applying Migrations (Production)

```bash
cd backend
npx prisma migrate deploy
```

### Resetting Database (Development Only)

```bash
cd backend
npx prisma migrate reset --force
npx prisma db seed
```

### Seeding Data

```bash
cd backend
npx prisma db seed
```

This runs `ts-node prisma/seed.ts` which populates:
- 25 users (admins + regular)
- 15 categories with subcategories
- 80+ tags
- 50 AI tools with realistic data
- 100+ reviews with varied ratings
- 50+ bookmarks
- 10 collections
- 5 pricing plans
- Sponsored and featured listings
- Notifications and system settings

## SSL Setup

### Using Certbot (Let's Encrypt) with Docker

The production compose includes a certbot container for automatic renewal. For initial setup:

```bash
# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Run certbot in standalone mode
docker compose -f docker-compose.prod.yml run --rm --service-ports certbot certonly \
  --standalone \
  -d aitoolsdirectory.com \
  -d api.aitoolsdirectory.com \
  --email admin@aitoolsdirectory.com \
  --agree-tos \
  --non-interactive

# Restart nginx
docker compose -f docker-compose.prod.yml start nginx
```

### Manual SSL (Alternative)

```bash
# Install certbot
sudo apt install certbot

# Obtain certificates
sudo certbot certonly --standalone \
  -d aitoolsdirectory.com \
  -d api.aitoolsdirectory.com \
  --email admin@aitoolsdirectory.com \
  --agree-tos

# Copy to docker SSL directory
sudo cp -L /etc/letsencrypt/live/aitoolsdirectory.com/fullchain.pem docker/ssl/
sudo cp -L /etc/letsencrypt/live/aitoolsdirectory.com/privkey.pem docker/ssl/

# Set up auto-renewal
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet && docker compose -f /opt/ai-tools-directory/docker-compose.prod.yml exec nginx nginx -s reload
```

## Monitoring

### Health Checks

The platform exposes health endpoints:
- `/api/v1/health` - Basic health check
- `/api/v1/health/live` - Liveness probe
- `/api/v1/health/ready` - Readiness probe (checks DB + Redis)

### Logging

```bash
# Application logs
docker compose logs -f --tail=100 backend

# Nginx access logs
docker compose exec nginx tail -f /var/log/nginx/access.log

# Nginx error logs
docker compose exec nginx tail -f /var/log/nginx/error.log
```

### Error Tracking (Sentry)

Configure Sentry DSN in `.env`:
```
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Performance Monitoring

- **Database**: Use `pg_stat_statements` for query performance
- **Redis**: Use `redis-cli info` for cache hit rates
- **Server**: Use `htop`, `docker stats`, `netstat` for system resources

## Backup Strategies

### Automated Daily Backups

Add to crontab:

```bash
# Database backup
0 2 * * * docker compose -f /opt/ai-tools-directory/docker-compose.prod.yml exec -T postgres pg_dump -U postgres ai_tools_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep 30 days of backups
0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
0 4 * * * aws s3 sync /backups s3://ai-tools-backups/
```

### Backup Verification

```bash
# Test a backup
gunzip -c /backups/db_20260101.sql.gz | docker compose exec -T postgres psql -U postgres ai_tools_db_test
```

### Disaster Recovery

1. Provision new server with Docker and dependencies
2. Copy `.env` and `docker-compose.prod.yml`
3. Restore latest database backup
4. Pull and start Docker containers
5. Run health checks
6. Update DNS to point to new server IP

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### CI Pipeline (`.github/workflows/ci.yml`)

Triggers on push to `main` and pull requests:

1. **Lint** - ESLint on frontend and backend
2. **Test** - Unit tests and E2E tests with PostgreSQL service container
3. **Build** - Production builds for both frontend and backend

### Deployment Pipeline (`.github/workflows/deploy.yml`)

Triggers on push to `main`:

1. **Build & Push** - Build Docker images and push to GitHub Container Registry
2. **Deploy** - SCP compose files to server, SSH to run deployment commands
3. **Health Check** - Verify API health endpoint after deployment

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Server SSH hostname |
| `DEPLOY_USER` | Server SSH username |
| `DEPLOY_SSH_KEY` | Server SSH private key |
| `DEPLOY_PORT` | SSH port (default 22) |
| `DATABASE_URL` | Production database URL |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `SMTP_HOST` | SMTP server |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `REDIS_PASSWORD` | Redis password |
