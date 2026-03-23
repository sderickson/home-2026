# Kratos auth flows — Implementation plan

This plan follows [kratos-auth.spec.md](./kratos-auth.spec.md). Run workflows from **recipes/plans**.

**Principles:** Kratos pages live in **`hub/clients/auth/`** only (no `saflib/identity/auth` for this project). **Recipes** is the first app to integrate (shared hub auth client). **Remove hub identity** from hub + recipes monoliths as part of scope. **Do not change** `kratos-courier`. Add **recovery** to **all three** `kratos.yml` files (`recipes/dev`, `deploy/kratos-prod-local`, `deploy/remote-assets`).

---

## Implementation workflows

Work is broken into **one workflow file per milestone** (same idea as [menus-m2-menus-frontend.workflow.ts](../2026-03-13-menus/menus-m2-menus-frontend.workflow.ts): composed of `CdStepMachine`, `makeWorkflowMachine(...)`, `CommandStepMachine`, and focused prompts). The **orchestrator** is [kratos-auth.workflow.ts](./kratos-auth.workflow.ts).

**Working directory:** Run `npm exec saf-workflow` from **`recipes/plans`**. Every **`Cd`** is relative to that starting directory (and then relative to the cwd left by the previous step).

**Valid `cd` targets (must be a package with `package.json`, or repo root for file edits):**

| Goal | From `recipes/plans` | After prior `cd` |
|------|----------------------|------------------|
| Repo root | `../..` | — |
| `recipes/service/sdk` | `../service/sdk` | From root: `recipes/service/sdk` |
| `hub/clients/auth` | `../../hub/clients/auth` | From `recipes/service/sdk`: `../../../hub/clients/auth` |

**Do not** `cd` into `recipes/` alone — it is not a package and workflows error (`Package.json not found`).

### TanStack hooks: `sdk/add-query` / `sdk/add-mutation` vs Kratos

The **`sdk/add-query`** and **`sdk/add-mutation`** workflows generate modules that call **`getClient()`** against the **product OpenAPI** spec. **Kratos** uses **`@ory/client` `FrontendApi`** (`toSession`, `updateLoginFlow`, etc.) — those methods are **not** on the OpenAPI client.

So for Kratos we **do not** run those generators against fake REST paths (they would emit the wrong HTTP layer). Instead, each milestone uses **one `PromptStepMachine` per hook** (or per small group), written to mirror the **same shape** as generated SDK code (`queryOptions`, `useQuery`, `useMutation`, exports from `requests/kratos/index.ts`), but calling **`getKratosFrontendApi()`** or **`kratos-flows`** async helpers.

**JIT:** Registration/login/recovery/verification TanStack wrappers are added in **M1–M4** when the corresponding views land, not all in M0. M0 only cements **session query** + **kratos.yml** + **kratos-client** / **kratos-flows** async fetchers.

### SDK inventory (by milestone)

| Milestone | Query-ish | Mutation-ish | Plain async (`kratos-flows.ts`) |
|-----------|-----------|--------------|----------------------------------|
| **M0** | Session: `useKratosSession` / `kratosSessionQueryOptions` (`toSession`) | — | Already: `fetchBrowserLoginFlow`, `fetchBrowserRegistrationFlow`, `fetch*FlowById` |
| **M1** | Optional: registration flow `useQuery` (cache create/get-by-id) | `useUpdateRegistrationFlowMutation` | Extend only if new `fetch*` needed |
| **M2** | Optional: login flow `useQuery` | `useUpdateLoginFlowMutation` | Extend only if new `fetch*` needed |
| **M3** | Verification flow `useQuery` | `useUpdateVerificationFlowMutation` | `fetchBrowserVerificationFlow` / `getVerificationFlow` if missing |
| **M4** | Recovery flow `useQuery` | `useUpdateRecoveryFlowMutation` | `fetchBrowserRecoveryFlow`, `getRecoveryFlow`, etc. |

### Workflow files

