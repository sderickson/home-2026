// Shared mappers between database models and API response types.
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";

/** DB recipe row shape (from recipe table select). */
export interface RecipeRow {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string | null;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

type RecipeListResponseItem =
  RecipesServiceResponseBody["listRecipes"][200][number];

export function recipeToApiRecipe(
  row: RecipeRow,
  currentVersionId?: string,
): RecipeListResponseItem {
  return {
    id: row.id,
    title: row.title,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription ?? undefined,
    isPublic: row.isPublic,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
    ...(currentVersionId !== undefined && { currentVersionId }),
  };
}
