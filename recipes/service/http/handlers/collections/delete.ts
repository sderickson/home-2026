import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  collectionMemberQueries,
  collectionQueries,
  CollectionMemberNotFoundError,
  CollectionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { deleteCollectionResultToDeleteCollectionsResponse } from "./_helpers.ts";

export const deleteCollectionsHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const id = req.params.id as string;
  const userEmail = auth.userEmail;
  if (!userEmail) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const { result: member, error: memberError } =
    await collectionMemberQueries.getByCollectionAndEmailCollectionMember(
      recipesDbKey,
      { collectionId: id, email: userEmail },
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

  const { result: hasRecipes, error: hasRecipesError } =
    await collectionQueries.hasRecipesCollection(recipesDbKey, id);

  if (hasRecipesError) {
    switch (true) {
      case hasRecipesError instanceof CollectionNotFoundError:
        throw createError(404, hasRecipesError.message, { code: "NOT_FOUND" });
      default:
        throw hasRecipesError satisfies never;
    }
  }

  if (hasRecipes) {
    throw createError(
      409,
      "Cannot delete collection that has recipes",
      { code: "CONFLICT" },
    );
  }

  const { result, error } = await collectionQueries.deleteCollection(
    recipesDbKey,
    id,
  );

  if (error) {
    switch (true) {
      case error instanceof CollectionNotFoundError:
        throw createError(404, error.message, { code: "NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  deleteCollectionResultToDeleteCollectionsResponse(result);
  res.status(204).send();
});
