# Recipes product threat model (starter stub)

> Status: **starter stub** — companion to Playwright specs in this package.
> Keep in sync when API surface, Caddy allowlists, or authz tags change.
> Toolkit helpers: [@saflib/security](../../saflib/security/docs/01-overview.md).

## Division of labor

| Layer | Owns |
| --- | --- |
| `@saflib/security` | Portable Playwright helpers (headers, CSRF, CORS, cookies, config factories) |
| `recipes/security/` (this package) | Product specs, this threat model, recipes Caddy allowlists |
| Product owner | Living threat-model updates, new specs for new surface, ops runbooks |

## Shipped controls (recipes)

| Area | Where |
| --- | --- |
| TLS / HSTS, CSP, CORS allowlist, `-Server` | `recipes/dev/caddy-config` (+ deploy templates under `deploy/`) |
| CSRF double-submit, authz, MFA hooks, OpenAPI validation | `@saflib/express` on recipes monolith |
| CSP violation ingest | `@saflib/errors-http` (`POST /csp-violations`) |
| Playwright regression | This package (`npm run test:e2e` against `recipes/dev`) |

## Public API surface (skip Kratos `forward_auth` at Caddy)

Keep in sync with Caddy `@public_monolith` in `recipes/dev/caddy-config/Caddyfile`:

- `GET /health`
- `POST /csp-violations`
- `POST /errors/record`, `POST /product-events/record`
- `GET /dev/logs`, `GET /dev/logs/stream` (development only)
- `GET /admin/metrics/snapshot`, `GET /admin/product-events`, `GET /admin/errors` (dev observability chrome)

Authenticated product routes (`/recipes`, `/collections`, `/menus`, …) require a Kratos session; mutating routes also require CSRF. Recipes routers enforce email verification in scoped middleware.

## Spec map

| Spec | Probes |
| --- | --- |
| `authz.spec.ts` | Unauthenticated `/recipes` + `/admin/users/by-id`; non-admin admin route |
| `csrf.spec.ts` | Double-submit on `POST /recipes`; public CSP ingest; evil-origin leak |
| `cors.spec.ts` | Allowlist for `app.recipes`; deny `evil.localhost` |
| `info-disclosure.spec.ts` | `/health` body; JSON error hygiene; SPA root |
| `input-validation.spec.ts` | `POST /errors/record` HTML / size / OpenAPI |
| `security-headers.spec.ts` | Hub + recipes SPA roots |
| `open-redirect.spec.ts` | Kratos `return_to` allowlist |
| `cookies.spec.ts` / `transport.spec.ts` | `@canary` production HTTPS |

## Owner responsibilities

1. Run `npm run test:e2e -w @sderickson/recipes-security` against a running `recipes/dev` stack before merging edge / HTTP / client changes.
2. Update this document when the security story changes.
3. Extend specs for new destructive or authz-sensitive routes.
4. Production canary (`npm run test:e2e:canary`) when public HTTPS is live.
