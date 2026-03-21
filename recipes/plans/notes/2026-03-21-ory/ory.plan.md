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
     - `courier`: HTTP delivery strategy, POSTing to `http://monolith:3000/email/kratos-courier`
   - `identity.schema.json` — identity schema:
     - Single trait: `email` (string, format: email)
     - Configured as password identifier and verification/recovery address

2. **Update `recipes/dev/docker-compose.yaml`**:
   - Add `kratos-migrate` service:
     - `image: oryd/kratos:v1.3.1` (or latest stable)
     - `command: migrate sql -e --yes`
     - `environment: DSN=sqlite:///var/lib/sqlite/db.sqlite?_fk=true&mode=rwc`
     - `volumes: kratos-sqlite:/var/lib/sqlite, ./kratos:/etc/config/kratos`
   - Add `kratos` service:
     - Same image, depends on `kratos-migrate` (condition: `service_completed_successfully`)
     - `command: serve -c /etc/config/kratos/kratos.yml --dev --watch-courier`
     - Same DSN and volumes
   - Add `kratos-sqlite` volume

3. **Update `recipes/dev/caddy-config/Caddyfile`**:
   - Add `http://kratos.docker.localhost` block:
     ```
     http://kratos.docker.localhost {
       import cors docker.localhost
       reverse_proxy kratos:4433
     }
     ```

4. **Verify**: `docker compose up`, then in browser console on any `*.docker.localhost` page:
   ```js
   fetch("http://kratos.docker.localhost/self-service/registration/browser", {
     credentials: "include", redirect: "follow"
   }).then(r => r.json()).then(console.log)
   ```
   Should return a registration flow JSON object.

### Risks / Notes
- Kratos CORS must allow credentials from `*.docker.localhost` origins. If Kratos's built-in CORS wildcard doesn't match subdomains correctly, Caddy can handle CORS instead (it already has a `cors` snippet).
- The `--dev` flag disables some security checks (like requiring HTTPS) which is appropriate for local dev.
- The courier HTTP delivery config needs to match whatever endpoint we build in milestone 4. For now it can point to a non-existent endpoint; courier will retry.

---

## Milestone 2: Login/Register/Logout via Auth Client Test Page

**Goal**: A single test page at `http://auth.docker.localhost/kratos-test` where you can register, log in, see session state, and log out — all via Kratos.

### Tasks

1. **Install `@ory/client`** in `hub/clients/auth/` (or at an appropriate workspace level).

2. **Create Kratos SDK wrapper** (e.g. `hub/clients/auth/kratos.ts` or shared location):
   - Initialize `FrontendApi` with `basePath: "http://kratos.docker.localhost"` and `withCredentials: true`.
   - Create `useKratosSession()` — a tanstack `useQuery` wrapping `FrontendApi.toSession()`.
     - Returns session + identity on success, or null/error when not authenticated.
     - Handles 401 (not logged in) gracefully — not an error, just "no session".
   - Optionally: tanstack queries for `createBrowserLoginFlow()` and `createBrowserRegistrationFlow()`.

3. **Create test page** (`hub/clients/auth/pages/KratosTest.vue`):
   - On mount, use `useKratosSession()` to check session state.
   - **Logged out state**: Show two sections:
     - **Login**: Fetch login flow, render the returned UI nodes as form fields, submit via `FrontendApi.updateLoginFlow()`. On success, invalidate session query.
     - **Registration**: Fetch registration flow, render UI nodes, submit via `FrontendApi.updateRegistrationFlow()`. On success, invalidate session query.
   - **Logged in state**: Display identity ID, email (from `identity.traits.email`), verification status. Show a logout button that calls `FrontendApi.createBrowserLogoutFlow()` then navigates to the logout URL.
   - Kratos returns "UI nodes" — JSON descriptions of form fields (email input, password input, submit button, CSRF token). Render them as HTML `<input>` elements. The CSRF node is a hidden input that Kratos requires for submission.

4. **Add route** in `hub/clients/auth/router.ts` for the test page (e.g. `/kratos-test`).

5. **Verify**:
   - Navigate to `http://auth.docker.localhost/kratos-test`.
   - Register a new account with email/password.
   - Observe the session is active (identity details shown).
   - Log out, confirm session is cleared.
   - Log back in with the same credentials.

