# API Documentation

## Overview

Base URL: `https://api.aitoolsdirectory.com/api/v1`

The API follows RESTful conventions and returns JSON responses. All timestamps are in ISO 8601 format. All IDs are UUID v4.

## Authentication

### Authentication Methods

The API supports three authentication methods:

#### 1. JWT Bearer Token (Primary)
Used for web application authentication. Short-lived tokens (15 minutes) with refresh token rotation.

```
Authorization: Bearer <access_token>
```

#### 2. HTTP-only Cookie (Refresh)
Refresh tokens are stored in HTTP-only, Secure, SameSite=Strict cookies. Automatically sent by the browser on refresh requests.

```
Cookie: refreshToken=<refresh_token>
```

#### 3. API Key (Programmatic Access)
For third-party integrations and automated access. Passed via header.

```
X-API-Key: <api_key>
```

### Rate Limiting

| Endpoint Type | Rate Limit | Burst |
|--------------|------------|-------|
| Public API | 100 req/min | 150 |
| Auth endpoints | 5 req/min | 10 |
| Search endpoints | 10 req/min | 20 |
| Static assets | 100 req/s | 200 |
| API key (Starter) | 1,000 req/mo | - |
| API key (Pro) | 5,000 req/mo | - |
| API key (Business) | Unlimited | 500 req/min |

Rate limit headers are returned with every response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000000
```

## Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/refresh` | Refresh access token | Cookie |
| POST | `/auth/logout` | Logout and invalidate tokens | JWT |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/verify-email/:token` | Verify email address | No |
| POST | `/auth/2fa/setup` | Setup 2FA | JWT |
| POST | `/auth/2fa/verify` | Verify 2FA code | JWT |
| POST | `/auth/2fa/disable` | Disable 2FA | JWT |
| GET | `/auth/google` | Google OAuth login | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |
| GET | `/auth/github` | GitHub OAuth login | No |
| GET | `/auth/github/callback` | GitHub OAuth callback | No |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | JWT/API |
| PATCH | `/users/me` | Update current user profile | JWT/API |
| DELETE | `/users/me` | Delete current user account | JWT |
| GET | `/users/me/sessions` | List active sessions | JWT |
| DELETE | `/users/me/sessions/:id` | Terminate a session | JWT |
| GET | `/users/:id` | Get user by ID | JWT/API |
| GET | `/users/:id/tools` | Get user's submitted tools | No |
| GET | `/users/:id/reviews` | Get user's reviews | No |

### Tools

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tools` | List tools (paginated) | No |
| GET | `/tools/:slug` | Get tool by slug | No |
| POST | `/tools` | Create a new tool | JWT |
| PATCH | `/tools/:id` | Update a tool | JWT/Mod |
| DELETE | `/tools/:id` | Delete a tool | Admin |
| GET | `/tools/:slug/reviews` | Get tool reviews | No |
| GET | `/tools/:slug/analytics` | Get tool analytics | JWT |
| POST | `/tools/:id/claim` | Claim tool ownership | JWT |
| GET | `/tools/featured` | Get featured tools | No |
| GET | `/tools/sponsored` | Get sponsored tools | No |
| POST | `/tools/:id/view` | Record tool view | No |
| POST | `/tools/:id/click` | Record tool click | No |
| GET | `/tools/search` | Full-text search tools | No |

#### Query Parameters for `GET /tools`

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field: `name`, `createdAt`, `averageRating`, `viewCount`, `rankScore` |
| `order` | string | Sort order: `asc` or `desc` |
| `category` | string | Category slug filter |
| `tag` | string | Tag slug filter |
| `q` | string | Full-text search query |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `pricingType` | string | `free`, `freemium`, `paid`, `contact` |
| `platform` | string | `web`, `ios`, `android`, `api`, `desktop`, `chrome` |
| `status` | string | Admin only: `draft`, `approved`, `rejected` |
| `isFeatured` | bool | Filter featured tools |
| `isSponsored` | bool | Filter sponsored tools |
| `minRating` | number | Minimum rating filter (1-5) |

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | List all categories | No |
| GET | `/categories/:slug` | Get category by slug | No |
| GET | `/categories/:slug/tools` | Get tools in category | No |
| POST | `/categories` | Create category | Admin |
| PATCH | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

