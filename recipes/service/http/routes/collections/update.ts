import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  collectionMemberQueries,
  collectionQueries,
  CollectionMemberNotFoundError,
  CollectionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { updateCollectionResultToUpdateCollectionsResponse } from "./_helpers.ts";

export const updateCollectionsHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const id = req.params.id as string;
  const data: RecipesServiceRequestBody["updateCollections"] = req.body ?? {};

  const { result: member, error: memberError } =
    await collectionMemberQueries.getByCollectionAndEmailCollectionMember(
      recipesDbKey,
      { collectionId: id, email: auth.userEmail },
    );

  if (memberError) {
    switch (true) {
      case memberError instanceof CollectionMemberNotFoundError:
        throw createError(403, "Forbidden", { code: "FORBIDDEN" });
      default:
        throw memberError satisfies never;
    }
  }

  if (member.role !== "owner") {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const { result, error } = await collectionQueries.updateCollection(
    recipesDbKey,
    { id, name: data.name },
  );

  if (error) {
    switch (true) {
      case error instanceof CollectionNotFoundError:
        throw createError(404, error.message, { code: "NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["updateCollections"][200] =
    updateCollectionResultToUpdateCollectionsResponse(result);
  res.status(200).json(response);
});
