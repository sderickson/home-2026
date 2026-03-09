import { generateShortId } from "@saflib/utils";
import type { RecipeNoteFileInfo } from "@sderickson/recipes-spec";
import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNoteFiles } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const notesFilesUploadRecipesHandler = recipesHandler({
  verb: "post",
  path: "/recipes/{id}/notes/{noteId}/files",
  status: 200,
  handler: async ({ params, query: _query, body: _body }) => {
    const now = new Date().toISOString();
    const id = generateShortId();
    const recipeId = params.id;
    const recipeNoteId = params.noteId;
    const fileInfo: RecipeNoteFileInfo = {
      id,
      recipeNoteId,
      blobName: `recipe-notes/${recipeNoteId}/${id}`,
      fileOriginalName: "uploaded-file",
      mimetype: "application/octet-stream",
      size: 0,
      createdAt: now,
      updatedAt: now,
      uploadedBy: placeholderUserId,
      downloadUrl: `https://api.recipes.example.com/recipes/${recipeId}/notes/${recipeNoteId}/files/${id}/blob`,
    };
    mockRecipeNoteFiles.push(fileInfo);
    return fileInfo;
  },
});
