# Infisical Integration Specification

## Overview

Integrate [Infisical](https://infisical.com) as an external secret manager so application code can resolve secrets by name instead of reading from environment variables. This keeps secrets out of env files and process env, with a single, simple programmatic API: get secret by name. Authentication uses a single token (e.g. `INFISICAL_TOKEN`); we use the official Infisical Node SDK.

**Goals:**

- Replace or supplement env-based secrets with Infisical for sensitive values.
- One call: get secret by name.
- Token-based auth only (no Universal Auth in scope).
- Use the official Node SDK (`@infisical/sdk` or equivalent per current docs).

## User Stories

- As a developer, I want to fetch a secret by name (e.g. `DATABASE_URL`) so that I can use it in service code without storing it in env.
- As a deployer, I want to provide a single Infisical token so that all secret access is authenticated without managing many env vars.

## Packages to Modify / Add

- **New:** `recipes/service/integrations/infisical/` (or `saflib/integrations/infisical/` if this should be shared across products): Thin wrapper around the Infisical Node SDK.
  - Depend on the official Infisical Node SDK.
  - Read token from env (e.g. `INFISICAL_TOKEN`); optional env for project/environment/path if required by the SDK.
  - Expose a single call: get secret by name (see below).
  - Respect `MOCK_INTEGRATIONS` for tests (return mock or skip real SDK calls).
- **Existing:** Any service that currently reads a secret from `process.env` and should instead use Infisical will be updated to call the new integration (can be a follow-up task).

## Database Schema Updates

None. Infisical is the source of truth; no local DB.

## Business Objects

1. **GetSecretByNameResult**
   - Description: The value of a single secret fetched by name.
   - Properties: `value: string` (the secret value), or an error result per existing `ReturnsError` pattern.

No nested business objects; this is a single string value (or error).

## API Endpoints

This integration exposes a **programmatic API** (Node only), not HTTP routes. Following “one URL per action” in spirit: one function per distinct action.

1. **getSecretByName(name: string)**
   - Purpose: Fetch the value of a secret by its name (e.g. `DATABASE_URL`, `STRIPE_API_KEY`).
   - Request parameters: `name` (string, required).
   - Response: `Promise<ReturnsError<string, InfisicalClientError>>` — on success, the secret value; on failure, a typed error (e.g. not found, unauthorized, network).
   - Error responses: Handle SDK errors and map to a small set of client errors (e.g. `InfisicalNotFoundError`, `InfisicalUnauthorizedError`, `InfisicalNetworkError`).
   - Authorization: Token from env (e.g. `INFISICAL_TOKEN`). No auth args on the function itself.

No other endpoints or overloaded behavior; no batch get in scope.

## Frontend Pages

None. This is a backend/integration-only feature.

## Future Enhancements / Out of Scope

- Universal Auth (client ID + client secret).
- Batch “get many secrets by names” (add only if needed later).
- Multiple projects/environments/paths in one process (keep to one token/project/env for now).
- Migrating all existing env-based secrets to Infisical in one go (can be incremental).

## Questions and Clarifications

- Confirm package location: `recipes/service/integrations/infisical` vs a shared `saflib/integrations/infisical` (e.g. if hub or other apps will use it).
- Confirm env var name for the token: `INFISICAL_TOKEN` (and whether project/environment/path are fixed in code or also env-driven).
