/**
 * Collection-based permission for recipe (and nested) endpoints.
 * Use after resolving collectionId: from recipe.collectionId for :id routes, or from query/body for list/create.
 */
import createError from "http-errors";
import { safContextStorage } from "@saflib/node";
import type { DbKey } from "@saflib/drizzle";
import {
  collectionMemberQueries,
  recipeQueries,
  CollectionMemberNotFoundError,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import type {
  CollectionMemberEntity,
  GetByIdRecipeResult,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";

export interface RequireCollectionMembershipParams {
  recipesDbKey: DbKey;
  collectionId: string;
  callerEmail: string;
  /** Whether the caller's email is validated (identity). Creator bypasses this. */
  emailValidated: boolean;
  /** If true, caller must be editor or owner (not viewer). */
  requireMutate: boolean;
}

/**
 * Looks up the caller's collection_member row, enforces membership + validated-email + role.
 * Returns the member row or throws 403.
 */
export async function requireCollectionMembership(
  params: RequireCollectionMembershipParams,
): Promise<CollectionMemberEntity> {
  const {
    recipesDbKey,
    collectionId,
    callerEmail,
    emailValidated,
    requireMutate,
  } = params;

  const { result: member, error: memberError } =
    await collectionMemberQueries.getByCollectionAndEmailCollectionMember(
      recipesDbKey,
      { collectionId, email: callerEmail },
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

  if (requireMutate && member.role === "viewer") {
    throw createError(403, "Forbidden", { code: "FORBIDDEN" });
  }

  return member;
}

/**
 * Load recipe by id. Reads recipesDbKey and auth from context stores.
 * - If requireMutate: true and no auth -> 401.
 * - If requireMutate: false, no auth, and recipe is public -> return recipe (no membership check).
 * - If no auth and recipe is private -> 401.
 * - If auth present -> require collection membership then return. Throws 404 if not found, 403 if forbidden.
 */
export async function getRecipeAndRequireCollectionAuth(
  recipeId: string,
  options: { requireMutate: boolean },
): Promise<GetByIdRecipeResult> {
  const recipesDbKey = recipesServiceStorage.getStore()?.recipesDbKey;
  if (!recipesDbKey) {
    throw new Error("Recipes service context not found");
  }
  const auth = safContextStorage.getStore()?.auth;

  const out = await recipeQueries.getByIdRecipe(recipesDbKey, recipeId);
  if (out.error) {
    if (out.error instanceof RecipeNotFoundError) {
      throw createError(404, out.error.message, { code: "RECIPE_NOT_FOUND" });
    }
    throw out.error satisfies never;
  }

  const { recipe } = out.result;
  if (!auth) {
    if (options.requireMutate) {
      throw createError(401, "Unauthorized", { code: "UNAUTHORIZED" });
    }
    if (!recipe.isPublic) {
      throw createError(401, "Unauthorized", { code: "UNAUTHORIZED" });
    }
    return out.result;
  }

  const emailValidated = auth.emailVerified !== false;
  await requireCollectionMembership({
    recipesDbKey,
    collectionId: recipe.collectionId,
    callerEmail: auth.userEmail,
    emailValidated,
    requireMutate: options.requireMutate,
  });

  return out.result;
}
