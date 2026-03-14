import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { unsplash } from "@sderickson/recipes-unsplash";
import {
  isUnsplashRateLimit,
  throwUnsplashRateLimitError,
} from "../../unsplash-rate-limit.ts";
import {
  type UnsplashSearchPhoto,
  unsplashPhotoToSearchItem,
} from "./_helpers.ts";

export const searchUnsplashPhotosHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const q = req.query.q as string;
    const perPageRaw = req.query.perPage;
    const perPage =
      perPageRaw !== undefined ? Number(perPageRaw) : 10;

    let apiResult: Awaited<ReturnType<typeof unsplash.search.getPhotos>>;
    try {
      apiResult = await unsplash.search.getPhotos({
        query: q,
        perPage,
      });
    } catch (e) {
      if (isUnsplashRateLimit(e)) throwUnsplashRateLimitError();
      throw createError(502, "Unsplash search failed", {
        code: "UNSPLASH_ERROR",
      });
    }

    if (apiResult.type !== "success") {
      if (isUnsplashRateLimit(apiResult)) throwUnsplashRateLimitError();
      throw createError(502, "Unsplash search failed", {
        code: "UNSPLASH_ERROR",
      });
    }

    const results = apiResult.response.results as UnsplashSearchPhoto[];
    const unsplashPhotos = results.map(unsplashPhotoToSearchItem);

    const response: RecipesServiceResponseBody["searchUnsplashPhotos"][200] = {
      unsplashPhotos,
    };
    res.status(200).json(response);
  },
);