### Tags

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tags` | List all tags | No |
| GET | `/tags/:slug` | Get tag by slug | No |
| GET | `/tags/:slug/tools` | Get tools with tag | No |
| POST | `/tags` | Create tag | Admin |
| DELETE | `/tags/:id` | Delete tag | Admin |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reviews` | List reviews | No |
| GET | `/reviews/:id` | Get review by ID | No |
| POST | `/reviews` | Create review | JWT |
| PATCH | `/reviews/:id` | Update own review | JWT |
| DELETE | `/reviews/:id` | Delete own review | JWT |
| POST | `/reviews/:id/helpful` | Mark review as helpful | JWT |
| POST | `/reviews/:id/report` | Report a review | JWT |

### Bookmarks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/bookmarks` | List user's bookmarks | JWT |
| POST | `/bookmarks` | Create bookmark | JWT |
| DELETE | `/bookmarks/:id` | Remove bookmark | JWT |

### Collections

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/collections` | List public collections | No |
| GET | `/collections/mine` | List user's collections | JWT |
| POST | `/collections` | Create collection | JWT |
| GET | `/collections/:slug` | Get collection by slug | No |
| PATCH | `/collections/:id` | Update collection | JWT |
| DELETE | `/collections/:id` | Delete collection | JWT |
| POST | `/collections/:id/tools` | Add tool to collection | JWT |
| DELETE | `/collections/:id/tools/:toolId` | Remove tool from collection | JWT |

### Pricing Plans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/pricing` | List all pricing plans | No |
| GET | `/pricing/:slug` | Get plan details | No |

### Subscriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/subscriptions/mine` | Get user's subscription | JWT |
| POST | `/subscriptions` | Create/manage subscription | JWT |
| POST | `/subscriptions/cancel` | Cancel subscription | JWT |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/create-checkout-session` | Create Stripe checkout | JWT |
| POST | `/payments/webhook/stripe` | Stripe webhook handler | No |
| POST | `/payments/webhook/paypal` | PayPal webhook handler | No |
| POST | `/payments/webhook/paddle` | Paddle webhook handler | No |
| POST | `/payments/webhook/lemonsqueezy` | LemonSqueezy webhook handler | No |
| GET | `/payments/history` | Get payment history | JWT |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | List user's notifications | JWT |
| PATCH | `/notifications/:id/read` | Mark as read | JWT |
| POST | `/notifications/read-all` | Mark all as read | JWT |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Dashboard statistics | Admin |
| GET | `/admin/users` | List all users | Admin |
| PATCH | `/admin/users/:id` | Update user role/status | Admin |
| GET | `/admin/reports` | List moderation reports | Admin |
| PATCH | `/admin/reports/:id` | Review a report | Admin |
| GET | `/admin/pending-edits` | List pending edits | Admin |
| PATCH | `/admin/pending-edits/:id` | Approve/reject edit | Admin |
| GET | `/admin/claims` | List ownership claims | Admin |
| PATCH | `/admin/claims/:id` | Review a claim | Admin |
| POST | `/admin/tools/:id/feature` | Feature/unfeature tool | Admin |
| POST | `/admin/tools/:id/verify` | Verify a tool | Admin |
| POST | `/admin/banners` | Create a banner | Admin |

### API Keys

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api-keys` | List user's API keys | JWT |
| POST | `/api-keys` | Create API key | JWT |
| DELETE | `/api-keys/:id` | Revoke API key | JWT |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/tools` | Tool analytics (views, clicks) | JWT |
| GET | `/analytics/trending` | Trending tools | No |

### Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Global search across tools, categories, collections | No |
| GET | `/search/suggestions` | Autocomplete suggestions | No |

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid authentication) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### Business Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Invalid email or password | Login failed |
| `AUTH_EMAIL_NOT_VERIFIED` | Email not verified | User must verify email |
| `AUTH_TOKEN_EXPIRED` | Token has expired | Refresh token needed |
| `AUTH_TOKEN_INVALID` | Invalid token | Authentication failed |
| `AUTH_2FA_REQUIRED` | Two-factor authentication required | 2FA code needed |
| `AUTH_2FA_INVALID` | Invalid two-factor code | Wrong code |
| `USER_EMAIL_EXISTS` | Email already registered | Duplicate registration |
| `USER_USERNAME_EXISTS` | Username already taken | Duplicate username |
| `USER_NOT_FOUND` | User not found | Invalid user ID |
| `TOOL_NOT_FOUND` | Tool not found | Invalid tool slug/ID |
| `TOOL_SLUG_EXISTS` | Tool slug already exists | Duplicate slug |
| `REVIEW_EXISTS` | You have already reviewed this tool | Duplicate review |
| `REVIEW_NOT_FOUND` | Review not found | Invalid review ID |
| `BOOKMARK_EXISTS` | Tool already bookmarked | Duplicate bookmark |
| `CATEGORY_NOT_FOUND` | Category not found | Invalid category |
| `PLAN_NOT_FOUND` | Pricing plan not found | Invalid plan ID |
| `SUBSCRIPTION_ACTIVE` | Active subscription exists | Cannot create new |
| `PAYMENT_FAILED` | Payment processing failed | Card declined etc. |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Slow down |
| `API_KEY_INVALID` | Invalid API key | Wrong key or revoked |
| `API_KEY_EXPIRED` | API key has expired | Create new key |
| `PERMISSION_DENIED` | Insufficient permissions | Wrong role |
| `FILE_TOO_LARGE` | Uploaded file exceeds limit | Max 5MB |
| `INVALID_FILE_TYPE` | File type not allowed | Wrong extension |

## Webhooks

### Stripe Webhooks

```
POST /api/v1/payments/webhook/stripe
```

Events handled:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### PayPal Webhooks

```
POST /api/v1/payments/webhook/paypal
```

Events handled:
- `PAYMENT.SALE.COMPLETED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`

### Paddle Webhooks

```
POST /api/v1/payments/webhook/paddle
```

Events handled:
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `payment_succeeded`
- `payment_refunded`

### LemonSqueezy Webhooks

```
POST /api/v1/payments/webhook/lemonsqueezy
```

Events handled:
- `order_created`
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`