| Milestone | Workflow id | File |
|-----------|----------------|------|
| 0 | `plans/kratos-auth-m0-config-sdk` | [kratos-auth-m0-config-sdk.workflow.ts](./kratos-auth-m0-config-sdk.workflow.ts) |
| 1 | `plans/kratos-auth-m1-registration-logout` | [kratos-auth-m1-registration-logout.workflow.ts](./kratos-auth-m1-registration-logout.workflow.ts) |
| 2 | `plans/kratos-auth-m2-login` | [kratos-auth-m2-login.workflow.ts](./kratos-auth-m2-login.workflow.ts) |
| 3 | `plans/kratos-auth-m3-verification` | [kratos-auth-m3-verification.workflow.ts](./kratos-auth-m3-verification.workflow.ts) |
| 4 | `plans/kratos-auth-m4-recovery` | [kratos-auth-m4-recovery.workflow.ts](./kratos-auth-m4-recovery.workflow.ts) |
| 5 | `plans/kratos-auth-m5-remove-hub-identity` | [kratos-auth-m5-remove-hub-identity.workflow.ts](./kratos-auth-m5-remove-hub-identity.workflow.ts) |
| 6 | `plans/kratos-auth-m6-tests-polish` | [kratos-auth-m6-tests-polish.workflow.ts](./kratos-auth-m6-tests-polish.workflow.ts) |

**Route alignment:** Kratos `registration.ui_url` may use **`/registration`**; `authLinks.register` uses **`/register`**. Pick one path and align **router + kratos.yml**.

**Verify wall (M3):** Lives in **`hub/clients/auth`** (shared auth SPA), **not** in `recipes/clients/app`, so any product using hub auth gets the same post-registration / unverified-email behavior.

| Auth pages | `vue/add-view` (`AddSpaViewWorkflowDefinition`) | Under **`hub/clients/auth`** (`./pages/...`). |
| Config / monolith | `PromptStepMachine` | `kratos.yml`, `run.ts`, env, Caddy. |
| E2E | `vue/add-e2e-test` | After `Cd` to `hub/clients/auth`. |

---

## Milestone 0 — Kratos config + session query + kratos client/fetchers

**Packages:** `recipes/service/sdk`, the three `kratos.yml` files.

**Goal:** Three YAML files updated; **`kratos-session`** session query solid; **`kratos-client`** + **`kratos-flows`** ready; **no** registration/login JIT hooks in M0.

**Stopping point:** Dev Kratos config includes recovery block; SDK typechecks; session query works.

---

## Milestone 1 — Registration + logout

**Packages:** `recipes/service/sdk` (JIT registration hooks), `hub/clients/auth`, recipes redirect wiring.

**Goal:** JIT **registration** query/mutation modules; registration **vue/add-view**; **logout**; replace **createAuthRouter** with a plain router or register Kratos routes first / drop legacy auth shell; redirect to recipes.

**Stopping point:** register → recipes → logout → session cleared.

---

## Milestone 2 — Login

**Packages:** `recipes/service/sdk` (JIT login hooks), `hub/clients/auth`.

**Goal:** JIT login mutation + optional login-flow query; login page; router; redirect to recipes.

**Stopping point:** Login works end-to-end with M1.

---

## Milestone 3 — Verification + verify wall (auth app)

**Packages:** `recipes/service/sdk` (JIT verification hooks), `hub/clients/auth`.

**Goal:** Verification flow page; **verify wall** route/guard in **hub auth** so unverified users stay in the shared SPA; **no** verify wall in recipes.

**Stopping point:** Unverified user hits wall in auth app; after verification, can reach recipes.

---

## Milestone 4 — Recovery

**Packages:** `recipes/service/sdk` first, then `hub/clients/auth`.

**Goal:** JIT recovery query/mutation + async `fetch*` in `kratos-flows`; recovery **vue/add-view**; email link + `?flow=` works.

**Stopping point:** Full recovery path in dev.

---

## Milestone 5 — Remove hub identity from hub + recipes

**Packages:** `hub/service/monolith`, `recipes/service/monolith`, deps, deploy env / Caddy / docker.

**Goal:** No `startHubIdentityService()` on these monoliths; env/proxies updated for hub/recipes.

**Stopping point:** Monoliths start; Kratos-only auth.

---

## Milestone 6 — Tests and polish

**Goal:** E2E; retire redundant prototype pages if replaced; i18n/a11y.

**Stopping point:** CI green; spec met.
