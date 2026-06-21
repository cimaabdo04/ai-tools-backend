<#
.SYNOPSIS
    AI Tools Directory - Setup Script for Windows (PowerShell)
.DESCRIPTION
    This script checks prerequisites, installs dependencies, generates Prisma client,
    runs migrations, seeds the database, and creates the .env file.
.NOTES
    Run this script from the project root directory.
    Requires PowerShell 5.1 or later.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$([char]0x2714)] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "`n[$([char]0x26A0)] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "`n[$([char]0x2718)] $Message" -ForegroundColor $Red
}

Write-Host "========================================" -ForegroundColor $Green
Write-Host "  AI Tools Directory - Setup" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host "Project root: $ProjectRoot`n"

# ============================================
# Step 1: Check Prerequisites
# ============================================
Write-Step "Checking prerequisites..."

$prereqsOk = $true

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion"
    $majorVersion = [int]($nodeVersion -replace '[v.]', '').Substring(0, 2)
    if ($majorVersion -lt 20) {
        Write-Error "Node.js 20+ is required. Found $nodeVersion"
        $prereqsOk = $false
    }
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 20+ from https://nodejs.org"
    $prereqsOk = $false
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "  npm: $npmVersion"
} catch {
    Write-Error "npm is not installed."
    $prereqsOk = $false
}

# Check PostgreSQL
try {
    $psqlVersion = psql --version
    Write-Host "  PostgreSQL: $psqlVersion"
} catch {
    Write-Warning "PostgreSQL client not found. Make sure PostgreSQL is running."
}

# Check Redis (optional for dev)
try {
    $redisVersion = redis-cli --version
    Write-Host "  Redis: $redisVersion"
} catch {
    Write-Warning "Redis CLI not found. Redis will be needed for queues and caching."
}

# Check Docker (optional)
try {
    $dockerVersion = docker --version
    Write-Host "  Docker: $dockerVersion"
} catch {
    Write-Warning "Docker not found. You can use Docker for a fully containerized setup."
}

if (-not $prereqsOk) {
    Write-Error "Please fix the above issues and run this script again."
    exit 1
}

Write-Host "  All required prerequisites are met." -ForegroundColor $Green

# ============================================
# Step 2: Create .env file
# ============================================
Write-Step "Setting up environment variables..."

$envFile = Join-Path $ProjectRoot ".env"
$envExample = Join-Path $ProjectRoot ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item -Path $envExample -Destination $envFile
        Write-Host "  Created .env from .env.example"
        Write-Warning "Please review and update .env with your configuration values."
    } else {
        Write-Error ".env.example not found at $envExample"
        exit 1
    }
} else {
    Write-Host "  .env file already exists, skipping..."
}

# ============================================
# Step 3: Install backend dependencies
# ============================================
Write-Step "Installing backend dependencies..."

Push-Location (Join-Path $ProjectRoot "backend")
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Host "  Backend dependencies installed successfully."
} catch {
    Write-Error "Failed to install backend dependencies: $_"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================
# Step 4: Install frontend dependencies
# ============================================
Write-Step "Installing frontend dependencies..."

Push-Location (Join-Path $ProjectRoot "frontend")
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Host "  Frontend dependencies installed successfully."
} catch {
    Write-Error "Failed to install frontend dependencies: $_"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================
# Step 5: Install root dependencies
# ============================================
Write-Step "Installing root dependencies..."

Push-Location $ProjectRoot
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Host "  Root dependencies installed successfully."
} catch {
    Write-Error "Failed to install root dependencies: $_"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================
# Step 6: Generate Prisma Client
# ============================================
Write-Step "Generating Prisma client..."

Push-Location (Join-Path $ProjectRoot "backend")
try {
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }
    Write-Host "  Prisma client generated successfully."
} catch {
    Write-Error "Failed to generate Prisma client: $_"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================
# Step 7: Run database migrations
# ============================================
Write-Step "Running database migrations..."

Push-Location (Join-Path $ProjectRoot "backend")
try {
    npx prisma migrate dev
    if ($LASTEXITCODE -ne 0) { throw "prisma migrate dev failed" }
    Write-Host "  Database migrations applied successfully."
} catch {
    Write-Warning "Migrations failed. Make sure PostgreSQL is running and DATABASE_URL in .env is correct."
    Write-Host "  You can run migrations manually with: cd backend && npx prisma migrate dev"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================
# Step 8: Seed the database
# ============================================
Write-Step "Seeding the database..."

Push-Location (Join-Path $ProjectRoot "backend")
try {
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) { throw "prisma db seed failed" }
    Write-Host "  Database seeded successfully."
} catch {
    Write-Warning "Seeding failed: $_"
    Write-Host "  You can seed manually with: cd backend && npx prisma db seed"
}
Pop-Location

# ============================================
# Completion
# ============================================
Write-Host "`n========================================" -ForegroundColor $Green
Write-Host "  Setup Complete!" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host ""
Write-Host "  Quick Start Commands:"
Write-Host "  ------------------------------"
Write-Host "  Start development:          npm run dev"
Write-Host "  Start frontend only:        npm run dev:frontend"
Write-Host "  Start backend only:         npm run dev:backend"
Write-Host "  Run tests:                  npm test"
Write-Host "  Lint code:                  npm run lint"
Write-Host "  Build for production:       npm run build"
Write-Host "  Open Prisma Studio:         npm run db:studio"
Write-Host ""
Write-Host "  Default Login Credentials (development only):"
Write-Host "  ------------------------------"
Write-Host "  Email:    superadmin@aitools.io"
Write-Host "  Password: Password123!"
Write-Host "`n  Visit: http://localhost:3000"
Write-Host "  API:   http://localhost:4000/api/v1"
Write-Host "  Docs:  http://localhost:4000/api/docs"
Write-Host ""
Write-Host "  Happy coding!" -ForegroundColor $Green
