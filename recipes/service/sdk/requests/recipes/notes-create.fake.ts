import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNotes } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const notesCreateRecipesHandler = recipesHandler({
  verb: "post",
  path: "/recipes/{id}/notes",
  status: 200,
  handler: async ({ params, query: _query, body }) => {
    const now = new Date().toISOString();
    const note = {
      id: crypto.randomUUID(),
      recipeId: params.id,
      recipeVersionId: body.recipeVersionId ?? null,
      body: body.body,
      everEdited: false,
      createdBy: placeholderUserId,
      createdAt: now,
      updatedBy: placeholderUserId,
      updatedAt: now,
    };
    mockRecipeNotes.push(note);
    return note;
  },
});
