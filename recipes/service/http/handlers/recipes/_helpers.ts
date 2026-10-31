// Shared mappers between database models and API response types.
import type {
  RecipeEntity,
  RecipeFileEntity,
  RecipeVersionEntity,
} from "@sderickson/recipes-db";
import { getRecipesApiBaseUrl } from "@sderickson/recipes-service-common";
import { unsplashHotlinkUrl } from "../../routes/recipes/_helpers.ts";
import type { ResponseBody as sharedGetRecipesResponseBody } from "@sderickson/recipes-spec/operations/sharedGetRecipes";

type SharedGet200 = sharedGetRecipesResponseBody["sharedGetRecipes"][200];
type RecipeApi = SharedGet200["recipe"];
type RecipeVersionApi = SharedGet200["currentVersion"];
type RecipeFileInfoApi = SharedGet200["files"][number];
type UnsplashAttribution = NonNullable<RecipeFileInfoApi["unsplashAttribution"]>;

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

export function recipeToApiRecipe(
  row: RecipeEntity,
  currentVersionId?: string,
): RecipeApi {
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

/** Map a recipe file with downloadUrl pointing at the public shared blob path. */
export function recipeFileToSharedApiRecipeFile(
  row: RecipeFileEntity,
): RecipeFileInfoApi {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    blobName: row.blob_name,
    fileOriginalName: row.file_original_name,
    mimetype: row.mimetype,
    size: row.size,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    ...(row.uploaded_by !== null && { uploadedBy: row.uploaded_by }),
    downloadUrl: row.unsplash_image_url
      ? unsplashHotlinkUrl(row.unsplash_image_url)
      : `${getRecipesApiBaseUrl()}/recipes/${row.recipe_id}/shared/files/${row.id}/blob`,
    ...(row.unsplash_user !== null && {
      unsplashAttribution: unsplashUserToAttribution(row.unsplash_user),
    }),
  };
}

export function getByIdResultToSharedGetRecipesResponse(
  recipe: RecipeEntity,
  currentVersion: RecipeVersionEntity,
  files: RecipeFileEntity[],
): SharedGet200 {
  return {
    recipe: recipeToApiRecipe(recipe, currentVersion.id),
    currentVersion: recipeVersionToApiRecipeVersion(currentVersion),
    files: files.map(recipeFileToSharedApiRecipeFile),
  };
}
