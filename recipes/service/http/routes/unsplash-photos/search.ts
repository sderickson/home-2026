import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { search } from "@sderickson/recipes-unsplash";
import { throwOnUnsplashError } from "../../unsplash-errors.ts";
import { unsplashPhotoToSearchItem } from "./_helpers.ts";

export const searchUnsplashPhotosHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  if (!auth.userScopes?.includes("*")) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const q = req.query.q as string;
  const perPageRaw = req.query.perPage;
  const perPage = perPageRaw !== undefined ? Number(perPageRaw) : 10;

  const apiResult = await search({
    query: q,
    per_page: perPage,
  });

  if (apiResult.error) {
    throwOnUnsplashError(apiResult.error, "search");
  }

  const unsplashPhotos = apiResult.result.results.map(
    unsplashPhotoToSearchItem,
  );

  const response: RecipesServiceResponseBody["searchUnsplashPhotos"][200] = {
    unsplashPhotos,
  };
  res.status(200).json(response);
});
