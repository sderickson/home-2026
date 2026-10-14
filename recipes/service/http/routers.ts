import type { Router } from "express";

// BEGIN WORKFLOW AREA router-imports FOR express/add-handler
import { createRecipesRouter } from "./handlers/recipes/index.ts";
// END WORKFLOW AREA

export type GroupRouterMount = {
  kind: "router";
  createRouter: () => Router;
};

/**
 * Group routers owned by this http package.
 * `express/add-handler` upserts imports + mounts inside the workflow areas.
 * Authenticated product routers under `routes/` are still mounted from `http.ts`.
 */
export function groupRouterMounts(): GroupRouterMount[] {
  return [
    // BEGIN WORKFLOW AREA router-mounts FOR express/add-handler
    { kind: "router", createRouter: createRecipesRouter },
    // END WORKFLOW AREA
  ];
}
