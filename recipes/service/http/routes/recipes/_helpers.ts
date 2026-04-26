// Shared mappers between database models and API response types.
import type {
  RecipeEntity,
  RecipeFileEntity,
  RecipeVersionEntity,
} from "@sderickson/recipes-db";
import { getRecipesApiBaseUrl } from "@sderickson/recipes-service-common";
import type {
  RecipesServiceResponseBody,
  UnsplashAttribution,
} from "@sderickson/recipes-spec";

/** App name for Unsplash UTM params (utm_source). */
const UTM_APP_NAME = "893198";

function appendUtmParams(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=${encodeURIComponent(UTM_APP_NAME)}&utm_medium=referral`;
}

/** Build UnsplashAttribution from stored full Unsplash user object. */
function unsplashUserToAttribution(
  user: Record<string, unknown>,
): UnsplashAttribution {
  const name = typeof user.name === "string" ? user.name : "Unknown";
  const links = user.links as Record<string, unknown> | undefined;
  const profileHtml =
    links && typeof links.html === "string"
      ? links.html
      : "https://unsplash.com";
  return {
    photographerName: name,
    photographerProfileUrl: appendUtmParams(profileHtml),
    unsplashSourceUrl: appendUtmParams("https://unsplash.com"),
  };
}

type RecipeListResponseItem =
  RecipesServiceResponseBody["listRecipes"][200][number];

type GetRecipe200 = RecipesServiceResponseBody["getRecipe"][200];
type RecipeVersionApi = GetRecipe200["currentVersion"];
type CreateRecipe200 = RecipesServiceResponseBody["createRecipe"][200];
type UpdateRecipe200 = RecipesServiceResponseBody["updateRecipe"][200];
type ListRecipeVersions200 =
  RecipesServiceResponseBody["listRecipeVersions"][200];
type UpdateRecipeVersionLatest200 =
  RecipesServiceResponseBody["updateRecipeVersionLatest"][200];
type CreateRecipeVersion200 =
  RecipesServiceResponseBody["createRecipeVersion"][200];
type FilesListRecipes200 = RecipesServiceResponseBody["filesListRecipes"][200];
type RecipeFileInfoApi = FilesListRecipes200[number];

export function recipeFileToApiRecipeFile(
  row: RecipeFileEntity,
): RecipeFileInfoApi {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    blobName: row.blob_name,
    fileOriginalName: row.file_original_name,
    mimetype: row.mimetype,
    size: row.size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.uploaded_by !== null && { uploadedBy: row.uploaded_by }),
    downloadUrl: `${getRecipesApiBaseUrl()}/recipes/${row.recipe_id}/files/${row.id}/blob`,
    ...(row.unsplash_user !== null && {
      unsplashAttribution: unsplashUserToAttribution(row.unsplash_user),
    }),
  };
}

export function filesListResultToFilesListRecipesResponse(
  files: RecipeFileEntity[],
): FilesListRecipes200 {
  return files.map(recipeFileToApiRecipeFile);
}

export function recipeToApiRecipe(
  row: RecipeEntity,
  currentVersionId?: string,
): RecipeListResponseItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description ?? undefined,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
    ...(currentVersionId !== undefined && { currentVersionId }),
  };
}

export function recipeVersionToApiRecipeVersion(
  row: RecipeVersionEntity,
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
  recipe: RecipeEntity,
  currentVersion: RecipeVersionEntity,
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
  recipe: RecipeEntity,
  version: RecipeVersionEntity,
): CreateRecipe200 {
  return {
    recipe: recipeToApiRecipe(recipe, version.id),
    initialVersion: recipeVersionToApiRecipeVersion(version),
  };
}

export function createRecipeResultToCreateRecipeResponse(
  recipe: RecipeEntity,
): CreateRecipe200 {
  return {
    recipe: recipeToApiRecipe(recipe),
  };
}

export function updateMetadataResultToUpdateRecipeResponse(
  row: RecipeEntity,
): UpdateRecipe200 {
  return recipeToApiRecipe(row);
}

export function versionsListResultToListRecipeVersionsResponse(
  versions: RecipeVersionEntity[],
): ListRecipeVersions200 {
  return versions.map(recipeVersionToApiRecipeVersion);
}

export function updateLatestVersionResultToUpdateRecipeVersionLatestResponse(
  row: RecipeVersionEntity,
): UpdateRecipeVersionLatest200 {
  return recipeVersionToApiRecipeVersion(row);
}

export function createVersionResultToCreateRecipeVersionResponse(
  row: RecipeVersionEntity,
): CreateRecipeVersion200 {
  return recipeVersionToApiRecipeVersion(row);
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteRecipeResultToDeleteRecipeResponse(
  _row: RecipeEntity,
): void {
  // 204 No Content - no body to map
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteFileResultToFilesDeleteRecipesResponse(
  _row: RecipeFileEntity,
): void {
  // 204 No Content - no body to map
}
