# AI Tools Directory - Architecture Documentation

## System Overview

The AI Tools Directory is a full-stack SaaS platform that provides a curated directory of artificial intelligence tools, services, and applications. Users can browse, search, review, bookmark, and compare AI tools across multiple categories. The platform supports user authentication, subscription-based pricing, sponsored listings, and community-driven content moderation.

### Key Features

- **Tool Discovery**: Browse, search, and filter 1000+ AI tools across 15+ categories
- **User Management**: Registration, authentication (JWT + OAuth), profiles, roles (Super Admin, Admin, Moderator, Editor, User, Developer)
- **Review System**: User reviews with ratings, pros/cons, and verification
- **Collections & Bookmarks**: Personal collections and bookmarked tools
- **Sponsored Listings**: Paid promotion spots with featured and spotlight placements
- **Subscription Plans**: Free, Starter ($9/mo), Pro ($29/mo), Business ($79/mo), Enterprise ($199/mo)
- **Payment Integration**: Multiple providers (Stripe, PayPal, Paddle, LemonSqueezy)
- **Multi-language**: i18n support via next-intl
- **Analytics**: Event tracking for views, clicks, impressions, searches
- **API Access**: RESTful API with API key authentication for developers
- **Admin Dashboard**: Full administrative interface for content management

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3, class-variance-authority, tailwind-merge
- **State Management**: Zustand 5
- **Data Fetching**: TanStack React Query 5
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: next-intl
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Utilities**: clsx, date-fns, use-debounce

### Backend
- **Framework**: NestJS 11 (Node.js 20)
- **Language**: TypeScript 5
- **ORM**: Prisma 6 with PostgreSQL
- **Cache/Queue**: Redis via ioredis, BullMQ for job queues
- **Authentication**: Passport.js (JWT, Google OAuth, GitHub OAuth)
- **API Documentation**: Swagger/OpenAPI via @nestjs/swagger
- **Validation**: class-validator, class-transformer
- **Security**: helmet, csurf, express-rate-limit, DOM sanitization
- **Payments**: Stripe SDK
- **Email**: Nodemailer with Mailtrap (dev) / SMTP (prod)
- **2FA**: Speakeasy + QRCode
- **Scheduling**: @nestjs/schedule

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx
- **SSL**: Certbot / Let's Encrypt
- **Registry**: GitHub Container Registry (ghcr.io)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Monitoring**: Sentry (error tracking)

## Folder Structure

```
ai-tools-directory/
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml                  # Continuous Integration
│   └── deploy.yml              # Deployment workflow
├── backend/                    # NestJS API server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data script
│   ├── src/
│   │   ├── main.ts             # Application entry point
│   │   ├── app.module.ts       # Root module
│   │   ├── common/             # Shared modules
│   │   │   ├── constants/
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── filters/        # Exception filters
│   │   │   ├── guards/         # Auth & role guards
│   │   │   ├── interceptors/   # Transform interceptors
│   │   │   ├── interfaces/
│   │   │   ├── pipes/          # Validation pipes
│   │   │   ├── prisma/         # Prisma module
│   │   │   ├── redis/          # Redis module
│   │   │   ├── queue/          # BullMQ module
│   │   │   ├── mail/           # Email module
│   │   │   └── utils/
│   │   ├── config/             # Configuration modules
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── stripe.config.ts
│   │   └── modules/            # Feature modules
│   │       ├── affiliates/
│   │       ├── analytics/
│   │       ├── api-keys/
│   │       ├── audit/
│   │       ├── auth/
│   │       ├── banners/
│   │       ├── bookmarks/
│   │       ├── categories/
│   │       ├── claims/
│   │       ├── cms/
│   │       ├── collections/
│   │       ├── edits/
│   │       ├── import/
│   │       ├── messages/
│   │       ├── notifications/
│   │       ├── payments/
│   │       ├── pricing/
│   │       ├── recommendations/
│   │       ├── reports/
│   │       ├── reviews/
│   │       ├── search/
│   │       ├── tags/
│   │       ├── tools/
│   │       ├── users/
│   │       └── white-label/
│   └── test/                   # E2E tests
├── docker/
│   ├── docker-compose.yml      # Development compose
│   ├── docker-compose.prod.yml # Production compose
│   ├── Dockerfile.backend      # Backend build
│   ├── Dockerfile.frontend     # Frontend build
│   ├── nginx.conf              # Nginx configuration
│   └── nginx.Dockerfile        # Nginx container
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── API.md
├── frontend/                   # Next.js client
│   ├── src/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── scripts/
│   ├── setup.ps1               # Windows setup
│   └── setup.sh                # Linux/Mac setup
├── .env.example
├── package.json                # Root scripts
└── README.md
```

