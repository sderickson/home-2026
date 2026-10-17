/**
 * Collection-based permission for recipe (and nested) endpoints.
 * Use after resolving collectionId: from recipe.collectionId for :id routes, or from query/body for list/create.
 */
import createError from "http-errors";
import { safContextStorage } from "@saflib/node";
import {
  collectionMemberQueries,
  collectionQueries,
  recipeQueries,
  CollectionMemberNotFoundError,
  CollectionNotFoundError,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import type {
  CollectionMemberEntity,
  GetByIdRecipeResult,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";

/**
 * Looks up the caller's collection_member row from context (recipesDbKey, auth), enforces membership + validated-email + role.
 * Returns the member row or throws 401 if no auth, 422 if collection does not exist (validation), 403 if not a member or insufficient role.
 */
export async function requireCollectionMembership(
  collectionId: string,
  options: { requireMutate: boolean },
): Promise<CollectionMemberEntity> {
  const recipesDbKey = recipesServiceStorage.getStore()?.recipesDbKey;
  if (!recipesDbKey) {
    throw new Error("Recipes service context not found");
  }
  const auth = safContextStorage.getStore()?.auth;
  if (!auth) {
    throw createError(401, "Unauthorized", { code: "UNAUTHORIZED" });
  }
  const userEmail = auth.userEmail;
  if (!userEmail) {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  const { error: collectionError } = await collectionQueries.getByIdCollection(
    recipesDbKey,
    collectionId,
  );
  if (collectionError) {
    if (collectionError instanceof CollectionNotFoundError) {
      throw createError(422, collectionError.message, {
        code: "COLLECTION_NOT_FOUND",
      });
    }
    throw collectionError satisfies never;
  }

  const emailValidated = auth.emailVerified !== false;

  const { result: member, error: memberError } =
    await collectionMemberQueries.getByCollectionAndEmailCollectionMember(
      recipesDbKey,
      { collectionId, email: userEmail },
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

  if (options.requireMutate && member.role === "viewer") {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  return member;
}

/**
 * Load recipe by id. Auth required; caller must be at least viewer on the recipe's collection.
 */
export async function getRecipeAndRequireCollectionAuth(
  recipeId: string,
  options: { requireMutate: boolean },
): Promise<GetByIdRecipeResult> {
  const recipesDbKey = recipesServiceStorage.getStore()?.recipesDbKey;
  if (!recipesDbKey) {
    throw new Error("Recipes service context not found");
  }

  const out = await recipeQueries.getByIdRecipe(recipesDbKey, recipeId);
  if (out.error) {
    if (out.error instanceof RecipeNotFoundError) {
      throw createError(404, out.error.message, { code: "RECIPE_NOT_FOUND" });
    }
    throw out.error satisfies never;
  }

  const { recipe } = out.result;

  await requireCollectionMembership(recipe.collectionId, {
    requireMutate: options.requireMutate,
  });

  return out.result;
}
