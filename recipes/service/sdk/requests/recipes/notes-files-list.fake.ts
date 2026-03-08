import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNoteFiles } from "./mocks.ts";

export const notesFilesListRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/notes/{noteId}/files",
  status: 200,
  handler: async ({ params, query: _query, body: _body }) => {
    const list = mockRecipeNoteFiles
      .filter((f) => f.recipeNoteId === params.noteId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    return list;
  },
});
