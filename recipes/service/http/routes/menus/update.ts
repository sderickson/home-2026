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
  MenuNotFoundError,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "../recipes/_collection-auth.ts";
import { updateMenuResultToUpdateMenuResponse } from "./_helpers.ts";

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

export const updateMenuHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const id = req.params.id as string;
  const data: RecipesServiceRequestBody["updateMenu"] = req.body ?? {};

  const collectionId =
    typeof data.collectionId === "string" ? data.collectionId.trim() : "";
  if (!collectionId) {
    throw createError(400, "collectionId is required in request body", {
      code: "VALIDATION_ERROR",
    });
  }

  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const userId = auth.userId;

  const { result: menu, error: menuError } = await menuQueries.getByIdMenu(
    recipesDbKey,
    id,
  );

  if (menuError) {
    switch (true) {
      case menuError instanceof MenuNotFoundError:
        throw createError(404, menuError.message, { code: "MENU_NOT_FOUND" });
      default:
        throw menuError satisfies never;
    }
  }

  if (menu!.collectionId !== collectionId) {
    throw createError(403, "Menu not in collection", { code: "FORBIDDEN" });
  }

  await requireCollectionMembership(collectionId, {
    requireMutate: true,
  });

  const groupings = Array.isArray(data.groupings) ? data.groupings : [];
  const recipeIds = recipeIdsFromGroupings(groupings);

  for (const recipeId of recipeIds) {
    const out = await recipeQueries.getByIdRecipe(recipesDbKey, recipeId);
    if (out.error) {
      switch (true) {
        case out.error instanceof RecipeNotFoundError:
          throw createError(
            400,
            "Recipe ids in groupings must belong to the same collection",
            { code: "VALIDATION_ERROR" },
          );
        default:
          throw out.error satisfies never;
      }
    }
    if (out.result.recipe.collectionId !== collectionId) {
      throw createError(
        400,
        "Recipe ids in groupings must belong to the same collection",
        { code: "VALIDATION_ERROR" },
      );
    }
  }

  const editedByUserIds = menu!.editedByUserIds.includes(userId)
    ? menu!.editedByUserIds
    : [...menu!.editedByUserIds, userId];

  const { result: updated, error: updateError } =
    await menuQueries.updateMenu(recipesDbKey, {
      id,
      name: data.name ?? "",
      isPublic: Boolean(data.isPublic),
      groupings,
      editedByUserIds,
      updatedBy: userId,
    });

  if (updateError) {
    switch (true) {
      case updateError instanceof MenuNotFoundError:
        throw createError(404, updateError.message, {
          code: "MENU_NOT_FOUND",
        });
      default:
        throw updateError satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["updateMenu"][200] =
    updateMenuResultToUpdateMenuResponse(updated!);

  res.status(200).json(response);
});
