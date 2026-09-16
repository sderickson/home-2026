import express, { type IRouter } from "express";
import { createOperationScopedMiddleware } from "@saflib/express";
import { operationJsonSpec as getUsersByIdAdminOperationJsonSpec } from "@saflib/base-spec/operations/getUsersByIdAdmin";
import { getUsersByIdAdminHandler } from "./users-by-id.ts";

/**
 * Site-admin routes (identity lookup, etc.).
 */
export function createAdminRouter(): IRouter {
  const router = express.Router();

  router.get(
    "/admin/users/by-id",
    ...createOperationScopedMiddleware(getUsersByIdAdminOperationJsonSpec),
    getUsersByIdAdminHandler,
  );

  return router;
}
