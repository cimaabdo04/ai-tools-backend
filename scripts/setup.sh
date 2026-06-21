#!/usr/bin/env bash
set -euo pipefail

# ============================================
# AI Tools Directory - Setup Script for Linux/Mac
# ============================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step()  { echo -e "\n${GREEN}[✓]${NC} $1"; }
log_warn()  { echo -e "\n${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "\n${RED}[✗]${NC} $1"; }

echo "========================================"
echo "  AI Tools Directory - Setup"
echo "========================================"
echo "Project root: $PROJECT_ROOT"
echo ""

# ============================================
# Step 1: Check Prerequisites
# ============================================
log_step "Checking prerequisites..."

PREREQS_OK=true

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js: $NODE_VERSION"
    MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$MAJOR" -lt 20 ]; then
        log_error "Node.js 20+ required. Found $NODE_VERSION"
        PREREQS_OK=false
    fi
else
    log_error "Node.js is not installed. Install Node.js 20+ from https://nodejs.org"
    PREREQS_OK=false
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm: $NPM_VERSION"
else
    log_error "npm is not installed."
    PREREQS_OK=false
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "  PostgreSQL: $PSQL_VERSION"
else
    log_warn "PostgreSQL client not found. Make sure PostgreSQL is running."
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    REDIS_VERSION=$(redis-cli --version)
    echo "  Redis: $REDIS_VERSION"
else
    log_warn "Redis CLI not found. Redis needed for queues and caching."
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "  Docker: $DOCKER_VERSION"
else
    log_warn "Docker not found. Optional for containerized setup."
fi

if [ "$PREREQS_OK" = false ]; then
    log_error "Please fix the issues above and run this script again."
    exit 1
fi

echo -e "  ${GREEN}All required prerequisites met.${NC}"

# ============================================
# Step 2: Create .env file
# ============================================
log_step "Setting up environment variables..."

ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo "  Created .env from .env.example"
        log_warn "Please review and update .env with your configuration values."
    else
        log_error ".env.example not found at $ENV_EXAMPLE"
        exit 1
    fi
else
    echo "  .env file already exists, skipping..."
fi

# ============================================
# Step 3: Install backend dependencies
# ============================================
log_step "Installing backend dependencies..."

cd "$PROJECT_ROOT/backend"
npm install
echo "  Backend dependencies installed."

# ============================================
# Step 4: Install frontend dependencies
# ============================================
log_step "Installing frontend dependencies..."

cd "$PROJECT_ROOT/frontend"
npm install
echo "  Frontend dependencies installed."

# ============================================
# Step 5: Install root dependencies
# ============================================
log_step "Installing root dependencies..."

cd "$PROJECT_ROOT"
npm install
echo "  Root dependencies installed."

# ============================================
# Step 6: Generate Prisma Client
# ============================================
log_step "Generating Prisma client..."

cd "$PROJECT_ROOT/backend"
npx prisma generate
echo "  Prisma client generated successfully."

# ============================================
# Step 7: Run database migrations
# ============================================
log_step "Running database migrations..."

cd "$PROJECT_ROOT/backend"

if npx prisma migrate dev 2>/dev/null; then
    echo "  Database migrations applied successfully."
else
    log_warn "Migrations failed. Check PostgreSQL and DATABASE_URL in .env."
    echo "  Run manually: cd backend && npx prisma migrate dev"
    exit 1
fi

# ============================================
# Step 8: Seed the database
# ============================================
log_step "Seeding the database..."

cd "$PROJECT_ROOT/backend"

if npx prisma db seed 2>/dev/null; then
    echo "  Database seeded successfully."
else
    log_warn "Seeding failed. Run manually: cd backend && npx prisma db seed"
fi

# ============================================
# Completion
# ============================================
echo ""
echo "========================================"
echo -e "  ${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo "  Quick Start Commands:"
echo "  ------------------------------"
echo "  Start development:          npm run dev"
echo "  Start frontend only:        npm run dev:frontend"
echo "  Start backend only:         npm run dev:backend"
echo "  Run tests:                  npm test"
echo "  Lint code:                  npm run lint"
echo "  Build for production:       npm run build"
echo "  Open Prisma Studio:         npm run db:studio"
echo ""
echo "  Default Login Credentials (development only):"
echo "  ------------------------------"
echo "  Email:    superadmin@aitools.io"
echo "  Password: Password123!"
echo ""
echo "  Visit: http://localhost:3000"
echo "  API:   http://localhost:4000/api/v1"
echo "  Docs:  http://localhost:4000/api/docs"
echo ""
echo -e "  ${GREEN}Happy coding!${NC}"
