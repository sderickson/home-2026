import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  menuQueries,
  recipeQueries,
  CollectionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "../recipes/_collection-auth.ts";
import { createMenuResultToCreateMenuResponse } from "./_helpers.ts";

/** Collect unique recipe ids from menu groupings. */
function recipeIdsFromGroupings(
  groupings: { name: string; recipeIds: string[] }[],
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const g of groupings) {
    for (const id of g.recipeIds) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}

export const createMenuHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const data: RecipesServiceRequestBody["createMenu"] = req.body ?? {};

  const collectionId =
    typeof data.collectionId === "string" ? data.collectionId.trim() : "";
  if (!collectionId) {
    throw createError(400, "collectionId is required in request body", {
      code: "VALIDATION_ERROR",
    });
  }

  await requireCollectionMembership(collectionId, {
    requireMutate: true,
  });

  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const userId = auth.userId;

  const groupings = Array.isArray(data.groupings) ? data.groupings : [];
  const recipeIds = recipeIdsFromGroupings(groupings);

  const foundRecipes = await recipeQueries.getByIdsRecipe(
    recipesDbKey,
    recipeIds,
    collectionId,
  );
  if (foundRecipes.length !== recipeIds.length) {
    throw createError(
      400,
      "Recipe ids in groupings must belong to the same collection",
      { code: "VALIDATION_ERROR" },
    );
  }

  const { result, error } = await menuQueries.createMenu(recipesDbKey, {
    collectionId,
    name: data.name ?? "",
    createdBy: userId,
    groupings,
    editedByUserIds: [userId],
  });

  if (error) {
    switch (true) {
      case error instanceof CollectionNotFoundError:
        throw createError(404, error.message, {
          code: "COLLECTION_NOT_FOUND",
        });
      default:
        throw error satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["createMenu"][200] =
    createMenuResultToCreateMenuResponse(result!);

  res.status(200).json(response);
});
