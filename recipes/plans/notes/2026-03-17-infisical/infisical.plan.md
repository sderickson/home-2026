# Infisical Integration — Implementation Plan

## Summary

Implement the Infisical integration per the spec: one package (integration wrapper), token auth from env, Node SDK, single call `getSecretByName`. No REST API, no DB, no frontend.

## Workflows to Run

### 1. Create the integration package

- **Workflow:** `integrations/init`
- **Args:**
  - `name`: `@sderickson/recipes-infisical` (or the repo’s preferred scope/name)
  - `path`: `recipes/service/integrations/infisical`
- **Notes:** This creates the package with client, env schema, mock, and test script. Afterward we will replace the default HTTP client with a small wrapper around the Infisical Node SDK that reads `INFISICAL_TOKEN` from env (and any required project/environment/path if the SDK needs them). Add `INFISICAL_TOKEN` to the integration’s env schema (via `env/add-var` in that package if the init template doesn’t include a placeholder we can rename).

### 2. Add the single call: get secret by name

- **Workflow:** `integrations/add-call`
- **Args:**
  - `path`: `./calls/get-secret-by-name.ts`
- **Notes:** Implement the call to resolve a secret by name using the Infisical client. Return type: `Promise<ReturnsError<string, InfisicalClientError>>`. Implement mock for when `MOCK_INTEGRATIONS` is set. Define a small set of client errors (e.g. `InfisicalNotFoundError`, `InfisicalUnauthorizedError`, `InfisicalNetworkError`) and map SDK errors to them. Export the call and types from the package index.

## Implementation order

1. Run **integrations/init** for `recipes/service/integrations/infisical`.
2. In the new package:
   - Add dependency on the official Infisical Node SDK (e.g. `@infisical/sdk` — confirm package name from current Infisical docs).
   - Add `INFISICAL_TOKEN` to env schema (and optional env for project/environment/path if needed).
   - Replace or adapt the generated client to use the SDK with token auth (no HTTP client to Infisical API; the SDK handles it).
3. Run **integrations/add-call** for `./calls/get-secret-by-name.ts`.
4. Implement the call: call the SDK (or list + find by name if the SDK has no direct get-by-name), map errors, respect `MOCK_INTEGRATIONS`.
5. Export `getSecretByName` and error types from the package root.
6. Manual: add a short README or doc comment on how to set `INFISICAL_TOKEN` and use `getSecretByName` in services.

## Out of scope for this plan

- OpenAPI routes, Express handlers, Drizzle, frontend, batch get, Universal Auth.
- Migrating existing env-based secrets to Infisical (separate, incremental task).

## Stopping points

- After step 1: package exists and builds.
- After steps 2–5: integration is usable from other packages; tests and mocks pass.
- After step 6: ready for first consumer (e.g. one service switching one secret from env to `getSecretByName`).
