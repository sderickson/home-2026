import {
  buildRecipesHttpApp,
  type HttpRouterMount,
  type RecipesHttpAppLease,
} from "@sderickson/recipes-http-app";
import { createRecipesServiceRouter } from "@sderickson/recipes-http";
import type { RecipesServiceContextOptions } from "@sderickson/recipes-service-common";
import { isPublicRecipesRoute } from "./is-public-route.ts";

/** Every product router. Feature http packages never mount each other; the composition root does. */
export function productionMounts(): HttpRouterMount[] {
  return [{ kind: "router", createRouter: createRecipesServiceRouter }];
}

/** Creates the full production HTTP server for the recipes service. */
export function createRecipesHttpApp(
  options: RecipesServiceContextOptions = {},
): RecipesHttpAppLease {
  return buildRecipesHttpApp({
    ...options,
    mounts: productionMounts(),
    isPublicRoute: isPublicRecipesRoute,
  });
}
