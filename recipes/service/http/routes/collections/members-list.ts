import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  collectionMemberQueries,
  CollectionMemberNotFoundError,
  CollectionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { membersListResultToMembersListCollectionsResponse } from "./_helpers.ts";

export const membersListCollectionsHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const id = req.params.id as string;
  const emailValidated =
    (auth as { emailVerified?: boolean }).emailVerified !== false;

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

  if (!member.isCreator && !emailValidated) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const { result, error } =
    await collectionMemberQueries.listCollectionMember(recipesDbKey, {
      collectionId: id,
    });

  if (error) {
    switch (true) {
      case error instanceof CollectionNotFoundError:
        throw createError(404, error.message, { code: "NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["membersListCollections"][200] =
    membersListResultToMembersListCollectionsResponse(result ?? []);
  res.status(200).json(response);
});
