# Ory Kratos Integration — Dev Environment

## Overview

Replace the home-grown identity server (`@saflib/identity`) with [Ory Kratos](https://www.ory.sh/kratos/) for identity management. Kratos handles user registration, login, logout, session management, email verification, and account recovery as a standalone service.

The current identity server is already fairly decoupled: it runs as a separate HTTP service behind Caddy, sessions are cookie-based with a shared domain, and downstream services only see `X-User-*` headers set by Caddy's `forward_auth`. This means the integration surface is well-defined.

**Scope**: Email/password registration, login, logout, session verification, and email verification — enough to cover current identity features in the `recipes/dev` environment. Social logins, TOTP, WebAuthn, and other Kratos capabilities are out of scope for now.

**Approach**: Kratos runs as a Docker container alongside the existing monolith. The browser interacts with Kratos directly for self-service flows (registration, login, etc.). Caddy's `forward_auth` uses Kratos's `/sessions/whoami` to verify sessions for API requests, copying the `X-Kratos-Authenticated-Identity-Id` header as the sole identity claim. Downstream services only receive the user ID; any additional data (email, permissions, admin status) is the responsibility of the product service layer.

## User Stories

- As a user, I want to register with email and password so that I can create an account.
- As a user, I want to log in with my credentials so that I can access my data.
- As a user, I want to log out so that my session is terminated.
- As a user, I want to verify my email address so that my account is fully activated.
- As a user, I want my login to work across all `*.docker.localhost` subdomains so that I don't have to log in separately for each app.
- As an API consumer, I want requests to be authenticated via Kratos sessions so that the API server knows who I am.

## Packages to Modify

- `recipes/dev/`: Add Kratos container to docker-compose, Kratos config files, update Caddy config to expose Kratos public API and use whoami for forward_auth.
- `hub/clients/auth/`: Add a Kratos test page (login/register/logout/session display) alongside existing pages.
- `recipes/clients/app/`: Update `AppSpa.vue` to display session state from Kratos.
- `saflib/express/src/middleware/context.ts`: Simplify to only read user ID from `X-Kratos-Authenticated-Identity-Id` header.
- `saflib/express/src/middleware/auth.ts`: Add CSRF validation (moved from identity server verify endpoint to Express). Add admin email checking from env var.
- `recipes/dev/caddy-config/common.Caddyfile`: Update `api-proxy` snippet to use Kratos `/sessions/whoami` directly via `forward_auth`.

## Infrastructure Changes

### Kratos Docker Service

Added to `recipes/dev/docker-compose.yaml`:
- `kratos-migrate`: Runs DB migrations on startup (SQLite for dev).
- `kratos`: The Kratos server, serving public API (port 4433) and admin API (port 4434).

### Kratos Configuration (`recipes/dev/kratos/`)

- `kratos.yml`: Main config — sets cookie domain to `.docker.localhost`, points self-service UI URLs to `auth.docker.localhost`, enables password method and email verification, configures courier to send emails via HTTP to the Express monolith.
- `identity.schema.json`: Identity schema defining `email` as the sole trait, used as password identifier and verification/recovery address.

### Email Delivery

Kratos's courier is configured with HTTP delivery strategy, POSTing email data to an endpoint on the Express monolith (e.g. `POST /email/kratos-courier`). The monolith uses the existing `@saflib/email` `EmailClient` / nodemailer setup to send (or mock) the email. This keeps the existing test infrastructure working: in dev with `MOCK_INTEGRATIONS=true`, emails land in the in-memory `sentEmails` array and are accessible via `GET /email/sent` for Playwright tests.

### Caddy Changes

- New route: `http://kratos.docker.localhost` → proxies to Kratos public API (port 4433), with CORS enabled for `*.docker.localhost` origins.
- Updated `api-proxy` snippet: `forward_auth` points directly to Kratos `/sessions/whoami`. Copies `X-Kratos-Authenticated-Identity-Id` as the sole user identity header.

## Auth Middleware Changes (Express)

With the identity server no longer handling CSRF or admin checks in its verify endpoint, these responsibilities move to Express middleware:

### CSRF
- Express auth middleware validates CSRF for state-changing requests (POST/PUT/DELETE/PATCH).
- Approach: double-submit cookie pattern or custom header requirement (e.g. `X-Requested-With`).

### Admin Determination
- Express reads `IDENTITY_SERVICE_ADMIN_EMAILS` env var (or a renamed equivalent).
- When a request is authenticated, the middleware looks up the user's email (from the product DB or by querying Kratos) and checks against the admin list.
- Admin status is set on the `SafContext.auth` object for downstream use.

### Simplified `Auth` Object
- `context.ts` reads `X-Kratos-Authenticated-Identity-Id` header → sets `auth.userId`.
- Email, scopes, and other attributes are no longer passed via headers. Product services that need email look it up from their own data or query Kratos.

## Frontend Pages

1. **Kratos Test Page** (`hub/clients/auth/` — new page at e.g. `/kratos-test`)
   - Purpose: End-to-end validation of Kratos integration.
   - Shows current session state (logged out / logged in with identity details).
   - If logged out: renders login form and registration form using Kratos browser flow API.
   - If logged in: shows identity info and a logout button.
   - Uses `@ory/client` SDK to interact with Kratos public API.
   - `toSession()` wrapped in a tanstack `useQuery` (`useKratosSession`) for caching and reactivity.
   - Flow creation (`createBrowserLoginFlow`, `createBrowserRegistrationFlow`) also as queries.
   - Flow submission (`updateLoginFlow`, `updateRegistrationFlow`) as plain async functions (not tanstack mutations) since they involve redirects.

2. **AppSpa.vue** (`recipes/clients/app/AppSpa.vue`)
   - Updated to check session state via Kratos `toSession()` (using `useKratosSession`).
   - Displays whether user is logged in/out alongside the existing layout.
   - Proves cross-subdomain session sharing works (log in on `auth.docker.localhost`, see session on `app.recipes.docker.localhost`).

## Future Enhancements / Out of Scope

- Social login providers (Google, GitHub, etc.)
- TOTP / WebAuthn / passkey support
- Account recovery flow (password reset)
- Replacing all existing `@saflib/auth` Vue pages with Kratos-native equivalents
- Ory Oathkeeper for production-grade API gateway auth
- Production deployment configuration (PostgreSQL, real SMTP, HTTPS)
- Restricting registration to invited/allowed emails only (requires Kratos webhooks or pre-registration check)

## Questions and Clarifications

- **Registration restriction**: Kratos doesn't natively restrict which emails can register. Options: (a) client-side check against an allowlist before initiating registration flow, (b) Kratos webhook that calls the Express server to approve/reject registration, (c) post-registration cleanup (delete unauthorized identities). Option (b) is cleanest but adds complexity. Option (a) is simplest and probably fine for now — it prevents accidental signups even if it's not airtight.
- **Kratos courier HTTP config**: The exact payload format for Kratos HTTP courier delivery needs to be verified against the Kratos version being used. The Express endpoint will need to parse the template data and format it into proper emails using the existing email templates.