### Webhook Security

All webhooks verify signatures before processing:
- **Stripe**: `stripe-signature` header verified with webhook secret
- **PayPal**: Webhook ID and transmission verification
- **Paddle**: Public key signature verification
- **LemonSqueezy**: Signature header verification with secret

## Pagination

All list endpoints support cursor-based and offset-based pagination.

### Offset Pagination (Default)

```
GET /tools?page=1&limit=20&sort=createdAt&order=desc
```

Response includes metadata:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Sorting

Sort fields vary by endpoint. Common sort fields:
- `createdAt` (default, descending)
- `updatedAt`
- `name`
- `averageRating`
- `viewCount`
- `rankScore`

## Data Models

### Tool Object

```json
{
  "id": "uuid",
  "name": "ChatGPT",
  "slug": "chatgpt",
  "tagline": "Conversational AI for everyone",
  "description": "Full description...",
  "websiteUrl": "https://chat.openai.com",
  "logoUrl": "https://cdn.aitoolsdirectory.com/logos/chatgpt.png",
  "pricingType": "freemium",
  "pricingMin": 0,
  "pricingMax": 20,
  "pricingDetails": { "free": "GPT-3.5", "plus": "$20/month" },
  "features": ["Code generation", "Debugging", "Writing assistance"],
  "useCases": ["Programming", "Content creation", "Analysis"],
  "platforms": ["web", "ios", "android"],
  "openSource": false,
  "status": "approved",
  "isFeatured": true,
  "isVerified": true,
  "averageRating": 4.5,
  "reviewCount": 128,
  "viewCount": 15000,
  "category": { "id": "uuid", "name": "Code Assistant", "slug": "code-assistant" },
  "tags": [
    { "id": "uuid", "name": "Code Generation", "slug": "code-generation" }
  ],
  "author": { "id": "uuid", "name": "Alex Thompson", "avatarUrl": null },
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-06-01T00:00:00.000Z"
}
```

### User Object

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "username": "johndoe",
  "avatarUrl": "https://cdn.aitoolsdirectory.com/avatars/johndoe.jpg",
  "bio": "AI enthusiast",
  "role": "USER",
  "status": "ACTIVE",
  "locale": "en",
  "timezone": "UTC",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### Review Object

```json
{
  "id": "uuid",
  "title": "Excellent tool",
  "content": "Detailed review content...",
  "rating": 5,
  "pros": ["Easy to use", "Accurate"],
  "cons": ["Expensive"],
  "isVerified": true,
  "helpfulCount": 23,
  "user": { "id": "uuid", "name": "John Doe", "avatarUrl": null },
  "toolId": "uuid",
  "createdAt": "2026-05-15T00:00:00.000Z",
  "updatedAt": "2026-05-15T00:00:00.000Z"
}
```
