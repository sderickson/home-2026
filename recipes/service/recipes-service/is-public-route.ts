import type { Request } from "express";
import { publicRouteMatcher } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

/**
 * Whether a request may reach the recipes routers without a Kratos session:
 * exactly the operations marked `x-public` in the recipes spec (share pages
 * and their files). Keep Caddy's public recipes paths in sync.
 *
 * Health, CSP reports, error reporting and development observability routes
 * are mounted before the auth gate (`@sderickson/recipes-http-app`), so they
 * don't need listing here.
 */
export const isPublicRecipesRoute: (req: Request) => boolean =
  publicRouteMatcher([jsonSpec]);
