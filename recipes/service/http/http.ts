import express, { type IRouter } from "express";
import { groupRouterMounts } from "./routers.ts";

/**
 * The recipes feature's router: every handler group in `routers.ts`. The
 * composition root (`@sderickson/recipes-service`) mounts it in the app that
 * `@sderickson/recipes-http-app` builds.
 */
export function createRecipesServiceRouter(): IRouter {
  const router = express.Router();
  for (const mount of groupRouterMounts()) {
    router.use(mount.createRouter());
  }
  return router;
}
