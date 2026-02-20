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

/** DB recipe_version row shape (from recipe_version table select). */
export interface RecipeVersionRow {
  id: string;
  recipeId: string;
  content: {
    ingredients: { name: string; quantity: string; unit: string }[];
    instructionsMarkdown: string;
  };
  isLatest: boolean;
  createdBy: string;
  createdAt: Date;
}

type RecipeListResponseItem =
  RecipesServiceResponseBody["listRecipes"][200][number];

type GetRecipe200 = RecipesServiceResponseBody["getRecipe"][200];
type RecipeVersionApi = GetRecipe200["currentVersion"];
type CreateRecipe200 = RecipesServiceResponseBody["createRecipe"][200];
type UpdateRecipe200 = RecipesServiceResponseBody["updateRecipe"][200];
type ListRecipeVersions200 = RecipesServiceResponseBody["listRecipeVersions"][200];
type UpdateRecipeVersionLatest200 =
  RecipesServiceResponseBody["updateRecipeVersionLatest"][200];

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

export function recipeVersionToApiRecipeVersion(
  row: RecipeVersionRow,
): RecipeVersionApi {
  return {
    id: row.id,
    recipeId: row.recipeId,
    content: row.content,
    isLatest: row.isLatest,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

export function getByIdResultToGetRecipeResponse(
  recipe: RecipeRow,
  currentVersion: RecipeVersionRow,
  options?: { notes?: GetRecipe200["notes"]; files?: GetRecipe200["files"] },
): GetRecipe200 {
  return {
    recipe: recipeToApiRecipe(recipe, currentVersion.id),
    currentVersion: recipeVersionToApiRecipeVersion(currentVersion),
    ...(options?.notes !== undefined && { notes: options.notes }),
    ...(options?.files !== undefined && { files: options.files }),
  };
}

export function createWithVersionResultToCreateRecipeResponse(
  recipe: RecipeRow,
  version: RecipeVersionRow,
): CreateRecipe200 {
  return {
    recipe: recipeToApiRecipe(recipe, version.id),
    initialVersion: recipeVersionToApiRecipeVersion(version),
  };
}

export function createRecipeResultToCreateRecipeResponse(
  recipe: RecipeRow,
): CreateRecipe200 {
  return {
    recipe: recipeToApiRecipe(recipe),
  };
}

export function updateMetadataResultToUpdateRecipeResponse(
  row: RecipeRow,
): UpdateRecipe200 {
  return recipeToApiRecipe(row);
}

export function versionsListResultToListRecipeVersionsResponse(
  versions: RecipeVersionRow[],
): ListRecipeVersions200 {
  return versions.map(recipeVersionToApiRecipeVersion);
}

export function updateLatestVersionResultToUpdateRecipeVersionLatestResponse(
  row: RecipeVersionRow,
): UpdateRecipeVersionLatest200 {
  return recipeVersionToApiRecipeVersion(row);
}
