# Ory Kratos Integration — Implementation Plan

> **Model recommendations**: Milestones 1 and 4 benefit from a more capable model (Kratos config is finicky; milestone 4 has the most architectural surface area). Milestones 2 and 3 are good candidates for Composer — they're Vue component work where you can iterate interactively against the running Kratos container.

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

> Composer is a good fit for this milestone. The Kratos container is running from milestone 1, so you can iterate interactively.

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
- Kratos browser flows involve a `?flow=<uuid>` query parameter. When Kratos redirects back to the UI URL, the page needs to check for this parameter on mount and fetch the flow data. Alternatively, using the SDK's AJAX-style methods (`updateLoginFlow` etc.) avoids full-page redirects — this is the recommended approach for the test page.
- `@ory/client` is a plain REST SDK with no framework dependency — works fine with Vue.
- Kratos manages its own CSRF for self-service flows via hidden form fields in the UI nodes. This is separate from the API CSRF concern handled in milestone 4.

---

## Milestone 3: Cross-Subdomain Sessions in Recipes App

**Goal**: Log in on `auth.docker.localhost`, then visit `app.recipes.docker.localhost` and see that the user's session state is accurately reflected.

> Composer is a good fit for this milestone. It's a small additive change to AppSpa.vue.

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
- The Kratos session cookie (domain `.docker.localhost`) must be sent by the browser to `app.recipes.docker.localhost`. This should work since both are subdomains of `docker.localhost`, but is the key thing this milestone validates.
- The `toSession()` call from the recipes app goes to `http://kratos.docker.localhost/sessions/whoami`. CORS must allow the `http://app.recipes.docker.localhost` origin with credentials.

---

## Milestone 4: API Server Integration + Express Middleware

**Goal**: API requests to `api.recipes.docker.localhost` are authenticated via Kratos sessions. Express middleware handles CSRF, admin determination, and identity resolution. Kratos courier emails flow through the existing email infrastructure.

### Tasks

#### 4a. Caddy: Add `kratos-api-proxy` snippet

Update `recipes/dev/caddy-config/common.Caddyfile`:

- **Add** `(kratos-api-proxy)` snippet — takes 1 arg (target service host):
  ```
  (kratos-api-proxy) {
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
- **Keep** existing `(api-proxy)` snippet (identity server, 2 args) but **remove** the `header_up X-Csrf-Token` line (CSRF moves to Express).
- **Keep** existing `(identity)` and `(admin-proxy)` and `(admin-file-server)` snippets — other products use them.
- Update `recipes/dev/caddy-config/Caddyfile` to use the new snippet for the recipes API:
  ```
  http://api.recipes.docker.localhost {
    import cors recipes.docker.localhost
    import kratos-api-proxy monolith:3002
  }
  ```

#### 4b. Express: Make `Auth` type fields optional

Update `saflib/node/src/types.ts`:
```typescript
interface Auth {
  userId: string;
  userEmail?: string;
  userScopes?: string[];
  emailVerified?: boolean;
}
```

Update `saflib/express/src/middleware/auth.ts`: change `auth.userScopes.includes("*")` to `auth.userScopes?.includes("*")`.

Any downstream code that accesses `auth.userEmail`, `auth.userScopes`, or `auth.emailVerified` needs to handle the optional case. Check for breakage.

#### 4c. Express: Update context middleware for dual-path auth

Update `saflib/express/src/middleware/context.ts` to handle both code paths:

1. **Identity server path** (existing): If `X-User-ID` header present, read all `X-User-*` headers and populate `Auth` from them. (Existing behavior, preserved.)

2. **Kratos path** (new): If `X-Kratos-Authenticated-Identity-Id` header present:
   - Call Kratos admin API: `GET http://{KRATOS_ADMIN_HOST}/admin/identities/{id}` (where `KRATOS_ADMIN_HOST` comes from env, e.g. `kratos:4434`)
   - Extract `userEmail` from `identity.traits.email`
   - Extract `emailVerified` from `identity.verifiable_addresses[0].verified`
   - Check email against `IDENTITY_SERVICE_ADMIN_EMAILS` env var → set `userScopes: ["*"]` if admin
   - Populate `Auth` with all resolved fields

The middleware becomes async for the Kratos path. Pattern:
```typescript
const contextMiddleware: Handler = (req, res, next) => {
  resolveAuth(req).then((auth) => {
    // ... create context with auth, run in AsyncLocalStorage ...
    next();
  }).catch(next);
};
```

Where `resolveAuth` is a helper that handles both paths, sync for identity-server, async for Kratos.

#### 4d. Express: Add CSRF middleware

