import type { Router } from "express";
import { createAdminRouter } from "./routes/admin/index.ts";

// BEGIN WORKFLOW AREA router-imports FOR express/add-handler
import { createRecipesRouter as createRecipesShareRouter } from "./handlers/recipes/index.ts";
import { createMenusShareRouter } from "./handlers/menus/index.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler
import { createCollectionsRouter } from "./routes/collections/index.ts";
import { createMenusRouter } from "./routes/menus/index.ts";
import { createRecipesRouter } from "./routes/recipes/index.ts";
import { createUnsplashPhotosRouter } from "./routes/unsplash-photos/index.ts";
// END WORKFLOW AREA

export type GroupRouterMount = {
  kind: "router";
  createRouter: () => Router;
};

/**
 * Group routers owned by this http package, in mount order: admin, the
 * public share routers, then the authenticated product routers.
 * `express/add-handler` upserts imports + mounts inside the workflow areas.
 */
export function groupRouterMounts(): GroupRouterMount[] {
  return [
    { kind: "router", createRouter: createAdminRouter },
    // BEGIN WORKFLOW AREA router-mounts FOR express/add-handler
    { kind: "router", createRouter: createRecipesShareRouter },
    { kind: "router", createRouter: createMenusShareRouter },
    // END WORKFLOW AREA
    // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler
    { kind: "router", createRouter: createRecipesRouter },
    { kind: "router", createRouter: createUnsplashPhotosRouter },
    { kind: "router", createRouter: createCollectionsRouter },
    { kind: "router", createRouter: createMenusRouter },
    // END WORKFLOW AREA
  ];
}
