# Kratos auth flows — Implementation plan

This plan follows [kratos-auth.spec.md](./kratos-auth.spec.md). Run workflows from **recipes/plans**.

**Principles:** Kratos pages live in **`hub/clients/auth/`** only (no `saflib/identity/auth` for this project). **Recipes** is the first app to integrate (shared hub auth client). **Remove hub identity** from hub + recipes monoliths as part of scope. **Do not change** `kratos-courier`. Add **recovery** to **all three** `kratos.yml` files (`recipes/dev`, `deploy/kratos-prod-local`, `deploy/remote-assets`).

---

## Milestone 0 — SDK + Kratos config groundwork

**Packages:** `recipes/service/sdk`, the three `kratos.yml` files above.

**Goal:** SDK helpers for flows you will need next (at minimum registration + session). Enable **recovery** blocks + `ui_url` in all three configs; confirm **verification** `ui_url` and `use: code` match `hub/clients/auth` routes.

**Stopping point:** Dev Kratos reflects config; SDK can create/update registration flow from the app.

---

## Milestone 1 — Registration + logout (first vertical slice)

**Packages:** `hub/clients/auth`, `recipes/clients/...`, SDK as needed.

**Goal:** Kratos **registration** end-to-end: user registers, ends **logged in**, redirects to **recipes app**. Include **logout** in the same milestone (`createBrowserLogoutFlow` → `logout_url`) so you can clear the session while exercising later milestones (login, verification, recovery) without juggling stale sessions. Wire routes only for this slice (no login page yet beyond what’s needed for navigation if any).

**Stopping point:** Manual test on dev: register → lands in recipes with session → **logout** → session cleared (whoami / `toSession` shows logged out).

---

## Milestone 2 — Login

**Packages:** `hub/clients/auth`, recipes wiring.

**Goal:** **Login** flow; successful login redirects into recipes per product rules.

**Stopping point:** Register (existing) + login both work; session shared as expected.

---

## Milestone 3 — Verification + verify wall

**Packages:** `hub/clients/auth`, recipes (gating).

**Goal:** **Verification** (code method). If the user is logged in but email is not verified, show **verify wall** (reuse or add page) instead of the main app—do not redirect straight into the app until policy is satisfied.

**Stopping point:** Unverified user sees wall; after verification, can use recipes normally.

---

## Milestone 4 — Recovery

**Packages:** `hub/clients/auth`, SDK (recovery helpers if not already), all three `kratos.yml` recovery entries verified against routes.

**Goal:** Forgot password → email → complete reset → can log in again.

**Stopping point:** Full recovery path works in dev.

---

## Milestone 5 — Remove hub identity from hub + recipes

**Packages:** `hub/service/monolith`, `recipes/service/monolith`, `package.json` deps, deploy env / Caddy / docker as needed.

**Goal:** No `startHubIdentityService()` (and no `@sderickson/hub-identity` dependency) on these monoliths; env vars and proxies no longer assume identity gRPC service for this stack.

**Stopping point:** Hub and recipes monoliths start without identity service; auth works via Kratos only.

---

## Milestone 6 — Tests and polish

**Goal:** Playwright or integration tests where the repo mocks email; remove or retire prototype-only pages (e.g. Kratos test page) if redundant; i18n/accessibility as needed.

**Stopping point:** CI green; spec acceptance criteria met.
