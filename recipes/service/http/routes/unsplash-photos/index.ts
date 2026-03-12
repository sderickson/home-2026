import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

import { searchUnsplashPhotosHandler } from "./search.ts";

export const createUnsplashPhotosRouter = () => {
  const router = express.Router();

  router.use(
    "/unsplash-photos",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: true,
    }),
  );
  router.get("/unsplash-photos/search", searchUnsplashPhotosHandler);

  return router;
};
