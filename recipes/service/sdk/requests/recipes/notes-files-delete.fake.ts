import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNoteFiles } from "./mocks.ts";

export const notesFilesDeleteRecipesHandler = recipesHandler({
  verb: "delete",
  path: "/recipes/{id}/notes/{noteId}/files/{fileId}",
  status: 204,
  handler: async ({ params, query: _query, body: _body }) => {
    const index = mockRecipeNoteFiles.findIndex(
      (f) =>
        f.recipeNoteId === params.noteId && f.id === params.fileId,
    );
    if (index === -1) return undefined;
    mockRecipeNoteFiles.splice(index, 1);
    return undefined;
  },
});
