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

/** DB recipe_file row shape (from recipe_file table select). */
export interface RecipeFileRow {
  id: string;
  recipe_id: string;
  blob_name: string;
  file_original_name: string;
  mimetype: string;
  size: number;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

/** DB recipe_note row shape (from recipe_note table select). */
export interface RecipeNoteRow {
  id: string;
  recipeId: string;
  recipeVersionId: string | null;
  body: string;
  everEdited: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export function recipeFileToApiRecipeFile(row: RecipeFileRow): RecipeFileInfoApi {
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
  files: RecipeFileRow[],
): FilesListRecipes200 {
  return files.map(recipeFileToApiRecipeFile);
}

export function recipeNoteToApiRecipeNote(row: RecipeNoteRow): RecipeNoteApi {
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
  notes: RecipeNoteRow[],
): NotesListRecipes200 {
  return notes.map(recipeNoteToApiRecipeNote);
}

export function createNoteResultToNotesCreateRecipesResponse(
  row: RecipeNoteRow,
): NotesCreateRecipes200 {
  return recipeNoteToApiRecipeNote(row);
}

export function updateNoteResultToNotesUpdateRecipesResponse(
  row: RecipeNoteRow,
): NotesUpdateRecipes200 {
  return recipeNoteToApiRecipeNote(row);
}

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

export function createVersionResultToCreateRecipeVersionResponse(
  row: RecipeVersionRow,
): CreateRecipeVersion200 {
  return recipeVersionToApiRecipeVersion(row);
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteRecipeResultToDeleteRecipeResponse(
  _row: RecipeRow,
): void {
  // 204 No Content - no body to map
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteNoteResultToNotesDeleteRecipesResponse(
  _row: RecipeNoteRow,
): void {
  // 204 No Content - no body to map
}

/** No response body for 204; mapper used for consistency with other routes. */
export function deleteFileResultToFilesDeleteRecipesResponse(
  _row: RecipeFileRow,
): void {
  // 204 No Content - no body to map
}
