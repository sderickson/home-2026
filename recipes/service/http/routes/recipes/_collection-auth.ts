/**
 * Collection-based permission for recipe (and nested) endpoints.
 * Use after resolving collectionId: from recipe.collectionId for :id routes, or from query/body for list/create.
 */
import createError from "http-errors";
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

export interface AuthLike {
  userEmail: string;
  userId: string;
  emailVerified?: boolean;
}

/**
 * Load recipe by id, enforce collection membership, then return the getById result.
 * Throws 404 if recipe not found, 403 if not a member or insufficient role.
 */
export async function getRecipeAndRequireCollectionAuth(
  recipesDbKey: DbKey,
  recipeId: string,
  auth: AuthLike,
  options: { requireMutate: boolean },
): Promise<GetByIdRecipeResult> {
  const out = await recipeQueries.getByIdRecipe(recipesDbKey, recipeId);
  if (out.error) {
    if (out.error instanceof RecipeNotFoundError) {
      throw createError(404, out.error.message, { code: "RECIPE_NOT_FOUND" });
    }
    throw out.error satisfies never;
  }

  const emailValidated = auth.emailVerified !== false;
  await requireCollectionMembership({
    recipesDbKey,
    collectionId: out.result.recipe.collectionId,
    callerEmail: auth.userEmail,
    emailValidated,
    requireMutate: options.requireMutate,
  });

  return out.result;
}
