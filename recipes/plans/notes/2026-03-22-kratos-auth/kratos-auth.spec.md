# Kratos browser auth flows — product SPA

## Overview

Ship **production-style** authentication UX for products that use [Ory Kratos](https://www.ory.sh/kratos/), replacing ad-hoc testing UIs with real **register**, **login**, **account recovery**, and **email verification** flows.

The [prototype integration](../2026-03-21-ory/ory.spec.md) already validated infrastructure: Kratos public API behind Caddy, cookie sessions on a shared parent domain, `forward_auth` + `X-Kratos-Authenticated-Identity-Id`, Express context middleware resolving traits via the admin API, HTTP courier for email, and CSRF on the monolith for state-changing **product** requests.

This project focuses on the **browser self-service layer**: the SPA talks to Kratos’s **[Frontend API](https://www.ory.com/docs/kratos/reference/api#tag/frontend)** (`@ory/client` / `FrontendApi`) using the **flow** model (create or fetch flow → render `ui` → `update*Flow`), not to custom `POST /auth/*` routes on the monolith.

**Non-goals for this spec**: social/OIDC login, MFA (TOTP/WebAuthn), replacing `@saflib/identity` for other products, or new product REST APIs for credentials (Kratos remains the authority).

## User Stories

- As a user, I want to **register** with email and password so I can create an account.
- As a user, I want to **log in** with email and password so I can access the app.
- As a user, I want to **log out** so my session ends (browser logout flow with redirect).
- As a user, I want to **reset my password** via email so I can recover access if I forget it.
- As a user, I want to **verify my email** (link or code per Kratos config) so my account is confirmed.
- As a user, I want clear **inline errors** when credentials or validation fail, consistent with Kratos flow messages.

## Packages to Modify

- **`@sderickson/recipes-sdk` (or equivalent shared SDK path)** — Extend existing Kratos helpers (`kratos-client`, `kratos-flows`, `kratos-session`) with **recovery** and **verification** flow helpers (create browser flow, get flow by id, typed wrappers). Keep a single `FrontendApi` configuration used by apps.
- **`saflib/identity/auth`** — Introduce **Kratos-native** pages or composables (register, login, recovery, verification) that follow the same **routing** patterns as `createAuthRouter` (`auth-router.ts`) but implement **flow lifecycle** instead of `useLogin` / `useRegister` against the identity OpenAPI client. Options: new Vue components alongside existing ones, or a dedicated subfolder (e.g. `pages/kratos/`) consumed by product apps. Reuse shared styling/i18n patterns where practical.
- **Product clients (e.g. `hub/clients/auth`, `recipes/clients/...`)** — Wire routes for `/login`, `/registration`, `/verification`, recovery routes, and optional `?flow=` handling for **return from email links**. Swap or feature-flag from legacy `@saflib/auth` pages to Kratos pages where this project applies.
- **`recipes/dev/kratos/kratos.yml` (and production/deploy Kratos config mirrors)** — Ensure **recovery** is enabled with `ui_url` pointing at the SPA route that hosts the recovery flow (parity with existing `login` / `registration` / `verification` `ui_url` entries). Align paths with the router so email links land on the correct host and path.
- **Documentation** — Short cross-link from `ory.spec.md` or plan notes: prototype test page vs product flows (optional, only if it reduces confusion).

No changes to Express **auth** routes for login/register are required for this feature; session continues to be established by Kratos cookies and observed via `toSession()` / whoami.

## Database Schema Updates

None. Identities and flows are stored by Kratos.

## Business Objects

No new **product** REST resources for this feature. The contract between the SPA and the server for self-service is **Kratos flow JSON** (`LoginFlow`, `RegistrationFlow`, `RecoveryFlow`, `VerificationFlow`, `Session`, etc. from `@ory/client`), not new SAF OpenAPI schemas.

## API Endpoints

### Product (Express) APIs

**No new endpoints** for register, login, recovery, or verification. Those operations use Kratos public API only.

Existing related endpoint (unchanged responsibility):

- **`POST /email/kratos-courier`** — Kratos HTTP courier delivery; already builds verification/recovery emails. Ensure templates remain aligned with `template_type` and link/code fields Kratos sends (see `post-kratos-courier.ts`).

When specifying **future** product-only helpers (e.g. “resend verification” purely in-app), follow `/saflib/openapi/docs/02-api-design.md` — but that is **out of scope** unless Kratos cannot satisfy the UX without a thin proxy (prefer native Kratos flows first).

### Kratos Frontend API (reference)

Implementation must use the documented operations under the **Frontend** tag, for example:

- Session: `toSession` / session check used for “who am I” after navigation.
- Login: `createBrowserLoginFlow`, `getLoginFlow`, `updateLoginFlow`.
- Registration: `createBrowserRegistrationFlow`, `getRegistrationFlow`, `updateRegistrationFlow`.
- Logout: `createBrowserLogoutFlow` then browser navigation to `logout_url`.
- Recovery: `createBrowserRecoveryFlow`, `getRecoveryFlow`, `updateRecoveryFlow` (and handle link-initiated flows by id).
- Verification: `createBrowserVerificationFlow`, `getVerificationFlow`, `updateVerificationFlow` (per enabled method: code vs link).

Exact method names follow `@ory/client` for the pinned Kratos version.

## Frontend Pages

1. **Login**
   - **Purpose**: Password (and future method) login via Kratos login flow.
   - **Behavior**: Load or create browser login flow; render `ui.nodes` (or equivalent mapped fields) including `csrf_token`; submit `updateLoginFlow`; on validation errors, replace flow from error payload; on success, refresh session (invalidate `toSession` query) and redirect per `redirectTo` / product rules.

2. **Registration**
   - **Purpose**: Email + password sign-up aligned with `identity.schema.json` traits.
   - **Behavior**: Same pattern as login with `updateRegistrationFlow` and `traits` (e.g. email); surface `ui.messages` for policy errors.

3. **Account recovery (forgot password)**
   - **Purpose**: Request recovery and complete password reset after email link.
   - **Behavior**: Start `createBrowserRecoveryFlow`; collect identifier email; follow Kratos steps until completion; support **direct** opens with `flow` id from query (email link). Submit via `updateRecoveryFlow`; handle multi-step state via returned flow.

4. **Email verification**
   - **Purpose**: Complete verification per Kratos config (code and/or link).
   - **Behavior**: `createBrowserVerificationFlow` or `getVerificationFlow` when returning from email; submit `updateVerificationFlow`; show success/failure from flow messages.

5. **Logout**
   - **Purpose**: End session using browser logout flow.
   - **Behavior**: `createBrowserLogoutFlow`, then `window.location` to `logout_url` (full navigation); optional post-logout redirect via Kratos `return_to` where supported.

**Cross-cutting**

- **Session query**: Central `useKratosSession` (or equivalent) wrapping `toSession()` with TanStack Query; invalidate after login/register/logout.
- **Routing**: Reuse `authLinks`-style paths where possible; ensure Kratos `selfservice.flows.*.ui_url` values match deployed routes.
- **Accessibility & UX**: Map Kratos `ui.nodes` to accessible labels; preserve loading/disabled states during `update*Flow` calls.

## Future Enhancements / Out of Scope

- OIDC/social login, MFA, WebAuthn.
- Replacing legacy `@saflib/identity` for all products.
- Ory Elements embedded UI (could replace hand-rendered nodes later).
- Product-specific “invite-only registration” gates (client or API) — not required here.
- Caching identity resolution beyond current context middleware behavior.

## Questions and Clarifications

- **Recovery in `kratos.yml`**: Confirm **recovery** `enabled` + `ui_url` are added wherever dev/prod configs are duplicated so email links match the SPA.
- **Verification method**: Dev config uses `verification.use: code`; product UX must match (show code input vs link-only) per environment.
- **Which app ships first**: Hub vs recipes — spec applies to both patterns; implementation may start with one client and extract shared components.