### Risks / Notes
- Kratos browser flows redirect between the Kratos API and the UI. When the browser calls `createBrowserLoginFlow()`, Kratos may redirect to the UI URL with a `?flow=<uuid>` parameter. The test page should check for this query parameter on mount and fetch the flow data if present. Alternatively, using the SDK's AJAX methods (`updateLoginFlow` etc.) avoids full-page redirects.
- `@ory/client` is a plain REST SDK with no framework dependency — works fine in Vue.
- Kratos returns UI "nodes" (input fields, buttons, messages) as JSON. For the test page, rendering them as basic HTML inputs is sufficient. Nicer components can come later when replacing the existing auth pages.
- Kratos manages its own CSRF for self-service flows via hidden form fields in the UI nodes. This is separate from the API CSRF concern handled in milestone 4.

---

## Milestone 3: Cross-Subdomain Sessions in Recipes App

**Goal**: Log in on `auth.docker.localhost`, then visit `app.recipes.docker.localhost` and see that the user's session state is accurately reflected.

### Tasks

1. **Add `@ory/client`** as a dependency for `recipes/clients/app/` (or shared).

2. **Create or reuse `useKratosSession()`** — same tanstack query as milestone 2, possibly extracted to a shared package.

3. **Update `recipes/clients/app/AppSpa.vue`**:
   - Add a session status indicator (e.g. a banner or small text display) that uses `useKratosSession()`.
   - If session active: show "Logged in as {email}".
   - If no session: show "Not logged in".
   - This should be visible regardless of which page/route is active.
   - Keep the existing `useProfile` / `DynamicRecipesLayout` logic intact for now — this is purely additive.

4. **Verify cookie sharing**:
   - Log in via `http://auth.docker.localhost/kratos-test`.
   - Navigate to `http://app.recipes.docker.localhost/`.
   - The session status should show "Logged in as {email}".
   - Log out via the test page, refresh recipes app, status should show "Not logged in".

### Risks / Notes
- The Kratos session cookie (domain `.docker.localhost`) must be sent by the browser to `app.recipes.docker.localhost`. This should work since both are subdomains of `docker.localhost`, but worth testing early.
- The `toSession()` call from the recipes app goes to `http://kratos.docker.localhost/sessions/whoami`. CORS must allow the `http://app.recipes.docker.localhost` origin with credentials.
- This step is intentionally lightweight — it only proves session sharing works. Full integration with the existing layout/profile system comes later.

---

## Milestone 4: API Server Integration

**Goal**: API requests to `api.recipes.docker.localhost` are authenticated via Kratos sessions, with the user ID propagated to the Express API server. CSRF and admin checks are handled in Express.

### Tasks

1. **Update `recipes/dev/caddy-config/common.Caddyfile`**:
   - Update `api-proxy` snippet to use Kratos whoami for `forward_auth`:
     ```
     (api-proxy) {
       handle {
         forward_auth kratos:4433 {
           uri /sessions/whoami
           header_up X-Request-ID {http.request.uuid}
           copy_headers X-Kratos-Authenticated-Identity-Id
         }
         reverse_proxy {args[0]} {
           import reverse_proxy_common
         }
       }
     }
     ```
   - Note: `api-proxy` changes from 2 args (identity host + target host) to 1 arg (just target host), since the auth target is always Kratos. All call sites need updating.
   - Update call sites in `Caddyfile`: `import api-proxy monolith:3000 monolith:3002` → `import api-proxy monolith:3002`.

2. **Update `saflib/express/src/middleware/context.ts`**:
   - Read `X-Kratos-Authenticated-Identity-Id` header instead of `X-User-ID`, `X-User-Email`, etc.
   - Set `auth.userId` from this header. That's it — no email or scopes from headers.
   - Simplify the `Auth` type if desired (remove fields that are no longer header-sourced).

3. **Add CSRF middleware to Express** (`saflib/express/src/middleware/auth.ts` or new file):
   - For non-GET/HEAD requests, require a custom header (e.g. `X-Requested-With: XMLHttpRequest` or a CSRF token).
   - This replaces the CSRF check that was previously in the identity server's verify endpoint.
   - The SDK already sets headers for API calls, so this should be straightforward.

