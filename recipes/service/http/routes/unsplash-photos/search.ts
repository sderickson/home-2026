import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { unsplash } from "@sderickson/recipes-unsplash";
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

    const apiResult = await unsplash.search.getPhotos({
      query: q,
      perPage,
    });

    if (apiResult.type !== "success") {
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
