# Kratos browser auth flows — hub + recipes

## Overview

Ship **production-style** authentication for **hub and recipes** using [Ory Kratos](https://www.ory.sh/kratos/) only: **register**, **login**, **account recovery**, and **email verification**, implemented as Vue pages under **`hub/clients/auth/`** (not `saflib/identity/auth`). A later migration of these patterns into `saflib` is possible but **out of scope** for this project.

**Decommission the hub identity server** for these apps: stop running shared identity from the hub and recipes monoliths (e.g. remove `startHubIdentityService()` from `hub/service/monolith/run.ts` and `recipes/service/monolith/run.ts`), and clean up related dependencies, env, and deploy wiring so nothing in the hub/recipes path depends on the gRPC/OpenAPI identity service. Other products (e.g. notebook) may still use `@sderickson/hub-identity` until separately migrated.

The [prototype integration](../2026-03-21-ory/ory.spec.md) already validated infrastructure: Kratos public API, cookies, `forward_auth`, Express context + admin API, HTTP courier. This project adds **product UX** and **removes the parallel identity stack** for hub/recipes.

The SPA uses Kratos’s **[Frontend API](https://www.ory.com/docs/kratos/reference/api#tag/frontend)** (`@ory/client` / `FrontendApi`): create or fetch flow → render `ui` → `update*Flow`. No custom monolith `POST /auth/*` for credentials.

**Explicitly out of scope for code changes**: **`POST /email/kratos-courier`** and courier formatting (leave as-is unless a bug appears).

**Non-goals**: OIDC/social login, MFA (TOTP/WebAuthn), migrating unrelated products to Kratos.

## User Stories

- As a user, I want to **register** with email and password and land **logged in**, then be sent to the **recipes** app.
- As a user, I want to **log in** with email and password to access the app.
- As a user, I want to **verify my email** using the **code** flow; until verified, the app should keep me on a **verify wall** instead of the main app experience.
- As a user, I want to **reset my password** via email when I forget it.
- As a user, I want to **log out** so my session ends (browser logout flow).
- As a developer, I want **hub and recipes** to rely on **Kratos only**, not the hub identity service, for this stack.

## Packages to Modify

- **`hub/clients/auth/`** — All Kratos-native pages, composables, and routing for login, registration, verification, recovery, logout; shared session helpers (`useKratosSession`, etc.). Both **hub** and **recipes** use this client—implement and validate **recipes first** (there is not yet a logged-in hub experience; a future milestone may add hub-specific post-login UX).
- **`@sderickson/recipes-sdk`** — Kratos helpers (`kratos-client`, `kratos-flows`, `kratos-session`): extend with recovery and verification as needed; single `FrontendApi` config for apps using this SDK.
- **`recipes/clients/...`** — Wire the hub auth SPA into recipes (entry, redirects after auth). Primary integration target before hub-specific shell work.
- **`hub/service/monolith/run.ts`** (and **`recipes/service/monolith/run.ts`**) — Remove `startHubIdentityService()` and dependency on `@sderickson/hub-identity` where no longer required; align env with Kratos-only auth.
- **Deploy / Docker / Caddy / env** — Remove or repoint `IDENTITY_SERVICE_*` (and similar) for hub and recipes where identity server is dropped; ensure `forward_auth` + Kratos paths remain correct. (Exact files emerge during implementation.)
- **Kratos config — all three files** — Add **recovery** (`enabled`, `ui_url`) and keep **verification** aligned with routes, in:
  - `recipes/dev/kratos/kratos.yml`
  - `deploy/kratos-prod-local/kratos.yml`
  - `deploy/remote-assets/kratos/kratos.yml`

**`ui_url` and email links**: Kratos uses `selfservice.flows.*.ui_url` for **browser redirects** when starting or resuming a flow, and the **HTTP courier** includes template fields such as `verification_url` / `recovery_url` built from that configuration so emails point users at the right SPA route (often with flow or token query parameters). Exact construction is version-specific; no need to duplicate URLs manually in the monolith for this spec.

**Verification (`use: code`)**: Kratos runs the **code** method: the user completes verification by entering the code in the UI (nodes from `updateVerificationFlow`). Emails may **also** include a **link** that opens the verification flow in the browser; that does not switch the project to “link-only” mode—the link is a convenience to land on the right page with an active flow, while **code entry** remains the configured method. If the link preloads state, still render whatever `ui.nodes` Kratos returns.

No new **product REST** endpoints for register/login/recovery/verification; session remains Kratos cookies + `toSession()` / whoami.

## Database Schema Updates

None in product DBs. Kratos stores identities and flows.

## Business Objects

None new for product OpenAPI. Self-service contracts are **Kratos flow JSON** from `@ory/client`.

## API Endpoints

### Product (Express)

**No new endpoints** for auth flows. **`POST /email/kratos-courier`** — no changes in this project’s scope.

### Kratos Frontend API (reference)

Use **Frontend** operations: session check; login / registration / logout flows; recovery and verification create/get/update; method names per pinned `@ory/client`.

## Frontend Pages (hub auth client)

All implemented under **`hub/clients/auth/`**, consumed by recipes (first) and hub shell as applicable.

1. **Registration** — Kratos registration flow; on success, session active; **redirect to recipes app** (per `return_to` / app routing rules).
2. **Login** — Kratos login flow; redirect into recipes when appropriate.
3. **Verification** — Code-based verification flow; if session exists but email not verified, **show verify wall** (existing or new page) instead of sending users into the main app—encourage verification first.
4. **Recovery** — Request + complete recovery; `?flow=` / email return handling.
5. **Logout** — `createBrowserLogoutFlow` → navigate to `logout_url`.

**Cross-cutting**: `useKratosSession`; invalidate session after login/register/logout; map `ui.nodes` and error responses that carry updated flows.

## Implementation order (UX)

Work **one flow at a time** (vertical slices), recipes + hub auth client:

1. **Registration** — Including “logged in after register” and redirect to **recipes**.
2. **Login** — Redirect into recipes when ready.
3. **Verification** — Code flow + **verify wall** gating (do not send unverified users straight into the app).
4. **Recovery** — Forgot password → email → complete reset.

**Decommission hub identity** for hub/recipes can proceed in parallel once flows are exercised, or as a final integration step—must complete before calling the project “done” for this scope.

## Future Enhancements / Out of Scope

- Logged-in **hub** home or shell (recipes is the first authenticated destination).
- Migrating **notebook** (or other products) off hub-identity.
- Moving Kratos page implementations from `hub/clients/auth` into `saflib`.
- OIDC/social, MFA, Ory Elements.
- Changes to **kratos-courier** handler behavior or templates.

## Questions and Clarifications

- **Notebook monolith** still calls `startHubIdentityService()` today—out of scope unless we explicitly extend this project to notebook.
- **Recovery URLs**: Add `recovery` to **all three** `kratos.yml` files so dev, prod-local, and remote deploy behave consistently.
