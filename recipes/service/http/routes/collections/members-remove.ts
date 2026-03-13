import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  collectionMemberQueries,
  CollectionMemberNotFoundError,
  CollectionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { removeCollectionMemberResultToMembersRemoveCollectionsResponse } from "./_helpers.ts";

export const membersRemoveCollectionsHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const id = req.params.id as string;
  const memberId = req.params.memberId as string;

  const { result: callerMember, error: memberError } =
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

  if (callerMember.role !== "owner") {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const { result: members, error: listError } =
    await collectionMemberQueries.listCollectionMember(recipesDbKey, {
      collectionId: id,
    });

  if (listError) {
    switch (true) {
      case listError instanceof CollectionNotFoundError:
        throw createError(404, listError.message, { code: "NOT_FOUND" });
      default:
        throw listError satisfies never;
    }
  }

  const targetMember = (members ?? []).find((m) => m.id === memberId);
  if (!targetMember) {
    throw createError(404, "Member not found", { code: "NOT_FOUND" });
  }

  if (targetMember.collectionId !== id) {
    throw createError(404, "Member not found", { code: "NOT_FOUND" });
  }

  if (targetMember.isCreator) {
    throw createError(400, "Cannot remove collection creator", {
      code: "BAD_REQUEST",
    });
  }

  const { result, error } =
    await collectionMemberQueries.removeCollectionMember(recipesDbKey, memberId);

  if (error) {
    switch (true) {
      case error instanceof CollectionMemberNotFoundError:
        throw createError(404, error.message, { code: "NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  removeCollectionMemberResultToMembersRemoveCollectionsResponse(result);
  res.status(204).send();
});
