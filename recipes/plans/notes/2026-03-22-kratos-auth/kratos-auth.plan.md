# Kratos auth flows — Implementation plan

This plan breaks [kratos-auth.spec.md](./kratos-auth.spec.md) into milestones. Run workflows from **recipes/plans**.

---

## Milestone 1 — SDK + Kratos config

**Packages:** `recipes/service/sdk` (Kratos helpers), `recipes/dev/kratos` (and deploy Kratos config copies if present).

**Goal:** Helpers for recovery and verification flows (create/get/update) alongside existing login/registration/session helpers. Enable **recovery** in `kratos.yml` with `ui_url` aligned to the SPA route you will implement; verify dev email links for recovery and verification point at that host/path.

**Stopping point:** From code or a thin script, you can create and update recovery and verification flows against dev Kratos; config matches routes.

---

## Milestone 2 — Shared Kratos UI components / pages

**Packages:** `saflib/identity/auth` (or a clearly named submodule for Kratos-only pages).

**Goal:** Production-quality Vue pages for login, registration, recovery (request + complete), and verification, using flow lifecycle (`ui.nodes`, error flow extraction, `update*Flow`). Shared composables: session query + invalidation, optional `?flow=` bootstrap for email return. Logout via `logout_url` redirect.

**Stopping point:** Pages work when mounted in a dev app (e.g. temporarily routed from hub auth client).

---

## Milestone 3 — Product wiring

**Packages:** `hub/clients/auth`, `recipes/clients/...` (as chosen), router (`createAuthRouter` or parallel routes).

**Goal:** Wire `authLinks` paths to Kratos pages; remove or gate the prototype-only test page if redundant; ensure redirects and `return_to` behavior match product expectations.

**Stopping point:** End-to-end manual path: register → verify → log out → log in → forgot password → reset → log in, on target domain(s).

---

## Milestone 4 — Tests and polish

**Goal:** Playwright or integration coverage for critical paths where the repo already tests email (mock courier); i18n strings where other auth pages use them; accessibility pass on dynamic nodes.

**Stopping point:** CI green; spec acceptance criteria met.
