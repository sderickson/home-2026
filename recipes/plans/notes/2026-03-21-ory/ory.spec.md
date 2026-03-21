# Ory Kratos Integration — Dev Environment

## Overview

Replace the home-grown identity server (`@saflib/identity`) with [Ory Kratos](https://www.ory.sh/kratos/) for identity management. Kratos handles user registration, login, logout, session management, email verification, and account recovery as a standalone service.

The current identity server is already fairly decoupled: it runs as a separate HTTP service behind Caddy, sessions are cookie-based with a shared domain, and downstream services only see `X-User-*` headers set by Caddy's `forward_auth`. This means the integration surface is well-defined.

**Scope**: Email/password registration, login, logout, session verification, and email verification — enough to cover current identity features in the `recipes/dev` environment. Social logins, TOTP, WebAuthn, and other Kratos capabilities are out of scope for now.

**Approach**: Kratos runs as a Docker container alongside the existing monolith. The browser interacts with Kratos directly for self-service flows (registration, login, etc.). A thin "auth bridge" endpoint in the monolith translates Kratos sessions into the `X-User-*` headers that downstream services already expect.

## User Stories

- As a user, I want to register with email and password so that I can create an account.
- As a user, I want to log in with my credentials so that I can access my data.
- As a user, I want to log out so that my session is terminated.
- As a user, I want to verify my email address so that my account is fully activated.
- As a user, I want my login to work across all `*.docker.localhost` subdomains so that I don't have to log in separately for each app.
- As an API consumer, I want requests to be authenticated via Kratos sessions so that the API server knows who I am.

## Packages to Modify

- `recipes/dev/`: Add Kratos container to docker-compose, Kratos config files, update Caddy config to expose Kratos public API and update forward_auth.
- `hub/clients/auth/`: Add a Kratos test page (login/register/logout/session display) alongside existing pages.
- `recipes/clients/app/`: Update `AppSpa.vue` to display session state from Kratos.
- `saflib/express/src/middleware/context.ts`: Update to read Kratos-provided headers (identity ID, email, verification status).
- `recipes/dev/caddy-config/common.Caddyfile`: Update `api-proxy` snippet to use Kratos-based auth bridge instead of identity server verify endpoint.

## Infrastructure Changes

### Kratos Docker Service

Added to `recipes/dev/docker-compose.yaml`:
- `kratos-migrate`: Runs DB migrations on startup (SQLite for dev).
- `kratos`: The Kratos server, serving public API (port 4433) and admin API (port 4434).
- `mailpit`: Fake SMTP server for capturing verification emails in dev (web UI at port 8025).

### Kratos Configuration (`recipes/dev/kratos/`)

- `kratos.yml`: Main config — sets cookie domain to `.docker.localhost`, points self-service UI URLs to `auth.docker.localhost`, enables password method and email verification, configures courier to use Mailpit SMTP.
- `identity.schema.json`: Identity schema defining `email` as the sole trait, used as password identifier and verification/recovery address.

### Caddy Changes

- New route: `http://kratos.docker.localhost` → proxies to Kratos public API (port 4433), with CORS enabled for `*.docker.localhost` origins.
- Updated `api-proxy` snippet: `forward_auth` points to an auth bridge endpoint instead of the old identity verify endpoint.

## Auth Bridge Endpoint

A thin HTTP endpoint (in the monolith or as a standalone route) that replaces `/auth/verify`:

1. Receives the forwarded request from Caddy (with cookies).
2. Calls Kratos `/sessions/whoami` with those cookies.
3. Parses the JSON response to extract `identity.id`, `identity.traits.email`, and `identity.verifiable_addresses[0].verified`.
4. Checks admin status (email in `IDENTITY_SERVICE_ADMIN_EMAILS` → scope `"*"`).
5. Sets response headers: `X-User-ID`, `X-User-Email`, `X-User-Email-Verified`, `X-User-Scopes`.
6. Returns 200 (authenticated) or 401 (no valid session).

This means downstream services (`saflib/express/src/middleware/context.ts`) continue reading the same headers with minimal changes (the only change is that `userId` is now a Kratos identity UUID instead of a numeric ID).

## Frontend Pages

1. **Kratos Test Page** (`hub/clients/auth/` — new page at e.g. `/kratos-test`)
   - Purpose: End-to-end validation of Kratos integration.
   - Shows current session state (logged out / logged in with identity details).
   - If logged out: renders login form and registration form using Kratos browser flow API.
   - If logged in: shows identity info and a logout button.
   - Uses `@ory/client` SDK to interact with Kratos public API.

2. **AppSpa.vue** (`recipes/clients/app/AppSpa.vue`)
   - Updated to check session state via Kratos (call `/sessions/whoami` or use the auth bridge).
   - Displays whether user is logged in/out, replacing the current `useProfile` call.
   - Proves cross-subdomain session sharing works (log in on `auth.docker.localhost`, see session on `app.recipes.docker.localhost`).

## Future Enhancements / Out of Scope

- Social login providers (Google, GitHub, etc.)
- TOTP / WebAuthn / passkey support
- Account recovery flow (password reset)
- Migration of existing users from SQLite identity DB to Kratos
- Replacing all existing `@saflib/auth` Vue pages with Kratos-native equivalents
- Ory Oathkeeper for production-grade API gateway auth
- Admin role management via Kratos `metadata_admin` (currently using email allowlist)
- Production deployment configuration (PostgreSQL, real SMTP, HTTPS)

## Questions and Clarifications

- **User ID format change**: Kratos uses UUIDs for identity IDs. The current system may use numeric IDs. Downstream code that parses or stores user IDs will need to handle UUIDs. Is this a concern for any existing data?
- **CSRF strategy for API mutations**: The current double-submit cookie pattern is checked in the verify endpoint. With Kratos, self-service CSRF is handled by Kratos. For API mutations, should the bridge endpoint replicate the CSRF check, or is SameSite=Lax + custom header sufficient for dev?
- **Admin scope mechanism**: Currently derived from `IDENTITY_SERVICE_ADMIN_EMAILS` env var. Should this stay as an email allowlist check in the bridge, or move to Kratos `metadata_admin` field?
- **Mailpit vs Express email relay**: Kratos's built-in courier + Mailpit is simpler for dev. Is there a reason to prefer routing emails through Express instead?
