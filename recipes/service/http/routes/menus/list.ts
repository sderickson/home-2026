import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  menuQueries,
  CollectionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "../recipes/_collection-auth.ts";
import { listMenusResultToListMenusResponse } from "./_helpers.ts";

export const listMenusHandler = createHandler(async (req, res) => {
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim()
      : "";

  if (!collectionId) {
    throw createError(400, "collectionId is required", {
      code: "VALIDATION_ERROR",
    });
  }

  await requireCollectionMembership(collectionId, {
    requireMutate: false,
  });

  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const { result, error } = await menuQueries.listByCollectionIdMenu(
    recipesDbKey,
    { collectionId },
  );

  if (error) {
    switch (true) {
      case error instanceof CollectionNotFoundError:
        throw createError(404, error.message, { code: "COLLECTION_NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["listMenus"][200] =
    listMenusResultToListMenusResponse(result ?? []);

  res.status(200).json(response);
});
