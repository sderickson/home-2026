import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNotes } from "./mocks.ts";

export const notesDeleteRecipesHandler = recipesHandler({
  verb: "delete",
  path: "/recipes/{id}/notes/{noteId}",
  status: 204,
  handler: async ({ params, query: _query, body: _body }) => {
    const index = mockRecipeNotes.findIndex(
      (n) => n.recipeId === params.id && n.id === params.noteId,
    );
    if (index === -1) return undefined;
    mockRecipeNotes.splice(index, 1);
    return undefined;
  },
});
