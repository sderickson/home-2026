import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeNotes } from "./mocks.ts";

export const notesListRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/notes",
  status: 200,
  handler: async ({ params, query: _query, body: _body }) => {
    const list = mockRecipeNotes
      .filter((n) => n.recipeId === params.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    return list;
  },
});
