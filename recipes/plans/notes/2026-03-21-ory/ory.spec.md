# Ory Kratos Integration — Dev Environment

## Overview

Replace the home-grown identity server (`@saflib/identity`) with [Ory Kratos](https://www.ory.sh/kratos/) for identity management in the `recipes/dev` environment. Kratos handles user registration, login, logout, session management, email verification, and account recovery as a standalone service.

The current identity server is already fairly decoupled: it runs as a separate HTTP service behind Caddy, sessions are cookie-based with a shared domain, and downstream services only see `X-User-*` headers set by Caddy's `forward_auth`. This means the integration surface is well-defined.

**Scope**: Email/password registration, login, logout, session verification, and email verification — enough to cover current identity features. Social logins, TOTP, WebAuthn, and other Kratos capabilities are out of scope for now.

**Approach**: Kratos runs as a Docker container alongside the existing monolith. The browser interacts with Kratos directly for self-service flows (registration, login, etc.). Caddy's `forward_auth` uses Kratos's `/sessions/whoami` to verify sessions for API requests, copying the `X-Kratos-Authenticated-Identity-Id` header. Express middleware then calls the Kratos admin API to resolve email, verification status, and admin scopes — keeping those responsibilities in the product layer rather than the identity layer.

**Compatibility**: The existing identity server (`@saflib/identity`) continues to be supported. Other products depend on it. Caddy snippets, Express middleware, and the `Auth` type all support both code paths. CSRF handling is moved from the identity server to Express for both paths.

## User Stories

- As a user, I want to register with email and password so that I can create an account.
- As a user, I want to log in with my credentials so that I can access my data.
- As a user, I want to log out so that my session is terminated.
- As a user, I want to verify my email address so that my account is fully activated.
- As a user, I want my login to work across all `*.docker.localhost` subdomains so that I don't have to log in separately for each app.
- As an API consumer, I want requests to be authenticated via Kratos sessions so that the API server knows who I am.

## Packages to Modify

- `recipes/dev/`: Add Kratos container to docker-compose, Kratos config files (`recipes/dev/kratos/`), update Caddy config.
- `recipes/dev/caddy-config/common.Caddyfile`: Add `kratos-api-proxy` snippet (Kratos equivalent of `api-proxy`). Keep existing `api-proxy` and `identity` snippets for other products. Remove CSRF forwarding from identity-server snippets (CSRF moves to Express).
- `hub/clients/auth/`: Add a Kratos test page (login/register/logout/session display) alongside existing pages.
- `recipes/clients/app/AppSpa.vue`: Update to display session state from Kratos.
- `saflib/node/src/types.ts`: Make `Auth` fields other than `userId` optional.
- `saflib/express/src/middleware/context.ts`: Support both identity-server headers (`X-User-ID` etc.) and Kratos header (`X-Kratos-Authenticated-Identity-Id`). When Kratos ID is present, call Kratos admin API to resolve email, verification, and admin scopes.
- `saflib/express/src/middleware/auth.ts`: Add CSRF validation for state-changing requests (responsibility moved from identity server to Express).

## Infrastructure Changes

### Kratos Docker Service

Added to `recipes/dev/docker-compose.yaml`:
- `kratos-migrate`: Runs DB migrations on startup (SQLite for dev and prod).
- `kratos`: The Kratos server, serving public API (port 4433) and admin API (port 4434).

### Kratos Configuration (`recipes/dev/kratos/`)

- `kratos.yml`: Main config — sets cookie domain to `.docker.localhost`, points self-service UI URLs to `auth.docker.localhost`, enables password method and email verification, configures courier to send emails via HTTP to the Express monolith.
- `identity.schema.json`: Identity schema defining `email` as the sole trait, used as password identifier and verification/recovery address.

### Email Delivery

Kratos's courier is configured with HTTP delivery strategy, POSTing email data to an endpoint on the Express monolith (e.g. `POST /email/kratos-courier`). The monolith uses the existing `@saflib/email` `EmailClient` / nodemailer setup to send (or mock) the email. This keeps the existing test infrastructure working: in dev with `MOCK_INTEGRATIONS=true`, emails land in the in-memory `sentEmails` array and are accessible via `GET /email/sent` for Playwright tests.

### Caddy Changes

- New route: `http://kratos.docker.localhost` → proxies to Kratos public API (port 4433), with CORS enabled for `*.docker.localhost` origins.
- New `(kratos-api-proxy)` snippet: `forward_auth` to Kratos `/sessions/whoami`, copies `X-Kratos-Authenticated-Identity-Id`. Takes 1 arg (target service host).
- Existing `(api-proxy)` snippet: Kept for products using the identity server. CSRF `header_up` removed (CSRF moves to Express). Still takes 2 args (identity host, target host).
- Existing `(identity)` snippet: Kept as-is for products that use it.

## Auth Type and Middleware Changes

### `Auth` Type (`saflib/node/src/types.ts`)

```typescript
interface Auth {
  userId: string;
  userEmail?: string;
  userScopes?: string[];
  emailVerified?: boolean;
}
```

All fields except `userId` become optional. This supports both identity-server (which populates everything from headers) and Kratos (which starts with just the ID, then resolves the rest via API call).

### Context Middleware (`saflib/express/src/middleware/context.ts`)

Supports two code paths:

1. **Identity server path**: Reads `X-User-ID`, `X-User-Email`, `X-User-Scopes`, `X-User-Email-Verified` headers. Populates all `Auth` fields from headers. (Existing behavior, preserved.)

2. **Kratos path**: Reads `X-Kratos-Authenticated-Identity-Id` header. Calls Kratos admin API (`GET http://kratos:4434/admin/identities/{id}`) to resolve:
   - `userEmail` from `identity.traits.email`
   - `emailVerified` from `identity.verifiable_addresses[0].verified`
   - `userScopes` from checking email against `IDENTITY_SERVICE_ADMIN_EMAILS` env var (scope `"*"` if admin)

The middleware becomes async for the Kratos path. This adds per-request latency from the Kratos call — acceptable for now, will be replaced with a product-level lookup later.

### CSRF Middleware (`saflib/express/src/middleware/auth.ts`)

CSRF validation for state-changing requests (POST/PUT/DELETE/PATCH) moves to Express. Both identity-server and Kratos setups use this. The identity server's verify endpoint no longer checks CSRF.

### Auth Middleware (`saflib/express/src/middleware/auth.ts`)

The `adminRequired` check updates to handle optional scopes: `auth.userScopes?.includes("*")`.

## Frontend Pages

1. **Kratos Test Page** (`hub/clients/auth/` — new page at e.g. `/kratos-test`)
   - Purpose: End-to-end validation of Kratos integration.
   - Shows current session state (logged out / logged in with identity details).
   - If logged out: renders login form and registration form using Kratos browser flow API.
   - If logged in: shows identity info and a logout button.
   - Uses `@ory/client` SDK to interact with Kratos public API.
   - `toSession()` wrapped in a tanstack `useQuery` (`useKratosSession`) for caching and reactivity.
   - Flow creation (`createBrowserLoginFlow`, `createBrowserRegistrationFlow`) also as queries.
   - Flow submission (`updateLoginFlow`, `updateRegistrationFlow`) as plain async functions (not tanstack mutations) since they involve redirects/page-state changes.

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
- Restricting registration to invited/allowed emails only (client-side gating is sufficient for now)
- Removing the custom identity server from saflib (other products depend on it)
- Migrating admin determination from email allowlist to product-level check

## Questions and Clarifications

- **Kratos courier HTTP config**: The exact payload format for Kratos HTTP courier delivery needs to be verified against the Kratos version being used. The Express endpoint will need to parse the template data and format it into proper emails using the existing email templates.
- **Kratos admin API access from Express**: The monolith needs network access to `kratos:4434` (admin API) for identity lookups in context middleware. This should be straightforward in docker-compose since they're on the same network, but verify the hostname resolves.