4. **Add admin determination to Express**:
   - Read admin email list from env var (e.g. `ADMIN_EMAILS`).
   - When `auth.userId` is present, look up the user's email from the product database or by calling Kratos admin API (`GET kratos:4434/admin/identities/{id}`).
   - If email matches admin list, set `auth.userScopes = ["*"]` (or a cleaner admin flag).
   - Consider caching the identity lookup to avoid per-request calls to Kratos.

5. **Add Kratos courier email endpoint** to the monolith:
   - `POST /email/kratos-courier` — receives email data from Kratos HTTP courier.
   - Parses the Kratos courier payload (recipient, template type, template data including verification/recovery URLs).
   - Formats into an email and sends via `emailClient.sendEmail()`.
   - In dev (with `MOCK_INTEGRATIONS=true`), emails land in the `sentEmails` array and are accessible via `GET /email/sent` for Playwright tests.

6. **Verify**:
   - Log in via `http://auth.docker.localhost/kratos-test`.
   - Make an API call from `app.recipes.docker.localhost` (e.g. load recipes).
   - Confirm the API server receives `X-Kratos-Authenticated-Identity-Id` and resolves the user correctly.
   - Test CSRF: confirm that POST/PUT/DELETE requests without the CSRF header are rejected.
   - Test admin: log in with an admin email, confirm admin access works.
   - Test unauthenticated access: log out, confirm API returns 401 for protected routes.
   - Test email: register a new user, confirm verification email appears in `GET /email/sent`.

### Risks / Notes
- The `api-proxy` snippet interface changes (2 args → 1 arg). All Caddyfile call sites need updating. The `identity` snippet and `admin-proxy`/`admin-file-server` snippets also reference the identity server and will need attention.
- Admin email lookup adds a per-request call to Kratos admin API (or product DB). For dev this is fine. For production, cache the mapping or store admin status in the product DB.
- The Kratos HTTP courier payload format should be verified against the exact Kratos version. The Express endpoint needs to handle template types: `verification_valid`, `verification_invalid`, `recovery_valid`, `recovery_invalid`.
- CSRF: the simplest approach is requiring `X-Requested-With` header on mutations. The SDK's `fetch` calls can set this. This is less robust than a full double-submit cookie but sufficient for dev and typical SPA usage.

---

## Summary of Key Architecture Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Kratos API access | Expose via `kratos.docker.localhost` through Caddy | Browser needs direct access for self-service flows |
| Session sharing | Cookie domain `.docker.localhost`, SameSite=Lax | Same as current approach, matches subdomain structure |
| API auth (forward_auth) | Caddy forward_auth directly to Kratos whoami | No bridge needed — only user ID is passed via `X-Kratos-Authenticated-Identity-Id` |
| Admin determination | Express middleware checks email against env var admin list | Moved from identity verify to product layer where it belongs |
| CSRF for API mutations | Express middleware requires custom header | Moved from identity verify to product layer; SameSite=Lax provides baseline |
| Email delivery | Kratos HTTP courier → Express endpoint → existing nodemailer/EmailClient | Keeps existing test infrastructure (sentEmails array, /email/sent endpoint, Playwright fixtures) |
| Frontend SDK | `@ory/client` + tanstack query for session | `useKratosSession()` as a cached query; flow submissions as plain async |
| Existing auth pages | Keep alongside Kratos test page | Migrate incrementally after core integration is proven |

## Post-Integration Follow-up Tasks

Once all 4 milestones are complete:

1. **Migrate existing auth pages** (`@saflib/auth` login/register/logout/verify pages) to use Kratos flows.
2. **Implement verification flow UI** — render Kratos verification flow in the auth client.
3. **Implement recovery flow UI** — password reset via Kratos.
4. **Account settings** — email change, password change via Kratos settings flow.
5. **Remove identity server** — once all flows are on Kratos, remove `@saflib/identity` and the monolith's identity service.
6. **Production config** — PostgreSQL, real SMTP, HTTPS, production-grade auth gateway.
7. **Registration restriction** — restrict signups to invited/allowed emails (Kratos webhook or client-side check).
