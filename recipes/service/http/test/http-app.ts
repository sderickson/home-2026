import { publicRouteMatcher } from "@saflib/express";
import { buildRecipesHttpApp } from "@sderickson/recipes-http-app";
import type { RecipesServiceContextOptions } from "@sderickson/recipes-service-common";
import { jsonSpec } from "@sderickson/recipes-spec";
import { createRecipesServiceRouter } from "../http.ts";

const isPublicRoute = publicRouteMatcher([jsonSpec]);

/**
 * The full recipes HTTP app for route tests: the feature router in the
 * `http-app` chrome, with public routes taken from `x-public` in the spec.
 */
export function createRecipesHttpApp(
  options: RecipesServiceContextOptions = {},
) {
  return buildRecipesHttpApp({
    ...options,
    mounts: [{ kind: "router", createRouter: createRecipesServiceRouter }],
    isPublicRoute,
  }).app;
}
