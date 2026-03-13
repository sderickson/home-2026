import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  menuQueries,
  MenuNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "../recipes/_collection-auth.ts";
import { deleteMenuResultToDeleteMenuResponse } from "./_helpers.ts";

export const deleteMenuHandler = createHandler(async (req, res) => {
  getSafContextWithAuth();

  const id = req.params.id as string;
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim()
      : "";

  if (!collectionId) {
    throw createError(400, "collectionId is required (query)", {
      code: "VALIDATION_ERROR",
    });
  }

  const { recipesDbKey } = recipesServiceStorage.getStore()!;

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
    throw createError(404, "Menu not in collection", {
      code: "MENU_NOT_FOUND",
    });
  }

  await requireCollectionMembership(collectionId, {
    requireMutate: true,
  });

  const { result, error: deleteError } = await menuQueries.deleteMenu(
    recipesDbKey,
    id,
  );

  if (deleteError) {
    switch (true) {
      case deleteError instanceof MenuNotFoundError:
        throw createError(404, deleteError.message, {
          code: "MENU_NOT_FOUND",
        });
      default:
        throw deleteError satisfies never;
    }
  }

  deleteMenuResultToDeleteMenuResponse(result!);
  res.status(204).end();
});
