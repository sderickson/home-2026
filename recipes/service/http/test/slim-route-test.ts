import { recipesDb } from "@sderickson/recipes-db/instances";
import type { Express, Router } from "express";
import express from "express";
import type { DbKey } from "@saflib/drizzle";
import {
  createErrorMiddleware,
  createGlobalMiddleware,
} from "@saflib/express";

import {
  makeContext,
  recipesServiceStorage,
} from "@sderickson/recipes-service-common";

export type SlimRouteTestLease = {
  recipesDbKey: DbKey;
};

export type SlimRouteTestContext = {
  app: Express;
  lease: SlimRouteTestLease;
  dbKey: DbKey;
};

/**
 * Builds a slim HTTP app for route tests (single router or small router group).
 * Call {@link releaseSlimRouteTest} in `afterAll`.
 */
export function acquireSlimRouteTest(options: {
  mounts: Array<{ kind: "router"; createRouter: () => Router }>;
}): SlimRouteTestContext {
  const dbKey = recipesDb.connect();
  const context = makeContext({ recipesDbKey: dbKey });

  const app = express();
  app.use(
    createGlobalMiddleware({
      disableCors: true,
    }),
  );
  app.set("trust proxy", 1);

  app.use((_req, _res, next) => {
    recipesServiceStorage.run(context, () => {
      next();
    });
  });

  for (const mount of options.mounts) {
    app.use(mount.createRouter());
  }

  app.use(createErrorMiddleware());

  return {
    app,
    lease: { recipesDbKey: dbKey },
    dbKey,
  };
}

/** Slim app mounting one production route router. */
export function acquireRouterSlimRouteTest(
  createRouter: () => Router,
): SlimRouteTestContext {
  return acquireSlimRouteTest({
    mounts: [{ kind: "router", createRouter }],
  });
}

/** Slim app mounting multiple production route routers. */
export function acquireRouterSlimRouteTestMulti(
  createRouters: Array<() => Router>,
): SlimRouteTestContext {
  return acquireSlimRouteTest({
    mounts: createRouters.map((createRouter) => ({
      kind: "router",
      createRouter,
    })),
  });
}

export function releaseSlimRouteTest(lease: SlimRouteTestLease): void {
  recipesDb.disconnect(lease.recipesDbKey);
}
