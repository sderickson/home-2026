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

function parsePublicOnly(value: unknown): boolean {
  if (value === true || value === "true") return true;
  if (value === false || value === "false" || value === undefined) return false;
  return false;
}

export const listMenusHandler = createHandler(async (req, res) => {
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim()
      : "";
  const publicOnly = parsePublicOnly(req.query.publicOnly);

  const hasCollection = collectionId.length > 0;
  if (hasCollection && publicOnly) {
    throw createError(
      400,
      "Provide either collectionId or publicOnly=true, not both",
      { code: "VALIDATION_ERROR" },
    );
  }
  if (!hasCollection && !publicOnly) {
    throw createError(
      400,
      "Provide either collectionId or publicOnly=true",
      { code: "VALIDATION_ERROR" },
    );
  }

  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  if (publicOnly) {
    const { result } = await menuQueries.listPublicMenu(recipesDbKey);
    const response: RecipesServiceResponseBody["listMenus"][200] =
      listMenusResultToListMenusResponse(result ?? []);
    res.status(200).json(response);
    return;
  }

  const member = await requireCollectionMembership(collectionId, {
    requireMutate: false,
  });

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

  const rows = result ?? [];
  const filtered =
    member.role === "viewer"
      ? rows.filter((row) => row.isPublic)
      : rows;

  const response: RecipesServiceResponseBody["listMenus"][200] =
    listMenusResultToListMenusResponse(filtered);

  res.status(200).json(response);
});
