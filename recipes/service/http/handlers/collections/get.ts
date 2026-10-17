import { CollectionMemberNotFoundError, CollectionNotFoundError } from "@sderickson/recipes-db/errors";
import { getByCollectionAndEmailCollectionMember } from "@sderickson/recipes-db/queries/collection-member/get-by-collection-and-email";
import { getByIdCollection } from "@sderickson/recipes-db/queries/collection/get-by-id";
import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";

import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getCollectionResultToGetCollectionsResponse } from "./_helpers.ts";

export const getCollectionsHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const id = req.params.id as string;
  const userEmail = auth.userEmail;
  if (!userEmail) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }
  const emailValidated =
    (auth as { emailVerified?: boolean }).emailVerified !== false;

  const { result: collection, error: getError } =
    await getByIdCollection(recipesDbKey, id);

  if (getError) {
    switch (true) {
      case getError instanceof CollectionNotFoundError:
        throw createError(404, getError.message, { code: "NOT_FOUND" });
      default:
        throw getError satisfies never;
    }
  }

  const { result: member, error: memberError } =
    await getByCollectionAndEmailCollectionMember(
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

  if (!member.isCreator && !emailValidated) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const response: RecipesServiceResponseBody["getCollections"][200] =
    getCollectionResultToGetCollectionsResponse(collection);
  res.status(200).json(response);
});
