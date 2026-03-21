# Ory Kratos Integration — Implementation Plan

## Milestone 1: Kratos Running in Dev + Reachable from Browser

**Goal**: Add Kratos as a container, expose it via Caddy, and confirm a browser `fetch()` call gets a response from Kratos.

### Tasks

1. **Create Kratos config files** in `recipes/dev/kratos/`:
   - `kratos.yml` — main config:
     - `dsn`: SQLite (`sqlite:///var/lib/sqlite/db.sqlite?_fk=true&mode=rwc`)
     - `serve.public.base_url`: `http://kratos.docker.localhost/`
     - `serve.public.cors`: enabled, allow `http://*.docker.localhost` origins, allow credentials
     - `serve.admin.base_url`: `http://kratos:4434/`
     - `selfservice.default_browser_return_url`: `http://auth.docker.localhost/`
     - `selfservice.flows.registration`: enabled, `ui_url: http://auth.docker.localhost/registration`
     - `selfservice.flows.login.ui_url`: `http://auth.docker.localhost/login`
     - `selfservice.flows.logout.after.default_browser_return_url`: `http://auth.docker.localhost/`
     - `selfservice.flows.verification`: enabled, `ui_url: http://auth.docker.localhost/verification`
     - `selfservice.methods.password.enabled`: true
     - `session.cookie.domain`: `.docker.localhost`
     - `session.cookie.same_site`: `Lax`
     - `courier.smtp.connection_uri`: `smtp://mailpit:1025/?disable_starttls=true`
   - `identity.schema.json` — identity schema:
     - Single trait: `email` (string, format: email)
     - Configured as password identifier and verification/recovery address

2. **Update `recipes/dev/docker-compose.yaml`**:
   - Add `kratos-migrate` service (runs `migrate sql -e --yes`, exits)
   - Add `kratos` service (depends on `kratos-migrate`, runs `serve -c /etc/config/kratos/kratos.yml --dev --watch-courier`)
   - Add `mailpit` service for email capture (image: `axllent/mailpit`, expose port 8025 for web UI)
   - Add `kratos-sqlite` volume

3. **Update `recipes/dev/caddy-config/Caddyfile`**:
   - Add `http://kratos.docker.localhost` block:
     - `import cors docker.localhost`
     - `reverse_proxy kratos:4433`
   - Add `http://mailpit.docker.localhost` block (optional, for easy access to Mailpit UI):
     - `reverse_proxy mailpit:8025`

4. **Verify**: `docker compose up`, then in browser console on any `*.docker.localhost` page:
   ```js
   fetch("http://kratos.docker.localhost/self-service/registration/browser", {
     credentials: "include", redirect: "follow"
   }).then(r => r.json()).then(console.log)
   ```
   Should return a registration flow JSON object.

### Risks / Notes
- Kratos CORS must allow credentials from `*.docker.localhost` origins. If Kratos's built-in CORS wildcard doesn't match subdomains correctly, Caddy can handle CORS instead.
- The `--dev` flag disables some security checks (like requiring HTTPS) which is appropriate for local dev.

---

## Milestone 2: Login/Register/Logout via Auth Client Test Page

**Goal**: A single test page at `http://auth.docker.localhost/kratos-test` where you can register, log in, see session state, and log out — all via Kratos.

### Tasks

1. **Install `@ory/client`** in `hub/clients/auth/` (or at the monorepo root if using workspaces).

2. **Create test page** (e.g. `hub/clients/auth/pages/KratosTest.vue`):
   - On mount, call `FrontendApi.toSession()` to check if there's an active session.
   - **Logged out state**: Show two sections:
     - **Login**: Call `FrontendApi.createBrowserLoginFlow()`, render the returned UI nodes as form fields, submit to Kratos's `action` URL.
     - **Registration**: Call `FrontendApi.createBrowserRegistrationFlow()`, render UI nodes, submit.
   - **Logged in state**: Display identity ID, email, verification status. Show a logout button that calls `FrontendApi.createBrowserLogoutFlow()` then navigates to the logout URL.
   - All SDK calls use `withCredentials: true` and `basePath: "http://kratos.docker.localhost"`.

3. **Add route** in `hub/clients/auth/router.ts` for the test page (e.g. `/kratos-test`).

4. **Verify**:
   - Navigate to `http://auth.docker.localhost/kratos-test`.
   - Register a new account with email/password.
   - Observe the session is active (identity details shown).
   - Log out, confirm session is cleared.
   - Log back in with the same credentials.
   - Check Mailpit at `http://mailpit.docker.localhost` for verification emails.

### Risks / Notes
- Kratos browser flows redirect between the Kratos API and the UI. The test page needs to handle the `flow` query parameter (Kratos redirects back with `?flow=<uuid>`, and the page fetches flow details with that ID).
- `@ory/client` is a plain REST SDK, no React dependency. Works fine with Vue.
- Kratos returns UI "nodes" (input fields, buttons, messages) as JSON. The test page renders them as HTML form elements. This is intentionally low-level for the test page; nicer components can come later.

---

## Milestone 3: Cross-Subdomain Sessions in Recipes App

**Goal**: Log in on `auth.docker.localhost`, then visit `app.recipes.docker.localhost` and see that the user's session state is accurately reflected.

### Tasks

1. **Update `recipes/clients/app/AppSpa.vue`**:
   - Add a session status indicator (e.g. a banner or small status display) that calls Kratos `toSession()` on mount.
   - If session active: show "Logged in as {email}".
   - If no session: show "Not logged in".
   - This should be visible regardless of which page/route is active.
   - Keep the existing `useProfile` / `DynamicRecipesLayout` logic intact for now — this is additive.