Add CSRF checking to `saflib/express/src/middleware/auth.ts` (or a new file):
- For non-GET/HEAD/OPTIONS requests, require a custom header (e.g. `X-Requested-With` or a CSRF token).
- Skip for routes tagged `no-auth` (same as auth middleware).
- This replaces the CSRF check that was previously in the identity server's verify endpoint.
- Applies to both identity-server and Kratos setups.

#### 4e. Express: Add Kratos courier email endpoint

Add an endpoint to the monolith (or to the email router):
- `POST /email/kratos-courier` — receives email data from Kratos HTTP courier.
- Parses the Kratos courier payload (recipient, template type, template data including verification/recovery URLs).
- Formats into an email and sends via `emailClient.sendEmail()`.
- In dev (with `MOCK_INTEGRATIONS=true`), emails land in the `sentEmails` array and are accessible via `GET /email/sent` for Playwright tests.

#### 4f. Verify

- Log in via `http://auth.docker.localhost/kratos-test`.
- Make an API call from `app.recipes.docker.localhost` (e.g. load recipes).
- Confirm the API server receives `X-Kratos-Authenticated-Identity-Id` and resolves the user correctly (check logs for email, admin status).
- Test CSRF: confirm that POST/PUT/DELETE requests without the required header are rejected.
- Test admin: log in with an admin email, confirm admin access works.
- Test unauthenticated access: log out, confirm API returns 401 for protected routes.
- Test email: register a new user, confirm verification email appears in `GET /email/sent`.

### Risks / Notes
- **Per-request Kratos call**: The Kratos admin API call in context middleware adds latency to every authenticated request. Acceptable for now; will be replaced with a product-level lookup (e.g. user table in the product DB) later. Could also add a simple in-memory cache (identity UUID → email/admin, TTL 60s) to reduce calls.
- **Kratos admin API access**: The monolith needs network access to `kratos:4434`. In docker-compose they're on the same network, so `kratos:4434` should resolve. Add a `KRATOS_ADMIN_URL` env var (e.g. `http://kratos:4434`) to `recipes/dev/env.dev`.
- **CSRF approach**: The simplest option is requiring a custom header like `X-Requested-With: XMLHttpRequest` on mutations. The existing SDK fetch calls can set this. More robust than nothing, less complex than double-submit cookies.
- **`Auth` type optionality ripple**: Making `userEmail`, `userScopes`, `emailVerified` optional may cause TypeScript errors in downstream code that assumes they're present. `getSafContextWithAuth()` returns `SafContextWithAuth` — callers may need to handle the optional fields or use a stricter helper that guarantees all fields (for identity-server setups).
- **Kratos courier HTTP payload**: The exact format depends on Kratos version. Need to verify against the version we use. The Express endpoint should log the raw payload initially for debugging.

---

## Summary of Key Architecture Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Kratos API access | Expose via `kratos.docker.localhost` through Caddy | Browser needs direct access for self-service flows |
| Session sharing | Cookie domain `.docker.localhost`, SameSite=Lax | Same as current approach, matches subdomain structure |
| API auth (forward_auth) | New `kratos-api-proxy` Caddy snippet using whoami | Copies only `X-Kratos-Authenticated-Identity-Id`; Express resolves the rest |
| Identity server compat | Keep existing `api-proxy`, `identity` Caddy snippets | Other products depend on them; share common.Caddyfile across products |
| Admin determination | Express reads `IDENTITY_SERVICE_ADMIN_EMAILS`, checks email from Kratos API | Moved from identity verify to product layer; temporary until product-level check |
| CSRF | Express middleware for both identity-server and Kratos setups | Moved from identity verify; single responsibility |
| Email delivery | Kratos HTTP courier → Express endpoint → existing nodemailer/EmailClient | Keeps existing test infrastructure (sentEmails array, /email/sent, Playwright fixtures) |
| Database | SQLite for both dev and prod (Kratos and product) | Consistent with existing product DB approach |
| Frontend SDK | `@ory/client` + tanstack query for session | `useKratosSession()` as a cached query; flow submissions as plain async |
| Existing auth pages | Keep alongside Kratos test page | Migrate incrementally after core integration is proven |

## Post-Integration Follow-up Tasks

Once all 4 milestones are complete:

1. **Migrate existing auth pages** (`@saflib/auth` login/register/logout/verify pages) to use Kratos flows.
2. **Implement verification flow UI** — render Kratos verification flow in the auth client.
3. **Implement recovery flow UI** — password reset via Kratos.
4. **Account settings** — email change, password change via Kratos settings flow.
5. **Replace per-request Kratos call** — store user email/admin status in product DB, look up from there instead of calling Kratos admin API on every request.
6. **Production config** — real SMTP for courier, HTTPS, production-grade deployment.
7. **Registration restriction** — client-side gating for allowed/invited emails.
