import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNotes } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const notesUpdateRecipesHandler = recipesHandler({
  verb: "put",
  path: "/recipes/{id}/notes/{noteId}",
  status: 200,
  handler: async ({ params, query: _query, body }) => {
    const note = mockRecipeNotes.find(
      (n) => n.recipeId === params.id && n.id === params.noteId,
    );
    if (!note) return undefined;
    const now = new Date().toISOString();
    note.body = body.body;
    if (body.recipeVersionId !== undefined) {
      note.recipeVersionId = body.recipeVersionId;
    }
    note.everEdited = true;
    note.updatedBy = placeholderUserId;
    note.updatedAt = now;
    return note;
  },
});