2. **Verify cookie sharing**:
   - Log in via `http://auth.docker.localhost/kratos-test`.
   - Navigate to `http://app.recipes.docker.localhost/`.
   - The session status should show "Logged in as {email}".
   - Log out via the test page, refresh recipes app, status should show "Not logged in".

### Risks / Notes
- The Kratos session cookie domain `.docker.localhost` must be sent by the browser to `app.recipes.docker.localhost`. This should work since both are subdomains of `docker.localhost`, but worth testing early.
- The `toSession()` call goes directly to `http://kratos.docker.localhost/sessions/whoami` from the browser. CORS must allow `http://app.recipes.docker.localhost` as an origin with credentials.
- This step is intentionally lightweight — it only proves session sharing works. Full integration with the existing layout/profile system comes in step 4 and beyond.

---

## Milestone 4: API Server Integration via Auth Bridge

**Goal**: API requests to `api.recipes.docker.localhost` are authenticated via Kratos sessions, with identity data propagated to the Express API server via the same `X-User-*` headers as before.

### Tasks

1. **Create auth bridge endpoint** in the monolith (e.g. a new route or small Express middleware):
   - Endpoint: `GET /auth/kratos-verify` (or reuse `/auth/verify` path)
   - Implementation:
     ```
     1. Extract cookies from the incoming request (forwarded by Caddy).
     2. Call Kratos admin or public API: GET http://kratos:4433/sessions/whoami
        with the Cookie header forwarded.
     3. If 401 → return 200 with no user headers (allow unauthenticated, let auth middleware handle it).
        If 200 → parse the session JSON.
     4. Extract: identity.id, identity.traits.email,
        identity.verifiable_addresses[0].verified
     5. Check admin: if email is in IDENTITY_SERVICE_ADMIN_EMAILS and verified → scope "*".
     6. Set response headers:
        X-User-ID: {identity.id}
        X-User-Email: {identity.traits.email}
        X-User-Email-Verified: {verified ? "true" : "false"}
        X-User-Scopes: {scopes joined by comma}
     7. Return 200.
     ```
   - **Open question**: Should unauthenticated requests return 200 (let downstream decide) or 401 (block at Caddy)? Current verify returns 200 with empty user data for unauthenticated requests. Recommend keeping this behavior for compatibility.

2. **Update `recipes/dev/caddy-config/common.Caddyfile`**:
   - Update `api-proxy` snippet's `forward_auth` to point to the bridge endpoint.
   - The `uri`, `copy_headers`, and `header_up` directives should match the bridge's response headers.
   - May be as simple as changing the `uri` path if the bridge reuses the same host and header names.

3. **Update `saflib/express/src/middleware/context.ts`**:
   - Minimal change: the headers are the same names, so the middleware may not need changes at all.
   - If `userId` format changes (numeric → UUID), ensure downstream code handles string IDs (it already treats `userId` as `string`, so this should be fine).

4. **CSRF handling** (for API mutations):
   - For dev: the bridge can skip CSRF checking initially. SameSite=Lax cookies on `docker.localhost` subdomains provide baseline CSRF protection.
   - Longer term: add a custom header check (e.g. require `X-Requested-With` or `X-CSRF-Token` for non-GET requests) in the bridge.

5. **Verify**:
   - Log in via `http://auth.docker.localhost/kratos-test`.
   - Make an API call from `app.recipes.docker.localhost` (e.g. load recipes).
   - Confirm the API server receives correct `X-User-*` headers (check server logs).
   - Confirm the recipes app works end-to-end with authenticated API calls.
   - Test unauthenticated access: log out, confirm API returns 401 for protected routes.

### Risks / Notes
- The bridge endpoint is the linchpin — it translates between Kratos's session model and the existing header-based auth contract. Keep it simple and well-tested.
- Kratos's admin API (`kratos:4434`) can also be used for whoami and provides more data, but the public API with forwarded cookies is simpler and sufficient.
- The `identity.id` in Kratos is a UUID (e.g. `"a1b2c3d4-..."`) vs. the current numeric user ID. The `Auth.userId` type is already `string`, so this should be compatible, but any database foreign keys referencing user IDs will need attention when migrating existing data.

---

## Summary of Key Architecture Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Kratos API access | Expose via `kratos.docker.localhost` through Caddy | Browser needs direct access for self-service flows |
| Session sharing | Cookie domain `.docker.localhost`, SameSite=Lax | Same as current approach, matches subdomain structure |
| API auth (forward_auth) | Thin bridge endpoint wrapping Kratos whoami | Minimizes changes to Caddy config and downstream services |
| Admin scopes | Email allowlist check in bridge (same as current) | Simplest migration path; can move to Kratos metadata later |
| CSRF for API mutations | Defer; SameSite=Lax for dev | Matches current security posture for dev; productionize later |
| Email in dev | Mailpit container + Kratos built-in courier | Simpler than routing through Express; provides inspection UI |
| Frontend SDK | `@ory/client` (REST SDK) | Framework-agnostic, works with Vue |
| Existing auth pages | Keep alongside Kratos test page | Migrate incrementally after core integration is proven |

## Post-Integration Follow-up Tasks

Once all 4 milestones are complete:

1. **Migrate existing auth pages** (`@saflib/auth` login/register/logout/verify pages) to use Kratos flows.
2. **Implement verification flow UI** — render Kratos verification flow in the auth client.
3. **Implement recovery flow UI** — password reset via Kratos.
4. **Account settings** — email change, password change via Kratos settings flow.
5. **Remove identity server** — once all flows are on Kratos, remove `@saflib/identity` and the monolith's identity service.
6. **User data migration** — script to import existing users from SQLite into Kratos.
7. **Production config** — PostgreSQL, real SMTP, HTTPS, Oathkeeper or production-grade auth gateway.
