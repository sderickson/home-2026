import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeVersions } from "./mocks.ts";

export const versionsListRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/versions",
  status: 200,
  handler: async ({ params, query: _query, body: _body }) => {
    return mockRecipeVersions
      .filter((v) => v.recipeId === params.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  },
});