## Database Schema Overview

### Core Entities

- **User** - Central entity with roles, status, social login, 2FA, and preferences
- **Tool** - AI tool listing with metadata, pricing, features, platforms, and SEO fields
- **Category** - Hierarchical categories (parent/children) with icons and tool counts
- **Tag** - Tags associated with categories and linked to tools via ToolTag (M2M)
- **Review** - User reviews with rating, pros/cons, verification flag
- **Bookmark** - User tool bookmarks with optional notes
- **Collection** - User-created collections with ordered tool assignments
- **PricingPlan** - Subscription tiers with feature lists, limits, and payment provider IDs
- **Subscription** - User subscriptions linked to pricing plans with provider metadata
- **Payment** - Payment records from multiple providers
- **SponsoredListing** - Paid promotions with start/end dates and impression tracking
- **FeaturedHistory** - Historical record of featured tool assignments
- **Session** - User sessions with device info and expiration
- **ApiKey** - Developer API keys with scoped permissions
- **Notification** - User notifications with types and read status
- **Message** - User-to-user messaging system
- **Report** - Content moderation reports with review workflow
- **ClaimRequest** - Tool ownership verification requests
- **PendingEdit** - Community-suggested tool edits pending approval
- **AnalyticEvent** - Behavioral tracking (views, clicks, impressions, searches)
- **AuditLog** - Administrative action logging
- **Banner** - Ad placements with impression/click tracking
- **AffiliateLink** - User affiliate codes with commission tracking
- **CompareItem** - Tool comparison session items
- **Page/Translation/BlogPost** - CMS content management
- **WhiteLabelConfig** - White-label customization settings

### Key Relationships

```
User ──┬── Tool (author)
       ├── Review (author)
       ├── Bookmark
       ├── Collection
       ├── ApiKey
       ├── Notification
       ├── Session
       └── Subscription ─── PricingPlan

Tool ──┬── Category (FK)
       ├── Tag (via ToolTag M2M)
       ├── Review
       ├── Bookmark
       ├── Collection (via CollectionTool)
       ├── SponsoredListing
       └── FeaturedHistory

Category ──┬── Category (self-referencing parent/children)
           └── Tag
```

## API Design

The API follows RESTful conventions with versioning via URL prefix (`/api/v1/`).

- Base URL: `https://api.aitoolsdirectory.com/api/v1`
- Authentication: JWT Bearer tokens, Cookie-based refresh tokens, API keys
- Content-Type: `application/json`
- Pagination: `?page=1&limit=20&sort=createdAt&order=desc`
- Filtering: `?category=slug&tag=slug&minPrice=0&maxPrice=100`
- Search: `?q=search+terms`

### Response Format

All responses follow a standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

## Authentication Flow

### JWT-based Authentication

1. User registers or logs in via `/api/v1/auth/register` or `/api/v1/auth/login`
2. Server validates credentials and returns:
   - `accessToken` (short-lived, 15 minutes) in response body
   - `refreshToken` (long-lived, 7 days) as HTTP-only cookie
3. Client includes `Authorization: Bearer <accessToken>` for API requests
4. When access token expires, client calls `/api/v1/auth/refresh` with the refresh cookie
5. Server issues new access token (and optionally rotates refresh token)
6. On logout, both tokens are invalidated server-side

### OAuth Flow (Google / GitHub)

1. User clicks "Login with Google/GitHub"
2. Redirected to provider's OAuth consent screen
3. Provider redirects back to callback URL with authorization code
4. Server exchanges code for provider tokens, fetches user profile
5. If email exists, link accounts; otherwise create new user
6. Issue JWT tokens and redirect to frontend

### 2FA / MFA

- Optional two-factor authentication via TOTP (Speakeasy)
- QR code provisioning for authenticator apps
- Backup codes provided during setup

## Payment Integration Flow

### Supported Providers
- Stripe (primary)
- PayPal
- Paddle
- LemonSqueezy

### Subscription Flow (Stripe example)

1. User selects a pricing plan on the frontend
2. Frontend calls `POST /api/v1/payments/create-checkout-session` with `planId`
3. Backend creates a Stripe Checkout Session, returns session URL
4. User completes payment on Stripe's hosted checkout page
5. Stripe sends `checkout.session.completed` webhook to `POST /api/v1/payments/webhook/stripe`
6. Backend verifies webhook signature, creates subscription, and activates user plan
7. User is redirected back to the application with success confirmation

### Webhook Events

- `checkout.session.completed` - Payment succeeded
- `customer.subscription.updated` - Plan changes or status updates
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_failed` - Failed renewal
- `invoice.paid` - Successful renewal

## Deployment Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
