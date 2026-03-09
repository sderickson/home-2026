import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNoteFiles } from "./mocks.ts";
import { mockRecipeNotes } from "./mocks.ts";

export const recipeNoteFilesGetByNoteIdHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/note-files",
  status: 200,
  handler: async ({ params, query: _query, body: _body }) => {
    const recipeId = params.id;
    const noteIds = new Set(
      mockRecipeNotes.filter((n) => n.recipeId === recipeId).map((n) => n.id),
    );
    const list = mockRecipeNoteFiles
      .filter((f) => noteIds.has(f.recipeNoteId))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    return list;
  },
});
