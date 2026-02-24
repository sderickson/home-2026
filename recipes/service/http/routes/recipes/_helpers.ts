// Shared mappers between database models and API response types.
import type {
  RecipeEntity,
  RecipeFileEntity,
  RecipeNoteEntity,
  RecipeVersionEntity,
} from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";

type RecipeListResponseItem =
  RecipesServiceResponseBody["listRecipes"][200][number];

type GetRecipe200 = RecipesServiceResponseBody["getRecipe"][200];
type RecipeVersionApi = GetRecipe200["currentVersion"];
type CreateRecipe200 = RecipesServiceResponseBody["createRecipe"][200];
type UpdateRecipe200 = RecipesServiceResponseBody["updateRecipe"][200];
type ListRecipeVersions200 = RecipesServiceResponseBody["listRecipeVersions"][200];
type UpdateRecipeVersionLatest200 =
  RecipesServiceResponseBody["updateRecipeVersionLatest"][200];
type CreateRecipeVersion200 =
  RecipesServiceResponseBody["createRecipeVersion"][200];
type NotesListRecipes200 = RecipesServiceResponseBody["notesListRecipes"][200];
type RecipeNoteApi = NotesListRecipes200[number];
type FilesListRecipes200 = RecipesServiceResponseBody["filesListRecipes"][200];
type RecipeFileInfoApi = FilesListRecipes200[number];
type NotesCreateRecipes200 =
  RecipesServiceResponseBody["notesCreateRecipes"][200];
type NotesUpdateRecipes200 =
  RecipesServiceResponseBody["notesUpdateRecipes"][200];

export function recipeFileToApiRecipeFile(row: RecipeFileEntity): RecipeFileInfoApi {
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
  };
}

export function filesListResultToFilesListRecipesResponse(
  files: RecipeFileEntity[],
): FilesListRecipes200 {
  return files.map(recipeFileToApiRecipeFile);
}

export function recipeNoteToApiRecipeNote(row: RecipeNoteEntity): RecipeNoteApi {
  return {
    id: row.id,
    recipeId: row.recipeId,
    ...(row.recipeVersionId !== null && {
      recipeVersionId: row.recipeVersionId,
    }),
    body: row.body,
    everEdited: row.everEdited,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function notesListResultToNotesListRecipesResponse(
  notes: RecipeNoteEntity[],
): NotesListRecipes200 {
  return notes.map(recipeNoteToApiRecipeNote);
}

export function createNoteResultToNotesCreateRecipesResponse(
  row: RecipeNoteEntity,
): NotesCreateRecipes200 {
  return recipeNoteToApiRecipeNote(row);
}

export function updateNoteResultToNotesUpdateRecipesResponse(
  row: RecipeNoteEntity,
): NotesUpdateRecipes200 {
  return recipeNoteToApiRecipeNote(row);
}

export function recipeToApiRecipe(
  row: RecipeEntity,
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
export function deleteNoteResultToNotesDeleteRecipesResponse(
  _row: RecipeNoteEntity,
): void {
  // 204 No Content - no body to map
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteFileResultToFilesDeleteRecipesResponse(
  _row: RecipeFileEntity,
): void {
  // 204 No Content - no body to map
}
